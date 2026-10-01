import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from run_mealie_stage4 import gated_coverage_state, story_progress


class MealiePrerequisiteGateTests(unittest.TestCase):
    def test_realistic_failed_creation_is_not_counted_as_prefix_coverage(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'provengo-run.log'
            path.write_text('\n'.join([
                'Selected: [SBT:InstanceUnresolved {reason:"create-status-unobserved"}]',
                'Selected: [SBT:StorySkipped {reason:"create-status-unobserved"}]',
                'Selected: [SBT:StorySkipped {reason:"dependency-unavailable"}]',
                'Selected: [SBT:InstanceUnavailable:resource:1 {reason:"create-failed"}]',
                'Selected: [SBT:PrefixVerified {round:1}]',
            ]), encoding='utf-8')
            progress = story_progress(path)
            self.assertEqual(progress['story_skip_reasons'],
                             {'create-status-unobserved': 1, 'dependency-unavailable': 1})
            self.assertEqual(progress['story_event_counts']['InstanceUnresolved'], 1)
            self.assertEqual(gated_coverage_state({**progress, 'prefix_verified_epochs': 0,
                                                   'real_overlap_epochs': 0}), 'PREREQUISITE_BLOCKED')

    def test_verified_prefix_requires_overlap_and_a_real_oracle_verdict(self):
        sample = {'story_event_counts': {'PrefixVerified': 8}, 'prefix_verified_epochs': 1,
                  'real_overlap_epochs': 0, 'concurrency_evaluated': 0}
        self.assertEqual(gated_coverage_state(sample), 'NO_REAL_OVERLAP')
        sample['real_overlap_epochs'] = 1
        self.assertEqual(gated_coverage_state(sample), 'ORACLE_INCONCLUSIVE')
        sample['concurrency_evaluated'] = 1
        self.assertEqual(gated_coverage_state(sample), 'VERIFIED_PREFIX_AND_ORACLE_COVERAGE')


if __name__ == '__main__':
    unittest.main()
