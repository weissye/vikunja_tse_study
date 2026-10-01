import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

root = Path(__file__).resolve().parents[1]
generator = root / 'generator_baseline'
if not (generator / 'openapi_to_sbt' / 'render' / 'plan.py').exists():
    generator = Path(__file__).resolve().parents[2] / 'mealie_identifier_binding_0266' / 'test_generator'
sys.path.insert(0, str(generator))
from openapi_to_sbt.parsing.model import Operation, RequestBody, RequestBodyVariant
from openapi_to_sbt.render.stories_js import _required_js_fields, _schema_for_field


class CreateContractTests(unittest.TestCase):
    def test_selected_json_variant_drives_both_requiredness_and_value(self):
        op = Operation('create', 'POST', '/items', request_body=RequestBody(variants=[
            RequestBodyVariant('application/xml', {'properties': {'name': {'type': 'integer'}}}),
            RequestBodyVariant('application/json', {'allOf': [
                {'properties': {'name': {'type': 'string', 'minLength': 2}}, 'required': ['name']},
                {'properties': {'code': {'type': 'string', 'enum': ['valid']}}},
            ]}),
        ]))
        create = SimpleNamespace(op=op, kind='create')
        ep = SimpleNamespace(create_op=create)
        self.assertEqual(_required_js_fields(create), {'name'})
        self.assertEqual(_schema_for_field(ep, 'name')['type'], 'string')
        self.assertEqual(_schema_for_field(ep, 'code')['enum'], ['valid'])

    def test_simple_legacy_body_unchanged(self):
        op = Operation('create', 'POST', '/items', request_body=RequestBody(variants=[
            RequestBodyVariant('application/json', {'properties': {
                'title': {'type': 'string'}, 'other': {'type': 'string'}},
                'required': ['title']})]))
        create = SimpleNamespace(op=op, kind='create')
        ep = SimpleNamespace(create_op=create)
        self.assertEqual(_required_js_fields(create), {'title'})
        self.assertEqual(_schema_for_field(ep, 'title'), {'type': 'string'})


if __name__ == '__main__':
    unittest.main()
