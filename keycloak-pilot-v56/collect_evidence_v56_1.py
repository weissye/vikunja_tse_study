#!/usr/bin/env python3
"""Offline evidence collector. No network calls, execution or changes to source runs."""
import argparse
from collections import Counter, defaultdict
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import zipfile

HTTP = {'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'}
SAFE = {'method', 'status', 'pair_id', 'attempt', 'overlap', 'overlap_ns',
        'A', 'B', 'started_ns', 'ended_ns', 'upstream_status', 'delivered_status'}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def numeric(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)

def analyze(records, log_text, expected):
    http = [r for r in records if r.get('method') in HTTP]
    pairs = [r for r in records if r.get('method') == 'RACE_PAIR']
    puts = [r for r in records if r.get('method') == 'PUT' and r.get('pair_id')]
    index = defaultdict(list)
    for r in puts:
        index[(r['pair_id'], r.get('attempt'))].append(r)
    checks = []
    seen = Counter()
    for p in pairs:
        key = (p.get('pair_id'), p.get('attempt'))
        seen[key] += 1
        members = index.get(key, [])
        intervals_ok = len(members) == 2 and all(
            numeric(r.get('started_ns')) and numeric(r.get('ended_ns')) and
            r['ended_ns'] >= r['started_ns'] for r in members)
        overlap_ns = (max(0, min(r['ended_ns'] for r in members) -
                           max(r['started_ns'] for r in members)) if intervals_ok else None)
        checks.append({'pair_id': key[0], 'attempt': key[1],
                       'put_count': len(members), 'intervals_complete': intervals_ok,
                       'computed_overlap_ns': overlap_ns,
                       'reported_overlap': p.get('overlap'),
                       'overlap_flag_matches': (p.get('overlap') == (overlap_ns > 0)
                                                if intervals_ok else None),
                       'overlap_duration_matches': (p.get('overlap_ns') == overlap_ns
                                                    if intervals_ok and 'overlap_ns' in p else None),
                       'both_puts_2xx': len(members) == 2 and all(
                           numeric(r.get('status')) and 200 <= r['status'] < 300 for r in members)})
    duplicate_pairs = sum(n - 1 for n in seen.values())
    unpaired = sum(len(v) for k, v in index.items() if k not in seen)
    unique_pairs = len({p.get('pair_id') for p in pairs if p.get('pair_id')})
    lines = log_text.splitlines()
    first_fail = next((i for i, l in enumerate(lines) if re.search(r'\bFAIL:', l)), None)
    fail_mode = next((i for i, l in enumerate(lines) if 'Switching to test fail mode' in l), None)
    after = lines[fail_mode + 1:] if fail_mode is not None else []
    selected_after = sum('Selected:' in l for l in after)
    verified_after = sum('Selected: [SBT:CrudVerified' in l for l in after)
    reasons = Counter()
    for l in lines:
        m = re.search(r'FAIL:\s*([A-Z][A-Z0-9_]+)(?:[.\s]|$)', l)
        if m:
            reasons[m[1]] += 1
    complete = (unique_pairs == expected if expected is not None else None)
    statuses = Counter(str(r.get('status', 'MISSING')) for r in http)
    metadata_ok = (bool(checks) and all(c['intervals_complete'] and
                    c['overlap_flag_matches'] is True and
                    c['overlap_duration_matches'] is not False for c in checks) and
                   duplicate_pairs == 0 and unpaired == 0)
    return {
        'schema_version': 'v56.1-offline',
        'scope': 'Archived evidence only; no SUT requests; no semantic reclassification.',
        'coverage': {
            'planned_race_pairs': expected, 'recorded_race_pairs': len(pairs),
            'unique_recorded_pair_ids': unique_pairs,
            'planned_pairs_without_completion_record': (max(0, expected - unique_pairs)
                                                        if expected is not None else None),
            'planned_pair_completion_fraction': (unique_pairs / expected if expected else None),
            'campaign_complete_by_pair_count': complete,
            'coverage_status': ('INCOMPLETE_FAIL_MODE' if fail_mode is not None else
                                'PAIR_COUNT_COMPLETE' if complete else 'INCOMPLETE_OR_UNKNOWN'),
            'pair_interval_metadata_complete': metadata_ok,
            'duplicate_pair_records': duplicate_pairs, 'puts_without_pair_completion_record': unpaired,
            'pair_checks': checks,
            'recorded_http_requests': len(http), 'http_status_counts': dict(statuses),
            'http_4xx_5xx_count': sum(numeric(r.get('status')) and 400 <= r['status'] < 600 for r in http),
            'http_missing_status_count': sum(not numeric(r.get('status')) for r in http),
            'semantic_checks_completed': None,
            'note': 'HTTP records are execution evidence. Pair completion is not semantic verification. Missing completion records can include unfinished pairs.'},
        'execution_boundary': {
            'first_fail_line': first_fail + 1 if first_fail is not None else None,
            'fail_mode_line': fail_mode + 1 if fail_mode is not None else None,
            'selected_events_after_fail_mode': selected_after,
            'crud_verified_events_after_fail_mode': verified_after,
            'post_fail_selected_events_counted_as_executed': False,
            'post_fail_verified_events_counted_as_pass': False,
            'failure_reason_counts': dict(reasons)},
        'evidence_limits': {
            'observed_semantic_values_available_in_this_report': False,
            'same_bug_as_prior_run': 'UNDETERMINED',
            'server_internal_overlap': 'NOT_ESTABLISHED_BY_CLIENT_INTERVALS',
            'missing_evidence': ['Observed fields at the failed semantic assertion',
                                 'Validated basis for allowed semantic outcomes'],
            'note': 'This collector does not reconstruct missing response bodies or change the original verdict.'}}

