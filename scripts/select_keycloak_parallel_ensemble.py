#!/usr/bin/env python3
"""Stream six new Provengo batches and select 15 paired-dispatch schedules."""
import argparse
from collections import Counter
import hashlib
import heapq
import json
from pathlib import Path
import zipfile
import zlib

FAMILIES = ('same-field-one-successful-value-visible', 'noop-versus-change',
            'disjoint-put-serial-outcomes')


def scenario_bytes(source):
    """Split a UTF-8 JSON array without loading its large callback payloads."""
    if source.read(1) != b'[':
        raise ValueError('expected outer JSON array')
    depth = 0
    quoted = escaped = False
    scenario = bytearray()
    # This scanner handles escaped quotes and nesting; all generated scenarios
    # start with '['. The source may have spaces and commas between scenarios.
    while block := source.read(1 << 18):
        for byte in block:
            if depth == 0:
                if byte == 93:  # End of outer array.
                    return
                if byte in (9, 10, 13, 32, 44):
                    continue
                if byte != 91:
                    raise ValueError('expected scenario array')
                scenario = bytearray((byte,))
                depth = 1
                continue
            scenario.append(byte)
            if quoted:
                if escaped:
                    escaped = False
                elif byte == 92:
                    escaped = True
                elif byte == 34:
                    quoted = False
            elif byte == 34:
                quoted = True
            elif byte in (91, 123):
                depth += 1
            elif byte in (93, 125):
                depth -= 1
                if depth == 0:
                    yield bytes(scenario)
                    scenario = bytearray()
    raise ValueError('truncated sample JSON')


def score(events):
    chosen = next((e.get('data', {}) for e in events
                   if e.get('name') == 'SBT:ScheduleChosen'), {})
    kind = chosen.get('kind')
    if kind not in FAMILIES:
        raise ValueError('unexpected oracle family')
    names = [e.get('name') for e in events]
    rest = [e.get('data', {}) for e in events if e.get('data', {}).get('lib') == 'REST']
    rounds = {e.get('data', {}).get('round') for e in events
              if e.get('name') == 'SBT:PrefixRoundScheduled'}
    orders = {e.get('data', {}).get('order') for e in events
              if e.get('name') == 'SBT:SerialOrderScheduled'}
    writes = {e.get('data', {}).get('operation') for e in events
              if e.get('name') == 'SBT:ConcurrentWriteScheduled'}
    instance = chosen.get('instance')
    prefix_choices = {d.get('name'): d.get('value') for e in events
                      if isinstance((d := e.get('data')), dict)
                      and d.get('type') == 'selection'
                      and str(d.get('name', '')).startswith('prefix-field:')}
    signature = ''.join(str(prefix_choices.get(f'prefix-field:{instance}:{r}', '?'))
                        for r in range(1, 9))
    dispatch = [r for r in rest if r.get('method') == 'POST' and
                str(r.get('url', '')).split('?', 1)[0].endswith('/__sbt_race')]
    ready = (rounds == set(range(1, 9)) and orders == {'AB', 'BA'}
             and writes == {'A', 'B'} and 'SBT:RaceStart' in names
             and len(dispatch) == 1 and len(prefix_choices) == 8
             and len(signature) == 8 and set(signature) <= {'a', 'b'}
             and rest and rest[-1].get('method') == 'GET'
             and any(r.get('method') == 'POST' and '/users' in str(r.get('url')) for r in rest))
    if not ready:
        raise ValueError('incomplete symbolic schedule')
    transitions = sum(left != right for left, right in zip(signature, signature[1:]))
    balance = min(signature.count('a'), signature.count('b'))
    # A paired dispatch intent still is not proof of wire overlap.
    parts = {'paired_dispatch_intent': 40, 'prefix_rounds': 2 * len(rounds),
             'both_serial_orders': 12, 'post_join_read': 10,
             'field_transitions': transitions, 'field_balance': balance,
             'rest_length': min(len(rest), 120) / 4,
             'event_length': min(len(events), 400) / 40}
    return {'family': kind, 'instance': instance,
            'first_order': chosen.get('first'), 'rest_events': len(rest),
            'events': len(events), 'prefix_rounds': len(rounds),
            'prefix_field_history': signature,
            'score': round(sum(parts.values()), 3), 'score_parts': parts,
            'actual_overlap': 'NOT_MEASURED'}


