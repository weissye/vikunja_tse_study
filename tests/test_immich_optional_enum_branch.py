"""Pinned-spec regression for opt-in shared-link relation and legacy defaults."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'generator_baseline'))
from openapi_to_sbt.pipeline import run_pipeline


class OptionalEnumBranchTest(unittest.TestCase):
    def test_pinned_immich_binds_album_and_preserves_default(self):
        spec = ROOT / 'model/immich/immich-v3.2.0-openapi.json'
        self.assertTrue(spec.is_file(), 'Pinned Immich spec must be present in the project tree')
        kwargs = dict(openapi_path=str(spec), name='immich', base_url='http://127.0.0.1:9926/api',
                      seed=20261431, instances_per_entity=2, instances_per_action=1,
                      story_profile='long-interleaving', long_rounds=(7, 10))
        original = run_pipeline(**kwargs).stories_js
        explored = run_pipeline(**kwargs, optional_enum_dependency_branch=True).stories_js
        marker = 'bthread("crud:SharedLinkResponseDtos:1"'
        self.assertIn(marker, original)
        old_story = original[original.index(marker):original.index('\n\n', original.index(marker))]
        new_story = explored[explored.index(marker):explored.index('\n\n', explored.index(marker))]
        self.assertIn('let albumId = undefined', old_story)
        self.assertNotIn('deps["albumId"] = EventSet', old_story)
        self.assertIn('deps["albumId"] = EventSet', new_story)
        self.assertIn('let albumId = captured["albumId"]', new_story)
        self.assertIn('let type = "ALBUM"', new_story)


if __name__ == '__main__':
    unittest.main()
