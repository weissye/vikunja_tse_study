#!/usr/bin/env python3
"""Restore the 15 full Provengo JSON files in a separate directory."""
import argparse,hashlib,json,pathlib
import zstandard as zstd
HERE=pathlib.Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--out',type=pathlib.Path,default=HERE/'expanded-json')
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
for ordinal in range(1,16):
    compressed=HERE/f'scenarios/run-{ordinal:02d}.json.zst'
    audit=json.loads((HERE/f'audits/run-{ordinal:02d}.json').read_text())
    output=a.out/f'run-{ordinal:02d}.json'
    if output.exists():raise FileExistsError(output)
    digest=hashlib.sha256()
    with compressed.open('rb') as src, zstd.ZstdDecompressor().stream_reader(src) as reader, output.open('wb') as dest:
        while block:=reader.read(1<<20):digest.update(block);dest.write(block)
    if digest.hexdigest()!=audit['full_sha256']:
        output.unlink();raise RuntimeError(f'JSON integrity failed for run {ordinal}')
    print(output,flush=True)
