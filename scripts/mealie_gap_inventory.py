#!/usr/bin/env python3
"""Classify frozen OpenAPI-generated prefix gaps without inventing runtime readiness."""
import argparse
import json
import zipfile
from pathlib import Path


def classify(archive: Path):
    with zipfile.ZipFile(archive) as z:
        plan_name = next(x for x in z.namelist() if x.endswith('/generated/concurrency-plan.mealie.json'))
        feasibility_name = next(x for x in z.namelist() if x.endswith('/prefix-feasibility.json'))
        plan = json.loads(z.read(plan_name))
        feasibility = json.loads(z.read(feasibility_name))
    oracles = {o['oracle_id']: o for o in plan['oracles']}
    out = []
    for oracle_id in feasibility['unmatched_oracles']:
        oracle = oracles[oracle_id]
        field = oracle['fields'][0]
        name = field['name']
        identity = name.lower() in {'id', 'itemid'} or '{' + name + '}' in oracle['path_template']
        reference = name.lower().endswith('id') and not identity
        if identity:
            status = 'IDENTITY_REBINDING_REQUIRED'
        elif reference:
            status = 'REFERENCE_PRODUCER_REQUIRED'
        else:
            status = 'TARGETED_SERIAL_AND_OVERLAP_PROBE'
        out.append({'oracle_id': oracle_id, 'operation_id': oracle['operation_id'],
                    'field': name, 'status': status, 'prefix_observed': False,
                    'claim': 'UNTESTED'})
    return {'schema_version': 1, 'source_sha256': plan['source']['sha256'],
            'ready_in_generator': feasibility['ready_oracles'],
            'matched_prefix': len(feasibility['matched_oracles']), 'unmatched': out,
            'policy': 'ready is static feasibility only; unobserved means no concurrency finding'}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--archive', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    report = classify(args.archive)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, sort_keys=True, indent=2) + '\n', encoding='utf-8')
    print('MEALIE_GAP_INVENTORY', {x['status']: sum(t['status'] == x['status'] for t in report['unmatched'])
                                    for x in report['unmatched']}, 'report=', args.output)


if __name__ == '__main__':
    main()
