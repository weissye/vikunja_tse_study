"""A failed PUT after DELETE must leave a missing resource missing."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'generator_baseline'))
from openapi_to_sbt.render.verification_js import _empirical_update_delete


class ReverseControlTest(unittest.TestCase):
    def test_rejected_reverse_put_requires_absence_and_can_reach_epoch(self):
        oracle = {
            'oracle_id': 'test::put-delete', 'kind': 'empirical-update-delete',
            'method': 'PUT', 'path_template': '/items/{item_id}',
            'success_statuses': [200], 'delete_success_statuses': [200],
            'observation': {'success_statuses': [200]},
            'media_type': 'application/json',
            'fields': [{'name': 'date', 'type': 'string', 'format': 'date'}],
            'request_fields': ['date', 'id'],
            'runtime': {'instance_ready_label': 'Items',
                        'path_binding_from_create_response': {'item_id': 'id'},
                        'path_binding_from_create_request_path': {}},
        }
        js = '\n'.join(_empirical_update_delete(oracle, 0, True))
        reverse = js[js.index('var __ctrl="cross-control-b-0"'):]
        self.assertIn('"cross-control-b-0"', reverse)
        self.assertLess(reverse.index('svc.delete('), reverse.index('svc.put('))
        self.assertIn('[400,404,409,410,422].indexOf(r.code)<0',
                      reverse.split('svc.put(', 1)[1].split('\n', 1)[0])
        self.assertIn('[400,404,410].indexOf(r.code)<0',
                      reverse.split('svc.put(', 1)[1].split('-read-1', 1)[1].split('\n', 1)[0])
        self.assertIn('SBT:ConcurrencyReady:0', reverse)
        self.assertIn('__sbtAdapter.post("/epochs"', reverse)


if __name__ == '__main__':
    unittest.main()
