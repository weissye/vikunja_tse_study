import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from diagnose_mealie_mealplan import diagnose


class TestMealPlanDiagnostic(unittest.TestCase):
    def test_extracts_validation_without_leaking_values(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "http-trace.jsonl"
            row = {"method": "POST", "model_path": "/api/households/mealplans", "status": 422,
                   "trace_sequence": 20, "request": {"date": "2025-03-14", "recipeId": "SECRET", "title": "PRIVATE"},
                   "response": {"detail": [{"loc": ["body", "recipe_id"], "type": "missing",
                                            "msg": "Field required", "input": "SECRET"}]}}
            path.write_text(json.dumps(row) + "\n", encoding="utf-8")
            output = json.dumps(diagnose(path))
            self.assertNotIn("SECRET", output)
            self.assertNotIn("PRIVATE", output)
            self.assertIn("recipe_id", output)
            self.assertIn("field-required", output)

    def test_refuses_frozen_trace(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "http-trace.jsonl"
            path.write_text(json.dumps({"method": "POST", "model_path": "/api/households/mealplans",
                                        "status": 422}) + "\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "local run trace"):
                diagnose(path)


if __name__ == "__main__":
    unittest.main()
