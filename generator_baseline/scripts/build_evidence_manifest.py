#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path


def sha(path: Path) -> str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024), b''):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    ap=argparse.ArgumentParser(); ap.add_argument('run_dir'); a=ap.parse_args()
    root=Path(a.run_dir).resolve(); out=root/'evidence_manifest.json'
    files={}
    for p in sorted(root.rglob('*')):
        if p.is_file() and p != out:
            files[p.relative_to(root).as_posix()]={"sha256":sha(p),"bytes":p.stat().st_size}
    value={"schema_version":2,"algorithm":"SHA-256","run_root":".","files":files}
    out.write_text(json.dumps(value,indent=2,sort_keys=True)+"\n",encoding='utf-8')
    print(out)
    return 0
if __name__=='__main__': raise SystemExit(main())
