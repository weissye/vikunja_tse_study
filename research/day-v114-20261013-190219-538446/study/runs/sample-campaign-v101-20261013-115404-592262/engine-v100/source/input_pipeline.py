"""Compile contract facts separately from configurable generic model emission."""
import copy,hashlib,json
from pathlib import Path
from generator_v56.parsing.swagger_context import normalize_context_contract
from generator_v56.render.context_model import build_model,Contract,infer_authentication
from generator_v56.render.negative_schema import catalog

def refs(value):
 if isinstance(value,dict):
  if '$ref' in value:yield value['$ref']
  for child in value.values():yield from refs(child)
 elif isinstance(value,list):
  for child in value:yield from refs(child)

def compile_ir(contract,scope,adapter=None,request_mappings=None):
 data=Path(contract).read_bytes();source=json.loads(data.decode('utf-8-sig'));doc,normalization=normalize_context_contract(source)
 selected=json.loads(Path(scope).read_text()) if isinstance(scope,(str,Path)) else scope
 mapping=json.loads(Path(request_mappings).read_text()) if request_mappings else None
 if mapping:
  if mapping.get('mapping_version')!=1 or mapping.get('contract_sha256')!=hashlib.sha256(data).hexdigest():raise ValueError('Request mapping version/source hash mismatch')
  for rule in mapping['rules']:
   path=rule['path'];method=rule['method'].lower()
   if path not in doc['paths'] or method not in doc['paths'][path]:raise ValueError('Request mapping targets unknown operation')
   if doc['paths'][path][method].get('requestBody'):raise ValueError('Mapping may not silently replace an existing request body')
   schema=copy.deepcopy(rule['request_schema'])
   if not rule.get('provenance') or not rule.get('validation_requirement'):raise ValueError('Mapping provenance/acceptance requirement missing')
   if schema.get('type')!='object' or not schema.get('properties') or set(schema.get('required',[]))-set(schema['properties']):raise ValueError('Invalid explicit request mapping')
   doc['paths'][path][method]['requestBody']={'required':True,'content':{'application/json':{'schema':schema}}}
 paths=selected['resources'];c,entities=build_model(doc,paths,1,1)
 if mapping:
  for rule in mapping['rules']:
   matched=[e for e in entities if e['path']==rule['path'] and e['create_method']==rule['method'].lower()]
   if len(matched)!=1:raise ValueError('Mapped creation is outside selected/unambiguous entity scope')
   matched[0]['provenance'].append({'pointer':'#/paths/'+rule['path'].replace('~','~0').replace('/','~1')+'/'+rule['method'].lower()+'/requestBody','rule':'EXPLICIT_EXTERNAL_REQUEST_MAPPING','mapping_id':rule['id'],'source_authority':'RESEARCH_MAPPING_NOT_DECLARED_REQUEST_SCHEMA','validation_requirement':rule['validation_requirement'],'evidence':rule['provenance']})
 compatibility=json.loads(Path(adapter).read_text()) if adapter else None
 if compatibility:
  if compatibility['contract_sha256']!=hashlib.sha256(data).hexdigest():raise ValueError('Adapter source hash mismatch')
  for rule in compatibility['rules']:
   matching=[e for e in entities if e['detail']==rule['path'] and e['update_method']==rule['source_method']]
   if len(matching)!=1:raise ValueError('Adapter matching is ambiguous')
   e=matching[0];e['source_update_method']=e['update_method'];e['update_method']=rule['effective_method']
   from generator_v56.render.context_model import pointer
   e['provenance'].append(dict(pointer=pointer(rule['path'],rule['source_method']),rule='EXPLICIT_METHOD_COMPATIBILITY_ADAPTER',evidence=compatibility['evidence']))
 recipes={};issues=[]
 for e in entities:
  recipes[e['name']]=[{'field':field,'schema':e['create_schema']['properties'][field],'salt_template':'{seed}-'+e['name']+'-INSTANCE-'+field} for field in e.pop('body')]
  if not e['create_schema']:
   issues.append({'resource':e['name'],'operation':e['create_method'].upper()+' '+e['path'],'code':'MISSING_CREATE_REQUEST_SCHEMA','status':'UNRESOLVED_POSITIVE_INPUT','source_pointer':'#/paths/'+e['path'].replace('~','~0').replace('/','~1')+'/'+e['create_method']})
 # Keep only selected route facts and transitive schema references. Preserve source ordering.
 routes=set(paths)|{e['detail'] for e in entities};view=copy.deepcopy(doc);view['paths']={p:v for p,v in doc['paths'].items() if p in routes}
 schemas=doc['components']['schemas'];needed=set();todo=list(refs([view['paths'],entities,recipes]))
 while todo:
  ref=todo.pop()
  if not ref.startswith('#/components/schemas/'):raise ValueError('Unsupported unresolved reference: '+ref)
  name=ref.split('/')[-1].replace('~1','/').replace('~0','~')
  if name in needed:continue
  if name not in schemas:raise ValueError('Missing schema: '+name)
  needed.add(name);todo.extend(refs(schemas[name]))
 view['components']['schemas']={n:s for n,s in schemas.items() if n in needed}
 return {'ir_version':1,'source':{'sha256':hashlib.sha256(data).hexdigest(),'version':source.get('info',{}).get('version'),'normalization':normalization},'selected_paths':paths,'document':view,'entities':entities,'fixture_recipes':recipes,'negative_catalog':catalog(c,entities),'method_adapter':compatibility,'request_mappings':mapping,'authentication':infer_authentication(doc,paths),'issues':issues,'unsupported_candidates':selected.get('unsupported_candidates',[]),'policy':'Schema/identity inference provenance retained; unresolved input is not silently validated.'}

