#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, sys
from pathlib import Path

def sha(p:Path)->str:
    return hashlib.sha256(p.read_bytes()).hexdigest()

def main()->int:
    ap=argparse.ArgumentParser(); ap.add_argument('run_dir'); a=ap.parse_args()
    root=Path(a.run_dir).resolve(); mf=root/'evidence_manifest.json'
    data=json.loads(mf.read_text(encoding='utf-8')); bad=[]
    for rel,meta in data.get('files',{}).items():
        p=root/rel
        if not p.is_file() or sha(p)!=meta.get('sha256'): bad.append(rel)
    result={"ok":not bad,"checked":len(data.get('files',{})),"mismatches":bad}
    print(json.dumps(result,indent=2,sort_keys=True)); return 0 if result['ok'] else 1
if __name__=='__main__': raise SystemExit(main())
