"""Regression: GET must carry auth in the token argument, not in the body."""
import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location(
    'semantic_confirmation', ROOT / 'scripts' / 'run_immich_semantic_confirmation.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class AuthenticatedReadRegression(unittest.TestCase):
    def test_both_cases_use_authenticated_get_with_no_request_body(self):
        state = {'tags': {}, 'notifications': {}}
        ident = '00000000-0000-4000-8000-000000000001'

        def request(base, method, path, body=None, token=None):
            if method == 'GET' and path != '/server/version':
                self.assertIsNone(body, (method, path, 'unexpected GET body'))
                self.assertEqual(token, 'research-token', (method, path, 'auth missing'))
            if path == '/users/me':
                return {'status': 200, 'body': {'id': ident}}
            if path == '/server/version':
                return {'status': 200, 'body': {'major': 3, 'minor': 2, 'patch': 0}}
            if method == 'POST' and path == '/tags':
                new_id = '00000000-0000-4000-8000-%012d' % (len(state['tags']) + 2)
                state['tags'][new_id] = {'id': new_id, 'name': body['name']}
                return {'status': 201, 'body': state['tags'][new_id]}
            if method == 'PUT' and path == '/tags':
                return {'status': 200, 'body': [{'id': ident, 'name': body['tags'][0]}]}
            if method == 'GET' and path == '/tags':
                return {'status': 200, 'body': list(state['tags'].values())}
            if method == 'GET' and path.startswith('/tags/'):
                return {'status': 200, 'body': state['tags'][path.split('/')[-1]]}
            if method == 'POST' and path == '/admin/notifications':
                new_id = '00000000-0000-4000-8000-000000000020'
                state['notifications'][new_id] = {'id': new_id, 'title': body['title']}
                return {'status': 201, 'body': state['notifications'][new_id]}
            if method == 'GET' and path.startswith('/notifications?id='):
                return {'status': 200, 'body': [state['notifications'][path.split('=')[-1]]]}
            if method == 'GET' and path.startswith('/notifications/'):
                return {'status': 200, 'body': state['notifications'][path.split('/')[-1]]}
            raise AssertionError((method, path))

        with patch.object(module, 'call', request), patch.object(module.time, 'sleep'):
            self.assertEqual(module.tags_case('http://127.0.0.1:9926', 'research-token', 1, 1)['verdict'], 'PASS')
            self.assertEqual(module.notification_case('http://127.0.0.1:9926', 'research-token', 1, 1)['verdict'], 'PASS')


if __name__ == '__main__':
    unittest.main()
