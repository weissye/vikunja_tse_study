#!/usr/bin/env python3
import importlib.util,json,subprocess,sys,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('validator',ROOT/'scripts'/'validate_negative_verifiers.py');v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
def e(method,path,status,response=None):
    x={'method':method,'model_path':path,'status':status}
    if response is not None:x['response']=response
    return x
class Increment5Tests(unittest.TestCase):
    def test_unknown_rejection_pass_violation_and_inconclusive(self):
        manifest={'oracles':[{'oracle_id':'unknown-project-rejected','expected_witness_count':1},{'oracle_id':'unknown-task-rejected','expected_witness_count':1},{'oracle_id':'unknown-label-rejected','expected_witness_count':1}]}
        rows=[e('GET','/projects/2147483001',404),e('GET','/tasks/2147483002',500)]
        result=v.evaluate(rows,manifest)
        self.assertEqual('PASS',result['oracle_summary']['unknown-project-rejected']['status'])
        self.assertEqual('VIOLATED',result['oracle_summary']['unknown-task-rejected']['status'])
        self.assertEqual('INCONCLUSIVE',result['oracle_summary']['unknown-label-rejected']['status'])
        self.assertTrue(result['bug_candidate'])
    def test_deleted_task_triple_passes(self):
        manifest={'oracles':[{'oracle_id':f'deleted-task-{op}-rejected','expected_witness_count':1} for op in ('read','update','delete')]}
        rows=[e('DELETE','/tasks/8',204),e('GET','/tasks/8',404),e('GET','/tasks/8',404),e('PUT','/tasks/8',404),e('DELETE','/tasks/8',404)]
        result=v.evaluate(rows,manifest);self.assertEqual('PASS',result['run_status']);self.assertEqual(3,result['witness_count'])
    def test_deleted_relation_rejects_repeat_and_stays_absent(self):
        manifest={'oracles':[{'oracle_id':'deleted-relation-delete-rejected-and-absent','expected_witness_count':1}]}
        rows=[e('DELETE','/tasks/1/relations/related/2',204),e('GET','/tasks/1',200,{'related_tasks':{}}),e('DELETE','/tasks/1/relations/related/2',404),e('GET','/tasks/1',200,{'related_tasks':{}})]
        result=v.evaluate(rows,manifest);self.assertEqual('PASS',result['run_status'])
    def test_generated_story_is_openapi_grounded_and_balanced(self):
        openapi=ROOT/'phase7'/'vikunja-multi-resource-openapi.json'
        if not openapi.exists(): openapi=Path(__file__).resolve().parents[3]/'work'/'increment4e'/'model'/'vikunja-multi-resource-openapi.json'
        with tempfile.TemporaryDirectory() as d:
            story=Path(d)/'negative.vikunja.js';manifest=Path(d)/'manifest.json'
            subprocess.run([sys.executable,str(ROOT/'scripts'/'generate_negative_bp_stories.py'),'--openapi',str(openapi),'--output',str(story),'--manifest',str(manifest),'--tasks','6'],check=True)
            text=story.read_text();data=json.loads(manifest.read_text())
            self.assertEqual(23,data['expected']['negative_groups']);self.assertEqual(56,data['expected']['negative_http_witnesses']);self.assertEqual(17,len(data['oracles']))
            self.assertIn('Milestone:AllNegativeVerifiersClosed',text);self.assertIn('block:__negNamed("MultiResourceVerifiedActionsComplete")',text)
            if subprocess.run(['node','--version'],capture_output=True).returncode==0:subprocess.run(['node','--check',str(story)],check=True)
if __name__=='__main__':unittest.main()
