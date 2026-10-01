"""An inconclusive reverse serial control must not become a race finding."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.evaluate_verifiers import _concurrency_witnesses


class SpecificOracleTests(unittest.TestCase):
    def test_reverse_serial_loss_prevents_concurrent_violation(self):
        fields = [{'name': name} for name in ('enabled', 'label')]
        base = {'method': 'PATCH', 'path_template': '/items/{id}',
                'success_statuses': [200], 'observation': {'success_statuses': [200]}}
        generic = {**base, 'kind': 'disjoint-writes-commute-domain',
                   'oracle_id': 'concurrency::disjoint-domain::updateItem',
                   'eligible_fields': fields, 'width_range': [2, 3]}
        exact = {**base, 'kind': 'disjoint-writes-commute',
                 'oracle_id': 'concurrency::disjoint::updateItem::enabled::label',
                 'fields': fields, 'width': 2, 'reverse_sequential_control': True}

        def event(epoch, method, index, request, response, start, end):
            return {'epoch_id': epoch, 'method': method, '_index': index,
                    'operation_id': epoch + ('-observe' if method == 'GET' else '-op-' + str(index)),
                    'model_path': '/items/1', 'request': request, 'response': response,
                    'status': 200, 'upstream_started_utc': start,
                    'upstream_completed_utc': end}

        moments = [('2026-09-24T10:00:00+00:00', '2026-09-24T10:00:01+00:00'),
                   ('2026-09-24T10:00:02+00:00', '2026-09-24T10:00:03+00:00')]
        events = []
        index = 0
        for epoch, requests, final in (
                ('generated-control-0', [{'enabled': True}, {'label': 'new'}],
                 {'enabled': True, 'label': 'new'}),
                ('generated-reverse-control-0', [{'label': 'new'}, {'enabled': True}],
                 {'enabled': True, 'label': None}),
                ('generated-epoch-0', [{'label': 'new'}, {'enabled': True}],
                 {'enabled': True, 'label': None})):
            for j, request in enumerate(requests):
                start, end = moments[0 if epoch == 'generated-epoch-0' else j]
                events.append(event(epoch, 'PATCH', index, request, request, start, end))
                index += 1
            events.append(event(epoch, 'GET', index, None, final,
                                '2026-09-24T10:00:04+00:00',
                                '2026-09-24T10:00:05+00:00'))
            index += 1
        result = _concurrency_witnesses(events, {'concurrency_oracles': [generic, exact]})
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['oracle_id'], exact['oracle_id'])
        self.assertEqual(result[0]['result'], 'INCONCLUSIVE')
        self.assertEqual(result[0]['reason'], 'reverse-sequential-control-state-mismatch')


if __name__ == '__main__':
    unittest.main()
