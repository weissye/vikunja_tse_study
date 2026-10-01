import json
import os
import sys
import tempfile
import threading
import time
import unittest
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.trace_proxy import build_server as build_proxy
from openapi_to_sbt.concurrency_adapter import build_server as build_adapter, validate_epoch


def request(url, method='GET', data=None, headers=None):
    payload = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, method=method, data=payload, headers=headers or {})
    with urllib.request.urlopen(req, timeout=5) as response:
        return json.loads(response.read())


class Backend(BaseHTTPRequestHandler):
    value = {'v': 'base'}
    write_seen = threading.Event()
    def log_message(self, *_):
        pass
    def do_PUT(self):
        data = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        time.sleep(.08)
        Backend.value = data
        Backend.write_seen.set()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(Backend.value).encode())


class EpochLeaseTest(unittest.TestCase):
    def test_post_join_observation_precedes_unrelated_write_to_same_resource(self):
        with tempfile.TemporaryDirectory() as tmp:
            Backend.value, Backend.write_seen = {'v': 'base'}, threading.Event()
            backend = ThreadingHTTPServer(('127.0.0.1', 0), Backend)
            os.environ['SBT_TEST_TOKEN'] = 'test-token'
            trace = Path(tmp) / 'trace.jsonl'
            proxy = build_proxy(SimpleNamespace(target='http://127.0.0.1:%d' % backend.server_port,
                api_prefix='',trace=str(trace), bearer_token_env='SBT_TEST_TOKEN',
                require_bearer_token=True, authorization_scheme='Bearer', listen_host='127.0.0.1',
                listen_port=0,timeout=5))
            adapter = build_adapter(SimpleNamespace(upstream='http://127.0.0.1:%d' % proxy.server_port,
                epoch_log=str(Path(tmp)/'epochs.jsonl'),listen_host='127.0.0.1',listen_port=0,
                timeout=5,max_width=8,quiescence_ms=100,openapi_path=None))
            servers = (backend, proxy, adapter)
            threads = [threading.Thread(target=s.serve_forever, daemon=True) for s in servers]
            for t in threads: t.start()
            try:
                epoch = {'epoch_id':'generated-epoch-0',
                    'operations':[{'operation_id':'generated-epoch-0-op-'+str(i),
                                   'method':'PUT','path':'/resource/1','body':{'v':str(i)}}
                                  for i in range(2)],
                    'post_join_observation':{'method':'GET','path':'/resource/1'}}
                posted = {}
                def run_epoch():
                    posted['record'] = request('http://127.0.0.1:%d/epochs' % adapter.server_port,
                                               method='POST', data=epoch, headers={'Content-Type':'application/json'})
                t = threading.Thread(target=run_epoch); t.start()
                self.assertTrue(Backend.write_seen.wait(3))
                later = threading.Thread(target=lambda: request('http://127.0.0.1:%d/resource/1' % proxy.server_port,
                    method='PUT', data={'v':'later'},headers={'Content-Type':'application/json'}))
                later.start(); t.join(5); later.join(5)
                self.assertFalse(t.is_alive()); self.assertFalse(later.is_alive())
                rows=[json.loads(line) for line in trace.read_text().splitlines()]
                observed=next(r for r in rows if r.get('operation_id')=='generated-epoch-0-observe')
                other=next(r for r in rows if r['method']=='PUT' and not r.get('epoch_id'))
                self.assertLess(observed['trace_sequence'],other['trace_sequence'])
                self.assertIn(posted['record']['post_join_observation']['response']['v'],('0','1'))
                self.assertTrue(posted['record']['overlap_observed'])
            finally:
                for s in servers: s.shutdown(); s.server_close()
                for t in threads: t.join(2)
                os.environ.pop('SBT_TEST_TOKEN', None)

    def test_observation_must_bind_to_exact_epoch_path(self):
        epoch={'epoch_id':'generated-epoch-0','operations':[
            {'operation_id':'generated-epoch-0-op-'+str(i),'method':'PUT',
             'path':'/resource/1','body':{'v':i}} for i in range(2)],
            'post_join_observation':{'method':'GET','path':'/resource/2'}}
        with self.assertRaisesRegex(ValueError,'same concrete path'):
            validate_epoch(epoch)


if __name__ == '__main__': unittest.main()
