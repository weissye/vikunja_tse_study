"""Generic breadth scheduling and oracle-level coverage regression checks."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'generator_baseline'))
sys.path.insert(0, str(ROOT / 'scripts'))
from openapi_to_sbt.pipeline import run_pipeline
from generated_concurrency_matrix import from_files, aggregate


class ConcurrencyBreadthTest(unittest.TestCase):
    def test_breadth_preserves_contract_wired_creators_but_omits_competing_actions(self):
        kwargs = dict(openapi_path=str(ROOT / 'model/immich/immich-v3.2.0-openapi.json'),
                      name='immich', base_url='http://127.0.0.1:9926/api',
                      seed=20261601, instances_per_entity=2, instances_per_action=1,
                      optional_enum_dependency_branch=True)
        baseline = run_pipeline(**kwargs, story_profile='long-interleaving').stories_js
        breadth = run_pipeline(**kwargs, story_profile='concurrency-breadth').stories_js
        self.assertIn('bthread("crud:AlbumResponseDtos:1"', breadth)
        self.assertIn('bthread("crud:SharedLinkResponseDtos:1"', breadth)
        self.assertIn('deps["albumId"] = EventSet', breadth)
        self.assertIn('let type = "ALBUM"', breadth)
        self.assertNotIn('bthread("action:addAssetsToAlbum', breadth)
        self.assertNotIn('SBT:LongStoryStep', breadth)
        self.assertNotIn('LIFECYCLE CLEANUP:', breadth)
        self.assertIn('bthread("action:addAssetsToAlbum', baseline)
        self.assertEqual(breadth.count('sync({ request: Event("SBT:InstanceReady:albums:'), 2)

    def test_matrix_never_confuses_overlap_with_oracle_pass(self):
        plan = {'oracles': [
            {'oracle_id': 'oracle-A', 'operation_id': 'updateA', 'kind': 'same-field-one-successful-value-visible',
             'runtime': {'ready': True}, 'path_template': '/things/{id}'},
            {'oracle_id': 'oracle-B', 'operation_id': 'updateB', 'kind': 'same-field-one-successful-value-visible',
             'runtime': {'ready': True}, 'path_template': '/things/{id}'},
            {'oracle_id': 'oracle-C', 'operation_id': 'updateC', 'kind': 'update-delete-linearizable',
             'runtime': {'ready': False, 'limitation': 'requires-dedicated-created-resource'}}]}
        start = '2026-09-24T19:00:00+00:00'
        finish = '2026-09-24T19:00:01+00:00'
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            paths = {key: base / (key + '.jsonl') for key in ('epochs', 'trace')}
            paths.update(plan=base / 'plan.json', evaluation=base / 'evaluation.json')
            paths['plan'].write_text(json.dumps(plan), encoding='utf-8')
            paths['epochs'].write_text(json.dumps({'scenario': 'oracle-A', 'epoch_id': 'e1',
                                  'overlap_observed': True}) + '\n', encoding='utf-8')
            paths['trace'].write_text(''.join(json.dumps({'epoch_id': 'e1', 'method': 'PATCH',
                'upstream_started_utc': start, 'upstream_completed_utc': finish}) + '\n'
                for _ in range(2)), encoding='utf-8')
            paths['evaluation'].write_text(json.dumps({'witnesses': [{'oracle_id': 'oracle-A',
                'epoch_id': 'e1', 'result': 'INCONCLUSIVE'}]}), encoding='utf-8')
            matrix = from_files(paths['plan'], paths['epochs'], trace_path=paths['trace'],
                                evaluation_path=paths['evaluation'])
            overall = aggregate([matrix])
            self.assertEqual(matrix['counts'], {'INCONCLUSIVE': 1, 'NOT_OBSERVED': 1,
                                                 'NOT_RUNTIME_READY': 1})
            self.assertEqual(overall['state'], 'PARTIAL_READY_ORACLE_COVERAGE')
            self.assertEqual(overall['missing_overlap_oracles'], ['oracle-B'])
            self.assertEqual(overall['overlap_without_conclusive_verdict'], ['oracle-A'])


if __name__ == '__main__':
    unittest.main()
