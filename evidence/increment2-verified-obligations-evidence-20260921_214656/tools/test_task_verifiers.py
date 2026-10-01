#!/usr/bin/env python3
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location(
    "validator", PROJECT_ROOT / "scripts" / "validate_task_verifiers.py"
)
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)


MANIFEST = {
    "oracles": [
        {
            "oracle_id": "task-create-visibility",
            "trigger": {"success_statuses": [201]},
            "observation": {"success_statuses": [200]},
        },
        {
            "oracle_id": "task-update-persistence",
            "trigger": {"success_statuses": [200]},
            "observation": {"success_statuses": [200]},
        },
        {
            "oracle_id": "task-delete-absence",
            "trigger": {"success_statuses": [204]},
            "observation": {"absence_statuses": [404]},
        },
    ]
}


def event(method, path, status, request=None, response=None):
    value = {"method": method, "model_path": path, "status": status}
    if request is not None:
        value["request"] = request
    if response is not None:
        value["response"] = response
    return value


def indexed(events):
    for index, value in enumerate(events):
        value["_index"] = index
    return events


class TaskVerifierTests(unittest.TestCase):
    def complete_trace(self):
        return indexed([
            event("POST", "/projects/1/tasks", 201, {"title": "created"}, {"id": 7}),
            event("GET", "/tasks/7", 200, response={"id": 7, "title": "created", "done": False}),
            event("PUT", "/tasks/7", 200, {"title": "updated", "done": True}, {"id": 7}),
            event("GET", "/tasks/7", 200, response={"id": 7, "title": "updated", "done": True}),
            event("DELETE", "/tasks/7", 204),
            event("GET", "/tasks/7", 404, response={"message": "not found"}),
        ])

    def test_complete_lifecycle_passes(self):
        result = validator.evaluate(self.complete_trace(), MANIFEST)
        self.assertEqual("PASS", result["run_status"])
        self.assertEqual(3, len(result["witnesses"]))

    def test_update_mismatch_is_semantic_anomaly(self):
        events = self.complete_trace()
        events[3]["response"]["done"] = False
        result = validator.evaluate(events, MANIFEST)
        self.assertEqual("SEMANTIC_ANOMALY", result["run_status"])
        self.assertEqual("VIOLATED", result["oracle_summary"]["task-update-persistence"]["status"])
        self.assertFalse(result["confirmed_product_bug"])

    def test_missing_observation_is_inconclusive_not_bug(self):
        result = validator.evaluate(self.complete_trace()[:-1], MANIFEST, expected_instances=1)
        self.assertEqual("INCONCLUSIVE", result["run_status"])
        self.assertEqual("INCONCLUSIVE", result["oracle_summary"]["task-delete-absence"]["status"])
        self.assertFalse(result["confirmed_product_bug"])

    def test_missing_instance_is_inconclusive(self):
        result = validator.evaluate(self.complete_trace(), MANIFEST, expected_instances=2)
        self.assertEqual("INCONCLUSIVE", result["run_status"])
        for summary in result["oracle_summary"].values():
            self.assertEqual("INCONCLUSIVE", summary["status"])
            self.assertEqual(1, summary["missing_witness_count"])

    def test_trace_loader_accepts_jsonl(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "trace.jsonl"
            rows = self.complete_trace()
            for row in rows:
                row.pop("_index")
            path.write_text("\n".join(json.dumps(x) for x in rows) + "\n", encoding="utf-8")
            loaded = validator.load_trace(path)
            self.assertEqual(6, len(loaded))
            self.assertEqual(list(range(6)), [x["_index"] for x in loaded])


if __name__ == "__main__":
    unittest.main()
