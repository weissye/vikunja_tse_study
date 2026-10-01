"""Local fake HTTP server checks the reused proxy/barrier wiring end to end."""
import importlib.util
import json
import socket
import sys
import tempfile
import threading
import time
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from types import SimpleNamespace

script_dir = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(script_dir))
if not (script_dir / 'run_immich_album_serial.py').is_file():
    sys.path.insert(0, str(script_dir.parents[1] / 'immich_live_patch' / 'scripts'))
spec = importlib.util.spec_from_file_location('overlap', script_dir / 'run_immich_album_concurrent.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class OverlapIntegrationTest(unittest.TestCase):
    def test_two_disjoint_updates_are_witnessed_through_proxy(self):
        state = {'id': 'fake-id', 'albumName': '', 'description': ''}
        lock = threading.Lock()
        class SUT(BaseHTTPRequestHandler):
            def log_message(self, *_): pass
            def send(self, status, value=None):
                raw = json.dumps(value).encode() if value is not None else b''
                self.send_response(status)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(raw)))
                self.end_headers()
                self.wfile.write(raw)
            def read_body(self):
                return json.loads(self.rfile.read(int(self.headers['Content-Length'])))
            def do_POST(self):
                with lock: state.update({'albumName': self.read_body()['albumName'], 'description': ''})
                self.send(201, dict(state))
            def do_GET(self): self.send(200, dict(state))
            def do_PATCH(self):
                body = self.read_body()
                time.sleep(.05)
                with lock: state.update(body)
                self.send(200, dict(state))
            def do_DELETE(self): self.send(204)
        sut = ThreadingHTTPServer(('127.0.0.1', 0), SUT)
        with tempfile.TemporaryDirectory() as tmp:
            trace = Path(tmp) / 'trace.jsonl'
            sut_url = 'http://127.0.0.1:%d' % sut.server_port
            # The fake SUT does not need an auth token, but the real proxy
            # requires one; keep this local to the test process.
            import os
            os.environ['TEST_IMMICH_BEARER'] = 'only-a-local-test-token'
            try:
                proxy = mod.build_proxy(SimpleNamespace(listen_host='127.0.0.1', listen_port=0,
                    target=sut_url, api_prefix='/api', trace=str(trace),
                    bearer_token_env='TEST_IMMICH_BEARER', require_bearer_token=True,
                    authorization_scheme='Bearer', timeout=10.0))
            finally:
                os.environ.pop('TEST_IMMICH_BEARER', None)
            adapter = mod.build_adapter(SimpleNamespace(listen_host='127.0.0.1', listen_port=0,
                upstream='http://127.0.0.1:%d' % proxy.server_port,
                epoch_log=str(Path(tmp) / 'epochs.jsonl'), max_width=2,
                timeout=10.0, quiescence_ms=5))
            servers = (sut, proxy, adapter)
            try:
                for server in servers:
                    threading.Thread(target=server.serve_forever, daemon=True).start()
                record = mod.one_trial('http://127.0.0.1:%d' % proxy.server_port,
                    'http://127.0.0.1:%d' % adapter.server_port, trace,
                    1, 'local-integration', 1, __import__('random').Random(3))
                self.assertEqual('PASS', record['verdict'], record)
                self.assertTrue(record['overlap'])
                self.assertTrue(record['proxy_overlap'])
                self.assertEqual([200, 200], record['statuses'])
                self.assertNotIn('only-a-local-test-token', trace.read_text())
                self.assertNotIn('only-a-local-test-token', (Path(tmp) / 'epochs.jsonl').read_text())
            finally:
                for server in servers:
                    server.shutdown()
                    server.server_close()


if __name__ == '__main__': unittest.main()
