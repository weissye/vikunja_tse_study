#!/usr/bin/env python3
"""Probe a workflow read response without retaining or printing its body."""
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
    realm = 'sbt_workflow_probe_' + uuid.uuid4().hex[:12]
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
            return response.status, response.headers.get('Location'), \
                response.headers.get('Content-Type'), response.read()

    try:
        status, _, _, _ = request('POST', '/admin/realms',
                                   {'realm': realm, 'enabled': True})
        result['create_realm'] = status
        if status != 201:
            return
        prefix = '/admin/realms/' + urllib.parse.quote(realm, safe='')
        status, location, _, payload = request('POST', prefix + '/workflows', {
            'name': 'sbt-probe-workflow', 'on': 'user-authenticated',
            'steps': [{'uses': 'disable-user', 'after': '365d'}]})
        result['create_workflow'] = status
        result['create_response_bytes'] = len(payload)
        if status != 201 or not location:
            return
        workflow_id = urllib.parse.urlsplit(location).path.rstrip('/').rsplit('/', 1)[-1]
        result['location_id_valid'] = bool(uuid.UUID(workflow_id))
        status, _, content_type, payload = request('GET', prefix + '/workflows/' + workflow_id)
        result['read_workflow'] = status
        result['read_content_type'] = content_type
        result['read_response_bytes'] = len(payload)
        try:
            parsed = json.loads(payload)
            result['read_json_type'] = type(parsed).__name__
        except (ValueError, UnicodeDecodeError):
            result['read_json_type'] = None
    finally:
        if result.get('create_realm') == 201:
            result['cleanup'] = request('DELETE', '/admin/realms/' + realm)[0]
        print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
