#!/usr/bin/env python3
"""Loopback HTTP relay: record request intervals without headers or payloads."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import re
import threading
import time
import urllib.error
import urllib.request


class Relay(ThreadingHTTPServer):
    def __init__(self, address, log_path):
        super().__init__(address, Handler)
        self.log_path = log_path
        self.write_lock = threading.Lock()


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, *_):
        pass

    def do_GET(self): self.relay()
    def do_POST(self):
        if self.path == '/__sbt_race':
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
            path = payload['path']
            if not isinstance(path, str) or not re.fullmatch(
                    r'/admin/realms/[A-Za-z0-9-]+/users/[A-Za-z0-9-]+', path):
                raise ValueError('invalid user path')
            bodies = [payload['A'], payload['B']]
            if not all(isinstance(item, dict) for item in bodies):
                raise ValueError('both update bodies must be objects')
            if not self.headers.get('Authorization', '').startswith('Bearer '):
                raise ValueError('missing authorization')
        except (ValueError, KeyError, TypeError, json.JSONDecodeError):
            self.send_error(400)
            return

        barrier = threading.Barrier(2)
        authorization = self.headers['Authorization']

        def dispatch(body):
            req = urllib.request.Request(
                'http://127.0.0.1:9928' + path,
                json.dumps(body, separators=(',', ':')).encode(),
                headers={'Authorization': authorization,
                         'Content-Type': 'application/json',
                         'Accept-Encoding': 'identity'}, method='PUT')
            try:
                barrier.wait(timeout=10)
                started = time.monotonic_ns()
                try:
                    with urllib.request.urlopen(req, timeout=30) as response:
                        status = response.status
                        response.read()
                except urllib.error.HTTPError as exc:
                    status = exc.code
                    exc.close()
            except (TimeoutError, OSError, urllib.error.URLError, threading.BrokenBarrierError):
                started = locals().get('started', time.monotonic_ns())
                status = 502
            ended = time.monotonic_ns()
            record = {'method': 'PUT', 'path': path, 'status': status,
                      'started_ns': started, 'ended_ns': ended}
            with self.server.write_lock:
                with self.server.log_path.open('a', encoding='utf-8') as log:
                    log.write(json.dumps(record, separators=(',', ':'))+'\n')
            return record

        with ThreadPoolExecutor(max_workers=2) as pool:
            future_a = pool.submit(dispatch, bodies[0])
            future_b = pool.submit(dispatch, bodies[1])
            a, b = future_a.result(), future_b.result()
        overlap = max(a['started_ns'], b['started_ns']) < min(a['ended_ns'], b['ended_ns'])
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
        headers = {k:v for k,v in self.headers.items()
                   if k.lower() not in ('host','connection','content-length','transfer-encoding','accept-encoding')}
        headers['Accept-Encoding'] = 'identity'
        req = urllib.request.Request('http://127.0.0.1:9928' + self.path, body,
                                     headers=headers, method=self.command)
        started = time.monotonic_ns()
        try:
            try:
                response = urllib.request.urlopen(req, timeout=30)
            except urllib.error.HTTPError as exc:
                response = exc
            with response:
                status, response_headers, payload = response.status, response.headers, response.read()
            self.send_response(status)
            for k, v in response_headers.items():
                if k.lower() not in ('content-length','transfer-encoding','connection','content-encoding'):
                    self.send_header(k, v)
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except (TimeoutError, OSError, urllib.error.URLError):
            status = 502
            self.send_error(status)
        finally:
            ended = time.monotonic_ns()
            # No Authorization, payload, response body, or token is persisted.
            record = {'method':self.command, 'path':self.path.split('?',1)[0],
                      'status':status, 'started_ns':started, 'ended_ns':ended}
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
