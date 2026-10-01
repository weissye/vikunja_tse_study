#!/usr/bin/env python3
"""Isolated Keycloak parallel-CRUD runtime pilot (no automatic cleanup).

Copy this file to scripts/ in C:\\work\\temp\\vikunja_tse_study, then run:
    python .\\scripts\\run_keycloak_parallel_crud_pilot.py

The default smoke run is 1 logical process and 1 CRUD worker per entity.
After reviewing its local evidence, use --processes 2 --instances 8 for the
requested topology. Each invocation gets a new generated seed and output dir.
Neither a Provengo exit code nor an HTTP interval alone proves an oracle verdict.
"""

import argparse
from collections import Counter
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

KC = 'http://127.0.0.1:9928'
RELAY_PORT = 9938


def call(command, log_path, *, env=None, timeout=240):
    with log_path.open('w', encoding='utf-8') as stream:
        try:
            return subprocess.run(command, stdout=stream, stderr=subprocess.STDOUT,
                                  env=env, timeout=timeout, check=False).returncode
        except subprocess.TimeoutExpired:
            return 124


def get_token(username, password):
    values = urllib.parse.urlencode({
        'client_id': 'admin-cli', 'grant_type': 'password',
        'username': username, 'password': password,
    }).encode('utf-8')
    request = urllib.request.Request(
        KC + '/realms/master/protocol/openid-connect/token', values,
        {'Content-Type': 'application/x-www-form-urlencoded'}, method='POST')
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.load(response)['access_token']


def realm_status(realm, token):
    url = KC + '/admin/realms/' + urllib.parse.quote(realm, safe='')
    request = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + token})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            response.read()
            return response.status
    except urllib.error.HTTPError as error:
        status = error.code
        error.close()
        return status


def wait_relay(process):
    for _ in range(50):
        if process.poll() is not None:
            raise RuntimeError('HTTP relay stopped; inspect relay.stderr.txt')
        try:
            with socket.create_connection(('127.0.0.1', RELAY_PORT), timeout=0.2):
                return
        except OSError:
            time.sleep(0.1)
    raise RuntimeError('HTTP relay did not open 127.0.0.1:9938')


def stop_relay(process):
    if process and process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)


def interval_summary(path):
    records = []
    if path.exists():
        for line in path.read_text(encoding='utf-8').splitlines():
            if line.strip():
                records.append(json.loads(line))
    puts = [x for x in records if x.get('method') == 'PUT']
    # Only requests for the same resource provide a meaningful PUT race pair.
    overlaps = sum(
        a.get('path') == b.get('path') and
        max(a['started_ns'], b['started_ns']) < min(a['ended_ns'], b['ended_ns'])
        for i, a in enumerate(puts) for b in puts[i + 1:])
    by_method = Counter(x.get('method', '?') for x in records)
    by_status = Counter(str(x.get('status', '?')) for x in records)
    return {'request_count': len(records), 'by_method': dict(sorted(by_method.items())),
            'by_status': dict(sorted(by_status.items())),
            'same_resource_overlapping_put_pairs': overlaps,
            'oracle_verdicts': 'NOT_EVALUATED'}


