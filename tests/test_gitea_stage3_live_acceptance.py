import json
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR = ROOT / "generator_baseline"
if str(GENERATOR) not in sys.path:
    sys.path.insert(0, str(GENERATOR))

from openapi_to_sbt.concurrency_adapter import validate_epoch
from openapi_to_sbt.evaluate_verifiers import evaluate
from openapi_to_sbt.trace_proxy import authorization_value


class GiteaStage3Tests(unittest.TestCase):
    def test_runtime_authentication_scheme_is_configurable(self):
        self.assertEqual("Bearer abc", authorization_value("Bearer", "abc"))
        self.assertEqual("token abc", authorization_value(" token ", " abc "))
        self.assertEqual("abc", authorization_value("", "abc"))

    def test_concurrency_adapter_accepts_only_scoped_safe_epochs(self):
        epoch = {
            "epoch_id": "generated-epoch-1",
            "operations": [
                {"operation_id": "generated-epoch-1-op-0", "method": "PATCH",
                 "path": "/items/1", "body": {"name": "a"}},
                {"operation_id": "generated-epoch-1-op-1", "method": "PATCH",
                 "path": "/items/1", "body": {"name": "b"}},
            ],
        }
        self.assertEqual("generated-epoch-1", validate_epoch(epoch)["epoch_id"])
        epoch["operations"][1]["path"] = "/../unsafe"
        with self.assertRaises(ValueError):
            validate_epoch(epoch)

    def test_failed_sequential_control_makes_concurrency_inconclusive(self):
        manifest = {
            "source": {}, "contract_oracles": [], "state_oracles": [],
            "concurrency_oracles": [{
                "oracle_id": "concurrency::same-field::edit::name",
                "kind": "same-field-one-successful-value-visible",
                "method": "PATCH", "path_template": "/items/{id}", "width": 2,
                "fields": [{"name": "name"}], "success_statuses": [200],
                "observation": {"success_statuses": [200]},
                "runtime": {"ready": True},
            }],
        }
        events = [
            {"epoch_id": "generated-control-1", "operation_id": "generated-control-1-op-0",
             "method": "PATCH", "model_path": "/items/not-a-valid-binding", "request": {"name": "a"},
             "status": 404, "upstream_started_utc": "2026-01-01T00:00:00Z",
             "upstream_completed_utc": "2026-01-01T00:00:01Z"},
            {"epoch_id": "generated-control-1", "operation_id": "generated-control-1-op-1",
             "method": "PATCH", "model_path": "/items/not-a-valid-binding", "request": {"name": "b"},
             "status": 404, "upstream_started_utc": "2026-01-01T00:00:01Z",
             "upstream_completed_utc": "2026-01-01T00:00:02Z"},
            {"epoch_id": "generated-control-1", "operation_id": "generated-control-1-observe",
             "method": "GET", "model_path": "/items/not-a-valid-binding", "status": 404},
            {"epoch_id": "generated-epoch-1", "operation_id": "generated-epoch-1-op-0",
             "method": "PATCH", "model_path": "/items/not-a-valid-binding", "request": {"name": "a"},
             "status": 404, "upstream_started_utc": "2026-01-01T00:00:03Z",
             "upstream_completed_utc": "2026-01-01T00:00:05Z"},
            {"epoch_id": "generated-epoch-1", "operation_id": "generated-epoch-1-op-1",
             "method": "PATCH", "model_path": "/items/not-a-valid-binding", "request": {"name": "b"},
             "status": 404, "upstream_started_utc": "2026-01-01T00:00:03.100000Z",
             "upstream_completed_utc": "2026-01-01T00:00:05.100000Z"},
            {"epoch_id": "generated-epoch-1", "operation_id": "generated-epoch-1-observe",
             "method": "GET", "model_path": "/items/not-a-valid-binding", "status": 404},
        ]
        result = evaluate(events, manifest)
        concurrency = result["layer_counts"]["concurrency"]
        self.assertEqual(1, concurrency["INCONCLUSIVE"])
        self.assertEqual(0, concurrency["VIOLATED"])
        witness = next(w for w in result["witnesses"] if w["kind"].startswith("same-field"))
        self.assertEqual("sequential-control-failed", witness["reason"])

    def test_stage3_runner_preserves_methodology_boundary(self):
        script = (ROOT / "scripts" / "Invoke-Gitea-Stage3.ps1").read_text(encoding="utf-8-sig")
        for marker in (
            "--authorization-scheme", '"token"', "openapi_to_sbt.concurrency_adapter",
            "openapi_to_sbt.evaluate_verifiers", "external_application_knowledge_used_by_generator = $false",
            "token_recorded = $false", "GITEA_STAGE3_EVIDENCE_READY",
        ):
            self.assertIn(marker, script)
        self.assertNotIn("GITEA_API_TOKEN =", script)


if __name__ == "__main__":
    unittest.main()
