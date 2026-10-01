import json
import socket
import sys
import tempfile
import threading
import unittest
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.concurrency_adapter import build_server


def port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


class FakeHTTP(BaseHTTPRequestHandler):
    values = {'/a/1': 'before-a', '/b/2': 'before-b'}
    def log_message(self, *_args):
        pass
    def reply(self, status, value):
        payload = json.dumps(value).encode()
        self.send_response(status)
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)
    def do_POST(self):
        self.rfile.read(int(self.headers.get('Content-Length', 0)))
        self.reply(200, {'ok': True})
    def do_GET(self):
        self.reply(200, {'value': self.values[self.path]})
    def do_PUT(self):
        import time
        value = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        time.sleep(.08)
        self.values[self.path] = value['value']
        self.reply(200, value)


class MultiResourceAdapterTest(unittest.TestCase):
    def test_two_distinct_writes_and_leased_reads(self):
        backend = ThreadingHTTPServer(('127.0.0.1', port()), FakeHTTP)
        with tempfile.TemporaryDirectory() as temp:
            adapter = build_server(SimpleNamespace(
                upstream='http://127.0.0.1:%d' % backend.server_port,
                listen_host='127.0.0.1', listen_port=port(), timeout=5,
                epoch_log=str(Path(temp) / 'epochs.jsonl'), max_width=8,
                openapi_path=None, quiescence_ms=0))
            threads = [threading.Thread(target=server.serve_forever, daemon=True)
                       for server in (backend, adapter)]
            for thread in threads: thread.start()
            try:
                epoch = {'epoch_id': 'cross', 'operations': [
                    {'operation_id': 'cross-0', 'method': 'PUT', 'path': '/a/1', 'body': {'value': 'A'}},
                    {'operation_id': 'cross-1', 'method': 'PUT', 'path': '/b/2', 'body': {'value': 'B'}}],
                    'post_join_observations': [
                        {'method': 'GET', 'path': '/a/1'}, {'method': 'GET', 'path': '/b/2'}]}
                req = urllib.request.Request('http://127.0.0.1:%d/epochs' % adapter.server_port,
                                             data=json.dumps(epoch).encode(),
                                             headers={'Content-Type': 'application/json'}, method='POST')
                with urllib.request.urlopen(req, timeout=5) as response:
                    result = json.load(response)
                self.assertTrue(result['overlap_observed'])
                self.assertEqual([x['response']['value'] for x in result['post_join_observations']], ['A', 'B'])
                self.assertTrue(all(x['status'] == 200 for x in result['operations']))
            finally:
                for server in (adapter, backend): server.shutdown(); server.server_close()
                for thread in threads: thread.join(timeout=2)


if __name__ == '__main__':
    unittest.main()
