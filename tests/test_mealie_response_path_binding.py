"""Contract-derived POST response ID must yield a readable item-path key."""
import copy
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT.parents[1] if ROOT.name.startswith('mealie_v') else ROOT
sys.path.insert(0, str(ROOT / 'generator_baseline'))

from openapi_to_sbt.pipeline import run_pipeline
from openapi_to_sbt.render.stories_js import _documented_create_id_key_alias


class ResponsePathBindingTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = PROJECT / 'model' / 'mealie' / 'openapi-stage4-v3.27.0.json'
        if not spec.exists():
            spec = PROJECT / 'upload' / 'openapi-projected.json'
        if not spec.exists():
            raise unittest.SkipTest('Pinned Mealie OpenAPI is unavailable')
        cls.result = run_pipeline(str(spec), 'mealie', 'http://127.0.0.1:9927',
                                  20261822, instances_per_entity=3,
                                  story_profile='long-interleaving',
                                  long_rounds=(8, 10))
        cls.entry = next(ep for ep in cls.result.plan.entities
                         if ep.entity.key == 'api/households/mealplans')

    def test_documented_id_maps_item_path_and_requires_item_read(self):
        self.assertEqual(_documented_create_id_key_alias(self.entry), ('itemId', 'id'))
        stories = self.result.stories_js
        self.assertEqual(stories.count('__justCreated["itemId"] = __createResult.body["id"];'), 3)
        for n in (1, 2, 3):
            section = stories.split('bthread("crud:PlanEntryPaginations:%d"' % n, 1)[-1]
            self.assertIn('let __readResult =', section)
            self.assertLess(section.index('let __readResult ='),
                            section.index('InstanceReady:PlanEntryPaginations:%d' % n))

    def test_unproved_id_or_shape_cannot_be_substituted(self):
        entry = copy.deepcopy(self.entry)
        entry.create_op.op.success_responses[0].media_types['application/json']['properties'].pop('id')
        self.assertIsNone(_documented_create_id_key_alias(entry))
        entry = copy.deepcopy(self.entry)
        for p in entry.get_op.op.path_params:
            if p.name == 'item_id':
                p.schema['type'] = 'string'
        self.assertIsNone(_documented_create_id_key_alias(entry))


if __name__ == '__main__':
    unittest.main()
