import json
import sys
import tempfile
import unittest
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE / 'scripts'))
from mealie_rule_decision import analyze_seed


def event(epoch, operation, method, path, start, end, request=None, response=None, status=200):
    return {'epoch_id': epoch, 'operation_id': operation, 'method': method,
            'model_path': path, 'status': status,
            'upstream_started_utc': '2026-09-27T12:00:%02d+00:00' % start,
            'upstream_completed_utc': '2026-09-27T12:00:%02d+00:00' % end,
            'request': request or {}, 'response': response or {}}


class RuleDecisionTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.seed = Path(self.temp.name) / 'seed-1'
        (self.seed / 'generated').mkdir(parents=True)
        self.oracle = 'concurrency::disjoint-put::rule-put'
        self.path = '/api/households/mealplans/rules/new-id'
        self.manifest = {'concurrency_oracles': [{
            'oracle_id': self.oracle, 'runtime': {'ready': True},
            'kind': 'disjoint-put-serial-outcomes', 'prefix_min_rounds': 8,
            'path_template': '/api/households/mealplans/rules/{item_id}',
            'fields': [{'name': 'day'}, {'name': 'entryType'}]}]}
        (self.seed / 'generated/verification-manifest.mealie.json').write_text(json.dumps(self.manifest))
        self.evaluation = {'witnesses': [{
            'oracle_id': self.oracle, 'epoch_id': 'generated-epoch-0',
            'result': 'VIOLATED', 'kind': 'disjoint-put-serial-outcomes',
            'prefix_evidence': {'rounds': 8, 'last_verified_utc': '2026-09-27T12:00:01+00:00'}}]}
        (self.seed / 'generated-verifier-evaluation.json').write_text(json.dumps(self.evaluation))
        self.epoch = {'epoch_id': 'generated-epoch-0', 'all_workers_ready_before_release': True,
                      'operations': [{'started_utc': '2026-09-27T12:00:11+00:00',
                                      'ended_utc': '2026-09-27T12:00:13+00:00'},
                                     {'started_utc': '2026-09-27T12:00:11+00:00',
                                      'ended_utc': '2026-09-27T12:00:14+00:00'}]}
        (self.seed / 'concurrent-epochs.jsonl').write_text(json.dumps(self.epoch) + '\n')
        self.events = [
            event(None, None, 'POST', '/api/households/mealplans/rules', 1, 2,
                  response={'id': 'new-id'}, status=201),
            event(None, None, 'GET', self.path, 3, 4, response={'day': 'unset'}),
            event('generated-control-0', 'generated-control-0-op-0', 'PUT', self.path, 5, 6,
                  request={'day': 'monday', 'entryType': 'unset'}),
            event('generated-control-0', 'generated-control-0-op-1', 'PUT', self.path, 7, 8,
                  request={'day': 'unset', 'entryType': 'lunch'}),
            event('generated-reset-reverse-0', 'generated-reset-reverse-0-observe', 'GET', self.path,
                  9, 10, response={'day': 'unset', 'entryType': 'unset'}),
            event('generated-epoch-0', 'generated-epoch-0-op-0', 'PUT', self.path, 11, 13,
                  request={'day': 'monday', 'entryType': 'unset'}),
            event('generated-epoch-0', 'generated-epoch-0-op-1', 'PUT', self.path, 11, 14,
                  request={'day': 'unset', 'entryType': 'lunch'}),
            event('generated-epoch-0', 'generated-epoch-0-observe', 'GET', self.path, 15, 16,
                  response={'day': 'monday', 'entryType': 'lunch'}),
        ]
        self.events.insert(2, {'epoch_id': 'generated-epoch-0', 'method': 'SBT_LEASE',
                               'model_path': self.path, 'status': 200,
                               'timestamp_utc': '2026-09-27T12:00:04.500000+00:00'})
        self.events.append({'epoch_id': 'generated-epoch-0', 'method': 'SBT_RELEASE',
                            'model_path': self.path, 'status': 200,
                            'timestamp_utc': '2026-09-27T12:00:17+00:00'})

    def _write_trace(self):
        (self.seed / 'http-trace.jsonl').write_text('\n'.join(json.dumps(e) for e in self.events) + '\n')

    def test_evidence_gate_requires_fresh_created_readable_item_and_overlap(self):
        self._write_trace()
        report = analyze_seed(self.seed, self.oracle)
        self.assertEqual(report['classification'], 'REPRODUCED_IN_FRESH_INSTANCE')
        self.assertTrue(report['histories'][0]['exclusive_window']['verified'])
        self.assertEqual(report['histories'][0]['created_and_read']['created_id'], 'new-id')
        self.events[0]['response']['id'] = 'other-id'
        self._write_trace()
        self.assertEqual(analyze_seed(self.seed, self.oracle)['classification'], 'INCONCLUSIVE')
        self.events[0]['response']['id'] = 'new-id'
        self.epoch['operations'][1]['started_utc'] = '2026-09-27T12:00:14+00:00'
        (self.seed / 'concurrent-epochs.jsonl').write_text(json.dumps(self.epoch) + '\n')
        self._write_trace()
        self.assertEqual(analyze_seed(self.seed, self.oracle)['classification'], 'INCONCLUSIVE')

    def test_outside_write_invalidates_focus_and_missing_lease_does_not_pass(self):
        self.events.insert(-2, event(None, None, 'PUT', self.path, 10, 11,
                                     request={'entryType': 'breakfast'}))
        self._write_trace()
        row = analyze_seed(self.seed, self.oracle)
        self.assertEqual(row['classification'], 'INCONCLUSIVE')
        self.assertEqual(row['histories'][0]['exclusive_window']['reason'],
                         'outside-write-during-exclusive-lease')
        self.events = [e for e in self.events if e.get('method') != 'SBT_LEASE']
        self._write_trace()
        self.assertEqual(analyze_seed(self.seed, self.oracle)['classification'], 'INCONCLUSIVE')


if __name__ == '__main__':
    unittest.main()
