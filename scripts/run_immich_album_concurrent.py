#!/usr/bin/env python3
"""Directed Immich album overlap diagnostic using the existing FSE proxy/barrier."""
import argparse
import csv
import hashlib
import json
import os
import random
import socket
import threading
import time
import urllib.error
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

from openapi_to_sbt.concurrency_adapter import build_server as build_adapter
from openapi_to_sbt.trace_proxy import build_server as build_proxy
from run_immich_album_serial import validate_spec, authenticate, SPEC_SHA


def reserve_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


def request(base, method, path, body=None, epoch=None, op_id=None):
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
    if epoch:
        headers['X-Provengo-Epoch-Id'] = epoch
        headers['X-Provengo-Operation-Id'] = op_id
    req = urllib.request.Request(base + path, method=method, headers=headers,
        data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req, timeout=65) as response:
            status, data = response.status, response.read()
    except urllib.error.HTTPError as exc:
        status, data = exc.code, exc.read()
    return {'status': status, 'body': json.loads(data) if data else None}


def witness(trace, epoch_id, resource_path):
    # The proxy writes after its response has reached the client.
    end = time.monotonic() + 3
    while True:
        rows = [json.loads(line) for line in trace.read_text(encoding='utf-8').splitlines() if line.strip()]
        writes = [r for r in rows if r.get('epoch_id') == epoch_id and r.get('method') == 'PATCH'
                  and r.get('model_path') == resource_path]
        reads = [r for r in rows if r.get('epoch_id') == epoch_id and
                 r.get('operation_id') == epoch_id + '-observe' and r.get('method') == 'GET']
        if (len(writes) == 2 and len(reads) == 1) or time.monotonic() >= end:
            break
        time.sleep(0.01)
    if len(writes) != 2 or len(reads) != 1:
        return False, 'epoch-http-witness-missing', writes, reads
    begin = min(datetime.fromisoformat(r['request_received_utc']) for r in writes)
    observed = datetime.fromisoformat(reads[0]['upstream_completed_utc'])
    interferers = [r for r in rows if r.get('model_path') == resource_path and
        r.get('method') in ('POST', 'PUT', 'PATCH', 'DELETE') and r.get('epoch_id') != epoch_id and
        datetime.fromisoformat(r['request_received_utc']) < observed and
        datetime.fromisoformat(r['upstream_completed_utc']) > begin]
    return not interferers, 'intervening-resource-write' if interferers else '', writes, reads


def proxy_overlap(writes):
    if len(writes) != 2:
        return False
    try:
        starts = [datetime.fromisoformat(r['upstream_started_utc']) for r in writes]
        ends = [datetime.fromisoformat(r['upstream_completed_utc']) for r in writes]
        return max(starts) < min(ends)
    except (KeyError, TypeError, ValueError):
        return False


def classify(epoch_result, final, trace_ok, trace_writes, trace_reads, controls_ok,
             name_value, description_value):
    if not controls_ok:
        return 'INCONCLUSIVE', 'serial-controls-failed'
    epoch = epoch_result.get('body') if epoch_result.get('status') == 200 else None
    ops = epoch.get('operations', []) if isinstance(epoch, dict) else []
    ids = {x.get('operation_id') for x in ops}
    connections = {x.get('connection_id') for x in ops}
    if not (isinstance(epoch, dict) and epoch.get('all_workers_ready_before_release') is True
            and epoch.get('overlap_observed') is True and len(ops) == 2 and len(ids) == 2
            and len(connections) == 2 and None not in connections and proxy_overlap(trace_writes)
            and all(x.get('status') == 200 and not x.get('error') for x in ops)
            and trace_ok and len(trace_writes) == 2 and len(trace_reads) == 1
            and all(x.get('status') == 200 for x in trace_writes)
            and final.get('status') == 200 and isinstance(final.get('body'), dict)):
        return 'INCONCLUSIVE', 'overlap-success-or-http-witness-missing'
    actual = final['body']
    if actual.get('albumName') != name_value or actual.get('description') != description_value:
        return 'SEMANTIC_CANDIDATE', 'two-successful-disjoint-patches-not-preserved'
    return 'PASS', 'both-concurrent-updates-persisted'


def get_expected(base, path, field, expected):
    result = request(base, 'GET', path)
    if (result['status'] != 200 or not isinstance(result['body'], dict)
            or result['body'].get(field) != expected):
        raise ValueError('serial observation failed for %s (HTTP %d)' % (field, result['status']))
    return result['body']


