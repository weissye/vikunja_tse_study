import json
import tempfile
import unittest
from pathlib import Path

from openapi_to_sbt.parsing.normalize import normalize
from openapi_to_sbt.verification import derive_verification
from openapi_to_sbt.evaluate_verifiers import evaluate
from openapi_to_sbt.concurrency_adapter import validate_epoch


def spec():
    body = {
        "openapi": "3.0.3", "info": {"title": "Generic", "version": "1"},
        "paths": {
            "/widgets": {"post": {"operationId": "createWidget", "requestBody": {"content": {"application/json": {"schema": {"type": "object", "properties": {"name": {"type": "string"}}}}}}, "responses": {"201": {"content": {"application/json": {"schema": {"type": "object", "properties": {"id": {"type": "integer"}, "name": {"type": "string"}}}}}}}}},
            "/widgets/{id}": {
                "get": {"operationId": "getWidget", "parameters": [{"in": "path", "name": "id", "required": True, "schema": {"type": "integer"}}], "responses": {"200": {"content": {"application/json": {"schema": {"type": "object"}}}}, "404": {"description": "missing"}}},
                "patch": {"operationId": "patchWidget", "parameters": [{"in": "path", "name": "id", "required": True, "schema": {"type": "integer"}}], "requestBody": {"content": {"application/merge-patch+json": {"schema": {"type": "object", "properties": {"name": {"type": "string"}, "priority": {"type": "integer"}}}}}}, "responses": {"200": {"description": "ok"}}},
                "delete": {"operationId": "deleteWidget", "parameters": [{"in": "path", "name": "id", "required": True, "schema": {"type": "integer"}}], "responses": {"204": {"description": "deleted"}}},
            },
        },
    }
    return body


