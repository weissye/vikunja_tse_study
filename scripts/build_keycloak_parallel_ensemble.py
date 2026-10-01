#!/usr/bin/env python3
"""Generate a fresh paired-dispatch model, sample 300, and freeze a 15-run ensemble."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import zipfile

from select_keycloak_parallel_ensemble import scenario_bytes, score, write_result


GIB = 1024 ** 3


def digest(path):
    result = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            result.update(chunk)
    return result.hexdigest()


def audit_batch(path):
    families, instances, hashes = Counter(), Counter(), set()
    count = 0
    with path.open('rb') as source:
        for raw in scenario_bytes(source):
            metrics = score(json.loads(raw))
            count += 1
            families[metrics['family']] += 1
            instances[str(metrics['instance'])] += 1
            hashes.add(hashlib.sha256(raw).hexdigest())
    if count != 50:
        raise ValueError(f'{path} has {count} scenarios; expected 50')
    return {'scenarios': count, 'complete_rest_schedules': count,
            'distinct_exact_scenarios': len(hashes),
            'families': dict(families), 'instances': dict(instances),
            'paired_dispatch_required': True, 'http_executed': False,
            'oracle_verdicts': 'NOT_EVALUATED'}


def build(args):
    if args.out.exists():
        raise FileExistsError('Output exists; refusing to overwrite: ' + str(args.out))
    provengo = shutil.which('provengo')
    if not provengo:
        raise RuntimeError('Provengo executable is not on PATH')
    if shutil.disk_usage(args.out.parent).free < 4 * GIB:
        raise RuntimeError('Less than 4 GiB free before sampling')
    args.out.mkdir()
    manifest = {'schema_version': 1, 'plan_sha256': digest(args.plan),
                'controls_sha256': digest(args.controls), 'batch_archives': [],
                'result': 'INCOMPLETE'}
    manifest_path = args.out/'sampling-manifest.json'
    model = args.out/'model'
    preparation = subprocess.run([
        sys.executable, str(Path(__file__).with_name('prepare_runtime_bound_sample.py')),
        '--plan', str(args.plan), '--controls', str(args.controls),
        '--out', str(model), '--prefix-rounds', '8', '--instances-per-entity', '3'],
        capture_output=True, text=True, timeout=120)
    if preparation.returncode:
        raise RuntimeError('Model preparation failed; inspect inputs and Provengo install')
    project = model/'provengo_project'
    generated = project/'spec/js/runtime-bound.generated.js'
    source = generated.read_text(encoding='utf-8')
    if '/__sbt_race' not in source or source.count('select("prefix-field:') != 24:
        raise RuntimeError('Generated project lacks paired dispatch or prefix field choices')
    manifest['model_sha256'] = digest(generated)
    manifest_path.write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')

    batches = []
    for number in range(1, 7):
        if shutil.disk_usage(args.out).free < 4 * GIB:
            raise RuntimeError('Less than 4 GiB free before batch '+str(number))
        raw = args.out/f'batch-{number}-samples-50.json'
        archive_path = args.out/f'batch-{number}-samples-50.zip'
        with (args.out/f'batch-{number}-sampling.log').open('w', encoding='utf-8') as log:
            try:
                process = subprocess.run([
                    provengo, '--batch-mode', 'sample', '--overwrite',
                    '--size', '50', '-m', '250', '-o', str(raw), str(project)],
                    stdout=log, stderr=subprocess.STDOUT, timeout=args.timeout_seconds)
            except subprocess.TimeoutExpired as error:
                raw.unlink(missing_ok=True)
                raise RuntimeError(f'batch {number} sampling timed out') from error
        if process.returncode:
            raw.unlink(missing_ok=True)
            raise RuntimeError(f'batch {number} sampling failed; inspect sampling.log')
        try:
            audit = audit_batch(raw)
            raw_hash = digest(raw)
            with zipfile.ZipFile(archive_path, 'x', zipfile.ZIP_DEFLATED,
                                 compresslevel=6, allowZip64=True) as archive:
                archive.write(raw, 'samples-50.json')
                archive.writestr('audit-50.json', json.dumps(audit, indent=2)+'\n')
            with zipfile.ZipFile(archive_path) as archive:
                if archive.getinfo('samples-50.json').file_size == 0 or archive.testzip():
                    raise RuntimeError('Invalid batch archive')
        except Exception:
            raw.unlink(missing_ok=True)
            archive_path.unlink(missing_ok=True)
            raise
        # Verified compressed source survives; discard only its raw duplicate.
        raw.unlink()
        batches.append(archive_path)
        manifest['batch_archives'].append({
            'file': archive_path.name, 'sha256': digest(archive_path),
            'uncompressed_sha256': raw_hash, 'audit': audit})
        manifest_path.write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
        print('SAMPLED_BATCH', number, 'of 6', 'complete', audit['scenarios'],
              'free_gib', round(shutil.disk_usage(args.out).free/GIB, 2), flush=True)

    selected_zip = args.out/'parallel-ensemble-15.zip'
    summary = write_result(batches, selected_zip)
    with zipfile.ZipFile(selected_zip) as archive:
        with archive.open('ensemble-15.json') as source, \
             (args.out/'ensemble-15.json').open('wb') as target:
            shutil.copyfileobj(source, target, length=1024*1024)
        ranking = json.loads(archive.read('ranking-report.json'))
    ensemble = ranking['ensemble']
    audit = {'schema_version': 1, 'scenarios': len(ensemble),
             'complete_rest_schedules': len(ensemble),
             'families': dict(Counter(item['family'] for item in ensemble)),
             'instances': dict(Counter(str(item['instance']) for item in ensemble)),
             'paired_dispatch_required': True, 'http_executed': False,
             'actual_overlap': 'NOT_MEASURED', 'oracle_verdicts': 'NOT_EVALUATED'}
    (args.out/'ensemble-15-audit.json').write_text(
        json.dumps(audit, indent=2)+'\n', encoding='utf-8')
    if audit['scenarios'] != 15 or len(audit['families']) != 3:
        raise RuntimeError('Selected ensemble failed coverage gate')
    manifest.update({'result': 'ENSEMBLE_15_READY', 'selection': summary,
                     'ensemble_json_sha256': digest(args.out/'ensemble-15.json'),
                     'ensemble_zip_sha256': digest(selected_zip), 'audit': audit})
    manifest_path.write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
    print('KEYCLOAK_PARALLEL_ENSEMBLE_15_READY', args.out,
          'sha256', manifest['ensemble_json_sha256'], flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan', required=True, type=Path)
    parser.add_argument('--controls', required=True, type=Path)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--timeout-seconds', type=int, default=1800)
    args = parser.parse_args()
    if not args.plan.is_file() or not args.controls.is_file():
        parser.error('Plan and controls files are required')
    build(args)


if __name__ == '__main__':
    main()
