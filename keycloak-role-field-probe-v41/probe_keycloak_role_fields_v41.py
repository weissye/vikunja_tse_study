#!/usr/bin/env python3
"""Probe disjoint role description/attributes updates without sampling scenarios."""
import argparse
import getpass
import json
import os
import urllib.error
import urllib.parse
import urllib.request
import uuid


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:9928')
    parser.add_argument('--username', default='admin')
    args = parser.parse_args()
    base = args.base_url.rstrip('/')
    password = os.environ.get('KC_STAGE2_ADMIN_PASSWORD') or getpass.getpass('Keycloak admin password: ')
    body = urllib.parse.urlencode({'grant_type': 'password', 'client_id': 'admin-cli',
                                   'username': args.username, 'password': password}).encode()
    req = urllib.request.Request(base + '/realms/master/protocol/openid-connect/token',
                                 body, {'Content-Type': 'application/x-www-form-urlencoded'},
                                 method='POST')
    with urllib.request.urlopen(req, timeout=20) as response:
        token = json.load(response)['access_token']
    realm = 'sbt_role_probe_' + uuid.uuid4().hex[:12]
    result = {'realm': realm, 'checks': {}}

    def request(method, path, value=None):
        payload = json.dumps(value).encode() if value is not None else None
        req = urllib.request.Request(base + path, payload,
            {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'},
            method=method)
        try:
            response = urllib.request.urlopen(req, timeout=30)
        except urllib.error.HTTPError as exc:
            response = exc
        with response:
            raw = response.read()
            try:
                parsed = json.loads(raw)
            except (ValueError, UnicodeDecodeError):
                parsed = None
            return response.status, response.headers.get('Location'), parsed

    try:
        created, _, _ = request('POST', '/admin/realms', {'realm': realm, 'enabled': True})
        result['create_realm'] = created
        if created != 201:
            return
        prefix = '/admin/realms/' + urllib.parse.quote(realm, safe='')
        client_status, location, _ = request('POST', prefix + '/clients',
                                             {'clientId': 'sbt-role-client'})
        result['create_client'] = client_status
        if client_status != 201 or not location:
            return
        client_id = urllib.parse.urlsplit(location).path.rstrip('/').rsplit('/', 1)[-1]
        for label, collection in [('realm', prefix + '/roles'),
                                  ('client', prefix + '/clients/' + client_id + '/roles')]:
            name = 'sbt-probe-' + label
            path = collection + '/' + urllib.parse.quote(name, safe='')
            check = {}
            result['checks'][label] = check
            check['create'] = request('POST', collection, {'name': name})[0]
            if check['create'] != 201:
                continue
            status, _, initial = request('GET', path)
            check['read_initial'] = status
            if status != 200 or not isinstance(initial, dict):
                continue
            first = dict(initial, description='sbt-description-v41')
            check['update_description'] = request('PUT', path, first)[0]
            status, _, current = request('GET', path)
            check['read_after_description'] = status
            if status != 200 or not isinstance(current, dict):
                continue
            check['description_preserved'] = current.get('description') == 'sbt-description-v41'
            second = dict(current, attributes={'sbtProbeV41': ['ok']})
            check['update_attributes'] = request('PUT', path, second)[0]
            status, _, after = request('GET', path)
            check['read_after_attributes'] = status
            if status == 200 and isinstance(after, dict):
                check['name_preserved'] = after.get('name') == name
                check['description_after_attributes'] = after.get('description') == 'sbt-description-v41'
                check['attributes_preserved'] = (after.get('attributes') or {}).get('sbtProbeV41') == ['ok']
    finally:
        if result.get('create_realm') == 201:
            result['cleanup'] = request('DELETE', '/admin/realms/' + realm)[0]
        print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
