"""Regression: a successful album epoch cannot satisfy a different target."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from immich_coverage_gate import classify


class CoverageGateTest(unittest.TestCase):
    def test_repeated_album_does_not_count_as_new_relationship(self):
        plan = {'oracles': [
            {'oracle_id': 'album', 'operation_id': 'updateAlbumInfo', 'runtime': {'ready': True}},
            {'oracle_id': 'link', 'operation_id': 'updateSharedLink', 'runtime': {'ready': True}},
            {'oracle_id': 'unavailable', 'operation_id': 'uploadAsset', 'runtime': {'ready': False}}]}
        epochs = [{'scenario': 'album', 'overlap_observed': True},
                  {'scenario': 'link', 'overlap_observed': False}]
        report = classify(plan, epochs, excluded=['updateAlbumInfo'])
        self.assertFalse(report['new_target_overlap'])
        self.assertEqual(report['missing_operations'], ['updateSharedLink'])
        self.assertEqual(report['overlap_count'], 0)

    def test_only_observed_target_overlap_counts(self):
        plan = {'oracles': [
            {'oracle_id': 'link', 'operation_id': 'updateSharedLink', 'runtime': {'ready': True}}]}
        rows = [{'epoch_id': 'e1', 'scenario': 'link', 'overlap_observed': True}]
        self.assertFalse(classify(plan, rows, proxy_overlap_ids=set())['new_target_overlap'])
        report = classify(plan, rows, proxy_overlap_ids={'e1'})
        self.assertTrue(report['new_target_overlap'])
        self.assertEqual(report['overlaps_by_operation'], {'updateSharedLink': 1})


if __name__ == '__main__':
    unittest.main()
