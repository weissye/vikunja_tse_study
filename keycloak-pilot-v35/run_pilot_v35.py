#!/usr/bin/env python3
"""Run one audited Provengo scenario with isolated generated Keycloak realms."""
import argparse
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

import zstandard as zstd

HERE = Path(__file__).resolve().parent


def access_token(base, user, password):
    body = urllib.parse.urlencode({'grant_type': 'password', 'client_id': 'admin-cli',
                                   'username': user, 'password': password}).encode()
    request = urllib.request.Request(base + '/realms/master/protocol/openid-connect/token',
                                     body, {'Content-Type': 'application/x-www-form-urlencoded'},
                                     method='POST')
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.load(response)['access_token']


def realm_status(base, realm, token, method='GET'):
    request = urllib.request.Request(base + '/admin/realms/' +
                                     urllib.parse.quote(realm, safe=''),
                                     headers={'Authorization': 'Bearer ' + token}, method=method)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            response.read()
            return response.status
    except urllib.error.HTTPError as error:
        code = error.code
        error.close()
        return code


def wait_relay(process):
    for _ in range(60):
        if process.poll() is not None:
            raise RuntimeError('HTTP interval relay exited during startup')
        try:
            with socket.create_connection(('127.0.0.1', 9938), timeout=.3):
                return
        except OSError:
            time.sleep(.1)
    raise RuntimeError('HTTP interval relay did not start')


def interval_audit(path):
    records = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
    pairs = [item for item in records if item.get('method') == 'RACE_PAIR']
    puts = [item for item in records if item.get('method') == 'PUT' and item.get('pair_id')]
    selected_ids = {item['pair_id'] for item in pairs}
    accepted_puts = [item for item in puts if item['pair_id'] in selected_ids]
    unexpected_rewrites = [item.get('request_normalization') for item in records
                           if item.get('request_normalization') and
                           item.get('request_normalization') !=
                           'keycloak_serial_client_description_refresh_v25']
    return {'race_dispatches': len(pairs), 'http_puts': len(puts),
            'retry_attempts': len(puts) // 2 - len(pairs),
            'overlapping_pairs': sum(bool(item['overlap']) for item in pairs),
            'non_2xx_puts': sum(not 200 <= item['status'] < 300 for item in puts),
            'unexpected_request_rewrites': unexpected_rewrites[:20],
            'all_pairs_measured': len(pairs) == 224 and len(accepted_puts) == 448}


def provengo_command(jar):
    if jar:
        if not jar.is_file():
            raise FileNotFoundError(jar)
        return ['java', '-jar', str(jar.resolve())]
    executable = shutil.which('provengo')
    if not executable:
        raise FileNotFoundError('Provengo executable not found; pass -ProvengoJar')
    suffix = Path(executable).suffix.lower()
    if os.name == 'nt' and suffix in ('.cmd', '.bat'):
        return [os.environ.get('ComSpec', 'cmd.exe'), '/d', '/c', executable]
    if os.name == 'nt' and suffix == '.ps1':
        return ['powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', executable]
    return [executable]



