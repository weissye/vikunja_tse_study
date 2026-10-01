import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.evaluate_verifiers import _verified_prefix, _concurrency_witnesses


class CausalPrefix(unittest.TestCase):
    def test_specific_prefixed_oracle_selected_over_broad_domain(self):
        base = dict(method='PATCH', model_path='/resources/42', status=200,
                    prefix_phase='epoch', prefix_story='s', prefix_round='2',
                    upstream_started_utc='2026-01-01T00:00:04Z',
                    upstream_completed_utc='2026-01-01T00:00:06Z')
        events = [dict(method='GET', model_path='/resources/42', status=200,
                       prefix_phase='verified-round', prefix_story='s',
                       prefix_round=str(i),
                       upstream_completed_utc=f'2026-01-01T00:00:0{i}Z')
                  for i in (1, 2)]
        events += [dict(base, epoch_id='generated-epoch-0', operation_id='generated-epoch-0-op-0',
                        request={'a': 'x'}),
                   dict(base, epoch_id='generated-epoch-0', operation_id='generated-epoch-0-op-1',
                        request={'b': 'y'}),
                   dict(method='GET', model_path='/resources/42', status=200,
                        epoch_id='generated-epoch-0', operation_id='generated-epoch-0-observe',
                        response={'a': 'x', 'b': 'y'})]
        for index, event in enumerate(events):
            event['_index'] = index
        fields = [{'name': name} for name in ('a', 'b')]
        common = dict(path_template='/resources/{id}', method='PATCH',
                      success_statuses=[200], observation={'success_statuses': [200]})
        domain = dict(common, oracle_id='broad', kind='disjoint-writes-commute-domain',
                      width_range=[2, 2], eligible_fields=fields)
        specific = dict(common, oracle_id='gated', kind='disjoint-writes-commute',
                        width=2, fields=fields, runtime={'ready': True}, prefix_min_rounds=2)
        witness = _concurrency_witnesses(events, {'concurrency_oracles': [domain, specific]})[0]
        self.assertEqual(witness['oracle_id'], 'gated')
        self.assertEqual(witness['prefix_evidence']['rounds'], 2)
        self.assertEqual(witness['result'], 'INCONCLUSIVE')  # Missing serial control.
        without_prefix = _concurrency_witnesses(events[2:], {'concurrency_oracles': [domain, specific]})[0]
        self.assertEqual(without_prefix['result'], 'INCONCLUSIVE')
        self.assertEqual(without_prefix['reason'], 'prefix-verified-round-missing-or-rejected')

    def test_matching_completed_rounds_before_same_resource_epoch(self):
        reads = [dict(method='GET', model_path='/resources/42', status=200,
                      prefix_phase='verified-round', prefix_story='s',
                      prefix_round=str(i),
                      upstream_completed_utc=f'2026-01-01T00:00:0{i}Z')
                 for i in range(1, 4)]
        operations = [dict(prefix_story='s', prefix_round='3',
                           upstream_started_utc='2026-01-01T00:00:05Z') for _ in range(2)]
        ok, reason, evidence = _verified_prefix(reads, operations, '/resources/42', 3)
        self.assertTrue(ok, reason)
        self.assertEqual(evidence['rounds'], 3)
        self.assertFalse(_verified_prefix(reads, operations, '/resources/43', 3)[0])
        self.assertFalse(_verified_prefix(reads[:2], operations, '/resources/42', 3)[0])
        moved = [dict(x) for x in reads]
        moved[2]['upstream_completed_utc'] = '2026-01-01T00:00:06Z'
        self.assertFalse(_verified_prefix(moved, operations, '/resources/42', 3)[0])
        incompatible = [dict(operations[0]), dict(operations[1], prefix_story='other')]
        self.assertFalse(_verified_prefix(reads, incompatible, '/resources/42', 3)[0])


if __name__ == '__main__':
    unittest.main()
