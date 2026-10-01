"""Exercise the isolated album runner without requiring Docker or a network."""
import importlib.util
import json
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

RUNNER = Path(__file__).resolve().parents[1] / 'scripts/run_immich_album_serial.py'
spec = importlib.util.spec_from_file_location('immich_pilot', RUNNER)
pilot = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pilot)


class AlbumPilotTest(unittest.TestCase):
    def test_serial_trial_persists_both_independently_written_fields(self):
        state = {}
        def fake_call(base, method, path, body=None, token=None):
            if method == 'POST':
                state.update({'id': 'id-test-1', 'albumName': body['albumName'], 'description': ''})
                return {'status': 201, 'body': dict(state)}
            if method == 'PATCH':
                state.update(body)
                return {'status': 200, 'body': dict(state)}
            if method == 'GET':
                return {'status': 200, 'body': dict(state)}
            if method == 'DELETE':
                return {'status': 204, 'body': None}
            raise AssertionError(method)
        with patch.object(pilot, 'call', fake_call):
            result = pilot.trial('http://127.0.0.1:9926', 'test-token', 1, 'sample', 3)
        self.assertEqual('PASS', result['verdict'])
        self.assertEqual(6, sum(x['method'] == 'PATCH' for x in result['steps']))
        final_read = [x for x in result['steps'] if x['method'] == 'GET'][-1]
        self.assertTrue(final_read['observed']['albumName'].endswith('name-2'))
        self.assertTrue(final_read['observed']['description'].endswith('description-2'))
        self.assertNotIn('test-token', json.dumps(result))

    def test_successful_patch_with_missing_value_is_candidate(self):
        state = {'id': 'id-test-1', 'albumName': '', 'description': ''}
        def fake_call(base, method, path, body=None, token=None):
            if method == 'POST':
                state['albumName'] = body['albumName']
                return {'status': 201, 'body': dict(state)}
            if method == 'PATCH':
                return {'status': 200, 'body': dict(state)}
            if method == 'GET':
                return {'status': 200, 'body': dict(state)}
            return {'status': 204, 'body': None}
        with patch.object(pilot, 'call', fake_call):
            result = pilot.trial('http://127.0.0.1:9926', 'test-token', 1, 'sample', 1)
        self.assertEqual('SEMANTIC_CANDIDATE', result['verdict'])


if __name__ == '__main__':
    unittest.main()
