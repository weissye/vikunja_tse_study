import json
from pathlib import Path
import tempfile
import unittest

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from merge_keycloak_selected import merge


class MergeSelectedTest(unittest.TestCase):
    def test_preserves_order_and_scenario_payload(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            inputs = []
            expected = []
            for n in range(6):
                scenarios = [[{"name": "SBT:ScheduleChosen", "data": {"instance": n, "i": i}},
                              {"name": "REST", "data": {"callback": "x" * 37}}]
                             for i in range(5)]
                src = root / f"selected-{n + 1}.json"
                src.write_text(json.dumps(scenarios), encoding="utf-8")
                inputs.append(src)
                expected.extend(scenarios)
            output = root / "intermediate-30.json"
            manifest = merge(inputs, output)
            self.assertEqual(json.loads(output.read_text()), expected)
            self.assertEqual(json.loads(manifest.read_text())["intermediate_candidates"], 30)

    def test_rejects_incomplete_selection_before_output(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            inputs = []
            for n in range(6):
                src = root / f"selected-{n}.json"
                src.write_text(json.dumps([[{"name": str(i)}] for i in range(4 if n == 2 else 5)]))
                inputs.append(src)
            output = root / "intermediate-30.json"
            with self.assertRaises(ValueError):
                merge(inputs, output)
            self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()
