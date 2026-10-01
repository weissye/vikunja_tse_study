import importlib.util
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import unittest


HERE = Path(__file__).resolve().parents[1]
FIXTURES = HERE / "tests/fixtures"


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, HERE / "scripts" / file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class RuntimeBoundSampleTests(unittest.TestCase):
    def test_generated_real_rest_schedule_without_response_fabrication(self):
        model = load("builder", "prepare_runtime_bound_sample.py")
        plan = json.loads((FIXTURES / "runtime_sample_plan.json").read_text())
        controls = json.loads((FIXTURES / "runtime_sample_controls.json").read_text())
        js, oracles = model.render(plan, controls, prefix_rounds=8, instances=3)
        self.assertEqual(set(oracles), set(model.KINDS))
        self.assertIn("sbtService.post(", js)
        self.assertIn('pvg.rtv.set("sbt_user_id_1",matching[0].id)', js)
        self.assertIn('body:"@{sbt_control_body_1}"', js)
        self.assertIn('body:"@{sbt_race_A_1}"', js)
        self.assertIn('body:"@{sbt_race_B_1}"', js)
        self.assertIn("Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}", js)
        self.assertNotIn("SBT:PrefixVerified", js)
        self.assertNotIn('result:"PASS"', js)
        if shutil.which("node"):
            result = subprocess.run(["node", "--check", "-"], input=js, text=True,
                                    capture_output=True)
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_audit_rejects_symbolic_only_previous_sample(self):
        audit = load("audit", "audit_runtime_bound_samples.py")
        symbolic = [[{"name": "SBT:ScheduleChosen",
                      "data": {"kind": "same-field-one-successful-value-visible",
                               "instance": 1}}]]
        report = audit.audit(symbolic)
        self.assertEqual(report["complete_rest_schedules"], 0)
        self.assertEqual(report["missing"]["real_rest_events"], 1)
        self.assertFalse(report["http_executed"])

    def test_audit_counts_only_complete_rest_schedules(self):
        audit = load("audit2", "audit_runtime_bound_samples.py")
        events = [{"name": "SBT:ScheduleChosen", "data": {"kind": "noop-versus-change", "instance": 2}}]
        events.append({"name": "REST", "data": {"lib": "REST", "method": "POST",
                                                  "url": "/admin/realms/example/users"}})
        for round_index in range(1, 9):
            events.append({"name": "SBT:PrefixRoundScheduled", "data": {"round": round_index}})
        events.extend({"name": "SBT:SerialOrderScheduled", "data": {"order": o}} for o in ("AB", "BA"))
        events.extend({"name": "SBT:ConcurrentWriteScheduled", "data": {"operation": o}} for o in ("A", "B"))
        events.append({"name": "REST", "data": {"lib": "REST", "method": "GET", "url": "/x"}})
        result = audit.audit([events])
        self.assertEqual(result["complete_rest_schedules"], 1)
        self.assertEqual(result["oracle_verdicts"], "NOT_EVALUATED")


if __name__ == "__main__":
    unittest.main()