def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--jar', type=Path)
    parser.add_argument('--base-url', default='http://127.0.0.1:9928')
    parser.add_argument('--username', default='admin')
    args = parser.parse_args()
    provengo = provengo_command(args.jar)
    static_audit = json.loads((HERE / 'static-audit-v35.json').read_text())
    if static_audit['result'] != 'PASS_STATIC':
        raise RuntimeError('Static audit did not pass')
    manifest = json.loads((HERE / 'manifest-v35.json').read_text())
    for relative, key in (
        ('keycloak-stage2-openapi.json', 'source_openapi_sha256'),
        ('keycloak-stage2-observed-rules-v35.json', 'request_rules_sha256'),
        ('provengo_project/spec/js/stories.keycloak_stage2.js', 'generated_story_sha256'),
    ):
        if hashlib.sha256((HERE / relative).read_bytes()).hexdigest() != manifest[key]:
            raise RuntimeError('Pinned package file differs: ' + relative)
    compressed = HERE / 'sample.json.zst'
    digest = json.loads((HERE / 'scenario-digest-v35.json').read_text())
    if hashlib.sha256(compressed.read_bytes()).hexdigest() != digest['compressed_sha256']:
        raise RuntimeError('Compressed scenario SHA-256 mismatch')
    if digest['compressed_sha256'] != manifest['sample_sha256']:
        raise RuntimeError('Manifest and scenario digest differ')
    project = HERE / 'provengo_project'
    story = (project / 'spec/js/stories.keycloak_stage2.js').read_text()
    realms = sorted(set(re.findall(r'__args\.realm="(realm_[0-9]+)"', story)))
    if not realms:
        raise RuntimeError('No generated fixture realm names found')
    base = args.base_url.rstrip('/')
    password = os.environ.get('KC_STAGE2_ADMIN_PASSWORD') or getpass.getpass('Keycloak admin password: ')
    token = access_token(base, args.username, password)
    existing = {realm: realm_status(base, realm, token) for realm in realms}
    if any(status != 404 for status in existing.values()):
        raise RuntimeError('Generated fixture realm already exists; no run started')
    run = HERE / 'runs' / 'pilot-01'
    run.mkdir(parents=True, exist_ok=False)
    source = run / 'scenario.json'
    full_sha = hashlib.sha256()
    with compressed.open('rb') as raw, zstd.ZstdDecompressor().stream_reader(raw) as reader, \
            source.open('wb') as target:
        while chunk := reader.read(1 << 20):
            full_sha.update(chunk)
            target.write(chunk)
    if full_sha.hexdigest() != digest['full_sha256']:
        source.unlink()
        raise RuntimeError('Expanded scenario SHA-256 mismatch')
    relay_log = run / 'http-intervals.jsonl'
    env = dict(os.environ, KC_STAGE2_ADMIN_USER=args.username,
               KC_STAGE2_ADMIN_PASSWORD=password, KC_STAGE2_BASE_URL=base,
               KC_STAGE2_ACCESS_TOKEN=token)
    with (run / 'relay.stdout.txt').open('w') as relay_out, \
            (run / 'relay.stderr.txt').open('w') as relay_err:
        relay = subprocess.Popen([sys.executable, '-u', str(HERE / 'measure_keycloak_http_v35.py'),
                                  '--log', str(relay_log)],
                                 env=env, stdout=relay_out, stderr=relay_err)
        try:
            wait_relay(relay)
            with (run / 'provengo.log').open('w') as log:
                try:
                    result = subprocess.run(provengo + ['--batch-mode', 'run', '--run-source',
                        str(source), '--run-id', '1', '--output-file',
                        str(run / 'provengo-result.json'), str(project)],
                        stdout=log, stderr=subprocess.STDOUT, env=env, timeout=7200)
                    exit_code = result.returncode
                except subprocess.TimeoutExpired:
                    exit_code = 124
        finally:
            relay.terminate()
            try:
                relay.wait(timeout=10)
            except subprocess.TimeoutExpired:
                relay.kill()
                relay.wait()
    measured = interval_audit(relay_log) if relay_log.is_file() else {'all_pairs_measured': False}
    token = access_token(base, args.username, password)
    cleanup = {realm: realm_status(base, realm, token, 'DELETE')
               for realm in realms if realm_status(base, realm, token) == 200}
    report = {'provengo_exit': exit_code, 'interval_audit': measured, 'cleanup': cleanup}
    (run / 'pilot-summary-v35.json').write_text(json.dumps(report, indent=2) + '\n')
    if all(status == 204 for status in cleanup.values()):
        source.unlink()
    passed = (exit_code == 0 and measured['all_pairs_measured'] and
              measured['overlapping_pairs'] == 224 and measured['non_2xx_puts'] == 0 and
              not measured['unexpected_request_rewrites'] and
              all(status == 204 for status in cleanup.values()))
    print(json.dumps({'result': 'PASS' if passed else 'INCOMPLETE', **report}, indent=2))
    if not passed:
        raise RuntimeError('Pilot incomplete; logs and compact scenario retained')


if __name__ == '__main__':
    main()
