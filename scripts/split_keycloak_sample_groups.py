#!/usr/bin/env python3
"""Stream a 50-scenario Provengo JSON array into five original-order arrays of ten."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def split(source, output_dir, prefix):
    if any(output_dir.glob(f'{prefix}-group-*-10.json')):
        raise FileExistsError('group output already exists; use an empty group destination')
    output_dir.mkdir(parents=True, exist_ok=True)
    outputs = []
    writer = None
    opened = False
    finished = False
    depth = 0
    quoted = False
    escaped = False
    scenarios = 0

    def begin():
        nonlocal writer
        path = output_dir / f'{prefix}-group-{len(outputs) + 1}-10.json'
        writer = path.open('xb')
        writer.write(b'[')
        outputs.append(path)

    def end():
        nonlocal writer
        writer.write(b']\n')
        writer.close()
        writer = None

    try:
        while chunk := source.read(1024 * 1024):
            anchor = 0
            for index, byte in enumerate(chunk):
                if finished:
                    if byte not in b' \r\n\t':
                        raise ValueError('unexpected content after final array')
                    continue
                if not opened:
                    if byte in b' \r\n\t':
                        continue
                    if byte != 91:  # '['
                        raise ValueError('sample root must be JSON array')
                    opened, depth = True, 1
                    begin()
                    anchor = index + 1
                    continue
                if quoted:
                    if escaped:
                        escaped = False
                    elif byte == 92:  # '\\'
                        escaped = True
                    elif byte == 34:  # '"'
                        quoted = False
                    continue
                if byte == 34:
                    quoted = True
                elif byte in (91, 123):  # '[' or '{'
                    depth += 1
                elif byte in (93, 125):  # ']' or '}'
                    if byte == 93 and depth == 1:
                        writer.write(chunk[anchor:index])
                        scenarios += 1
                        end()
                        finished = True
                        anchor = index + 1
                    else:
                        depth -= 1
                        if depth < 1:
                            raise ValueError('unbalanced JSON containers')
                elif byte == 44 and depth == 1:  # top-level comma
                    writer.write(chunk[anchor:index])
                    scenarios += 1
                    if scenarios % 10 == 0:
                        end()
                        begin()
                    else:
                        writer.write(b',')
                    anchor = index + 1
            if writer is not None:
                writer.write(chunk[anchor:])
        if not finished or scenarios != 50 or len(outputs) != 5 or quoted:
            raise ValueError(f'expected 50 complete scenarios in five groups; got {scenarios}')
        manifest = output_dir / f'{prefix}-groups-manifest.json'
        manifest.write_text(json.dumps({'schema_version': 1, 'scenarios': 50,
            'groups': [{'file': str(p), 'sha256': digest(p), 'scenarios': 10}
                       for p in outputs]}, indent=2) + '\n', encoding='utf-8')
        return outputs
    except Exception:
        if writer is not None:
            writer.close()
        for path in outputs:
            path.unlink(missing_ok=True)
        raise


def main():
    p = argparse.ArgumentParser(description=__doc__)
    group = p.add_mutually_exclusive_group(required=True)
    group.add_argument('--input-file', type=Path)
    group.add_argument('--archive', type=Path)
    p.add_argument('--entry', default='samples-50.json')
    p.add_argument('--out-dir', type=Path, required=True)
    p.add_argument('--prefix', required=True)
    args = p.parse_args()
    if args.input_file:
        with args.input_file.open('rb') as source:
            result = split(source, args.out_dir, args.prefix)
    else:
        with zipfile.ZipFile(args.archive) as archive:
            with archive.open(args.entry) as source:
                result = split(source, args.out_dir, args.prefix)
    print('KEYCLOAK_SMALL_GROUPS_READY', len(result), args.out_dir)


if __name__ == '__main__':
    main()
