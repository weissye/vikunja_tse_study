import sys,json,argparse
from pathlib import Path
root=Path(__file__).resolve().parent;sys.path.insert(0,str(root/'source'))
from input_pipeline import compile_ir,research_config
from generic_emitter import emit
p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);p.add_argument('--proxy-url',default='http://127.0.0.1:13474');a=p.parse_args()
if a.output.exists():raise SystemExit('Use a new directory')
a.output.mkdir(parents=True)
plan=json.loads((root/'input-source/acceptance-plan-v087.json').read_text())
ir=compile_ir(root/'input-source/contract.json',{'resources':plan['resources']},root/'input-source/method_adapter.json',root/'input-source'/plan['request_mappings'])
for entity in ir['entities']:
    if entity['name'] in plan.get('update_field_overrides',{}):
        field=plan['update_field_overrides'][entity['name']]
        if field not in entity['update_fields']:raise ValueError('Unsupported configured update field')
        entity['change_field']=field
for entity in ir['entities']:
    for field in plan.get('extra_fixture_fields',{}).get(entity['name'],[]):
        schema=entity['create_schema']['properties'][field]
        ir['fixture_recipes'][entity['name']].append({'field':field,'schema':schema,'salt_template':'{seed}-'+entity['name']+'-INSTANCE-'+field})
for entity in ir['entities']:
    if entity['name'] in plan.get('fixture_fields_override',{}):
        ir['fixture_recipes'][entity['name']]=[{'field':field,'schema':entity['create_schema']['properties'][field],'salt_template':'{seed}-'+entity['name']+'-INSTANCE-'+field} for field in plan['fixture_fields_override'][entity['name']]]
ir['sensitive_response_fields']=plan.get('sensitive_response_fields',{})
# Acceptance observation metadata is upstream IR data, not an emitter exception.
ir['acceptance_observations']=plan['relationship_checks']
cfg=research_config(name='vikunja',base_url=a.proxy_url);cfg['instances']['default']=plan['instances_per_entity'];cfg['experiment_id']='recovery-acceptance-v087';cfg['missing_information']['policy']='block';cfg['recovery']={'policy':'cold_snapshot_restore','negative_rule_ids':plan['negative_rule_ids']}
cfg['actors']={'users':1,'sessions_per_user':2,'shared_workflows':[{'entity':'ModelsTask','session':'A','field':'title'},{'entity':'ModelsTask','session':'B','field':'description'}]}
for n,v in [('contract-ir.json',ir),('research-config.json',cfg)]:
 (a.output/n).write_text(json.dumps(v,indent=2),encoding='utf-8')
emit(a.output/'contract-ir.json',a.output/'research-config.json',a.output/'project')
print('V087_ONE_MODEL_RECOVERY_ACCEPTANCE_GENERATED')
