import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "relation_eval", ROOT / "scripts" / "evaluate_vikunja_relation_lifecycle.py"
)
M = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(M)


class RelationEvaluatorTests(unittest.TestCase):
    def test_twenty_one_witnesses_and_dangling_negative_control(self):
        related_a = {"id": 10, "done": False, "related_tasks": {"related": [{"id": 11}]}}
        related_b = {"id": 11, "related_tasks": {"related": [{"id": 10}]}}
        rows = [
            ("POST", "/projects", 201, {"title": "p"}, {"id": 1}),
            ("GET", "/projects/1", 200, None, {"id": 1}),
            ("POST", "/projects/1/tasks", 201, {"title": "a"}, {"id": 10}),
            ("GET", "/tasks/10", 200, None, {"id": 10}),
            ("POST", "/projects/1/tasks", 201, {"title": "b"}, {"id": 11}),
            ("GET", "/tasks/11", 200, None, {"id": 11}),
            ("POST", "/tasks/10/relations", 201,
             {"other_task_id": 11, "relation_kind": "related"}, {"task_id": 10}),
            ("GET", "/tasks/10", 200, None, related_a),
            ("GET", "/tasks/11", 200, None, related_b),
            ("PUT", "/tasks/10", 200, {"done": True, "title": "a"}, {"id": 10}),
            ("GET", "/tasks/10", 200, None,
             {"id": 10, "done": True, "title": "a", "related_tasks": {"related": [{"id": 11}]}}),
            ("DELETE", "/tasks/10/relations/related/11", 204, None, None),
            ("GET", "/tasks/10", 200, None, {"id": 10, "related_tasks": {}}),
            ("GET", "/tasks/11", 200, None, {"id": 11, "related_tasks": {}}),
            ("POST", "/tasks/10/relations", 201,
             {"other_task_id": 11, "relation_kind": "related"}, {"task_id": 10}),
            ("DELETE", "/tasks/11", 204, None, None),
            ("GET", "/tasks/10", 200, None, {"id": 10, "related_tasks": {}}),
            ("DELETE", "/tasks/10", 204, None, None),
            ("DELETE", "/projects/1", 204, None, None),
            ("GET", "/tasks/10", 404, None, None),
            ("GET", "/tasks/11", 404, None, None),
            ("GET", "/projects/1", 404, None, None),
        ]
        events = [{"_i": i, "method": method, "model_path": path, "status": status,
                   "request": request, "response": response}
                  for i, (method, path, status, request, response) in enumerate(rows)]
        result = M.evaluate(events)
        self.assertTrue(result["phase3b_pilot_passed"])
        self.assertEqual(result["passed_count"], 21)
        events[16]["response"]["related_tasks"] = {"related": [{"id": 11}]}
        self.assertFalse(M.evaluate(events)["phase3b_pilot_passed"])


if __name__ == "__main__":
    unittest.main()
