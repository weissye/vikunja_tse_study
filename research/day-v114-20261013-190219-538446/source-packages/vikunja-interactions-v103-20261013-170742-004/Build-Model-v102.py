import sys,json,argparse
from pathlib import Path
ROOT=Path(__file__).resolve().parent;sys.path.insert(0,str(ROOT/'source'))
from input_pipeline import compile_ir
from generic_emitter import emit
from generator_v56.render.context_model import Contract
from generator_v56.parsing.swagger_context import normalize_context_contract
p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);p.add_argument('--proxy-url');p.add_argument('--config',type=Path,default=ROOT/'input-source/research-config-v102.json');a=p.parse_args()
if a.output.exists():raise SystemExit('Use a fresh output directory')
a.output.mkdir(parents=True)
plan=json.loads((ROOT/'input-source/scope-v102.json').read_text())
ir=compile_ir(ROOT/'input-source/contract.json',{'resources':plan['resources']},ROOT/'input-source/method_adapter.json',ROOT/'input-source'/plan['request_mappings'])
# Preserve proven creation fixture mappings; provenance remains explicitly external.
for e in ir['entities']:
 for f in plan.get('extra_fixture_fields',{}).get(e['name'],[]):
  ir['fixture_recipes'][e['name']].append({'field':f,'schema':e['create_schema']['properties'][f],'salt_template':'{seed}-'+e['name']+'-INSTANCE-'+f})
 if e['name'] in plan.get('fixture_fields_override',{}):
  ir['fixture_recipes'][e['name']]=[{'field':f,'schema':e['create_schema']['properties'][f],'salt_template':'{seed}-'+e['name']+'-INSTANCE-'+f} for f in plan['fixture_fields_override'][e['name']]]
# Discover the JSON username/password -> token operation from the FULL contract.
raw=json.loads((ROOT/'input-source/contract.json').read_text());doc,_=normalize_context_contract(raw);c=Contract(doc);auth=[]
for path,methods in doc['paths'].items():
 op=methods.get('post',{});schema=c.resolve(op.get('requestBody',{}).get('content',{}).get('application/json',{}).get('schema',{}))
 if {'username','password'}<=set(schema.get('properties',{})):
  for code,response in op.get('responses',{}).items():
   rs=c.resolve(response.get('content',{}).get('application/json',{}).get('schema',{}))
   if str(code).startswith('2') and 'token' in rs.get('properties',{}):auth.append({'path':path,'method':'POST','status':int(code),'token_field':'token','request_fields':['username','password'],'source':'#/paths/'+path.replace('/','~1')+'/post'})
if len(auth)!=1:raise ValueError('Authentication operation ambiguous or missing in contract')
ir['authentication']=auth[0];ir['sensitive_response_fields']=plan.get('sensitive_response_fields',{})
ir['acceptance_observations']=plan['relationship_checks']
from description_domains import annotate
ir=annotate(ir)
cfg=json.loads(a.config.read_text());cfg['model']['base_url']=a.proxy_url or cfg['model']['base_url']
# Every available rule is selected automatically. The generic renderer will record
# supported writable plain-string rules and block the others, with reasons.
cfg['recovery']['negative_rule_ids']=[x['id'] for x in ir['negative_catalog']['cases']]
for n,v in [('contract-ir.json',ir),('research-config.json',cfg)]: (a.output/n).write_text(json.dumps(v,indent=2))
emit(a.output/'contract-ir.json',a.output/'research-config.json',a.output/'project')
print('V102_MODEL_GENERATED_FROM_IR_AND_CONFIG')
