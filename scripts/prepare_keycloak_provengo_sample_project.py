#!/usr/bin/env python3
"""Stage the generated Keycloak OpenAPI model in a new Provengo project for sampling.

No server requests or runtime observations occur in this script.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

MODEL = (('generated', 'interfaces.keycloak_stage2.js'),
         ('generated', 'stories.keycloak_stage2.js'),
         ('verifiers', 'verification.keycloak_stage2.js'))


def prepare(campaign, output, executable):
    missing = [folder+'/'+name for folder,name in MODEL if not (campaign/folder/name).is_file()]
    if missing:
        raise ValueError('missing generated Keycloak source: '+', '.join(missing))
    if output.exists():
        raise ValueError('output already exists; choose a new directory')
    project = output/'provengo_project'
    output.mkdir(parents=True)
    with (output/'provengo-create.log').open('w', encoding='utf-8') as log:
        completed = subprocess.run([executable,'--batch-mode','create',str(project)],
                                   stdout=log,stderr=subprocess.STDOUT,timeout=90)
    if completed.returncode or not (project/'config/provengo.yml').is_file():
        raise RuntimeError('provengo create failed; inspect provengo-create.log')
    js = project/'spec/js'
    (js/'hello-world.js').unlink(missing_ok=True)
    checksums = {}
    for folder,name in MODEL:
        src = campaign/folder/name
        shutil.copy2(src,js/name)
        checksums[name] = hashlib.sha256(src.read_bytes()).hexdigest()
    manifest = {
        'schema_version': 1,
        'purpose': 'OpenAPI-generated model sampling and ensemble optimization',
        'campaign': str(campaign.resolve()),
        'provengo_project': str(project.resolve()),
        'generated_source_sha256': checksums,
        'status': 'PROJECT_CREATED_NOT_SAMPLED',
        'runtime_status': 'NOT_RUN',
        'oracle_verdicts': 'NOT_EVALUATED',
        'limitation': ('Generated stories use response-dependent bindings; if sample reaches '
                       'no concurrency or fails, preserve its raw output and repair the '
                       'model for offline exploration. This staging step does not '
                       'establish runtime readiness or prepare authenticated fixtures.'),
    }
    (output/'sampling-project-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    return manifest


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--campaign',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    args = p.parse_args(argv)
    exe = shutil.which('provengo')
    if not exe:
        p.error('provengo executable not found on PATH')
    try:
        manifest = prepare(args.campaign,args.out,exe)
    except (OSError,ValueError,RuntimeError,subprocess.TimeoutExpired) as exc:
        print('KEYCLOAK_SAMPLE_PROJECT_INCOMPLETE',str(exc),file=sys.stderr)
        return 2
    print('KEYCLOAK_SAMPLE_PROJECT_READY', manifest['provengo_project'])
    return 0


if __name__ == '__main__':
    sys.exit(main())
