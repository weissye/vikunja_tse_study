"""Decision gates for a real adapter epoch and two independent controls."""
from pathlib import Path
import sys
import unittest

root = Path.cwd()
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
sys.path.insert(0, str(root / 'scripts'))
from run_keycloak_plan_live import judge, oauth_failure


class DecisionTests(unittest.TestCase):
    def setUp(self):
        self.initial = {'firstName': 'Initial', 'lastName': 'Pilot'}
        self.ab = {'initial': self.initial, 'statuses': [204, 204], 'read_statuses': [200, 200],
                   'final': {'firstName': 'B', 'lastName': 'Pilot'}}
        self.ba = {'initial': self.initial, 'statuses': [204, 204], 'read_statuses': [200, 200],
                   'final': {'firstName': 'A', 'lastName': 'Pilot'}}
        self.race = {'initial': self.initial, 'overlap_observed': True,
                     'operations': [{'status': 204, 'error': None}, {'status': 204, 'error': None}]}
        self.reads = [{'status': 200, 'fields': self.ab['final']}] * 2

    def test_requires_real_overlap_and_successful_serial_controls(self):
        self.assertEqual(judge(self.ab, self.ba, self.race, self.reads)[0], 'PASS')
        self.race['overlap_observed'] = False
        self.assertEqual(judge(self.ab, self.ba, self.race, self.reads),
                         ('INCONCLUSIVE', 'no-client-interval-overlap'))
        self.race['overlap_observed'] = True
        self.ba['statuses'][0] = 500
        self.assertEqual(judge(self.ab, self.ba, self.race, self.reads)[0], 'INCONCLUSIVE')

    def test_candidate_needs_stable_outcome_outside_both_orders(self):
        different = {'status': 200, 'fields': {'firstName': 'Unexpected', 'lastName': 'Pilot'}}
        self.assertEqual(judge(self.ab, self.ba, self.race, [different, different])[0],
                         'SEMANTIC_CANDIDATE')
        self.assertEqual(judge(self.ab, self.ba, self.race,
                               [different, self.reads[0]])[0], 'INCONCLUSIVE')

    def test_oauth_diagnostics_allowlist_and_no_secret_leak(self):
        self.assertEqual(oauth_failure(400, b'{"error":"invalid_grant","error_description":"secret-password"}'),
                         'admin-token-http-400-invalid_grant')
        self.assertEqual(oauth_failure(400, b'{"error":"secret-password"}'),
                         'admin-token-http-400-unclassified')
        self.assertEqual(oauth_failure(500, b'not json'), 'admin-token-http-500-unclassified')


if __name__ == '__main__':
    unittest.main()
