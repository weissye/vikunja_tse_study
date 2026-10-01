#!/usr/bin/env python3
"""Audit stored traces for conflicting association lifecycles without SUT calls."""
import argparse
import collections
import gc
import json
import zipfile

import zstandard as zstd


def audit(events):
    active = set()
    creates = collections.Counter()
    conflicts = []
    deletes = 0
    for index, event in enumerate(events):
        method = event.get('name')
        data = event.get('data') or {}
        url = data.get('url')
        if not isinstance(url, str) or '/organizations/' not in url:
            continue
        if method == 'POST' and url.endswith('/identity-providers'):
            try:
                alias = json.loads(data.get('body', 'null'))
            except (ValueError, TypeError):
                continue
            if not isinstance(alias, str):
                continue
            key = (url, alias)
            creates[key] += 1
            if key in active:
                conflicts.append({'event_index': index,
                                  'association': url.split('/admin/realms/', 1)[-1],
                                  'alias': alias})
            active.add(key)
        elif method == 'DELETE' and '/identity-providers/' in url:
            prefix, alias = url.rsplit('/identity-providers/', 1)
            key = (prefix + '/identity-providers', alias)
            if key in active:
                active.remove(key)
                deletes += 1
    return {'association_posts': sum(creates.values()),
            'distinct_static_pairs': len(creates),
            'duplicate_posts_total': sum(count - 1 for count in creates.values()),
            'posts_while_pair_active': len(conflicts),
            'completed_deletes': deletes,
            'first_conflicts': conflicts[:3]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', help='Keycloak 15 archive containing scenarios/run-XX.json.zst')
    args = parser.parse_args()
    results = {}
    with zipfile.ZipFile(args.archive) as archive:
        for ordinal in range(1, 16):
            source = archive.read(f'scenarios/run-{ordinal:02d}.json.zst')
            events = json.loads(zstd.ZstdDecompressor().decompress(
                source, max_output_size=800000000))[0]
            results[f'run-{ordinal:02d}'] = audit(events)
            del source, events
            gc.collect()
    print(json.dumps({'static_audit_only': True, 'runs': results}, indent=2))


if __name__ == '__main__':
    main()
