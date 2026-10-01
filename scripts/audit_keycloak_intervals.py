#!/usr/bin/env python3
"""Require observed intervals and successful ID readback before counting an epoch."""
import argparse
import json
from pathlib import Path


def audit(records):
    lookups = [r for r in records if r['method']=='GET' and
               r['path'].endswith('/users') and r['status']==200]
    reads = [r for r in records if r['method']=='GET' and '/users/' in r['path']
             and r['status']==200]
    puts = [r for r in records if r['method']=='PUT' and '/users/' in r['path']]
    pairs = [(a,b) for i,a in enumerate(puts) for b in puts[i+1:]
             if a['path']==b['path'] and
             max(a['started_ns'],b['started_ns']) < min(a['ended_ns'],b['ended_ns'])]
    ready = bool(lookups and reads)
    return {'schema_version':1, 'binding_readback_http_ready':ready,
            'put_requests':len(puts), 'overlapping_put_pairs':len(pairs),
            'actual_overlap':'OBSERVED' if pairs else 'NOT_OBSERVED',
            'oracle_verdicts':'NOT_EVALUATED',
            'result':'INTERVAL_GATE_PASS' if ready and pairs else 'INCOMPLETE'}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--log',required=True,type=Path)
    parser.add_argument('--out',required=True,type=Path)
    args=parser.parse_args()
    if args.out.exists(): parser.error('Refusing to overwrite an existing report')
    with args.log.open(encoding='utf-8') as source:
        result=audit([json.loads(line) for line in source if line.strip()])
    args.out.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('KEYCLOAK_INTERVAL_GATE',result['result'], 'overlapping_pairs=',
          result['overlapping_put_pairs'],'report=',args.out)
    if result['result']!='INTERVAL_GATE_PASS': raise SystemExit(2)


if __name__=='__main__': main()