class VerificationGenerationTests(unittest.TestCase):
    def setUp(self):
        raw = spec()
        self.generated = derive_verification(normalize(raw, raw), json.dumps(raw).encode())

    def test_every_operation_has_contract_oracle(self):
        self.assertTrue(self.generated["coverage_complete"])
        self.assertEqual(4, self.generated["counts"]["contract_verifiers"])

    def test_lifecycle_oracles_are_openapi_derived(self):
        kinds = {x["kind"] for x in self.generated["state_oracles"]}
        self.assertEqual({"create-visibility", "written-fields-persist", "delete-absence"}, kinds)

    def test_merge_patch_produces_disjoint_concurrency_oracle(self):
        kinds = {x["kind"] for x in self.generated["concurrency_oracles"]}
        self.assertIn("disjoint-writes-commute", kinds)
        self.assertIn("same-field-one-successful-value-visible", kinds)
        self.assertIn("update-delete-linearizable", kinds)

    def test_no_manual_assumptions(self):
        self.assertEqual([], self.generated["manual_assumptions"])
        text = json.dumps(self.generated).lower()
        self.assertNotIn("vikunja", text)

    def test_evaluator_detects_persistence_violation(self):
        events = [
            {"method": "PATCH", "model_path": "/widgets/7", "status": 200, "request": {"name": "new"}},
            {"method": "GET", "model_path": "/widgets/7", "status": 200, "response": {"id": 7, "name": "old"}},
        ]
        result = evaluate(events, self.generated)
        self.assertEqual("SEMANTIC_ANOMALY", result["run_status"])

    def test_missing_observation_is_inconclusive(self):
        events = [{"method": "PATCH", "model_path": "/widgets/7", "status": 200, "request": {"name": "new"}}]
        result = evaluate(events, self.generated)
        self.assertEqual("INCONCLUSIVE", result["run_status"])

    def test_empty_trace_is_not_a_pass(self):
        result = evaluate([], self.generated)
        self.assertEqual("INCONCLUSIVE", result["run_status"])
        self.assertEqual(1, result["counts"]["INCONCLUSIVE"])

    def test_generic_concurrency_domain_detects_lost_update(self):
        events = [
            {"epoch_id": "e1", "operation_id": "e1-a", "method": "PATCH",
             "model_path": "/widgets/7", "status": 200, "request": {"name": "new"},
             "upstream_started_utc": "2026-01-01T00:00:00+00:00",
             "upstream_completed_utc": "2026-01-01T00:00:02+00:00"},
            {"epoch_id": "e1", "operation_id": "e1-b", "method": "PATCH",
             "model_path": "/widgets/7", "status": 200, "request": {"priority": 9},
             "upstream_started_utc": "2026-01-01T00:00:01+00:00",
             "upstream_completed_utc": "2026-01-01T00:00:03+00:00"},
            {"epoch_id": "e1", "operation_id": "e1-observe", "method": "GET",
             "model_path": "/widgets/7", "status": 200,
             "response": {"name": "new", "priority": 1}},
        ]
        result = evaluate(events, self.generated)
        concurrency = [w for w in result["witnesses"] if w.get("epoch_id") == "e1"]
        self.assertEqual(1, len(concurrency))
        self.assertEqual("VIOLATED", concurrency[0]["result"])
        self.assertEqual("successful-disjoint-update-lost", concurrency[0]["reason"])

    def test_each_concurrent_request_keeps_its_contract_witness(self):
        events = [
            {"epoch_id": "e2", "operation_id": "e2-a", "method": "PATCH",
             "model_path": "/widgets/7", "status": 200, "request": {"name": "a"},
             "upstream_started_utc": "2026-01-01T00:00:00+00:00",
             "upstream_completed_utc": "2026-01-01T00:00:02+00:00"},
            {"epoch_id": "e2", "operation_id": "e2-b", "method": "PATCH",
             "model_path": "/widgets/7", "status": 599, "request": {"priority": 2},
             "upstream_started_utc": "2026-01-01T00:00:01+00:00",
             "upstream_completed_utc": "2026-01-01T00:00:03+00:00"},
            {"epoch_id": "e2", "operation_id": "e2-observe", "method": "GET",
             "model_path": "/widgets/7", "status": 200,
             "response": {"name": "a", "priority": 2}},
        ]
        result = evaluate(events, self.generated)
        self.assertEqual({"PASS": 2, "VIOLATED": 1, "INCONCLUSIVE": 0},
                         result["layer_counts"]["contract"])
        self.assertEqual(0, result["layer_counts"]["state"]["INCONCLUSIVE"])

    def test_nested_create_path_can_bind_generated_item_identity(self):
        raw = spec()
        raw["paths"].update({
            "/parents/{parent}/gadgets": {
                "post": {"operationId": "gadgets-create",
                         "parameters": [{"in": "path", "name": "parent", "required": True,
                                         "schema": {"type": "integer"}}],
                         "requestBody": {"content": {"application/json": {"schema": {
                             "type": "object", "properties": {"name": {"type": "string"}}}}}},
                         "responses": {"201": {"content": {"application/json": {"schema": {
                             "type": "object", "properties": {"id": {"type": "integer"}}}}}}}}
            },
            "/gadgets/{gadget}": {
                "get": {"operationId": "gadgets-read", "responses": {"200": {"description": "ok"}}},
                "patch": {"operationId": "gadgets-patch",
                          "requestBody": {"content": {"application/merge-patch+json": {"schema": {
                              "type": "object", "properties": {"name": {"type": "string"},
                                                                  "rank": {"type": "integer"}}}}}},
                          "responses": {"200": {"description": "ok"}}},
            },
        })
        generated = derive_verification(normalize(raw, raw), json.dumps(raw).encode())
        candidates = [x for x in generated["concurrency_oracles"]
                      if x["operation_id"] == "gadgets-patch" and x.get("runtime", {}).get("ready")]
        self.assertTrue(candidates)
        self.assertEqual({"gadget": "id"}, candidates[0]["runtime"]["path_binding_from_create_response"])

    def test_generic_adapter_validates_transport_shape_without_domain_fields(self):
        epoch = validate_epoch({"epoch_id": "generated-epoch-1", "operations": [
            {"operation_id": "generated-epoch-1-a", "method": "PATCH", 
             "path": "/any-resource/4", "body": {"arbitrary": "value"}, "headers": {}},
            {"operation_id": "generated-epoch-1-b", "method": "PUT",
             "path": "/another/9", "body": {"different": 2}, "headers": {}},
        ]})
        self.assertEqual(2, len(epoch["operations"]))
        with self.assertRaises(ValueError):
            validate_epoch({"epoch_id": "e", "operations": [
                {"operation_id": "e-a", "method": "PATCH", "path": "http://example/x", "body": {}},
                {"operation_id": "e-b", "method": "PATCH", "path": "/x", "body": {}},
            ]})


if __name__ == "__main__":
    unittest.main()
