#!/usr/bin/env python3
"""Structural regression checks for the Increment-2 BP profile."""

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
GENERATOR = ROOT / "generator_baseline"
OPENAPI = ROOT / "phase7" / "vikunja-multi-resource-openapi.json"


class VerifiedObligationsGenerationTests(unittest.TestCase):
    def test_profile_generates_balanced_task_obligations(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "generated"
            command = [
                sys.executable, "-m", "openapi_to_sbt", "generate",
                "--openapi", str(OPENAPI),
                "--output", str(output),
                "--name", "vikunja",
                "--base-url", "http://127.0.0.1:3457",
                "--seed", "20261800",
                "--instances-per-entity", "6",
                "--instances-per-action", "1",
                "--story-profile", "multi-resource-verified-obligations",
                "--force",
            ]
            subprocess.run(command, cwd=GENERATOR, check=True, capture_output=True, text=True)
            stories = (output / "stories.vikunja.js").read_text(encoding="utf-8")

            for index in range(6):
                for phase in ("Create", "Update", "Delete"):
                    self.assertIn(f'Obligation:VerifyTask{phase}:{index}', stories)
                    self.assertIn(f'VerifierClosed:Task{phase}:{index}', stories)
                self.assertIn(f'constraint:task-create-verifier:{index}', stories)
                self.assertIn(f'constraint:task-update-verifier:{index}', stories)

            self.assertIn("block:__mrNamed", stories)
            self.assertIn("Milestone:AllTaskVerifiersClosed", stories)
            self.assertIn("MultiResourceVerifiedObligationsComplete", stories)
            self.assertIn('expectedResponseCodes: [404]', stories)
            for index in range(6):
                closed = stories.index(f'Event("VerifierClosed:TaskUpdate:{index}"')
                observed = stories.index(f'Event("State:TaskUpdated:{index}"')
                self.assertLess(closed, observed)

            if subprocess.run(["node", "--version"], capture_output=True).returncode == 0:
                subprocess.run(["node", "--check", str(output / "stories.vikunja.js")], check=True)


if __name__ == "__main__":
    unittest.main()