def inspect_sample(path, expected_workers):
    """Reject symbolic traces that end before the generated CRUD protocol."""
    scenarios = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(scenarios, list) or len(scenarios) != 1 or not isinstance(scenarios[0], list):
        raise ValueError('expected exactly one sampled scenario as an event array')
    events = scenarios[0]
    if not all(isinstance(e, dict) for e in events):
        raise ValueError('sample includes non-event entries')
    outcomes = Counter()
    ready = set()
    steps = Counter()
    verified = Counter()
    binds = 0
    rest = Counter()
    for event in events:
        name = event.get('name')
        data = event.get('data')
        if not isinstance(data, dict):
            continue
        if name == 'SBT:WorkerFinished':
            outcomes[str(data.get('reason', '?'))] += 1
        elif name == 'SBT:InstanceReady':
            ready.add(data.get('owner'))
        elif name == 'SBT:CrudStep':
            steps[str(data.get('stage', '?'))] += 1
        elif name == 'SBT:CrudVerified' and data.get('ok') is True:
            verified[str(data.get('stage', '?'))] += 1
        elif name == 'SBT:BindParent':
            binds += 1
        if data.get('lib') == 'REST':
            rest[str(data.get('method', '?'))] += 1
    report = {'event_count': len(events), 'expected_workers': expected_workers,
              'ready_workers': len(ready), 'finish_reasons': dict(outcomes),
              'steps': dict(steps), 'verified': dict(verified),
              'parent_bindings': binds, 'symbolic_rest': dict(rest),
              'oracle_verdicts': 'NOT_EVALUATED'}
    report['result'] = ('SAMPLE_COMPLETE_INTENT' if
                        len(ready) == expected_workers and
                        outcomes.get('complete') == expected_workers and
                        sum(outcomes.values()) == expected_workers and
                        all(steps.get(stage, 0) >= expected_workers for stage in
                            ('readback', 'create', 'read')) and
                        all(verified.get(stage, 0) >= expected_workers for stage in
                            ('readback', 'create', 'read'))
                        else 'SAMPLE_INCOMPLETE_STOP')
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--processes', type=int, default=1)
    parser.add_argument('--instances', type=int, default=1)
    parser.add_argument('--sample-timeout', type=int, default=240)
    parser.add_argument('--run-timeout', type=int, default=360)
    parser.add_argument('--username', default='admin')
    args = parser.parse_args()
    if not 1 <= args.processes <= 8 or not 1 <= args.instances <= 8:
        parser.error('processes and instances must each be between 1 and 8')
    if args.sample_timeout < 1 or args.run_timeout < 1:
        parser.error('timeouts must be positive')
    root = Path(__file__).resolve().parent.parent
    openapi = root / 'reference/keycloak-stage2-openapi.json'
    baseline = root / 'generator_baseline/openapi_to_sbt/cli.py'
    relay_script = root / 'scripts/measure_keycloak_http.py'
    audit_script = root / 'scripts/audit_parallel_crud.py'
    for required in (openapi, baseline, relay_script, audit_script):
        if not required.is_file():
            parser.error('Missing ' + str(required) + '; copy this runner to the project scripts/ directory')
    provengo = shutil.which('provengo')
    if not provengo:
        parser.error('provengo executable is not on PATH')
    if shutil.disk_usage(root).free < 2 * (1024 ** 3):
        parser.error('Less than 2 GiB free on project disk; stopping before sampling')
    try:
        with urllib.request.urlopen(KC + '/realms/master/.well-known/openid-configuration', timeout=10) as r:
            if r.status != 200:
                raise RuntimeError('Keycloak metadata returned HTTP ' + str(r.status))
    except urllib.error.URLError as error:
        parser.error('Keycloak 127.0.0.1:9928 is not ready: ' + str(error))
    token = get_token(args.username, getpass.getpass('Local Keycloak admin password: '))
    env = os.environ.copy()
    env['PYTHONPATH'] = str(root / 'generator_baseline') + (
        os.pathsep + env['PYTHONPATH'] if env.get('PYTHONPATH') else '')
    # The token stays in this subprocess environment; neither config nor
    # the summary JSON stores it. Treat private Provengo logs as sensitive.
    env['KC_STAGE2_ACCESS_TOKEN'] = token
    seed = secrets.randbelow(2_000_000_000) + 1
    out = root / 'runs' / ('keycloak-parallel-crud-live-' + uuid.uuid4().hex)
    out.mkdir(parents=True, exist_ok=False)
    summary = {'schema_version': 1, 'result': 'INCOMPLETE',
               'processes': args.processes, 'instances_per_entity_per_process': args.instances,
               'seed': seed, 'source_sha256': hashlib.sha256(openapi.read_bytes()).hexdigest(),
               'generated_realms': [], 'realm_preflight': {}, 'realm_after': {},
               'sample_exit': None, 'sample_audit': None, 'provengo_exit': None,
               'interval': {'oracle_verdicts': 'NOT_EVALUATED'}}
    summary_path = out / 'pilot-summary.json'
    relay = None
    try:
        generated = out / 'generated'
        generated.mkdir()
        generate = [sys.executable, '-m', 'openapi_to_sbt', 'generate',
                    '--openapi', str(openapi), '--output', str(generated),
                    '--name', 'keycloak_stage2', '--base-url', 'http://127.0.0.1:9938',
                    '--seed', str(seed), '--instances-per-entity', str(args.instances),
                    '--logical-processes', str(args.processes),
                    '--story-profile', 'parallel-crud', '--auth-token-env', 'KC_STAGE2_ACCESS_TOKEN']
        if call(generate, out / 'generation.log', env=env, timeout=120):
            raise RuntimeError('Generation failed; inspect generation.log')
        stories = generated / 'stories.keycloak_stage2.js'
        interfaces = generated / 'interfaces.keycloak_stage2.js'
        audit = [sys.executable, str(audit_script), '--stories', str(stories),
                 '--graph', str(generated / 'dependency_graph.json'),
                 '--processes', str(args.processes), '--instances', str(args.instances)]
        if call(audit, out / 'topology-audit.log', env=env, timeout=60):
            raise RuntimeError('Topology audit failed; inspect topology-audit.log')
        validate = [sys.executable, '-m', 'openapi_to_sbt', 'validate',
                    '--openapi', str(openapi), '--generated', str(generated)]
        if call(validate, out / 'validation.json', env=env, timeout=120):
            raise RuntimeError('Static validation failed; inspect validation.json')
        if not json.loads((out / 'validation.json').read_text(encoding='utf-8')).get('ok'):
            raise RuntimeError('Static validation ok=false')
        # The generated root worker is the only entity allowed to create a
        # realm. Every generated realm must be absent before a live request.
        names = re.findall(r'^\s*__args\.realm\s*=\s*"(realm_[A-Za-z0-9_-]+)";',
                           stories.read_text(encoding='utf-8'), flags=re.MULTILINE)
        if len(names) != args.processes * args.instances or len(set(names)) != len(names):
            raise RuntimeError('Cannot establish unique generated root realm names; stopping')
        summary['generated_realms'] = names
        for name in names:
            status = realm_status(name, token)
            summary['realm_preflight'][name] = status
            if status != 404:
                raise RuntimeError('Realm preflight HTTP ' + str(status) + ' for ' + name +
                                   '; existing realm preserved, no live run')
        project = out / 'provengo_project'
        if call([provengo, '--batch-mode', 'create', str(project)],
                out / 'provengo-create.log', env=env, timeout=90):
            raise RuntimeError('Provengo create failed; inspect provengo-create.log')
        js_dir = project / 'spec/js'
        if not (project / 'config/provengo.yml').is_file() or not js_dir.is_dir():
            raise RuntimeError('Provengo project structure is incomplete')
        (js_dir / 'hello-world.js').unlink(missing_ok=True)
        shutil.copy2(stories, js_dir / stories.name)
        shutil.copy2(interfaces, js_dir / interfaces.name)
        sample = out / 'sample-1.json'
        cmd = [provengo, '--batch-mode', 'sample', '--overwrite', '--size', '1',
               '-m', '1500', '-o', str(sample), str(project)]
        summary['sample_exit'] = call(cmd, out / 'private-sampling.log', env=env,
                                      timeout=args.sample_timeout)
        if summary['sample_exit'] or not sample.is_file() or not sample.stat().st_size:
            raise RuntimeError('Sampling failed or timed out; inspect private-sampling.log')
        summary['sample_audit'] = inspect_sample(sample, 25 * args.processes * args.instances)
        (out / 'sample-audit.json').write_text(
            json.dumps(summary['sample_audit'], indent=2, sort_keys=True) + '\n', encoding='utf-8')
        if summary['sample_audit']['result'] != 'SAMPLE_COMPLETE_INTENT':
            raise RuntimeError('Sample omits full CRUD/verification; inspect sample-audit.json. '
                               'Live requests were NOT started')
        # Preflight again immediately before starting the network relay.
        for name in names:
            if realm_status(name, token) != 404:
                raise RuntimeError('Realm appeared after sampling: ' + name + '; no live run')
        relay_log = out / 'http-intervals.jsonl'
        with (out / 'relay.stdout.txt').open('w', encoding='utf-8') as stdout, \
             (out / 'relay.stderr.txt').open('w', encoding='utf-8') as stderr:
            relay = subprocess.Popen([sys.executable, '-u', str(relay_script),
                                      '--log', str(relay_log)], stdout=stdout, stderr=stderr)
            try:
                wait_relay(relay)
                command = [provengo, '--batch-mode', 'run', '--run-source', str(sample),
                           '--run-id', '1', '--output-file', str(out / 'private-live-run.json'),
                           str(project)]
                summary['provengo_exit'] = call(command, out / 'private-provengo.log',
                                                env=env, timeout=args.run_timeout)
            finally:
                stop_relay(relay)
                relay = None
        summary['interval'] = interval_summary(relay_log)
        for name in names:
            summary['realm_after'][name] = realm_status(name, token)
        # A zero exit with HTTP events is only a live smoke, not 25 complete
        # CRUD lifecycles, not a semantic oracle, and not proof of overlap.
        if summary['provengo_exit'] == 0 and summary['interval']['request_count']:
            summary['result'] = 'RUNTIME_SMOKE_EXECUTED_NOT_ORACLE_VERIFIED'
        else:
            raise RuntimeError('Run incomplete; inspect private-provengo.log and interval')
    except Exception as error:
        summary['error'] = str(error)
        print('PILOT_INCOMPLETE', str(error), file=sys.stderr)
        return_code = 1
    else:
        return_code = 0
    finally:
        stop_relay(relay)
        env.pop('KC_STAGE2_ACCESS_TOKEN', None)
        summary_path.write_text(json.dumps(summary, indent=2, sort_keys=True) + '\n',
                                encoding='utf-8')
        print('OUTPUT=' + str(out))
        print('RESULT=' + summary['result'])
        print('SUMMARY=' + str(summary_path))
        print('Generated realms are never cleaned automatically; inspect realm_after before cleanup.')
    return return_code


if __name__ == '__main__':
    sys.exit(main())
