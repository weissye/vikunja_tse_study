"""Opt-in read-derived PUT generation, with generic default compatibility."""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(next(p for p in (ROOT / 'generator_baseline', ROOT / 'test_env/generator_baseline')
                            if (p / 'openapi_to_sbt/parsing').is_dir())))
from openapi_to_sbt.pipeline import run_pipeline
from openapi_to_sbt.render.stories_js import _verified_read_update_fields

UPDATE = 'update_one_api_households_mealplans__item_id__put'


class VerifiedReadCarry(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.spec = next(p for p in (
            ROOT / 'model/mealie/openapi-stage4-v3.27.0.json',
            ROOT.parents[1] / 'upload/openapi-projected.json',
        ) if p.is_file())

    def generate(self, selected=()):
        return run_pipeline(str(self.spec), 'mealie', 'http://127.0.0.1:9927', 20261815,
                            instances_per_entity=2, story_profile='long-interleaving',
                            long_rounds=(8, 10), emit_prefix_witnesses=True,
                            verified_update_carry=selected)

    def test_only_opted_in_update_carries_documented_fields(self):
        baseline, enabled = self.generate(), self.generate((UPDATE,))
        self.assertEqual(baseline.interfaces_js, enabled.interfaces_js)
        self.assertNotIn('__beforeMutation.body["recipeId"]', baseline.stories_js)
        self.assertIn('__beforeMutation.body["recipeId"]', enabled.stories_js)
        self.assertIn('__beforeMutation.body["text"]', enabled.stories_js)
        self.assertIn('__beforeMutation.body["title"]', enabled.stories_js)
        self.assertIn('__beforeMutation.body["groupId"]', enabled.stories_js)
        self.assertIn('__beforeMutation.body["userId"]', enabled.stories_js)
        self.assertIn('__beforeMutation.body["id"]', enabled.stories_js)

    def test_unknown_update_rejected(self):
        with self.assertRaisesRegex(ValueError, 'documented update'):
            self.generate(('not_an_update',))

    def test_fields_come_from_schema_intersection(self):
        result = self.generate((UPDATE,))
        matched = [(ep, op) for ep in result.plan.entities for op in ep.ops if op.op.operation_id == UPDATE]
        self.assertEqual(len(matched), 1)
        fields = dict(_verified_read_update_fields(*matched[0]))
        self.assertEqual(set(fields), {'date', 'entryType', 'groupId', 'id', 'recipeId',
                                       'text', 'title', 'userId'})
        self.assertNotIn('householdId', fields)


if __name__ == '__main__':
    unittest.main()
