"""Generate Provengo stories and concurrency verifiers from any OpenAPI contract.

This command is an offline generator. Running a generated model against a
service requires its existing target-specific environment and credentials.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.cli import main as generate
from openapi_to_sbt.verification_cli import main as verify


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--openapi', required=True, type=Path)
    p.add_argument('--output', required=True, type=Path)
    p.add_argument('--name', required=True)
    p.add_argument('--base-url', required=True)
    p.add_argument('--seed', type=int, default=1)
    p.add_argument('--instances-per-entity', type=int, default=1)
    p.add_argument('--instances-per-action', type=int, default=1)
    p.add_argument('--story-profile', default='full')
    p.add_argument('--long-story-min-rounds', type=int, default=3)
    p.add_argument('--long-story-max-rounds', type=int, default=6)
    p.add_argument('--prefix-before-concurrency', type=int, default=0)
    p.add_argument('--max-field-pairs', type=int, default=6)
    p.add_argument('--max-concurrency-width', type=int, choices=(2, 3), default=3)
    p.add_argument('--json-disjoint', action='store_true')
    p.add_argument('--json-delete-bodies', action='store_true')
    p.add_argument('--optional-enum-dependency-branch', action='store_true')
    p.add_argument('--empirical-update-delete', action='store_true')
    p.add_argument('--cross-method-discovery', action='store_true')
    p.add_argument('--exclude-concurrency-operation', action='append', default=[])
    p.add_argument('--force', action='store_true')
    args = p.parse_args(argv)
    if args.instances_per_entity < (3 if args.empirical_update_delete else 1):
        p.error('empirical update/delete requires at least 3 instances per entity')
    if (args.instances_per_action < 1 or args.max_field_pairs < 1 or
            not 0 <= args.prefix_before_concurrency <= args.long_story_min_rounds <=
            args.long_story_max_rounds <= 16):
        p.error('invalid instance, field-pair, story length or prefix parameters')
    common = ['--openapi', str(args.openapi), '--output', str(args.output),
              '--name', args.name]
    stories = ['generate', *common, '--base-url', args.base_url,
               '--seed', str(args.seed), '--instances-per-entity', str(args.instances_per_entity),
               '--instances-per-action', str(args.instances_per_action),
               '--story-profile', args.story_profile,
               '--long-story-min-rounds', str(args.long_story_min_rounds),
               '--long-story-max-rounds', str(args.long_story_max_rounds)]
    if args.force: stories.append('--force')
    if args.json_delete_bodies: stories.append('--json-delete-bodies')
    if args.optional_enum_dependency_branch or args.empirical_update_delete:
        stories.append('--optional-enum-dependency-branch')
    if args.prefix_before_concurrency: stories.append('--emit-prefix-witnesses')
    code = generate(stories)
    if code != 0: return code
    checks = [*common, '--generation-report', str(args.output / 'generation_report.json'),
              '--max-field-pairs', str(args.max_field_pairs),
              '--max-concurrency-width', str(args.max_concurrency_width),
              '--prefix-before-concurrency', str(args.prefix_before_concurrency)]
    if args.json_disjoint: checks.append('--json-disjoint')
    if args.empirical_update_delete: checks.append('--empirical-update-delete')
    if args.cross_method_discovery: checks.append('--cross-method-discovery')
    for op in args.exclude_concurrency_operation:
        checks += ['--exclude-concurrency-operation', op]
    code = verify(checks)
    if code not in (0, 3): return code
    manifest = json.loads((args.output / f'verification-manifest.{args.name}.json').read_text())
    summary = {'schema_version': 1,
               'openapi_sha256': hashlib.sha256(args.openapi.read_bytes()).hexdigest(),
               'seed': args.seed,
               'parameters': {k: v for k, v in vars(args).items()
                              if k not in ('openapi', 'output', 'base_url', 'force')},
               'effective_optional_enum_dependency_branch': bool(
                   args.optional_enum_dependency_branch or args.empirical_update_delete),
               'verifier_counts': manifest['counts'],
               'runtime_ready': sum(bool(o.get('runtime', {}).get('ready'))
                                    for o in manifest['concurrency_oracles']),
               'status': 'COMPLETE' if code == 0 else 'PARTIAL_COVERAGE'}
    (args.output / 'generic_campaign.json').write_text(json.dumps(summary, indent=2,
                                             sort_keys=True) + '\n', encoding='utf-8')
    print('GENERIC_SBT_GENERATION_' + summary['status'] + ' output=' + str(args.output))
    return code


if __name__ == '__main__':
    raise SystemExit(main())
