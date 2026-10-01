import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import diagnose_mealie_mealplan_update as target


class MealPlanUpdateControl(unittest.TestCase):
    def test_prior_trace_redacts_values_and_preserves_missing_required(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'trace.jsonl'
            path.write_text(json.dumps({'method': 'PUT', 'model_path': '/api/households/mealplans/123',
                                        'status': 422, 'trace_sequence': 5,
                                        'request': {'date': '2026-11-01', 'title': 'PRIVATE'},
                                        'response': {'detail': [{'loc': ['body', 'groupId'],
                                                                  'type': 'missing', 'msg': 'Field required'}]}}))
            found = target.diagnose_trace(path, ['date', 'id', 'groupId', 'userId'])
            self.assertEqual(found[0]['request_shape']['missing_required'], ['groupId', 'id', 'userId'])
            self.assertNotIn('PRIVATE', json.dumps(found))
            self.assertNotIn('123', json.dumps(found))

    def test_valid_serial_put_uses_read_identity(self):
        current = {'date': '2026-11-01', 'id': 42, 'groupId': 'group', 'userId': 'user',
                   'title': 'Old', 'text': 'Old'}
        calls = []
        def transport(token, method, path, body=None):
            calls.append((method, body))
            if method == 'POST': return 201, {'id': 42}
            if method == 'GET':
                if any(m == 'PUT' and b and 'groupId' in b for m, b in calls):
                    return 200, {'title': body_full['title'], 'text': body_full['text']}
                return 200, current
            if method == 'PUT' and 'groupId' not in body:
                return 422, {'detail': [{'loc': ['body','groupId'], 'type': 'missing', 'msg': 'Field required'}]}
            body_full.update(body)
            return 200, body
        body_full = {}
        with patch.object(target, 'checked_call', side_effect=transport):
            report = target.trial('dummy', ['date', 'groupId', 'id', 'userId'])
        self.assertEqual(report['classification'], 'FULL_READ_DERIVED_PUT_VALID')
        self.assertEqual(report['complete']['status'], 200)
        self.assertEqual(body_full['groupId'], 'group')
        self.assertEqual(body_full['userId'], 'user')

    def test_frozen_trace_does_not_claim_to_explain_put(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'trace.jsonl'
            path.write_text(json.dumps({'method': 'PUT', 'model_path': '/api/households/mealplans/9',
                                        'status': 422, 'trace_sequence': 7}))
            self.assertEqual(target.diagnose_trace(path, ['id'])[0]['request_shape'], 'BODY_NOT_PRESERVED')


if __name__ == '__main__':
    unittest.main()
