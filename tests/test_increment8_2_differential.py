import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "compare_vikunja_increment8_2_backends.py"
spec = importlib.util.spec_from_file_location("inc82_compare", SCRIPT)
compare = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = compare
assert spec.loader is not None
spec.loader.exec_module(compare)


SQLITE = {"PASS": 0, "LOST_UPDATE": 4, "SERVER_FAILURE": 16, "CONTRACT_REJECTION": 0, "INCONCLUSIVE": 0}


class DifferentialTests(unittest.TestCase):
    def test_all_postgres_pass(self):
        pg = {"PASS": 20, "LOST_UPDATE": 0, "SERVER_FAILURE": 0, "CONTRACT_REJECTION": 0, "INCONCLUSIVE": 0}
        self.assertEqual("DEFECTS_NOT_REPRODUCED_ON_POSTGRES", compare.classify(SQLITE, pg, 20))

    def test_lost_update_cross_backend(self):
        pg = {"PASS": 18, "LOST_UPDATE": 2, "SERVER_FAILURE": 0, "CONTRACT_REJECTION": 0, "INCONCLUSIVE": 0}
        self.assertEqual("SQLITE_LOCK_FAILURE_NOT_REPRODUCED_BUT_LOST_UPDATE_IS_CROSS_BACKEND", compare.classify(SQLITE, pg, 20))

    def test_both_families_cross_backend(self):
        pg = {"PASS": 10, "LOST_UPDATE": 2, "SERVER_FAILURE": 8, "CONTRACT_REJECTION": 0, "INCONCLUSIVE": 0}
        self.assertEqual("BOTH_DEFECT_FAMILIES_REPRODUCED_ON_POSTGRES", compare.classify(SQLITE, pg, 20))

    def test_inconclusive(self):
        pg = {"PASS": 19, "LOST_UPDATE": 0, "SERVER_FAILURE": 0, "CONTRACT_REJECTION": 0, "INCONCLUSIVE": 1}
        self.assertEqual("INCONCLUSIVE", compare.classify(SQLITE, pg, 20))

    def test_complete_comparison(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            sqlite_path = root / "sqlite.json"
            postgres_path = root / "postgres.json"
            sqlite_path.write_text(json.dumps({"trial_count": 20, "counts": SQLITE}), encoding="utf-8")
            pg = {"PASS": 20, "LOST_UPDATE": 0, "SERVER_FAILURE": 0, "CONTRACT_REJECTION": 0, "INCONCLUSIVE": 0}
            postgres_path.write_text(json.dumps({"trial_count": 20, "counts": pg}), encoding="utf-8")
            result = compare.build_comparison(sqlite_path, postgres_path)
            self.assertEqual("database backend", result["controlled_variable"])
            self.assertEqual("DEFECTS_NOT_REPRODUCED_ON_POSTGRES", result["comparison_status"])


if __name__ == "__main__":
    unittest.main()
