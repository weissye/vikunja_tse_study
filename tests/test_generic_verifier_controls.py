"""Regression checks for evidence strength and JSON PATCH serial controls."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "generator_baseline"))
from openapi_to_sbt.evaluate_verifiers import _state_witnesses, _concurrency_witnesses


class Controls(unittest.TestCase):
    def test_rejected_create_read_is_inconclusive_but_unambiguous_missing_is_visible(self):
        manifest = {
            "contract_oracles": [{"operation_id": "createItem", "method": "POST",
                                   "path_template": "/items"}],
            "state_oracles": [{"oracle_id": "state::createItem", "kind": "create-visibility",
                               "operation_id": "createItem", "path_template": "/items",
                               "trigger_success_statuses": [201], "fields": [],
                               "observation": {"path_template": "/items/{id}",
                                               "path_binding_from_response": {"id": "id"},
                                               "path_binding_from_request_path": {},
                                               "success_statuses": [200]}}],
        }
        created = {"_index": 0, "method": "POST", "model_path": "/items",
                   "status": 201, "response": {"id": "42"}}
        read = {"_index": 1, "method": "GET", "model_path": "/items/42",
                "status": 400, "response": {"message": "not found or access denied"}}
        witness = _state_witnesses([created, read], manifest)[0]
        self.assertEqual(witness["result"], "INCONCLUSIVE")
        self.assertEqual(witness["reason"], "item-read-rejected-without-independent-visibility")
        read["status"] = 404
        self.assertEqual(_state_witnesses([created, read], manifest)[0]["result"], "VIOLATED")

    def test_reverse_serial_control_is_required_for_json_disjoint(self):
        oracle = {"oracle_id": "concurrency::disjoint::patch::a::b",
                  "kind": "disjoint-writes-commute", "method": "PATCH",
                  "path_template": "/items/{id}", "width": 2,
                  "fields": [{"name": "a"}, {"name": "b"}],
                  "success_statuses": [200], "reverse_sequential_control": True,
                  "observation": {"success_statuses": [200]}}
        manifest = {"concurrency_oracles": [oracle]}
        def op(epoch, index, body, concurrent=False):
            return {"_index": index, "epoch_id": epoch, "operation_id": epoch + "-op-" + str(index),
                    "model_path": "/items/42", "method": "PATCH", "status": 200,
                    "request": body, "upstream_started_utc": "2026-01-01T00:00:00Z",
                    "upstream_completed_utc": "2026-01-01T00:00:01Z" if concurrent else "2026-01-01T00:00:00Z"}
        def read(epoch, index):
            return {"_index": index, "epoch_id": epoch, "operation_id": epoch + "-observe",
                    "model_path": "/items/42", "method": "GET", "status": 200,
                    "response": {"a": 1, "b": 2}}
        control = "generated-control-0"
        epoch = "generated-epoch-0"
        events = [op(control, 0, {"a": 1}), op(control, 1, {"b": 2}), read(control, 2),
                  op(epoch, 3, {"a": 1}, True), op(epoch, 4, {"b": 2}, True), read(epoch, 5)]
        self.assertEqual(_concurrency_witnesses(events, manifest)[0]["result"], "INCONCLUSIVE")
        reverse = "generated-reverse-control-0"
        events[3:3] = [op(reverse, 6, {"b": 2}), op(reverse, 7, {"a": 1}), read(reverse, 8)]
        self.assertEqual(_concurrency_witnesses(events, manifest)[0]["result"], "PASS")


if __name__ == "__main__":
    unittest.main()
