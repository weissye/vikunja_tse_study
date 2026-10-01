#!/usr/bin/env python3
"""Compress a single sampled trace and remove the expanded copy after verification."""
import hashlib
import json
from pathlib import Path
import sys

import zstandard as zstd


def main(source_name):
    source = Path(source_name)
    target = source.with_suffix('.json.zst')
    if target.exists():
        raise FileExistsError(target)
    original = hashlib.sha256()
    with source.open('rb') as raw, target.open('wb') as compressed:
        with zstd.ZstdCompressor(level=6).stream_writer(compressed) as writer:
            while chunk := raw.read(1 << 20):
                original.update(chunk)
                writer.write(chunk)
    restored = hashlib.sha256()
    with target.open('rb') as compressed, zstd.ZstdDecompressor().stream_reader(compressed) as reader:
        while chunk := reader.read(1 << 20):
            restored.update(chunk)
    if restored.hexdigest() != original.hexdigest():
        target.unlink()
        raise RuntimeError('Compressed trace verification failed')
    (source.parent / 'scenario-digest-v30.json').write_text(json.dumps({
        'full_sha256': original.hexdigest(),
        'compressed_sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
        'size_bytes': source.stat().st_size}, indent=2) + '\n')
    source.unlink()
    print(target)


if __name__ == '__main__':
    main(sys.argv[1])
