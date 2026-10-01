#!/usr/bin/env python3
import importlib.util,json,subprocess,sys,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
def module(name,path):
    s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
v=module('conflict_validator',ROOT/'scripts'/'validate_conflict_verifiers.py')
rv=module('resource_validator',ROOT/'scripts'/'validate_resource_verifiers.py')
av=module('action_validator',ROOT/'scripts'/'validate_action_verifiers.py')
pv=module('phase_validator',ROOT/'scripts'/'evaluate_vikunja_multi_resource.py')
def e(method,path,status,request=None,response=None):
    x={'method':method,'model_path':path,'status':status}
    if request is not None:x['request']=request
    if response is not None:x['response']=response
    return x
class Increment6Tests(unittest.TestCase):
    def manifest(self,n=2):return {'prefix':'conflict6_','oracles':[{'oracle_id':'task-last-successful-write-visible','expected_witness_count':n}]}
    def test_interleaved_latest_successful_write_passes(self):
        rows=[e('PUT','/tasks/7',200,{'title':'conflict6_task_0_A'}),e('PUT','/tasks/7',200,{'title':'conflict6_task_0_B'}),e('GET','/tasks/7',200,response={'title':'conflict6_task_0_B'}),e('GET','/tasks/7',200,response={'title':'conflict6_task_0_B'})]
        r=v.evaluate(rows,self.manifest());self.assertEqual('PASS',r['run_status']);self.assertEqual(2,r['witness_count'])
    def test_stale_read_is_semantic_anomaly(self):
        rows=[e('PUT','/tasks/7',200,{'title':'conflict6_task_0_A'}),e('PUT','/tasks/7',200,{'title':'conflict6_task_0_B'}),e('GET','/tasks/7',200,response={'title':'conflict6_task_0_A'})]
        r=v.evaluate(rows,self.manifest());self.assertEqual('SEMANTIC_ANOMALY',r['run_status']);self.assertTrue(r['bug_candidate'])
    def test_positive_validators_ignore_conflict_writes(self):
        rmanifest={'oracles':[{'oracle_id':f'{resource}-{phase}','trigger':{'success_statuses':[200,201,204]},'observation':{'success_statuses':[200],'absence_statuses':[403,404]},'assertions':[{'type':'written_fields_persist','fields':['title','done']}]} for resource in ('task','project','label') for phase in ('create-visibility','update-persistence','delete-absence')]}
        rr=rv.evaluate([e('PUT','/tasks/7',200,{'title':'conflict6_task_0_A'}),e('GET','/tasks/7',200,response={'title':'conflict6_task_0_A'})],rmanifest,{'task':0,'project':0,'label':0})
        self.assertEqual([],rr['witnesses'])
        amanifest={'oracles':[{'oracle_id':x} for x in ('label-attachment-visible','label-detachment-absent','comment-create-visible','comment-update-persistence','comment-delete-absence','relation-create-visible','relation-delete-absence')]}
        ar=av.evaluate([e('PUT','/tasks/7/comments/2',200,{'comment':'conflict6_comment_0_A'}),e('GET','/tasks/7/comments/2',200,response={'comment':'conflict6_comment_0_A'})],amanifest,{'labels':0,'comments':0,'relations':0})
        self.assertEqual([],ar['witnesses'])
        self.assertTrue(pv.is_increment6_conflict_write(e('PUT','/tasks/7',200,{'title':'conflict6_task_0_A'})))
        self.assertTrue(pv.is_increment6_conflict_write(e('PUT','/tasks/7/comments/2',200,{'comment':'conflict6_comment_0_A'})))
        self.assertFalse(pv.is_increment6_conflict_write(e('PUT','/tasks/7',200,{'title':'baseline'})))
    def test_generated_story_contract_and_syntax(self):
        openapi=ROOT/'phase7'/'vikunja-multi-resource-openapi.json'
        if not openapi.exists():openapi=Path(__file__).resolve().parents[3]/'work'/'increment5e'/'model'/'vikunja-multi-resource-openapi.json'
        with tempfile.TemporaryDirectory() as d:
            story=Path(d)/'conflict.vikunja.js';manifest=Path(d)/'manifest.json'
            subprocess.run([sys.executable,str(ROOT/'scripts'/'generate_conflict_bp_stories.py'),'--openapi',str(openapi),'--output',str(story),'--manifest',str(manifest),'--tasks','6'],check=True)
            data=json.loads(manifest.read_text());text=story.read_text()
            self.assertEqual(28,data['expected']['conflict_writes']);self.assertEqual(4,len(data['oracles']))
            self.assertIn('Milestone:AllConflictVerifiersClosed',text);self.assertIn('block:EventSet("conflict6:block-base"',text)
            if subprocess.run(['node','--version'],capture_output=True).returncode==0:subprocess.run(['node','--check',str(story)],check=True)
if __name__=='__main__':unittest.main()
