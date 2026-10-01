import sys
import unittest
from pathlib import Path

root = Path(__file__).resolve().parents[1]
generator = root / 'generator_baseline'
if not (generator / 'openapi_to_sbt' / 'evaluate_verifiers.py').exists():
    generator = Path(__file__).resolve().parents[2] / 'mealie_identifier_binding_0266' / 'test_generator'
sys.path.insert(0, str(generator))
from openapi_to_sbt.evaluate_verifiers import _concurrency_witnesses, _intervening_write


def event(index, start, end, method, epoch=None, operation=None, request=None, response=None):
    return {'_index': index, 'model_path': '/objects/1', 'method': method,
            'epoch_id': epoch, 'operation_id': operation, 'status': 200,
            'upstream_started_utc': '2026-09-27T08:29:%sZ' % start,
            'upstream_completed_utc': '2026-09-27T08:29:%sZ' % end,
            'request': request, 'response': response}


class InterveningWriteTests(unittest.TestCase):
    def setUp(self):
        self.a = event(4, '19.097', '19.124', 'PUT', 'generated-epoch-2',
                       'generated-epoch-2-op-0', {'name': 'a'})
        self.b = event(5, '19.097', '19.128', 'PUT', 'generated-epoch-2',
                       'generated-epoch-2-op-1', {'name': 'b'})
        self.control = [
            event(0, '18.000', '18.020', 'PUT', 'generated-control-2',
                  'generated-control-2-op-0', {'name': 'a'}),
            event(1, '18.040', '18.060', 'PUT', 'generated-control-2',
                  'generated-control-2-op-1', {'name': 'b'}),
            event(2, '18.080', '18.090', 'GET', 'generated-control-2',
                  'generated-control-2-observe', response={'name': 'b'}),
        ]
        self.oracle = {'concurrency_oracles': [{
            'oracle_id': 'same-field-name', 'kind': 'same-field-one-successful-value-visible',
            'path_template': '/objects/{id}', 'width': 2, 'method': 'PUT',
            'fields': [{'name': 'name'}], 'success_statuses': [200],
            'observation': {'success_statuses': [200]},
        }]}

    def test_intervening_write_blocks_false_violation(self):
        outsider = event(6, '19.700', '19.780', 'PUT', request={'name': 'c'})
        read = event(7, '20.005', '20.029', 'GET', 'generated-epoch-2',
                     'generated-epoch-2-observe', response={'name': 'c'})
        rows = self.control + [self.a, self.b, outsider, read]
        self.assertTrue(_intervening_write(rows, [self.a, self.b], read, '/objects/1'))
        matches = [w for w in _concurrency_witnesses(rows, self.oracle)
                   if w['epoch_id'] == 'generated-epoch-2']
        self.assertEqual((matches[0]['result'], matches[0]['reason']),
                         ('INCONCLUSIVE', 'intervening-write-before-observation'))

    def test_clean_read_preserves_positive_and_negative_verdicts(self):
        for value, expected in [('a', 'PASS'), ('c', 'VIOLATED')]:
            read = event(7, '20.005', '20.029', 'GET', 'generated-epoch-2',
                         'generated-epoch-2-observe', response={'name': value})
            rows = self.control + [self.a, self.b, read]
            matches = [w for w in _concurrency_witnesses(rows, self.oracle)
                       if w['epoch_id'] == 'generated-epoch-2']
            self.assertEqual(matches[0]['result'], expected)


if __name__ == '__main__':
    unittest.main()
