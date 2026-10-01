"""Check that the focused oracle needs valid controls and a measured overlap."""
import importlib.util
from pathlib import Path
import sys
import unittest

SOURCE = Path(__file__).resolve().parents[1] / "scripts" / "run_keycloak_stage2_overlap.py"
sys.path.insert(0, str(SOURCE.parent))
LOCAL_GATE = Path(__file__).resolve().parents[2] / "keycloak_stage2_live_gate_delta" / "scripts"
if LOCAL_GATE.exists():
    sys.path.insert(0, str(LOCAL_GATE))
spec = importlib.util.spec_from_file_location("overlap_driver", SOURCE)
driver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(driver)


class OverlapDecision(unittest.TestCase):
    def setUp(self):
        self.initial = {"firstName": "Before", "lastName": "Other"}
        self.ab = {"initial": self.initial, "statuses": [204, 204],
                   "read_statuses": [200, 200],
                   "final": {"firstName": "A", "lastName": "B"}}
        self.ba = {"initial": self.initial, "statuses": [204, 204],
                   "read_statuses": [200, 200],
                   "final": {"firstName": "A", "lastName": None}}
        self.race = {"initial": self.initial, "statuses": [204, 204],
                     "errors": [], "intervals": [[100, 250], [150, 300]]}

    def reads(self, fields):
        return [{"status": 200, "fields": fields}] * 2

    def test_both_observed_serial_outcomes_pass(self):
        for outcome in (self.ab["final"], self.ba["final"]):
            self.assertEqual(driver.decide(self.ab, self.ba, self.race, self.reads(outcome))[0], "PASS")

    def test_stable_result_outside_both_orders_is_only_a_candidate(self):
        self.assertEqual(driver.decide(self.ab, self.ba, self.race,
                         self.reads({"firstName": "Before", "lastName": "Other"}))[0],
                         "SEMANTIC_CANDIDATE")

    def test_missing_overlap_and_failed_controls_are_inconclusive(self):
        self.race["intervals"] = [[100, 150], [150, 300]]
        self.assertEqual(driver.decide(self.ab, self.ba, self.race, self.reads(self.ab["final"]))[0], "INCONCLUSIVE")
        self.race["intervals"] = [[100, 250], [150, 300]]
        self.ab["statuses"] = [204, 500]
        self.assertEqual(driver.decide(self.ab, self.ba, self.race,
                         self.reads({"firstName": "Before", "lastName": "Other"}))[0], "INCONCLUSIVE")

    def test_failed_racing_request_does_not_crash_or_promote(self):
        self.race.update(statuses=[204, None], intervals=[[100, 200], None], errors=["URLError"])
        self.assertEqual(driver.decide(self.ab, self.ba, self.race, self.reads(self.ab["final"]))[0], "INCONCLUSIVE")


if __name__ == "__main__":
    unittest.main()
