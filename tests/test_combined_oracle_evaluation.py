import copy
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'generator_baseline'))
from openapi_to_sbt.evaluate_verifiers import _concurrency_witnesses


def time(n):
    return f'2026-09-27T00:00:{n:02d}+00:00'


def row(epoch, suffix, method, path, start, end, *, request=None, response=None,
        story=None, phase=None, round_number=None):
    data = dict(epoch_id=epoch, operation_id=epoch + '-' + suffix,
                method=method, model_path=path, status=200,
                request=request or {}, response=response or {},
                upstream_started_utc=time(start), upstream_completed_utc=time(end))
    if story is not None:
        data.update(prefix_story=story, prefix_round=str(round_number))
    if phase is not None:
        data['prefix_phase'] = phase
    return data


class CombinedOracleEvaluationTest(unittest.TestCase):
    def test_noop_requires_stable_serial_read(self):
        oracle = {'oracle_id': 'noop', 'kind': 'noop-versus-change',
                  'runtime': {'ready': True}, 'method': 'PUT', 'path_template': '/alpha/{id}',
                  'width': 2, 'fields': [{'name': 'x'}], 'success_statuses': [200],
                  'observation': {'success_statuses': [200]}, 'prefix_min_rounds': 1}
        events = [row('prefix', 'observe', 'GET', '/alpha/1', 1, 2,
                      story='story', phase='verified-round', round_number=1),
                  row('generated-control-0', 'op-0', 'PUT', '/alpha/1', 3, 4, request={'x': 'base'}),
                  row('generated-control-0', 'noop-observe', 'GET', '/alpha/1', 4, 5,
                      response={'x': 'base'}),
                  row('generated-control-0', 'op-1', 'PUT', '/alpha/1', 5, 6,
                      request={'x': 'change'}),
                  row('generated-control-0', 'observe', 'GET', '/alpha/1', 6, 7,
                      response={'x': 'change'}),
                  row('generated-reset-0', 'op-0', 'PUT', '/alpha/1', 7, 8,
                      request={'x': 'base'}),
                  row('generated-reset-0', 'observe', 'GET', '/alpha/1', 8, 9,
                      response={'x': 'base'}),
                  row('generated-epoch-0', 'op-0', 'PUT', '/alpha/1', 10, 12,
                      request={'x': 'base'}, story='story', round_number=1),
                  row('generated-epoch-0', 'op-1', 'PUT', '/alpha/1', 10, 12,
                      request={'x': 'change'}, story='story', round_number=1),
                  row('generated-epoch-0', 'observe', 'GET', '/alpha/1', 13, 14,
                      response={'x': 'change'})]
        for i, e in enumerate(events): e['_index'] = i
        manifest = {'concurrency_oracles': [oracle]}
        self.assertEqual(_concurrency_witnesses(events, manifest)[0]['result'], 'PASS')
        mutated = copy.deepcopy(events)
        mutated[2]['response'] = {'x': 'drift'}
        self.assertEqual(_concurrency_witnesses(mutated, manifest)[0]['result'], 'INCONCLUSIVE')

    def test_disjoint_put_uses_serial_outcome_set(self):
        oracle = {'oracle_id': 'put-pair', 'kind': 'disjoint-put-serial-outcomes',
                  'runtime': {'ready': True}, 'method': 'PUT', 'path_template': '/alpha/{id}',
                  'width': 2, 'fields': [{'name': 'x'}, {'name': 'y'}],
                  'success_statuses': [200], 'observation': {'success_statuses': [200]},
                  'reverse_sequential_control': True, 'prefix_min_rounds': 1}
        a, b = {'x': 'A', 'y': 'base'}, {'x': 'base', 'y': 'B'}
        events = [row('prefix', 'observe', 'GET', '/alpha/1', 1, 2,
                      story='story', phase='verified-round', round_number=1),
                  row('generated-control-0', 'op-0', 'PUT', '/alpha/1', 3, 4, request=a),
                  row('generated-control-0', 'op-1', 'PUT', '/alpha/1', 4, 5, request=b),
                  row('generated-control-0', 'observe', 'GET', '/alpha/1', 5, 6, response=b),
                  row('generated-reset-0', 'op-0', 'PUT', '/alpha/1', 6, 7,
                      request={'x': 'base', 'y': 'base'}),
                  row('generated-reset-0', 'observe', 'GET', '/alpha/1', 7, 8,
                      response={'x': 'base', 'y': 'base'}),
                  row('generated-reverse-control-0', 'op-1', 'PUT', '/alpha/1', 8, 9, request=b),
                  row('generated-reverse-control-0', 'op-0', 'PUT', '/alpha/1', 9, 10, request=a),
                  row('generated-reverse-control-0', 'observe', 'GET', '/alpha/1', 10, 11, response=a),
                  row('generated-reset-reverse-0', 'op-0', 'PUT', '/alpha/1', 11, 12,
                      request={'x': 'base', 'y': 'base'}),
                  row('generated-reset-reverse-0', 'observe', 'GET', '/alpha/1', 12, 13,
                      response={'x': 'base', 'y': 'base'}),
                  row('generated-epoch-0', 'op-0', 'PUT', '/alpha/1', 14, 16,
                      request=a, story='story', round_number=1),
                  row('generated-epoch-0', 'op-1', 'PUT', '/alpha/1', 14, 16,
                      request=b, story='story', round_number=1),
                  row('generated-epoch-0', 'observe', 'GET', '/alpha/1', 17, 18, response=b)]
        for i, e in enumerate(events): e['_index'] = i
        manifest = {'concurrency_oracles': [oracle]}
        self.assertEqual(_concurrency_witnesses(events, manifest)[0]['result'], 'PASS')
        mutated = copy.deepcopy(events)
        mutated[-1]['response'] = {'x': 'A', 'y': 'B'}
        self.assertEqual(_concurrency_witnesses(mutated, manifest)[0]['result'], 'VIOLATED')
        unverified_reset = [e for e in mutated if e['epoch_id'] != 'generated-reset-reverse-0']
        self.assertEqual(_concurrency_witnesses(unverified_reset, manifest)[0]['result'], 'INCONCLUSIVE')
        intervened = copy.deepcopy(mutated)
        extra = row('unrelated', 'op-0', 'PUT', '/alpha/1', 13, 14,
                    request={'x': 'other', 'y': 'other'})
        intervened.insert(-3, extra)
        for i, e in enumerate(intervened): e['_index'] = i
        self.assertEqual(_concurrency_witnesses(intervened, manifest)[0]['result'], 'INCONCLUSIVE')
        rejected_reset = copy.deepcopy(mutated)
        rejected_reset[9]['status'] = 409
        self.assertEqual(_concurrency_witnesses(rejected_reset, manifest)[0]['result'], 'INCONCLUSIVE')

    def test_cross_entity_pass_and_bad_final_state(self):
        paths = ['/alpha/1', '/beta/2']
        targets = [{
            'path_template': '/alpha/{id}' if i == 0 else '/beta/{id}',
            'method': 'PUT', 'fields': [{'name': 'value'}],
            'success_statuses': [200],
            'observation': {'success_statuses': [200]},
        } for i in range(2)]
        oracle = {'oracle_id': 'cross', 'kind': 'cross-entity-independent-writes',
                  'runtime': {'ready': True}, 'prefix_min_rounds': 1, 'targets': targets}
        events = []
        for i, path in enumerate(paths):
            story = 'story-' + str(i)
            prefix = row('prefix-' + str(i), 'observe', 'GET', path, 1, 2,
                         response={'value': 'before-' + str(i)},
                         story=story, phase='verified-round', round_number=1)
            events.append(prefix)
            events.extend([
                row('generated-control-0', 'op-' + str(i), 'PUT', path, 3, 4,
                    request={'value': 'after-' + str(i)}),
                row('generated-control-0', 'observe-' + str(i), 'GET', path, 4, 5,
                    response={'value': 'after-' + str(i)}),
                row('generated-reset-0', 'op-' + str(i), 'PUT', path, 6, 7,
                    request={'value': 'before-' + str(i)}),
                row('generated-reset-0', 'observe-' + str(i), 'GET', path, 7, 8,
                    response={'value': 'before-' + str(i)}),
                row('generated-epoch-0', 'op-' + str(i), 'PUT', path, 10, 12,
                    request={'value': 'after-' + str(i)}, story=story, round_number=1),
                row('generated-epoch-0', 'observe-' + str(i), 'GET', path, 13, 14,
                    response={'value': 'after-' + str(i)}),
            ])
        events = sorted(events, key=lambda e: e['upstream_started_utc'])
        for i, e in enumerate(events): e['_index'] = i
        manifest = {'concurrency_oracles': [oracle]}
        result = _concurrency_witnesses(events, manifest)
        self.assertEqual(result[0]['result'], 'PASS')
        self.assertEqual(result[0]['prefix_evidence']['rounds'], 1)
        changed = copy.deepcopy(events)
        next(e for e in changed if e['operation_id'] == 'generated-epoch-0-observe-1')['response']['value'] = 'lost'
        self.assertEqual(_concurrency_witnesses(changed, manifest)[0]['result'], 'VIOLATED')


if __name__ == '__main__':
    unittest.main()
