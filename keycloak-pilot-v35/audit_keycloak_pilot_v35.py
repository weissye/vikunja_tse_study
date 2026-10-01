#!/usr/bin/env python3
"""Audit a sampled Keycloak trace before any SUT execution."""
import collections
import base64
import json
import re
import sys

from audit_selected_associations_v35 import audit as audit_associations


def main(path):
    with open(path, encoding='utf-8') as source:
        traces = json.load(source)
    if len(traces) != 1:
        raise ValueError('Exactly one sampled trace is required')
    events = traces[0]
    ready = {}
    finished = {}
    races = set()
    verified = set()
    dispatch = 0
    bindings = 0
    parents = 0
    entities = collections.Counter()
    processes = collections.Counter()
    for event in events:
        data = event.get('data') or {}
        name = event.get('name')
        if name == 'SBT:InstanceReady':
            owner = data['owner']
            ready[owner] = data
            entities[data['entity']] += 1
            processes[str(data['process'])] += 1
        elif name == 'SBT:WorkerFinished':
            finished[data['owner']] = data.get('reason')
        elif name == 'SBT:CrudStep' and data.get('stage') == 'race':
            races.add(data['owner'])
        elif name == 'SBT:CrudVerified' and data.get('stage') == 'race':
            verified.add(data['owner'])
        elif name == 'POST' and '/__sbt_race?' in str(data.get('url', '')):
            dispatch += 1
        elif name == 'SBT:BindParent':
            bindings += 1
        elif name == 'SBT:ParentsBound':
            parents += 1
    association = audit_associations(events)
    prefixes = tuple('sbt_' + re.sub(r'[^A-Za-z0-9_]', '_', owner + '_')
                     for owner in ready)
    unknown_references = set()
    produced = set()
    missing_producers = []
    rest_urls = []
    callbacks_by_url = {}
    callback_collisions = 0
    for event in events:
        data = event.get('data') or {}
        method = event.get('name')
        if method in ('GET', 'POST', 'PUT', 'DELETE', 'PATCH'):
            url = data.get('url')
            rest_urls.append(url)
            callback_object = (data.get('callback') or {}).get('object')
            signature = (method, callback_object)
            if url in callbacks_by_url and callbacks_by_url[url] != signature:
                callback_collisions += 1
            callbacks_by_url.setdefault(url, signature)
        if method == 'GET':
            callback = data.get('callback') or {}
            encoded = callback.get('object') if isinstance(callback, dict) else None
            if encoded:
                raw = base64.b64decode(encoded)
                if b'updateBody' in raw:
                    produced.update(re.findall(rb'sbt_[A-Za-z0-9_]+_update_body', raw))
                if b'raceBase' in raw:
                    produced.update(re.findall(rb'sbt_[A-Za-z0-9_]+_race_payload', raw))
        body = data.get('body')
        if method in ('PUT', 'POST') and isinstance(body, str):
            match = re.fullmatch(r'@\{(sbt_[A-Za-z0-9_]+_(?:update_body|race_payload))\}', body)
            if match and match.group(1).encode() not in produced:
                missing_producers.append({'method': method, 'reference': match.group(1)})
        for value in (data.get('url'), data.get('body')):
            if not isinstance(value, str):
                continue
            for reference in re.findall(r'@\{(sbt_[A-Za-z0-9_]+)\}', value):
                if not reference.startswith(prefixes):
                    unknown_references.add(reference)
    report = {
        'event_count': len(events), 'workers_ready': len(ready),
        'workers_finished_complete': sum(x == 'complete' for x in finished.values()),
        'entity_types': len(entities), 'entity_counts': sorted(entities.values()),
        'process_counts': dict(processes), 'race_owners': len(races),
        'race_verified': len(verified), 'relay_dispatches': dispatch,
        'parent_choices': bindings, 'parent_bindings': parents,
        'associations': association,
        'unproduced_owner_references': sorted(unknown_references)[:20],
        'missing_runtime_producers': missing_producers[:20],
        'duplicate_rest_event_urls': len(rest_urls) - len(set(rest_urls)),
        'distinct_callback_url_collisions': callback_collisions,
    }
    report['result'] = 'PASS_STATIC' if (
        len(ready) == len(finished) == 400 and
        all(reason == 'complete' for reason in finished.values()) and
        len(entities) == 25 and set(entities.values()) == {16} and
        processes == {'1': 200, '2': 200} and
        len(races) == len(verified) == dispatch == 224 and
        association['posts_while_pair_active'] == 0 and not unknown_references and
        not missing_producers and callback_collisions == 0
    ) else 'FAIL_STATIC'
    print(json.dumps(report, indent=2))
    return 0 if report['result'] == 'PASS_STATIC' else 1


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1]))
