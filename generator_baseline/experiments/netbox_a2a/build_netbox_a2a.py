#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, os, subprocess, sys
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]

def sha(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for b in iter(lambda:f.read(1024*1024), b''): h.update(b)
    return h.hexdigest()

def run(cmd, env=None):
    subprocess.run(cmd, check=True, env=env)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--output', required=True)
    ap.add_argument('--seed', type=int, default=1)
    ap.add_argument('--instances-per-entity', type=int, default=5)
    ap.add_argument('--instances-per-action', type=int, default=7)
    a=ap.parse_args()
    out=Path(a.output).resolve(); out.mkdir(parents=True, exist_ok=True)
    spec=HERE/'spec'/'netbox_uc2_runtime_openapi.json'
    source_spec=ROOT/'resources'/'development_kit'/'examples'/'netbox'/'openapi.json'

    # V36 preserves the frozen V29 clean-room parity gate: do NOT enrich the task-scoped projection.
    # Validate that its operations/selected fields come from the bundled source
    # while its schemas contain no value-level semantic annotations.
    run([sys.executable,str(HERE/'validate_structural_projection.py'),
         '--source',str(source_spec),'--projection',str(spec)])

    env=os.environ.copy(); env['PYTHONPATH']=str(ROOT)
    run([sys.executable,'-m','openapi_to_sbt','generate','--openapi',str(spec),
         '--output',str(out),'--name','netbox_a2a','--base-url','http://127.0.0.1:5000',
         '--seed',str(a.seed),'--instances-per-entity',str(a.instances_per_entity),
         '--instances-per-action',str(a.instances_per_action),'--force'], env=env)
    run([sys.executable,'-m','openapi_to_sbt','validate','--openapi',str(spec),'--generated',str(out)], env=env)

    packaged_spec=out/'netbox_a2a_openapi.json'
    packaged_spec.write_bytes(spec.read_bytes())
    complex_stories=out/'complex_stories.netbox_a2a.js'
    run([sys.executable,str(HERE/'derive_complex_stories.py'),'--openapi',str(packaged_spec),
         '--report',str(out/'generation_report.json'),'--output',str(complex_stories)])

    # V36 release gate: prove that the frozen generic generator still materializes all five
    # required structural families at the intended HTTP depths.
    text=complex_stories.read_text(encoding='utf-8')
    required={
      'relation_second_reassignment':8,
      'parent_delete_multiple_children':6,
      'duplicate_required_string':2,
      'scalar_second_update':5,
      'deleted_parent_reference_reuse':5,
    }
    found={}
    import re
    for fam,steps in re.findall(r'V34_FAMILY family=([a-z_]+) steps=(\d+)',text):
        found[fam]=max(found.get(fam,0),int(steps))
    missing={k:v for k,v in required.items() if found.get(k,0)<v}
    if missing:
        raise SystemExit(f'V31 DEEP PREFIX VALIDATION FAILED: {missing}; found={found}')

    manifest={
      'schema_version':3,'artifact_version':'v36','experiment':'netbox_a2a',
      'api_projection_operation_count':12,'seed':a.seed,
      'instances_per_entity':a.instances_per_entity,'instances_per_action':a.instances_per_action,
      'source_openapi_sha256':sha(source_spec),'projection_openapi_sha256':sha(packaged_spec),
      'projection_policy':'12-op structural projection; no enum/example/default/description/pattern/length metadata in schemas',
      'files':{p.name:sha(p) for p in sorted(out.iterdir()) if p.is_file()},
      'oracle':'external HTTP evidence; official semantic score is sequence-local; hidden SUT activation and campaign-global evaluation are diagnostic only',
      'modes':{
        'basic':'interfaces + standard stories generated from the same structural 12-op OpenAPI projection',
        'complex':'interfaces + generic deep-prefix scenarios derived automatically from that same OpenAPI only; no analyst-authored scenario input or seeded-fault selector'
      }
    }
    (out/'a2a_build_manifest.json').write_text(json.dumps(manifest,indent=2,sort_keys=True)+'\n',encoding='utf-8')
    print(json.dumps(manifest,indent=2,sort_keys=True))
if __name__=='__main__': main()
