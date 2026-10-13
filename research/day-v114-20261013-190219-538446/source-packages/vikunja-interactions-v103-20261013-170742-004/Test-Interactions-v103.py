import json,sys,tempfile,subprocess,hashlib,copy
from pathlib import Path
root=Path(__file__).resolve().parent;sys.path.insert(0,str(root/'source'))
from generic_emitter import emit
with tempfile.TemporaryDirectory() as temp:
 out=Path(temp)/'on';subprocess.run([sys.executable,str(root/'Build-Model-v103.py'),'--output',str(out)],check=True)
 p=out/'project';cat=json.loads((p/'interaction-catalog.json').read_text());assert cat['candidate_count']==117 and len(cat['selected'])==6
 assert {x['profile'] for x in cat['selected']}=={'shared_read_same_field','shared_read_disjoint_fields','free_stale_disjoint_fields'}
 for g in cat['selected']:
  assert g['shared_physical_resource'] and set(g['session_fields'])=={'A','B'}
  a,b=g['session_fields']['A']['field'],g['session_fields']['B']['field']
  assert (a==b)==(g['profile']=='shared_read_same_field')
  assert g['provenance'] and g['oracle_authority']=='OBSERVATION_ONLY'
 for f in (p/'spec/js').glob('*.js'):subprocess.run(['node','--check',str(f)],check=True)
 subprocess.run(['node',str(root/'Test-Interaction-Protocol-v103.js'),str(root/'source/interaction_stories.js')],check=True)
 cfg=json.loads((out/'research-config.json').read_text());cfg.pop('interactions');cfgpath=Path(temp)/'off.json';cfgpath.write_text(json.dumps(cfg));emit(out/'contract-ir.json',cfgpath,Path(temp)/'off')
 for f in (Path(temp)/'off/spec/js').glob('*.js'):
  baseline=root/'reference-v100/spec/js'/f.name
  assert f.read_bytes()==baseline.read_bytes(),f.name
 print('V103_STATIC_INTERACTION_TEST_PASS: six groups / twelve workers / no-interaction v100 byte identity 3/3')
