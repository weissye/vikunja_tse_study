"""Focused checks for opt-in composition and proof obligations."""
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.combined_oracles import compose
from openapi_to_sbt.concurrency_adapter import validate_epoch
from openapi_to_sbt.render.verification_js import render_verification_js


def subject(name, entity, field):
    return {
        'oracle_id': name, 'kind': 'same-field-one-successful-value-visible',
        'operation_id': 'update_' + entity, 'method': 'PUT',
        'path_template': '/' + entity + '/{id}', 'width': 2,
        'fields': [{'name': field, 'type': 'string'}],
        'request_fields': [{'name': field, 'type': 'string'}],
        'media_type': 'application/json', 'success_statuses': [200],
        'observation': {'method': 'GET', 'path_template': '/' + entity + '/{id}',
                        'success_statuses': [200]},
        'runtime': {'ready': True, 'entity_key': entity,
                    'create_operation_id': 'create_' + entity,
                    'path_binding_from_create_response': {'id': 'id'},
                    'path_binding_from_create_request_path': {}},
        'source_pointers': ['/paths/' + entity],
    }


class CombinedCampaignTest(unittest.TestCase):
    def test_composition_contains_all_generated_families(self):
        originals = [subject('a', 'alpha', 'title'), subject('b', 'alpha', 'summary'),
                     subject('c', 'beta', 'name')]
        derived = compose(originals)
        self.assertEqual({o['kind'] for o in derived}, {
            'noop-versus-change', 'disjoint-put-serial-outcomes',
            'cross-entity-independent-writes'})
        self.assertEqual(len(originals), 3)  # no mutation of default plan
        self.assertEqual(derived[-1]['targets'][0]['runtime']['entity_key'], 'alpha')
        manifest = {'policy': {'combined_campaign': True}, 'concurrency_oracles': originals + derived,
                    'contract_oracles': [{'operation_id': 'create_alpha', 'success_statuses': [201]},
                                         {'operation_id': 'create_beta', 'success_statuses': [201]}],
                    'counts': {}}
        for oracle in manifest['concurrency_oracles']:
            oracle['prefix_min_rounds'] = 8
        generated = render_verification_js(manifest, 'test', 'long-interleaving',
                                           'post-join-observation', 'require-serial-controls')
        self.assertIn('post_join_observations', generated)
        self.assertIn('noop-observe', generated)
        self.assertIn('generated-reverse-control', generated)

    def test_multi_resource_lease_validation_and_old_api(self):
        base = {'epoch_id': 'e', 'operations': [
            {'operation_id': 'e-0', 'method': 'PUT', 'path': '/a/1', 'body': {}},
            {'operation_id': 'e-1', 'method': 'PUT', 'path': '/b/2', 'body': {}}]}
        valid = dict(base, post_join_observations=[{'method': 'GET', 'path': '/a/1'},
                                                   {'method': 'GET', 'path': '/b/2'}])
        self.assertEqual(len(validate_epoch(valid)['post_join_observations']), 2)
        with self.assertRaises(ValueError):
            validate_epoch(dict(base, post_join_observations=[{'method': 'GET', 'path': '/a/1'}]))
        old = dict(base, operations=[dict(base['operations'][0]),
                                     dict(base['operations'][1], path='/a/1')],
                   post_join_observation={'method': 'GET', 'path': '/a/1'})
        self.assertEqual(validate_epoch(old)['post_join_observation']['path'], '/a/1')


if __name__ == '__main__':
    unittest.main()
