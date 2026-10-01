"""Generic per-oracle execution inventory from the generated plan and HTTP evidence.

An observed barrier is not a semantic PASS.  Keep generation readiness,
physical overlap and independent evaluator verdict as separate facts.
"""
from collections import Counter
import argparse
import json
from pathlib import Path

from immich_coverage_gate import from_files as classify_overlap


def from_files(plan_path, epochs_path, *, trace_path=None, evaluation_path=None,
               excluded=(), preflight=False):
    plan = json.loads(plan_path.read_text(encoding='utf-8'))
    coverage = classify_overlap(plan_path, epochs_path, trace_path=trace_path,
                                excluded=excluded)
    observed = set(coverage['overlapping_oracle_ids'])
    evaluation = (json.loads(evaluation_path.read_text(encoding='utf-8'))
                  if evaluation_path is not None and evaluation_path.exists() else {})
    outcomes = {}
    for witness in evaluation.get('witnesses', []):
        if isinstance(witness, dict) and witness.get('epoch_id') and witness.get('oracle_id'):
            outcomes.setdefault(witness['oracle_id'], []).append(witness['result'])
    rows = []
    for oracle in plan.get('oracles', []):
        runtime = oracle.get('runtime') or {}
        oracle_id = oracle['oracle_id']
        if not runtime.get('ready'):
            state = 'NOT_RUNTIME_READY'
        elif preflight:
            state = 'NOT_RUN'
        elif oracle_id not in observed:
            state = 'NOT_OBSERVED'
        elif 'VIOLATED' in outcomes.get(oracle_id, []):
            state = 'VIOLATED'
        elif 'PASS' in outcomes.get(oracle_id, []):
            state = 'PASS'
        elif 'INCONCLUSIVE' in outcomes.get(oracle_id, []):
            state = 'INCONCLUSIVE'
        else:
            state = 'OVERLAP_WITHOUT_ORACLE_VERDICT'
        rows.append({'oracle_id': oracle_id, 'operation_id': oracle.get('operation_id'),
                     'kind': oracle['kind'], 'state': state,
                     'runtime_ready': bool(runtime.get('ready')),
                     'runtime_limitation': runtime.get('limitation'),
                     'overlap_observed': oracle_id in observed,
                     'verdicts': outcomes.get(oracle_id, [])})
    counts = Counter(row['state'] for row in rows)
    return {'schema_version': 1, 'generated_oracles': len(rows),
            'runtime_ready_oracles': sum(row['runtime_ready'] for row in rows),
            'observed_overlap_oracles': sum(row['overlap_observed'] for row in rows),
            'counts': dict(sorted(counts.items())),
            'families_ready': sorted({row['operation_id'] for row in rows if row['runtime_ready']}),
            'families_observed': sorted({row['operation_id'] for row in rows if row['overlap_observed']}),
            'oracles': rows,
            'evidence_policy': 'proxy-confirmed overlap and independent evaluator verdict; no implied coverage from HTTP volume'}


def aggregate(matrices):
    if not matrices:
        return {'state': 'NO_RUNS', 'generated_oracles': 0, 'runtime_ready_oracles': 0}
    per_id = {}
    for matrix in matrices:
        for row in matrix['oracles']:
            per_id.setdefault(row['oracle_id'], []).append(row)
    observed = sorted(oracle_id for oracle_id, rows in per_id.items()
                      if any(row['overlap_observed'] for row in rows))
    ready = sorted(oracle_id for oracle_id, rows in per_id.items()
                   if any(row['runtime_ready'] for row in rows))
    passed = sorted(oracle_id for oracle_id, rows in per_id.items()
                    if any(row['state'] == 'PASS' for row in rows))
    violated = sorted(oracle_id for oracle_id, rows in per_id.items()
                      if any(row['state'] == 'VIOLATED' for row in rows))
    return {'state': ('FULL_READY_ORACLE_COVERAGE' if set(ready) <= set(passed) | set(violated)
                      else 'PARTIAL_READY_ORACLE_COVERAGE'),
            'generated_oracles': len(per_id), 'runtime_ready_oracles': len(ready),
            'observed_overlap_oracles': len(observed), 'evaluated_oracles': len(set(passed) | set(violated)),
            'missing_overlap_oracles': sorted(set(ready) - set(observed)),
            'overlap_without_conclusive_verdict': sorted(set(observed) - set(passed) - set(violated)),
            'not_runtime_ready': sorted(set(per_id) - set(ready)),
            'passed_oracles': passed, 'violated_oracles': violated,
            'families_observed': sorted({row['operation_id'] for rows in per_id.values()
                                         for row in rows if row['overlap_observed']})}


def main(argv=None):
    parser = argparse.ArgumentParser(description='Rebuild concurrency coverage from preserved evidence')
    for flag in ('plan', 'epochs', 'trace', 'evaluation', 'output', 'summary'):
        parser.add_argument('--' + flag, type=Path, required=True)
    args = parser.parse_args(argv)
    matrix = from_files(args.plan, args.epochs, trace_path=args.trace,
                        evaluation_path=args.evaluation)
    args.output.write_text(json.dumps(matrix, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    summary = aggregate([matrix])
    args.summary.write_text(json.dumps(summary, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    print('CONCURRENCY_REEVALUATION state=%s ready=%s overlap=%s pass=%s violated=%s '
          'inconclusive=%s without_verdict=%s' % (
              summary['state'], summary['runtime_ready_oracles'],
              summary['observed_overlap_oracles'], len(summary['passed_oracles']),
              len(summary['violated_oracles']), matrix['counts'].get('INCONCLUSIVE', 0),
              matrix['counts'].get('OVERLAP_WITHOUT_ORACLE_VERDICT', 0)))


if __name__ == '__main__':
    main()
