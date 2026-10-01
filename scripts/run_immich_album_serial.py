#!/usr/bin/env python3
"""Version-pinned, serial album persistence pilot against an isolated Immich."""
import argparse
import hashlib
import json
import secrets
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

SPEC_SHA = '51719f0b6573ca75eb51834b01a7fdb9e963c9d60fcce813f10c1463a987b866'
OPERATIONS = {('post', '/auth/admin-sign-up'): 'signUpAdmin',
              ('post', '/auth/login'): 'login',
              ('get', '/server/version'): 'getServerVersion',
              ('post', '/albums'): 'createAlbum',
              ('get', '/albums/{id}'): 'getAlbumInfo',
              ('patch', '/albums/{id}'): 'updateAlbumInfo'}


def validate_spec(path):
    raw = path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != SPEC_SHA:
        raise ValueError('Pinned Immich v3.2.0 OpenAPI SHA256 mismatch')
    spec = json.loads(raw)
    for (method, path), operation_id in OPERATIONS.items():
        if spec['paths'][path][method].get('operationId') != operation_id:
            raise ValueError('Pinned OpenAPI operation mismatch: ' + path)
    if not {'albumName', 'description'} <= set(spec['components']['schemas']['UpdateAlbumDto']['properties']):
        raise ValueError('Pinned album update contract is missing required pilot fields')
    return hashlib.sha256(raw).hexdigest()


