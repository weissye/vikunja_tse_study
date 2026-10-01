#!/usr/bin/env python3
"""Generate a bounded OpenAPI/Provengo campaign from verified runtime bindings."""
import argparse
import hashlib
import json
from pathlib import Path
import sys

from openapi_to_sbt import __version__
from openapi_to_sbt.cli import main as generate_main
from openapi_to_sbt.verification_cli import main as verify_main


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--spec', required=True, type=Path)
    ap.add_argument('--gate', required=True, type=Path)
    ap.add_argument('--controls', required=True, type=Path)
    ap.add_argument('--out', required=True, type=Path)
    ap.add_argument('--base-url', default='http://127.0.0.1:9928')
    ap.add_argument('--seed', type=int, default=20261902)
    ap.add_argument('--prefix-rounds', type=int, default=8)
    ap.add_argument('--instances-per-entity', type=int, default=3)
    args = ap.parse_args()
    if __version__ != '0.26.19':
        ap.error('Expected generator 0.26.19, found ' + __version__)
    if args.out.exists() and any(args.out.iterdir()):
        ap.error('Output directory already has content; keep prior evidence')
    if not 1 <= args.prefix_rounds <= 16 or not 3 <= args.instances_per_entity <= 8:
        ap.error('Require prefix rounds 1..16 and at least three instances per entity')
    if args.base_url.rstrip('/') != 'http://127.0.0.1:9928':
        ap.error('This research pilot only accepts the isolated Keycloak loopback endpoint')
    controls = json.loads(args.controls.read_text(encoding='utf-8'))
    sha = hashlib.sha256(args.spec.read_bytes()).hexdigest()
    if controls.get('openapi_sha256') != sha:
        ap.error('Controls do not match pinned OpenAPI')
    oracle = controls.get('generated_oracle_reference', '')
    if '::put:' not in oracle:
        ap.error('Controls lack an OpenAPI PUT oracle reference')
    operation = 'put:' + oracle.split('::put:', 1)[1]
    generated, verifiers = args.out / 'generated', args.out / 'verifiers'
    args.out.mkdir(parents=True, exist_ok=True)
    rc = generate_main(['generate', '--openapi', str(args.spec), '--output', str(generated),
        '--name', 'keycloak_stage2', '--base-url', args.base_url, '--seed', str(args.seed),
        '--instances-per-entity', str(args.instances_per_entity), '--instances-per-action', '1',
        '--story-profile', 'long-interleaving', '--long-story-min-rounds', str(args.prefix_rounds),
        '--long-story-max-rounds', str(args.prefix_rounds + 2), '--emit-prefix-witnesses'])
    if rc != 0:
        raise SystemExit('Base OpenAPI generation failed, exit=' + str(rc))
    rc = verify_main(['--openapi', str(args.spec), '--output', str(verifiers),
        '--name', 'keycloak_stage2', '--generation-report', str(generated / 'generation_report.json'),
        '--empirical-location-gate', str(args.gate), '--empirical-field-controls', str(args.controls),
        '--combined-campaign', '--prefix-before-concurrency', str(args.prefix_rounds),
        '--require-serial-controls', '--post-join-observation', '--max-field-pairs', '16',
        '--max-concurrency-width', '2', '--include-concurrency-operation', operation])
    if rc != 0:
        raise SystemExit('Verifier generation failed, exit=' + str(rc))
    plan = json.loads((verifiers / 'concurrency-plan.keycloak_stage2.json').read_text(encoding='utf-8'))
    families = {}
    for candidate in plan['oracles']:
        if candidate['runtime'].get('ready'):
            families[candidate['kind']] = families.get(candidate['kind'], 0) + 1
    composed = [candidate for candidate in plan['oracles']
                if candidate['kind'] in ('disjoint-put-serial-outcomes', 'noop-versus-change')]
    if len(composed) != 2 or any([x['name'] for x in candidate['fields']] != controls['fields'][:len(candidate['fields'])]
                                 for candidate in composed):
        raise SystemExit('Generated composed fields differ from serially verified fields')
    result = {'schema_version': 1, 'generator_version': __version__, 'openapi_sha256': sha,
              'basis': 'OpenAPI-derived oracle plus explicitly labeled empirical Location and field-control evidence',
              'runtime_status': 'NOT_RUN', 'generated': str(generated), 'verifiers': str(verifiers),
              'structurally_schedulable_plan_counts': families, 'target_operation': operation,
              'verified_composed_fields': controls['fields'],
              'gate_sha256': hashlib.sha256(args.gate.read_bytes()).hexdigest(),
              'controls_sha256': hashlib.sha256(args.controls.read_bytes()).hexdigest()}
    (args.out / 'campaign-preflight.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print('KEYCLOAK_EMPIRICAL_BINDING_PREFLIGHT', json.dumps(families, sort_keys=True),
          'runtime=NOT_RUN', 'report=', args.out / 'campaign-preflight.json')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
