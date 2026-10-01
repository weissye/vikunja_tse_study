import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "merge_keycloak_sample_batches.py"
spec = importlib.util.spec_from_file_location("sample_merge", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class MergeTests(unittest.TestCase):
    def test_six_batch_arrays_become_one_300_scenario_array(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            model, manifest = root / "model.js", root / "manifest.json"
            model.write_text("// test model\n")
            manifest.write_text("{}")
            sources = []
            for index in range(6):
                path = root / f"batch-{index}.zip"
                with zipfile.ZipFile(path, "w") as archive:
                    archive.writestr("samples-50.json", json.dumps([[index, x] for x in range(50)]))
                    archive.writestr("audit-50.json", json.dumps({
                        "scenarios": 50, "complete_rest_schedules": 50,
                        "families": {"same-field": 50}, "instances": {str(index): 50},
                        "missing": {}, "prefix_rounds_requested": 8,
                        "http_executed": False, "actual_overlap": "NOT_MEASURED",
                    }))
                sources.append(path)
            output = root / "combined.zip"
            summary = module.merge(sources, output, model, manifest)
            self.assertEqual(summary["scenarios"], 300)
            with zipfile.ZipFile(output) as archive:
                paths = json.loads(archive.read("samples-300.json"))
                self.assertEqual(len(paths), 300)
                self.assertEqual(paths[0], [0, 0])
                self.assertEqual(paths[-1], [5, 49])
                self.assertEqual(json.loads(archive.read("aggregate-audit.json"))["families"],
                                 {"same-field": 300})


if __name__ == "__main__":
    unittest.main()
