"""Original Context generator's opt-in semantic checkpoint acceptance boundary."""
import json

def render_checkpoint(entities, catalog, instances, plan):
    if plan.get('family') in ('relation','shared_tasks'):
        from .context_relations import render_relations
        return render_relations(entities,instances,plan)
    j=lambda value:json.dumps(value,separators=(',',':'))
    if plan['mode'] not in ('bootstrap','resume'):raise ValueError('Unknown checkpoint phase')
    cases=[case for case in catalog['cases'] if case['id']==plan['rule_id']]
    if len(cases)!=1:raise ValueError('Checkpoint rule must resolve uniquely in contract-derived catalog')
    case=cases[0]
    entity=next(e for e in entities if e['name']==case['resource'])
    logical=plan['logical_id']
    if logical not in [e['name']+'_'+str(i) for e in entities for i in range(1,instances+1)]:raise ValueError('Unknown logical checkpoint subject')
    if not logical.startswith(entity['name']+'_'):raise ValueError('Rule/subject mismatch')
    if any(e['dependencies'] or e['nested'] for e in entities):raise ValueError('Checkpoint acceptance currently supports independent resources only')
    count=len(entities)*instances
    iface=r'''
function checkpointExport(resources){
 var body={resources:resources,cursor:CHECKPOINT_CURSOR};
 var source="var body="+JSON.stringify(body)+";body.bindings={};body.resources.forEach(function(r){var key=r.logicalId.replace(/[^A-Za-z0-9_]/g,'_');['ID_','ROUTE_','SNAPSHOT_'].forEach(function(prefix){var name=prefix+key;var value=pvg.rtv.get(name);if(value===undefined||value===null)pvg.fail('Checkpoint RTV binding missing: '+name);body.bindings[name]=value;});});pvg.rtv.set('CHECKPOINT_EXPORT_BODY',JSON.stringify(body));";
 requestRest("GET","/__checkpoint/ping",undefined,[200],{action:"checkpoint_prepare"},callbackFromSource(source));
 requestRest("POST","/__checkpoint/save","@{CHECKPOINT_EXPORT_BODY}",[200],{action:"checkpoint_save"},callbackFromSource("bp.log.info('CHECKPOINT_SAVED '+response.body);"));
}
function checkpointRestoreBindings(){
 requestRest("GET","/__checkpoint/resume",undefined,[200],{action:"checkpoint_restore_bindings"},callbackFromSource("var capsule=JSON.parse(response.body);Object.keys(capsule.bindings).forEach(function(key){pvg.rtv.set(key,capsule.bindings[key]);});bp.log.info('CHECKPOINT_BINDINGS_RESTORED');"));
}
'''.replace('CHECKPOINT_CURSOR',j(plan))
    dal=r'''
ctx.registerEffect("CheckpointRestoreContext",function(data){
 data.resources.forEach(function(r){ctx.insertEntity(ctx.Entity(r.logicalId,"resource",{resourceType:r.resourceType,expected:r.expected,revision:r.revision,verifiedRevision:0}));});
});
'''
    stories=''
    if plan['mode']=='resume':
        restored=plan.get('resources',[])
        if len(restored)!=count:raise ValueError('Resume capsule resource count mismatch')
        stories+='bthread("restore checkpoint Context",function(){checkpointRestoreBindings();request(bp.Event("CheckpointRestoreContext",{resources:'+j(restored)+'}));});\n'
    stories+=r'''
bthread("quiescent checkpoint rule coordinator",function(){
 var all=[];
 while(true){
  all=ctx.runQuery("Resource.All");
  if(all.length===RESOURCE_COUNT&&all.every(function(r){return r.revision===2&&r.verifiedRevision===r.revision;})&&ctx.runQuery("WriteLock.All").length===0&&ctx.runQuery("Negative.Pending").length===0)break;
  waitFor(bp.all);
 }
 var routes=GENERATED_ROUTES;
 var resources=all.map(function(r){return {logicalId:r.id,resourceType:r.resourceType,expected:r.expected,revision:r.revision,verifiedRevision:r.verifiedRevision,detail_template:routes[r.resourceType].path,route_parameter:routes[r.resourceType].parameter};}).sort(function(a,b){return a.logicalId<b.logicalId?-1:a.logicalId>b.logicalId?1:0;});
 bp.log.info("CHECKPOINT_CONTEXT "+JSON.stringify(resources));
 CHECKPOINT_ACTION
 attemptNegativeENTITY(getModelEntity(LOGICAL),RULE,"CHECKPOINT_RULE");
 bp.log.info("CHECKPOINT_RULE_MODEL_COMPLETED");
});
'''.replace('GENERATED_ROUTES',j({e['name']:{'path':e['detail'],'parameter':e['parameter']} for e in entities})).replace('RESOURCE_COUNT',str(count)).replace('CHECKPOINT_ACTION','checkpointExport(resources);' if plan['mode']=='bootstrap' else 'requestRest("GET","/__checkpoint/verify",undefined,[200],{action:"checkpoint_gate"},callbackFromSource("bp.log.info(\'CHECKPOINT_GATE_VERIFIED\');"));').replace('ENTITY',entity['name']).replace('LOGICAL',j(logical)).replace('RULE,',j(case)+',')
    return iface,dal,stories
