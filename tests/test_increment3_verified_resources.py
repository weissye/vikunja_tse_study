#!/usr/bin/env python3
"""Structural and external-oracle regression tests for Increment 3."""

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
GENERATOR = ROOT / "generator_baseline"
OPENAPI = ROOT / "phase7" / "vikunja-multi-resource-openapi.json"


class Increment3GenerationTests(unittest.TestCase):
    def test_generated_resource_obligations_are_balanced(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "generated"
            subprocess.run([
                sys.executable, "-m", "openapi_to_sbt", "generate",
                "--openapi", str(OPENAPI), "--output", str(output),
                "--name", "vikunja", "--base-url", "http://127.0.0.1:3457",
                "--seed", "20261900", "--instances-per-entity", "6",
                "--instances-per-action", "1",
                "--story-profile", "multi-resource-verified-resources", "--force",
            ], cwd=GENERATOR, check=True, capture_output=True, text=True)
            stories = (output / "stories.vikunja.js").read_text(encoding="utf-8")
            for phase in ("Create", "Update", "Delete"):
                self.assertIn(f"Obligation:VerifyProject{phase}", stories)
                self.assertIn(f"VerifierClosed:Project{phase}", stories)
            for index in range(3):
                for phase in ("Create", "Update", "Delete"):
                    self.assertIn(f"Obligation:VerifyLabel{phase}:{index}", stories)
                    self.assertIn(f"VerifierClosed:Label{phase}:{index}", stories)
                self.assertIn(f"constraint:label-create-verifier:{index}", stories)
                self.assertIn(f"constraint:label-update-verifier:{index}", stories)
                self.assertIn(f'block:__mrNamed("State:LabelDetached:{index}")', stories)
            for index in range(6):
                for phase in ("Create", "Update", "Delete"):
                    self.assertIn(f"Obligation:VerifyTask{phase}:{index}", stories)
            self.assertIn("Milestone:AllTaskVerifiersClosed", stories)
            self.assertIn("Milestone:AllResourceVerifiersClosed", stories)
            self.assertIn("MultiResourceVerifiedResourcesComplete", stories)
            self.assertIn('expectedResponseCodes: [403,404]', stories)
            if subprocess.run(["node", "--version"], capture_output=True).returncode == 0:
                subprocess.run(["node", "--check", str(output / "stories.vikunja.js")], check=True)

    def test_manifest_has_exactly_nine_oracles(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "oracle-manifest.json"
            subprocess.run([sys.executable, str(ROOT / "scripts" / "generate_resource_oracle_manifest.py"),
                            "--openapi", str(OPENAPI), "--output", str(output)], check=True)
            manifest = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual("verified-resource-lifecycles", manifest["profile"])
            self.assertEqual(9, len(manifest["oracles"]))
            self.assertEqual({"project", "task", "label"}, {x["resource"] for x in manifest["oracles"]})


if __name__ == "__main__":
    unittest.main()
