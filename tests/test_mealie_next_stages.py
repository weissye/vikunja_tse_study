"""Check two actual decision risks: false readiness and false concurrency verdicts."""
import json
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

WORK = Path(__file__).resolve().parents[1]
PROJECT = WORK.parents[1] if WORK.name.startswith('mealie_v') else WORK
sys.path.insert(0, str(WORK / 'generator_baseline'))
sys.path.insert(0, str(WORK / 'scripts'))
from openapi_to_sbt.evaluate_verifiers import _empirical_update_delete_witnesses
from mealie_gap_inventory import classify


class NextStagesTest(unittest.TestCase):
    def test_frozen_gaps_require_proof(self):
        archive_name = 'research-fit-mealie-stage4-20260927_101739_168-review.zip'
        archive = PROJECT / 'evidence' / archive_name
        if not archive.exists():
            archive = PROJECT / 'upload' / archive_name
        if not archive.exists():
            self.skipTest('Original preserved Stage4 preflight is not installed')
        report = classify(archive)
        self.assertEqual([x['status'] for x in report['unmatched']], [
            'REFERENCE_PRODUCER_REQUIRED', 'IDENTITY_REBINDING_REQUIRED',
            'REFERENCE_PRODUCER_REQUIRED', 'TARGETED_SERIAL_AND_OVERLAP_PROBE'])
        self.assertTrue(all(x['claim'] == 'UNTESTED' for x in report['unmatched']))

    def test_put_delete_control_rejection_stays_inconclusive(self):
        oracle = {'oracle_id':'cross-method::put-delete','kind':'empirical-update-delete',
                  'method':'PUT','operation_id':'update_one_api_households_mealplans__item_id__put',
                  'path_template':'/api/households/mealplans/{item_id}',
                  'success_statuses':[200], 'delete_success_statuses':[200],
                  'observation':{'success_statuses':[200]},'runtime':{'ready':True}}
        base = datetime(2026, 1, 1, tzinfo=timezone.utc)
        events = []
        def record(epoch, method, path, status, start, stop, response=None, request=None, operation=None):
            events.append({'epoch_id': epoch, 'method': method, 'model_path': path,
                           'status': status, 'response': response or {}, 'request': request or {},
                           'operation_id': operation or method, '_index': len(events),
                           'upstream_started_utc': (base + timedelta(seconds=start)).isoformat(),
                           'upstream_completed_utc': (base + timedelta(seconds=stop)).isoformat()})
        for item in range(3):
            record(f'cross-baseline-0-{item}', 'GET', f'/api/households/mealplans/{item}',
                   200, item, item + .1, {'date':'2026-01-01'})
        absent = {'detail': 'not found'}
        record('cross-control-a-0','PUT','/api/households/mealplans/0',200,4,4.1,request={'date':'2026-01-02'})
        record('cross-control-a-0','GET','/api/households/mealplans/0',200,5,5.1,{'date':'2026-01-02'})
        record('cross-control-a-0','DELETE','/api/households/mealplans/0',200,6,6.1)
        record('cross-control-a-0','GET','/api/households/mealplans/0',404,7,7.1,absent)
        record('cross-control-b-0','DELETE','/api/households/mealplans/1',200,8,8.1)
        record('cross-control-b-0','GET','/api/households/mealplans/1',404,9,9.1,absent)
        record('cross-control-b-0','PUT','/api/households/mealplans/1',409,10,10.1,request={'date':'2026-01-02'})
        record('cross-control-b-0','GET','/api/households/mealplans/1',404,11,11.1,absent)
        record('generated-epoch-0','PUT','/api/households/mealplans/2',200,12,13,request={'date':'2026-01-02'})
        record('generated-epoch-0','DELETE','/api/households/mealplans/2',200,12.2,13.2)
        record('generated-epoch-0','GET','/api/households/mealplans/2',404,14,14.1,absent,operation='generated-epoch-0-observe')
        result = _empirical_update_delete_witnesses(events, {'concurrency_oracles':[oracle]})[0]
        self.assertEqual(result['result'], 'PASS')
        events[3]['status'] = 422  # first serial PUT is rejected
        self.assertEqual(_empirical_update_delete_witnesses(events, {'concurrency_oracles':[oracle]})[0]['result'],
                         'INCONCLUSIVE')
        events[3]['status'] = 200
        record(None, 'PUT', '/api/households/mealplans/2', 200, 11.5, 11.6,
               request={'date':'2026-01-03'})
        events.insert(-4, events.pop())
        for index, event in enumerate(events):
            event['_index'] = index
        self.assertEqual(_empirical_update_delete_witnesses(events, {'concurrency_oracles':[oracle]})[0]['result'],
                         'INCONCLUSIVE')


if __name__ == '__main__':
    unittest.main()
