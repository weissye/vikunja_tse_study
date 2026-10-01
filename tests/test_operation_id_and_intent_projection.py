import importlib.util
import json
from pathlib import Path
import sys
import unittest
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / 'scripts'
spec = importlib.util.spec_from_file_location('intent_projection', SCRIPTS / 'prepare_provengo_intent_sample.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class IntentProjection(unittest.TestCase):
    def test_concrete_eligible_oracles_and_rtv_only(self):
        plan_file = ROOT.parents[1] / 'work/keycloak_v02619_validation/campaign/verifiers/concurrency-plan.keycloak_stage2.json'
        synthetic = {'oracles':[{'runtime':{'ready':True},'oracle_id':'concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName',
                                 'operation_id':'put:/admin/realms/{realm}/users/{user-id}',
                                 'kind':'same-field-one-successful-value-visible',
                                 'path_template':'/admin/realms/{realm}/users/{user-id}'}]}
        model, oracles = module.render(json.loads(plan_file.read_text()) if plan_file.is_file() else synthetic)
        self.assertGreaterEqual(len(oracles), 1)
        self.assertIn('"@{sbt_realm_" + instance + "}"', model)
        self.assertIn('"@{sbt_user_id_" + instance + "}"', model)
        self.assertIn('SBT:PlanConcurrencyIntent', model)
        self.assertNotIn('new RESTSession', model)
        self.assertNotIn('response.code', model)
        self.assertNotIn('SBT:PrefixVerified', model)

    def test_operation_key_preserves_named_ids_and_falls_back(self):
        local = ROOT.parents[1] / 'work/keycloak_v02619_validation/generator_baseline'
        baseline = local if local.exists() else ROOT.parents[1] / 'generator_baseline'
        sys.path.insert(0, str(baseline))
        try:
            from openapi_to_sbt.render.stories_js import operation_key
            self.assertEqual(operation_key(SimpleNamespace(operation_id=None, method='PUT',path='/a/{id}')),
                             'put:/a/{id}')
            self.assertEqual(operation_key(SimpleNamespace(operation_id='custom', method='PUT',path='/a')),
                             'custom')
        finally:
            sys.path.pop(0)


if __name__ == '__main__': unittest.main()
