"""Emit solely from contract IR and external research configuration."""
import copy,hashlib,json,re
from pathlib import Path
from input_pipeline import validate_config,plan_instances

def emit(ir_path,config_path,output):
 ir=json.loads(Path(ir_path).read_text(encoding='utf-8-sig'));cfg=json.loads(Path(config_path).read_text(encoding='utf-8-sig'))
 if ir.get('ir_version')!=1:raise ValueError('Unsupported IR version')
 entities=copy.deepcopy(ir['entities']);validate_config(cfg,entities)
 if ir['issues'] and cfg['missing_information']['policy']=='block':raise ValueError('Unresolved contract input mappings: '+','.join(i['resource'] for i in ir['issues']))
 unified=cfg['render']['profile']=='unified'
 if unified:
  from generator_v56.render import context_model as renderer
  from generator_v56.render import negative_schema as negatives
 else:
  from legacy_context.render import context_model as renderer
  from legacy_context.render import negative_schema as negatives
 c=renderer.Contract(ir['document'])
 if cfg['actors'].get('shared_workflows')=='derive_from_contract':
  from native_sessions import fields_for
  for e in entities:
   e['value_domains']=ir.get('value_domains',{}).get(e['name'],{})
   fields,_=fields_for(e,c);e['change_field']=fields[0] if fields else None
 seed=cfg['fixtures']['seed'];instances=cfg['instances']['default'];name=cfg['model']['name'];base_url=cfg['model']['base_url']
 if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]*',name):raise ValueError('Invalid model name')
 for e in entities:
  e['body']={r['field']:c.value(r['schema'],r['salt_template'].format(seed=seed)) for r in ir['fixture_recipes'][e['name']]}
 counts={e['name']:cfg['instances']['per_entity'].get(e['name'],instances) for e in entities};counts['_overridden']=set(cfg['instances']['per_entity'])
 plans=plan_instances(entities,counts,cfg['budgets']['max_total_instances']) if unified else None
 kwargs={'instance_plans':plans} if unified else {}
 interface,dal,stories,entity_report=renderer.render(c,entities,name,base_url,instances,seed,**kwargs)
 cat=copy.deepcopy(ir['negative_catalog']) if cfg['render']['negative_schema'] else None
 if cat and cfg['actors'].get('shared_workflows')=='derive_from_contract':
  supported={e['name']:set(fields_for(e,c)[0]) for e in entities}
  cat['blocked_cases']=[dict(id=x['id'],reason='outside supported writable observable plain-string fields') for x in cat['cases'] if x['field'] not in supported[x['resource']]]
  cat['cases']=[x for x in cat['cases'] if x['field'] in supported[x['resource']]]
 if cat and cfg['recovery']['policy']=='cold_snapshot_restore':
  selected=set(cfg['recovery']['negative_rule_ids']);available={case['id'] for case in cat['cases']}
  if cfg['actors'].get('shared_workflows')=='derive_from_contract':selected=available
  if not selected or not selected<=available:raise ValueError('Unknown or empty recovery rule selection')
  cat['cases']=[case for case in cat['cases'] if case['id'] in selected]
 if cat:
  ni,nd,ns=negatives.render(c,entities,cat,instances,**kwargs)
  if not unified:
   for e in entities:
    if not any(case['resource']==e['name'] for case in cat['cases']):continue
    for i in range(1,instances+1):
     logical=e['name']+'_'+str(i);marker='    waitFor(matchesVerified('+renderer.j(logical)+',1));'
     gate='\n    waitFor(bp.EventSet('+renderer.j('Negatives complete '+logical)+',function(event){return event.name==="NegativeLifecycleComplete" && event.data.logicalId==='+renderer.j(logical)+';}));'
     stories=stories.replace(marker,marker+gate)
  if cfg['recovery']['policy']=='cold_snapshot_restore':
   from recovery_templates import recovery_negative_templates
   ni,nd,ns=recovery_negative_templates(ni,nd,ns)
  interface+=ni;dal+=nd;stories+=ns
 if unified:
  interface=interface.replace("    url='/__actor/'+RELATION_ACTOR+url;\n",'')
  from effect_footprints import derive_footprints
  footprints=derive_footprints(entities,plans)
  stories+='var RESOURCE_EFFECT_FOOTPRINTS='+json.dumps(footprints['instances'])+';\n'
  stories+=(Path(__file__).parent/'unified_resource_gate.js').read_text()
 if cfg['recovery']['policy']=='cold_snapshot_restore':
  from recovery_templates import recovery_transport
  interface=recovery_transport(interface)
 if cfg['actors']['sessions_per_user']==2:
  from native_sessions import render_sessions
  interface,dal,stories,session_report=render_sessions(interface,dal,stories,entities,plans,cfg,ir,c)
 else:session_report=[]
 interaction_report=None
 if cfg.get('interactions',{}).get('enabled'):
  from interaction_templates import render_interactions
  interface,stories,interaction_report=render_interactions(interface,stories,entities,plans,cfg,ir,c)
  dal+=(Path(__file__).parent/'interaction_dal.js').read_text()
 out=Path(output)
 if out.exists():raise ValueError('Use a new output directory')
 js=out/'spec/js';js.mkdir(parents=True)
 if unified:(out/'effect-footprints.json').write_text(json.dumps(footprints,indent=2))
 if interaction_report:(out/'interaction-catalog.json').write_text(json.dumps(interaction_report,indent=2))
 files={'interfaces.'+name+'.js':interface,'dal.js':dal,'stories.'+name+'.js':stories}
 for filename,content in files.items():
  with (js/filename).open('w',encoding='utf-8',newline='\n') as f:f.write(content)
 if cat:(js/'negative_catalog.json').write_text(json.dumps(cat,indent=2),encoding='utf-8')
 negative_count=sum(sum(case['resource']==e['name'] for case in cat['cases'])*len(plans[e['name']]) for e in entities) if cat and unified else len(cat['cases'])*instances if cat else 0
 if cfg['actors'].get('shared_workflows')=='derive_from_contract':negative_count*=2
 if '_selection_report' in cfg:
  (out/'negative-selection.json').write_text(json.dumps(cfg['_selection_report'],indent=2))
  negative_count=len(cfg['_selection_report']['selected'])
 budget=cfg['budgets']['max_events'] or 200+negative_count*30
 (out/'config').mkdir();(out/'config/provengo.yml').write_text('version: 2\nscenario.max-length: '+str(budget)+'\n',encoding='utf-8')
 hashes={str(p.relative_to(out)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in js.glob('*.js')}
 result={'version':'v071','status':'IR_ONLY_STATIC_GENERATION_COMPLETE','ir_sha256':hashlib.sha256(Path(ir_path).read_bytes()).hexdigest(),'config_sha256':hashlib.sha256(Path(config_path).read_bytes()).hexdigest(),'contract_sha256':ir['source']['sha256'],'experiment_id':cfg['experiment_id'],'renderer_profile':cfg['render']['profile'],'contract_file_read_by_emitter':False,'instance_bindings':plans,'entity_reports':entity_report,'shared_session_workflows':session_report,'negative_checks':negative_count,'warnings':ir['issues'],'missing_information_policy':cfg['missing_information']['policy'],'native_execution':False,'live_execution':False,'file_sha256':hashes}
 (out/'GENERATION_v071.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
 return result
