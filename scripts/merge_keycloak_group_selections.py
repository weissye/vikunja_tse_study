#!/usr/bin/env python3
"""Merge five Provengo-produced two-scenario selections into ten candidates."""
import argparse
import hashlib
import json
from pathlib import Path


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def merge(paths, output):
    if len(paths) != 5 or len(set(map(str, paths))) != 5:
        raise ValueError('five distinct selections required')
    if output.exists():
        raise FileExistsError(output)
    manifest = []
    for path in paths:
        content = path.read_bytes()
        scenarios = json.loads(content)
        if not isinstance(scenarios, list) or len(scenarios) != 2:
            raise ValueError(f'expect two Provengo scenarios in {path}')
        manifest.append({'file': str(path), 'sha256': hashlib.sha256(content).hexdigest(),
                         'scenarios': 2})
    try:
        with output.open('xb') as target:
            target.write(b'[')
            for i, path in enumerate(paths):
                if i:
                    target.write(b',')
                with path.open('rb') as source:
                    if source.read(1) != b'[':
                        raise ValueError(f'not an array: {path}')
                    pending = b''
                    while chunk := source.read(1024 * 1024):
                        if pending:
                            target.write(pending)
                        pending = chunk
                    pending = pending.rstrip()
                    if not pending.endswith(b']'):
                        raise ValueError(f'unterminated array: {path}')
                    target.write(pending[:-1])
            target.write(b']\n')
        evidence = output.with_name(output.stem + '-sources.json')
        evidence.write_text(json.dumps({'schema_version': 1, 'sources': manifest,
            'output_sha256': digest(output)},
            indent=2) + '\n', encoding='utf-8')
        return evidence
    except Exception:
        output.unlink(missing_ok=True)
        raise


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--selected', type=Path, action='append', required=True)
    p.add_argument('--out', type=Path, required=True)
    args = p.parse_args()
    print('KEYCLOAK_BATCH_10_READY', args.out, 'manifest=', merge(args.selected, args.out))


if __name__ == '__main__':
    main()
