"""Summarize one generated oracle from a complete local Mealie trace.

The raw trace remains local. Only selected oracle fields enter the frozen report.
"""
from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.evaluate_verifiers import load_jsonl
from mealie_combined_review import _target_history
from coverage_matrix import overlaps


def _at(event, key):
    return datetime.fromisoformat(event[key].replace('Z', '+00:00'))


def _created_and_read(events, oracle, path, first_control):
    collection = oracle['path_template'].split('/{')[0]
    item_id = path.rsplit('/', 1)[-1]
    created = [e for e in events if e.get('method') == 'POST' and
               e.get('model_path') == collection and e.get('status') in (200, 201) and
               isinstance(e.get('response'), dict) and str(e['response'].get('id')) == item_id]
    for create in created:
        for read in events:
            if (read.get('method') == 'GET' and read.get('model_path') == path and
                    read.get('status') == 200 and isinstance(read.get('response'), dict)):
                try:
                    if _at(create, 'upstream_completed_utc') < _at(read, 'upstream_started_utc') and (
                            _at(read, 'upstream_completed_utc') < first_control):
                        return {'create_http': create.get('status'), 'read_http': read['status'],
                                'created_id': item_id, 'created_before_controls': True}
                except (KeyError, TypeError, ValueError):
                    pass
    return {'created_before_controls': False}


def _exclusive_window(events, path, epoch_id, first_control, observed):
    """A lease must span the controls through observation, with no outside writes."""
    markers = [e for e in events if e.get('model_path') == path and
               e.get('epoch_id') == epoch_id and e.get('status') == 200 and
               e.get('method') in ('SBT_LEASE', 'SBT_RELEASE')]
    acquired = [e for e in markers if e['method'] == 'SBT_LEASE']
    released = [e for e in markers if e['method'] == 'SBT_RELEASE']
    if len(acquired) != 1 or len(released) != 1 or observed is None:
        return {'verified': False, 'reason': 'exclusive-lease-markers-missing'}
    try:
        begin = _at(acquired[0], 'timestamp_utc')
        end = _at(released[0], 'timestamp_utc')
        observation_end = _at(observed, 'upstream_completed_utc')
        if not begin < first_control < observation_end < end:
            return {'verified': False, 'reason': 'exclusive-lease-did-not-span-controls-and-observation'}
        permitted = {epoch_id}
        for prefix in ('generated-control-', 'generated-reset-',
                       'generated-reverse-control-', 'generated-reset-reverse-'):
            permitted.add(epoch_id.replace('generated-epoch-', prefix, 1))
        for event in events:
            if (event.get('model_path') != path or event.get('method') not in
                    ('PUT', 'PATCH', 'DELETE', 'POST')):
                continue
            if (_at(event, 'upstream_started_utc') < end and
                    _at(event, 'upstream_completed_utc') > begin and
                    event.get('epoch_id') not in permitted):
                return {'verified': False, 'reason': 'outside-write-during-exclusive-lease'}
    except (KeyError, ValueError, TypeError):
        return {'verified': False, 'reason': 'exclusive-lease-timestamps-unavailable'}
    return {'verified': True, 'reason': 'same-resource-controls-and-epoch-isolated'}


def analyze_seed(seed: Path, oracle_id: str):
    seed = Path(seed)
    trace = seed / 'http-trace.jsonl'
    events = load_jsonl(trace)
    manifest = json.loads((seed / 'generated/verification-manifest.mealie.json').read_text(encoding='utf-8'))
    evaluation = json.loads((seed / 'generated-verifier-evaluation.json').read_text(encoding='utf-8'))
    oracles = [o for o in manifest['concurrency_oracles'] if o['oracle_id'] == oracle_id]
    if len(oracles) != 1 or not oracles[0]['runtime']['ready']:
        raise ValueError('Target oracle is absent or not executable')
    oracle = oracles[0]
    epochs = {e['epoch_id']: e for e in load_jsonl(seed / 'concurrent-epochs.jsonl')}
    witnesses = [w for w in evaluation['witnesses'] if w.get('oracle_id') == oracle_id
                 and w.get('epoch_id')]
    report = {'schema_version': 1, 'oracle_id': oracle_id, 'seed': seed.name,
              'trace_sha256': hashlib.sha256(trace.read_bytes()).hexdigest(),
              'fields': [f['name'] for f in oracle['fields']],
              'observed_epochs': len(witnesses), 'histories': []}
    for witness in witnesses:
        history = _target_history(events, witness, oracle)
        epoch = epochs.get(witness['epoch_id'])
        observed = [row for row in history['timeline'] if row.get('epoch_id') == witness['epoch_id']
                    and row.get('method') in ('PUT', 'PATCH')]
        path = observed[0]['model_path'] if observed else None
        controls = [row for row in events if row.get('epoch_id') ==
                    witness['epoch_id'].replace('generated-epoch-', 'generated-control-', 1)
                    and row.get('method') in ('PUT', 'PATCH')]
        final_reads = [row for row in events if row.get('epoch_id') == witness['epoch_id']
                       and row.get('model_path') == path and row.get('method') == 'GET'
                       and str(row.get('operation_id', '')).endswith('-observe')]
        try:
            first_control = min(_at(e, 'upstream_started_utc') for e in controls)
            created = _created_and_read(events, oracle, path,
                                        first_control)
            exclusive = _exclusive_window(events, path, witness['epoch_id'],
                                          first_control, final_reads[-1] if final_reads else None)
        except (ValueError, TypeError, KeyError):
            created = {'created_before_controls': False}
            exclusive = {'verified': False, 'reason': 'controls-or-observation-missing'}
        prefix = witness.get('prefix_evidence', {})
        verified = (epoch is not None and overlaps(epoch) and
                    len(observed) == 2 and len(controls) == 2 and
                    created['created_before_controls'] and
                    exclusive['verified'] and
                    prefix.get('rounds', 0) >= oracle.get('prefix_min_rounds', 0) and
                    history['has_field_values'])
        result = witness['result']
        classification = ({'VIOLATED': 'REPRODUCED_IN_FRESH_INSTANCE',
                           'PASS': 'SERIALIZABLE_IN_FRESH_INSTANCE'}.get(result, 'INCONCLUSIVE')
                          if verified else 'INCONCLUSIVE')
        history.update({'witness_result': result, 'classification': classification,
                        'prefix_rounds': prefix.get('rounds', 0),
                        'real_overlap': bool(epoch and overlaps(epoch)),
                        'created_and_read': created, 'exclusive_window': exclusive})
        report['histories'].append(history)
    classes = {row['classification'] for row in report['histories']}
    report['classification'] = ('REPRODUCED_IN_FRESH_INSTANCE'
                                if 'REPRODUCED_IN_FRESH_INSTANCE' in classes else
                                'SERIALIZABLE_IN_FRESH_INSTANCE'
                                if 'SERIALIZABLE_IN_FRESH_INSTANCE' in classes else
                                'INCONCLUSIVE' if witnesses else 'NOT_OBSERVED')
    report['witness_result'] = (next((w['result'] for w in witnesses if w['result'] == 'VIOLATED'),
                                     witnesses[0]['result']) if witnesses else None)
    return report
