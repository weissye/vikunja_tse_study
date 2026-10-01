import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "generator_baseline"))
from openapi_to_sbt.parsing.loader import load_and_resolve
from openapi_to_sbt.parsing.normalize import normalize
from openapi_to_sbt.inference.entities import infer_entities


class NestedResourceInferenceTest(unittest.TestCase):
    def test_parent_child_pair_and_parent_action_are_separate(self):
        def operation(op_id):
            return {"operationId": op_id, "responses": {"200": {"description": "ok"}}}

        spec = {"openapi": "3.0.3", "info": {"title": "Synthetic", "version": "1"},
                "paths": {
                    "/tenants": {"post": operation("createTenant")},
                    "/tenants/{tenantId}": {"get": operation("readTenant")},
                    "/tenants/{tenantId}/users": {"post": operation("createUser")},
                    "/tenants/{tenantId}/users/{userId}": {"get": operation("readUser")},
                    "/tenants/{tenantId}/users/{userId}/disable": {"post": operation("disableUser")},
                    "/tenants/{tenantId}/audit": {"post": operation("auditTenant")},
                }}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "contract.json"
            path.write_text(json.dumps(spec), encoding="utf-8")
            resolved, _ = load_and_resolve(str(path))
            doc = normalize(resolved, spec)
            entities = {entity.key: entity for entity in infer_entities(doc)}
        self.assertIn("tenants", entities)
        key = "tenants/{tenantId}/users"
        self.assertIn(key, entities)
        self.assertEqual(entities[key].item_path, "/tenants/{tenantId}/users/{userId}")
        self.assertIn("disableUser", [op.operation_id for op in entities[key].action_operations])
        self.assertNotIn("disableUser", [op.operation_id for op in entities["tenants"].action_operations])
        self.assertIn("auditTenant", [op.operation_id for op in entities["tenants"].action_operations])
        self.assertTrue(any(p.rule.startswith("E7:") for p in entities[key].provenance))


if __name__ == "__main__":
    unittest.main()
