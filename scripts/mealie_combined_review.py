"""Reevaluate a preserved local Mealie run without changing its original evidence.

Only OpenAPI-selected fields from targeted histories enter the shareable review.
The complete HTTP trace remains in the local run directory.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.evaluate_verifiers import evaluate, load_jsonl
from coverage_matrix import audit_seed

NEW_KINDS = {'disjoint-put-serial-outcomes', 'noop-versus-change',
             'cross-entity-independent-writes'}


def _projection(event, fields):
    result = {name: event.get(name) for name in (
        'method', 'model_path', 'epoch_id', 'operation_id', 'status',
        'upstream_started_utc', 'upstream_completed_utc')}
    for source in ('request', 'response'):
        value = event.get(source)
        if isinstance(value, dict):
            result[source] = {key: value[key] for key in fields if key in value}
    return result


def _target_history(events, witness, oracle):
    epoch_id = witness['epoch_id']
    suffix = epoch_id.removeprefix('generated-epoch-')
    phases = {prefix + suffix for prefix in (
        'generated-control-', 'generated-reset-', 'generated-reverse-control-',
        'generated-reset-reverse-', 'generated-epoch-')}
    fields = [f['name'] for f in oracle.get('fields', [])]
    if oracle.get('kind') == 'cross-entity-independent-writes':
        fields = [f['name'] for t in oracle.get('targets', []) for f in t.get('fields', [])]
    selected = [e for e in events if e.get('epoch_id') in phases]
    paths = {e.get('model_path') for e in selected if e.get('model_path')}
    times = [e.get('upstream_started_utc') for e in selected if e.get('upstream_started_utc')]
    ends = [e.get('upstream_completed_utc') for e in selected if e.get('upstream_completed_utc')]
    if times and ends:
        selected.extend(e for e in events if e.get('epoch_id') not in phases and
                        e.get('model_path') in paths and
                        e.get('method') in ('PUT', 'PATCH', 'POST', 'DELETE') and
                        min(times) <= str(e.get('upstream_started_utc') or '') <= max(ends))
    selected.sort(key=lambda e: e.get('_index', 0))
    timeline = [_projection(e, fields) for e in selected]
    return {'epoch_id': epoch_id, 'oracle_id': oracle['oracle_id'],
            'kind': oracle['kind'], 'fields': fields,
            'original_result': witness['result'],
            'timeline': timeline,
            'has_field_values': any(bool(row.get('request') or row.get('response')) for row in timeline)}


def analyze_run(run: Path):
    run = Path(run)
    seeds = sorted(run.glob('seed-*'))
    if not seeds:
        raise ValueError('No preserved seed directories in run')
    report = {'schema_version': 1, 'source_run': str(run), 'seeds': {}}
    for seed in seeds:
        generated = seed / 'generated'
        manifest_path = generated / 'verification-manifest.mealie.json'
        plan_path = generated / 'concurrency-plan.mealie.json'
        trace_path = seed / 'http-trace.jsonl'
        original_path = seed / 'generated-verifier-evaluation.json'
        if not all(p.is_file() for p in (manifest_path, plan_path, trace_path, original_path)):
            raise ValueError('Incomplete preserved seed: ' + str(seed))
        manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
        plan = json.loads(plan_path.read_text(encoding='utf-8'))
        original = json.loads(original_path.read_text(encoding='utf-8'))
        events = load_jsonl(trace_path)
        reevaluated = evaluate(events, manifest)
        oracles = {o['oracle_id']: o for o in manifest['concurrency_oracles']}
        original_witnesses = [w for w in original['witnesses'] if w.get('epoch_id') and
                              w.get('kind') in NEW_KINDS and
                              w.get('result') in ('VIOLATED', 'INCONCLUSIVE')]
        new_by_key = {(w.get('oracle_id'), w.get('epoch_id')): w for w in reevaluated['witnesses']}
        targets = []
        for witness in original_witnesses:
            oracle = oracles.get(witness['oracle_id'])
            if not oracle:
                continue
            item = _target_history(events, witness, oracle)
            fresh = new_by_key.get((witness['oracle_id'], witness['epoch_id']))
            item['reevaluated_result'] = fresh['result'] if fresh else 'NOT_REEVALUATABLE'
            item['reevaluated_reason'] = (fresh.get('reason') if fresh else
                                          ('frozen-trace-lacks-field-values' if not item['has_field_values']
                                           else 'no-matching-epoch-witness'))
            targets.append(item)
        epoch_file = seed / 'concurrent-epochs.jsonl'
        epochs = load_jsonl(epoch_file) if epoch_file.exists() else []
        report['seeds'][seed.name] = {
            'trace_sha256': hashlib.sha256(trace_path.read_bytes()).hexdigest(),
            'original_status': original['run_status'], 'reevaluated_status': reevaluated['run_status'],
            'original_counts': original['counts'], 'reevaluated_counts': reevaluated['counts'],
            'coverage': audit_seed(plan, reevaluated, epochs),
            'target_histories': targets,
        }
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', required=True)
    parser.add_argument('--output')
    args = parser.parse_args(argv)
    report = analyze_run(Path(args.run))
    output = Path(args.output) if args.output else Path(args.run) / 'combined-review.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    for seed, result in report['seeds'].items():
        print('MEALIE_COMBINED_REPLAY seed=%s original=%s reevaluated=%s targets=%s' % (
            seed, result['original_status'], result['reevaluated_status'],
            [(x['epoch_id'], x['original_result'], x['reevaluated_result'],
              x['reevaluated_reason']) for x in result['target_histories']]))
    print('MEALIE_COMBINED_REVIEW', output)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