def one_trial(base, adapter, trace, trial, stamp, rounds, rng):
    name = 'immich-overlap-%s-%d' % (stamp, trial)
    steps = []
    created = request(base, 'POST', '/albums', {'albumName': name})
    if created['status'] != 201 or not isinstance(created['body'], dict) or not created['body'].get('id'):
        return {'trial': trial, 'verdict': 'INCONCLUSIVE', 'reason': 'album-create-failed',
                'create_status': created['status']}
    album_id = created['body']['id']
    path = '/albums/' + album_id
    try:
        state = get_expected(base, path, 'albumName', name)
        for i in range(rounds):
            for field, value in (('albumName', name + '-prefix-%d' % i),
                                 ('description', name + '-description-%d' % i)):
                patch = request(base, 'PATCH', path, {field: value})
                if patch['status'] != 200:
                    raise ValueError('prefix PATCH %s HTTP %d' % (field, patch['status']))
                state = get_expected(base, path, field, value)
                steps.append({'phase': 'prefix', 'round': i, 'field': field, 'status': patch['status']})
        baseline = {'albumName': state['albumName'], 'description': state['description']}
        target = {'albumName': name + '-A', 'description': name + '-B'}
        controls = []
        for field in ('albumName', 'description'):
            changed = request(base, 'PATCH', path, {field: target[field]})
            observed = get_expected(base, path, field, target[field]) if changed['status'] == 200 else None
            restored = request(base, 'PATCH', path, {field: baseline[field]})
            restored_value = get_expected(base, path, field, baseline[field]) if restored['status'] == 200 else None
            controls.append({'field': field, 'patch_status': changed['status'],
                             'observed': observed is not None,
                             'restore_status': restored['status'], 'restored': restored_value is not None})
        if not all(c['observed'] and c['restored'] for c in controls):
            return {'trial': trial, 'verdict': 'INCONCLUSIVE', 'reason': 'serial-controls-failed',
                    'controls': controls, 'steps': steps}
        reset_state = request(base, 'GET', path)
        if (reset_state['status'] != 200 or not isinstance(reset_state['body'], dict)
                or any(reset_state['body'].get(k) != v for k, v in baseline.items())):
            return {'trial': trial, 'verdict': 'INCONCLUSIVE', 'reason': 'full-baseline-reset-failed',
                    'controls': controls, 'steps': steps}
        epoch_id = 'immich-album-%s-%d' % (stamp, trial)
        ops = [{'operation_id': epoch_id + '-op-%d' % i, 'method': 'PATCH', 'path': path,
                'body': {field: target[field]}, 'delay_ms': 0,
                'headers': {'Content-Type': 'application/json'}}
               for i, field in enumerate(('albumName', 'description'))]
        rng.shuffle(ops)
        epoch = request(adapter, 'POST', '/epochs',
                        {'epoch_id': epoch_id, 'scenario': 'disjoint-album-fields', 'operations': ops})
        final = request(base, 'GET', path, epoch=epoch_id, op_id=epoch_id + '-observe')
        observed_ok, witness_reason, writes, reads = witness(trace, epoch_id, path)
        verdict, reason = classify(epoch, final, observed_ok, writes, reads,
                                   True, target['albumName'], target['description'])
        record = epoch['body'] if isinstance(epoch['body'], dict) else {}
        return {'trial': trial, 'verdict': verdict, 'reason': witness_reason or reason,
                'epoch_id': epoch_id, 'controls': controls, 'prefix': steps,
                'overlap': record.get('overlap_observed'),
                'proxy_overlap': proxy_overlap(writes),
                'release_skew_ns': record.get('release_skew_ns'),
                'statuses': [x.get('status') for x in record.get('operations', [])],
                'trace_patch_count': len(writes), 'trace_read_count': len(reads),
                'final_status': final['status'],
                'final_fields': {k: final['body'].get(k) for k in target}
                    if isinstance(final['body'], dict) else None,
                'expected_fields': target}
    finally:
        try:
            request(base, 'DELETE', path)
        except Exception:
            pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', required=True)
    parser.add_argument('--target', default='http://127.0.0.1:9926')
    parser.add_argument('--trials', type=int, default=8)
    parser.add_argument('--prefix-rounds', type=int, default=4)
    parser.add_argument('--quiescence-ms', type=int, default=150)
    parser.add_argument('--seed', type=int, default=20261006)
    parser.add_argument('--freeze-evidence', action='store_true')
    args = parser.parse_args()
    if args.target != 'http://127.0.0.1:9926' or not 1 <= args.trials <= 50 or not 1 <= args.prefix_rounds <= 10:
        parser.error('Run only against the isolated local pilot; Trials 1..50, PrefixRounds 1..10')
    root = Path(args.root).resolve()
    validate_spec(root / 'model/immich/immich-v3.2.0-openapi.json')
    from run_immich_album_serial import call as direct_call
    ver = direct_call(args.target, 'GET', '/server/version')
    if ver['status'] != 200 or any(ver['body'].get(k) != v for k, v in
                                   (('major', 3), ('minor', 2), ('patch', 0))):
        parser.error('Local Immich server is not v3.2.0')
    token = authenticate(args.target, root / 'deployment/immich_album_pilot/local-admin-credentials.json')
    stamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f')[:-3]
    run_name = 'research-fit-immich-album-overlap-' + stamp
    run = root / 'runs' / run_name
    run.mkdir(parents=True, exist_ok=False)
    trace = run / 'http-trace.jsonl'
    proxy_port, adapter_port = reserve_port(), reserve_port()
    while proxy_port == adapter_port:
        adapter_port = reserve_port()
    os.environ['IMMICH_PILOT_EPHEMERAL_TOKEN'] = token
    try:
        proxy = build_proxy(SimpleNamespace(listen_host='127.0.0.1', listen_port=proxy_port,
            target=args.target, api_prefix='/api', trace=str(trace),
            bearer_token_env='IMMICH_PILOT_EPHEMERAL_TOKEN', require_bearer_token=True,
            authorization_scheme='Bearer', timeout=60.0))
    finally:
        os.environ.pop('IMMICH_PILOT_EPHEMERAL_TOKEN', None)
        token = None
    adapter = build_adapter(SimpleNamespace(listen_host='127.0.0.1', listen_port=adapter_port,
        upstream='http://127.0.0.1:%d' % proxy_port,
        epoch_log=str(run / 'concurrent-epochs.jsonl'), max_width=8,
        timeout=60.0, quiescence_ms=args.quiescence_ms))
    for server in (proxy, adapter):
        threading.Thread(target=server.serve_forever, daemon=True).start()
    base, adapter_url = ('http://127.0.0.1:%d' % proxy_port,
                         'http://127.0.0.1:%d' % adapter_port)
    results = []
    rng = random.Random(args.seed)
    try:
        for i in range(1, args.trials + 1):
            try:
                results.append(one_trial(base, adapter_url, trace, i, stamp, args.prefix_rounds, rng))
            except (ValueError, KeyError, TypeError, urllib.error.URLError, TimeoutError) as exc:
                results.append({'trial': i, 'verdict': 'INCONCLUSIVE',
                                'reason': '%s: %s' % (type(exc).__name__, str(exc)[:180])})
    finally:
        for server in (adapter, proxy):
            server.shutdown()
            server.server_close()
    summary = {'schema_version': 1, 'candidate': 'immich', 'version': 'v3.2.0',
               'source_spec_sha256': SPEC_SHA, 'created_utc': datetime.now(timezone.utc).isoformat(),
               'scope': 'directed diagnostic; separate from OpenAPI-only generated campaign',
               'parameters': {'trials': args.trials, 'prefix_rounds': args.prefix_rounds,
                              'quiescence_ms': args.quiescence_ms, 'seed': args.seed},
               'counts': {v: sum(x['verdict'] == v for x in results)
                          for v in ('PASS', 'SEMANTIC_CANDIDATE', 'INCONCLUSIVE')},
               'results': results}
    (run / 'summary.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
    (run / 'run_immich_album_concurrent.py').write_bytes(Path(__file__).read_bytes())
    files = sorted(p for p in run.iterdir() if p.is_file())
    with (run / 'checksums.csv').open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=('file', 'sha256'))
        writer.writeheader()
        writer.writerows({'file': p.name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                         for p in files)
    if args.freeze_evidence:
        archive = root / 'evidence' / (run_name + '-review.zip')
        archive.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(archive, 'x', zipfile.ZIP_DEFLATED) as z:
            for p in sorted(run.iterdir()):
                if p.is_file():
                    z.write(p, p.name)
        print('IMMICH_ALBUM_OVERLAP_EVIDENCE_READY')
        print('Evidence ZIP:', archive)
        print('ZIP SHA256:', hashlib.sha256(archive.read_bytes()).hexdigest())
    print('Run directory:', run)
    print('IMMICH_ALBUM_OVERLAP_COUNTS', json.dumps(summary['counts']))
    for r in results:
        print('IMMICH_ALBUM_OVERLAP_RESULT trial=%d verdict=%s reason=%s overlap=%s' %
              (r['trial'], r['verdict'], r['reason'], r.get('overlap')))
    print('IMMICH_ALBUM_OVERLAP_COMPLETE')


if __name__ == '__main__':
    main()
