"""Generic session metadata and independent shared-resource workflow templates."""
import json,re

def render_sessions(interface,stories,entities,plans,cfg):
    workflows=cfg['actors']['shared_workflows']; by_name={e['name']:e for e in entities}
    if not isinstance(workflows,list) or not workflows:raise ValueError('Explicit shared workflows required')
    selected=[];seen=set()
    for w in workflows:
        if set(w)!={'entity','session','field'} or w['session'] not in ('A','B'):raise ValueError('Invalid workflow configuration')
        e=by_name.get(w['entity'])
        if not e or not e['change_field'] or w['field'] not in e['update_fields']:raise ValueError('Unsupported workflow field')
        prop=e['update_schema']['properties'][w['field']]
        if prop.get('type')!='string' or prop.get('format') or prop.get('readOnly'):raise ValueError('Workflow requires a plain writable string')
        key=(w['entity'],w['session'])
        if key in seen:raise ValueError('Duplicate entity/session workflow')
        seen.add(key);selected.append((w,e))
    # The same resource model and RTV identities are retained across both sessions.
    for e in entities:
        for verb in ('update','verify'):
            pattern=r'(function '+verb+re.escape(e['name'])+r'\(resource)(, delta)?(\) \{)(.*?)(\n\})'
            def patch(m):
                body=m.group(4)
                body=re.sub(r'(\{action:"(?:prepare|update|read)",)',r'\1session:session||"A",',body)
                body=body.replace('{logicalId:resource.id,owner:owner,revision:', '{logicalId:resource.id,session:session||"A",owner:owner,revision:')
                return m.group(1)+(m.group(2) or '')+', session'+m.group(3)+body+m.group(5)
            interface=re.sub(pattern,patch,interface,flags=re.S)
    interface=interface.replace('if(semantic)semantic.actor=RELATION_ACTOR;', 'if(semantic){semantic.session=semantic.session||((semantic.caseId&&/_[0-9]+$/.test(semantic.caseId))?(Number(semantic.caseId.match(/_([0-9]+)$/)[1])%2===0?"A":"B"):"A");semantic.actor=semantic.session;}')
    interface=interface.replace('actor:RELATION_ACTOR}', 'actor:semantic.session}')
    interface=interface.replace('h["X-SBT-Action"]=semantic.action;', 'h["X-SBT-Session"]=semantic.session||"A";h["X-SBT-Action"]=semantic.action;')
    report=[]
    for w,e in selected:
        for binding in plans[e['name']]:
            logical=binding['id'];case='SESSION_'+w['session']+'_'+logical
            delta={w['field']:'sbt-session-'+w['session']+'-'+logical+'-'+w['field']}
            report.append(dict(case_id=case,logical_id=logical,entity=e['name'],session=w['session'],field=w['field'],delta=delta))
            stories+='\nbthread('+json.dumps(case)+',function(){\n'
            stories+='    waitFor(matchesVerified('+json.dumps(logical)+',2));\n'
            stories+='    request(bp.Event("SharedAcquire",{logicalId:'+json.dumps(logical)+',session:'+json.dumps(w['session'])+'}));\n'
            stories+='    var resource=getModelEntity('+json.dumps(logical)+');var revision=resource.revision+1;\n'
            stories+='    update'+e['name']+'(resource,'+json.dumps(delta)+','+json.dumps(w['session'])+');\n'
            stories+='    waitFor(matchesVerified('+json.dumps(logical)+',revision));\n'
            stories+='    verify'+e['name']+'(getModelEntity('+json.dumps(logical)+'),"A");\n'
            stories+='    verify'+e['name']+'(getModelEntity('+json.dumps(logical)+'),"B");\n'
            stories+='    bp.log.info("SHARED_SESSION_CHECK "+JSON.stringify({caseId:'+json.dumps(case)+',logicalId:'+json.dumps(logical)+',writer:'+json.dumps(w['session'])+',revision:revision,readers:["A","B"],pass:true}));\n'
            stories+='    request(bp.Event("SharedRelease",{logicalId:'+json.dumps(logical)+',session:'+json.dumps(w['session'])+'}));\n});\n'
    # Acquire only around a write's prepare/update/readback. Provengo chooses all
    # inter-workflow orderings; locks prevent harness-generated stale snapshots.
    stories+='''
bthread("shared session observation windows",function(){
 var locks={},positive={},negative={};
 while(true){
  var event=sync({waitFor:bp.all,block:bp.EventSet("shared session conflicts",function(e){
   var d=e.data||{},m=d.model;
   if(e.name==="SharedAcquire")return !!locks[d.logicalId]||!!positive[d.logicalId]||!!negative[d.logicalId];
   if(e.name==="NegativeAcquire")return !!locks[d.logicalId];
   if(e.name==="ModelWriteBegin")return !!locks[d.logicalId]&&locks[d.logicalId]!==d.session;
   if(!m||["create","update","delete","negative_attempt"].indexOf(m.action)<0)return false;
   var ids=(m.affected||[]).slice();if(m.logicalId)ids.push(m.logicalId);
   return ids.some(function(id){return !!locks[id]&&locks[id]!==m.session;});
  })});
  var d=event.data||{};
  if(event.name==="SharedAcquire")locks[d.logicalId]=d.session;
  if(event.name==="SharedRelease"&&locks[d.logicalId]===d.session)delete locks[d.logicalId];
  if(event.name==="ModelWriteBegin")positive[d.logicalId]=d.revision;
  if(event.name==="ModelVerified"&&positive[d.logicalId]===d.revision)delete positive[d.logicalId];
  if(event.name==="NegativeAcquire")negative[d.logicalId]=d.caseId;
  if(event.name==="NegativeRelease"&&negative[d.logicalId]===d.caseId)delete negative[d.logicalId];
 }
});
'''
    return interface,stories,report
