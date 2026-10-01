import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "phase2_evaluator", ROOT / "scripts" / "evaluate_vikunja_validated_lifecycle.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class VikunjaPhase2EvaluatorTests(unittest.TestCase):
    def test_all_fifteen_witnesses_require_observable_state(self):
        events = [
            ("POST", "/projects", 201, {"title": "p"}, {"id": 2, "title": "p"}),
            ("GET", "/projects/2", 200, None, {"id": 2, "title": "p"}),
            ("POST", "/projects/2/tasks", 201, {"title": "t"}, {"id": 3, "project_id": 2}),
            ("GET", "/tasks/3", 200, None, {"id": 3, "done": False}),
            ("PUT", "/tasks/3", 200, {"title": "t", "done": True}, {"id": 3, "done": True}),
            ("GET", "/tasks/3", 200, None, {"id": 3, "title": "t", "done": True}),
            ("POST", "/labels", 201, {"title": "l"}, {"id": 4}),
            ("GET", "/labels/4", 200, None, {"id": 4, "title": "l"}),
            ("POST", "/tasks/3/labels", 201, {"label_id": 4}, {"label_id": 4}),
            ("GET", "/tasks/3/labels", 200, None, {"items": [{"id": 4}]}),
            ("DELETE", "/tasks/3/labels/4", 204, None, None),
            ("GET", "/tasks/3/labels", 200, None, {"items": []}),
            ("DELETE", "/tasks/3", 204, None, None),
            ("DELETE", "/labels/4", 204, None, None),
            ("DELETE", "/projects/2", 204, None, None),
            ("GET", "/tasks/3", 404, None, None),
            ("GET", "/labels/4", 404, None, None),
            ("GET", "/projects/2", 404, None, None),
        ]
        trace = [{"_trace_index": index, "method": method, "model_path": path,
                  "status": status, "request": request, "response": response}
                 for index, (method, path, status, request, response) in enumerate(events)]
        result = MODULE.evaluate(trace)
        self.assertTrue(result["phase2_passed"])
        self.assertEqual(result["passed_count"], 15)

        # Vikunja uses 403 for an inaccessible/deleted label.  It is a valid
        # post-delete transition because the same trace first read it as 200.
        trace[-2]["status"] = 403
        result = MODULE.evaluate(trace)
        self.assertTrue(result["phase2_passed"])

        trace[-1]["status"] = 200
        result = MODULE.evaluate(trace)
        self.assertFalse(result["phase2_passed"])
        self.assertFalse(result["witnesses"]["15_deletions_observable"])


if __name__ == "__main__":
    unittest.main()
