"""Static interaction extension: contract-derived candidates, reusable native workers."""
import itertools,json,random
from pathlib import Path
from native_sessions import fields_for
from generator_v56.render.route_expression import detail_route_expression

def catalog(entities,plans,c,cfg):
 rows=[];blocked=[]
 for e in entities:
  fields,reasons=fields_for(e,c)
  if not fields or not e.get('update_method'):
   blocked.append({'resource':e['name'],'reason':'No supported writable observable update fields','details':reasons});continue
  for binding in plans[e['name']]:
   for profile in cfg['interactions']['profiles']:
    pairs=[(f,f) for f in fields] if profile=='shared_read_same_field' else list(itertools.combinations(fields,2))
    for a,b in pairs:
     def spec(f):
      s=c.resolve(e['update_schema']['properties'][f]);return {'field':f,'minLength':s.get('minLength',0),'maxLength':s.get('maxLength'),'domain':e.get('value_domains',{}).get(f,{}).get('kind','plain_string')}
     rows.append({'resource_type':e['name'],'logical_id':binding['id'],'profile':profile,'session_fields':{'A':spec(a),'B':spec(b)},'writable_fields':e['update_fields'],'read_route':e['detail'],'write_method':e['update_method'].upper(),'provenance':{'resource_inference':e['provenance'],'read_operation_pointer':'#/paths/'+e['detail'].replace('~','~0').replace('/','~1')+'/get','write_operation_pointer':'#/paths/'+e['detail'].replace('~','~0').replace('/','~1')+'/'+e.get('source_update_method',e['update_method']),'effective_write_method':e['update_method'],'schema_fields':{f:e['update_schema']['properties'][f] for f in (a,b)}},'oracle_authority':'OBSERVATION_ONLY','oracle_reason':'Request schemas do not prove partial-update preservation or lost-update prevention','shared_physical_resource':True})
 rng=random.Random(cfg['interactions']['seed']);rng.shuffle(rows)
 selected=[]
 # Spread profile/resource families, not a manually prescribed application scenario.
 while len(selected)<min(cfg['interactions']['max_groups'],len(rows)):
  options=[x for x in rows if x not in selected]
  options.sort(key=lambda x:(sum(y['profile']==x['profile'] for y in selected),sum(y['resource_type']==x['resource_type'] for y in selected)))
  selected.append(options[0])
 for i,row in enumerate(selected,1):row['id']='INTERACTION_'+str(i)
 return {'status':'LIVE_ACCEPTANCE_READY_NOT_EXECUTED','candidate_count':len(rows),'selected':selected,'blocked':blocked,'live_blockers':[],'oracle_limitations':['Observational output only; no universal lost-update semantics inferred'],'reconciliation_policy':'Cold restore + API prefix + unchanged business Context, same JVM','generation_is_automatic':True}

def render_interactions(interface,stories,entities,plans,cfg,ir,c):
 interface=interface.replace('if(semantic.caseId)h["X-SBT-CaseId"]=semantic.caseId;','if(semantic.caseId)h["X-SBT-CaseId"]=semantic.caseId;if(semantic.groupId)h["X-SBT-GroupId"]=semantic.groupId;')
 stories=stories.replace('if(d.model&&d.model.action==="negative_attempt")pending=true;','if(d.model&&["negative_attempt","interaction_checkpoint","interaction_restore"].indexOf(d.model.action)>=0)pending=true;')
 budget_at=stories.find('bthread("research time budget and stable boundary"')
 if budget_at>=0:
  budget=stories[budget_at:].replace('e.name==="NegativeAcquire"||','e.name==="NegativeAcquire"||e.name==="InteractionReserve"||').replace('  if(event.name==="OperationAcquire")','  if(event.name==="InteractionAcquire")active["interaction/"+d.groupId]=true;\n  if(event.name==="InteractionRelease")delete active["interaction/"+d.groupId];\n  if(event.name==="OperationAcquire")')
  stories=stories[:budget_at]+budget
 report=catalog(entities,plans,c,cfg);by_name={e['name']:e for e in entities}
 # Compile all detail route bindings without application-specific path exceptions.
 for group in report['selected']:
  group['route_expression']=detail_route_expression(by_name[group['resource_type']])
 interface+='\n// Contract-derived static interaction interfaces.\n'
 interface+='''
function interactionCacheKey(group,sid){return "INTERACTION_CACHE_"+group.id+"_"+sid;}
function interactionValueKey(group,sid){return "INTERACTION_VALUE_"+group.id+"_"+sid;}
function captureInteractionRead(group,sid){
 var key=group.logical_id.replace(/[^A-Za-z0-9_]/g,"_"),url=interactionRoute(group.resource_type,key);
 var cache=interactionCacheKey(group,sid),spec=group.session_fields[sid],bodyKey="INTERACTION_BODY_"+group.id+"_"+sid;
 var wanted=workflowValue(sid,group.logical_id+"_"+group.id,spec);
 while(wanted.length<spec.minLength)wanted+="x";if(spec.maxLength)wanted=wanted.slice(0,spec.maxLength);
 var source="var value=JSON.parse(response.body);pvg.rtv.set("+JSON.stringify(cache)+",JSON.stringify(value));var fields="+JSON.stringify(group.writable_fields)+";var body={};fields.forEach(function(f){if(value[f]!==undefined)body[f]=value[f];});body["+JSON.stringify(spec.field)+"]="+JSON.stringify(wanted)+";pvg.rtv.set("+JSON.stringify(bodyKey)+",JSON.stringify(body));";
 return requestRest("GET",url,undefined,[200],{action:"interaction_read",logicalId:group.logical_id,session:sid,groupId:group.id},callbackFromSource(source));
}
function writeInteractionSnapshot(group,sid){
 var key=group.logical_id.replace(/[^A-Za-z0-9_]/g,"_"),url=interactionRoute(group.resource_type,key);
 var bodyKey="INTERACTION_BODY_"+group.id+"_"+sid;
 return requestRest(group.write_method,url,"@{"+bodyKey+"}",[200],{action:"interaction_write",logicalId:group.logical_id,session:sid,groupId:group.id},callbackFromSource("if(response.body)JSON.parse(response.body);"));
}
function probeInteraction(group,sid){
 var key=group.logical_id.replace(/[^A-Za-z0-9_]/g,"_"),url=interactionRoute(group.resource_type,key);
 return requestRest("GET",url,undefined,[200],{action:"interaction_probe",logicalId:group.logical_id,session:sid,groupId:group.id},callbackFromSource("bp.log.info('INTERACTION_OBSERVATION '+JSON.stringify({groupId:"+JSON.stringify(group.id)+",session:"+JSON.stringify(sid)+",status:Number(response.code),body:JSON.parse(response.body),oracleAuthority:'OBSERVATION_ONLY'}));"));
}
'''
 interface+='function interactionRoute(type,key){\n'
 for e in entities:
  if any(g['resource_type']==e['name'] for g in report['selected']):interface+=' if(type==='+json.dumps(e['name'])+')return '+detail_route_expression(e)+';\n'
 interface+=' throw new Error("Unsupported interaction route "+type);\n}\n'
 stories+='\n// INTERACTION_EXTENSION_BEGIN: generation only; native acceptance pending.\n'
 stories+='var INTERACTION_GROUPS='+json.dumps(report['selected'])+';\n'
 stories+=(Path(__file__).parent/'interaction_stories.js').read_text()
 stories+=(Path(__file__).parent/'interaction_global_gate.js').read_text()
 interface+=(Path(__file__).parent/'interaction_control_interfaces.js').read_text()
 return interface,stories,report
