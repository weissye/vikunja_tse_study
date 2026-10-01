import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / 'tests' / 'fixtures'


class ReadbackBindingTests(unittest.TestCase):
    def test_create_id_bound_from_exact_list_readback(self):
        spec = importlib.util.spec_from_file_location('binding', ROOT / 'scripts' / 'prepare_runtime_bound_sample.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        plan = json.loads((FIXTURES / 'runtime_sample_plan.json').read_text())
        controls = json.loads((FIXTURES / 'runtime_sample_controls.json').read_text())
        script, _ = module.render(plan, controls, prefix_rounds=8, instances=3)
        create = script.index('sbtService.post("/admin/realms/@{sbt_realm_1}/users"')
        lookup = script.index('sbtService.get("/admin/realms/@{sbt_realm_1}/users?username=sbt-user-')
        by_id = script.index('sbtService.get("/admin/realms/@{sbt_realm_1}/users/@{sbt_user_id_1}"')
        self.assertLess(create, lookup)
        self.assertLess(lookup, by_id)
        self.assertIn('count!==1', script)
        self.assertIn('match.id', script)
        self.assertIn('user lookup JSON parse failed', script)
        self.assertIn('user lookup runtime binding failed', script)
        self.assertIn('read user JSON parse failed', script)
        self.assertIn('prefix JSON parse failed', script)
        self.assertNotIn('JSON.parse(r.body).id', script)
        self.assertNotIn('pvg.rtv.set("sbt_baseline_1",r.body)', script)
        self.assertNotIn('missing Location ID', script)
        self.assertNotIn('r.headers', script)
        self.assertIn('actual_overlap:"NOT_MEASURED_IN_SAMPLE"', script)
        if shutil.which('node'):
            check = subprocess.run(['node', '--check', '-'], input=script, text=True, capture_output=True)
            self.assertEqual(check.returncode, 0, check.stderr)
            helper_start = script.index('function sbtBodyObject(')
            helper_end = script.index('bthread("choose-generated-oracle"')
            helpers = script[helper_start:helper_end]
            probe = helpers + '''
const assert=require('node:assert/strict');
for(const body of ['{"id":"abc","firstName":"A"}',{id:'abc',firstName:'A'}]){
  assert.equal(sbtBodyObject({body}).id,'abc');
  assert.equal(JSON.parse(sbtBodyText({body})).id,'abc');
}
assert.throws(()=>sbtBodyObject({body:'invalid'}));
console.log('BODY_FORMATS_OK');
'''
            result = subprocess.run(['node', '-'], input=probe, text=True, capture_output=True)
            self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == '__main__':
    unittest.main()
