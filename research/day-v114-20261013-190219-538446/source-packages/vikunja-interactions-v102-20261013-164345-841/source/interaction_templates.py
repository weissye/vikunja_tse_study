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
 return {'status':'STATIC_GENERATED_NOT_LIVE_ACCEPTED','candidate_count':len(rows),'selected':selected,'blocked':blocked,'live_blockers':['Reference-state/Context reconciliation after exploratory writes','Positive-write group snapshot and restoration acceptance','Live oracle validation beyond observational output'],'generation_is_automatic':True}

def render_interactions(interface,stories,entities,plans,cfg,ir,c):
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
 var cache=interactionCacheKey(group,sid);
 return requestRest("GET",url,undefined,[200],{action:"interaction_read",logicalId:group.logical_id,session:sid,groupId:group.id},callbackFromSource("var value=JSON.parse(response.body);pvg.rtv.set("+JSON.stringify(cache)+",JSON.stringify(value));"));
}
function writeInteractionSnapshot(group,sid){
 var key=group.logical_id.replace(/[^A-Za-z0-9_]/g,"_"),url=interactionRoute(group.resource_type,key),spec=group.session_fields[sid];
 var value=workflowValue(sid,group.logical_id+"_"+group.id,spec);
 while(value.length<spec.minLength)value+="x";if(spec.maxLength)value=value.slice(0,spec.maxLength);
 var cache=interactionCacheKey(group,sid),bodyKey="INTERACTION_BODY_"+group.id+"_"+sid;
 var build="var before=JSON.parse(String(pvg.rtv.get("+JSON.stringify(cache)+")));var fields="+JSON.stringify(group.writable_fields)+";var body={};fields.forEach(function(f){if(before[f]!==undefined)body[f]=before[f];});body["+JSON.stringify(spec.field)+"]="+JSON.stringify(value)+";pvg.rtv.set("+JSON.stringify(bodyKey)+",JSON.stringify(body));pvg.rtv.set("+JSON.stringify(interactionValueKey(group,sid))+","+JSON.stringify(value)+");";
 // Build the request body in an RTV expression, using this group's session-local read.
 return requestRest(group.write_method,url,"@{(function(){"+build+"return pvg.rtv.get("+JSON.stringify(bodyKey)+");})()}",[200],{action:"interaction_write",logicalId:group.logical_id,session:sid,groupId:group.id},callbackFromSource("if(response.body)JSON.parse(response.body);"));
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
 return interface,stories,report
