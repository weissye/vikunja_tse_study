#!/usr/bin/env python3
"""Unit tests for the Increment-3 external resource validator."""

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("validator", ROOT / "scripts" / "validate_resource_verifiers.py")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


def manifest():
    result = {"oracles": []}
    for resource in ("project", "task", "label"):
        absence = [403, 404] if resource == "label" else [404]
        result["oracles"] += [
            {"oracle_id": f"{resource}-create-visibility", "trigger": {"success_statuses": [201]},
             "observation": {"success_statuses": [200]}, "assertions": [{"type": "same_resource_id"}]},
            {"oracle_id": f"{resource}-update-persistence", "trigger": {"success_statuses": [200]},
             "observation": {"success_statuses": [200]},
             "assertions": [{"type": "written_fields_persist", "fields": ["title", "done"] if resource == "task" else ["title"]}]},
            {"oracle_id": f"{resource}-delete-absence", "trigger": {"success_statuses": [204]},
             "observation": {"absence_statuses": absence}, "assertions": [{"type": "resource_absent"}]},
        ]
    return result


def event(method, path, status, request=None, response=None):
    value = {"method": method, "model_path": path, "status": status}
    if request is not None: value["request"] = request
    if response is not None: value["response"] = response
    return value


class ResourceVerifierTests(unittest.TestCase):
    def trace(self):
        rows = []
        definitions = [
            ("project", "/projects", "/projects/10", 10, "p", "p2", 404),
            ("task", "/projects/10/tasks", "/tasks/20", 20, "t", "t2", 404),
            ("label", "/labels", "/labels/30", 30, "l", "l2", 403),
        ]
        for resource, create_path, item_path, resource_id, old, new, absent in definitions:
            rows += [event("POST", create_path, 201, {"title": old}, {"id": resource_id, "title": old}),
                     event("GET", item_path, 200, response={"id": resource_id, "title": old}),
                     event("PUT", item_path, 200, {"title": new, **({"done": True} if resource == "task" else {})}, {"id": resource_id}),
                     event("GET", item_path, 200, response={"id": resource_id, "title": new, **({"done": True} if resource == "task" else {})}),
                     event("DELETE", item_path, 204), event("GET", item_path, absent)]
        return rows

    def test_complete_trace_passes_all_nine_oracles(self):
        result = validator.evaluate(self.trace(), manifest(), {"project": 1, "task": 1, "label": 1})
        self.assertEqual("PASS", result["run_status"])
        self.assertEqual(9, len(result["oracle_summary"]))
        self.assertEqual(9, len(result["witnesses"]))
        self.assertTrue(all(x["status"] == "PASS" for x in result["oracle_summary"].values()))

    def test_label_403_without_predelete_read_is_inconclusive(self):
        rows = self.trace()
        rows = [x for x in rows if not (x["method"] == "GET" and x["model_path"] == "/labels/30" and x["status"] == 200)]
        result = validator.evaluate(rows, manifest(), {"project": 1, "task": 1, "label": 1})
        self.assertEqual("INCONCLUSIVE", result["oracle_summary"]["label-delete-absence"]["status"])

    def test_persistence_mismatch_is_semantic_anomaly(self):
        rows = self.trace()
        for row in rows:
            if row["method"] == "GET" and row["model_path"] == "/projects/10" and row.get("response", {}).get("title") == "p2":
                row["response"]["title"] = "stale"
        result = validator.evaluate(rows, manifest(), {"project": 1, "task": 1, "label": 1})
        self.assertEqual("SEMANTIC_ANOMALY", result["run_status"])
        self.assertEqual("VIOLATED", result["oracle_summary"]["project-update-persistence"]["status"])


if __name__ == "__main__":
    unittest.main()
