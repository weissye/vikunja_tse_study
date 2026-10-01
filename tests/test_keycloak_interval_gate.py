import importlib.util
from pathlib import Path
import unittest


PATH = Path(__file__).resolve().parents[1] / 'scripts' / 'audit_keycloak_intervals.py'
SPEC = importlib.util.spec_from_file_location('intervals', PATH)
MOD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MOD)


class IntervalGateTests(unittest.TestCase):
    def test_requires_actual_intersecting_request_intervals(self):
        root = '/admin/realms/test/users'
        records = [{'method':'GET','path':root,'status':200,'started_ns':1,'ended_ns':2},
                   {'method':'GET','path':root+'/uuid','status':200,'started_ns':2,'ended_ns':3},
                   {'method':'PUT','path':root+'/uuid','status':204,'started_ns':10,'ended_ns':15},
                   {'method':'PUT','path':root+'/uuid','status':204,'started_ns':15,'ended_ns':20}]
        self.assertEqual(MOD.audit(records)['result'],'INCOMPLETE')
        records[-1]['started_ns'] = 14
        self.assertEqual(MOD.audit(records)['result'],'INTERVAL_GATE_PASS')
        self.assertEqual(MOD.audit(records)['oracle_verdicts'],'NOT_EVALUATED')


if __name__ == '__main__':
    unittest.main()
