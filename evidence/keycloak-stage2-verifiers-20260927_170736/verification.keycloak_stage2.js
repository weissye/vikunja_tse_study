//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for keycloak_stage2.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":406,"contract_verifiers":406,"mutations":200,"state_verified_mutations":60,"contract_only_mutations":140,"concurrency_oracles":166};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtReadPath(value,path){var parts=String(path).split("."); for(var i=0;i<parts.length;i++){if(value===null||typeof value==="undefined"){return undefined;} value=value[parts[i]];} return value;}
function __sbtCreateEvent(operationId){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__operationId===operationId && e.data.__httpResponse); }); }
function __sbtEqual(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function __sbtNextValue(current,field){return __sbtEqual(current,field.candidate_b)?field.candidate_a:field.candidate_b;}
var __sbtControlHttpStatuses=[]; for(var __sc=100;__sc<=599;__sc++){__sbtControlHttpStatuses.push(__sc);}
bthread("sbt:resource-bridge:post__admin_realms__realm__clients__client_uuid__authz_resource_server_resource", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="post:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="post:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:post:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",{operation_id:"post:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["resource-id"]=__sbtReadPath(__created.data.__httpResponse,"_id");
  __resourceData["client-uuid"]=__created.data["client-uuid"];
  __resourceData["realm"]=__created.data["realm"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["resource-id"]!==undefined && __resourceData["resource-id"]!==null && __resourceData["realm"]!==undefined && __resourceData["realm"]!==null && __resourceData["client-uuid"]!==undefined && __resourceData["client-uuid"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Resource:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:resource:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"post:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",ready_event:"SBT:InstanceReady:resource:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:post:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",{operation_id:"post:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",valid:__valid})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__clients__client_uuid__authz_resource_server_resource__resource_id____id", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/clients/[^/]+/authz/resource\\-server/resource/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:0",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::_id",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::_id",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __bodies = [{"_id":"sbt_generated_a__id"},{"_id":"sbt_generated_b__id"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["_id","displayName","icon_uri","name","ownerManagedAccess","type","uri"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-0";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::_id"})});sync({request:Event("SBT:ConcurrencyClosed:0",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-0"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::_id"})});sync({request:Event("SBT:ConcurrencyClosed:0",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::_id",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::_id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__clients__client_uuid__authz_resource_server_resource__resource_id___displayName", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/clients/[^/]+/authz/resource\\-server/resource/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:1",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:1",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:1")});
  var __bodies = [{"displayName":"sbt_generated_a_displayName"},{"displayName":"sbt_generated_b_displayName"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["_id","displayName","icon_uri","name","ownerManagedAccess","type","uri"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-1";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:1",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName"})});sync({request:Event("SBT:ConcurrencyClosed:1",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-1"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:1",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName"})});sync({request:Event("SBT:ConcurrencyClosed:1",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-1";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__clients__client_uuid__authz_resource_server_resource__resource_id___icon_uri", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/clients/[^/]+/authz/resource\\-server/resource/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:2",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::icon_uri",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:2",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::icon_uri",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:2")});
  var __bodies = [{"icon_uri":"sbt_generated_a_icon_uri"},{"icon_uri":"sbt_generated_b_icon_uri"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["_id","displayName","icon_uri","name","ownerManagedAccess","type","uri"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-2";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:2",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::icon_uri"})});sync({request:Event("SBT:ConcurrencyClosed:2",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-2"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:2",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::icon_uri"})});sync({request:Event("SBT:ConcurrencyClosed:2",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-2";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::icon_uri",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::icon_uri",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__admin_realms__realm__clients__client_uuid__authz_resource_server_resource__resource_id___name", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/clients/[^/]+/authz/resource\\-server/resource/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:3",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::name",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:3",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::name",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:3")});
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["_id","displayName","icon_uri","name","ownerManagedAccess","type","uri"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-3";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:3",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::name"})});sync({request:Event("SBT:ConcurrencyClosed:3",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-3"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:3",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::name"})});sync({request:Event("SBT:ConcurrencyClosed:3",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-3";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::name",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__noop__concurrency__same_field__put__admin_realms__realm__clients__client_uuid__authz_resource_server_resource__resource_id___displayName", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/clients/[^/]+/authz/resource\\-server/resource/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:4",{oracle_id:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:4",{oracle_id:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:4")});
  var __bodies = [{"displayName":"sbt_generated_a_displayName"},{"displayName":"sbt_generated_b_displayName"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline||__baseline["displayName"]===undefined){sync({request:Event("SBT:ConcurrencyClosed:4",{reason:"noop-baseline-unavailable"})});return;}
  __bodies[0]["displayName"]=__baseline["displayName"];
  __bodies[1]["displayName"]=__sbtNextValue(__baseline["displayName"],{candidate_a:"sbt_generated_a_displayName",candidate_b:"sbt_generated_b_displayName"});
  if(__sbtEqual(__bodies[0]["displayName"],__bodies[1]["displayName"])){sync({request:Event("SBT:ConcurrencyClosed:4",{reason:"noop-distinct-value-unavailable"})});return;}
  var __requestFields = ["_id","displayName","icon_uri","name","ownerManagedAccess","type","uri"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-4";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); if(__i===0){var __noopRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-noop-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__noopRead=JSON.parse(r.body);}catch(e){}}}});if(!__noopRead||!__sbtEqual(__noopRead["displayName"],__baseline["displayName"])){__serialOk=false;}} }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:4",{reason:"sequential-control-failed",oracle_id:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName"})});sync({request:Event("SBT:ConcurrencyClosed:4",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-4"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __resetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-4","X-Provengo-Operation-Id":"generated-reset-4-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__resetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__resetRead||["displayName"].some(function(f){return __baseline[f]===undefined||__resetRead[f]===undefined||!__sbtEqual(__resetRead[f],__baseline[f]);})){__serialOk=false;}
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:4",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName"})});sync({request:Event("SBT:ConcurrencyClosed:4",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-4";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::noop::concurrency::same-field::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}::displayName",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint_put__put__admin_realms__realm__clients__client_uuid__authz_resource_server_resource__resource_id_", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/admin/realms/[^/]+/clients/[^/]+/authz/resource\\-server/resource/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:5",{oracle_id:"concurrency::disjoint-put::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:5",{oracle_id:"concurrency::disjoint-put::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:5")});
  var __bodies = [{"displayName":"sbt_generated_a_displayName"},{"icon_uri":"sbt_generated_b_icon_uri"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["_id","displayName","icon_uri","name","ownerManagedAccess","type","uri"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-5";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:5",{reason:"sequential-control-failed",oracle_id:"concurrency::disjoint-put::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}"})});sync({request:Event("SBT:ConcurrencyClosed:5",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-5"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __resetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-5","X-Provengo-Operation-Id":"generated-reset-5-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__resetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__resetRead||["displayName","icon_uri"].some(function(f){return __baseline[f]===undefined||__resetRead[f]===undefined||!__sbtEqual(__resetRead[f],__baseline[f]);})){__serialOk=false;}
  var __reverseEpoch = "generated-reverse-control-5";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.put(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-5"; svc.put(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([204].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __reverseResetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-reverse-5","X-Provengo-Operation-Id":"generated-reset-reverse-5-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__reverseResetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__reverseResetRead||["displayName","icon_uri"].some(function(f){return __baseline[f]===undefined||__reverseResetRead[f]===undefined||!__sbtEqual(__reverseResetRead[f],__baseline[f]);})){__serialOk=false;}
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:5",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::disjoint-put::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}"})});sync({request:Event("SBT:ConcurrencyClosed:5",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-5";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint-put::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::disjoint-put::put:/admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}",path:__path})});
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
function __sbtNamedEvent(__name){ return EventSet("SBT named event "+__name,function(e){return !!(e&&e.name===__name);}); }
function __sbtAnyConcurrencyReady(){ return EventSet("SBT any concurrency ready",function(e){return !!(e&&e.name&&e.name.indexOf("SBT:ConcurrencyReady:")===0);}); }
function __sbtAnyHttpDelete(){ return EventSet("SBT any HTTP DELETE",function(e){return !!(e&&e.name==="DELETE");}); }
function __sbtConcurrencyBusyBlock(){ return EventSet("SBT concurrency admission or cleanup",function(e){return !!(e&&e.name&&(e.name==="DELETE"||e.name.indexOf("SBT:ConcurrencyReady:")===0));}); }
bthread("sbt:concurrency-controller",function(){
  var __readySeen={}; var __readyCount=0; var __readyTotal=6;
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
