"""Cross-method verdicts require both serial controls on separate resources."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.evaluate_verifiers import _empirical_update_delete_witnesses, evaluate


class EmpiricalUpdateDeleteTests(unittest.TestCase):
    def evidence(self, final_status=404, reverse_status=404):
        oracle = {'oracle_id': 'cross-method::update-delete::patch::delete',
                  'kind': 'empirical-update-delete', 'path_template': '/objects/{id}',
                  'success_statuses': [200], 'delete_success_statuses': [204],
                  'observation': {'success_statuses': [200]}, 'runtime': {'ready': True}}
        rows = []

        def add(epoch, method, path, status, body=None, request=None, op=None,
                start=None, end=None):
            slot = len(rows)
            start = start or '2026-09-24T12:00:%02d+00:00' % slot
            end = end or '2026-09-24T12:00:%02d+00:00' % (slot + 1)
            rows.append({'epoch_id': epoch, 'method': method, 'model_path': path,
                         'status': status, 'response': body or {}, 'request': request or {},
                         'operation_id': op or epoch + '-op-' + str(len(rows)), '_index': len(rows),
                         'upstream_started_utc': start, 'upstream_completed_utc': end})

        for i in range(3):
            epoch = 'cross-baseline-0-' + str(i)
            add(epoch, 'GET', '/objects/' + str(i), 200, {'id': i, 'name': 'old'}, epoch + '-observe')
        add('cross-control-a-0', 'PATCH', '/objects/0', 200, request={'name': 'new'})
        add('cross-control-a-0', 'GET', '/objects/0', 200, {'name': 'new'})
        add('cross-control-a-0', 'DELETE', '/objects/0', 204)
        add('cross-control-a-0', 'GET', '/objects/0', 404)
        add('cross-control-b-0', 'DELETE', '/objects/1', 204)
        add('cross-control-b-0', 'GET', '/objects/1', 404)
        add('cross-control-b-0', 'PATCH', '/objects/1', 404, request={'name': 'new'})
        add('cross-control-b-0', 'GET', '/objects/1', reverse_status)
        race_start = '2026-09-24T12:00:13+00:00'
        race_end = '2026-09-24T12:00:15+00:00'
        add('generated-epoch-0', 'PATCH', '/objects/2', 200, request={'name': 'new'},
            start=race_start, end=race_end)
        add('generated-epoch-0', 'DELETE', '/objects/2', 204,
            start=race_start, end=race_end)
        add('generated-epoch-0', 'GET', '/objects/2', final_status, op='generated-epoch-0-observe',
            start='2026-09-24T12:00:16+00:00', end='2026-09-24T12:00:17+00:00')
        return rows, {'concurrency_oracles': [oracle]}

    def test_serially_supported_absence_passes(self):
        rows, manifest = self.evidence()
        self.assertEqual(_empirical_update_delete_witnesses(rows, manifest)[0]['result'], 'PASS')

    def test_resource_reappearing_is_violation_only_after_both_controls(self):
        rows, manifest = self.evidence(final_status=200)
        self.assertEqual(_empirical_update_delete_witnesses(rows, manifest)[0]['result'], 'VIOLATED')
        rows, manifest = self.evidence(final_status=200, reverse_status=200)
        self.assertEqual(_empirical_update_delete_witnesses(rows, manifest)[0]['result'], 'INCONCLUSIVE')

    def test_undocumented_absence_requires_same_response_in_both_controls_and_race(self):
        rows, manifest = self.evidence(final_status=400, reverse_status=400)
        for row in rows:
            if row['method'] == 'GET' and row['status'] in (400, 404):
                row['status'] = 400
                row['response'] = {'message': 'Not found or no read access'}
        self.assertEqual(_empirical_update_delete_witnesses(rows, manifest)[0]['result'], 'PASS')
        rows[-1]['response'] = {'message': 'different error'}
        self.assertEqual(_empirical_update_delete_witnesses(rows, manifest)[0]['result'], 'INCONCLUSIVE')
        rows[-1]['response'] = {'id': '2', 'name': 'new'}
        rows[-1]['status'] = 200
        self.assertEqual(_empirical_update_delete_witnesses(rows, manifest)[0]['result'], 'VIOLATED')

    def test_race_only_server_error_is_separate_from_semantic_verdict(self):
        rows, manifest = self.evidence()
        rows[-3]['status'] = 500
        witness = _empirical_update_delete_witnesses(rows, manifest)[0]
        self.assertEqual(witness['result'], 'INCONCLUSIVE')
        self.assertEqual(witness['server_error_candidate']['classification'],
                         'SERVER_ERROR_CANDIDATE')
        manifest.update(source={'system': 'fixture'}, contract_oracles=[], state_oracles=[])
        result = evaluate(rows, manifest)
        self.assertEqual(result['run_status'], 'INCONCLUSIVE')
        self.assertEqual(len(result['server_error_candidates']), 1)

    def test_server_error_requires_verified_controls_and_final_absence(self):
        rows, manifest = self.evidence()
        rows[-3]['status'] = 500
        rows[0]['status'] = 404
        self.assertNotIn('server_error_candidate',
                         _empirical_update_delete_witnesses(rows, manifest)[0])
        rows[0]['status'] = 200
        rows[-1]['status'] = 200
        self.assertNotIn('server_error_candidate',
                         _empirical_update_delete_witnesses(rows, manifest)[0])
        rows[-1]['status'] = 404
        rows[-2]['upstream_started_utc'] = '2026-09-24T12:00:16+00:00'
        self.assertNotIn('server_error_candidate',
                         _empirical_update_delete_witnesses(rows, manifest)[0])


if __name__ == '__main__':
    unittest.main()
