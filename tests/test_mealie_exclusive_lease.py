"""The focused experiment must keep unrelated writers outside its control window."""
import importlib.util
import json
import tempfile
import threading
import time
import unittest
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from types import SimpleNamespace


PROXY = Path(__file__).resolve().parents[1] / 'generator_baseline/openapi_to_sbt/trace_proxy.py'
spec = importlib.util.spec_from_file_location('focused_trace_proxy', PROXY)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
ADAPTER = PROXY.with_name('concurrency_adapter.py')
adapter_spec = importlib.util.spec_from_file_location('focused_concurrency_adapter', ADAPTER)
adapter_module = importlib.util.module_from_spec(adapter_spec)
adapter_spec.loader.exec_module(adapter_module)


class Upstream(BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps(self.server.writes[-1] if self.server.writes else {}).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_PUT(self):
        body = self.rfile.read(int(self.headers['Content-Length']))
        self.server.writes.append(json.loads(body))
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_args):
        pass


class ExclusiveLeaseTest(unittest.TestCase):
    def test_writer_waits_and_controls_keep_distinct_epoch_tags(self):
        with tempfile.TemporaryDirectory() as temp:
            upstream = ThreadingHTTPServer(('127.0.0.1', 0), Upstream)
            upstream.writes = []
            trace = Path(temp) / 'trace.jsonl'
            proxy = module.build_server(SimpleNamespace(
                listen_host='127.0.0.1', listen_port=0,
                target='http://127.0.0.1:%d' % upstream.server_port,
                api_prefix='', trace=str(trace), bearer_token_env=None,
                require_bearer_token=False, authorization_scheme='Bearer', timeout=4.0))
            adapter = adapter_module.build_server(SimpleNamespace(
                listen_host='127.0.0.1', listen_port=0,
                upstream='http://127.0.0.1:%d' % proxy.server_port,
                epoch_log=str(Path(temp) / 'epochs.jsonl'), max_width=2,
                openapi_path=None, timeout=4.0, quiescence_ms=5))
            threads = [threading.Thread(target=server.serve_forever, daemon=True)
                       for server in (upstream, proxy, adapter)]
            for thread in threads:
                thread.start()
            url = 'http://127.0.0.1:%d' % proxy.server_port
            path, owner = '/resources/one', 'generated-epoch-0'

            def send(method, route, body, headers=None):
                payload = json.dumps(body).encode('utf-8')
                request = urllib.request.Request(url + route, data=payload, method=method,
                    headers={'Content-Type': 'application/json', **(headers or {})})
                with urllib.request.urlopen(request, timeout=6) as response:
                    return response.status

            try:
                lease = {'path': path, 'epoch_id': owner}
                lifecycle = {'X-SBT-Research-Lifecycle': 'exclusive'}
                self.assertEqual(send('POST', '/__sbt/lease', lease, lifecycle), 200)
                done = threading.Event()

                def outside():
                    send('PUT', path, {'outside': True})
                    done.set()

                blocked = threading.Thread(target=outside, daemon=True)
                blocked.start()
                time.sleep(.2)
                self.assertFalse(done.is_set())
                self.assertEqual(upstream.writes, [])
                self.assertEqual(send('POST', '/__sbt/assert-lease', lease), 200)
                self.assertEqual(send('PUT', path, {'control': True}, {
                    'X-SBT-Research-Owner': owner,
                    'X-Provengo-Epoch-Id': 'generated-control-0'}), 200)
                epoch = {'epoch_id': owner, 'scenario': 'one-resource',
                         'operations': [{'operation_id': owner + '-op-' + str(index),
                                         'method': 'PUT', 'path': path,
                                         'body': {'worker': index}, 'delay_ms': 0}
                                        for index in (0, 1)],
                         'post_join_observation': {'method': 'GET', 'path': path},
                         'preheld_resource_lease': True}
                payload = json.dumps(epoch).encode('utf-8')
                with urllib.request.urlopen(urllib.request.Request(
                    'http://127.0.0.1:%d/epochs' % adapter.server_port,
                    data=payload, method='POST', headers={'Content-Type': 'application/json'}),
                    timeout=6) as response:
                    self.assertEqual(response.status, 200)
                    self.assertEqual(json.load(response)['post_join_observation']['status'], 200)
                self.assertFalse(done.is_set())
                self.assertEqual(send('POST', '/__sbt/release', lease, lifecycle), 200)
                self.assertTrue(done.wait(3))
                rows = [json.loads(row) for row in trace.read_text().splitlines()]
                self.assertEqual([row['method'] for row in rows if row['method'].startswith('SBT_')],
                                 ['SBT_LEASE', 'SBT_RELEASE'])
                self.assertEqual([row['epoch_id'] for row in rows if row['method'] == 'PUT'
                                  and row.get('epoch_id')],
                                 ['generated-control-0', owner, owner])
            finally:
                for server in (adapter, proxy, upstream):
                    server.shutdown()
                    server.server_close()
                for thread in threads:
                    thread.join(timeout=2)


if __name__ == '__main__':
    unittest.main()
