#!/usr/bin/env python3
"""Live, plan-driven Keycloak fixture and concurrency-adapter acceptance gate.

This runs the generated plan's three representative families. It does not
pretend that the generated Provengo stories have executed.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import socket
import sys
import threading
from types import SimpleNamespace
import urllib.parse
import urllib.request
import uuid

from run_keycloak_stage2_live_gate import request, check, read_json, extract_id, GateFailure

EXPECTED_SPEC = 'ba68e1c3842c11701ec64c5f3ba23387cf53963f8d16dd7c3d45da103b9421db'
TARGET = '/admin/realms/{realm}/users/{user-id}'
KINDS = ('same-field-one-successful-value-visible', 'noop-versus-change',
         'disjoint-put-serial-outcomes')


def oauth_failure(status, body):
    """Return only a small, fixed OAuth error code; never persist server text."""
    try:
        parsed = json.loads(body)
    except (ValueError, UnicodeDecodeError, TypeError):
        parsed = {}
    code = parsed.get('error') if isinstance(parsed, dict) else None
    allowed = {'invalid_grant', 'invalid_client', 'unauthorized_client',
               'access_denied', 'temporarily_unavailable', 'invalid_request'}
    safe_code = code if code in allowed else 'unclassified'
    return f'admin-token-http-{status}-{safe_code}'


def validate(args):
    if args.out.exists():
        raise GateFailure('output directory exists; preserve previous evidence')
    if not 1 <= args.prefix_rounds <= 16:
        raise GateFailure('prefix rounds must be 1..16')
    if hashlib.sha256(args.spec.read_bytes()).hexdigest() != EXPECTED_SPEC:
        raise GateFailure('OpenAPI hash changed')
    campaign = json.loads((args.campaign / 'campaign-preflight.json').read_text(encoding='utf-8'))
    if campaign.get('generator_version') != '0.26.18' or campaign.get('openapi_sha256') != EXPECTED_SPEC:
        raise GateFailure('campaign version or contract mismatch')
    gate = json.loads(args.gate.read_text(encoding='utf-8'))
    if (gate.get('runtime_status'), gate.get('runtime_verified_edges'), gate.get('openapi_sha256')) != (
            'LIVE_PREREQUISITES_VERIFIED', 1, EXPECTED_SPEC):
        raise GateFailure('independent live prerequisite evidence is missing')
    controls = json.loads(args.controls.read_text(encoding='utf-8'))
    if controls.get('openapi_sha256') != EXPECTED_SPEC or controls.get('verdict') != 'PASS':
        raise GateFailure('independent serial control evidence is missing')
    if hashlib.sha256(args.gate.read_bytes()).hexdigest() != campaign.get('gate_sha256') or (
        hashlib.sha256(args.controls.read_bytes()).hexdigest() != campaign.get('controls_sha256')):
        raise GateFailure('campaign and evidence bytes differ')
    plan = json.loads((args.campaign / 'verifiers/concurrency-plan.keycloak_stage2.json').read_text(encoding='utf-8'))
    chosen = {}
    for kind in KINDS:
        matching = [o for o in plan['oracles'] if o['kind'] == kind and o['runtime'].get('ready')
                    and o['path_template'] == TARGET and
                    [f['name'] for f in o['fields']] == (
                        ['firstName', 'lastName'] if kind == 'disjoint-put-serial-outcomes' else ['firstName'])]
        if len(matching) != 1:
            raise GateFailure('expected exactly one pinned generated oracle for ' + kind)
        chosen[kind] = matching[0]['oracle_id']
    return chosen


def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


def projection(body):
    return {field: body.get(field) for field in ('firstName', 'lastName')}


def judge(ab, ba, race, reads):
    """Conclude only from successful controls, true client overlap and stable GETs."""
    if ab['initial'] != ba['initial'] or ab['initial'] != race['initial']:
        return 'INCONCLUSIVE', 'initial-states-differ'
    if any(x['statuses'] != [204, 204] or x['read_statuses'] != [200, 200]
           for x in (ab, ba)):
        return 'INCONCLUSIVE', 'serial-control-failed'
    operations = race.get('operations', [])
    if len(operations) != 2 or any(x.get('error') or x.get('status') != 204 for x in operations):
        return 'INCONCLUSIVE', 'concurrent-write-failed'
    if not race.get('overlap_observed'):
        return 'INCONCLUSIVE', 'no-client-interval-overlap'
    if len(reads) != 2 or any(x.get('status') != 200 for x in reads):
        return 'INCONCLUSIVE', 'post-join-read-failed'
    if reads[0]['fields'] != reads[1]['fields']:
        return 'INCONCLUSIVE', 'post-join-state-unstable'
    if reads[0]['fields'] in (ab['final'], ba['final']):
        return 'PASS', 'matches-observed-serial-order'
    return 'SEMANTIC_CANDIDATE', 'stable-state-outside-both-observed-serial-orders'


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--campaign', type=Path, required=True)
    p.add_argument('--spec', type=Path, required=True)
    p.add_argument('--gate', type=Path, required=True)
    p.add_argument('--controls', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--prefix-rounds', type=int, default=8)
    p.add_argument('--preflight-only', action='store_true')
    p.add_argument('--auth-only', action='store_true', help='validate local admin login; create no fixtures')
    args = p.parse_args()
    try:
        chosen = validate(args)
    except (GateFailure, ValueError, KeyError, FileNotFoundError) as exc:
        p.error(str(exc))
    if args.preflight_only:
        print('KEYCLOAK_PLAN_LIVE_PREFLIGHT', json.dumps(chosen, sort_keys=True), 'runtime=NOT_RUN')
        return 0
    pwd = os.environ.get('KC_STAGE2_ADMIN_PASSWORD')
    supplied_token = os.environ.get('KC_STAGE2_ACCESS_TOKEN')
    if bool(pwd) == bool(supplied_token):
        p.error('set exactly one of KC_STAGE2_ADMIN_PASSWORD and KC_STAGE2_ACCESS_TOKEN; keep it out of logs')
    username = os.environ.get('KC_STAGE2_ADMIN_USERNAME', 'admin')
    args.out.mkdir(parents=True, exist_ok=False)
    result = {'schema_version': 1, 'basis': 'generated OpenAPI plan plus observed fixture evidence',
              'provengo_executed': False, 'runtime': 'INCOMPLETE', 'oracles': chosen, 'cases': []}
    def persist():
        (args.out / 'result.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    persist()
    servers, threads = [], []
    try:
        from openapi_to_sbt.trace_proxy import build_server as proxy_server
        from openapi_to_sbt.concurrency_adapter import build_server as adapter_server
        base = 'http://127.0.0.1:9928'
        status, _, body = request(base, '/realms/master/.well-known/openid-configuration')
        check(status, {200}, 'discovery')
        if read_json(body, 'discovery').get('issuer') != base + '/realms/master':
            raise GateFailure('unexpected local issuer')
        if supplied_token:
            token = supplied_token
        else:
            status, _, body = request(base, '/realms/master/protocol/openid-connect/token', 'POST',
                                      form={'client_id': 'admin-cli', 'grant_type': 'password',
                                            'username': username, 'password': pwd})
            if status != 200:
                raise GateFailure(oauth_failure(status, body))
            token = read_json(body, 'admin token').get('access_token')
        if not isinstance(token, str) or not token:
            raise GateFailure('admin token missing')
        status, _, _ = request(base, '/admin/realms/master', token=token)
        check(status, {200}, 'admin permissions')
        result['auth'] = {'status': 'ADMIN_API_VERIFIED',
                          'mode': 'preissued-token' if supplied_token else 'password-grant'}
        persist()
        if args.auth_only:
            result['runtime'] = 'AUTH_ONLY_VERIFIED'
            persist()
            print('KEYCLOAK_PLAN_LIVE_AUTH_OK', 'report=', args.out / 'result.json')
            return 0
        proxy_port, adapter_port = free_port(), free_port()
        while adapter_port == proxy_port:
            adapter_port = free_port()
        env = 'SBT_KEYCLOAK_EPHEMERAL_TOKEN'
        os.environ[env] = token
        try:
            proxy = proxy_server(SimpleNamespace(listen_host='127.0.0.1', listen_port=proxy_port,
                target=base, api_prefix='', trace=str(args.out / 'http-trace.jsonl'),
                bearer_token_env=env, require_bearer_token=True,
                authorization_scheme='Bearer', timeout=20.0))
        finally:
            os.environ.pop(env, None)
            del token
        adapter = adapter_server(SimpleNamespace(listen_host='127.0.0.1', listen_port=adapter_port,
            upstream=f'http://127.0.0.1:{proxy_port}', epoch_log=str(args.out / 'epochs.jsonl'),
            max_width=2, openapi_path=None, timeout=25.0, quiescence_ms=150))
        servers = [proxy, adapter]
        threads = [threading.Thread(target=s.serve_forever, daemon=True) for s in servers]
        for t in threads:
            t.start()
        proxied = f'http://127.0.0.1:{proxy_port}'
        realm = 'fse-plan-' + uuid.uuid4().hex[:12]
        realm_path = '/admin/realms/' + urllib.parse.quote(realm, safe='')
        status, _, _ = request(proxied, '/admin/realms', 'POST', payload={'realm': realm, 'enabled': True})
        check(status, {201}, 'realm creation')
        status, _, body = request(proxied, realm_path)
        check(status, {200}, 'realm GET')
        if read_json(body, 'realm GET').get('realm') != realm:
            raise GateFailure('realm identity mismatch')
        result['realm_path'] = realm_path

        def read(path):
            status, _, body = request(proxied, path)
            return {'status': status, 'fields': projection(read_json(body, 'user GET')) if status == 200 else None}

        def put(path, payload):
            status, _, _ = request(proxied, path, 'PUT', payload=payload)
            return status

        for kind in KINDS:
            case = {'kind': kind, 'oracle_id': chosen[kind], 'prefix_rounds': args.prefix_rounds,
                    'fixtures': [], 'classification': 'INCOMPLETE'}
            result['cases'].append(case)
            paths, baselines = [], []
            for label in ('ab', 'ba', 'race'):
                username = 'fse-' + uuid.uuid4().hex[:12]
                status, headers, _ = request(proxied, realm_path + '/users', 'POST', payload={
                    'username': username, 'enabled': True, 'firstName': 'Initial', 'lastName': 'Pilot'})
                check(status, {201}, 'create ' + label)
                identifier = extract_id(headers, 'user')
                path = realm_path + '/users/' + urllib.parse.quote(identifier, safe='')
                status, _, body = request(proxied, path)
                check(status, {200}, 'created user GET')
                if read_json(body, 'created user').get('id') != identifier:
                    raise GateFailure('Location ID did not match user GET')
                paths.append(path)
                fixture = {'label': label, 'path': path, 'prefix': []}
                case['fixtures'].append(fixture)
                for n in range(args.prefix_rounds):
                    field, value = 'firstName', 'Prefix-' + str(n)
                    code = put(path, {field: value})
                    observed = read(path)
                    fixture['prefix'].append({'round': n+1, 'status': code, 'read': observed})
                    if code != 204 or observed['status'] != 200 or observed['fields'][field] != value:
                        raise GateFailure('prefix round failed: ' + label)
                baselines.append(read(path))
            if any(b['status'] != 200 for b in baselines):
                raise GateFailure('baseline read failed')
            if kind == KINDS[0]:
                bodies = [{'firstName': 'Value-A'}, {'firstName': 'Value-B'}]
            elif kind == KINDS[1]:
                bodies = [{'firstName': baselines[0]['fields']['firstName']}, {'firstName': 'Changed'}]
            else:
                bodies = [{'firstName': 'ChangedFirst'}, {'lastName': 'ChangedLast'}]
            if any(b['fields'] != baselines[0]['fields'] for b in baselines):
                raise GateFailure('fresh instances do not have equal prefix state')
            controls = []
            for path, order, baseline in zip(paths[:2], ((0, 1), (1, 0)), baselines[:2]):
                record = {'initial': baseline['fields'], 'statuses': [], 'read_statuses': [],
                          'after_each': []}
                for ix in order:
                    record['statuses'].append(put(path, bodies[ix]))
                    observation = read(path)
                    record['read_statuses'].append(observation['status'])
                    record['after_each'].append(observation['fields'])
                record['final'] = record['after_each'][-1]
                controls.append(record)
            epoch_id = 'generated-epoch-' + uuid.uuid4().hex[:12]
            ops = [{'operation_id': epoch_id + '-op-' + str(i), 'method': 'PUT',
                    'path': paths[2], 'body': body, 'headers': {'Content-Type': 'application/json'}}
                   for i, body in enumerate(bodies)]
            payload = json.dumps({'epoch_id': epoch_id, 'scenario': chosen[kind],
                                  'operations': ops}).encode('utf-8')
            with urllib.request.urlopen(urllib.request.Request(
                    f'http://127.0.0.1:{adapter_port}/epochs', data=payload, method='POST',
                    headers={'Content-Type': 'application/json'}), timeout=40) as response:
                race = json.load(response)
            race['initial'] = baselines[2]['fields']
            reads = [read(paths[2]), read(paths[2])]
            verdict, reason = judge(controls[0], controls[1], race, reads)
            case.update(controls={'ab': controls[0], 'ba': controls[1]}, race=race, reads=reads,
                        classification=verdict, reason=reason)
            persist()
            print('KEYCLOAK_PLAN_LIVE_CASE', kind, verdict, reason, 'overlap=', race.get('overlap_observed'))
        result['runtime'] = 'COMPLETED'
        persist()
        print('KEYCLOAK_PLAN_LIVE_COMPLETE', args.out)
        return 0
    except Exception as exc:
        result['error_type'] = type(exc).__name__
        result['error_message'] = str(exc)[:300]
        persist()
        print('KEYCLOAK_PLAN_LIVE_INCOMPLETE', type(exc).__name__, 'report=', args.out / 'result.json', file=sys.stderr)
        return 1
    finally:
        for server in servers:
            server.shutdown()
            server.server_close()
        for t in threads:
            t.join(timeout=3)


if __name__ == '__main__':
    raise SystemExit(main())
