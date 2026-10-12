"""Contract-derived identical behavior templates instantiated for native sessions."""
import json,re

def fields_for(e,c):
 result=[];blocked=[]
 for f,s in e.get('update_schema',{}).get('properties',{}).items():
  s=c.resolve(s)
  reason=None
  if e.get('value_domains',{}).get(f,{}).get('kind')=='derived_observation':reason='description-derived observation; writable semantics unresolved'
  elif f not in e['update_fields'] or s.get('readOnly'):reason='not writable'
  elif f not in e.get('read_schema',{}).get('properties',{}):reason='not independently observable'
  elif s.get('type')!='string' or s.get('enum') or s.get('format') or s.get('pattern'):reason='unsupported scalar/format/domain constraint'
  elif f in ('id',e['route_field']) or re.search(r'(^created$|^updated$|_at$|_date$|_id$|_hash$)',f):reason='identity/temporal/server metadata candidate'
  if reason:blocked.append({'field':f,'reason':reason})
  else:result.append(f)
 return sorted(result),blocked

def render_sessions(interface,dal,stories,entities,plans,cfg,ir,c):
 if cfg['actors']['shared_workflows']!='derive_from_contract':raise ValueError('Manual workflows are not supported')
 auth=ir['authentication'];report=[]
 stories+='var WORKFLOW_NAMESPACE='+json.dumps(cfg['fixtures'].get('namespace','baseline'))+';\n'
 stories+='''
function workflowValue(sessionId,resourceId,spec){
 var input=WORKFLOW_NAMESPACE+"/"+sessionId+"/"+resourceId+"/"+spec.field,h=2166136261;
 for(var i=0;i<input.length;i++){h^=input.charCodeAt(i);h=(h+(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24))|0;}
 var hex=(h>>>0).toString(16);while(hex.length<8)hex="0"+hex;
 if(spec.domain==="hex_rgb")return hex.slice(0,6);
 if(spec.domain==="unique_short_identifier")return ("P"+hex).toUpperCase();
 return "sbt-"+sessionId+"-"+resourceId+"-"+spec.field;
}
''' 
 # Per-session headers resolve the corresponding runtime token at actuation.
 interface=interface.replace('if(semantic)semantic.actor=RELATION_ACTOR;', '''if(semantic){semantic.session=semantic.session||((semantic.caseId&&/^NEG_[AB]_/.test(semantic.caseId))?semantic.caseId.split("_")[1]:"A");semantic.actor=semantic.session;}''')
 interface=interface.replace('actor:RELATION_ACTOR}', 'actor:semantic.session}')
 interface=interface.replace('url: svc.baseURL + url,','url: nativeSessions[semantic.session].baseURL + url,')
 interface=interface.replace('h["X-SBT-Session"]=semantic.session||"A";', '')
 interface=interface.replace('h["X-SBT-Action"]=semantic.action;', '''h["Authorization"]="Bearer @{TOKEN_"+semantic.session+"}";h["X-SBT-Session"]=semantic.session;h["X-SBT-Action"]=semantic.action;''')
 # Native requestRest wraps transport recovery stages, not model scheduling.
 interface=interface.replace('function requestRest(method, url, body, codes, semantic, callback) {', 'function requestRestRaw(method, url, body, codes, semantic, callback) {')
 interface+='''
function awaitSession(id){while(!ctx.runQuery("Session.Ready").some(function(s){return s.sessionId===id;}))waitFor(bp.EventSet("session ready "+id,function(e){return e.name==="SessionReady"&&e.data.session===id;}));}
function awaitBothSessions(){awaitSession("A");awaitSession("B");}
function requestRest(method,url,body,codes,semantic,callback){
 var sid=semantic.session||((semantic.caseId&&/^NEG_[AB]_/.test(semantic.caseId))?semantic.caseId.split("_")[1]:"A");semantic.session=sid;awaitSession(sid);
 if(semantic.action==="negative_attempt"){
  awaitBothSessions();
  requestRestRaw("POST","/__sbt/checkpoint/"+semantic.caseId,undefined,[200],{action:"checkpoint",logicalId:semantic.logicalId,caseId:semantic.caseId,session:sid},callbackFromSource(""));
  request(bp.Event("SessionsInvalidated",{}));awaitBothSessions();
 }
 var event=requestRestRaw(method,url,body,codes,semantic,callback);
 if(semantic.action==="negative_attempt"){request(bp.Event("SessionsInvalidated",{}));awaitBothSessions();}
 return event;
}
'''
 interface+='var nativeSessions={A:new RESTSession(svc.baseURL,"session-A",{}),B:new RESTSession(svc.baseURL,"session-B",{})};\n'
 loginbody="@{JSON.stringify({username:java.lang.System.getenv('SBT_USERNAME'),password:java.lang.System.getenv('SBT_PASSWORD')})}"
 interface+='function loginSession(id){return sync({request:bp.Event("POST",{lib:"REST",method:"POST",url:nativeSessions[id].baseURL+'+json.dumps(auth['path'])+',headers:{"Content-Type":"application/json","X-SBT-Session":id,"X-SBT-Action":"authenticate"},parameters:{},body:'+json.dumps(loginbody)+',expectedResponseCodes:['+str(auth['status'])+'],model:{action:"authenticate",session:id},callback:callbackFromSource("var value=JSON.parse(response.body);if(!value.'+auth['token_field']+')pvg.fail(\'Token missing\');pvg.rtv.set("+JSON.stringify("TOKEN_"+id)+",value.'+auth['token_field']+');")})});}\n'
 dal+='''
ctx.registerQuery("Session.Ready",function(e){return e.type==="session"&&e.ready;});
ctx.registerEffect("SessionReady",function(d){var id="session_"+d.session;ctx.runQuery("Session.Ready").filter(function(s){return s.id===id;}).forEach(function(s){ctx.removeEntity(s.id);});ctx.insertEntity(ctx.Entity(id,"session",{sessionId:d.session,ready:true}));});
ctx.registerEffect("SessionsInvalidated",function(){ctx.runQuery("Session.Ready").forEach(function(s){ctx.removeEntity(s.id);});});
'''
 # Baseline creates once; no duplicated creates for the second session.
 for e in entities:
  n=e['name']
  stories=re.sub(r'    update'+re.escape(n)+r'\(getModelEntity\([^\n]+\n    waitFor\(matchesVerified\([^\n]+\n','',stories)
  for verb in ('update','verify'):
   pattern=r'(function '+verb+re.escape(n)+r'\(resource)(, delta)?(\) \{)(.*?)(\n\})'
   def patch(m):
    body=m.group(4);body=re.sub(r'(\{action:"(?:prepare|update|read)",)',r'\1session:session||"A",',body)
    # Unique write owner for each session and resource revision.
    body=body.replace('var owner=resource.id+', 'var owner=(session||"A")+"_"+resource.id+')
    body=body.replace('{logicalId:resource.id,owner:owner,revision:', '{logicalId:resource.id,session:session||"A",owner:owner,revision:')
    return m.group(1)+(m.group(2) or '')+', session'+m.group(3)+body+m.group(5)
   interface=re.sub(pattern,patch,interface,flags=re.S)
  fields,blocked=fields_for(e,c)
  # Define each behavior ONCE. Factory arguments are local closure bindings,
  # never mutable top-level loop variables shared between bthreads.
  ids=[binding['id'] for binding in plans[n]]
  specs=[{'field':f,'maxLength':c.resolve(e['update_schema']['properties'][f]).get('maxLength'),'minLength':c.resolve(e['update_schema']['properties'][f]).get('minLength',0),'domain':e.get('value_domains',{}).get(f,{}).get('kind','plain_string')} for f in fields]
  for binding in plans[n]:
   for sid in ('A','B'):
    report.append({'case_id':'WORK_'+sid+'_'+binding['id'],'logical_id':binding['id'],'session':sid,'entity':n,'fields':fields,'blocked_fields':blocked,'behavior_kind':'UPDATE_AND_READ' if fields else 'READ_ONLY'})
  stories+='\nfunction registerWork'+n+'(sessionId,resourceId,fieldSpecs){\n'
  stories+=' var caseId="WORK_"+sessionId+"_"+resourceId;\n bthread(caseId,function(){\n  awaitSession(sessionId);waitForResource(resourceId,1);\n'
  if fields:
   stories+='  fieldSpecs.forEach(function(spec){\n   request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));\n   var resource=getModelEntity(resourceId),revision=resource.revision+1;\n   var value=workflowValue(sessionId,resourceId,spec);while(value.length<spec.minLength)value+="x";if(spec.maxLength)value=value.slice(0,spec.maxLength);var delta={};delta[spec.field]=value;\n'
   stories+='   update'+n+'(resource,delta,sessionId);waitFor(matchesVerified(resourceId,revision));\n   request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));\n  });\n'
  stories+='  request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));\n  verify'+n+'(getModelEntity(resourceId),sessionId);\n  request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));\n  bp.log.info("SESSION_WORKFLOW_COMPLETE "+JSON.stringify({caseId:caseId,logicalId:resourceId,session:sessionId}));\n });\n}\n'
  stories+=json.dumps(ids)+'.forEach(function(resourceId){["A","B"].forEach(function(sessionId){registerWork'+n+'(sessionId,resourceId,'+json.dumps(specs)+');});});\n'
  # Creation is once per resource, with one reusable type-specific lifecycle.
  targets=sorted({d['target'] for d in e['dependencies']})
  life_pattern=r'bthread\("lifecycle '+re.escape(n)+r'_[^\n]+\n.*?\n\}\);'
  stories=re.sub(life_pattern,'',stories,flags=re.S)
  creation_rows=[{'id':item['id'],'bindings':item['bindings'],'body':json.loads(json.dumps(e['body']).replace('INSTANCE',str(item.get('fixture_index',1))))} for item in plans[n]]
  stories+='\nfunction registerCreation'+n+'(definition){bthread("lifecycle "+definition.id,function(){\n var parents=waitForDependencies('+json.dumps(targets)+',definition.bindings);\n create'+n+'(definition.id,definition.body,parents);\n waitFor(matchesVerified(definition.id,1));\n});}\n'
  stories+=json.dumps(creation_rows)+'.forEach(registerCreation'+n+');\n'
  # Remove individual generated negative bodies, retaining Context verifier.
  neg_pattern=r'bthread\("negative NEG_'+re.escape(n)+r'_[^\n]+\n.*?\n\}\);'
  stories=re.sub(neg_pattern,'',stories,flags=re.S)
  rules=[rule for rule in ir['negative_catalog']['cases'] if rule['resource']==n and rule['field'] in fields]
  if rules:
   stories+='\nfunction registerNegative'+n+'(sessionId,resourceId,rule,index){\n var caseId="NEG_"+sessionId+"_"+resourceId+"_"+index;\n bthread("negative "+caseId,function(){\n  awaitSession(sessionId);waitForResource(resourceId,1);\n  request(bp.Event("NegativeAcquire",{logicalId:resourceId,caseId:caseId}));\n  attemptNegative'+n+'(getModelEntity(resourceId),rule,caseId);\n  request(bp.Event("NegativeRelease",{logicalId:resourceId,caseId:caseId}));\n });\n}\n'
   stories+=json.dumps(ids)+'.forEach(function(resourceId){["A","B"].forEach(function(sessionId){'+json.dumps(rules)+'.forEach(function(rule,index){registerNegative'+n+'(sessionId,resourceId,rule,index);});});});\n'
 stories+='\nfunction registerNativeLogin(sessionId){bthread("native login "+sessionId,function(){while(true){loginSession(sessionId);request(bp.Event("SessionReady",{session:sessionId}));waitFor(bp.Event("SessionsInvalidated",{}));}});}\n["A","B"].forEach(registerNativeLogin);\n'
 stories+='''
bthread("native session readiness and restart gate",function(){
 var ready={},pending=false,windowCase=null;
 while(true){var e=sync({waitFor:bp.all,block:bp.EventSet("requires ready session",function(event){
  var m=event.data&&event.data.model;if(!m)return false;if(m.action==="authenticate")return false;
  if(pending)return true;if(windowCase)return !(ready.A&&ready.B&&m.caseId===windowCase&&(m.action==="negative_attempt"||m.action==="negative_readback"));return !ready[m.session||((m.caseId&&/^NEG_[AB]_/.test(m.caseId))?m.caseId.split("_")[1]:"A")];
 })});var d=e.data||{};
 if(e.name==="SessionsInvalidated"){ready={};pending=false;}
 if(e.name==="SessionReady")ready[d.session]=true;
 if(d.model&&d.model.action==="checkpoint"){windowCase=d.model.caseId;pending=true;}
 if(d.model&&d.model.action==="negative_attempt")pending=true;
 if(d.model&&d.model.action==="negative_readback"&&d.model.caseId===windowCase)windowCase=null;
 }
});
bthread("per-operation shared resource windows",function(){
 var locks={},positive={},negative={};
 while(true){var e=sync({waitFor:bp.all,block:bp.EventSet("operation conflicts",function(event){
  var d=event.data||{},m=d.model;
  if(event.name==="OperationAcquire")return !!locks[d.logicalId]||!!positive[d.logicalId]||!!negative[d.logicalId];
  if(event.name==="NegativeAcquire")return !!locks[d.logicalId];
  if(event.name==="ModelWriteBegin")return !!locks[d.logicalId]&&locks[d.logicalId]!==d.session;
  if(!m||["create","update","delete","negative_attempt"].indexOf(m.action)<0)return false;
  var ids=(m.affected||[]).slice();if(m.logicalId)ids.push(m.logicalId);return ids.some(function(id){return !!locks[id]&&locks[id]!==m.session;});
 })});var d=e.data||{};
 if(e.name==="OperationAcquire")locks[d.logicalId]=d.session;
 if(e.name==="OperationRelease"&&locks[d.logicalId]===d.session)delete locks[d.logicalId];
 if(e.name==="ModelWriteBegin")positive[d.logicalId]=d.revision;
 if(e.name==="ModelVerified"&&positive[d.logicalId]===d.revision)delete positive[d.logicalId];
 if(e.name==="NegativeAcquire")negative[d.logicalId]=d.caseId;
 if(e.name==="NegativeRelease"&&negative[d.logicalId]===d.caseId)delete negative[d.logicalId];
 }
});
'''
 return interface,dal,stories,report
