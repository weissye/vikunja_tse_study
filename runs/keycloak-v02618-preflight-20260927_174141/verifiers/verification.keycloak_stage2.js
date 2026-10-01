//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for keycloak_stage2.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":406,"contract_verifiers":406,"mutations":200,"state_verified_mutations":60,"contract_only_mutations":140,"concurrency_oracles":18};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtReadPath(value,path){var parts=String(path).split("."); for(var i=0;i<parts.length;i++){if(value===null||typeof value==="undefined"){return undefined;} value=value[parts[i]];} return value;}
function __sbtSameOperation(a,b){ if(a===b){return true;} var x=String(a).split(":"),y=String(b).split(":");return x.length>1&&y.length>1&&x[0].toLowerCase()===y[0].toLowerCase()&&x.slice(1).join(":")===y.slice(1).join(":"); }
function __sbtCreateEvent(operationId){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && __sbtSameOperation(e.data.__operationId,operationId) && e.data.__httpResponse); }); }
function __sbtEqual(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function __sbtNextValue(current,field){return __sbtEqual(current,field.candidate_b)?field.candidate_a:field.candidate_b;}
var __sbtControlHttpStatuses=[]; for(var __sc=100;__sc<=599;__sc++){__sbtControlHttpStatuses.push(__sc);}
bthread("sbt:resource-bridge-guard:post__admin_realms__realm__users", function(){
  sync({waitFor:Event("SBT:ResourceBridgeFinished:post:/admin/realms/{realm}/users"),block:Event("SBT:InstanceUnavailable:users:1")});
});
bthread("sbt:resource-bridge:post__admin_realms__realm__users", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && __sbtSameOperation(e.data.__operationId,"post:/admin/realms/{realm}/users")) || (e.name==="SBT:OperationOutcome" && __sbtSameOperation(e.data.operation_id,"post:/admin/realms/{realm}/users"))));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:post:/admin/realms/{realm}/users",{operation_id:"post:/admin/realms/{realm}/users",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["user-id"]=__sbtReadPath(__created.data.__httpResponse,"__sbtObservedLocationId");
  __resourceData["realm"]=__created.data["realm"];
  var __concrete="/admin/realms/{realm}/users/{user-id}";
  __concrete=__concrete.replace("{realm}",encodeURIComponent(String(__resourceData["realm"])));
  __concrete=__concrete.replace("{user-id}",encodeURIComponent(String(__resourceData["user-id"])));
  var __observed=__created.data.__httpResponse;
  var __empiricalReady=!!(__observed && __observed.__sbtObservedLocationPath===__concrete && __concrete.indexOf("{")<0);
  if(__empiricalReady){
    __empiricalReady=false;
    svc.get(__concrete,{expectedResponseCodes:[200,400,401,403,404],callback:function(r){
      if(r.code!==200){return;}
      try{var __item=JSON.parse(r.body);
        __empiricalReady=String(__item["id"])===String(__observed.__sbtObservedLocationId);
      }catch(__e){__empiricalReady=false;}
    }});
  }
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __empiricalReady && __resourceData["user-id"]!==undefined && __resourceData["user-id"]!==null && __resourceData["realm"]!==undefined && __resourceData["realm"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Users:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:users:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"post:/admin/realms/{realm}/users",ready_event:"SBT:InstanceReady:users:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:post:/admin/realms/{realm}/users",{operation_id:"post:/admin/realms/{realm}/users",valid:__valid})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___createdTimestamp", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:0",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::createdTimestamp",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::createdTimestamp",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __bodies = [{"createdTimestamp":1},{"createdTimestamp":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-0";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::createdTimestamp"})});sync({request:Event("SBT:ConcurrencyClosed:0",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-0"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::createdTimestamp"})});sync({request:Event("SBT:ConcurrencyClosed:0",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::createdTimestamp",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::createdTimestamp",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___email", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:1",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::email",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:1",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::email",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:1")});
  var __bodies = [{"email":"sbt_generated_a_email"},{"email":"sbt_generated_b_email"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-1";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:1",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::email"})});sync({request:Event("SBT:ConcurrencyClosed:1",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-1"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:1",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::email"})});sync({request:Event("SBT:ConcurrencyClosed:1",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-1";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::email",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::email",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___emailVerified", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:2",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::emailVerified",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:2",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::emailVerified",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:2")});
  var __bodies = [{"emailVerified":true},{"emailVerified":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-2";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:2",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::emailVerified"})});sync({request:Event("SBT:ConcurrencyClosed:2",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-2"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:2",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::emailVerified"})});sync({request:Event("SBT:ConcurrencyClosed:2",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-2";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::emailVerified",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::emailVerified",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___enabled", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:3",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::enabled",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:3",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::enabled",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:3")});
  var __bodies = [{"enabled":true},{"enabled":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-3";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:3",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::enabled"})});sync({request:Event("SBT:ConcurrencyClosed:3",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-3"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:3",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::enabled"})});sync({request:Event("SBT:ConcurrencyClosed:3",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-3";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::enabled",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::enabled",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___federationLink", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:4",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::federationLink",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:4",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::federationLink",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:4")});
  var __bodies = [{"federationLink":"sbt_generated_a_federationLink"},{"federationLink":"sbt_generated_b_federationLink"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-4";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:4",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::federationLink"})});sync({request:Event("SBT:ConcurrencyClosed:4",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-4"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:4",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::federationLink"})});sync({request:Event("SBT:ConcurrencyClosed:4",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-4";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::federationLink",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::federationLink",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___firstName", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:5",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:5",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:5")});
  var __bodies = [{"firstName":"sbt_generated_a_firstName"},{"firstName":"sbt_generated_b_firstName"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-5";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:5",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName"})});sync({request:Event("SBT:ConcurrencyClosed:5",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-5"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:5",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName"})});sync({request:Event("SBT:ConcurrencyClosed:5",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-5";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___id", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:6",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::id",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:6",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::id",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:6")});
  var __bodies = [{"id":"sbt_generated_a_id"},{"id":"sbt_generated_b_id"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-6";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:6",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::id"})});sync({request:Event("SBT:ConcurrencyClosed:6",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-6"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:6",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::id"})});sync({request:Event("SBT:ConcurrencyClosed:6",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-6";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::id",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___lastName", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:7",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::lastName",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:7",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::lastName",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:7")});
  var __bodies = [{"lastName":"sbt_generated_a_lastName"},{"lastName":"sbt_generated_b_lastName"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-7";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:7",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::lastName"})});sync({request:Event("SBT:ConcurrencyClosed:7",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-7"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:7",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::lastName"})});sync({request:Event("SBT:ConcurrencyClosed:7",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-7";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::lastName",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::lastName",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___notBefore", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:8",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::notBefore",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:8",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::notBefore",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:8")});
  var __bodies = [{"notBefore":1},{"notBefore":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-8";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:8",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::notBefore"})});sync({request:Event("SBT:ConcurrencyClosed:8",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-8"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:8",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::notBefore"})});sync({request:Event("SBT:ConcurrencyClosed:8",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-8";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::notBefore",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::notBefore",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___origin", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:9",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::origin",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:9",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::origin",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:9")});
  var __bodies = [{"origin":"sbt_generated_a_origin"},{"origin":"sbt_generated_b_origin"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-9";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:9",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::origin"})});sync({request:Event("SBT:ConcurrencyClosed:9",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-9"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:9",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::origin"})});sync({request:Event("SBT:ConcurrencyClosed:9",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-9";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::origin",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::origin",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___self", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:10",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::self",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:10",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::self",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:10")});
  var __bodies = [{"self":"sbt_generated_a_self"},{"self":"sbt_generated_b_self"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-10";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:10",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::self"})});sync({request:Event("SBT:ConcurrencyClosed:10",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-10"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:10",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::self"})});sync({request:Event("SBT:ConcurrencyClosed:10",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-10";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::self",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::self",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___serviceAccountClientId", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:11",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::serviceAccountClientId",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:11",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::serviceAccountClientId",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:11")});
  var __bodies = [{"serviceAccountClientId":"sbt_generated_a_serviceAccountClientId"},{"serviceAccountClientId":"sbt_generated_b_serviceAccountClientId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-11";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:11",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::serviceAccountClientId"})});sync({request:Event("SBT:ConcurrencyClosed:11",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-11"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:11",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::serviceAccountClientId"})});sync({request:Event("SBT:ConcurrencyClosed:11",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-11";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::serviceAccountClientId",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:11",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::serviceAccountClientId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___totp", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:12",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::totp",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:12",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::totp",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:12")});
  var __bodies = [{"totp":true},{"totp":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-12";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:12",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::totp"})});sync({request:Event("SBT:ConcurrencyClosed:12",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-12"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:12",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::totp"})});sync({request:Event("SBT:ConcurrencyClosed:12",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-12";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::totp",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:12",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::totp",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__users__user_id___username", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:13",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::username",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:13",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::username",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:13")});
  var __bodies = [{"username":"sbt_generated_a_username"},{"username":"sbt_generated_b_username"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-13";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:13",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::username"})});sync({request:Event("SBT:ConcurrencyClosed:13",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-13"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:13",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::username"})});sync({request:Event("SBT:ConcurrencyClosed:13",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-13";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::username",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:13",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::username",path:__path})});
});
bthread("sbt:concurrency:concurrency__noop__concurrency__same_field__put__admin_realms__realm__users__user_id___firstName", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:14",{oracle_id:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:14",{oracle_id:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:14")});
  var __bodies = [{"firstName":"sbt_generated_a_firstName"},{"firstName":"sbt_generated_b_firstName"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline||__baseline["firstName"]===undefined){sync({request:Event("SBT:ConcurrencyClosed:14",{reason:"noop-baseline-unavailable"})});return;}
  __bodies[0]["firstName"]=__baseline["firstName"];
  __bodies[1]["firstName"]=__sbtNextValue(__baseline["firstName"],{candidate_a:"sbt_generated_a_firstName",candidate_b:"sbt_generated_b_firstName"});
  if(__sbtEqual(__bodies[0]["firstName"],__bodies[1]["firstName"])){sync({request:Event("SBT:ConcurrencyClosed:14",{reason:"noop-distinct-value-unavailable"})});return;}
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-14";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); if(__i===0){var __noopRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-noop-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__noopRead=JSON.parse(r.body);}catch(e){}}}});if(!__noopRead||!__sbtEqual(__noopRead["firstName"],__baseline["firstName"])){__serialOk=false;}} }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:14",{reason:"sequential-control-failed",oracle_id:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName"})});sync({request:Event("SBT:ConcurrencyClosed:14",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-14"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __resetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-14","X-Provengo-Operation-Id":"generated-reset-14-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__resetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__resetRead||["firstName"].some(function(f){return __baseline[f]===undefined||__resetRead[f]===undefined||!__sbtEqual(__resetRead[f],__baseline[f]);})){__serialOk=false;}
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:14",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName"})});sync({request:Event("SBT:ConcurrencyClosed:14",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-14";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:14",{oracle_id:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/users/{user-id}::firstName",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint_put__put__admin_realms__realm__users__user_id_", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/users/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    __sbtSameOperation(e.data.operation_id,"put:/admin/realms/{realm}/users/{user-id}")&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:15",{oracle_id:"concurrency::disjoint-put::put:/admin/realms/{realm}/users/{user-id}",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:15",{oracle_id:"concurrency::disjoint-put::put:/admin/realms/{realm}/users/{user-id}",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:15")});
  var __bodies = [{"firstName":"sbt_generated_a_firstName"},{"lastName":"sbt_generated_b_lastName"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["createdTimestamp","email","emailVerified","enabled","federationLink","firstName","id","lastName","notBefore","origin","self","serviceAccountClientId","totp","username"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-15";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:15",{reason:"sequential-control-failed",oracle_id:"concurrency::disjoint-put::put:/admin/realms/{realm}/users/{user-id}"})});sync({request:Event("SBT:ConcurrencyClosed:15",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-15"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __resetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-15","X-Provengo-Operation-Id":"generated-reset-15-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__resetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__resetRead||["firstName","lastName"].some(function(f){return __baseline[f]===undefined||__resetRead[f]===undefined||!__sbtEqual(__resetRead[f],__baseline[f]);})){__serialOk=false;}
  var __reverseEpoch = "generated-reverse-control-15";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.put(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-15"; svc.put(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __reverseResetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-reverse-15","X-Provengo-Operation-Id":"generated-reset-reverse-15-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__reverseResetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__reverseResetRead||["firstName","lastName"].some(function(f){return __baseline[f]===undefined||__reverseResetRead[f]===undefined||!__sbtEqual(__reverseResetRead[f],__baseline[f]);})){__serialOk=false;}
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:15",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::disjoint-put::put:/admin/realms/{realm}/users/{user-id}"})});sync({request:Event("SBT:ConcurrencyClosed:15",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-15";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint-put::put:/admin/realms/{realm}/users/{user-id}",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:15",{oracle_id:"concurrency::disjoint-put::put:/admin/realms/{realm}/users/{user-id}",path:__path})});
});
bthread("sbt:prefix-isolation:0",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:0")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:0"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:1",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:1")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:1"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:2",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:2")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:2"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:3",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:3")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:3"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:4",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:4")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:4"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:5",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:5")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:5"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:6",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:6")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:6"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:7",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:7")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:7"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:8",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:8")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:8"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:9",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:9")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:9"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:10",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:10")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:10"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:11",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:11")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:11"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:12",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:12")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:12"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:13",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:13")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:13"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:14",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:14")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:14"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:15",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:15")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:15"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
function __sbtNamedEvent(__name){ return EventSet("SBT named event "+__name,function(e){return !!(e&&e.name===__name);}); }
function __sbtAnyConcurrencyReady(){ return EventSet("SBT any concurrency ready",function(e){return !!(e&&e.name&&e.name.indexOf("SBT:ConcurrencyReady:")===0);}); }
function __sbtAnyHttpDelete(){ return EventSet("SBT any HTTP DELETE",function(e){return !!(e&&e.name==="DELETE");}); }
function __sbtConcurrencyBusyBlock(){ return EventSet("SBT concurrency admission or cleanup",function(e){return !!(e&&e.name&&(e.name==="DELETE"||e.name.indexOf("SBT:ConcurrencyReady:")===0));}); }
bthread("sbt:concurrency-controller",function(){
  var __readySeen={}; var __readyCount=0; var __readyTotal=16;
  while(__readyCount<__readyTotal){
    var __readyEvent=sync({waitFor:__sbtAnyConcurrencyReady(),block:__sbtAnyHttpDelete()});
    if(__readySeen[__readyEvent.name]){continue;}
    __readySeen[__readyEvent.name]=true; __readyCount++;
    var __readyIndex=__readyEvent.name.substring("SBT:ConcurrencyReady:".length);
    sync({request:Event("SBT:ConcurrencyPermit:"+__readyIndex),block:__sbtConcurrencyBusyBlock()});
    sync({waitFor:__sbtNamedEvent("SBT:ConcurrencyClosed:"+__readyIndex),block:__sbtConcurrencyBusyBlock()});
  }
  sync({request:Event("SBT:AllGeneratedConcurrencyClosed")});
});
