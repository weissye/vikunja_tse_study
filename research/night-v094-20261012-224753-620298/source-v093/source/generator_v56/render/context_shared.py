"""Shared authorized task updates rendered within original Context generator."""
import json

def render_shared(entities,instances,plan):
 j=lambda x:json.dumps(x,separators=(',',':'))
 if plan['mode']!='resume' or len(plan['resources'])!=len(entities)*instances:raise ValueError('Shared task model requires complete prepared checkpoint')
 observed=[r for r in plan['resources'] if r['resourceType'] in (plan['relation_spec']['child_type'],plan['relation_spec']['parent_type'])]
 if len(observed)!=4:raise ValueError('Exactly two projects and two tasks required')
 iface=r'''
var SHARED_PLAN=PLAN_JSON;
function sharedRestore(){requestRest('GET','/__checkpoint/resume',undefined,[200],{action:'shared_restore'},callbackFromSource("var c=JSON.parse(response.body);Object.keys(c.bindings).forEach(function(k){pvg.rtv.set(k,c.bindings[k]);});"));}
function sharedRoute(logical){var r=SHARED_PLAN.resources.filter(function(x){return x.logicalId===logical;})[0];return r.detail_template.replace('{'+r.route_parameter+'}','@{ROUTE_'+logical.replace(/[^A-Za-z0-9_]/g,'_')+'}');}
function sharedCheck(name,expected,kind,codes,key){
 var source="var wanted="+JSON.stringify(expected)+";function resolve(v){if(typeof v==='string'&&/^@\\{[A-Za-z0-9_]+\\}$/.test(v))return pvg.rtv.get(v.slice(2,-1));if(v&&typeof v==='object'){var o={};Object.keys(v).forEach(function(k){o[k]=resolve(v[k]);});return o;}return v;}wanted=resolve(wanted);var actual;try{actual=JSON.parse(response.body);}catch(e){actual=null;}var code=Number(response.code);var passed=";
 if(kind==='write')source+=JSON.stringify(codes)+".indexOf(code)>=0;";
 else source+="code===200&&actual&&Object.keys(wanted).every(function(k){return actual[k]===wanted[k];});";
 if(key)source+="var projection={};Object.keys(wanted).sort().forEach(function(k){projection[k]=actual?actual[k]:null;});pvg.rtv.set("+JSON.stringify(key)+",JSON.stringify(projection));";
 source+="bp.log.info('RELATION_CHECK '+JSON.stringify({name:"+JSON.stringify(name)+",kind:"+JSON.stringify(kind)+",status:code,expected:wanted,observed:actual,pass:!!passed}));if(!passed)pvg.fail('Shared task consistency check failed');";
 return callbackFromSource(source);
}
function sharedObserve(name,store){
 var previous=RELATION_ACTOR,observed=OBSERVED_JSON,keys=[];
 for(var reader=0;reader<2;reader++){RELATION_ACTOR=reader?'B':'A';for(var i=0;i<observed.length;i++){var logical=observed[i].logicalId,key='SHARED_'+RELATION_ACTOR+'_'+logical;keys.push(key);requestRest('GET',sharedRoute(logical),undefined,ALL_CODES,{action:'shared_independent_read',logicalId:logical},sharedCheck(name+'/reader-'+RELATION_ACTOR+'/'+logical,getModelEntity(logical).expected,'projection',[],store?key:null));}}
 sharedProjectCollections(name,store,keys);
 sharedLabelCollections(name,store,keys);
 if(store)requestRest('GET','/__checkpoint/ping',undefined,[200],{action:'shared_final_capture'},callbackFromSource("var keys="+JSON.stringify(keys)+";var final={};keys.forEach(function(k){final[k]=JSON.parse(pvg.rtv.get(k));});bp.log.info('RELATION_FINAL '+JSON.stringify(final));"));
 RELATION_ACTOR=previous;
}

function sharedProjectCollections(name,store,keys){
 var all=SHARED_PLAN.resources,projects=all.filter(function(r){return r.resourceType===SHARED_PLAN.relation_spec.parent_type;}),tasks=all.filter(function(r){return r.resourceType===SHARED_PLAN.relation_spec.child_type;});
 for(var reader=0;reader<2;reader++){RELATION_ACTOR=reader?'B':'A';for(var i=0;i<projects.length;i++){
  var project=projects[i].logicalId,expected={project:'@{ID_'+project+'}',tasks:tasks.map(function(t){return {id:'@{ID_'+t.logicalId+'}',project:getModelEntity(t.logicalId).expected[SHARED_PLAN.relation_spec.parent_field]};})},key='MEMBERSHIP_'+RELATION_ACTOR+'_'+project;keys.push(key);
  var source="var expected="+JSON.stringify(expected)+";function resolve(v){if(typeof v==='string'&&/^@\\{[A-Za-z0-9_]+\\}$/.test(v))return pvg.rtv.get(v.slice(2,-1));if(Array.isArray(v))return v.map(resolve);if(v&&typeof v==='object'){var o={};Object.keys(v).forEach(function(k){o[k]=resolve(v[k]);});return o;}return v;}expected=resolve(expected);var actual=JSON.parse(response.body),passed=null;var wanted=expected.tasks.filter(function(t){return String(t.project)===String(expected.project);}).map(function(t){return String(t.id);}).sort();var observed=null;if(Number(response.code)===200&&actual.complete===true){var scope=expected.tasks.map(function(t){return String(t.id);});observed=actual.ids.map(String).filter(function(id){return scope.indexOf(id)>=0;}).sort();passed=JSON.stringify(wanted)===JSON.stringify(observed);}"
  if(store)source+="pvg.rtv.set("+JSON.stringify(key)+",JSON.stringify({complete:actual.complete===true,ids:observed}));";
  source+="bp.log.info('RELATION_CHECK '+JSON.stringify({name:"+JSON.stringify(name+'/reader-'+RELATION_ACTOR+'/'+project+'/collection')+",kind:'project_membership',status:Number(response.code),expected:wanted,observed:observed,observer_complete:actual.complete===true,observer_reason:actual.reason||null,view_id:actual.view_id||null,view_kind:actual.view_kind||null,pass:passed}));if(passed===false)pvg.fail('Project task membership differs');";
  requestRest('GET','/__checkpoint/project-tasks?project=@{ID_'+project+'}',undefined,ALL_CODES,{action:'independent_project_task_collection'},callbackFromSource(source));
 }}
}


function sharedLabelRoute(task){return SHARED_PLAN.relation_spec.collection.replace('{'+SHARED_PLAN.relation_spec.child_parameter+'}','@{ID_'+task+'}');}
function sharedLabelPrefix(){
 var tasks=SHARED_PLAN.resources.filter(function(r){return r.resourceType===SHARED_PLAN.relation_spec.child_type;}),labels=SHARED_PLAN.resources.filter(function(r){return r.resourceType===SHARED_PLAN.relation_spec.target_type;});
 RELATION_ACTOR=SHARED_PLAN.prefix_actor||'A';
 for(var i=0;i<tasks.length;i++)for(var j=0;j<labels.length;j++){
  var body={};body[SHARED_PLAN.relation_spec.body_field]='@{ID_'+labels[j].logicalId+'}';
  requestRest(SHARED_PLAN.relation_spec.attach_method,sharedLabelRoute(tasks[i].logicalId),body,ALL_CODES,{action:'prepare_task_label'},sharedCheck(SHARED_PLAN.case_id+'/prefix/'+tasks[i].logicalId+'/'+labels[j].logicalId,{},'write',SHARED_PLAN.relation_spec.attach_codes));
  request(bp.Event('SharedLabelAttached',{task:tasks[i].logicalId,label:labels[j].logicalId}));
 }
 sharedObserve(SHARED_PLAN.case_id+'/linked-prefix',false);
}
function sharedLabelCollections(name,store,keys){
 var tasks=SHARED_PLAN.resources.filter(function(r){return r.resourceType===SHARED_PLAN.relation_spec.child_type;});
 for(var reader=0;reader<2;reader++){RELATION_ACTOR=reader?'B':'A';for(var i=0;i<tasks.length;i++){
  var task=tasks[i].logicalId,expected=ctx.runQuery('Shared.LabelLinks').filter(function(e){return e.task===task;}).map(function(e){return '@{ID_'+e.label+'}';}),key='TASK_LABELS_'+RELATION_ACTOR+'_'+task;keys.push(key);
  var source="var expected="+JSON.stringify(expected)+";var wanted=expected.map(function(v){return String(pvg.rtv.get(v.slice(2,-1)));}).sort(),actual=JSON.parse(response.body),observed=null,passed=null;if(Number(response.code)===200&&actual.complete===true){observed=actual.ids.map(String).sort();passed=JSON.stringify(wanted)===JSON.stringify(observed);}"
  if(store)source+="pvg.rtv.set("+JSON.stringify(key)+",JSON.stringify({complete:actual.complete===true,ids:observed}));";
  source+="bp.log.info('RELATION_CHECK '+JSON.stringify({name:"+JSON.stringify(name+'/reader-'+RELATION_ACTOR+'/'+task+'/labels')+",kind:'task_label_membership',status:Number(response.code),expected:wanted,observed:observed,observer_complete:actual.complete===true,observer_reason:actual.reason||null,pass:passed}));if(passed===false)pvg.fail('Task label membership changed');";
  requestRest('GET','/__checkpoint/task-labels?task=@{ID_'+task+'}',undefined,ALL_CODES,{action:'independent_task_label_collection'},callbackFromSource(source));
 }}
}

function sharedMutation(step,name){RELATION_ACTOR=step.actor;if(step.action){var spec=SHARED_PLAN.relation_spec,body=undefined,path=sharedLabelRoute(step.task),method=spec.detach_method,codes=spec.detach_codes;if(step.action==='attach'){body={};body[spec.body_field]='@{ID_'+step.label+'}';method=spec.attach_method;codes=spec.attach_codes;}else if(step.action==='detach'){path=spec.remove.replace('{'+spec.child_parameter+'}','@{ID_'+step.task+'}').replace('{'+spec.target_parameter+'}','@{ID_'+step.label+'}');}else throw new Error('Unknown relation action');requestRest(method,path,body,ALL_CODES,{action:'shared_cross_user_label_'+step.action,logicalId:step.task},sharedCheck(name+'/write',{},'write',codes));return;}var body=JSON.parse(JSON.stringify(getModelEntity(step.task).expected));body[step.field]=step.value;requestRest(SHARED_PLAN.relation_spec.shared_task_update_method,sharedRoute(step.task),body,ALL_CODES,{action:'shared_task_update',logicalId:step.task},sharedCheck(name+'/write',{},'write',SHARED_PLAN.relation_spec.shared_task_update_codes));}
function sharedNegatives(){
 for(var i=0;i<SHARED_PLAN.negative_cases.length;i++){RELATION_ACTOR=i?'B':'A';var test=SHARED_PLAN.negative_cases[i],logical=SHARED_PLAN.negative_target,body=JSON.parse(JSON.stringify(getModelEntity(logical).expected));body[test.field]=test.value;var name=SHARED_PLAN.case_id+'/negative/'+test.rule_id;
 requestRest(SHARED_PLAN.relation_spec.shared_task_update_method,sharedRoute(logical),body,ALL_CODES,{action:'negative_authorized_task_update',logicalId:logical},callbackFromSource("var code=Number(response.code);var passed=[401,403,429].indexOf(code)>=0?null:code>=400&&code<500;pvg.rtv.set('SHARED_NEGATIVE',passed===null?'UNKNOWN':passed?'PASS':'FAIL');bp.log.info('NEGATIVE_CHECK '+JSON.stringify({name:"+JSON.stringify(name)+",kind:'schema_type',rule_id:"+JSON.stringify(test.rule_id)+",contract_pointer:"+JSON.stringify((SHARED_PLAN.relation_spec.negative_field_pointers||{})[test.field]||SHARED_PLAN.relation_spec.negative_field_pointer)+",input:"+JSON.stringify(body)+",status:code,pass:passed}));"));
 sharedObserve(name+'/unchanged',false);
 requestRest('GET','/__checkpoint/ping',undefined,[200],{action:'negative_complete'},callbackFromSource("if(pvg.rtv.get('SHARED_NEGATIVE')==='FAIL')pvg.fail('Invalid task field type not rejected');"));
 }
}
'''.replace('PLAN_JSON',j(plan)).replace('OBSERVED_JSON',j(observed)).replace('ALL_CODES',j(list(range(200,600))))
 dal=r'''
ctx.registerEffect('RelationRestoreContext',function(data){data.resources.forEach(function(r){ctx.insertEntity(ctx.Entity(r.logicalId,'resource',{resourceType:r.resourceType,expected:r.expected,revision:r.revision,verifiedRevision:0}));});});
ctx.registerQuery('Shared.LabelLinks',function(e){return e.type==='shared_label_link';});
ctx.registerEffect('SharedLabelAttached',function(data){ctx.insertEntity(ctx.Entity('label-link/'+data.task+'/'+data.label,'shared_label_link',{task:data.task,label:data.label}));});
ctx.registerQuery('Shared.All',function(e){return e.type==='shared_pending';});
ctx.registerQuery('Shared.Pending',function(e){return e.type==='shared_pending'&&e.pending;});
ctx.registerEffect('SharedWriteCompleted',function(data){if(data.action){var key='label-link/'+data.task+'/'+data.label;if(data.action==='detach')ctx.removeEntity(key);else ctx.insertEntity(ctx.Entity(key,'shared_label_link',{task:data.task,label:data.label}));var state=JSON.parse(JSON.stringify(data));delete state.id;delete state.type;state.pending=true;ctx.insertEntity(ctx.Entity(data.id,'shared_pending',state));return;}var r=getModelEntity(data.task),expected=JSON.parse(JSON.stringify(r.expected));expected[data.field]=data.value;ctx.removeEntity(r.id);ctx.insertEntity(ctx.Entity(r.id,'resource',{resourceType:r.resourceType,expected:expected,revision:r.revision,verifiedRevision:r.verifiedRevision}));var state=JSON.parse(JSON.stringify(data));delete state.id;delete state.type;state.pending=true;ctx.insertEntity(ctx.Entity(data.id,'shared_pending',state));});
ctx.registerEffect('SharedVerified',function(data){ctx.removeEntity(data.id);});
'''
 stories="bthread('restore shared Context',function(){sharedRestore();request(bp.Event('RelationRestoreContext',"+j({'resources':plan['resources']})+"));});\n"+r'''
ctx.bthread('independent shared verifier','Shared.Pending',function(pending){sharedObserve(pending.check_id,false);request(bp.Event('SharedVerified',{id:pending.id}));});
bthread('shared lifecycle coordinator',function(){
 var all;
 while(true){all=ctx.runQuery('Resource.All');if(all.length===COUNT&&all.every(function(r){return r.revision===2&&r.verifiedRevision===2;})&&ctx.runQuery('WriteLock.All').length===0)break;waitFor(bp.all);}
 var resources=all.map(function(r){var original=SHARED_PLAN.resources.filter(function(x){return x.logicalId===r.id;})[0];return {logicalId:r.id,resourceType:r.resourceType,expected:r.expected,revision:r.revision,verifiedRevision:r.verifiedRevision,detail_template:original.detail_template,route_parameter:original.route_parameter};}).sort(function(a,b){return a.logicalId<b.logicalId?-1:1;});
 bp.log.info('RELATION_CONTEXT '+JSON.stringify(resources));
 requestRest('GET','/__checkpoint/verify',undefined,[200],{action:'shared_baseline_gate'},callbackFromSource("bp.log.info('RELATION_GATE_VERIFIED');"));
 sharedLabelPrefix();
 for(var index=0;index<SHARED_PLAN.steps.length;index++){var step=JSON.parse(JSON.stringify(SHARED_PLAN.steps[index]));step.id=SHARED_PLAN.case_id+'/step-'+index;step.check_id=step.id;sharedMutation(step,step.id);request(bp.Event('SharedWriteCompleted',step));waitFor(bp.EventSet('shared step verified',function(e){return e.name==='SharedVerified'&&e.data.id===step.id;}));}
 sharedObserve(SHARED_PLAN.case_id+'/final',true);sharedNegatives();bp.log.info('RELATION_CASE_COMPLETED '+SHARED_PLAN.case_id);
});
'''.replace('COUNT',str(len(entities)*instances))
 return iface,dal,stories
