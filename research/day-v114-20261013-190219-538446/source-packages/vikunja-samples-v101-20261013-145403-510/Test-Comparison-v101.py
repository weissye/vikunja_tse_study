from pathlib import Path
import json,tempfile,zipfile,hashlib,subprocess
from analyze_samples_v101 import inspect_review,compare,workflow_value,digest
root=Path(__file__).resolve().parent;r=inspect_review(root/'baseline-review-v100.zip')
assert r['status']=='V100_SAMPLE_COMPLETED' and r['negative_checked']==8 and r['verified_recoveries']==8
assert r['supported_rule_count']==65 and r['supported_runtime_case_count']==390
assert len({x['abstract_state_sha256'] for x in r['state_observations']})==5
assert all(x['selected_event_log_entries_before_attempt'] is not None for x in r['state_observations'])
again=compare([r,r]);assert again['runs_in_order'][1]['new_checked_rules']==[] and again['runs_in_order'][1]['new_abstract_state_count']==0
with tempfile.TemporaryDirectory() as tmp:
 tmp=Path(tmp)
 with zipfile.ZipFile(root/'baseline-review-v100.zip') as z:files={name:z.read(name) for name in z.namelist()}
 ledger=json.loads(files['recovery-ledger.json'])
 def alter(value):
  if isinstance(value,list):return [alter(x) for x in value]
  if not isinstance(value,dict):return value
  return {key:999999 if key=='id' else '2099-01-01T00:00:00Z' if key in ('created','updated') else alter(item) for key,item in value.items()}
 for row in ledger:
  row['prefix_before']=alter(row['prefix_before']);row['prefix_before_sha256']=digest(row['prefix_before'])
 files['recovery-ledger.json']=json.dumps(ledger).encode()
 manifest=json.loads(files['manifest_v100.json'])
 for name in manifest:manifest[name]=hashlib.sha256(files[name]).hexdigest()
 files['manifest_v100.json']=json.dumps(manifest).encode();changed=tmp/'synthetic-id-time-change.zip'
 with zipfile.ZipFile(changed,'w',zipfile.ZIP_DEFLATED) as z:
  for name,data in files.items():z.writestr(name,data)
 other=inspect_review(changed)
 assert {x['abstract_state_sha256'] for x in other['state_observations']}=={x['abstract_state_sha256'] for x in r['state_observations']}
 assert other['state_observations'][0]['concrete_prefix_sha256']!=r['state_observations'][0]['concrete_prefix_sha256']
 # Generated-value provenance must match actual JavaScript formatter.
 namespace='example-run';sid='B';logical='ModelsLabel_1';field='hex_color'
 js='var WORKFLOW_NAMESPACE='+json.dumps(namespace)+';'+'''function f(sessionId,resourceId,spec){var input=WORKFLOW_NAMESPACE+"/"+sessionId+"/"+resourceId+"/"+spec.field,h=2166136261;for(var i=0;i<input.length;i++){h^=input.charCodeAt(i);h=(h+(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24))|0;}var hex=(h>>>0).toString(16);while(hex.length<8)hex="0"+hex;return hex.slice(0,6);}console.log(f("B","ModelsLabel_1",{field:"hex_color"}));'''
 actual=subprocess.check_output(['node','-e',js],text=True).strip();assert actual==workflow_value(namespace,sid,logical,field,{'maxLength':7},'hex_rgb')
print('V101_COMPARISON_PASS: 8 baseline rules / 5 abstract states; IDs/times alone add no novelty')
