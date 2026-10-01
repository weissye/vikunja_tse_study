import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR = ROOT / "generator_baseline"
if str(GENERATOR) not in sys.path:
    sys.path.insert(0, str(GENERATOR))

from openapi_to_sbt.evaluate_verifiers import evaluate
from openapi_to_sbt.render.verification_js import render_verification_js


class GiteaStage32CleanupTests(unittest.TestCase):
    def test_contract_only_violation_has_distinct_taxonomy(self):
        manifest = {
            "source": {}, "state_oracles": [], "concurrency_oracles": [],
            "contract_oracles": [{
                "oracle_id": "contract::read", "operation_id": "read",
                "kind": "response-contract",
                "method": "GET", "path_template": "/items",
                "success_statuses": [200], "documented_error_statuses": [],
                "request_contract": None,
            }],
        }
        result = evaluate([{"method": "GET", "model_path": "/items", "status": 403}], manifest)
        self.assertEqual("CONTRACT_DEVIATION", result["run_status"])
        self.assertEqual(1, result["layer_counts"]["contract"]["VIOLATED"])
        self.assertEqual(0, result["layer_counts"]["state"]["VIOLATED"])
        self.assertEqual(0, result["layer_counts"]["concurrency"]["VIOLATED"])

    def test_reset_write_is_epoch_labelled_and_excluded_from_state_layer(self):
        derived = {"counts": {"concurrency_oracles": 1}, "concurrency_oracles": [{
            "oracle_id": "concurrency::same-field::edit::name",
            "kind": "same-field-one-successful-value-visible", "operation_id": "edit",
            "method": "PATCH", "path_template": "/items/{id}",
            "media_type": "application/merge-patch+json", "success_statuses": [200],
            "fields": [{"name": "name", "type": "string"}],
            "runtime": {"ready": True, "entity_key": "items", "create_operation_id": "create",
                        "path_binding_from_create_response": {"id": "id"},
                        "path_binding_from_create_request_path": {}},
        }]}
        rendered = render_verification_js(derived, "generic")
        self.assertIn('var __resetEpoch="generated-reset-0"', rendered)
        self.assertIn('"X-Provengo-Epoch-Id":__resetEpoch', rendered)
        self.assertIn('"X-Provengo-Operation-Id":__resetEpoch+"-op-0"', rendered)

    def test_evidence_zip_excludes_mutable_internal_products(self):
        runner = (ROOT / "scripts" / "Invoke-Gitea-Stage3.ps1").read_text(encoding="utf-8-sig")
        self.assertGreaterEqual(runner.count('provengo_project\\products\\internal\\*'), 2)
        self.assertIn("CreateEntryFromFile", runner)
        self.assertNotIn('Compress-Archive -Path (Join-Path $run "*")', runner)

    def test_stage32_wrapper_regenerates_and_requires_concurrency(self):
        wrapper = (ROOT / "scripts" / "Invoke-Gitea-Stage3_2.ps1").read_text(encoding="utf-8-sig")
        self.assertIn("Invoke-Gitea-Stage2-Preflight.ps1", wrapper)
        self.assertIn("-RequireConcurrency", wrapper)
        self.assertIn("GITEA_STAGE3_2_COMPLETE", wrapper)


if __name__ == "__main__":
    unittest.main()