def research_config(instances=3,seed=1,profile='unified',name='vikunja',base_url='http://127.0.0.1:3456/api/v1'):
 return {'config_version':1,'experiment_id':'baseline-v069' if profile=='unified' else 'legacy-compatibility','model':{'name':name,'base_url':base_url},'instances':{'default':instances,'per_entity':{}},'fixtures':{'seed':seed},'render':{'profile':profile,'negative_schema':True},'budgets':{'max_events':None,'max_total_instances':4096},'actors':{'users':1,'sessions_per_user':1},'missing_information':{'policy':'preserve_baseline_with_warnings'},'recovery':{'policy':'not_integrated'}}

def validate_config(config,entities):
 required={'config_version','experiment_id','model','instances','fixtures','render','budgets','actors','missing_information','recovery'}
 if set(config)-{'sampling'}!=required:raise ValueError('Unknown/missing top-level configuration keys')
 shapes={'model':{'name','base_url'},'instances':{'default','per_entity'},'fixtures':({'seed','namespace'} if 'namespace' in config['fixtures'] else {'seed'}),'render':{'profile','negative_schema'},'budgets':({'max_events','max_total_instances','soft_seconds','drain_seconds'} if 'soft_seconds' in config['budgets'] else {'max_events','max_total_instances'}),'actors':({'users','sessions_per_user','shared_workflows'} if config['actors'].get('sessions_per_user')==2 else {'users','sessions_per_user'}),'missing_information':{'policy'},'recovery':({'policy','negative_rule_ids'} if config['recovery'].get('policy')=='cold_snapshot_restore' else {'policy'})}
 for key,fields in shapes.items():
  if not isinstance(config[key],dict) or set(config[key])!=fields:raise ValueError('Unsupported/missing configuration fields: '+key)
 if 'sampling' in config:
  sample=config['sampling']
  if set(sample)!={'negative_limit','seed','completed_case_ids'} or type(sample['negative_limit']) is not int or sample['negative_limit']<1 or type(sample['seed']) is not int or not isinstance(sample['completed_case_ids'],list) or not all(isinstance(x,str) for x in sample['completed_case_ids']):raise ValueError('Invalid sampling configuration')
 if 'soft_seconds' in config['budgets']:
  for k in ('soft_seconds','drain_seconds'):
   if type(config['budgets'][k]) is not int or config['budgets'][k]<1:raise ValueError('Invalid time budget')
 if config['config_version']!=1:raise ValueError('Unsupported config version')
 if config['render']['profile'] not in ('unified','legacy_context'):raise ValueError('Unsupported renderer profile')
 if type(config['render']['negative_schema']) is not bool:raise ValueError('negative_schema must be boolean')
 if config['actors'].get('users')!=1 or config['actors'].get('sessions_per_user') not in (1,2):raise ValueError('Only one user with one or two sessions is supported')
 if config['actors']['sessions_per_user']==2 and config['render']['profile']!='unified':raise ValueError('Two sessions require unified rendering')
 if config['recovery'].get('policy') not in ('not_integrated','cold_snapshot_restore'):raise ValueError('Unsupported recovery policy')
 if config['recovery'].get('policy')=='cold_snapshot_restore' and (config['render']['profile']!='unified' or not config['render']['negative_schema'] or not isinstance(config['recovery']['negative_rule_ids'],list)):raise ValueError('Recovery requires unified negative model and explicit rule selection')
 if config['missing_information']['policy'] not in ('block','preserve_baseline_with_warnings'):raise ValueError('Unsupported missing-information policy')
 names={e['name'] for e in entities};overrides=config['instances']['per_entity']
 if not isinstance(overrides,dict) or set(overrides)-names:raise ValueError('Unknown per-entity instance override')
 for n in [config['instances']['default'],*overrides.values()]:
  if type(n)is not int or not 1<=n<=10:raise ValueError('Instance count must be an integer in 1..10')
 if config['budgets']['max_total_instances'] is None:raise ValueError('Total instance budget must be explicit')
 if type(config['fixtures']['seed'])is not int:raise ValueError('Fixture seed must be integer')
 for key in ['max_events','max_total_instances']:
  v=config['budgets'][key]
  if v is not None and (type(v)is not int or v<1):raise ValueError('Invalid budget: '+key)
 if config['render']['profile']=='legacy_context' and overrides:raise ValueError('Legacy per-entity overrides are not supported')

def plan_instances(entities,counts,limit):
 import itertools
 plans={};pending=list(entities)
 while pending:
  progress=False
  for e in list(pending):
   targets=sorted({d['target'] for d in e['dependencies']})
   if not all(t in plans for t in targets):continue
   combinations=[dict(zip(targets,[p['id'] for p in pair])) for pair in itertools.product(*[plans[t] for t in targets])] if targets else [{} for _ in range(counts[e['name']])]
   if len(combinations)>limit or sum(len(v) for v in plans.values())+len(combinations)>limit:raise ValueError('Total instance budget exceeded')
   # Dependent count equals parent tuples, as in v069. Overrides for dependent
   # entities must explicitly match that derived count to avoid silent ignoring.
   if targets and e['name'] in counts.get('_overridden',set()) and counts[e['name']]!=len(combinations):raise ValueError('Dependent override conflicts with all-combination count: '+e['name'])
   plans[e['name']]=[{'id':e['name']+'_'+str(i+1),'fixture_index':i+1,'bindings':b} for i,b in enumerate(combinations)]
   pending.remove(e);progress=True
  if not progress:raise ValueError('Unresolved cyclic creation dependencies')
 return plans
