import re
import sys
import unittest
from pathlib import Path

# Support both unittest discovery and direct execution from the study root.
GENERATOR_ROOT = Path(__file__).resolve().parents[2]
if str(GENERATOR_ROOT) not in sys.path:
    sys.path.insert(0, str(GENERATOR_ROOT))

from openapi_to_sbt.pipeline import run_pipeline


ROOT = Path(__file__).resolve().parents[3]
SPEC = ROOT / "phase7" / "vikunja-multi-resource-openapi.json"


class V0253InputPolicyCompatibilityTests(unittest.TestCase):
    def test_profiles_remain_supported(self):
        for profile in ("minimal-smoke", "validated-lifecycle",
                        "interleaved-relational-exploration",
                        "multi-resource-interleaving"):
            result = run_pipeline(str(SPEC), "vikunja", "http://127.0.0.1:3457",
                                  seed=1, story_profile=profile)
            self.assertTrue(result.stories_js.strip(), profile)

    def test_full_profile_omits_unbound_optional_identity(self):
        result = run_pipeline(str(SPEC), "vikunja", "http://127.0.0.1:3457",
                              seed=20262251, story_profile="full")
        story = re.search(r'bthread\("crud:PaginatedProjects:1".*?\n\}\);',
                          result.stories_js, re.DOTALL)
        self.assertIsNotNone(story)
        self.assertIn("let parentProjectId = undefined;", story.group(0))
        self.assertIn("let owner = undefined;", story.group(0))
        self.assertIn("let subscription = undefined;", story.group(0))

    def test_nested_task_create_uses_bound_project_identity(self):
        result = run_pipeline(str(SPEC), "vikunja", "http://127.0.0.1:3457",
                              seed=20262251, story_profile="full")
        story = re.search(r'bthread\("crud:TaskReadOneBodies:1".*?\n\}\);',
                          result.stories_js, re.DOTALL)
        self.assertIsNotNone(story)
        self.assertIn('let task = undefined;', story.group(0))
        self.assertIn('let project = captured["project"]', story.group(0))
        self.assertIn('let projectId = undefined;', story.group(0))
        self.assertIn('tasksRead(__justCreated["ifMatch"]', story.group(0))

    def test_bound_task_actions_remain_generated(self):
        result = run_pipeline(str(SPEC), "vikunja", "http://127.0.0.1:3457",
                              seed=20262251, story_profile="full")
        self.assertIn('action:taskCommentsCreate', result.stories_js)


if __name__ == "__main__":
    unittest.main()
