import sys
import json
import tempfile
import hashlib
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from run_mealie_stage4 import ROOTS, project, safe_trace
import mealie_spec_gate


class Stage4Tests(unittest.TestCase):
    def test_four_real_domain_roots_and_session_boundary(self):
        expected = ('/api/recipes', '/api/organizers', '/api/households/shopping',
                    '/api/households/mealplans')
        self.assertEqual(ROOTS, expected)
        paths = {x + '/{item_id}': {'patch': {'operationId': x}} for x in ROOTS}
        paths.update({'/api/users/self': {'delete': {'operationId': 'deleteMe'}},
                      '/api/admin/backups': {'post': {'operationId': 'restore'}},
                      '/api/recipes/create/url': {'post': {'operationId': 'fetchExternal'}}})
        chosen, excluded = project({'paths': paths, 'components': {'schemas': {}}})
        self.assertEqual(len(chosen['paths']), 4)
        self.assertEqual(len(excluded), 3)
        self.assertNotIn('/api/users/self', chosen['paths'])

    def test_frozen_http_event_has_no_token_or_body(self):
        trace = {'method': 'PATCH', 'status': 200, 'epoch_id': 'a',
                 'model_path': '/api/recipes/r1', 'request': {'token': 'private'},
                 'response': {'email': 'private'}, 'authorization': 'Bearer private'}
        filtered = safe_trace(trace)
        self.assertEqual(filtered['epoch_id'], 'a')
        self.assertNotIn('request', filtered)
        self.assertNotIn('response', filtered)
        self.assertNotIn('authorization', filtered)

    def test_gate_accepts_document_metadata_and_rejects_schema_drift(self):
        old_doc = {'openapi': '3.1.0', 'info': {'version': 'v3.27.0', 'title': 'original'},
                   'servers': [{'url': 'http://127.0.0.1:9925'}],
                   'paths': {'/api/recipes': {'get': {'operationId': 'getRecipes',
                       'responses': {'200': {'description': 'old', 'content': {
                           'application/json': {'schema': {'type': 'string'}}}}}}}},
                   'components': {'schemas': {}}}
        with tempfile.TemporaryDirectory() as temp:
            old, new = Path(temp) / 'old.json', Path(temp) / 'new.json'
            old.write_text(json.dumps(old_doc), encoding='utf-8')
            newer = json.loads(json.dumps(old_doc))
            newer['info']['title'] = 'new deployment'
            newer['servers'][0]['url'] = 'http://127.0.0.1:9927'
            newer['paths']['/api/recipes']['get']['responses']['200']['description'] = 'new text'
            new.write_text(json.dumps(newer), encoding='utf-8')
            with patch.object(mealie_spec_gate, 'OLD_SHA', hashlib.sha256(old.read_bytes()).hexdigest()):
                self.assertEqual(mealie_spec_gate.comparison(old, new)['state'],
                                 'ACCEPTED_EQUIVALENT_CONTRACT')
                newer['paths']['/api/recipes']['get']['responses']['200']['content']['application/json']['schema']['type'] = 'integer'
                new.write_text(json.dumps(newer), encoding='utf-8')
                self.assertEqual(mealie_spec_gate.comparison(old, new)['state'], 'BLOCKED')

    def test_property_named_description_is_part_of_contract(self):
        left = {'paths': {}, 'components': {'schemas': {'Entity': {'type': 'object',
            'properties': {'description': {'type': 'string'}}}}}}
        right = json.loads(json.dumps(left))
        right['components']['schemas']['Entity']['properties']['description']['type'] = 'number'
        self.assertNotEqual(mealie_spec_gate.contract(left), mealie_spec_gate.contract(right))


if __name__ == '__main__':
    unittest.main()
