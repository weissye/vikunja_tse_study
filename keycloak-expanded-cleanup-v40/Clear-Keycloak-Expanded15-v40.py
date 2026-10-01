#!/usr/bin/env python3
"""Remove only expanded ensemble JSON files backed by verified compressed copies."""
import argparse
import hashlib
import json
from pathlib import Path
import sys


def digest(path):
    result = hashlib.sha256()
    with path.open('rb') as source:
        while chunk := source.read(1024 * 1024):
            result.update(chunk)
    return result.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--preview', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve()
    if not (root / 'selection.json').is_file():
        raise SystemExit('Selection metadata missing; no files removed')
    selection = json.loads((root / 'selection.json').read_text(encoding='utf-8'))
    if selection.get('selected_count') != 15 or len(selection.get('selected_numbers', [])) != 15:
        raise SystemExit('Unexpected ensemble selection; no files removed')

    reclaimed = 0
    removed = 0
    skipped = []
    for ordinal in range(1, 16):
        stem = f'run-{ordinal:02d}'
        expanded = root / 'expanded-json' / (stem + '.json')
        compressed = root / 'scenarios' / (stem + '.json.zst')
        audit_path = root / 'audits' / (stem + '.json')
        if not expanded.is_file():
            continue
        if not compressed.is_file() or not audit_path.is_file():
            skipped.append(stem + ': missing compressed source or audit')
            continue
        audit = json.loads(audit_path.read_text(encoding='utf-8'))
        if (not audit.get('compressed_sha256') or not audit.get('full_sha256') or
                digest(compressed) != audit['compressed_sha256']):
            skipped.append(stem + ': compressed SHA-256 mismatch')
            continue
        before = expanded.stat()
        if digest(expanded) != audit['full_sha256']:
            skipped.append(stem + ': expanded SHA-256 mismatch')
            continue
        after = expanded.stat()
        if before.st_size != after.st_size or before.st_mtime_ns != after.st_mtime_ns:
            skipped.append(stem + ': expanded file changed during verification')
            continue
        if args.preview:
            print(f'VERIFIED {stem}: {before.st_size / (1024 ** 3):.3f} GiB can be removed')
        else:
            expanded.unlink()
            removed += 1
            reclaimed += before.st_size
            print(f'REMOVED {stem}: {before.st_size / (1024 ** 3):.3f} GiB')
    for reason in skipped:
        print('SKIPPED ' + reason, file=sys.stderr)
    print(f'DONE removed={removed} reclaimed_GiB={reclaimed / (1024 ** 3):.3f} '
          f'skipped={len(skipped)} preview={args.preview}')
    return 0 if not skipped else 2


if __name__ == '__main__':
    raise SystemExit(main())
