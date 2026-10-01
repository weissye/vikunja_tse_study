"""Integration test for scripts/run_e2e.py: the full pipeline (generate ->
validate -> start a real SUT -> execute the generated model against it via
real HTTP) run against both the correct and the buggy Todoist SUT.

This is the regression test for the 4 bugs found while first building this
very pipeline (see HOLDOUT_REPORT.md bugs 4-7): a bogus request body sent
for operations with no requestBody, query parameters dropped on
POST/PUT/PATCH, server-assigned identifiers never propagated, and the
path-parameter-vs-response-field mismatch that made propagation possible
at all. If any of those ever regress, the real HTTP calls in this test
start failing (non-2xx from the SUT), which shows up as a nonzero
`protocol_violations` count.

Skipped automatically if `node` is not on PATH, since the smoke-execution
phase requires it.
"""
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
HOLDOUT_OPENAPI = REPO_ROOT / "holdout" / "todoist_rest_v2_openapi.yaml"
SUT_NORMAL = REPO_ROOT / "holdout" / "sut" / "todoist_sut.py"
SUT_BUGGY = REPO_ROOT / "holdout" / "sut" / "todoist_sut_buggy.py"
ATTACK_PROBES = REPO_ROOT / "holdout" / "sut" / "attack_probes.todoist.js"


def _free_port() -> int:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _run_e2e(sut: str, attack: bool, budget_seconds: float, out_dir: str) -> dict:
    port = _free_port()
    cmd = [
        sys.executable, str(REPO_ROOT / "scripts" / "run_e2e.py"),
        "--openapi", str(HOLDOUT_OPENAPI), "--name", "todoist",
        "--sut", sut, "--port", str(port),
        "--output", out_dir, "--budget-seconds", str(budget_seconds), "--force",
    ]
    if attack:
        cmd += ["--attack", str(ATTACK_PROBES)]
    subprocess.run(cmd, cwd=REPO_ROOT, capture_output=True, text=True, timeout=budget_seconds + 30)
    return json.loads((Path(out_dir) / "e2e_report.json").read_text(encoding="utf-8"))


@unittest.skipUnless(shutil.which("node"), "node not installed")
@unittest.skipUnless(HOLDOUT_OPENAPI.exists() and SUT_NORMAL.exists(), "holdout contract/SUT not present")
class TestEndToEnd(unittest.TestCase):
    def test_real_http_execution_against_correct_sut_has_no_violations(self):
        tmp = tempfile.mkdtemp()
        report = _run_e2e("normal", attack=False, budget_seconds=60, out_dir=tmp)
        self.assertEqual(report["status"], "PASSED", report)
        summary = report["phases"][-1]["summary"]
        self.assertGreater(summary["http_calls"], 0)
        self.assertEqual(summary["protocol_violations"], [])

    def test_seeded_bugs_are_detected_against_buggy_sut_and_not_against_correct_one(self):
        tmp_buggy = tempfile.mkdtemp()
        report_buggy = _run_e2e("buggy", attack=True, budget_seconds=60, out_dir=tmp_buggy)
        self.assertEqual(report_buggy["status"], "PASSED", report_buggy)
        probes_buggy = report_buggy["phases"][-1]["summary"]["probe_results"]
        self.assertEqual(len(probes_buggy), 2)
        self.assertTrue(all(p["detected"] for p in probes_buggy), probes_buggy)

        tmp_correct = tempfile.mkdtemp()
        report_correct = _run_e2e("normal", attack=True, budget_seconds=60, out_dir=tmp_correct)
        self.assertEqual(report_correct["status"], "PASSED", report_correct)
        probes_correct = report_correct["phases"][-1]["summary"]["probe_results"]
        self.assertEqual(len(probes_correct), 2)
        self.assertFalse(any(p["detected"] for p in probes_correct), probes_correct)

    def test_budget_is_actually_enforced(self):
        tmp = tempfile.mkdtemp()
        report = _run_e2e("normal", attack=False, budget_seconds=0.05, out_dir=tmp)
        self.assertTrue(report["status"].startswith("TIMED_OUT"), report)


if __name__ == "__main__":
    unittest.main()
