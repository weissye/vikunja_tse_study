import sys,tempfile,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parent;sys.path.insert(0,str(root/'source'))
from effect_footprints import derive_footprints
entities=[{'name':'Root','dependencies':[]},{'name':'Book','dependencies':[{'target':'Root'}]},{'name':'Reader','dependencies':[]},{'name':'Loan','dependencies':[{'target':'Book'},{'target':'Reader'}]}]
plans={'Root':[{'id':'root','bindings':{}}],'Book':[{'id':'book','bindings':{'Root':'root'}}],'Reader':[{'id':'reader','bindings':{}}],'Loan':[{'id':'loan','bindings':{'Reader':'reader','Book':'book'}}]}
r=derive_footprints(entities,plans);assert set(r['instances']['loan'])=={'loan','reader','book','root'}
plans['Loan'][0]['bindings']['Reader']='book'
try:derive_footprints(entities,plans)
except ValueError:pass
else:raise AssertionError('Wrong parent type must be rejected')
with tempfile.TemporaryDirectory() as tmp:
 out=Path(tmp)/'generated';subprocess.run([sys.executable,str(root/'Build-Model-v100.py'),'--output',str(out)],check=True)
 p=out/'project';g=json.loads((p/'GENERATION_v071.json').read_text());f=json.loads((p/'effect-footprints.json').read_text())
 assert len(f['instances'])==24 and g['negative_checks']==8 and len(g['shared_session_workflows'])==48
 assert set(f['instances']['ModelsTaskComment_1'])=={'ModelsTaskComment_1','ModelsTask_1','ModelsProject_1'}
 subprocess.run(['node',str(root/'Test-Effect-Gate-v100.js'),str(p/'spec/js/stories.vikunja.js')],check=True)
 for file in (p/'spec/js').glob('*.js'):subprocess.run(['node','--check',str(file)],check=True)
print('V100_IR_FOOTPRINT_AND_ACTUAL_GATE_TEST_PASS; native/live acceptance pending')
