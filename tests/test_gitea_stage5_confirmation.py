import json
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from analyze_gitea_stage5_confirmation import analyze


class GiteaStage5ConfirmationTests(unittest.TestCase):
    def _run(self, root, number, witnesses):
        directory = Path(root) / f"run-{number}"
        directory.mkdir()
        events = []
        rendered = []
        for index, (operation, status, result, reason) in enumerate(witnesses):
            events.append({"_index": index, "method": "POST", "model_path": "/items",
                           "status": status, "request": {"name": f"n-{number}"},
                           "response": {"status": status}})
            rendered.append({"oracle_id": f"contract::{operation}", "kind": "response-contract",
                             "trigger_event": index, "result": result,
                             "observed": {"status": status}, "reason": reason})
        (directory / "http-trace.jsonl").write_text(
            "".join(json.dumps(item) + "\n" for item in events), encoding="utf-8")
        (directory / "generated-verifier-evaluation.json").write_text(
            json.dumps({"run_status": "CONTRACT_DEVIATION", "witnesses": rendered}), encoding="utf-8")
        (directory / "run-metadata.json").write_text(
            json.dumps({"seed": 100 + number}), encoding="utf-8")
        return directory

    def test_reproduced_undocumented_success_is_confirmed_contract_deviation(self):
        with tempfile.TemporaryDirectory() as tmp:
            runs = [self._run(tmp, n, [("createTag", 201, "VIOLATED",
                    "undocumented-response-status")]) for n in range(1, 4)]
            result = analyze(runs, 3)
            self.assertEqual("CONFIRMED_CONTRACT_DEVIATION",
                             result["candidates"][0]["confirmation"])

    def test_reproduced_500_remains_candidate_not_product_bug_claim(self):
        with tempfile.TemporaryDirectory() as tmp:
            runs = [self._run(tmp, n, [("applyPatch", 500, "VIOLATED",
                    "undocumented-response-status")]) for n in range(1, 4)]
            result = analyze(runs, 3)
            self.assertEqual("REPRODUCIBLE_SERVER_FAILURE_CANDIDATE",
                             result["candidates"][0]["confirmation"])
            self.assertIn("not a confirmed product bug", result["policy"]["claim_boundary"])

    def test_4xx_and_invalid_test_input_are_not_promoted(self):
        with tempfile.TemporaryDirectory() as tmp:
            run = self._run(tmp, 1, [
                ("denied", 403, "VIOLATED", "undocumented-response-status"),
                ("missingBody", 200, "INCONCLUSIVE", "invalid-test-input:required-request-body-missing"),
            ])
            result = analyze([run], 2)
            self.assertEqual([], result["candidates"])

    def test_single_observation_is_not_yet_reproduced(self):
        with tempfile.TemporaryDirectory() as tmp:
            run = self._run(tmp, 1, [("changeFiles", 500, "VIOLATED",
                    "undocumented-response-status")])
            result = analyze([run], 3)
            self.assertEqual("NOT_YET_REPRODUCED", result["candidates"][0]["confirmation"])


if __name__ == "__main__":
    unittest.main()
