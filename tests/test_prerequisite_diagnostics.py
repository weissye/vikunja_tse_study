import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from analyze_openapi_prerequisites import _template, analyze


class DiagnosticsTests(unittest.TestCase):
    def test_static_route_wins_over_item_template(self):
        paths = {'/api/tags/{item_id}': {}, '/api/tags/merge': {}}
        self.assertEqual(_template('/api/tags/merge', paths), '/api/tags/merge')

    def test_templating_and_redaction(self):
        spec = {'paths': {'/api/items/{id}': {'post': {'operationId': 'editItem',
            'requestBody': {'content': {'application/json': {'schema': {
                'type': 'object', 'properties': {'itemId': {'type': 'string'}},
                'required': ['itemId']}}}}}}}}
        trace = [json.dumps({'method': 'POST', 'model_path': '/api/items/private-123',
                             'status': 422, 'request': {'secret': 'private-secret'},
                             'response': {'detail': [{'loc': ['body', 'itemId'],
                                                       'msg': 'private-secret'}]}})]
        output = analyze(spec, trace)
        self.assertEqual(output['operations'][0]['path_template'], '/api/items/{id}')
        self.assertEqual(output['operations'][0]['validation_fields'], ['itemId'])
        self.assertNotIn('private', json.dumps(output))

    def test_unsupported_validation_body_does_not_escape(self):
        spec = {'paths': {'/items': {'post': {}}}}
        output = analyze(spec, [json.dumps({'method': 'POST', 'model_path': '/items',
                    'status': 409, 'response': {'detail': 'my-private-data'}})])
        self.assertEqual(output['operations'][0]['validation_fields'], [])
        self.assertNotIn('my-private-data', json.dumps(output))


if __name__ == '__main__':
    unittest.main()
