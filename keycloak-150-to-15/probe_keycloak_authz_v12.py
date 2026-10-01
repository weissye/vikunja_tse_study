#!/usr/bin/env python3
"""Small live check of Keycloak client authorization prerequisites; no scenario expansion."""
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
    realm = 'sbt_authz_probe_' + uuid.uuid4().hex[:12]
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
        prefix = '/admin/realms/' + urllib.parse.quote(realm, safe='')
        status, location, payload = request('POST', prefix + '/clients', {
            'clientId': 'sbt-authz-probe', 'name': 'SBT authorization probe',
            'protocol': 'openid-connect', 'publicClient': False})
        result['create_client'] = status
        if status != 201 or not location:
            raise RuntimeError('probe client creation failed')
        client_id = urllib.parse.urlsplit(location).path.rstrip('/').rsplit('/', 1)[-1]
        uuid.UUID(client_id)
        status, _, payload = request('GET', prefix + '/clients/' + client_id)
        result['get_client'] = status
        if status == 200:
            client = json.loads(payload)
            client['authorizationServicesEnabled'] = True
            result['enable_authorization_services'] = request(
                'PUT', prefix + '/clients/' + client_id, client)[0]
            status, _, payload = request('GET', prefix + '/clients/' + client_id)
            result['get_client_after_enable'] = status
            if status == 200:
                result['authorization_services_enabled'] = bool(
                    json.loads(payload).get('authorizationServicesEnabled'))
        status, _, _ = request('POST', prefix + '/clients/' + client_id +
                               '/authz/resource-server/resource', {'name': 'sbt-probe-resource'})
        result['create_resource'] = status
    finally:
        if result.get('create_realm') == 201:
            result['cleanup'] = request('DELETE', '/admin/realms/' + realm)[0]
        print(json.dumps(result, indent=2))
    if (result.get('create_client') != 201 or result.get('get_client') != 200 or
            result.get('enable_authorization_services') != 204 or
            not result.get('authorization_services_enabled') or
            result.get('create_resource') != 201 or result.get('cleanup') != 204):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
