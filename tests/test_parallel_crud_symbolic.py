"""Regression for the sample that stopped after a single Realm POST."""
from pathlib import Path
import re
import unittest

from openapi_to_sbt.pipeline import run_pipeline


SOURCE = Path(__file__).resolve().parents[1] / 'reference/keycloak-stage2-openapi.json'


class SymbolicCrudTest(unittest.TestCase):
    def test_crud_stages_do_not_branch_on_runtime_http_during_sampling(self):
        result = run_pipeline(str(SOURCE), 'keycloak_stage2', 'http://127.0.0.1:9938',
                              20261902, instances_per_entity=1,
                              story_profile='parallel-crud', logical_processes=1,
                              auth_token_env='KC_STAGE2_ACCESS_TOKEN')
        story = result.stories_js
        self.assertEqual(25, len(re.findall(r'bthread\("crud:P1:', story)))
        self.assertEqual(25, story.count('verified("create")'))
        self.assertEqual(25, story.count('finish("complete")'))
        self.assertNotIn('if (!created', story)
        self.assertNotIn('if (!bound', story)
        self.assertIn('pvg.rtv.set("sbt_', story)
        self.assertIn('@{sbt_', story)
        callbacks = re.findall(r'callback:function\(response\) \{(.*?)pvg.success\(', story, re.S)
        self.assertTrue(callbacks)
        self.assertTrue(all('__args' not in callback and 'step.data' not in callback
                            for callback in callbacks))
        self.assertIn('SBT:BindParent', story)
        self.assertIn('expectedResponseCodes:[404]', story)


if __name__ == '__main__':
    unittest.main()
