"""Static compatibility gate against the previous tree overlay (no HTTP)."""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(package, args, output):
    env = dict(os.environ, PYTHONPATH=str(package))
    result = subprocess.run([sys.executable, '-m', *args], env=env,
                            capture_output=True, text=True, timeout=240)
    if result.returncode not in (0, 3):
        raise RuntimeError('Generation failed; ' + result.stderr[-450:])
    return output


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    p.add_argument('--baseline-zip', type=Path, required=True,
                   help='Previous immich_generator_verifier_profiles_rc1_tree_overlay.zip')
    p.add_argument('--article-zip', type=Path, required=True,
                   help='Original four-system v35_b4 archive')
    p.add_argument('--vikunja-spec', type=Path,
                   help='Pinned Vikunja contract; omission leaves its gate unverified')
    p.add_argument('--report', type=Path, required=True)
    args = p.parse_args()
    root = args.root.resolve()
    specs = {'Gitea': root/'model/gitea/gitea-1.27.3-swagger.json',
             'Immich': root/'model/immich/immich-v3.2.0-openapi.json'}
    if args.vikunja_spec:
        specs['Vikunja'] = args.vikunja_spec.resolve()
    if any(not x.is_file() for x in specs.values()):
        raise SystemExit('Missing spec: ' + ', '.join(k for k,v in specs.items() if not v.is_file()))
    with tempfile.TemporaryDirectory(prefix='sbt-compat-') as temporary:
        temp = Path(temporary)
        with zipfile.ZipFile(args.article_zip) as z:
            for name in ('library','garage','pharmacy','netbox'):
                candidates = [n for n in z.namelist() if n.endswith('/examples/'+name+'/openapi.json')]
                if len(candidates) != 1:
                    raise SystemExit('Article spec missing or ambiguous: '+name)
                path = temp / (name+'.json')
                path.write_bytes(z.read(candidates[0]))
                specs[name.capitalize()] = path
        old = temp/'old'; shutil.copytree(root/'generator_baseline', old)
        with zipfile.ZipFile(args.baseline_zip) as z:
            for name in z.namelist():
                if not name.startswith('generator_baseline/') or not name.endswith('.py'):
                    continue
                relative = Path(name).relative_to('generator_baseline')
                target = old/relative; target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(z.read(name))
        results = {}
        for name, spec in specs.items():
            generated = {}
            for generation, package in (('previous',old),('current',root/'generator_baseline')):
                out = temp/name/generation; out.mkdir(parents=True)
                base = ['openapi_to_sbt', 'generate', '--openapi', str(spec),
                        '--output', str(out), '--name', 'compat',
                        '--base-url','http://127.0.0.1:8080/api', '--seed','131',
                        '--story-profile','long-interleaving','--instances-per-entity','2',
                        '--instances-per-action','1']
                run(package, base, out)
                run(package, ['openapi_to_sbt.verification_cli','--openapi',str(spec),
                              '--output',str(out),'--name','compat','--max-field-pairs','4'], out)
                generated[generation] = {file:sha(out/file) for file in (
                    'interfaces.compat.js','stories.compat.js',
                    'verification.compat.js','verification-manifest.compat.json')}
            matched = {file:generated['previous'][file]==generated['current'][file]
                       for file in generated['current']}
            results[name]={'openapi_sha256':sha(spec),'default_bytes_unchanged':matched}
            print(name, 'PASS' if all(matched.values()) else 'FAIL')
        args.report.parent.mkdir(parents=True,exist_ok=True)
        args.report.write_text(json.dumps({'mode':'static-no-sut', 'results':results,
            'vikunja_status':'TESTED' if 'Vikunja' in results else 'NOT_TESTED_MISSING_PINNED_SPEC'},indent=2)+'\n')
        if not all(all(x['default_bytes_unchanged'].values()) for x in results.values()):
            return 1
        return 0 if 'Vikunja' in results else 4


if __name__ == '__main__':
    raise SystemExit(main())
