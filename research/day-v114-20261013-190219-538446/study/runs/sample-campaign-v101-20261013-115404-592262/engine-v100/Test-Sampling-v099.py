import json,sys,tempfile,subprocess,copy
from pathlib import Path
root=Path(__file__).resolve().parent
sys.path.insert(0,str(root/'source'))
from generic_emitter import emit
with tempfile.TemporaryDirectory() as tmp:
 out=Path(tmp)/'one';subprocess.run([sys.executable,str(root/'Build-Model-v099.py'),'--output',str(out)],check=True)
 cfg=json.loads((out/'research-config.json').read_text());first=json.loads((out/'project/negative-selection.json').read_text());gen=json.loads((out/'project/GENERATION_v071.json').read_text())
 assert gen['negative_checks']==8 and sum(len(x) for x in gen['instance_bindings'].values())==24
 assert len(gen['shared_session_workflows'])==48 and len(first['selected'])==8 and first['candidate_count']==390
 def again(config,name):
  path=Path(tmp)/(name+'.json');path.write_text(json.dumps(config));emit(out/'contract-ir.json',path,Path(tmp)/name)
  return json.loads((Path(tmp)/name/'negative-selection.json').read_text())
 assert again(cfg,'two')['selected']==first['selected']
 second=copy.deepcopy(cfg);second['sampling']['seed']=2
 assert again(second,'three')['selected']!=first['selected']
 history=copy.deepcopy(cfg);history['sampling']['completed_case_ids']=[x['case_id'] for x in first['selected']]
 rotated=again(history,'four');assert not {x['case_id'] for x in rotated['selected']} & set(history['sampling']['completed_case_ids'])
 assert len({x['resource_type'] for x in first['selected']})==5
 assert len({x['session'] for x in first['selected']})==2
 for f in (out/'project/spec/js').glob('*.js'):subprocess.run(['node','--check',str(f)],check=True)
 subprocess.run(['node',str(root/'Test-Budget-v099.js'),str(out/'project/spec/js/stories.vikunja.js')],check=True)
print('V099_SAMPLING_AND_ADMISSION_TEST_PASS; frozen native acceptance pending')
