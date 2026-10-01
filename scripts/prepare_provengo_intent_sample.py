#!/usr/bin/env python3
"""Generate a pure scheduling projection from a generated concurrency plan.

The projected model has no HTTP responses, oracle verdicts, or runtime successes.
It is strictly a dry-run study of Provengo choices; it cannot be run against a SUT.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess


def render(plan, instances=3):
    oracles = [o for o in plan['oracles'] if o.get('runtime', {}).get('ready')
               and o.get('kind') in ('same-field-one-successful-value-visible',
                                     'noop-versus-change', 'disjoint-put-serial-outcomes')]
    if not oracles:
        raise ValueError('no ready concrete concurrent oracle')
    if len({o['oracle_id'] for o in oracles}) != len(oracles):
        raise ValueError('duplicate oracle IDs')
    choices = ', '.join(json.dumps(o['oracle_id']) for o in oracles)
    metadata = {o['oracle_id']: {'kind':o['kind'], 'operation_id':o['operation_id'],
                                'path_template':o['path_template']} for o in oracles}
    program = '''// Scheduling projection derived from concurrency-plan JSON. No SUT calls.
// @provengo summon rtv
var sbtPlanOracles = ''' + json.dumps(metadata, sort_keys=True) + ''';
bthread("sample:OpenAPI-concurrency-plan", function() {
  var oracleId = select("oracle-id").from(''' + choices + ''');
  var instance = select("entity-instance").from(''' + ', '.join(map(str, range(1, instances + 1))) + ''');
  var rounds = select("prefix-rounds").from(8, 9, 10);
  var control = select("serial-control-order").from("AB", "BA");
  var planned = sbtPlanOracles[oracleId];
  var path = planned.path_template.replace("{realm}", "@{sbt_realm_" + instance + "}")
                  .replace("{user-id}", "@{sbt_user_id_" + instance + "}");
  sync({request:Event("SBT:PlanCreateIntent", {oracle_id:oracleId, instance:instance,
       binding:"runtime-location-header-or-body", outcome:"UNOBSERVED"})});
  for (var round = 1; round <= rounds; round++) {
    sync({request:Event("SBT:PlanPrefixIntent", {oracle_id:oracleId, instance:instance,
         operation_id:planned.operation_id, path:path, round:round,
         outcome:"UNOBSERVED"})});
  }
  sync({request:Event("SBT:PlanSerialControlsIntent", {oracle_id:oracleId,
       order:control, outcome:"UNOBSERVED"})});
  sync({request:Event("SBT:PlanConcurrencyIntent", {oracle_id:oracleId,
       kind:planned.kind, width:2, path:path, actual_overlap:"NOT_MEASURED"})});
});
'''
    return program, metadata


def prepare(plan_file, out, instances, exe):
    if out.exists():
        raise ValueError('output already exists')
    raw = plan_file.read_bytes()
    program, metadata = render(json.loads(raw), instances)
    out.mkdir(parents=True)
    project = out / 'provengo_project'
    with (out / 'provengo-create.log').open('w', encoding='utf-8') as log:
        result = subprocess.run([exe, '--batch-mode', 'create', str(project)],
                                stdout=log, stderr=subprocess.STDOUT, timeout=90)
    if result.returncode or not (project / 'config/provengo.yml').is_file():
        raise RuntimeError('provengo create failed')
    (project / 'spec/js/hello-world.js').unlink(missing_ok=True)
    (project / 'spec/js/sample-intents.js').write_text(program, encoding='utf-8')
    manifest = {'schema_version':1, 'source_plan_sha256':hashlib.sha256(raw).hexdigest(),
                'purpose':'SCHEDULING_PROJECTION_ONLY', 'ready_concrete_oracles':metadata,
                'instances_per_entity':instances,
                'limitations':['not generated executable test sources',
                               'runtime bindings use @{name} placeholders',
                               'no HTTP requests, server status, real overlap or oracle verdicts']}
    (out / 'sample-intent-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    return project


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--plan', required=True, type=Path)
    p.add_argument('--out', required=True, type=Path)
    p.add_argument('--instances-per-entity', type=int, default=3)
    args = p.parse_args()
    if not 1 <= args.instances_per_entity <= 8:
        p.error('instances-per-entity must be 1..8')
    exe = shutil.which('provengo')
    if not exe: p.error('provengo not on PATH')
    try: project = prepare(args.plan, args.out, args.instances_per_entity, exe)
    except (ValueError, OSError, RuntimeError, subprocess.TimeoutExpired) as exc: p.error(str(exc))
    print('SBT_INTENT_SAMPLE_PROJECT_READY', project)


if __name__ == '__main__':
    main()
