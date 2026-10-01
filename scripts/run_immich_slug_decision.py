#!/usr/bin/env python3
"""Directed confirmation of an OpenAPI-generated shared-link slug witness."""
import argparse
import csv
import hashlib
import json
import os
import socket
import sys
import threading
import urllib.error
import urllib.request
import uuid
import zipfile
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'generator_baseline'))
from openapi_to_sbt.trace_proxy import build_server
from run_immich_album_serial import SPEC_SHA, authenticate, validate_spec


def check_spec(path):
    validate_spec(path)
    spec = json.loads(path.read_text(encoding='utf-8'))
    for method, path, op in [('post', '/shared-links', 'createSharedLink'),
                             ('get', '/shared-links/{id}', 'getSharedLinkById'),
                             ('patch', '/shared-links/{id}', 'updateSharedLink')]:
        if spec['paths'][path][method]['operationId'] != op:
            raise ValueError('Unexpected operation ' + op)
    create = spec['components']['schemas']['SharedLinkCreateDto']['properties']
    edit = spec['components']['schemas']['SharedLinkEditDto']['properties']
    if not {'slug', 'allowDownload'} <= create.keys() or not {'slug', 'allowDownload'} <= edit.keys():
        raise ValueError('Expected shared-link fields missing from OpenAPI')


def call(base, method, path, payload=None, epoch=None, op=None):
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    if epoch:
        headers['X-Provengo-Epoch-Id'] = epoch
        headers['X-Provengo-Operation-Id'] = op
    req = urllib.request.Request(base + '/api' + path, method=method,
        data=json.dumps(payload).encode() if payload is not None else None, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=55) as response:
            status, data = response.status, response.read()
    except urllib.error.HTTPError as error:
        status, data = error.code, error.read()
    try:
        body = json.loads(data) if data else None
    except (ValueError, UnicodeError):
        body = None
    return {'status': status, 'body': body}


def fields(result):
    body = result.get('body') if isinstance(result.get('body'), dict) else {}
    return {'status': result['status'], 'id': body.get('id'),
            'slug': body.get('slug'), 'allowDownload': body.get('allowDownload')}


def record(base, name, method, path, log, payload=None):
    result = call(base, method, path, payload, name, name + ':' + method)
    log.append({'name': name, 'method': method,
                'path': '/shared-links/{id}' if path.startswith('/shared-links/') else path,
                'request': {k: payload[k] for k in ('slug', 'allowDownload') if isinstance(payload, dict) and k in payload},
                'response': fields(result)})
    return result


def fresh_link(base, name, log):
    album = record(base, name + ':album-create', 'POST', '/albums', log, {'albumName': name})
    aid = (album['body'] or {}).get('id') if isinstance(album['body'], dict) else None
    if album['status'] != 201 or not isinstance(aid, str):
        raise ValueError('Album create failed')
    read_album = record(base, name + ':album-read', 'GET', '/albums/' + aid, log)
    if read_album['status'] != 200 or read_album['body'].get('id') != aid:
        raise ValueError('Album read failed')
    result = record(base, name + ':link-create', 'POST', '/shared-links', log,
                    {'type': 'ALBUM', 'albumId': aid, 'allowDownload': False})
    lid = (result['body'] or {}).get('id') if isinstance(result['body'], dict) else None
    if result['status'] != 201 or not isinstance(lid, str):
        raise ValueError('Link create failed')
    link = record(base, name + ':link-read', 'GET', '/shared-links/' + lid, log)
    if link['status'] != 200 or link['body'].get('id') != lid or link['body'].get('allowDownload') is not False:
        raise ValueError('Link not readable with allowDownload=false')
    return '/shared-links/' + lid


def serial(base, name, order, log):
    path = fresh_link(base, name, log)
    slug = name + '-slug'
    updates = {'A': {'slug': slug}, 'B': {'allowDownload': True}}
    observed = []
    for op in order:
        update = record(base, name + ':' + op, 'PATCH', path, log, updates[op])
        read = record(base, name + ':' + op + ':read', 'GET', path, log)
        observed.append({'operation': op, 'update': fields(update), 'read': fields(read)})
    return {'order': order, 'slug_sent': slug, 'observed': observed, 'final': observed[-1]['read']}


def overlap(base, name, log):
    path = fresh_link(base, name, log)
    slug = name + '-slug'
    gate = threading.Barrier(3, timeout=15)

    def worker(op, body):
        gate.wait()
        return call(base, 'PATCH', path, body, name, name + ':' + op)

    with ThreadPoolExecutor(max_workers=2) as pool:
        a = pool.submit(worker, 'A', {'slug': slug})
        b = pool.submit(worker, 'B', {'allowDownload': True})
        gate.wait()
        responses = {'A': fields(a.result(timeout=60)), 'B': fields(b.result(timeout=60))}
    for op in ('A', 'B'):
        log.append({'name': name + ':' + op, 'method': 'PATCH', 'path': '/shared-links/{id}',
                    'request': {'slug': slug} if op == 'A' else {'allowDownload': True},
                    'response': responses[op]})
    final = fields(record(base, name + ':final-read', 'GET', path, log))
    return {'slug_sent': slug, 'responses': responses, 'final': final}


