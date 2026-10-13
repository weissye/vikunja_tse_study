"""Contract-derived relation inference and Context Stories/Interfaces/DAL renderer."""
import json,re

def infer_relations(c,entities):
 children=[e for e in entities if len(e.get('path_dependencies',[]))==1]
 candidates=[]
 for child in children:
  foreign=child['path_dependencies'][0].get('foreign_field')
  if not foreign:continue
  for path,ops in c.raw['paths'].items():
   if 'get' not in ops or 'put' not in ops:continue
   prefix=child['detail'].rsplit('/',1)[0]
   if not path.startswith(prefix+'/{') or len(re.findall(r'\{[^}]+\}',path))!=1:continue
   _,response=c.response(ops['get'])
   if response.get('type')!='array':continue
   item=c.resolve(response.get('items',{}))
   targets=[e for e in entities if e['read_schema']==item and e is not child]
   if len(targets)!=1:continue
   target=targets[0];delete_op=c.raw['paths'][target['detail']].get('delete',{})
   if not delete_op or '404' not in target['get'].get('responses',{}):continue
   fields=c.body(ops['put']).get('properties',{})
   token=target['path'].rsplit('/',1)[-1].rstrip('s')
   ids=[f for f in fields if f==token+'_id' and c.resolve(fields[f]).get('type')=='integer']
   if len(ids)!=1:continue
   deletions=[p for p,op in c.raw['paths'].items() if p.startswith(path+'/{') and p.endswith('}') and 'delete' in op]
   if len(deletions)!=1:continue
   remove=deletions[0];param=re.findall(r'\{([^}]+)\}',path)[0];labelparam=re.findall(r'\{([^}]+)\}',remove)[-1]
   child_delete=c.raw['paths'][child['detail']].get('delete',{})
   if not child_delete or '404' not in child['get'].get('responses',{}):continue
   candidates.append(dict(child_delete_codes=c.response(child_delete)[0],child_delete_pointer='#/paths/'+child['detail'].replace('~','~0').replace('/','~1')+'/delete',target_delete_codes=c.response(delete_op)[0],target_delete_pointer='#/paths/'+target['detail'].replace('~','~0').replace('/','~1')+'/delete',child_type=child['name'],target_type=target['name'],parent_type=child['path_dependencies'][0]['target'],parent_field=foreign,collection=path,remove=remove,child_parameter=param,target_parameter=labelparam,body_field=ids[0],attach_method='PUT',detach_method='DELETE',attach_codes=c.response(ops['put'])[0],detach_codes=c.response(c.raw['paths'][remove]['delete'])[0],read_codes=c.response(ops['get'])[0],source_pointers=['#/paths/'+p.replace('~','~0').replace('/','~1')+'/'+m for p,m in [(path,'get'),(path,'put'),(remove,'delete')]],authority='Exact response schema + path structure + conventional foreign key; membership/preservation are explicit research hypotheses',description={'attach':ops['put'].get('description',''),'detach':c.raw['paths'][remove]['delete'].get('description','')}))
 if len(candidates)!=1:raise ValueError('Relation inference must resolve one unambiguous selected relation')
 return candidates[0]

