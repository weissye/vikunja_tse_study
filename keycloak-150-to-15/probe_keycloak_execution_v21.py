#!/usr/bin/env python3
"""Check the smallest valid authentication execution in a temporary Keycloak realm."""
import argparse
import getpass
import json
import os
import urllib.error
import urllib.parse
import urllib.request
import uuid

from run_15 import token


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:9928')
    parser.add_argument('--username', default='admin')
    args = parser.parse_args()
    base = args.base_url.rstrip('/')
    password = os.environ.get('KC_STAGE2_ADMIN_PASSWORD') or getpass.getpass('Keycloak admin password: ')
    bearer = token(base, args.username, password)
    realm = 'sbt_execution_probe_' + uuid.uuid4().hex[:12]
    result = {'realm': realm}

    def request(method, path, body=None):
        payload = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(base + path, payload, {
            'Authorization': 'Bearer ' + bearer, 'Content-Type': 'application/json'}, method=method)
        try:
            response = urllib.request.urlopen(req, timeout=30)
        except urllib.error.HTTPError as exc:
            response = exc
        with response:
            return response.status, response.headers.get('Location'), response.read()

    try:
        status, _, _ = request('POST', '/admin/realms', {'realm': realm, 'enabled': True})
        result['create_realm'] = status
        if status != 201:
            raise RuntimeError('probe realm creation failed')
        prefix = '/admin/realms/' + realm + '/authentication'
        status, location, _ = request('POST', prefix + '/flows', {
            'alias': 'sbt-probe-flow', 'providerId': 'basic-flow',
            'topLevel': True, 'builtIn': False, 'description': ''})
        result['create_flow'] = status
        if status != 201 or not location:
            raise RuntimeError('probe flow creation failed')
        flow_id = urllib.parse.urlsplit(location).path.rstrip('/').rsplit('/', 1)[-1]
        uuid.UUID(flow_id)
        status, parent_location, _ = request('POST', prefix + '/flows', {
            'alias': 'sbt-probe-parent', 'providerId': 'basic-flow',
            'topLevel': True, 'builtIn': False, 'description': ''})
        result['create_parent_flow'] = status
        if status != 201 or not parent_location:
            raise RuntimeError('probe parent flow creation failed')
        parent_id = urllib.parse.urlsplit(parent_location).path.rstrip('/').rsplit('/', 1)[-1]
        uuid.UUID(parent_id)
        status, execution_location, response_body = request('POST', prefix + '/executions', {
            'flowId': flow_id, 'parentFlow': parent_id,
            'requirement': 'REQUIRED', 'authenticatorFlow': True})
        result['create_execution'] = status
        result['execution_location_path'] = (urllib.parse.urlsplit(execution_location).path
                                             if execution_location else None)
        result['execution_response_body'] = response_body[:500].decode('utf-8', errors='replace')
        if status != 201:
            result['execution_error'] = response_body[:1000].decode('utf-8', errors='replace')
    finally:
        if result.get('create_realm') == 201:
            result['cleanup'] = request('DELETE', '/admin/realms/' + realm)[0]
        print(json.dumps(result, indent=2))
    if result.get('create_execution') != 201 or result.get('cleanup') != 204:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
