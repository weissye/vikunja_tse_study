"""Regression for contiguous verified prefix windows and old epoch tags."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "generator_baseline"))
from openapi_to_sbt.evaluate_verifiers import _verified_prefix


class PrefixWindows(unittest.TestCase):
    @staticmethod
    def reads(rounds):
        return [dict(method="GET", model_path="/items/1", status=200,
                     prefix_phase="verified-round", prefix_story="story-a",
                     prefix_round=str(number),
                     upstream_completed_utc=f"2026-01-01T00:00:{number:02d}Z")
                for number in rounds]

    @staticmethod
    def epoch(start, end):
        return [dict(prefix_story="story-a", prefix_start_round=str(start),
                     prefix_round=str(end), upstream_started_utc="2026-01-01T00:00:20Z")
                for _ in (1, 2)]

    def test_later_contiguous_window(self):
        ok, reason, evidence = _verified_prefix(self.reads(range(3, 13)),
                                                 self.epoch(3, 12), "/items/1", 10)
        self.assertTrue(ok, reason)
        self.assertEqual((evidence["start_round"], evidence["end_round"],
                          evidence["rounds"]), (3, 12, 10))

    def test_missing_or_wrong_resource_rejected(self):
        self.assertFalse(_verified_prefix(self.reads([3, 4, 6, 7, 8, 9, 10, 11, 12]),
                                          self.epoch(3, 12), "/items/1", 10)[0])
        self.assertFalse(_verified_prefix(self.reads(range(3, 13)),
                                          self.epoch(3, 12), "/items/2", 10)[0])

    def test_mismatch_and_late_read_rejected(self):
        mixed = self.epoch(3, 12)
        mixed[1]["prefix_start_round"] = "2"
        self.assertFalse(_verified_prefix(self.reads(range(3, 13)), mixed,
                                          "/items/1", 10)[0])
        late = self.reads(range(3, 13))
        late[-1]["upstream_completed_utc"] = "2026-01-01T00:00:21Z"
        self.assertFalse(_verified_prefix(late, self.epoch(3, 12),
                                          "/items/1", 10)[0])

    def test_legacy_window_starts_at_one(self):
        old = self.epoch(1, 10)
        for operation in old:
            operation.pop("prefix_start_round")
        self.assertTrue(_verified_prefix(self.reads(range(1, 11)), old,
                                         "/items/1", 10)[0])
        self.assertFalse(_verified_prefix(self.reads(range(3, 13)), old,
                                          "/items/1", 10)[0])


if __name__ == "__main__":
    unittest.main()
