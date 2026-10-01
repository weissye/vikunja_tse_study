#!/usr/bin/env python3
"""Fail-fast live acceptance probe for an already selected Keycloak trace."""
import argparse
import getpass
import hashlib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import time
import urllib.parse
from datetime import datetime

import zstandard as zstd
from run_15 import HERE, realm_status, token, wait_relay


def stop(process):
    if process.poll() is not None:
        return
    if os.name == 'nt':
        subprocess.run(['taskkill', '/F', '/T', '/PID', str(process.pid)],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()


def family_for(path, families):
    for family in families:
        pattern = re.sub(r'\\\{[^}]+\\\}', r'[^/]+', re.escape('/' + family))
        if re.fullmatch(pattern, path):
            return family
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ordinal', type=int, default=1)
    parser.add_argument('--base-url', default='http://127.0.0.1:9928')
    parser.add_argument('--username', default='admin')
    parser.add_argument('--timeout-seconds', type=int, default=1800)
    args = parser.parse_args()
    if not 1 <= args.ordinal <= 15:
        parser.error('ordinal must be 1..15')
    selection = json.loads((HERE / 'selection.json').read_text())
    compressed = HERE / f'scenarios/run-{args.ordinal:02d}.json.zst'
    audit = json.loads((HERE / f'audits/run-{args.ordinal:02d}.json').read_text())
    if hashlib.sha256(compressed.read_bytes()).hexdigest() != audit['compressed_sha256']:
        raise RuntimeError('selected scenario checksum mismatch')
    story = (HERE / 'provengo_project/spec/js/stories.keycloak_stage2.js').read_text()
    realms = sorted(set(re.findall(r'__args\.realm="(realm_[0-9]+)"', story)))
    families = sorted(set(re.findall(r'P[12]:(admin/realms[^:"]+|admin/realms):[0-9]+', story)),
                      key=lambda name: (-name.count('/'), name))
    if not realms:
        raise RuntimeError('fixture realm inventory is empty')
    password = os.environ.get('KC_STAGE2_ADMIN_PASSWORD') or getpass.getpass('Keycloak admin password: ')
    base = args.base_url.rstrip('/')
    bearer = token(base, args.username, password)
    before = {realm: realm_status(base, realm, bearer) for realm in realms}
    if any(status != 404 for status in before.values()):
        raise RuntimeError(f'generated realm already exists; no probe started: {before}')
    output = HERE / 'runs' / 'keycloak-preflight' / (
        f'candidate-{selection["selected_numbers"][args.ordinal-1]:03d}-' +
        datetime.now().strftime('%Y%m%d-%H%M%S'))
    output.mkdir(parents=True, exist_ok=False)
    source = output / 'scenario.json'
    digest = hashlib.sha256()
    with compressed.open('rb') as raw, zstd.ZstdDecompressor().stream_reader(raw) as inp, source.open('wb') as dst:
        while block := inp.read(1 << 20):
            digest.update(block)
            dst.write(block)
    if digest.hexdigest() != audit['full_sha256']:
        raise RuntimeError('expanded scenario checksum mismatch')
    env = dict(os.environ, KC_STAGE2_ADMIN_USER=args.username,
               KC_STAGE2_ADMIN_PASSWORD=password, KC_STAGE2_BASE_URL=base,
               KC_STAGE2_ACCESS_TOKEN=bearer)
    executable = shutil.which('provengo')
    if not executable:
        raise FileNotFoundError('provengo command not found on PATH')
    log_path = output / 'http-intervals.jsonl'
    relay = None
    provengo = None
    failure = None
    validated = set()
    complete = False
    status = None
    with (output / 'relay.stdout.txt').open('w') as relay_out, \
         (output / 'relay.stderr.txt').open('w') as relay_err, \
         (output / 'provengo.log').open('w') as provengo_log:
        try:
            relay = subprocess.Popen([sys.executable, '-u', str(HERE / 'measure_keycloak_http.py'),
                                      '--log', str(log_path)], env=env,
                                     stdout=relay_out, stderr=relay_err)
            wait_relay(relay)
            provengo = subprocess.Popen([executable, '--batch-mode', 'run', '--run-source',
                                         str(source), '--run-id', '1', '--output-file',
                                         str(output / 'provengo-result.json'),
                                         str(HERE / 'provengo_project')], env=env,
                                        stdout=provengo_log, stderr=subprocess.STDOUT)
            deadline = time.monotonic() + args.timeout_seconds
            read_offset = 0
            provengo_offset = 0
            while provengo.poll() is None:
                if time.monotonic() > deadline:
                    failure = {'reason': 'TIMEOUT'}
                    break
                if log_path.is_file():
                    with log_path.open('r', encoding='utf-8') as http_log:
                        http_log.seek(read_offset)
                        complete_offset = read_offset
                        while line := http_log.readline():
                            if not line.endswith('\n'):
                                break
                            complete_offset = http_log.tell()
                            item = json.loads(line)
                            if item.get('method') == 'POST' and 200 <= item.get('status', 0) < 300:
                                family = family_for(item['path'], families)
                                if family:
                                    validated.add(family)
                            if item.get('status', 0) >= 400 and item.get('method') in ('POST','PUT','DELETE'):
                                failure = {'reason': 'HTTP_ERROR', 'method': item['method'],
                                           'path': item['path'], 'status': item['status'],
                                           'server_error': item.get('server_error', '')}
                                break
                            if len(validated) == len(families):
                                complete = True
                                break
                        read_offset = complete_offset
                provengo_log.flush()
                with (output / 'provengo.log').open('r', encoding='utf-8', errors='replace') as live_log:
                    live_log.seek(provengo_offset)
                    while line := live_log.readline():
                        if not line.endswith('\n'):
                            break
                        provengo_offset = live_log.tell()
                        if ' WARN ' in line and ('ERROR:' in line or 'FAIL:' in line):
                            failure = {'reason': 'PROVENGO_ERROR',
                                       'message': re.sub(r'Bearer [A-Za-z0-9._-]+',
                                                         'Bearer [REDACTED]', line.strip())}
                            break
                if failure or complete:
                    break
                time.sleep(.15)
            if failure or complete:
                stop(provengo)
            status = provengo.wait()
        finally:
            if provengo is not None:
                stop(provengo)
            if relay is not None:
                stop(relay)
    records = [json.loads(line) for line in log_path.read_text().splitlines()] if log_path.exists() else []
    if not failure or failure.get('reason') == 'PROVENGO_ERROR':
        http_error = next((item for item in records if item.get('status', 0) >= 400 and
                           item.get('method') in ('POST', 'PUT', 'DELETE')), None)
        if http_error:
            failure = {'reason': 'HTTP_ERROR', 'method': http_error['method'],
                       'path': http_error['path'], 'status': http_error['status'],
                       'server_error': http_error.get('server_error', '')}
    safe_lines = []
    selected_lines = []
    for line in (output / 'provengo.log').read_text(errors='replace').splitlines():
        if 'WARN ' in line or 'ERROR ' in line or 'Test Result:' in line:
            safe_lines.append(re.sub(r'Bearer [A-Za-z0-9._-]+', 'Bearer [REDACTED]', line))
        if 'Selected: [POST ' in line or 'Selected: [PUT ' in line or 'Selected: [DELETE ' in line:
            verb = re.search(r'Selected: \[(POST|PUT|DELETE) ', line)
            url = re.search(r'url:"([^"]+)"', line)
            expected = re.search(r'expectedResponseCodes:\[([^\]]+)\]', line)
            if verb and url:
                selected_lines.append({
                    'method': verb.group(1),
                    'path': urllib.parse.urlsplit(url.group(1)).path,
                    'expected': expected.group(1) if expected else None})
    report = {'ordinal':args.ordinal, 'candidate':selection['selected_numbers'][args.ordinal-1],
              'result': 'CREATE_PREFLIGHT_PASS' if complete and not failure else 'CREATE_PREFLIGHT_INCOMPLETE',
              'provengo_exit':status, 'first_http_failure':failure,
              'http_requests':len(records),
              'create_paths_seen':sorted(set(x['path'] for x in records if x['method']=='POST'
                                           and x['path'] != '/__sbt_race')),
              'race_pairs':sum(x['method']=='RACE_PAIR' for x in records),
              'create_families_validated': sorted(validated),
              'create_families_missing': sorted(set(families) - validated),
              'last_mutation_events_redacted': selected_lines[-4:],
              'safe_errors':safe_lines[:15]}
    bearer = token(base, args.username, password)
    created = [realm for realm in realms if realm_status(base, realm, bearer) == 200]
    report['generated_realms_found'] = created
    report['cleanup'] = {realm: realm_status(base, realm, bearer, 'DELETE') for realm in created}
    (output / 'preflight-report.json').write_text(json.dumps(report, indent=2) + '\n')
    if any(code != 204 for code in report['cleanup'].values()):
        raise RuntimeError(f'preflight cleanup incomplete; evidence preserved: {output}')
    bearer = token(base, args.username, password)
    remaining = {realm: realm_status(base, realm, bearer) for realm in realms}
    if any(code != 404 for code in remaining.values()):
        raise RuntimeError(f'preflight realm remains; evidence preserved: {output}: {remaining}')
    # The compressed, checksummed source remains in scenarios/. The expanded
    # copy is only needed while Provengo executes; keep small diagnostics.
    source.unlink()
    print(json.dumps({key: value for key,value in report.items() if key not in ('create_paths_seen','generated_realms_found')}, indent=2))
    print('PREFLIGHT_EVIDENCE', output)
    if failure or not complete:
        sys.exit(1)


if __name__ == '__main__':
    main()
