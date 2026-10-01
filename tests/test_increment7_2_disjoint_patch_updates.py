#!/usr/bin/env python3
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


validator = module("disjoint_patch_validator", ROOT / "scripts" / "validate_disjoint_patch_verifiers.py")


def event(method, path, status, request=None, response=None):
    value = {"method": method, "model_path": path, "status": status}
    if request is not None:
        value["request"] = request
    if response is not None:
        value["response"] = response
    return value


class Increment72Tests(unittest.TestCase):
    def manifest(self, tasks=1):
        return {"prefix": "increment7_2_", "oracle": {"expected_witness_count": tasks}}

    def test_both_successful_disjoint_updates_visible(self):
        rows = [
            event("PATCH", "/tasks/7", 200, {"description": "increment7_2_task_0_description"}),
            event("PATCH", "/tasks/7", 200, {"title": "increment7_2_task_0_title"}),
            event("GET", "/tasks/7", 200, response={"title": "increment7_2_task_0_title", "description": "increment7_2_task_0_description"}),
        ]
        result = validator.evaluate(rows, self.manifest())
        self.assertEqual("PASS", result["run_status"])
        self.assertEqual(1, result["witness_count"])

    def test_lost_field_is_semantic_anomaly_candidate(self):
        rows = [
            event("PATCH", "/tasks/7", 200, {"title": "increment7_2_task_0_title"}),
            event("PATCH", "/tasks/7", 200, {"description": "increment7_2_task_0_description"}),
            event("GET", "/tasks/7", 200, response={"title": "old", "description": "increment7_2_task_0_description"}),
        ]
        result = validator.evaluate(rows, self.manifest())
        self.assertEqual("SEMANTIC_ANOMALY", result["run_status"])
        self.assertTrue(result["bug_candidate"])

    def test_missing_pair_is_inconclusive(self):
        rows = [
            event("PATCH", "/tasks/7", 200, {"title": "increment7_2_task_0_title"}),
            event("GET", "/tasks/7", 200, response={"title": "increment7_2_task_0_title"}),
        ]
        self.assertEqual("INCONCLUSIVE", validator.evaluate(rows, self.manifest())["run_status"])

    def test_increment7_1_puts_are_not_reclassified_as_7_2_patches(self):
        rows = [
            event("PUT", "/tasks/7", 200, {"title": "increment7_task_0_title"}),
            event("PUT", "/tasks/7", 200, {"description": "increment7_task_0_description"}),
        ]
        result = validator.evaluate(rows, self.manifest())
        self.assertEqual("INCONCLUSIVE", result["run_status"])
        self.assertEqual(0, result["witness_count"])

    def test_generated_story_contract_and_syntax(self):
        openapi = ROOT / "phase7" / "vikunja-multi-resource-openapi.json"
        if not openapi.exists():
            openapi = Path(__file__).resolve().parents[2] / "inc6_evidence" / "model" / "vikunja-multi-resource-openapi.json"
        with tempfile.TemporaryDirectory() as directory:
            story = Path(directory) / "disjoint.vikunja.js"
            manifest = Path(directory) / "manifest.json"
            subprocess.run([
                sys.executable, str(ROOT / "scripts" / "generate_disjoint_patch_bp_stories.py"),
                "--openapi", str(openapi), "--output", str(story), "--manifest", str(manifest), "--tasks", "6",
            ], check=True)
            data = json.loads(manifest.read_text())
            text = story.read_text()
            self.assertEqual(12, data["expected"]["disjoint_patches"])
            self.assertEqual(6, data["expected"]["witnesses"])
            self.assertEqual("PATCH", data["oracle"]["method"])
            self.assertIn("Milestone:AllConflictVerifiersClosed", text)
            self.assertIn("Milestone:AllDisjointPatchVerifiersClosed", text)
            self.assertIn("svc.patch", text)
            self.assertNotIn("svc.put", text)
            if subprocess.run(["node", "--version"], capture_output=True).returncode == 0:
                subprocess.run(["node", "--check", str(story)], check=True)


if __name__ == "__main__":
    unittest.main()