def render_relations(entities,instances,plan):
 if plan.get("family")=="shared_tasks":
  from .context_shared import render_shared
  return render_shared(entities,instances,plan)
 j=lambda x:json.dumps(x,separators=(',',':'))
 spec=plan['relation_spec'];child=next(e for e in entities if e['name']==spec['child_type']);target=next(e for e in entities if e['name']==spec['target_type'])
 count=len(entities)*instances
 if target['update_schema'].get('properties',{}).get('description',{}).get('type')!='string':raise ValueError('Target description update must be contract-supported string')
 if not spec.get('target_delete_codes') or '404' not in target['get'].get('responses',{}):raise ValueError('Target delete and documented 404 required')
 spec=dict(spec,target_update_method=target['update_method'].upper(),target_update_codes=[int(k) for k in target['update'].get('responses',{}) if k.isdigit() and 200<=int(k)<300])
 subjects=plan['subjects']
 valid={e['name']+'_'+str(i) for e in entities for i in range(1,instances+1)}
 if any(s not in valid for s in subjects.values()):raise ValueError('Unknown relation subject')
 if plan['mode'] not in ('bootstrap','resume'):raise ValueError('Unknown relation phase')
 iface=r'''
function relationKey(id){return id.replace(/[^A-Za-z0-9_]/g,'_');}
function relationRoute(template,param,logical){return template.replace('{'+param+'}','@{ROUTE_'+relationKey(logical)+'}');}
function relationCheck(name,path,expected,kind,successCodes,storeKey){
 var source="var wanted="+JSON.stringify(expected)+";function resolve(v){if(typeof v==='string'&&/^@\\{[A-Za-z0-9_]+\\}$/.test(v))return pvg.rtv.get(v.slice(2,-1));if(Array.isArray(v))return v.map(resolve);if(v&&typeof v==='object'){var o={};Object.keys(v).forEach(function(k){o[k]=resolve(v[k]);});return o;}return v;}wanted=resolve(wanted);var actual;try{actual=JSON.parse(response.body);}catch(e){actual=null;}var passed=Number(response.code)===200;";
 if(kind==='membership')source+="var ids=Array.isArray(actual)?actual.map(function(x){return String(x.id);}).sort():null;passed=passed&&JSON.stringify(ids)===JSON.stringify(wanted.map(String).sort());";
 else if(kind==='absence')source+="passed=Number(response.code)===403?null:Number(response.code)===404;";
 else if(kind==='deleted_child_membership')source+="passed=Number(response.code)===403?null:Number(response.code)===404?true:Number(response.code)===200&&Array.isArray(actual)&&actual.length===0;";
 else if(kind==='embedded_membership')source+="var ids=actual&&Array.isArray(actual.labels)?actual.labels.map(function(x){return String(x.id);}).sort():null;passed=passed&&JSON.stringify(ids)===JSON.stringify(wanted.map(String).sort());";
 else if(kind==='write')source+="passed="+JSON.stringify(successCodes)+".indexOf(Number(response.code))>=0;";
 else source+="passed=passed&&actual&&Object.keys(wanted).every(function(k){return actual[k]===wanted[k];});";
 if(storeKey)source+="var projected={};if("+JSON.stringify(kind)+"==='membership')projected=ids;else Object.keys(wanted).sort().forEach(function(k){projected[k]=actual?actual[k]:null;});pvg.rtv.set("+JSON.stringify(storeKey)+",JSON.stringify(projected));";
 source+="bp.log.info('RELATION_CHECK '+JSON.stringify({name:"+JSON.stringify(name)+",kind:"+JSON.stringify(kind)+",status:Number(response.code),expected:wanted,observed:actual,pass:passed===null?null:!!passed,classification:passed===null?'ABSENCE_UNDETERMINED':passed?'PASS':'FAIL'}));if(passed===false)pvg.fail('Relation semantic check failed: '+"+JSON.stringify(name)+");";
 return callbackFromSource(source);
}
function relationCollectionWitness(pending,before){
 var expected={target:'@{ID_'+relationKey(pending.label)+'}',survivor:'@{ID_'+relationKey(pending.survivor)+'}',target_present:before};
 var source="var expected="+JSON.stringify(expected)+";expected.target=String(pvg.rtv.get(expected.target.slice(2,-1)));expected.survivor=String(pvg.rtv.get(expected.survivor.slice(2,-1)));var actual;try{actual=JSON.parse(response.body);}catch(e){actual={};}var passed=null;var classification='COLLECTION_UNDETERMINED';if(Number(response.code)===200&&actual.complete===true){var target=actual.ids.indexOf(expected.target)>=0,survivor=actual.ids.indexOf(expected.survivor)>=0;passed=survivor&&(expected.target_present?target:!target);classification=passed?(expected.target_present?'BOTH_LABELS_VISIBLE':'ABSENT_FROM_VISIBLE_COLLECTION'):'FAIL';}bp.log.info('RELATION_CHECK '+JSON.stringify({name:"+JSON.stringify((pending.check_id||pending.id)+(before?'/both-labels-visible':'/collection-after'))+",kind:'visible_collection',status:Number(response.code),expected:expected,observed:actual,pass:passed,classification:classification}));if(passed===false)pvg.fail('Visible collection expectation failed');";
 requestRest('GET','/__checkpoint/visible-labels',undefined,ALL_CODES,{action:'independent_visible_collection'},callbackFromSource(source));
}
function relationMutation(pending){
 var s=RELATION_SPEC,task=pending.task,label=pending.label;
 if(pending.action==='delete_child'){var deletedTaskPath=relationRoute(TASK_DETAIL,TASK_PARAMETER,task);return requestRest('DELETE',deletedTaskPath,undefined,ALL_CODES,{action:'relation_child_delete',logicalId:task},relationCheck((pending.check_id||pending.id)+'/write',deletedTaskPath,{},'write',s.child_delete_codes));}
 if(pending.action==='delete_target'){relationCollectionWitness(pending,true);var deletedPath=relationRoute(TARGET_DETAIL,TARGET_PARAMETER,label);return requestRest('DELETE',deletedPath,undefined,ALL_CODES,{action:'relation_target_delete',logicalId:label},relationCheck((pending.check_id||pending.id)+'/write',deletedPath,{},'write',s.target_delete_codes));}
 if(pending.action==='update_target'){var targetPath=relationRoute(TARGET_DETAIL,TARGET_PARAMETER,label);var updateBody=JSON.parse(JSON.stringify(getModelEntity(label).expected));Object.keys(pending.update).forEach(function(k){updateBody[k]=pending.update[k];});return requestRest(s.target_update_method,targetPath,updateBody,ALL_CODES,{action:'relation_target_update',logicalId:label},relationCheck((pending.check_id||pending.id)+'/write',targetPath,{},'write',s.target_update_codes));}
 var path=relationRoute(pending.present?s.collection:s.remove,s.child_parameter,task);
 if(!pending.present)path=relationRoute(path,s.target_parameter,label);
 var body;if(pending.present){body={};body[s.body_field]='@{ID_'+relationKey(label)+'}';}
 var codes=pending.present?s.attach_codes:s.detach_codes;
 return requestRest(pending.present?s.attach_method:s.detach_method,path,body,ALL_CODES,{action:'relation_write',logicalId:task},relationCheck((pending.check_id||pending.id)+'/write',path,{},'write',codes));
}
function verifyRelationSingle(pending){
 var s=RELATION_SPEC;
 var task=getModelEntity(pending.task),label=getModelEntity(pending.label);
 if(pending.action==='delete_child'){
 var deletedTask=relationRoute(TASK_DETAIL,TASK_PARAMETER,pending.task);
 requestRest('GET',deletedTask,undefined,ALL_CODES,{action:'relation_read',logicalId:pending.task},relationCheck((pending.check_id||pending.id)+'/deleted-task-absence',deletedTask,{},'absence'));
 var deletedLinks=relationRoute(s.collection,s.child_parameter,pending.task);
 requestRest('GET',deletedLinks,undefined,ALL_CODES,{action:'relation_read',logicalId:pending.task},relationCheck((pending.check_id||pending.id)+'/deleted-task-links',deletedLinks,[],'deleted_child_membership'));
 var other=getModelEntity(pending.other_task),survivor=getModelEntity(pending.survivor);
 var otherIds=pending.other_labels.map(function(id){return '@{ID_'+relationKey(id)+'}';});
 requestRest('GET',relationRoute(s.collection,s.child_parameter,pending.other_task),undefined,ALL_CODES,{action:'relation_read',logicalId:pending.other_task},relationCheck((pending.check_id||pending.id)+'/other-membership','',otherIds,'membership'));
 requestRest('GET',relationRoute(TASK_DETAIL,TASK_PARAMETER,pending.other_task),undefined,ALL_CODES,{action:'relation_read',logicalId:pending.other_task},relationCheck((pending.check_id||pending.id)+'/other-task-preservation','',other.expected,'projection'));
 requestRest('GET',relationRoute(TARGET_DETAIL,TARGET_PARAMETER,pending.label),undefined,ALL_CODES,{action:'relation_read',logicalId:pending.label},relationCheck((pending.check_id||pending.id)+'/first-label-preservation','',label.expected,'projection'));
 requestRest('GET',relationRoute(TARGET_DETAIL,TARGET_PARAMETER,pending.survivor),undefined,ALL_CODES,{action:'relation_read',logicalId:pending.survivor},relationCheck((pending.check_id||pending.id)+'/second-label-preservation','',survivor.expected,'projection'));
 relationCollectionWitness(pending,true);
 return;
 }

 var ids=pending.expected_labels.map(function(id){return '@{ID_'+relationKey(id)+'}';});
 var path=relationRoute(s.collection,s.child_parameter,pending.task);
 requestRest('GET',path,undefined,ALL_CODES,{action:'relation_read',logicalId:pending.task},relationCheck((pending.check_id||pending.id)+'/membership',path,ids,'membership'));
 requestRest('GET',relationRoute(TASK_DETAIL,TASK_PARAMETER,pending.task),undefined,ALL_CODES,{action:'relation_read',logicalId:pending.task},relationCheck((pending.check_id||pending.id)+'/task-preservation','',task.expected,'projection'));
 var otherIds=pending.other_labels.map(function(id){return '@{ID_'+relationKey(id)+'}';});
 var otherPath=relationRoute(s.collection,s.child_parameter,pending.other_task);
 requestRest('GET',otherPath,undefined,ALL_CODES,{action:'relation_read',logicalId:pending.other_task},relationCheck((pending.check_id||pending.id)+'/other-membership',otherPath,otherIds,'membership'));
 requestRest('GET',relationRoute(TARGET_DETAIL,TARGET_PARAMETER,pending.label),undefined,ALL_CODES,{action:'relation_read',logicalId:pending.label},relationCheck((pending.check_id||pending.id)+'/target-exists','',label.expected,pending.action==='delete_target'?'absence':'projection'));
 if(pending.action==='delete_target'){
 relationCollectionWitness(pending,false);
 var other=getModelEntity(pending.other_task),survivor=getModelEntity(pending.survivor);
 requestRest('GET',relationRoute(TASK_DETAIL,TASK_PARAMETER,pending.other_task),undefined,ALL_CODES,{action:'relation_read',logicalId:pending.other_task},relationCheck((pending.check_id||pending.id)+'/other-task-preservation','',other.expected,'projection'));
 requestRest('GET',relationRoute(TARGET_DETAIL,TARGET_PARAMETER,pending.survivor),undefined,ALL_CODES,{action:'relation_read',logicalId:pending.survivor},relationCheck((pending.check_id||pending.id)+'/survivor-exists','',survivor.expected,'projection'));
 requestRest('GET',relationRoute(TASK_DETAIL,TASK_PARAMETER,pending.task),undefined,ALL_CODES,{action:'relation_read',logicalId:pending.task},relationCheck((pending.check_id||pending.id)+'/task-embedded-membership','',ids,'embedded_membership'));
 requestRest('GET',relationRoute(TASK_DETAIL,TASK_PARAMETER,pending.other_task),undefined,ALL_CODES,{action:'relation_read',logicalId:pending.other_task},relationCheck((pending.check_id||pending.id)+'/other-embedded-membership','',otherIds,'embedded_membership'));
 }
 if(pending.action==='update_target'){
 var expectedLabel=label.expected;
 var endpoints=[{path:path,labels:pending.expected_labels},{path:otherPath,labels:pending.other_labels}];
 for(var viewIndex=0;viewIndex<endpoints.length;viewIndex++){
 var endpoint=endpoints[viewIndex],shouldContain=endpoint.labels.indexOf(pending.label)>=0;
 var callback=callbackFromSource("var actual=JSON.parse(response.body),expected="+JSON.stringify(expectedLabel)+";var hits=Array.isArray(actual)?actual.filter(function(x){return x.id===Number(pvg.rtv.get("+JSON.stringify('ID_'+relationKey(pending.label))+"));}):null;var hit=hits&&hits[0];var shouldContain="+JSON.stringify(shouldContain)+";var passed=Number(response.code)===200&&!!hits&&(shouldContain?hits.length===1&&Object.keys(expected).every(function(k){return hit[k]===expected[k];}):hits.length===0);bp.log.info('RELATION_CHECK '+JSON.stringify({name:"+JSON.stringify((pending.check_id||pending.id)+'/embedded-label-'+viewIndex)+",kind:'embedded_projection',status:Number(response.code),expected:{present:shouldContain,projection:expected},observed:hit||null,pass:!!passed,classification:passed?'PASS':'FAIL'}));if(!passed)pvg.fail('Shared label update view differs');");
 requestRest('GET',endpoint.path,undefined,ALL_CODES,{action:'relation_read',logicalId:viewIndex===0?pending.task:pending.other_task},callback);
 }
 }

}

function relationFinalObservationSingle(name,store){
 var all=ctx.runQuery('Resource.All').slice().sort(function(a,b){return a.id<b.id?-1:1;});
 var keys=[];
 for(var i=0;i<all.length;i++){var r=all[i],route=RELATION_PLAN.resources.filter(function(x){return x.logicalId===r.id;})[0];if(!route)pvg.fail('Final observation requires restored resource routes');var key='FINAL_'+relationKey(r.id);keys.push(key);requestRest('GET',relationRoute(route.detail_template,route.route_parameter,r.id),undefined,ALL_CODES,{action:'final_projection'},relationCheck(name+'/'+r.id,'',r.expected,'projection',[],store?key:null));}
 var memberships=RELATION_PLAN.final_memberships;
 for(var task in memberships){var ids=memberships[task].map(function(x){return '@{ID_'+relationKey(x)+'}';});var key='FINAL_MEM_'+relationKey(task);keys.push(key);requestRest('GET',relationRoute(RELATION_SPEC.collection,RELATION_SPEC.child_parameter,task),undefined,ALL_CODES,{action:'final_membership'},relationCheck(name+'/'+task+'/membership','',ids,'membership',[],store?key:null));}
 if(store)requestRest('GET','/__checkpoint/ping',undefined,[200],{action:'final_capture'},callbackFromSource("var keys="+JSON.stringify(keys)+";var state={};keys.forEach(function(k){state[k]=JSON.parse(pvg.rtv.get(k));});bp.log.info('RELATION_FINAL '+JSON.stringify(state));"));
}

function verifyRelation(pending){
 var previous=RELATION_ACTOR;
 for(var reader=0;reader<2;reader++){RELATION_ACTOR=reader===0?'A':'B';var copy=JSON.parse(JSON.stringify(pending));copy.check_id=(pending.check_id||pending.id)+'/reader-'+RELATION_ACTOR;verifyRelationSingle(copy);}
 RELATION_ACTOR=previous;
}
function relationFinalObservation(name,store){
 var previous=RELATION_ACTOR;
 for(var reader=0;reader<2;reader++){RELATION_ACTOR=reader===0?'A':'B';relationFinalObservationSingle(name+'/reader-'+RELATION_ACTOR,store&&reader===1);}
 RELATION_ACTOR=previous;
}

function relationNegativeChecks(){
 var plan=RELATION_PLAN;
 for(var n=0;n<plan.negative_cases.length;n++){RELATION_ACTOR=n%2===0?'A':'B';var test=plan.negative_cases[n],label=plan.negative_target,body=JSON.parse(JSON.stringify(getModelEntity(label).expected));body[test.field]=test.value;var name=plan.case_id+'/negative/'+test.rule_id;
 var source="var code=Number(response.code);var pass=[401,403,429].indexOf(code)>=0?null:code>=400&&code<500;pvg.rtv.set('NEGATIVE_VERDICT',pass===null?'UNKNOWN':pass?'PASS':'FAIL');bp.log.info('NEGATIVE_CHECK '+JSON.stringify({name:"+JSON.stringify(name)+",kind:'schema_type',rule_id:"+JSON.stringify(test.rule_id)+",contract_pointer:"+JSON.stringify(plan.relation_spec.negative_field_pointer)+",input:"+JSON.stringify(body)+",status:code,pass:pass}));";
 requestRest(RELATION_SPEC.target_update_method,relationRoute(TARGET_DETAIL,TARGET_PARAMETER,label),body,ALL_CODES,{action:'negative_owned_label_update'},callbackFromSource(source));
 relationFinalObservation(name+'/unchanged',false);
 requestRest('GET','/__checkpoint/ping',undefined,[200],{action:'negative_complete'},callbackFromSource("if(pvg.rtv.get('NEGATIVE_VERDICT')==='FAIL')pvg.fail('Contract string type was not rejected');"));
 }
}

function relationCheckpointExport(resources){
 var body={resources:resources,cursor:RELATION_PLAN,relations:[]};
 var source="var body="+JSON.stringify(body)+";body.bindings={};body.resources.forEach(function(r){var key=r.logicalId.replace(/[^A-Za-z0-9_]/g,'_');['ID_','ROUTE_','SNAPSHOT_'].forEach(function(prefix){var name=prefix+key;var v=pvg.rtv.get(name);if(v===undefined||v===null)pvg.fail('Missing checkpoint binding');body.bindings[name]=v;});});pvg.rtv.set('RELATION_EXPORT',JSON.stringify(body));";
 requestRest('GET','/__checkpoint/ping',undefined,[200],{action:'checkpoint_prepare'},callbackFromSource(source));
 requestRest('POST','/__checkpoint/save','@{RELATION_EXPORT}',[200],{action:'checkpoint_save'},callbackFromSource("bp.log.info('RELATION_CHECKPOINT_SAVED');"));
}
function relationRestoreBindings(){requestRest('GET','/__checkpoint/resume',undefined,[200],{action:'checkpoint_restore'},callbackFromSource("var c=JSON.parse(response.body);Object.keys(c.bindings).forEach(function(k){pvg.rtv.set(k,c.bindings[k]);});"));}
'''.replace('RELATION_SPEC',j(spec)).replace('RELATION_PLAN',j(plan)).replace('TASK_DETAIL',j(child['detail'])).replace('TASK_PARAMETER',j(child['parameter'])).replace('TARGET_DETAIL',j(target['detail'])).replace('TARGET_PARAMETER',j(target['parameter'])).replace('ALL_CODES',j(list(range(200,600))))
 dal=r'''
ctx.registerEffect('RelationWriteCompleted',function(data){
 if(ctx.runQuery('Relation.All').some(function(x){return x.id===data.id;}))ctx.removeEntity(data.id);
 if(data.action==='update_target'){var r=getModelEntity(data.label);var expected=JSON.parse(JSON.stringify(r.expected));Object.keys(data.update).forEach(function(k){expected[k]=data.update[k];});ctx.removeEntity(r.id);ctx.insertEntity(ctx.Entity(r.id,'resource',{resourceType:r.resourceType,expected:expected,revision:r.revision,verifiedRevision:r.verifiedRevision}));}
 var state=JSON.parse(JSON.stringify(data));delete state.id;delete state.type;state.pending=true;ctx.insertEntity(ctx.Entity(data.id,'relation',state));
});
ctx.registerQuery('Relation.All',function(e){return e.type==='relation';});
ctx.registerQuery('Relation.Pending',function(e){return e.type==='relation'&&e.pending;});
ctx.registerEffect('RelationVerified',function(data){var x=ctx.runQuery('Relation.All').filter(function(r){return r.id===data.id;})[0];ctx.removeEntity(x.id);if(x.action==='delete_target')ctx.removeEntity(x.label);if(x.action==='delete_child')ctx.removeEntity(x.task);var state=JSON.parse(JSON.stringify(x));delete state.id;delete state.type;state.pending=false;ctx.insertEntity(ctx.Entity(x.id,'relation',state));});
ctx.registerEffect('RelationRestoreContext',function(data){data.resources.forEach(function(r){ctx.insertEntity(ctx.Entity(r.logicalId,'resource',{resourceType:r.resourceType,expected:r.expected,revision:r.revision,verifiedRevision:0}));});data.relations.forEach(function(r){ctx.insertEntity(ctx.Entity(r.id,'relation',r));});});
'''
 stories=r'''
ctx.bthread('independent relation verifier','Relation.Pending',function(pending){verifyRelation(pending);request(bp.Event('RelationVerified',{id:pending.id}));});
'''
 if plan['mode']=='resume':
  if len(plan.get('resources',[]))!=count:raise ValueError('Incomplete relation checkpoint model')
  stories+='bthread("restore relation Context",function(){relationRestoreBindings();request(bp.Event("RelationRestoreContext",'+j({'resources':plan['resources'],'relations':plan.get('relations',[])})+'));});\n'
 stories+=r'''
bthread('relation lifecycle coordinator',function(){
 var all;
 while(true){all=ctx.runQuery('Resource.All');if(all.length===COUNT&&all.every(function(r){return r.revision===2&&r.verifiedRevision===2;})&&ctx.runQuery('WriteLock.All').length===0&&ctx.runQuery('Negative.Pending').length===0)break;waitFor(bp.all);}
 var routes=ROUTES;
 var resources=all.map(function(r){return {logicalId:r.id,resourceType:r.resourceType,expected:r.expected,revision:r.revision,verifiedRevision:r.verifiedRevision,detail_template:routes[r.resourceType].path,route_parameter:routes[r.resourceType].parameter};}).sort(function(a,b){return a.logicalId<b.logicalId?-1:1;});
 bp.log.info('RELATION_CONTEXT '+JSON.stringify(resources));
 CHECKPOINT
 var steps=PLAN_STEPS;
 for(var stepIndex=0;stepIndex<steps.length;stepIndex++){RELATION_ACTOR=stepIndex%2===0?'A':'B';var step=steps[stepIndex];var data=JSON.parse(JSON.stringify(step));data.id=CASE_ID;data.step_index=stepIndex+1;data.check_id=CASE_ID+'/step-'+data.step_index;relationMutation(data);request(bp.Event('RelationWriteCompleted',data));waitFor(bp.EventSet('relation step verified',function(e){return e.name==='RelationVerified'&&e.data.id===CASE_ID;}));}

 relationFinalObservation(CASE_ID+'/final',true);
 relationNegativeChecks();
 bp.log.info('RELATION_CASE_COMPLETED '+CASE_ID);
});
'''.replace('PLAN_STEPS',j(plan['steps'])).replace('COUNT',str(count)).replace('ROUTES',j({e['name']:{'path':e['detail'],'parameter':e['parameter']} for e in entities})).replace('CHECKPOINT',"relationCheckpointExport(resources);" if plan['mode']=='bootstrap' else "requestRest('GET','/__checkpoint/verify',undefined,[200],{action:'checkpoint_gate'},callbackFromSource(\"bp.log.info('RELATION_GATE_VERIFIED');\"));").replace('CASE_ID',j(plan['case_id'])).replace('SUBJECTS',j(subjects))
 return iface,dal,stories
