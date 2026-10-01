import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
ROOT = HERE.parents[1]


class TestV34RuntimeIdWiring(unittest.TestCase):
    def test_complex_stories_embed_runtime_keys_in_callbacks(self):
        with tempfile.TemporaryDirectory() as td:
            env = os.environ.copy()
            env["PYTHONPATH"] = str(ROOT)
            subprocess.run([
                sys.executable, str(HERE / "build_netbox_a2a.py"),
                "--output", td, "--seed", "1",
                "--instances-per-entity", "5", "--instances-per-action", "7"
            ], check=True, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            story = (Path(td) / "complex_stories.netbox_a2a.js").read_text(encoding="utf-8")
            self.assertNotIn("v31Id(", story)
            self.assertNotIn("_fallback", story)
            self.assertNotIn("__PVG_RTV__:", story)
            self.assertIn("//@provengo summon rtv", story)
            self.assertIn('pvg.rtv.set("v34_', story)
            self.assertIn('@{v34_', story)
            self.assertRegex(story, r'svc\.get\("/api/[^\"]+@\{v34_[^}]+\}[^\"]*"')
            # Callback keys must be literal strings, not callback references to a local carrier.
            self.assertNotIn("pvg.rtv.set(__rtv_", story)
            for fam, depth in {
                "relation_second_reassignment": 8,
                "parent_delete_multiple_children": 6,
                "duplicate_required_string": 2,
                "scalar_second_update": 5,
                "deleted_parent_reference_reuse": 5,
            }.items():
                self.assertIn(f"V34_FAMILY family={fam} steps={depth}", story)


if __name__ == "__main__":
    unittest.main()
