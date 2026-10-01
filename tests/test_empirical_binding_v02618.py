"""Regression checks for observed Location readiness, safety gates and family selection."""
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest

project_generator = Path.cwd() / 'generator_baseline'
if project_generator.is_dir():
    sys.path.insert(0, str(project_generator))
from openapi_to_sbt.verification import _empirical_location_binding
from openapi_to_sbt.verification_cli import _empirical_location_bindings, _empirical_field_controls
from openapi_to_sbt.combined_oracles import compose


class Operation:
    def __init__(self, method, path):
        self.method, self.path = method, path


class Document:
    operations = [Operation('POST', '/a/{parent}/items'),
                  Operation('GET', '/a/{parent}/items/{item-id}')]


class BindingTests(unittest.TestCase):
    def setUp(self):
        self.spec_bytes = b'{"openapi":"3.0.0"}'
        self.sha = hashlib.sha256(self.spec_bytes).hexdigest()
        self.gate = {'openapi_sha256': self.sha, 'runtime_status': 'LIVE_PREREQUISITES_VERIFIED',
                     'runtime_verified_edges': 1,
                     'steps': [{'location_id_bound': True}, {'id_confirmed': True}],
                     'resource_paths': {'parent': '/a/example', 'item': '/a/example/items/123'}}

    def test_verified_gate_matches_one_generic_nested_post_get(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / 'gate.json'
            p.write_text(json.dumps(self.gate), encoding='utf-8')
            binding = _empirical_location_bindings(p, self.spec_bytes, Document())
        key = '/a/{parent}/items/{item-id}'
        item = _empirical_location_binding(Document.operations[0], Document.operations[1], binding[key])
        self.assertEqual(item['response']['item-id'], '__sbtObservedLocationId')
        self.assertEqual(item['request_path']['parent'], 'parent')
        self.assertEqual(item['evidence']['item-id']['source'], 'empirical-location-verified-get')
        self.assertIsNone(_empirical_location_binding(Document.operations[0], Document.operations[1], None))

    def test_gate_does_not_promote_unverified_location(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / 'gate.json'
            for damaged in ({**self.gate, 'openapi_sha256': 'different'},
                            {**self.gate, 'steps': [{'location_id_bound': True}]},
                            {**self.gate, 'resource_paths': {'item': '/a/elsewhere/items/123'}}):
                p.write_text(json.dumps(damaged), encoding='utf-8')
                with self.assertRaises(ValueError):
                    _empirical_location_bindings(p, self.spec_bytes, Document())

    def test_composed_oracles_follow_observed_fields(self):
        def candidate(name):
            return {'kind': 'same-field-one-successful-value-visible', 'operation_id': 'put:/a/{parent}/items/{item-id}',
                    'path_template': '/a/{parent}/items/{item-id}', 'method': 'PUT', 'width': 2,
                    'oracle_id': 'field:' + name, 'fields': [{'name': name}],
                    'runtime': {'ready': True, 'entity_key': 'a/{parent}/items',
                                'create_operation_id': 'post:/a/{parent}/items',
                                'path_binding_from_create_response': {'item-id': '__sbtObservedLocationId'},
                                'observed_composition_fields': ['firstName', 'lastName']}}
        generated = compose([candidate(x) for x in ('createdTimestamp', 'firstName', 'lastName')])
        self.assertEqual([[f['name'] for f in x['fields']] for x in generated],
                         [['firstName'], ['firstName', 'lastName']])

    def test_field_evidence_needs_successful_both_orders(self):
        example = {'openapi_sha256': self.sha, 'fields': ['firstName', 'lastName'],
                   'generated_oracle_reference': 'concurrency::same-field-domain::put:/a/{parent}/items/{item-id}',
                   'controls': {'ab': {'statuses': [204,204], 'read_statuses': [200,200], 'initial': {'firstName':'a'}},
                                'ba': {'statuses': [204,204], 'read_statuses': [200,200], 'initial': {'firstName':'a'}}},
                   'race': {'initial': {'firstName':'a'}},
                   'final_reads': [{'status':200, 'fields': {'firstName':'b'}}]*2,
                   'verdict': 'PASS'}
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / 'fields.json'
            p.write_text(json.dumps(example), encoding='utf-8')
            self.assertEqual(_empirical_field_controls(p, self.spec_bytes)[1]['fields'], example['fields'])
            example['controls']['ba']['statuses'] = [204, 500]
            p.write_text(json.dumps(example), encoding='utf-8')
            with self.assertRaises(ValueError):
                _empirical_field_controls(p, self.spec_bytes)


if __name__ == '__main__':
    unittest.main()
