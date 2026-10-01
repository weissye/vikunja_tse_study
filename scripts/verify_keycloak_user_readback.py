#!/usr/bin/env python3
"""Verify exact username readback on a temporary Keycloak realm; never save credentials."""
import argparse
import json
import os
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request
import uuid


def send(base, route, method='GET', *, token=None, data=None, form=None):
    headers = {'Accept': 'application/json'}
    body = None
    if data is not None:
        body = json.dumps(data).encode()
        headers['Content-Type'] = 'application/json'
    if form is not None:
        body = urllib.parse.urlencode(form).encode()
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if token:
        headers['Authorization'] = 'Bearer ' + token
    req = urllib.request.Request(base + route, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.status, dict(response.headers), response.read()
    except urllib.error.HTTPError as error:
        return error.code, dict(error.headers), error.read(1024)


def check(status, expected, name):
    if status != expected:
        raise RuntimeError(f'{name}: HTTP {status}, expected {expected}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    if args.out.exists():
        parser.error('Refusing to overwrite evidence')
    password = os.getenv('KC_STAGE2_ADMIN_PASSWORD')
    if not password:
        parser.error('KC_STAGE2_ADMIN_PASSWORD is required')
    base = 'http://127.0.0.1:9928'
    username = os.getenv('KC_STAGE2_ADMIN_USERNAME', 'admin')
    status, _, raw = send(base, '/realms/master/protocol/openid-connect/token',
                           'POST', form={'client_id':'admin-cli','grant_type':'password',
                                         'username':username,'password':password})
    check(status, 200, 'admin token')
    token = json.loads(raw)['access_token']
    realm = 'sbt-readback-' + uuid.uuid4().hex[:12]
    user = 'sbt-user-' + realm
    created = False
    report = {'schema_version': 1, 'realm': realm, 'result': 'NOT_VERIFIED',
              'create_realm_status': None, 'create_user_status': None,
              'list_status': None, 'matches': None, 'id_bound': False,
              'read_user_status': None, 'cleanup_status': None}
    try:
        status, _, _ = send(base, '/admin/realms', 'POST', token=token,
                             data={'realm':realm,'enabled':True})
        report['create_realm_status'] = status
        check(status, 201, 'realm create')
        created = True
        root = '/admin/realms/' + realm + '/users'
        status, _, _ = send(base, root, 'POST', token=token,
                             data={'username':user,'enabled':True,
                                   'firstName':'Initial','lastName':'Pilot'})
        report['create_user_status'] = status
        check(status, 201, 'user create')
        query = '?username=' + urllib.parse.quote(user, safe='') + '&exact=true'
        status, _, raw = send(base, root + query, token=token)
        report['list_status'] = status
        check(status, 200, 'exact username lookup')
        found = [u for u in json.loads(raw) if u.get('username') == user]
        report['matches'] = len(found)
        if len(found) != 1 or not isinstance(found[0].get('id'), str):
            raise RuntimeError('exact readback did not resolve one user ID')
        uid = found[0]['id']
        status, _, raw = send(base, root + '/' + urllib.parse.quote(uid, safe=''), token=token)
        report['read_user_status'] = status
        check(status, 200, 'read user by bound ID')
        if json.loads(raw).get('id') != uid:
            raise RuntimeError('read user ID mismatch')
        report['id_bound'] = True
        report['result'] = 'EXACT_READBACK_VERIFIED'
    except (RuntimeError, ValueError, urllib.error.URLError) as exc:
        report['error_type'] = type(exc).__name__
        report['result'] = 'INCOMPLETE'
    finally:
        if created:
            try:
                status, _, _ = send(base, '/admin/realms/' + realm, 'DELETE', token=token)
                report['cleanup_status'] = status
            except urllib.error.URLError:
                report['cleanup_status'] = 'FAILED'
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print('KEYCLOAK_READBACK', report['result'], 'cleanup=', report['cleanup_status'],
          'report=', args.out)
    if report['result'] != 'EXACT_READBACK_VERIFIED' or report['cleanup_status'] != 204:
        raise SystemExit(2)


if __name__ == '__main__':
    main()
