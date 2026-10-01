import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR = ROOT / "generator_baseline"
if str(GENERATOR) not in sys.path:
    sys.path.insert(0, str(GENERATOR))


class GiteaStage2PreflightTests(unittest.TestCase):
    def test_generator_version_contains_swagger2_fix(self):
        from openapi_to_sbt import __version__
        self.assertEqual("0.26.2", __version__)

    def test_stage2_is_offline_and_pinned_to_stage1_spec(self):
        text = (ROOT / "scripts" / "Invoke-Gitea-Stage2-Preflight.ps1").read_text(encoding="utf-8")
        self.assertIn("a0baa9a766c22492bd8c45744157c611d3e95cfc0dc73d6f5d14f294cdddce38", text)
        self.assertIn('expectedGeneratorVersion = "0.26.2"', text)
        self.assertIn("No request was sent to Gitea during Stage 2.", text)
        self.assertNotIn("Invoke-RestMethod", text)
        self.assertNotIn("Invoke-WebRequest", text)
        self.assertNotIn("GITEA_API_TOKEN", text)

    def test_analyzer_enforces_no_silent_operation_or_schema_loss(self):
        text = (ROOT / "scripts" / "analyze_gitea_stage2.py").read_text(encoding="utf-8")
        for marker in (
            "all_active_operations_have_contract_verifiers",
            "swagger_request_bodies_preserved",
            "swagger_response_schemas_preserved",
            "manual_assumptions_zero",
            "runtime_ready_concurrency_exists",
        ):
            self.assertIn(marker, text)


if __name__ == "__main__":
    unittest.main()
