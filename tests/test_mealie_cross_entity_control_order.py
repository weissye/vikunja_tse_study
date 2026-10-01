"""Guard the generated control/epoch ordering that blocked the live trial."""
import importlib.util
import json
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RENDERER = ROOT / 'generator_baseline/openapi_to_sbt/render/verification_js.py'
SPEC = importlib.util.spec_from_file_location('mealie_cross_renderer', RENDERER)
renderer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(renderer)


class CrossEntityOrderTest(unittest.TestCase):
    @staticmethod
    def oracle():
        targets = []
        for name, path in [('first', '/api/first/{item_id}'), ('second', '/api/second/{item_id}')]:
            targets.append({'operation_id': name, 'path_template': path,
                            'method': 'PUT', 'fields': [{'name': 'name', 'type': 'string'}],
                            'request_fields': [{'name': 'name', 'type': 'string'}],
                            'media_type': 'application/json', 'success_statuses': [200]})
        return {'oracle_id': 'concurrency::cross-entity::first::second',
                'targets': targets, 'prefix_min_rounds': 8}

    def test_own_put_controls_complete_before_isolation_signal_and_epoch(self):
        js = '\n'.join(renderer._cross_entity_lines(self.oracle(), 0))
        marker = 'request:Event("SBT:CrossControlsComplete:0"'
        self.assertLess(js.index('__reset+"-op-"+k'), js.index(marker))
        self.assertLess(js.index('reason:"cross-entity-control-failed"'), js.index(marker))
        self.assertLess(js.index(marker), js.index('var __epoch="generated-epoch-0"'))
        self.assertLess(js.index(marker), js.index('__sbtAdapter.post("/epochs"'))

    def test_full_renderer_arms_mutation_guard_after_own_controls(self):
        evidence = next((p for p in (
            ROOT / 'evidence/research-fit-mealie-stage4-20260927_131925_026-review.zip',
            ROOT.parents[1] / 'upload/research-fit-mealie-stage4-20260927_131925_026-review.zip')
            if p.exists()), None)
        if evidence is None:
            self.skipTest('Archived preflight manifest unavailable for full-render replay')
        with zipfile.ZipFile(evidence) as archive:
            manifest = json.loads(archive.read(
                'seed-20261851/generated/verification-manifest.mealie.json'))
        js = renderer.render_verification_js(manifest, 'mealie', 'full',
                                             'post-join-observation',
                                             'require-serial-controls', 'long-interleaving')
        self.assertIn('waitFor:Event("SBT:CrossControlsComplete:0")', js)
        self.assertNotIn('waitFor:Event("SBT:ConcurrencyPermit:0")});\n'
                         '  sync({waitFor:Event("SBT:ConcurrencyClosed:0"),block:', js)
        self.assertEqual(js.count('SBT:CrossControlsComplete:0'), 2)


if __name__ == '__main__':
    unittest.main()
