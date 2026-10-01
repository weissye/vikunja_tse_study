"""Strict evidence gate for one contract-derived missing concurrency target."""
import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.evaluate_verifiers import load_jsonl
from coverage_matrix import audit_seed, family, overlaps


def classify(plan, evaluation, epochs, oracle_id, required_rounds):
    matches = [o for o in plan.get('oracles', []) if o.get('oracle_id') == oracle_id]
    if len(matches) != 1 or not matches[0].get('runtime', {}).get('ready'):
        raise ValueError('Exactly one executable generated oracle is required')
    oracle = matches[0]
    group = family(oracle)
    if group is None:
        raise ValueError('Generated oracle has no supported coverage family')
    rows = audit_seed(plan, evaluation, epochs)
    row = rows[group]
    epoch_map = {e['epoch_id']: e for e in epochs if e.get('epoch_id')}
    witnesses = [w for w in evaluation.get('witnesses', [])
                 if w.get('oracle_id') == oracle_id and w.get('epoch_id') in epoch_map]
    details = []
    for w in witnesses:
        prefix = w.get('prefix_evidence') or {}
        depth = prefix.get('rounds')
        depth_ok = (isinstance(depth, int) and depth >= required_rounds and
                    bool(prefix.get('last_verified_utc')))
        details.append({'epoch_id': w['epoch_id'], 'result': w.get('result'),
                        'reason': w.get('reason'), 'real_overlap': overlaps(epoch_map[w['epoch_id']]),
                        'verified_prefix_rounds': depth if depth_ok else 0})
    qualified = [w for w in details if w['real_overlap'] and
                 w['verified_prefix_rounds'] >= required_rounds and
                 w['result'] in ('PASS', 'VIOLATED')]
    state = ('VERIFIED_PREFIX_AND_ORACLE_COVERAGE' if qualified else
             'NO_REAL_OVERLAP' if not any(w['real_overlap'] for w in details) else
             'PREFIX_OR_ORACLE_INCONCLUSIVE')
    return {'schema_version': 1, 'oracle_id': oracle_id, 'family': group,
            'state': state, 'required_prefix_rounds': required_rounds,
            'verdicts': {s: sum(w['result'] == s for w in qualified)
                         for s in ('PASS', 'VIOLATED')},
            'qualified_epochs': len(qualified), 'family_coverage': row,
            'witnesses': details,
            'classification_note': 'A VIOLATED witness is a candidate until resource isolation and field history are reviewed.'}


def analyze_target(seed, oracle_id, required_rounds):
    seed = Path(seed)
    plan = json.loads((seed / 'generated/concurrency-plan.mealie.json').read_text(encoding='utf-8'))
    evaluation = json.loads((seed / 'generated-verifier-evaluation.json').read_text(encoding='utf-8'))
    epochs = load_jsonl(seed / 'concurrent-epochs.jsonl')
    result = classify(plan, evaluation, epochs, oracle_id, required_rounds)
    result['trace_sha256'] = hashlib.sha256((seed / 'http-trace.jsonl').read_bytes()).hexdigest()
    return result
