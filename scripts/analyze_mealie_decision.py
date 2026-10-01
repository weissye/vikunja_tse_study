"""Classify Mealie concurrency witnesses from frozen, redacted evidence.

Does not infer field values from a trace that contains only HTTP metadata.
"""
import argparse
import json
import zipfile
from collections import Counter
from pathlib import Path


def analyze(seed, read):
    trace = [json.loads(line) for line in read(seed + '/http-trace.jsonl').splitlines() if line.strip()]
    evaluation = json.loads(read(seed + '/generated-verifier-evaluation.json'))
    summary = json.loads(read(seed + '/summary.json'))
    by_index = {row['trace_sequence']: row for row in trace}
    witnesses = []
    for witness in evaluation.get('witnesses', []):
        if not witness.get('epoch_id') or not witness.get('oracle_id', '').startswith('concurrency::'):
            continue
        triggers = witness.get('trigger_events') or []
        last_trigger = max(triggers, default=0)
        observation = witness.get('observation_event') or 0
        resource = (by_index.get(last_trigger) or {}).get('model_path')
        intervening = [
            {'trace_sequence': row['trace_sequence'], 'method': row['method'],
             'status': row['status'], 'model_path': row['model_path']}
            for row in trace if last_trigger < row['trace_sequence'] < observation
            and row.get('model_path') == resource
            and row.get('method') in ('POST', 'PUT', 'PATCH', 'DELETE')
        ]
        witnesses.append({
            'oracle_id': witness['oracle_id'], 'epoch_id': witness['epoch_id'],
            'verdict': witness['result'], 'reason': witness.get('reason'),
            'trigger_statuses': witness.get('statuses'),
            'intervening_same_resource_writes': intervening,
            'observation_event': observation,
        })
    mealplans = [row for row in trace if row.get('method') == 'PUT'
                 and (row.get('model_path') or '').startswith('/api/households/mealplans/')
                 and '/rules/' not in (row.get('model_path') or '')]
    return {
        'seed': summary.get('seed'),
        'actual_overlap_epochs': summary.get('real_overlap_epochs'),
        'max_verified_prefix_rounds': summary.get('max_prefix_rounds'),
        'coverage_state': summary.get('coverage_state'),
        'mealplan_put_statuses': dict(sorted(Counter(str(row['status']) for row in mealplans).items())),
        'concurrency_verdicts': dict(Counter(row['verdict'] for row in witnesses)),
        'witnesses': witnesses,
        'assessment': 'No semantic defect established by inconclusive witnesses',
    }


def report(source):
    source = Path(source)
    if source.is_file() and source.suffix.lower() == '.zip':
        with zipfile.ZipFile(source) as archive:
            names = archive.namelist()
            seeds = sorted({name.split('/')[0] for name in names
                            if name.startswith('seed-') and name.endswith('/summary.json')})
            if not seeds:
                raise ValueError('Archive contains no seed summary')
            return [analyze(seed, archive.read) for seed in seeds]
    if source.is_dir():
        seeds = sorted(path for path in source.iterdir() if path.is_dir() and path.name.startswith('seed-'))
        if not seeds:
            raise ValueError('Run directory contains no seeds')
        return [analyze(seed.name, lambda name: (source / name).read_bytes()) for seed in seeds]
    raise ValueError('Expected a Stage4 evidence ZIP or a run directory')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = {'schema_version': 1, 'source': Path(args.source).name, 'seeds': report(args.source)}
    data = json.dumps(result, indent=2, ensure_ascii=False)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(data + '\n', encoding='utf-8')
    for item in result['seeds']:
        print('MEALIE_DECISION seed=%s overlap=%s prefix=%s put=%s verdicts=%s' %
              (item['seed'], item['actual_overlap_epochs'], item['max_verified_prefix_rounds'],
               item['mealplan_put_statuses'], item['concurrency_verdicts']))
        for row in item['witnesses']:
            if row['verdict'] == 'INCONCLUSIVE':
                print('MEALIE_UNRESOLVED epoch=%s reason=%s intervening_same_resource_writes=%s' %
                      (row['epoch_id'], row['reason'], len(row['intervening_same_resource_writes'])))
    if args.output:
        print('MEALIE_DECISION_REPORT', args.output)
