import json
import sys
import unittest
from pathlib import Path

GENERATOR_ROOT = Path(__file__).resolve().parents[2]
if str(GENERATOR_ROOT) not in sys.path:
    sys.path.insert(0, str(GENERATOR_ROOT))

from openapi_to_sbt.evaluate_verifiers import evaluate
from openapi_to_sbt.pipeline import run_pipeline
from openapi_to_sbt.verification import derive_verification


ROOT = Path(__file__).resolve().parents[3]
SPEC = ROOT / "phase7" / "vikunja-multi-resource-openapi.json"


class V0254RequestExecutionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.result = run_pipeline(str(SPEC), "vikunja", "http://127.0.0.1:3457",
                                  seed=20262251, story_profile="full")

    def test_patch_uses_merge_patch_object_and_media_type(self):
        text = self.result.interfaces_js
        start = text.index("function patchProjectsRead(")
        end = text.index("\n}\n", start)
        function = text[start:end]
        self.assertIn('var __body = {};', function)
        self.assertIn('__body["description"]', function)
        self.assertIn('__headers["Content-Type"] = "application/merge-patch+json"', function)

    def test_positive_task_create_is_minimal_and_identity_coherent(self):
        text = self.result.stories_js
        start = text.index('bthread("crud:TaskReadOneBodies:1"')
        end = text.index('\n});', start)
        story = text[start:end]
        self.assertIn('let project = captured["project"]', story)
        self.assertIn('let projectId = undefined;', story)
        self.assertIn('let percentDone = undefined;', story)
        self.assertIn('let repeatMode = undefined;', story)

    def test_required_missing_body_is_not_a_sut_violation(self):
        manifest = derive_verification(self.result.doc, SPEC.read_bytes())
        events = [{"_index": 0, "method": "PATCH", "model_path": "/projects/7",
                   "request": None, "request_content_type": "application/merge-patch+json",
                   "status": 422, "response": {"detail": "invalid"}}]
        result = evaluate(events, manifest)
        witness = result["witnesses"][0]
        self.assertEqual("INCONCLUSIVE", witness["result"])
        self.assertIn("invalid-test-input:required-request-body-missing", witness["reason"])
        self.assertEqual("INCONCLUSIVE", result["run_status"])

    def test_create_is_followed_by_item_observation(self):
        self.assertIn('projectsRead(__justCreated["description"]', self.result.stories_js)

    def test_ready_concurrency_oracles_without_an_epoch_are_inconclusive(self):
        manifest = {
            "source": {"openapi_sha256": "unit-test"},
            "contract_oracles": [],
            "state_oracles": [],
            "concurrency_oracles": [{
                "oracle_id": "ready-but-not-exercised",
                "runtime": {"ready": True},
            }],
        }
        events = [{"_index": 0, "method": "GET", "model_path": "/health",
                   "status": 200, "response": {"status": "ok"}}]
        result = evaluate(events, manifest)
        self.assertEqual(1, result["concurrency_oracles_ready"])
        self.assertEqual(0, result["concurrency_oracles_exercised"])
        self.assertEqual("INCONCLUSIVE", result["run_status"])
        self.assertTrue(any(
            witness.get("reason") == "no-concurrent-epoch-was-exercised"
            for witness in result["witnesses"]
        ))

    def test_put_baseline_fields_do_not_hide_the_single_concurrent_intent(self):
        from openapi_to_sbt.evaluate_verifiers import _varying_keys
        bodies = [
            {"title": "same", "description": "first", "is_archived": False},
            {"title": "same", "description": "second", "is_archived": False},
        ]
        self.assertEqual({"description"}, _varying_keys(bodies))

    def test_sequential_control_requires_persisted_same_field_value(self):
        from openapi_to_sbt.evaluate_verifiers import _sequential_control_state
        oracle = {
            "kind": "same-field-one-successful-value-visible-domain",
            "success_statuses": [200],
        }
        operations = [
            {"status": 200, "request": {"bucket_id": 1}},
            {"status": 200, "request": {"bucket_id": 2}},
        ]
        invalid, reason = _sequential_control_state(
            oracle, operations, {"response": {"bucket_id": 0}}, {"bucket_id"})
        self.assertFalse(invalid)
        self.assertEqual("sequential-control-state-mismatch", reason)

        valid, reason = _sequential_control_state(
            oracle, operations, {"response": {"bucket_id": 2}}, {"bucket_id"})
        self.assertTrue(valid)
        self.assertEqual("", reason)


if __name__ == "__main__":
    unittest.main()
