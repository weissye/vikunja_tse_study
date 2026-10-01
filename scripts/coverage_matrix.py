#!/usr/bin/env python3
"""Evidence-based coverage audit for generated OpenAPI concurrency campaigns.

This audit never upgrades a candidate, a scheduled epoch, or an HTTP 2xx into
verified semantic coverage without its corresponding runtime evidence.
"""
import argparse
import itertools
import json
import zipfile
from collections import Counter
from pathlib import Path


FAMILIES = ('same_record_same_field', 'same_record_disjoint_fields',
            'same_record_update_delete', 'cross_entity', 'noop')
REQUESTED_FAMILIES = ('same_record_same_field', 'same_record_disjoint_fields',
                      'cross_entity', 'noop')


def family(oracle):
    kind = str(oracle.get('kind', '')).lower()
    if 'noop' in kind or 'no-op' in kind:
        return 'noop'
    if 'cross-resource' in kind or 'cross-entity' in kind:
        return 'cross_entity'
    if kind == 'empirical-update-delete' or kind == 'update-delete-linearizable':
        return 'same_record_update_delete'
    if kind.startswith('disjoint-writes') or kind == 'disjoint-put-serial-outcomes':
        return 'same_record_disjoint_fields'
    if kind.startswith('same-field'):
        return 'same_record_same_field'
    return None


def overlaps(epoch):
    operations = epoch.get('operations', [])
    if len(operations) < 2 or not epoch.get('all_workers_ready_before_release'):
        return False
    try:
        return max(op['started_utc'] for op in operations) < min(
            op['ended_utc'] for op in operations)
    except (KeyError, TypeError):
        return False


def _default_row():
    return dict(candidates=0, ready=0, overlapped=0, evaluated=0,
                verified_long_prefix=0, prefix_and_evaluated=0,
                verdicts={}, missing_ready=0, state='NO_EXECUTABLE_ORACLE')


def audit_seed(plan, evaluation=None, epochs=None):
    rows = {key: _default_row() for key in FAMILIES}
    ready = {}
    for oracle in plan.get('oracles', []):
        group = family(oracle)
        if not group:
            continue
        row = rows[group]
        row['candidates'] += 1
        if oracle.get('runtime', {}).get('ready'):
            row['ready'] += 1
            ready[oracle['oracle_id']] = (group, oracle)
    # Structural pairs are an inventory, not executable cross-entity oracles.
    by_entity = {}
    for group, oracle in ready.values():
        if group == 'same_record_same_field':
            entity = oracle['runtime'].get('entity_key')
            if entity:
                by_entity.setdefault(entity, set()).add(oracle['operation_id'])
    pairs = sum(len(by_entity[left]) * len(by_entity[right]) for left, right
                in itertools.combinations(sorted(by_entity), 2))
    rows['cross_entity']['structural_pairs_without_oracle'] = pairs
    # Existing readable, writable items suggest NO-OP subjects but do not
    # imply an executable NO-OP story or an expected response code.
    rows['noop']['readable_update_subjects_without_oracle'] = sum(
        len(ops) for ops in by_entity.values())
    observed = {epoch['epoch_id'] for epoch in (epochs or [])
                if epoch.get('epoch_id') and overlaps(epoch)}
    verdicts = {key: Counter() for key in FAMILIES}
    met = {key: set() for key in FAMILIES}
    judged = {key: set() for key in FAMILIES}
    prefixes = {key: set() for key in FAMILIES}
    both = {key: set() for key in FAMILIES}
    for witness in (evaluation or {}).get('witnesses', []):
        oracle_id, epoch_id = witness.get('oracle_id'), witness.get('epoch_id')
        if oracle_id not in ready or epoch_id not in observed:
            continue
        group, oracle = ready[oracle_id]
        key = (oracle_id, epoch_id)
        met[group].add(key)
        result = witness.get('result')
        if result in ('PASS', 'VIOLATED', 'INCONCLUSIVE'):
            verdicts[group][result] += 1
        if result in ('PASS', 'VIOLATED'):
            judged[group].add(key)
        evidence = witness.get('prefix_evidence') or {}
        if (oracle.get('prefix_min_rounds', 0) >= 1 and
                evidence.get('last_verified_utc') and
                isinstance(evidence.get('rounds'), int) and
                evidence['rounds'] >= oracle['prefix_min_rounds']):
            prefixes[group].add(key)
            if result in ('PASS', 'VIOLATED'):
                both[group].add(key)
    for name, row in rows.items():
        row['overlapped'] = len(met[name])
        row['evaluated'] = len(judged[name])
        row['verified_long_prefix'] = len(prefixes[name])
        row['prefix_and_evaluated'] = len(both[name])
        row['verdicts'] = dict(verdicts[name])
        row['missing_ready'] = row['ready'] - len({x[0] for x in met[name]})
        row['state'] = ('NO_EXECUTABLE_ORACLE' if not row['ready'] else
                        'PREFLIGHT_NOT_RUN' if evaluation is None else
                        'NOT_OVERLAPPED' if not met[name] else
                        'OVERLAPPED_WITHOUT_VERDICT' if not judged[name] else
                        'EVALUATED_WITHOUT_VERIFIED_PREFIX' if not both[name] else
                        'PREFIX_AND_ORACLE_VERIFIED')
    return rows


def read_run(source):
    source = Path(source)
    if source.is_file():
        with zipfile.ZipFile(source) as archive:
            names = set(archive.namelist())
            seeds = sorted({name.split('/')[0] for name in names
                            if name.endswith('/generated/concurrency-plan.mealie.json')})

            def read(name):
                return archive.read(name) if name in names else None

            return _read_seeds(seeds, read)
    seeds = sorted(path.name for path in source.glob('seed-*') if
                   (path / 'generated/concurrency-plan.mealie.json').exists())

    def read(name):
        file = source / name
        return file.read_bytes() if file.exists() else None

    return _read_seeds(seeds, read)


def _read_seeds(seeds, read):
    if not seeds:
        raise ValueError('No generated concurrency plans found')
    result = {}
    for seed in seeds:
        root = seed + '/'
        plan = json.loads(read(root + 'generated/concurrency-plan.mealie.json'))
        evaluation = read(root + 'generated-verifier-evaluation.json')
        epoch_data = read(root + 'concurrent-epochs.jsonl')
        epochs = [json.loads(line) for line in epoch_data.splitlines()] if epoch_data else []
        result[seed] = audit_seed(plan, json.loads(evaluation) if evaluation else None, epochs)
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True, help='Preserved review ZIP or run directory')
    parser.add_argument('--output', required=True, help='Coverage JSON to write')
    args = parser.parse_args(argv)
    runs = read_run(args.input)
    report = {'schema_version': 1, 'source': str(args.input), 'seeds': runs,
              'all_families_proven': all(
                  row['prefix_and_evaluated'] > 0 for seed in runs.values()
                  for row in seed.values()),
              'all_requested_families_proven': all(
                  seed[name]['prefix_and_evaluated'] > 0 for seed in runs.values()
                  for name in REQUESTED_FAMILIES)}
    target = Path(args.output)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(report, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    for seed, rows in runs.items():
        for name, row in rows.items():
            print('COVERAGE seed=%s family=%s candidates=%s ready=%s overlap=%s prefix=%s evaluated=%s state=%s' %
                  (seed, name, row['candidates'], row['ready'], row['overlapped'],
                   row['verified_long_prefix'], row['evaluated'], row['state']))
    print('COVERAGE_REPORT', target)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
