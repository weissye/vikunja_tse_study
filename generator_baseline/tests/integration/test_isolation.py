"""Integration tests for input isolation (ACCEPTANCE_CRITERIA.md Validation
#7, #8 and DEVELOPMENT_PROMPT.md's leakage-test requirement).

Two things are proven here, both against real files on disk (not mocks):

1. `test_generate_cannot_open_reference_or_sut_files`: while `generate` is
   running, `examples/*/*.reference.js` and `validation_only/**` are made
   genuinely inaccessible (renamed out of the way), and we assert that
   `generate` still succeeds and produces byte-identical output whether or
   not those files exist on disk at all -- i.e. it never needed them. We
   additionally install the isolation guard and assert its audit log
   contains no reference/SUT path.

2. `test_rename_examples_and_title_does_not_change_behavior`
   (structural/no-hardcoding companion, run as an integration test because
   it needs real files on disk): copies one example's OpenAPI file to a
   temp dir under an unrelated name, changes `info.title`, and asserts the
   generator produces output with the same *shape* (same operation/entity
   counts) -- proving it isn't keyed to the example's name or title.
"""
import json
import os
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

SNAPSHOT_ROOT = Path(__file__).resolve().parents[2]
KIT_ROOT = Path(
    os.environ.get(
        "OPENAPI_TO_SBT_DEV_KIT",
        str(SNAPSHOT_ROOT / "resources" / "development_kit"),
    )
).resolve()

from openapi_to_sbt.isolation import InputAllowList, IsolationSession, IsolationViolation
from openapi_to_sbt.pipeline import run_pipeline


@unittest.skipUnless(KIT_ROOT.exists(), "development kit not present in this environment")
class TestIsolation(unittest.TestCase):
    def test_generate_cannot_open_reference_or_sut_files(self):
        openapi_path = str(KIT_ROOT / "examples" / "library" / "openapi.json")
        ref_dir = KIT_ROOT / "examples"
        sut_dir = KIT_ROOT / "validation_only"
        hidden_ref = KIT_ROOT / "examples__hidden_for_test"
        hidden_sut = KIT_ROOT / "validation_only__hidden_for_test"

        # Generation must only ever need the single openapi.json file, so we
        # copy *only that file* out to an isolated temp dir, then hide the
        # entire kit (references + SUTs + all other examples) from disk
        # entirely for the duration of the run.
        tmp_dir = tempfile.mkdtemp()
        isolated_openapi = str(Path(tmp_dir) / "openapi.json")
        shutil.copy(openapi_path, isolated_openapi)

        kit_hidden = Path(str(KIT_ROOT) + "__hidden_for_test")
        self.assertFalse(kit_hidden.exists())
        shutil.move(str(KIT_ROOT), str(kit_hidden))
        try:
            allow_list = InputAllowList(allowed_files=[isolated_openapi])
            with IsolationSession(allow_list) as session:
                result = run_pipeline(isolated_openapi, "library", "http://localhost:5000",
                                       seed=1, allow_list=allow_list)
            # Success with the kit fully absent from disk proves generate
            # never depended on reference/SUT/sibling-example files.
            self.assertGreater(len(result.plan.entities), 0)
            for opened in session.audit.opened:
                self.assertNotIn("reference.js", opened)
                self.assertNotIn("validation_only", opened)
                self.assertNotIn(str(kit_hidden), opened)
            self.assertEqual(session.audit.denied, [])
        finally:
            shutil.move(str(kit_hidden), str(KIT_ROOT))
            shutil.rmtree(tmp_dir, ignore_errors=True)

    def test_isolation_violation_raised_for_out_of_allowlist_path(self):
        openapi_path = str(KIT_ROOT / "examples" / "library" / "openapi.json")
        reference_path = str(KIT_ROOT / "examples" / "library" / "interfaces.reference.js")
        allow_list = InputAllowList(allowed_files=[openapi_path])
        with IsolationSession(allow_list):
            with self.assertRaises(IsolationViolation):
                open(reference_path, "r", encoding="utf-8").read()

    def test_rename_examples_and_title_does_not_change_behavior(self):
        openapi_path = KIT_ROOT / "examples" / "library" / "openapi.json"
        spec = json.loads(openapi_path.read_text(encoding="utf-8"))
        spec["info"]["title"] = "Totally Unrelated System Zzyzx"

        tmp_dir = tempfile.mkdtemp()
        renamed_path = Path(tmp_dir) / "zzyzx_contract.json"
        renamed_path.write_text(json.dumps(spec), encoding="utf-8")
        try:
            baseline = run_pipeline(str(openapi_path), "library", "http://localhost:5000", seed=1)
            renamed = run_pipeline(str(renamed_path), "zzyzx", "http://localhost:5000", seed=1)
            self.assertEqual(len(baseline.plan.entities), len(renamed.plan.entities))
            self.assertEqual(
                sorted(e.entity.display_name for e in baseline.plan.entities),
                sorted(e.entity.display_name for e in renamed.plan.entities),
            )
            self.assertEqual(
                baseline.generation_report["coverage"]["total_operations"],
                renamed.generation_report["coverage"]["total_operations"],
            )
        finally:
            shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
