"""Regression for Keycloak's association payloads and verified realm fixture."""
from pathlib import Path
import re
import unittest

from openapi_to_sbt.pipeline import run_pipeline


SOURCE = Path(__file__).resolve().parents[1] / 'reference' / 'keycloak-stage2-openapi.json'


class OpaqueAssociationTest(unittest.TestCase):
    def test_two_parent_types_and_opaque_create_payloads(self):
        result = run_pipeline(str(SOURCE), 'keycloak_stage2', 'http://127.0.0.1:9938',
                              20261902, instances_per_entity=2,
                              story_profile='parallel-crud', logical_processes=2,
                              auth_token_env='KC_STAGE2_ACCESS_TOKEN')
        edges = {(e['source'], e['target']) for e in result.dependency_graph_report['edges']}
        prefix = 'admin/realms/{realm}/'
        self.assertIn((prefix + 'organizations/{org-id}/members', prefix + 'users'), edges)
        self.assertIn((prefix + 'organizations/{org-id}/identity-providers',
                       prefix + 'identity-provider/instances'), edges)
        self.assertEqual(39, len(edges))
        self.assertEqual(100, len(re.findall(r'bthread\("crud:P[12]:', result.stories_js)))
        self.assertIn('matchingParents()', result.stories_js)
        self.assertIn('enabled: true', result.stories_js)
        self.assertIn('__sbtOpaqueBody', result.interfaces_js)
        self.assertIn('KC_STAGE2_ACCESS_TOKEN', result.interfaces_js)


if __name__ == '__main__':
    unittest.main()
