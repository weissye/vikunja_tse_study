"""Contract and locality checks for serially verified create fixtures."""
import difflib
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(next(p for p in (ROOT / 'generator_baseline', ROOT / 'test_generator') if p.is_dir())))
from openapi_to_sbt.pipeline import run_pipeline


class VerifiedCreateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        candidates = [ROOT / 'model/mealie/openapi-stage4-v3.27.0.json',
                      ROOT / 'upload/openapi-projected.json',
                      ROOT.parents[1] / 'upload/openapi-projected.json']
        cls.spec = next((p for p in candidates if p.is_file()), None)
        if cls.spec is None:
            raise RuntimeError('Pinned Mealie OpenAPI fixture unavailable')
        cls.fixture = json.loads((ROOT / 'config/mealie_verified_create_values.json').read_text())

    def generate(self, fixture):
        return run_pipeline(str(self.spec), 'mealie', 'http://127.0.0.1:9927', 20261814,
                            instances_per_entity=2, instances_per_action=1,
                            story_profile='long-interleaving', long_rounds=(8, 10),
                            emit_prefix_witnesses=True, verified_values=fixture)

    def test_verified_creator_only_changes_four_mealplan_values(self):
        baseline = self.generate(None)
        enabled = self.generate(self.fixture)
        self.assertEqual(baseline.interfaces_js, enabled.interfaces_js)
        delta = list(difflib.ndiff(baseline.stories_js.splitlines(), enabled.stories_js.splitlines()))
        additions = [x[2:] for x in delta if x.startswith('+ ')]
        removals = [x[2:] for x in delta if x.startswith('- ')]
        self.assertEqual(len(additions), 4)
        self.assertEqual(len(removals), 4)
        self.assertTrue(all('let text = ' in x or 'let title = ' in x for x in additions + removals))
        self.assertTrue(all('= undefined;' in x for x in removals))
        self.assertTrue(all('Research meal plan verified' in x for x in additions))

    def test_unknown_create_field_rejected(self):
        fixture = {'create_one_api_households_mealplans_post': {'unknown': 'a'}}
        with self.assertRaisesRegex(ValueError, 'writable body field'):
            self.generate(fixture)

    def test_empty_optional_string_rejected(self):
        fixture = {'create_one_api_households_mealplans_post': {'title': ''}}
        with self.assertRaisesRegex(ValueError, 'nonempty documented strings'):
            self.generate(fixture)


if __name__ == '__main__':
    unittest.main()
