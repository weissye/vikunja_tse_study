"""Cross-system scheduling and campaign parameter regressions."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'generator_baseline'))
from openapi_to_sbt.verification_cli import order_empirical_oracles_by_dependencies


class GenericCampaignTests(unittest.TestCase):
    def test_transitive_dependency_even_without_intermediate_oracle(self):
        oracles = [{'kind': 'empirical-update-delete', 'runtime': {'ready': True, 'entity_key': '/child'}},
                   {'kind': 'empirical-update-delete', 'runtime': {'ready': True, 'entity_key': '/parent'}}]
        graph = {'edges': [{'source': 'child', 'target': 'intermediate', 'confidence': .9},
                           {'source': 'intermediate', 'target': 'parent', 'confidence': .9}]}
        order_empirical_oracles_by_dependencies(oracles, graph)
        self.assertEqual(oracles[1]['runtime']['wait_for_closed_oracles'], [0])

    def test_ambiguous_edges_and_cycle(self):
        def oracles():
            return [{'kind': 'empirical-update-delete', 'runtime': {'ready': True,
                     'entity_key': '/' + name}} for name in ('a', 'b')]
        graph = {'edges': [{'source': 'a', 'target': 'b', 'confidence': .5}]}
        items = oracles()
        order_empirical_oracles_by_dependencies(items, graph)
        self.assertNotIn('wait_for_closed_oracles', items[1]['runtime'])
        graph['edges'] = [{'source': 'a', 'target': 'b', 'confidence': .9},
                          {'source': 'b', 'target': 'a', 'confidence': .9}]
        with self.assertRaisesRegex(ValueError, 'dependency cycle'):
            order_empirical_oracles_by_dependencies(oracles(), graph)

    def test_offline_immich_generation_with_two_way_epochs(self):
        with tempfile.TemporaryDirectory() as out:
            proc = subprocess.run([sys.executable, str(ROOT / 'scripts/Generate-OpenAPI-SBT.py'),
                '--openapi', str(ROOT / 'model/immich/immich-v3.2.0-openapi.json'),
                '--output', out, '--name', 'immich', '--base-url', 'http://127.0.0.1/api',
                '--instances-per-entity', '3', '--story-profile', 'concurrency-breadth',
                '--empirical-update-delete',
                '--max-concurrency-width', '2'], capture_output=True, text=True)
            self.assertIn(proc.returncode, (0, 3), proc.stderr)
            plan = json.loads((Path(out) / 'concurrency-plan.immich.json').read_text())
            self.assertTrue(plan['oracles'])
            self.assertTrue(all(o.get('width', 2) <= 2 for o in plan['oracles']))
            self.assertTrue((Path(out) / 'generic_campaign.json').exists())
            stories = (Path(out) / 'stories.immich.js').read_text()
            self.assertIn('bthread("crud:SharedLinkResponseDtos:1"', stories)
            self.assertIn('let type = "ALBUM"', stories)
            self.assertIn('let albumId = captured["albumId"]', stories)
            verifier = (Path(out) / 'verification.immich.js').read_text()
            self.assertIn('"SBT:ConcurrencySkipped:"+__children[__k]', verifier)
            self.assertIn('StoryPhaseComplete:crud:SharedLinkResponseDtos:', verifier)


if __name__ == '__main__':
    unittest.main()
