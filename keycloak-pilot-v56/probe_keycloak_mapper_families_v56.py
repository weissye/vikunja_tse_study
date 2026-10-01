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
        families = [
            ('client', '/clients', {'clientId': 'sbt-mapper-client', 'serviceAccountsEnabled': True}),
            ('client_template', '/client-templates', {'name': 'sbt-mapper-template', 'protocol': 'openid-connect'}),
        ]
        for label, collection, body in families:
            check = report['checks'][label] = {}
            status, location, _ = request('POST', prefix + collection, body)
            check['create_parent'] = status
            if status != 201 or not location:
                continue
            parent_id = urllib.parse.urlsplit(location).path.rstrip('/').rsplit('/', 1)[-1]
            mapper_collection = prefix + collection + '/' + parent_id + '/protocol-mappers/models'
            status, location, _ = request('POST', mapper_collection, {
                'name': 'sbt-mapper-' + label, 'protocol': 'openid-connect',
                'protocolMapper': 'oidc-usermodel-attribute-mapper',
                'config': {'user.attribute': 'sbtAttribute', 'claim.name': 'sbtAttribute',
                           'jsonType.label': 'String'}})
            check['create_mapper'] = status
            if status != 201 or not location:
                continue
            mapper_id = urllib.parse.urlsplit(location).path.rstrip('/').rsplit('/', 1)[-1]
            path = mapper_collection + '/' + mapper_id
            status, _, current = request('GET', path)
            check['read_before'] = status
            if status != 200 or not isinstance(current, dict):
                continue
            desired = dict(current)
            desired['config'] = dict(current.get('config') or {}, **{'claim.name': 'sbtClaimV56'})
            check['put_claim'] = request('PUT', path, desired)[0]
            status, _, after = request('GET', path)
            check['read_after_claim'] = status
            check['claim_retained'] = (status == 200 and isinstance(after, dict) and
                                       (after.get('config') or {}).get('claim.name') == 'sbtClaimV56')
            if label == 'client' and status == 200 and isinstance(after, dict):
                desired = dict(after)
                desired['config'] = dict(after.get('config') or {}, **{'user.attribute': 'sbtAttributeV56'})
                check['put_attribute'] = request('PUT', path, desired)[0]
                status, _, after = request('GET', path)
                check['read_after_attribute'] = status
                check['attribute_retained'] = (status == 200 and isinstance(after, dict) and
                                               (after.get('config') or {}).get('user.attribute') == 'sbtAttributeV56')
    finally:
        if report.get('create_realm') == 201:
            report['cleanup'] = request('DELETE', '/admin/realms/' + realm)[0]
        print(json.dumps(report, indent=2))
        if (report.get('cleanup') != 204 or
                not all(report['checks'].get(name, {}).get('claim_retained') for name in ('client', 'client_template')) or
                not report['checks'].get('client', {}).get('attribute_retained')):
            raise SystemExit(1)


if __name__ == '__main__':
    main()
