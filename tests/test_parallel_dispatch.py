import http.client
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import time
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class DispatchTests(unittest.TestCase):
    def test_generated_race_uses_one_dispatch_step(self):
        generator = load('generator', ROOT / 'scripts/prepare_runtime_bound_sample.py')
        fixture = ROOT / 'tests/fixtures'
        plan = json.loads((fixture / 'runtime_sample_plan.json').read_text())
        controls = json.loads((fixture / 'runtime_sample_controls.json').read_text())
        js, _ = generator.render(plan, controls)
        self.assertIn('sbtService.post("/__sbt_race"', js)
        self.assertIn('"A":@{sbt_race_A_1}', js.replace('\\"', '"'))
        self.assertIn('"B":@{sbt_race_B_1}', js.replace('\\"', '"'))
        self.assertNotIn('bthread("race-A:', js)
        self.assertIn('parallel PUT pair observed', js)

    def test_two_independent_puts_overlap_and_are_logged_without_bodies(self):
        relay_module = load('relay', ROOT / 'scripts/measure_keycloak_http.py')

        class FakeResponse:
            status = 204
            def __enter__(self): return self
            def __exit__(self, *_): return False
            def read(self):
                time.sleep(0.05)
                return b''

        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / 'intervals.jsonl'
            server = relay_module.Relay(('127.0.0.1', 0), log)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                with patch.object(relay_module.urllib.request, 'urlopen',
                                  side_effect=lambda *args, **kwargs: FakeResponse()):
                    conn = http.client.HTTPConnection('127.0.0.1', server.server_port)
                    body = json.dumps({'path': '/admin/realms/realm-1/users/abc-123',
                                       'A': {'id': 'abc-123', 'firstName': 'A'},
                                       'B': {'id': 'abc-123', 'firstName': 'B'}})
                    conn.request('POST', '/__sbt_race', body,
                                 {'Authorization': 'Bearer private-token',
                                  'Content-Type': 'application/json'})
                    response = conn.getresponse()
                    result = json.loads(response.read())
                    conn.close()
            finally:
                server.shutdown()
                server.server_close()
                thread.join()
            self.assertEqual(response.status, 200)
            self.assertEqual(result, {'A': 204, 'B': 204, 'overlap': True})
            lines = [json.loads(line) for line in log.read_text().splitlines()]
            self.assertEqual(len(lines), 2)
            self.assertTrue(all(line['method'] == 'PUT' for line in lines))
            self.assertNotIn('private-token', log.read_text())
            self.assertNotIn('firstName', log.read_text())


if __name__ == '__main__':
    unittest.main()
