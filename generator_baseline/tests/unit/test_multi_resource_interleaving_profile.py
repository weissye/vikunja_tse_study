import pathlib
import unittest
from openapi_to_sbt.pipeline import run_pipeline

class TestMultiResourceInterleavingProfile(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root=pathlib.Path(__file__).resolve().parents[3]
        cls.result=run_pipeline(str(root/"phase7"/"vikunja-multi-resource-openapi.json"),"vikunja","http://127.0.0.1:3457",seed=20261700,instances_per_entity=6,story_profile="multi-resource-interleaving")
        cls.stories=cls.result.stories_js
    def test_independent_resource_stories(self):
        self.assertEqual(self.stories.count('bthread("crud:task:'),6)
        self.assertEqual(self.stories.count('bthread("crud:label:'),3)
        self.assertEqual(self.stories.count('bthread("subresource:comment:'),4)
        self.assertEqual(self.stories.count('bthread("relation:edge:'),5)
    def test_bp_coordination_is_explicit(self):
        self.assertGreaterEqual(self.stories.count("waitFor"),60)
        self.assertIn('block:__mrPrefix("Intent:DeleteTask:")',self.stories)
        self.assertIn('block:__mrNamed("Intent:DeleteProject")',self.stories)
        self.assertIn('request: Object.values(remaining)',self.stories)
    def test_operations_come_from_generated_interfaces(self):
        for call in ("projectsCreate(","tasksCreate(","labelsCreate(","taskCommentsCreate(","taskLabelsCreate(","tasksRelationsCreate("):
            self.assertIn(call,self.stories)
    def test_completion_requires_all_cleanup(self):
        self.assertIn("MultiResourceInterleavingComplete",self.stories)
        self.assertIn("Milestone:LabelsDeleted",self.stories)
        self.assertIn("Milestone:TasksDeleted",self.stories)
    def test_mutation_barrier_prevents_missed_events(self):
        self.assertIn('bthread("coordinator:aux-ready-for-mutation"',self.stories)
        self.assertEqual(self.stories.count('waitFor:__mrNamed("Milestone:AuxReadyForMutation")'),12)
        self.assertIn("State:LabelAttached:2",self.stories)
        self.assertIn("State:CommentUpdated:3",self.stories)
        self.assertIn("State:RelationObserved:4",self.stories)

if __name__=="__main__": unittest.main()
