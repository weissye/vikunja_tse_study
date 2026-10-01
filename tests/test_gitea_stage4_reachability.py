import sys
import json
import re
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR = ROOT / "generator_baseline"
if str(GENERATOR) not in sys.path:
    sys.path.insert(0, str(GENERATOR))

from openapi_to_sbt.render.verification_js import render_verification_js


class GiteaStage4ReachabilityTests(unittest.TestCase):
    def test_successful_non_crud_producer_publishes_generic_instance_ready(self):
        derived = {"counts": {"concurrency_oracles": 1}, "concurrency_oracles": [{
            "oracle_id": "concurrency::same-field::edit::description",
            "kind": "same-field-one-successful-value-visible",
            "method": "PATCH", "path_template": "/repos/{owner}/{repo}",
            "media_type": "application/json", "success_statuses": [200],
            "fields": [{"name": "description", "type": "string"}],
            "runtime": {
                "ready": True, "entity_key": "repos",
                "create_operation_id": "createCurrentUserRepo",
                "path_binding_from_create_response": {
                    "owner": "owner.login", "repo": "name"
                },
                "path_binding_from_create_request_path": {},
            },
        }]}
        rendered = render_verification_js(derived, "generic")
        self.assertIn('bthread("sbt:resource-bridge:createCurrentUserRepo"', rendered)
        self.assertIn('Event("InstanceReady:Repos:1",__resourceData)', rendered)
        self.assertIn('__resourceData["owner"]=__sbtReadPath(__created.data.__httpResponse,"owner.login")', rendered)
        self.assertIn('__resourceData["repo"]=__sbtReadPath(__created.data.__httpResponse,"name")', rendered)
        self.assertNotIn("gitea", rendered.lower())

    def test_each_producer_gets_one_bridge_even_with_multiple_oracles(self):
        oracle = {
            "kind": "same-field-one-successful-value-visible",
            "method": "PATCH", "path_template": "/items/{id}",
            "success_statuses": [200], "fields": [{"name": "name", "type": "string"}],
            "runtime": {"ready": True, "entity_key": "items", "create_operation_id": "createItem",
                        "path_binding_from_create_response": {"id": "id"},
                        "path_binding_from_create_request_path": {}},
        }
        derived = {"counts": {"concurrency_oracles": 2}, "concurrency_oracles": [
            dict(oracle, oracle_id="one"), dict(oracle, oracle_id="two")
        ]}
        rendered = render_verification_js(derived, "generic")
        self.assertEqual(1, rendered.count('bthread("sbt:resource-bridge:createItem"'))
        self.assertEqual(1, rendered.count('Event("InstanceReady:Items:1",__resourceData)'))

    def test_campaign_aggregator_counts_unique_oracles_and_producers(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            runs = []
            for number, oracle in enumerate(("oracle-a", "oracle-b"), 1):
                run = base / f"run-{number}"
                run.mkdir()
                (run / "concurrency-plan.gitea.json").write_text(json.dumps({
                    "oracles": [{"oracle_id": oracle, "runtime": {
                        "create_operation_id": f"producer-{number}"}}]
                }), encoding="utf-8")
                (run / "run-metadata.json").write_text(
                    json.dumps({"seed": 100 + number}), encoding="utf-8")
                (run / "generated-verifier-evaluation.json").write_text(
                    json.dumps({"run_status": "PASS"}), encoding="utf-8")
                (run / "concurrent-epochs.jsonl").write_text(json.dumps({
                    "epoch_id": f"e-{number}", "scenario": oracle, "width": 2,
                    "overlap_observed": True, "release_skew_ns": 1000,
                }) + "\n", encoding="utf-8")
                runs.append(run)
            summary, csv_path = base / "summary.json", base / "epochs.csv"
            command = [sys.executable, str(ROOT / "scripts" / "analyze_gitea_stage4_campaign.py"),
                       "--output", str(summary), "--csv", str(csv_path),
                       "--minimum-unique-oracles", "2", "--minimum-producer-families", "2"]
            for run in runs:
                command += ["--run", str(run)]
            completed = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(0, completed.returncode, completed.stderr)
            result = json.loads(summary.read_text(encoding="utf-8"))
            self.assertEqual("PASS", result["status"])
            self.assertEqual(2, result["totals"]["unique_oracles"])
            self.assertEqual(2, result["totals"]["producer_families"])

    def test_stage4_runner_is_quiet_and_stops_on_saturation(self):
        runner = (ROOT / "scripts" / "Invoke-Gitea-Stage4.ps1").read_text(encoding="utf-8-sig")
        self.assertIn("-SkipEvidence", runner)
        self.assertIn("-Quiet", runner)
        self.assertIn("$withoutNew -ge $SaturationRuns", runner)
        self.assertIn("$acceptanceReached", runner)
        self.assertIn("$seenProducers", runner)
        self.assertIn("GITEA_STAGE4_COMPLETE", runner)
        self.assertEqual([], re.findall(r"\$[A-Za-z_][A-Za-z0-9_]*:", runner))


if __name__ == "__main__":
    unittest.main()
