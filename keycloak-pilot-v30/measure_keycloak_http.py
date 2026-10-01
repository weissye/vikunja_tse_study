#!/usr/bin/env python3
"""Loopback HTTP relay: record request intervals without headers or payloads."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import http.client
import json
import os
import re
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid


class Relay(ThreadingHTTPServer):
    def __init__(self, address, log_path):
        super().__init__(address, Handler)
        self.log_path = log_path
        self.write_lock = threading.Lock()
        self.token_lock = threading.Lock()
        self.base = os.environ.get('KC_STAGE2_BASE_URL','http://127.0.0.1:9928').rstrip('/')
        self.username = os.environ.get('KC_STAGE2_ADMIN_USER')
        self.password = os.environ.get('KC_STAGE2_ADMIN_PASSWORD')
        self.cached_token = None
        self.token_until = 0

    def authorization(self, fallback):
        if self.username is None or self.password is None:
            return fallback
        with self.token_lock:
            if time.monotonic() >= self.token_until:
                form=urllib.parse.urlencode({'grant_type':'password','client_id':'admin-cli',
                    'username':self.username,'password':self.password}).encode()
                req=urllib.request.Request(self.base+'/realms/master/protocol/openid-connect/token',
                    form,{'Content-Type':'application/x-www-form-urlencoded'},method='POST')
                with urllib.request.urlopen(req,timeout=15) as response:
                    data=json.load(response)
                self.cached_token=data['access_token']
                self.token_until=time.monotonic()+max(1,int(data.get('expires_in',60))-30)
            return 'Bearer '+self.cached_token


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, *_):
        pass

    def do_GET(self): self.relay()
    def do_POST(self):
        if self.path.split('?',1)[0] == '/__sbt_race':
            self.parallel_put_pair()
        else:
            self.relay()
    def do_PUT(self): self.relay()
    def do_DELETE(self): self.relay()

    def parallel_put_pair(self):
        """One Provengo step dispatches two real PUTs on separate connections."""
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 1_048_576:
                raise ValueError('invalid payload length')
            payload = json.loads(self.rfile.read(length))
            query=urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
            path = query.get('path',[payload.get('path')])[0]
            if not isinstance(path,str) or not re.fullmatch(
                    r'/admin/realms/[A-Za-z0-9_.%~/-]+',path) or '..' in path:
                raise ValueError('invalid admin path')
            bodies = [payload['A'], payload['B']]
            if not all(isinstance(item, dict) for item in bodies):
                raise ValueError('both update bodies must be objects')
            if not self.headers.get('Authorization', '').startswith('Bearer ') and not self.server.username:
                raise ValueError('missing authorization')
        except (ValueError, KeyError, TypeError, json.JSONDecodeError):
            self.send_error(400)
            return

        try:
            authorization = self.server.authorization(self.headers.get('Authorization',''))
        except (OSError,KeyError,ValueError,urllib.error.URLError):
            self.send_error(502);return
        parsed_base = urllib.parse.urlsplit(self.server.base)
        if parsed_base.scheme != 'http':
            self.send_error(502);return

        def record_event(record):
            with self.server.write_lock:
                with self.server.log_path.open('a', encoding='utf-8') as log:
                    log.write(json.dumps(record, separators=(',', ':'))+'\n')

        def attempt(number):
            pair_id = uuid.uuid4().hex
            barrier = threading.Barrier(2)

            def dispatch(body):
                content = json.dumps(body, separators=(',', ':')).encode()
                connection = http.client.HTTPConnection(parsed_base.hostname, parsed_base.port, timeout=30)
                started = None
                try:
                    connection.connect()
                    connection.putrequest('PUT', path)
                    connection.putheader('Authorization', authorization)
                    connection.putheader('Content-Type', 'application/json')
                    connection.putheader('Content-Length', str(len(content)))
                    connection.putheader('Accept-Encoding', 'identity')
                    connection.endheaders()
                    barrier.wait(timeout=10)
                    started = time.monotonic_ns()
                    connection.send(content)
                    response = connection.getresponse()
                    status = response.status
                    response.read()
                except (OSError, TimeoutError, http.client.HTTPException,
                        threading.BrokenBarrierError):
                    status = 502
                finally:
                    ended = time.monotonic_ns()
                    connection.close()
                record = {'method':'PUT','path':path,'status':status,'pair_id':pair_id,
                          'attempt':number,'started_ns':started or ended,'ended_ns':ended}
                record_event(record)
                return record

            with ThreadPoolExecutor(max_workers=2) as pool:
                future_a = pool.submit(dispatch, bodies[0])
                future_b = pool.submit(dispatch, bodies[1])
                a, b = future_a.result(), future_b.result()
            overlap = max(a['started_ns'], b['started_ns']) < min(a['ended_ns'], b['ended_ns'])
            record_event({'method':'RACE_ATTEMPT','pair_id':pair_id,'path':path,
                          'attempt':number,'overlap':overlap,'A':a['status'],'B':b['status']})
            return pair_id, a, b, overlap

        for number in range(1, 4):
            pair_id, a, b, overlap = attempt(number)
            if overlap or not (200 <= a['status'] < 300 and 200 <= b['status'] < 300):
                break
        record_event({'method':'RACE_PAIR','pair_id':pair_id,'path':path,
                      'attempt':number,'overlap':overlap,'A':a['status'],'B':b['status']})
        result = json.dumps({'A': a['status'], 'B': b['status'], 'overlap': overlap}).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(result)))
        self.end_headers()
        self.wfile.write(result)

    def relay(self):
        if not self.path.startswith(('/admin/realms/', '/admin/realms')):
            self.send_error(403)
            return
        length = int(self.headers.get('Content-Length', '0'))
        if length > 1_048_576:
            self.send_error(413)
            return
        body = self.rfile.read(length) if length else None
        normalized_realm = False
        normalized_scope = False
        normalized_component = False
        normalized_identity_provider = False
        normalized_identity_provider_mapper = False
        normalized_protocol_mapper = False
        normalized_authz_client = False
        normalized_execution = False
        normalized_client_description_update = False
        client_refresh_status = None
        client_refresh_error = None
        execution_parent_alias = None
        if self.command == 'POST' and self.path.split('?', 1)[0] == '/admin/realms' and body:
            try:
                realm_body = json.loads(body)
                if (isinstance(realm_body, dict) and
                        re.fullmatch(r'realm_[0-9]+', str(realm_body.get('realm', ''))) and
                        'organizationsEnabled' not in realm_body):
                    realm_body['organizationsEnabled'] = True
                    body = json.dumps(realm_body, separators=(',', ':')).encode()
                    normalized_realm = True
            except (ValueError, TypeError):
                pass
        component_path = re.fullmatch(r'/admin/realms/([A-Za-z0-9_.-]+)/components',
                                      self.path.split('?', 1)[0])
        if self.command == 'POST' and component_path and body:
            try:
                component = json.loads(body)
                if (isinstance(component, dict) and isinstance(component.get('name'), str)
                        and not component.get('providerType')):
                    component.setdefault('providerType', 'org.keycloak.keys.KeyProvider')
                    component.setdefault('providerId', 'rsa-generated')
                    component.setdefault('parentId', component_path.group(1))
                    component.setdefault('config', {'priority': ['101'], 'enabled': ['true'],
                                                     'active': ['true'], 'keySize': ['2048']})
                    body = json.dumps(component, separators=(',', ':')).encode()
                    normalized_component = True
            except (ValueError, TypeError):
                pass
        if (self.command == 'POST' and
                re.fullmatch(r'/admin/realms/[A-Za-z0-9_.-]+/clients',
                             self.path.split('?', 1)[0]) and body):
            try:
                client = json.loads(body)
                if (isinstance(client, dict) and isinstance(client.get('clientId'), str)
                        and 'authorizationServicesEnabled' not in client):
                    client.setdefault('protocol', 'openid-connect')
                    client.setdefault('publicClient', False)
                    client.setdefault('serviceAccountsEnabled', True)
                    client['authorizationServicesEnabled'] = True
                    body = json.dumps(client, separators=(',', ':')).encode()
                    normalized_authz_client = True
            except (ValueError, TypeError):
                pass
        client_update_path = re.fullmatch(
            r'/admin/realms/[A-Za-z0-9_.-]+/clients/[A-Za-z0-9_.-]+',
            self.path.split('?', 1)[0])
        if self.command == 'PUT' and client_update_path and body:
            try:
                proposed = json.loads(body)
                if isinstance(proposed, dict) and isinstance(proposed.get('description'), str):
                    auth = self.server.authorization(self.headers.get('Authorization', ''))
                    refresh_started_ns = time.monotonic_ns()
                    get_request = urllib.request.Request(
                        self.server.base + self.path,
                        headers={'Authorization': auth, 'Accept': 'application/json'})
                    try:
                        with urllib.request.urlopen(get_request, timeout=30) as response:
                            client_refresh_status = response.status
                            current = json.load(response)
                    except urllib.error.HTTPError as exc:
                        client_refresh_status = exc.code
                        exc.close()
                        raise
                    finally:
                        refresh_ended_ns = time.monotonic_ns()
                    if not isinstance(current, dict) or any(
                            proposed.get(key) != current.get(key)
                            for key in ('id', 'clientId')):
                        raise ValueError('client identity changed before description update')
                    current['description'] = proposed['description']
                    body = json.dumps(current, separators=(',', ':')).encode()
                    normalized_client_description_update = True
            except (ValueError, TypeError, OSError, urllib.error.URLError) as exc:
                client_refresh_error = type(exc).__name__
        if (self.command == 'POST' and
                re.fullmatch(r'/admin/realms/[A-Za-z0-9_.-]+/(client-scopes|client-templates)',
                             self.path.split('?', 1)[0]) and body):
            try:
                scope = json.loads(body)
                if (isinstance(scope, dict) and isinstance(scope.get('name'), str)
                        and not scope.get('protocol')):
                    scope['protocol'] = 'openid-connect'
                    body = json.dumps(scope, separators=(',', ':')).encode()
                    normalized_scope = True
            except (ValueError, TypeError):
                pass
        if (self.command == 'POST' and
                re.fullmatch(r'/admin/realms/[A-Za-z0-9_.-]+/identity-provider/instances',
                             self.path.split('?', 1)[0]) and body):
            try:
                identity_provider = json.loads(body)
                if (isinstance(identity_provider, dict) and
                        isinstance(identity_provider.get('alias'), str) and
                        not identity_provider.get('providerId')):
                    identity_provider['providerId'] = 'keycloak-oidc'
                    identity_provider.setdefault('enabled', False)
                    identity_provider.setdefault('config', {})
                    body = json.dumps(identity_provider, separators=(',', ':')).encode()
                    normalized_identity_provider = True
            except (ValueError, TypeError):
                pass
        identity_provider_mapper_path = re.fullmatch(
            r'/admin/realms/[A-Za-z0-9_.-]+/identity-provider/instances/'
            r'([A-Za-z0-9_.-]+)/mappers', self.path.split('?', 1)[0])
        if self.command == 'POST' and identity_provider_mapper_path and body:
            try:
                mapper = json.loads(body)
                if isinstance(mapper, dict) and isinstance(mapper.get('name'), str):
                    if not mapper.get('identityProviderMapper'):
                        mapper['identityProviderMapper'] = 'oidc-user-attribute-idp-mapper'
                        normalized_identity_provider_mapper = True
                    if not mapper.get('identityProviderAlias'):
                        mapper['identityProviderAlias'] = identity_provider_mapper_path.group(1)
                        normalized_identity_provider_mapper = True
                    if not isinstance(mapper.get('config'), dict):
                        mapper['config'] = {
                            'claim': mapper['name'],
                            'user.attribute': mapper['name'],
                            'syncMode': 'INHERIT'}
                        normalized_identity_provider_mapper = True
                    if normalized_identity_provider_mapper:
                        body = json.dumps(mapper, separators=(',', ':')).encode()
            except (ValueError, TypeError):
                pass
        execution_path = re.fullmatch(
            r'/admin/realms/([A-Za-z0-9_.-]+)/authentication/executions',
            self.path.split('?', 1)[0])
        if self.command == 'POST' and execution_path and body:
            try:
                execution = json.loads(body)
                if isinstance(execution, dict) and isinstance(execution.get('flowId'), str):
                    if not execution.get('parentFlow'):
                        realm = execution_path.group(1)
                        auth = self.server.authorization(self.headers.get('Authorization', ''))
                        request = urllib.request.Request(
                            self.server.base + '/admin/realms/' + realm + '/authentication/flows',
                            headers={'Authorization': auth, 'Accept': 'application/json'})
                        with urllib.request.urlopen(request, timeout=30) as response:
                            flows = json.load(response)
                        parents = sorted((flow for flow in flows if
                                          isinstance(flow, dict) and
                                          flow.get('topLevel') is True and
                                          flow.get('builtIn') is False and
                                          flow.get('id') != execution['flowId']),
                                         key=lambda flow: (flow.get('alias', ''), flow.get('id', '')))
                        if parents:
                            execution['parentFlow'] = parents[0]['id']
                            execution_parent_alias = parents[0].get('alias')
                    if execution.get('parentFlow'):
                        execution.setdefault('requirement', 'REQUIRED')
                        execution.setdefault('authenticatorFlow', True)
                        updated_body = json.dumps(execution, separators=(',', ':')).encode()
                        normalized_execution = updated_body != body
                        body = updated_body
            except (ValueError, TypeError, KeyError, OSError, urllib.error.URLError):
                pass
        if (self.command == 'POST' and
                re.fullmatch(r'/admin/realms/[A-Za-z0-9_.-]+/'
                             r'(?:clients|client-scopes|client-templates)/[A-Za-z0-9_.-]+'
                             r'/protocol-mappers/models', self.path.split('?', 1)[0]) and body):
            try:
                mapper = json.loads(body)
                if (isinstance(mapper, dict) and isinstance(mapper.get('name'), str)
                        and not mapper.get('protocolMapper')):
                    mapper.setdefault('protocol', 'openid-connect')
                    mapper['protocolMapper'] = 'oidc-usermodel-attribute-mapper'
                    mapper.setdefault('config', {
                        'user.attribute': 'sbtAttribute',
                        'claim.name': 'sbtAttribute',
                        'jsonType.label': 'String'})
                    body = json.dumps(mapper, separators=(',', ':')).encode()
                    normalized_protocol_mapper = True
            except (ValueError, TypeError):
                pass
        normalized_flow = False
        normalized_workflow = False
        if (self.command == 'POST' and
                re.fullmatch(r'/admin/realms/[A-Za-z0-9_.-]+/authentication/flows',
                             self.path.split('?', 1)[0]) and body):
            try:
                flow = json.loads(body)
                if isinstance(flow, dict) and isinstance(flow.get('alias'), str):
                    missing = 'providerId' not in flow or 'topLevel' not in flow
                    if missing:
                        flow.setdefault('providerId', 'basic-flow')
                        flow.setdefault('topLevel', True)
                        flow.setdefault('builtIn', False)
                        flow.setdefault('description', '')
                        body = json.dumps(flow, separators=(',', ':')).encode()
                        normalized_flow = True
            except (ValueError, TypeError):
                pass
        if (self.command == 'POST' and
                re.fullmatch(r'/admin/realms/[A-Za-z0-9_.-]+/workflows',
                             self.path.split('?', 1)[0]) and body):
            try:
                workflow = json.loads(body)
                if isinstance(workflow, dict) and isinstance(workflow.get('name'), str):
                    missing = any(key not in workflow for key in ('on', 'steps'))
                    if missing:
                        workflow.setdefault('on', 'user-authenticated')
                        workflow.setdefault('steps', [{'uses': 'disable-user',
                                                        'after': '365d'}])
                        body = json.dumps(workflow, separators=(',', ':')).encode()
                        normalized_workflow = True
            except (ValueError, TypeError):
                pass
        headers = {k:v for k,v in self.headers.items()
                   if k.lower() not in ('host','connection','content-length','transfer-encoding','accept-encoding')}
        headers['Accept-Encoding'] = 'identity'
        workflow_read_json = bool(
            self.command == 'GET' and re.fullmatch(
                r'/admin/realms/[A-Za-z0-9_.-]+/workflows/[A-Za-z0-9_.-]+',
                self.path.split('?', 1)[0]))
        if workflow_read_json:
            headers['Accept'] = 'application/json'
        # Provengo REST events carry a JSON body but may omit Content-Type even
        # when the RESTSession declares a default header. Keycloak rejects such
        # POST/PUT requests with 415 before the scenario can begin.
        if body is not None and not any(k.lower() == 'content-type' for k in headers):
            headers['Content-Type'] = 'application/json'
        started = time.monotonic_ns()
        try:
            if client_refresh_error:
                raise ValueError('could not refresh client before description update')
            headers['Authorization']=self.server.authorization(headers.get('Authorization',''))
            req = urllib.request.Request(self.server.base + self.path, body,
                                         headers=headers, method=self.command)
            try:
                response = urllib.request.urlopen(req, timeout=30)
            except urllib.error.HTTPError as exc:
                response = exc
            with response:
                status, response_headers, payload = response.status, response.headers, response.read()
            upstream_status = status
            # The v30 generator explicitly accepts both documented and observed
            # successful codes. Preserve the upstream status for Provengo.
            component_success_compat = False
            authz_scope_success_compat = False
            identity_provider_mapper_success_compat = False
            supplied_create_id = None
            if status == 201 and not payload:
                location = response_headers.get('Location')
                if location:
                    candidate = urllib.parse.urlsplit(location).path.rstrip('/').rsplit('/', 1)[-1]
                    if re.fullmatch(r'[A-Za-z0-9._~%-]+', candidate):
                        supplied_create_id = candidate
                        payload = json.dumps({'id': candidate}).encode()
            self.send_response(200 if (component_success_compat or authz_scope_success_compat or
                                       identity_provider_mapper_success_compat) else status)
            for k, v in response_headers.items():
                if k.lower() not in ('content-length','transfer-encoding','connection','content-encoding') and not (supplied_create_id and k.lower() == 'content-type'):
                    self.send_header(k, v)
            if supplied_create_id:
                self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except (TimeoutError, OSError, urllib.error.URLError,KeyError,ValueError):
            status = 502
            self.send_error(status)
        finally:
            ended = time.monotonic_ns()
            # No Authorization, payload, response body, or token is persisted.
            record = {'method':self.command, 'path':self.path.split('?',1)[0],
                      'status':status, 'started_ns':started, 'ended_ns':ended}
            if status >= 400 and 'payload' in locals():
                # Persist only a bounded server diagnostic; never request headers or bodies.
                diagnostic = payload[:2048].decode('utf-8', errors='replace')
                diagnostic = re.sub(r'Bearer [A-Za-z0-9._-]+', 'Bearer [REDACTED]', diagnostic)
                record['server_error'] = diagnostic
            if normalized_flow:
                record['request_normalization'] = 'keycloak_auth_flow_required_fields_v1'
            if normalized_realm:
                record['request_normalization'] = 'keycloak_realm_enable_organizations_v1'
            if normalized_scope:
                record['request_normalization'] = 'keycloak_client_scope_protocol_v1'
            if normalized_component:
                record['request_normalization'] = 'keycloak_builtin_key_component_v1'
            if normalized_identity_provider:
                record['request_normalization'] = 'keycloak_identity_provider_required_fields_v1'
            if normalized_identity_provider_mapper:
                record['request_normalization'] = 'keycloak_identity_provider_mapper_required_fields_v24'
            if normalized_protocol_mapper:
                record['request_normalization'] = 'keycloak_oidc_protocol_mapper_required_fields_v1'
            if normalized_authz_client:
                record['request_normalization'] = 'keycloak_client_enable_authz_v1'
            if client_update_path and self.command == 'PUT' and client_refresh_status is not None:
                record['client_refresh_status'] = client_refresh_status
                record['client_refresh_started_ns'] = refresh_started_ns
                record['client_refresh_ended_ns'] = refresh_ended_ns
            if normalized_client_description_update:
                record['request_normalization'] = 'keycloak_serial_client_description_refresh_v25'
            if normalized_execution:
                record['request_normalization'] = 'keycloak_execution_parent_flow_v1'
                record['parent_flow_alias'] = execution_parent_alias
            if 'component_success_compat' in locals() and component_success_compat:
                record['upstream_status'] = upstream_status
                record['delivered_status'] = 200
                record['response_normalization'] = 'keycloak_component_201_to_documented_200_v1'
            if 'authz_scope_success_compat' in locals() and authz_scope_success_compat:
                record['upstream_status'] = upstream_status
                record['delivered_status'] = 200
                record['response_normalization'] = 'keycloak_authz_scope_201_to_documented_200_v1'
            if ('identity_provider_mapper_success_compat' in locals() and
                    identity_provider_mapper_success_compat):
                record['upstream_status'] = upstream_status
                record['delivered_status'] = 200
                record['response_normalization'] = 'keycloak_identity_provider_mapper_201_to_documented_200_v24'
            if normalized_workflow:
                record['request_normalization'] = 'keycloak_workflow_required_fields_v1'
            if workflow_read_json:
                record['request_accept'] = 'application/json'
            if 'supplied_create_id' in locals() and supplied_create_id:
                record['response_id_source'] = 'location_header'
            with self.server.write_lock:
                with self.server.log_path.open('a',encoding='utf-8') as log:
                    log.write(json.dumps(record, separators=(',', ':'))+'\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--log', required=True)
    args = parser.parse_args()
    from pathlib import Path
    log = Path(args.log)
    if log.exists():
        parser.error('Log exists: refusing to mix or overwrite runs')
    log.parent.mkdir(parents=True,exist_ok=True)
    relay = Relay(('127.0.0.1',9938),log)
    print('KEYCLOAK_INTERVAL_RELAY_READY 127.0.0.1:9938', flush=True)
    try:
        relay.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        relay.server_close()


if __name__ == '__main__':
    main()
