"""Regression for legal JS entity helpers with request correlation enabled."""
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

root = Path(__file__).resolve().parents[1]
generator = root / 'generator_baseline'
if not (generator / 'openapi_to_sbt' / 'render' / 'plan.py').exists():
    generator = root / 'test_generator'  # local packaging smoke only
sys.path.insert(0, str(generator))

from openapi_to_sbt.render.interfaces_js import render_entity_helpers, render_op_function
from openapi_to_sbt.render.naming import identifier_suffix
from openapi_to_sbt.render.stories_js import render_state_tracker


class IdentifierBindingTests(unittest.TestCase):
    def test_identifier_suffix_preserves_legacy_names(self):
        self.assertEqual(identifier_suffix('Recipe-Outputs'), 'RecipeOutputs')
        self.assertEqual(identifier_suffix('PaginationBase_RecipeSummary_s'),
                         'PaginationBase_RecipeSummary_s')
        self.assertEqual(identifier_suffix('Albums'), 'Albums')

    def test_helpers_and_references_agree(self):
        ep = SimpleNamespace(
            entity=SimpleNamespace(plural_display_name='Recipe-Outputs',
                                   collection_path='/api/recipes/outputs',
                                   key='api/recipes/outputs'),
            key=SimpleNamespace(fields=['id']), fields=['id'],
            create_op=SimpleNamespace(error_codes=[], description_base='Create Recipe Output'),
            get_op=None, delete_op=None,
        )
        helpers = '\n'.join(render_entity_helpers(ep))
        tracker = render_state_tracker([ep])
        self.assertIn('function matchAnyRecipeOutputsAdded()', helpers)
        self.assertIn('matchAnyRecipeOutputsAdded()', tracker)
        self.assertNotIn('matchAnyRecipe-OutputsAdded', helpers + tracker)

    def test_correlation_signature_still_enabled(self):
        # An isolated operation plan is enough to exercise the opt-in header.
        op = SimpleNamespace(
            params=['id'], js_name='getRecipeOutput',
            op=SimpleNamespace(path='/api/recipes/outputs/{id}', method='GET', request_body=None),
            path_param_map={'id': 'id'}, description_base='Get Recipe Output',
            kind='get', query_params=[], header_params=[], cookie_params=[],
            request_media_type=None, success_codes=[200], error_codes=[],
            body_props=[], body_prop_types={}, server_assigned_key_fields=[],
            emits_done_event=False, has_default_response=False,
        )
        source = render_op_function(op, correlate_requests=True)
        self.assertIn('function getRecipeOutput(id, __sbtInvocationToken)', source)
        self.assertIn('X-Provengo-Invocation', source)


if __name__ == '__main__':
    unittest.main()
