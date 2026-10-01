import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


evaluator = load_module("increment8_1_evaluator", ROOT / "scripts" / "evaluate_vikunja_increment8_1.py")
harness = load_module("increment8_1_harness", ROOT / "scripts" / "confirm_vikunja_increment8_1.py")


def witness(statuses=(200, 200), title="new-title", description="new-description", overlap_ns=10):
    return {
        "trial_id": "trial-000",
        "task_id": 1,
        "sequential_control_pass": True,
        "reset_pass": True,
        "concurrent_expected": {"title": "new-title", "description": "new-description"},
        "concurrent": {
            "operations": [
                {"status": statuses[0], "error": None},
                {"status": statuses[1], "error": None},
            ],
            "overlap_observed": overlap_ns > 0,
            "overlap_ns": overlap_ns,
            "release_skew_ns": 100,
            "distinct_connections": True,
        },
        "post_join_observation": {
            "status": 200,
            "response": {"title": title, "description": description},
        },
    }


class EvaluationTests(unittest.TestCase):
    def test_pass(self):
        self.assertEqual("PASS", evaluator.classify(witness())["result"])

    def test_lost_update(self):
        value = witness(description="old-description")
        self.assertEqual("LOST_UPDATE", evaluator.classify(value)["result"])

    def test_server_failure(self):
        self.assertEqual("SERVER_FAILURE", evaluator.classify(witness(statuses=(200, 500)))["result"])

    def test_missing_overlap_is_inconclusive(self):
        self.assertEqual("INCONCLUSIVE", evaluator.classify(witness(overlap_ns=0))["result"])

    def test_failed_sequential_control_is_inconclusive(self):
        value = witness()
        value["sequential_control_pass"] = False
        self.assertEqual("INCONCLUSIVE", evaluator.classify(value)["result"])

    def test_url_redaction_discards_userinfo_and_query(self):
        value = harness.redact_url("http://user:secret@127.0.0.1:3456/api/v2?token=secret")
        self.assertEqual("http://127.0.0.1:3456/api/v2", value)

    def test_jsonl_loader(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "witnesses.jsonl"
            path.write_text(json.dumps(witness()) + "\n", encoding="utf-8")
            self.assertEqual(1, len(evaluator.load_jsonl(path)))


if __name__ == "__main__":
    unittest.main()
