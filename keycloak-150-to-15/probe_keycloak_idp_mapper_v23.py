#!/usr/bin/env python3
"""Probe two distinct identity-provider mappers with bounded output and cleanup."""
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
    realm = 'sbt_idp_mapper_probe_' + uuid.uuid4().hex[:12]
    result = {'realm': realm}

    def request(method, path, body=None):
        payload = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(base + path, payload,
                                     {'Authorization': 'Bearer ' + bearer,
                                      'Content-Type': 'application/json'}, method=method)
        try:
            response = urllib.request.urlopen(req, timeout=30)
        except urllib.error.HTTPError as exc:
            response = exc
        with response:
            data = response.read()
            return response.status, data[:300].decode('utf-8', errors='replace')

    try:
        result['create_realm'], _ = request('POST', '/admin/realms',
                                            {'realm': realm, 'enabled': True})
        if result['create_realm'] != 201:
            return
        prefix = '/admin/realms/' + urllib.parse.quote(realm, safe='')
        path = prefix + '/identity-provider/instances'
        result['create_provider'], _ = request('POST', path,
                                               {'alias': 'sbt-provider',
                                                'providerId': 'keycloak-oidc',
                                                'enabled': False, 'config': {}})
        if result['create_provider'] != 201:
            return
        path += '/sbt-provider/mappers'
        for index in (1, 2):
            status, error = request('POST', path, {'name': 'sbt-minimal-' + str(index)})
            result['minimal_' + str(index)] = {'status': status,
                                               'error': error if status >= 400 else None}
        for index in (1, 2):
            status, error = request('POST', path, {
                'name': 'sbt-complete-' + str(index),
                'identityProviderAlias': 'sbt-provider',
                'identityProviderMapper': 'oidc-user-attribute-idp-mapper',
                'config': {'claim': 'sbtClaim' + str(index),
                           'user.attribute': 'sbtAttribute' + str(index),
                           'syncMode': 'INHERIT'}})
            result['complete_' + str(index)] = {'status': status,
                                                'error': error if status >= 400 else None}
    finally:
        if result.get('create_realm') == 201:
            result['cleanup'], _ = request('DELETE', '/admin/realms/' + realm)
        print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
