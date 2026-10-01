#!/usr/bin/env python3
"""Extract the first v50 race failure without copying sensitive log bodies."""
import argparse
import json
from pathlib import Path
import re
import zipfile


def short_event(line, number):
    base = {'line': number}
    if 'Selected: [' in line:
        m = re.search(r'Selected: \[(GET|POST|PUT|DELETE) .*?url:"[^"]+:9938([^"?]+)(?:\?([^"?]*))?', line)
        if m:
            return {**base, 'kind': 'HTTP', 'method': m[1], 'path': m[2],
                    'event': (re.search(r'__sbt_event=([A-Za-z0-9_]+)', m[3] or '') or [None, None])[1]}
        m = re.search(r'Selected: \[SBT:([A-Za-z]+) \{owner:"([^"]+)", stage:"([^"]+)"', line)
        if m:
            return {**base, 'kind': 'STEP', 'type': m[1], 'owner': m[2], 'stage': m[3]}
        return None
    m = re.search(r"RTV: setting '([^']+)'", line)
    if m:
        return {**base, 'kind': 'RTV', 'variable': m[1]}
    if 'RACE_OUTCOME_UNCLASSIFIED' in line:
        return {**base, 'kind': 'FAIL', 'reason': 'RACE_OUTCOME_UNCLASSIFIED'}
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--study-root', type=Path, required=True)
    args = parser.parse_args()
    root = args.study_root / 'keycloak-pilot-v50'
    run = root / 'runs' / 'pilot-01'
    lines = (run / 'provengo.log').read_text(encoding='utf-8-sig', errors='replace').splitlines()
    hit = next((i for i, line in enumerate(lines) if 'FAIL: RACE_OUTCOME_UNCLASSIFIED' in line), None)
    if hit is None:
        raise SystemExit('First race failure not found in v50 provengo.log')
    events = [item for i in range(max(0, hit - 130), hit + 1)
              if (item := short_event(lines[i], i + 1)) is not None]
    gets = [e for e in events if e['kind'] == 'HTTP' and e['method'] == 'GET']
    if not gets:
        raise SystemExit('No preceding GET in bounded log context; increase context explicitly')
    last_get = gets[-1]
    records = []
    with (run / 'http-intervals.jsonl').open(encoding='utf-8') as source:
        for line in source:
            if line.strip():
                item = json.loads(line)
                if item.get('path') == last_get['path'] and item.get('method') in ('GET','PUT','RACE_PAIR','RACE_ATTEMPT'):
                    records.append({k:item[k] for k in ('method','path','status','pair_id','attempt','overlap',
                                   'overlap_ns','A','B','started_ns','ended_ns','request_normalization') if k in item})
    report = {'failure_line': hit + 1, 'preceding_get': last_get,
              'recent_events': events, 'matching_http_records': records[-40:],
              'note': 'Only event types, paths, status and timing are included; no tokens, bodies or response data.'}
    target = args.study_root / 'keycloak-v50-first-race-diagnostic-v51.zip'
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr('first-race-v51.json', json.dumps(report, indent=2) + '\n')
    print(json.dumps({'failure_line': hit + 1, 'preceding_get': last_get,
                      'matching_records': len(records), 'evidence_zip': str(target)}, indent=2))


if __name__ == '__main__':
    main()