def classify(ab, ba, race, real_overlap):
    for history in (ab, ba):
        if len(history['observed']) != 2 or any(x['update']['status'] != 200 or x['read']['status'] != 200 for x in history['observed']):
            return 'INCONCLUSIVE', 'serial-controls-incomplete'
        if history['final']['allowDownload'] is not True:
            return 'INCONCLUSIVE', 'serial-boolean-not-visible'
    if ab['observed'][0]['read']['slug'] != ab['slug_sent']:
        return 'INCONCLUSIVE', 'serial-slug-not-established'
    if ba['final']['slug'] != ba['slug_sent']:
        return 'INCONCLUSIVE', 'reverse-serial-slug-not-visible'
    if not real_overlap or any(x['status'] != 200 for x in race['responses'].values()) or race['final']['status'] != 200:
        return 'INCONCLUSIVE', 'overlap-or-acknowledgment-unproven'
    if ab['final']['slug'] != ab['slug_sent']:
        return 'SERIAL_SLUG_RESET_OBSERVED', 'slug-reset-without-overlap'
    if race['final']['slug'] != race['slug_sent'] or race['final']['allowDownload'] is not True:
        return 'CONCURRENCY_CANDIDATE', 'both-serial-orders-preserve-fields-but-overlap-does-not'
    return 'PASS', 'all-fields-visible'


def redact(event):
    request, response = event.get('request'), event.get('response')
    return {k: event.get(k) for k in ('method', 'model_path', 'status', 'epoch_id', 'operation_id',
            'upstream_started_utc', 'upstream_completed_utc', 'trace_sequence', 'transport_error')} | {
        'request_fields': {k: request[k] for k in ('slug', 'allowDownload') if isinstance(request, dict) and k in request},
        'response_fields': {k: response[k] for k in ('id', 'slug', 'allowDownload') if isinstance(response, dict) and k in response}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=HERE.parent)
    parser.add_argument('--base-url', default='http://127.0.0.1:9926')
    parser.add_argument('--preflight-only', action='store_true')
    parser.add_argument('--freeze-evidence', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve()
    check_spec(root / 'model/immich/immich-v3.2.0-openapi.json')
    if args.preflight_only:
        print('IMMICH_SLUG_PREFLIGHT_PASS spec_sha256=' + SPEC_SHA)
        return 0
    token = authenticate(args.base_url, root / 'deployment/immich_album_pilot/local-admin-credentials.json')
    stamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f')
    run = root / 'runs' / ('research-fit-immich-slug-decision-' + stamp)
    run.mkdir(parents=True, exist_ok=False)
    raw = run / 'private-trace.jsonl'
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    env_name = 'SBT_SLUG_RESEARCH_TOKEN'
    os.environ[env_name] = token
    server = build_server(SimpleNamespace(target=args.base_url, api_prefix='', trace=str(raw),
        bearer_token_env=env_name, require_bearer_token=True, authorization_scheme='Bearer',
        timeout=60, listen_host='127.0.0.1', listen_port=port))
    os.environ.pop(env_name, None)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = 'http://127.0.0.1:' + str(server.server_port)
    steps = []
    summary = {'spec_sha256': SPEC_SHA, 'verdict': 'INCONCLUSIVE'}
    try:
        nonce = uuid.uuid4().hex
        ab = serial(base, 'sbt-ab-' + nonce, 'AB', steps)
        ba = serial(base, 'sbt-ba-' + nonce, 'BA', steps)
        epoch = 'sbt-overlap-' + nonce
        race = overlap(base, epoch, steps)
        events = [json.loads(x) for x in raw.read_text(encoding='utf-8').splitlines() if x]
        pair = [e for e in events if e.get('epoch_id') == epoch and e.get('method') == 'PATCH']
        real = len(pair) == 2 and all(not e.get('transport_error') for e in pair) and (
            max(e['upstream_started_utc'] for e in pair) < min(e['upstream_completed_utc'] for e in pair))
        verdict, reason = classify(ab, ba, race, real)
        summary.update({'verdict': verdict, 'reason': reason, 'real_upstream_overlap': real,
                        'serial_ab': ab, 'serial_ba': ba, 'overlap': race})
    except (OSError, ValueError, RuntimeError, threading.BrokenBarrierError) as error:
        summary['reason'] = type(error).__name__ + ': ' + str(error)
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
        if raw.exists():
            events = [json.loads(x) for x in raw.read_text(encoding='utf-8').splitlines() if x]
            (run / 'http-trace-redacted.jsonl').write_text(''.join(json.dumps(redact(e), sort_keys=True) + '\n' for e in events), encoding='utf-8')
            raw.unlink()
        (run / 'summary.json').write_text(json.dumps(summary, indent=2, sort_keys=True) + '\n', encoding='utf-8')
        (run / 'steps.json').write_text(json.dumps(steps, indent=2, sort_keys=True) + '\n', encoding='utf-8')
        with (run / 'checksums.csv').open('w', newline='', encoding='utf-8') as output:
            writer = csv.writer(output)
            writer.writerow(('path', 'sha256'))
            for path in sorted(run.iterdir()):
                if path.is_file() and path.name != 'checksums.csv':
                    writer.writerow((path.name, hashlib.sha256(path.read_bytes()).hexdigest()))
        if args.freeze_evidence:
            evidence = root / 'evidence'
            evidence.mkdir(parents=True, exist_ok=True)
            archive = evidence / (run.name + '-review.zip')
            with zipfile.ZipFile(archive, 'x', zipfile.ZIP_DEFLATED) as output:
                for path in sorted(run.iterdir()):
                    if path.is_file() and path.name != 'private-trace.jsonl':
                        output.write(path, path.name)
            print('IMMICH_SLUG_EVIDENCE_READY', archive)
            print('ZIP SHA256:', hashlib.sha256(archive.read_bytes()).hexdigest())
    print('IMMICH_SLUG_DECISION verdict=' + summary['verdict'] + ' reason=' + summary.get('reason', '-') + ' run=' + str(run))
    return 0 if summary['verdict'] != 'INCONCLUSIVE' else 3


if __name__ == '__main__':
    sys.exit(main())
