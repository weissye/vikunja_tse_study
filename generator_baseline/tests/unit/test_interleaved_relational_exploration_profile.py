import pathlib
import unittest

from openapi_to_sbt.pipeline import run_pipeline


class TestInterleavedRelationalExplorationProfile(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        repository = pathlib.Path(__file__).resolve().parents[3]
        contract = repository / "phase3b" / "vikunja-relations-openapi.json"
        cls.result = run_pipeline(
            str(contract), "vikunja", "http://127.0.0.1:3457",
            seed=20261501, instances_per_entity=12,
            story_profile="interleaved-relational-exploration",
        )
        cls.stories = cls.result.stories_js

    def test_five_explicit_bp_choice_coordinators(self):
        self.assertEqual(self.stories.count('bthread("exploration:'), 5)
        self.assertEqual(self.stories.count('request: Object.values(__remaining)'), 5)
        for name in (
            "choose-task-create-order", "choose-relation-create-order",
            "choose-relation-delete-order", "choose-task-update-order",
            "choose-task-delete-order",
        ):
            self.assertIn(f'bthread("exploration:{name}"', self.stories)

    def test_permits_gate_http_intents(self):
        pairs = (
            ("Permit:CreateTask:0", "Intent:CreateTask:0"),
            ("Permit:CreateRelation:0", "Intent:CreateRelation:0"),
            ("Permit:DeleteRelation:0", "Intent:DeleteRelation:0"),
            ("Permit:UpdateTask:0", "Intent:UpdateTask:0"),
            ("Permit:DeleteTask:0", "Intent:DeleteTask:0"),
        )
        for permit, intent in pairs:
            self.assertLess(self.stories.index(f'waitFor: __named("{permit}")'),
                            self.stories.index(intent))

    def test_waitfor_and_block_remain_model_invariants(self):
        self.assertIn('block: __intentPrefix("Intent:DeleteTask:")', self.stories)
        self.assertIn('block: __named("Intent:DeleteParent")', self.stories)
        self.assertIn('waitFor: Object.values(__dependencies)', self.stories)
        self.assertIn('Milestone:AllTasksReady', self.stories)

    def test_scale_is_openapi_generated_not_handwritten_http(self):
        self.assertEqual(self.stories.count('bthread("crud:child:'), 12)
        self.assertEqual(self.stories.count('bthread("relation:edge:'), 11)
        self.assertIn('InterleavedRelationalExplorationComplete', self.stories)


if __name__ == "__main__":
    unittest.main()
