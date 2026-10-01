import pathlib
import unittest

from openapi_to_sbt.pipeline import run_pipeline


class TestInterleavedRelationalProfile(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        repository = pathlib.Path(__file__).resolve().parents[3]
        contract = repository / "phase3b" / "vikunja-relations-openapi.json"
        cls.result = run_pipeline(
            str(contract), "vikunja", "http://127.0.0.1:3457",
            seed=20261301, instances_per_entity=8,
            story_profile="interleaved-relational-lifecycle",
        )
        cls.stories = cls.result.stories_js

    def test_profile_is_multiple_independent_bthreads(self):
        self.assertEqual(self.stories.count('bthread("crud:child:'), 8)
        self.assertEqual(self.stories.count('bthread("relation:edge:'), 7)
        self.assertGreaterEqual(self.stories.count("bthread("), 23)
        self.assertNotIn('bthread("validated-relation-lifecycle:contract-derived"', self.stories)

    def test_waitfor_carries_runtime_dependencies(self):
        self.assertIn('waitFor: __named("State:ParentReady")', self.stories)
        self.assertIn('__dependencies.source = __named("State:TaskReady:0")', self.stories)
        self.assertIn('__dependencies.target = __named("State:TaskReady:1")', self.stories)
        self.assertIn('waitFor: Object.values(__dependencies)', self.stories)
        self.assertIn('__dependencies.previous = __named("State:RelationObserved:0")', self.stories)

    def test_block_encodes_cleanup_constraints(self):
        self.assertIn('block: __intentPrefix("Intent:DeleteTask:")', self.stories)
        self.assertIn('block: __named("Intent:DeleteParent")', self.stories)
        self.assertIn('waitFor: __named("Milestone:UpdatesObserved")', self.stories)
        self.assertIn('waitFor: __named("Milestone:AllTasksDeleted")', self.stories)

    def test_openapi_enum_drives_relation_stories(self):
        self.assertIn('kind: "subtask"', self.stories)
        self.assertIn('kind: "parenttask"', self.stories)
        self.assertIn('kind: "related"', self.stories)
        self.assertIn('Intent:CreateRelation:6', self.stories)

    def test_http_calls_follow_selected_semantic_intents(self):
        create_intent = self.stories.index('request: Event("Intent:CreateTask:0")')
        create_http = self.stories.index('tasksCreate(', create_intent)
        relation_intent = self.stories.index('request: Event("Intent:CreateRelation:0"')
        relation_http = self.stories.index('tasksRelationsCreate(', relation_intent)
        self.assertLess(create_intent, create_http)
        self.assertLess(relation_intent, relation_http)


if __name__ == "__main__":
    unittest.main()