def collect(study_root, output):
    pilot = study_root / 'keycloak-pilot-v56'
    run = pilot / 'runs' / 'pilot-01'
    source_paths = {
        'provengo.log': run / 'provengo.log',
        'http-intervals.jsonl': run / 'http-intervals.jsonl',
        'pilot-summary-v56.json': run / 'pilot-summary-v56.json',
        'static-audit-v56.json': pilot / 'static-audit-v56.json'}
    snapshots = {n: p.read_bytes() for n, p in source_paths.items()}
    intervals = []
    for number, line in enumerate(snapshots['http-intervals.jsonl'].decode('utf-8-sig').splitlines(), 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
            if not isinstance(item, dict):
                raise ValueError()
        except (ValueError, TypeError):
            raise ValueError('Invalid interval record at line %d; no archive written' % number) from None
        intervals.append(item)
    static = json.loads(snapshots['static-audit-v56.json'].decode('utf-8-sig'))
    expected = static.get('relay_dispatches')
    if not isinstance(expected, int) or isinstance(expected, bool) or expected < 0:
        expected = None
    report = analyze(intervals, snapshots['provengo.log'].decode('utf-8-sig', errors='replace'), expected)
    # Strict allowlist. Do not copy URLs, headers, bodies, tokens or arbitrary error text.
    safe_records = [{k: v for k, v in r.items() if k in SAFE and
                     (v is None or isinstance(v, (bool, int, float)) or
                      (k == 'method' and v in HTTP | {'RACE_PAIR', 'RACE_ATTEMPT'}) or
                      (k == 'pair_id' and isinstance(v, str) and re.fullmatch(r'[A-Za-z0-9_-]{1,128}', v)))}
                    for r in intervals]
    original = json.loads(snapshots['pilot-summary-v56.json'].decode('utf-8-sig'))
    report['original_summary'] = {k: original[k] for k in
        ('provengo_exit', 'fixtures_absent', 'expanded_scenario_removed') if k in original}
    verdict = original.get('result')
    report['original_summary']['result'] = verdict if verdict in ('PASS', 'SEMANTIC_CANDIDATE', 'INCOMPLETE') else 'UNRECOGNIZED'
    report['legacy_field_explanation'] = 'v56 all_pairs_measured requires 224 pair records and 448 associated PUT records; it is not an individual-pair measurement check.'
    sources = [{'name': n, 'bytes': len(b), 'sha256': digest(b),
                'raw_copy_in_archive': False} for n, b in snapshots.items()]
    encode = lambda obj: (json.dumps(obj, indent=2, ensure_ascii=False) + '\n').encode('utf-8')
    files = {'coverage-evidence-v56.1.json': encode(report),
             'source-fingerprints.json': encode(sources),
             'http-intervals-metadata.jsonl': ('\n'.join(json.dumps(r) for r in safe_records) + '\n').encode(),
             'README.txt': b'Offline metadata evidence package. Original run files are unchanged. Keep them locally: source hashes are not backups. Response bodies are not included. Selected/verified events after fail mode are not accepted as executed/passed. Count completion is not semantic correctness.\n'}
    files['archive-manifest.json'] = encode({n: {'bytes': len(b), 'sha256': digest(b)} for n, b in files.items()})
    for n, p in source_paths.items():
        if digest(p.read_bytes()) != digest(snapshots[n]):
            raise RuntimeError('Source changed during collection; retry after the run finishes')
    with output.open('xb') as target:
        with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
            for n, b in files.items():
                archive.writestr(n, b)
    return report

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--study-root', type=Path, required=True)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    output = args.output or args.study_root / ('keycloak-v56-evidence-audit-' +
        datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S-%f') + '.zip')
    report = collect(args.study_root, output)
    coverage = report['coverage']
    print(json.dumps({'evidence_zip': str(output), 'coverage_status': coverage['coverage_status'],
                      'planned_pairs': coverage['planned_race_pairs'],
                      'recorded_pairs': coverage['recorded_race_pairs'],
                      'pair_interval_metadata_complete': coverage['pair_interval_metadata_complete']}, indent=2))

if __name__ == '__main__':
    main()