def choose(batches):
    heaps = {kind: [] for kind in FAMILIES}
    seen_hashes = set()
    sampled = 0
    duplicates = 0
    for path in batches:
        with zipfile.ZipFile(path) as archive:
            audit = json.loads(archive.read('audit-50.json'))
            if audit.get('scenarios') != 50 or audit.get('complete_rest_schedules') != 50:
                raise ValueError('batch audit incomplete: ' + str(path))
            with archive.open('samples-50.json') as source:
                count = 0
                for raw in scenario_bytes(source):
                    sampled += 1
                    count += 1
                    fingerprint = hashlib.sha256(raw).hexdigest()
                    if fingerprint in seen_hashes:
                        duplicates += 1
                        continue
                    seen_hashes.add(fingerprint)
                    metrics = score(json.loads(raw))
                    key = (metrics['score'], fingerprint)
                    heap = heaps[metrics['family']]
                    item = (key, fingerprint, metrics, zlib.compress(raw, 6))
                    if len(heap) < 10:
                        heapq.heappush(heap, item)
                    elif key > heap[0][0]:
                        heapq.heapreplace(heap, item)
                if count != 50:
                    raise ValueError('batch does not contain exactly 50 scenarios')
    if sampled != 300 or any(len(heaps[k]) < 10 for k in FAMILIES):
        raise ValueError('cannot fill 10 unique candidates per family')
    candidates = [item for kind in FAMILIES for item in heaps[kind]]
    candidates.sort(key=lambda item: item[0], reverse=True)
    chosen = []
    for family in FAMILIES:
        pool = [v for v in candidates if v[2]['family'] == family]
        seen_instances, seen_orders, seen_histories = set(), set(), []
        for _ in range(5):
            winner = max(pool, key=lambda v: (
                v[2]['score'] + 20 * (v[2]['instance'] not in seen_instances)
                + 10 * (v[2]['first_order'] not in seen_orders)
                + (min(sum(a != b for a,b in zip(v[2]['prefix_field_history'], history))
                       for history in seen_histories) * 2 if seen_histories else 0), v[1]))
            chosen.append(winner)
            seen_instances.add(winner[2]['instance'])
            seen_orders.add(winner[2]['first_order'])
            seen_histories.append(winner[2]['prefix_field_history'])
            pool.remove(winner)
    return candidates, chosen, {'sampled': sampled, 'exact_duplicate_scenarios': duplicates,
                                 'candidates': 30, 'selected': 15,
                                 'ranking_basis': 'symbolic paired dispatch schedule only',
                                 'real_overlap_verified': 0,
                                 'cross_entity_schedules': 0}


def emit(archive, name, entries):
    with archive.open(name, 'w', force_zip64=True) as target:
        target.write(b'[')
        for index, item in enumerate(entries):
            if index:
                target.write(b',')
            target.write(zlib.decompress(item[3]))
        target.write(b']')


def write_result(batches, output):
    if output.exists():
        raise FileExistsError(output)
    candidates, selected, summary = choose(batches)
    with zipfile.ZipFile(output, 'x', zipfile.ZIP_DEFLATED,
                         compresslevel=6, allowZip64=True) as archive:
        emit(archive, 'candidates-30.json', candidates)
        emit(archive, 'ensemble-15.json', selected)
        archive.writestr('ranking-report.json', json.dumps({
            'summary': summary,
            'weights': {'paired_dispatch_intent': 40, 'prefix_round': 2,
                        'both_serial_orders': 12, 'post_join_read': 10,
                        'rest_event': .25, 'event': .025,
                        'new_instance_in_selection': 20, 'new_control_order': 10},
            'candidates': [dict(id=i+1, sha256=v[1], **v[2])
                           for i, v in enumerate(candidates)],
            'ensemble': [dict(run_id=i+1, sha256=v[1], **v[2])
                         for i, v in enumerate(selected)]}, indent=2) + '\n')
        archive.writestr('README.md', '# Keycloak ranked ensemble\n\n'
                         '30 top candidates: 10 per oracle family. Selected 15: '
                         '5 per family with instance and serial-order diversity. '
                         'Both JSON arrays are valid Provengo run sources for the '
                         'paired-dispatch project only. Sampling contains no HTTP results. '
                         'Before live runs, verify token binding and isolate each realm.\n')
    with zipfile.ZipFile(output) as archive:
        bad = archive.testzip()
        if bad:
            raise ValueError('ranked archive CRC failure: ' + bad)
    return summary


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--batch-zip', action='append', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    args = p.parse_args()
    if len(args.batch_zip) != 6:
        p.error('pass exactly six --batch-zip arguments')
    result = write_result(args.batch_zip, args.out)
    print('KEYCLOAK_RANKED_ENSEMBLE_READY', json.dumps(result), args.out)


if __name__ == '__main__':
    main()
