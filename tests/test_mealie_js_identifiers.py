"""Regression for OpenAPI-derived display names used as JavaScript symbols."""
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))

from openapi_to_sbt.render.interfaces_js import render_entity_helpers
from openapi_to_sbt.render.naming import identifier_suffix
from openapi_to_sbt.render.stories_js import render_state_tracker


class IdentifierTests(unittest.TestCase):
    def test_only_invalid_suffixes_change(self):
        self.assertEqual(identifier_suffix('Recipe-Outputs'), 'RecipeOutputs')
        self.assertEqual(identifier_suffix('PaginationBase_RecipeSummary_s'),
                         'PaginationBase_RecipeSummary_s')
        self.assertEqual(identifier_suffix('Albums'), 'Albums')

    def test_helper_definition_matches_story_reference(self):
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
        for source in (helpers, tracker):
            self.assertNotRegex(source, r'(?<![\w])(?:function |matchAny)Recipe-Outputs')


if __name__ == '__main__':
    unittest.main()
