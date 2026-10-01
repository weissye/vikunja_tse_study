import sys
import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from types import SimpleNamespace
from tempfile import TemporaryDirectory

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from run_immich_slug_decision import classify, check_spec, serial, overlap, redact, build_server


def sample_serial(slug, order, last_slug):
    return {'slug_sent': slug, 'final': {'status': 200, 'slug': last_slug, 'allowDownload': True},
            'observed': [{'operation': op, 'update': {'status': 200},
                          'read': {'status': 200, 'slug': slug if op == 'A' else last_slug}}
                         for op in order]}


class SlugDecisionTests(unittest.TestCase):
    def test_pinned_immich_contract(self):
        check_spec(Path(__file__).resolve().parents[1] / 'model/immich/immich-v3.2.0-openapi.json')

    def test_serial_reset_preempts_concurrency_claim(self):
        ab = sample_serial('slug-a', 'AB', None)
        ba = sample_serial('slug-b', 'BA', 'slug-b')
        race = {'slug_sent': 'slug-c', 'responses': {'A': {'status': 200}, 'B': {'status': 200}},
                'final': {'status': 200, 'slug': None, 'allowDownload': True}}
        self.assertEqual(classify(ab, ba, race, True)[0], 'SERIAL_SLUG_RESET_OBSERVED')

    def test_bad_serial_prerequisite_cannot_be_a_bug(self):
        ab, ba = sample_serial('slug-a', 'AB', 'slug-a'), sample_serial('slug-b', 'BA', 'slug-b')
        ba['observed'][0]['read']['status'] = 404
        race = {'slug_sent': 'slug-c', 'responses': {'A': {'status': 200}, 'B': {'status': 200}},
                'final': {'status': 200, 'slug': None, 'allowDownload': True}}
        self.assertEqual(classify(ab, ba, race, True)[0], 'INCONCLUSIVE')

    def test_only_real_overlap_can_be_concurrency_candidate(self):
        ab, ba = sample_serial('slug-a', 'AB', 'slug-a'), sample_serial('slug-b', 'BA', 'slug-b')
        race = {'slug_sent': 'slug-c', 'responses': {'A': {'status': 200}, 'B': {'status': 200}},
                'final': {'status': 200, 'slug': None, 'allowDownload': True}}
        self.assertEqual(classify(ab, ba, race, False)[0], 'INCONCLUSIVE')
        self.assertEqual(classify(ab, ba, race, True)[0], 'CONCURRENCY_CANDIDATE')

    def test_isolated_proxy_executes_serial_and_barrier_histories(self):
        records = {}
        lock = threading.Lock()

        class FakeAPI(BaseHTTPRequestHandler):
            def log_message(self, *_args):
                return

            def handle_call(self):
                size = int(self.headers.get('Content-Length', 0))
                body = json.loads(self.rfile.read(size)) if size else {}
                path = self.path.removeprefix('/api')
                with lock:
                    if self.command == 'POST' and path == '/albums':
                        response, status = {'id': 'album-' + str(len(records))}, 201
                    elif self.command == 'GET' and path.startswith('/albums/'):
                        response, status = {'id': path.rsplit('/', 1)[-1]}, 200
                    elif self.command == 'POST' and path == '/shared-links':
                        link_id = 'link-' + str(len(records))
                        records[link_id] = {'id': link_id, 'slug': None, 'allowDownload': body['allowDownload'], 'key': 'private'}
                        response, status = records[link_id].copy(), 201
                    else:
                        link_id = path.rsplit('/', 1)[-1]
                        if self.command == 'PATCH':
                            records[link_id].update(body)
                            # Mimics the suspected sequential bug: a boolean-only PATCH clears slug.
                            if 'slug' not in body:
                                records[link_id]['slug'] = None
                        response, status = records[link_id].copy(), 200
                payload = json.dumps(response).encode()
                self.send_response(status)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)

            do_GET = do_POST = do_PATCH = handle_call

        target = ThreadingHTTPServer(('127.0.0.1', 0), FakeAPI)
        upstream = threading.Thread(target=target.serve_forever, daemon=True)
        upstream.start()
        with TemporaryDirectory() as tmp:
            trace = Path(tmp) / 'trace.jsonl'
            proxy = build_server(SimpleNamespace(target='http://127.0.0.1:' + str(target.server_port),
                api_prefix='', trace=str(trace), bearer_token_env='', require_bearer_token=False,
                authorization_scheme='Bearer', timeout=10, listen_host='127.0.0.1', listen_port=0))
            worker = threading.Thread(target=proxy.serve_forever, daemon=True)
            worker.start()
            try:
                base = 'http://127.0.0.1:' + str(proxy.server_port)
                steps = []
                ab = serial(base, 'sbt-ab-test', 'AB', steps)
                ba = serial(base, 'sbt-ba-test', 'BA', steps)
                race = overlap(base, 'sbt-race-test', steps)
                self.assertFalse(ab['final']['slug'])
                self.assertEqual(ba['final']['slug'], 'sbt-ba-test-slug')
                self.assertEqual(classify(ab, ba, race, True)[0], 'SERIAL_SLUG_RESET_OBSERVED')
                event = json.loads(trace.read_text().splitlines()[0])
                self.assertNotIn('private', json.dumps(redact(event)))
            finally:
                proxy.shutdown()
                proxy.server_close()
                worker.join(timeout=3)
        target.shutdown()
        target.server_close()
        upstream.join(timeout=3)


if __name__ == '__main__':
    unittest.main()
