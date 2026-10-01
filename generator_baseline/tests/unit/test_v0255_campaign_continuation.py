import json
import sys
import tempfile
import unittest
from pathlib import Path

GENERATOR_ROOT = Path(__file__).resolve().parents[2]
if str(GENERATOR_ROOT) not in sys.path:
    sys.path.insert(0, str(GENERATOR_ROOT))

from openapi_to_sbt.confirm_noop_candidate import classify_trial
from openapi_to_sbt.pipeline import run_pipeline
from openapi_to_sbt.runtime_observation import patch_runtime_file
from openapi_to_sbt.render.verification_js import render_verification_js


ROOT = Path(__file__).resolve().parents[3]
SPEC = ROOT / "phase7" / "vikunja-multi-resource-openapi.json"


class V0255CampaignContinuationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.result = run_pipeline(str(SPEC), "vikunja", "http://127.0.0.1:3457",
                                  seed=20262251, story_profile="full")

    def test_boolean_update_is_derived_from_observed_current_value(self):
        text = self.result.stories_js
        start = text.index('bthread("update:patchProjectsRead:1"')
        end = text.index("\n});", start)
        story = text[start:end]
        self.assertIn("let __beforeMutation = projectsRead(", story)
        self.assertIn('isArchived = !__beforeMutation.body["is_archived"]', story)

    def test_create_and_update_propagate_only_documented_success(self):
        stories = self.result.stories_js
        interfaces = self.result.interfaces_js
        self.assertIn('Event("SBT:OperationDidNotSucceed"', stories)
        self.assertIn("indexOf(__createResult.code) >= 0", stories)
        self.assertIn("indexOf(__operationResult.code) >= 0", stories)
        self.assertIn("var __httpSucceeded =", interfaces)
        self.assertIn('Event("SBT:OperationOutcome"', interfaces)

    def test_runtime_copy_observes_undocumented_status_without_changing_source(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "runtime.js"
            source = 'function x(){ svc.patch("/x", {expectedResponseCodes: [200]}); }\n'
            path.write_text(source, encoding="utf-8")
            report = patch_runtime_file(path)
            self.assertEqual(1, report["replacements"])
            self.assertNotEqual(report["source_sha256"], report["runtime_sha256"])
            self.assertIn("expectedResponseCodes: __sbtObservedHttpStatuses",
                          path.read_text(encoding="utf-8"))

    def test_repeatable_undocumented_noop_with_successful_control_is_confirmed(self):
        trial = {
            "same_before": {"status": 304, "error": None},
            "after_same_before": {"status": 200, "error": None,
                                  "response": {"is_archived": False}},
            "change": {"status": 200, "error": None},
            "same_after": {"status": 304, "error": None},
            "after_change": {"status": 200, "error": None,
                             "response": {"is_archived": True}},
            "after_same_after": {"status": 200, "error": None,
                                 "response": {"is_archived": True}},
            "baseline_value": False,
            "changed_value": True,
        }
        result, reason = classify_trial(trial, [200], "is_archived")
        self.assertEqual("CONFIRMED", result)
        self.assertIn("repeatable-undocumented-noop-status", reason)

    def test_documented_noop_status_is_not_a_confirmed_candidate(self):
        trial = {
            "same_before": {"status": 200, "error": None},
            "after_same_before": {"status": 200, "error": None,
                                  "response": {"is_archived": False}},
            "change": {"status": 200, "error": None},
            "same_after": {"status": 200, "error": None},
            "after_change": {"status": 200, "error": None,
                             "response": {"is_archived": True}},
            "after_same_after": {"status": 200, "error": None,
                                 "response": {"is_archived": True}},
            "baseline_value": False,
            "changed_value": True,
        }
        result, _reason = classify_trial(trial, [200], "is_archived")
        self.assertEqual("NOT_REPRODUCED", result)

    def test_noop_state_change_is_reported_separately_from_status_candidate(self):
        trial = {
            "same_before": {"status": 304, "error": None},
            "after_same_before": {"status": 200, "error": None,
                                  "response": {"is_archived": True}},
            "change": {"status": 200, "error": None},
            "same_after": {"status": 304, "error": None},
            "after_change": {"status": 200, "error": None,
                             "response": {"is_archived": True}},
            "after_same_after": {"status": 200, "error": None,
                                 "response": {"is_archived": True}},
            "baseline_value": False,
            "changed_value": True,
        }
        result, _reason = classify_trial(trial, [200], "is_archived")
        self.assertEqual("STATE_VIOLATION", result)

    def test_concurrency_controller_admits_each_ready_oracle_without_global_barrier(self):
        derived = {
            "counts": {"concurrency_oracles": 1},
            "concurrency_oracles": [{
                "oracle_id": "concurrency::same-field::patch-projects-read::is_archived",
                "kind": "same-field-writes",
                "method": "PATCH",
                "path_template": "/projects/{id}",
                "success_statuses": [200],
                "media_type": "application/merge-patch+json",
                "fields": [{"name": "is_archived", "type": "boolean"}],
                "runtime": {
                    "ready": True,
                    "entity_key": "projects",
                    "create_operation_id": "create-projects",
                    "path_binding_from_create_response": {"id": "id"},
                    "path_binding_from_create_request_path": {},
                },
            }],
        }
        rendered = render_verification_js(derived, "test")
        self.assertIn('waitFor:__sbtAnyConcurrencyReady()', rendered)
        self.assertIn('if(__readySeen[__readyEvent.name]){continue;}', rendered)
        self.assertIn('var __readyIndex=__readyEvent.name.substring(', rendered)
        self.assertIn('request:Event("SBT:ConcurrencyPermit:"+__readyIndex)', rendered)
        self.assertIn('waitFor:__sbtNamedEvent("SBT:ConcurrencyClosed:"+__readyIndex)', rendered)
        self.assertIn('block:__sbtAnyHttpDelete()', rendered)
        self.assertEqual(2, rendered.count('block:__sbtConcurrencyBusyBlock()'))
        self.assertNotIn('waitFor:Event("SBT:ConcurrencyReady:0")', rendered)
        self.assertNotIn('request:Event("SBT:ConcurrencyPermit:0")', rendered)


if __name__ == "__main__":
    unittest.main()
