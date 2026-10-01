#!/usr/bin/env python3
"""Keycloak mapper config race precheck; creates and removes one realm."""
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
    token_body = urllib.parse.urlencode({'grant_type': 'password', 'client_id': 'admin-cli',
                                         'username': args.username, 'password': password}).encode()
    token_req = urllib.request.Request(base + '/realms/master/protocol/openid-connect/token',
                                       token_body, {'Content-Type': 'application/x-www-form-urlencoded'}, method='POST')
    with urllib.request.urlopen(token_req, timeout=30) as response:
        token = json.load(response)['access_token']

    def request(method, path, value=None):
        body = json.dumps(value).encode() if value is not None else None
        req = urllib.request.Request(base + path, body,
                                     {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, method=method)
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

    realm = 'sbt_mapper_probe_' + uuid.uuid4().hex[:12]
    report = {'realm': realm, 'checks': {}}
    try:
        report['create_realm'] = request('POST', '/admin/realms', {'realm': realm, 'enabled': True})[0]
        if report['create_realm'] != 201:
            return
        prefix = '/admin/realms/' + realm
        status, location, _ = request('POST', prefix + '/client-scopes',
                                      {'name': 'sbt-scope', 'protocol': 'openid-connect'})
        report['create_scope'] = status
        if status != 201 or not location:
            return
        scope_id = urllib.parse.urlsplit(location).path.rstrip('/').rsplit('/', 1)[-1]
        collection = prefix + '/client-scopes/' + scope_id + '/protocol-mappers/models'
        status, location, _ = request('POST', collection, {
            'name': 'sbt-mapper', 'protocol': 'openid-connect',
            'protocolMapper': 'oidc-usermodel-attribute-mapper',
            'config': {'user.attribute': 'sbtAttribute', 'claim.name': 'sbtAttribute',
                       'jsonType.label': 'String'}})
        report['create_mapper'] = status
        if status != 201 or not location:
            return
        mapper_id = urllib.parse.urlsplit(location).path.rstrip('/').rsplit('/', 1)[-1]
        path = collection + '/' + mapper_id
        for label, key, value in [
            ('consent_text', 'consentText', 'sbt-consent-v44'),
            ('consent_required', 'consentRequired', True),
            ('consent_text_with_required', 'consentText', 'sbt-consent-required-v44'),
            ('name', 'name', 'sbt-mapper-renamed-v44'),
            ('config_claim', 'config', None),
            ('config_attribute', 'config', None),
        ]:
            check = report['checks'][label] = {}
            status, _, current = request('GET', path)
            check['read_before'] = status
            if status != 200 or not isinstance(current, dict):
                continue
            desired = dict(current)
            if label in ('config_claim', 'config_attribute'):
                field = 'user.attribute' if label == 'config_attribute' else 'claim.name'
                expected = 'sbtAttributeV45' if label == 'config_attribute' else 'sbtClaimV45'
                desired['config'] = dict(current.get('config') or {}, **{field: expected})
            else:
                desired[key] = value
                expected = value
            check['put'] = request('PUT', path, desired)[0]
            status, _, after = request('GET', path)
            check['read_after'] = status
            if status == 200 and isinstance(after, dict):
                actual = (after.get('config') or {}).get(field) if label in ('config_claim', 'config_attribute') else after.get(key)
                check['retained'] = actual == expected
                check['actual'] = actual
                check['identity_preserved'] = after.get('id') == mapper_id
    finally:
        if report.get('create_realm') == 201:
            report['cleanup'] = request('DELETE', '/admin/realms/' + realm)[0]
        print(json.dumps(report, indent=2))
    if (report.get('cleanup') != 204 or
            not all(report['checks'].get(name, {}).get('retained') for name in ('config_claim', 'config_attribute'))):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