def call(base, method, path, body=None, token=None):
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    request = urllib.request.Request(base.rstrip('/') + '/api' + path,
        data=json.dumps(body).encode('utf-8') if body is not None else None,
        headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            status, data = response.status, response.read()
    except urllib.error.HTTPError as exc:
        status, data = exc.code, exc.read()
    except urllib.error.URLError as exc:
        raise RuntimeError('Cannot connect to local Immich: ' + str(exc.reason)) from exc
    try:
        parsed = json.loads(data) if data else None
    except (UnicodeError, ValueError):
        parsed = None
    return {'status': status, 'body': parsed}


def authenticate(base, private_file):
    if private_file.exists():
        credentials = json.loads(private_file.read_text(encoding='utf-8'))
    else:
        credentials = {'email': 'fse-album-pilot@example.test',
                       'name': 'FSE Album Pilot', 'password': secrets.token_urlsafe(30)}
        created = call(base, 'POST', '/auth/admin-sign-up', credentials)
        if created['status'] != 201:
            raise RuntimeError('Isolated server admin sign-up failed: HTTP %d; credentials were not saved. '
                               'If the isolated volume already has an admin, provide a fresh isolated deployment.'
                               % created['status'])
        private_file.parent.mkdir(parents=True, exist_ok=True)
        private_file.write_text(json.dumps(credentials), encoding='utf-8')
    login = call(base, 'POST', '/auth/login',
                 {'email': credentials['email'], 'password': credentials['password']})
    token = (login['body'] or {}).get('accessToken') if isinstance(login['body'], dict) else None
    if login['status'] != 201 or not isinstance(token, str) or not token:
        raise RuntimeError('Isolated server login failed: HTTP %d' % login['status'])
    return token


def trial(base, token, number, stamp, rounds):
    label = 'fse-immich-%s-%d' % (stamp, number)
    steps = []
    def step(method, path, body=None):
        response = call(base, method, path, body, token)
        # Preserve only contract fields relevant to the oracle; never tokens,
        # cookies, credentials, arbitrary server messages or request headers.
        result = {'method': method, 'path': '/albums/{id}' if '/albums/' in path else path,
                  'status': response['status']}
        if isinstance(response['body'], dict):
            result['observed'] = {k: response['body'].get(k)
                                  for k in ('id', 'albumName', 'description') if k in response['body']}
        steps.append(result)
        return response
    created = step('POST', '/albums', {'albumName': label})
    album_id = (created['body'] or {}).get('id') if isinstance(created['body'], dict) else None
    if created['status'] != 201 or not isinstance(album_id, str) or not album_id:
        return {'trial': number, 'verdict': 'INCONCLUSIVE', 'reason': 'create-failed', 'steps': steps}
    path = '/albums/' + urllib.parse.quote(album_id, safe='')
    try:
        initial = step('GET', path)
        if initial['status'] != 200 or initial['body'].get('albumName') != label:
            return {'trial': number, 'verdict': 'INCONCLUSIVE', 'reason': 'initial-read-failed', 'steps': steps}
        for round_number in range(rounds):
            name = '%s-name-%d' % (label, round_number)
            description = '%s-description-%d' % (label, round_number)
            for field, value in (('albumName', name), ('description', description)):
                changed = step('PATCH', path, {field: value})
                observed = step('GET', path)
                if changed['status'] != 200 or observed['status'] != 200:
                    return {'trial': number, 'verdict': 'INCONCLUSIVE',
                            'reason': 'patch-or-read-not-successful', 'steps': steps}
                if observed['body'].get(field) != value:
                    return {'trial': number, 'verdict': 'SEMANTIC_CANDIDATE',
                            'reason': 'successful-patch-value-not-visible', 'field': field, 'steps': steps}
        final = step('GET', path)
        if final['status'] != 200:
            return {'trial': number, 'verdict': 'INCONCLUSIVE', 'reason': 'final-read-failed', 'steps': steps}
        expected = {'albumName': name, 'description': description}
        if any(final['body'].get(k) != v for k, v in expected.items()):
            return {'trial': number, 'verdict': 'SEMANTIC_CANDIDATE',
                    'reason': 'disjoint-serial-updates-not-preserved', 'steps': steps}
        return {'trial': number, 'verdict': 'PASS', 'reason': 'both-fields-persisted', 'steps': steps}
    finally:
        try:
            step('DELETE', path)
        except Exception:
            # Preserve the first observation; cleanup failure remains visible
            # through the absence of its DELETE step in the evidence.
            pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--base-url', default='http://127.0.0.1:9926')
    parser.add_argument('--trials', type=int, default=2)
    parser.add_argument('--prefix-rounds', type=int, default=4)
    parser.add_argument('--freeze-evidence', action='store_true')
    args = parser.parse_args()
    if args.trials < 1 or args.prefix_rounds < 1:
        parser.error('trials and prefix-rounds must be positive')
    if args.base_url not in ('http://127.0.0.1:9926', 'http://localhost:9926'):
        parser.error('the isolated pilot listens only at localhost:9926')
    root = args.root.resolve()
    spec_hash = validate_spec(root / 'model/immich/immich-v3.2.0-openapi.json')
    run = root / 'runs' / ('research-fit-immich-album-serial-' +
                            datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f'))
    run.mkdir(parents=True, exist_ok=False)
    results = []
    status = 'INCOMPLETE'
    try:
        version = call(args.base_url, 'GET', '/server/version')
        if version['status'] != 200 or not isinstance(version['body'], dict) or any(
                version['body'].get(k) != v for k, v in (('major', 3), ('minor', 2), ('patch', 0))):
            raise RuntimeError('Local server is not Immich v3.2.0')
        token = authenticate(args.base_url,
            root / 'deployment/immich_album_pilot/local-admin-credentials.json')
        for n in range(1, args.trials + 1):
            try:
                result = trial(args.base_url, token, n, run.name[-13:], args.prefix_rounds)
            except Exception as exc:
                result = {'trial': n, 'verdict': 'INCONCLUSIVE',
                          'reason': type(exc).__name__ + ': ' + str(exc)[:180]}
            results.append(result)
        status = 'COMPLETE'
    except Exception as exc:
        results.append({'trial': 0, 'verdict': 'INCONCLUSIVE',
                        'reason': type(exc).__name__ + ': ' + str(exc)[:180]})
    evidence = {'status': status, 'candidate': 'immich', 'version': 'v3.2.0',
                'openapi_sha256': spec_hash, 'prefix_rounds': args.prefix_rounds,
                'results': results}
    (run / 'album_serial_results.json').write_text(json.dumps(evidence, indent=2), encoding='utf-8')
    checksum = hashlib.sha256((run / 'album_serial_results.json').read_bytes()).hexdigest()
    (run / 'checksums.txt').write_text(checksum + '  album_serial_results.json\n', encoding='utf-8')
    print('IMMICH_ALBUM_SERIAL_EVIDENCE_READY run=' + str(run))
    if args.freeze_evidence:
        archive = root / 'evidence' / (run.name + '-review.zip')
        archive.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as z:
            for name in ('album_serial_results.json', 'checksums.txt'):
                z.write(run / name, name)
        print('Evidence ZIP:', archive)
        print('ZIP SHA256:', hashlib.sha256(archive.read_bytes()).hexdigest())
    for item in results:
        print('IMMICH_ALBUM_SERIAL_RESULT trial=%d verdict=%s reason=%s' %
              (item['trial'], item['verdict'], item['reason']))
    print('IMMICH_ALBUM_SERIAL_' + status)
    return 0 if status == 'COMPLETE' else 2


if __name__ == '__main__':
    raise SystemExit(main())
