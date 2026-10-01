//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for mealie.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":76,"contract_verifiers":76,"mutations":48,"state_verified_mutations":24,"contract_only_mutations":24,"concurrency_oracles":61};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtReadPath(value,path){var parts=String(path).split("."); for(var i=0;i<parts.length;i++){if(value===null||typeof value==="undefined"){return undefined;} value=value[parts[i]];} return value;}
function __sbtCreateEvent(operationId){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__operationId===operationId && e.data.__httpResponse); }); }
function __sbtEqual(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function __sbtNextValue(current,field){return __sbtEqual(current,field.candidate_b)?field.candidate_a:field.candidate_b;}
var __sbtControlHttpStatuses=[]; for(var __sc=100;__sc<=599;__sc++){__sbtControlHttpStatuses.push(__sc);}
bthread("sbt:resource-bridge:create_one_api_households_mealplans_post", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="create_one_api_households_mealplans_post") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="create_one_api_households_mealplans_post")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:create_one_api_households_mealplans_post",{operation_id:"create_one_api_households_mealplans_post",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["item_id"]!==undefined && __resourceData["item_id"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Mealplans:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:mealplans:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_households_mealplans_post",ready_event:"SBT:InstanceReady:mealplans:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:create_one_api_households_mealplans_post",{operation_id:"create_one_api_households_mealplans_post",valid:__valid})});
});
bthread("sbt:resource-bridge:create_one_api_households_mealplans_rules_post", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="create_one_api_households_mealplans_rules_post") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="create_one_api_households_mealplans_rules_post")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:create_one_api_households_mealplans_rules_post",{operation_id:"create_one_api_households_mealplans_rules_post",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["item_id"]!==undefined && __resourceData["item_id"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Rules:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:rules:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_households_mealplans_rules_post",ready_event:"SBT:InstanceReady:rules:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:create_one_api_households_mealplans_rules_post",{operation_id:"create_one_api_households_mealplans_rules_post",valid:__valid})});
});
bthread("sbt:resource-bridge:create_one_api_households_shopping_lists_post", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="create_one_api_households_shopping_lists_post") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="create_one_api_households_shopping_lists_post")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:create_one_api_households_shopping_lists_post",{operation_id:"create_one_api_households_shopping_lists_post",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["item_id"]!==undefined && __resourceData["item_id"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Lists:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:lists:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_households_shopping_lists_post",ready_event:"SBT:InstanceReady:lists:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:create_one_api_households_shopping_lists_post",{operation_id:"create_one_api_households_shopping_lists_post",valid:__valid})});
});
bthread("sbt:resource-bridge:create_one_api_organizers_tools_post", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="create_one_api_organizers_tools_post") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="create_one_api_organizers_tools_post")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:create_one_api_organizers_tools_post",{operation_id:"create_one_api_organizers_tools_post",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["item_id"]!==undefined && __resourceData["item_id"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Tools:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:tools:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_organizers_tools_post",ready_event:"SBT:InstanceReady:tools:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:create_one_api_organizers_tools_post",{operation_id:"create_one_api_organizers_tools_post",valid:__valid})});
});
bthread("sbt:resource-bridge:create_one_api_recipes_timeline_events_post", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="create_one_api_recipes_timeline_events_post") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="create_one_api_recipes_timeline_events_post")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:create_one_api_recipes_timeline_events_post",{operation_id:"create_one_api_recipes_timeline_events_post",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["item_id"]!==undefined && __resourceData["item_id"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Events:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:events:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_recipes_timeline_events_post",ready_event:"SBT:InstanceReady:events:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:create_one_api_recipes_timeline_events_post",{operation_id:"create_one_api_recipes_timeline_events_post",valid:__valid})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_mealplans_rules__item_id__put__day", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/rules/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans_rules__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:0",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __bodies = [{"day":"monday"},{"day":"tuesday"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["day","entryType","queryFilterString"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-0";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day"})});sync({request:Event("SBT:ConcurrencyClosed:0",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-0"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day"})});sync({request:Event("SBT:ConcurrencyClosed:0",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_mealplans_rules__item_id__put__entryType", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/rules/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans_rules__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:1",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::entryType",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:1",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::entryType",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:1")});
  var __bodies = [{"entryType":"breakfast"},{"entryType":"lunch"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["day","entryType","queryFilterString"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-1";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:1",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::entryType"})});sync({request:Event("SBT:ConcurrencyClosed:1",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-1"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:1",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::entryType"})});sync({request:Event("SBT:ConcurrencyClosed:1",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-1";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::entryType",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::entryType",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_mealplans_rules__item_id__put__queryFilterString", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/rules/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans_rules__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:2",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::queryFilterString",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:2",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::queryFilterString",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:2")});
  var __bodies = [{"queryFilterString":"sbt_generated_a_queryFilterString"},{"queryFilterString":"sbt_generated_b_queryFilterString"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["day","entryType","queryFilterString"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-2";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:2",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::queryFilterString"})});sync({request:Event("SBT:ConcurrencyClosed:2",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-2"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:2",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::queryFilterString"})});sync({request:Event("SBT:ConcurrencyClosed:2",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-2";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::queryFilterString",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::queryFilterString",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_mealplans__item_id__put__date", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:3",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::date",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:3",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::date",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:3")});
  var __bodies = [{"date":"2026-01-01"},{"date":"2026-01-02"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["date","entryType","groupId","id","text","title","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-3";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:3",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::date"})});sync({request:Event("SBT:ConcurrencyClosed:3",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-3"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:3",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::date"})});sync({request:Event("SBT:ConcurrencyClosed:3",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-3";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::date",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::date",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_mealplans__item_id__put__entryType", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:4",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::entryType",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:4",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::entryType",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:4")});
  var __bodies = [{"entryType":"breakfast"},{"entryType":"lunch"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["date","entryType","groupId","id","text","title","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-4";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:4",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::entryType"})});sync({request:Event("SBT:ConcurrencyClosed:4",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-4"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:4",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::entryType"})});sync({request:Event("SBT:ConcurrencyClosed:4",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-4";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::entryType",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::entryType",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_mealplans__item_id__put__groupId", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:5",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::groupId",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:5",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::groupId",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:5")});
  var __bodies = [{"groupId":"00000000-0000-4000-8000-000000000001"},{"groupId":"00000000-0000-4000-8000-000000000002"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["date","entryType","groupId","id","text","title","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-5";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:5",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::groupId"})});sync({request:Event("SBT:ConcurrencyClosed:5",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-5"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:5",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::groupId"})});sync({request:Event("SBT:ConcurrencyClosed:5",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-5";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::groupId",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::groupId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_mealplans__item_id__put__id", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:6",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::id",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:6",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::id",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:6")});
  var __bodies = [{"id":1},{"id":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["date","entryType","groupId","id","text","title","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-6";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:6",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::id"})});sync({request:Event("SBT:ConcurrencyClosed:6",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-6"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:6",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::id"})});sync({request:Event("SBT:ConcurrencyClosed:6",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-6";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::id",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_mealplans__item_id__put__text", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:7",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::text",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:7",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::text",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:7")});
  var __bodies = [{"text":"sbt_generated_a_text"},{"text":"sbt_generated_b_text"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["date","entryType","groupId","id","text","title","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-7";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:7",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::text"})});sync({request:Event("SBT:ConcurrencyClosed:7",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-7"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:7",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::text"})});sync({request:Event("SBT:ConcurrencyClosed:7",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-7";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::text",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::text",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_mealplans__item_id__put__title", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:8",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::title",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:8",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::title",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:8")});
  var __bodies = [{"title":"sbt_generated_a_title"},{"title":"sbt_generated_b_title"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["date","entryType","groupId","id","text","title","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-8";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:8",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::title"})});sync({request:Event("SBT:ConcurrencyClosed:8",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-8"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:8",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::title"})});sync({request:Event("SBT:ConcurrencyClosed:8",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-8";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::title",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::title",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_shopping_lists__item_id__put__groupId", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/shopping/lists/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_shopping_lists__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:9",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::groupId",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:9",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::groupId",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:9")});
  var __bodies = [{"groupId":"sbt_generated_a_groupId"},{"groupId":"sbt_generated_b_groupId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["groupId","id","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-9";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:9",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::groupId"})});sync({request:Event("SBT:ConcurrencyClosed:9",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-9"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:9",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::groupId"})});sync({request:Event("SBT:ConcurrencyClosed:9",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-9";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::groupId",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::groupId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_shopping_lists__item_id__put__id", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/shopping/lists/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_shopping_lists__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:10",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::id",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:10",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::id",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:10")});
  var __bodies = [{"id":"sbt_generated_a_id"},{"id":"sbt_generated_b_id"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["groupId","id","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-10";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:10",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::id"})});sync({request:Event("SBT:ConcurrencyClosed:10",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-10"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:10",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::id"})});sync({request:Event("SBT:ConcurrencyClosed:10",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-10";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::id",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_households_shopping_lists__item_id__put__userId", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/shopping/lists/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_shopping_lists__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:11",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::userId",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:11",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::userId",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:11")});
  var __bodies = [{"userId":"sbt_generated_a_userId"},{"userId":"sbt_generated_b_userId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["groupId","id","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-11";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:11",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::userId"})});sync({request:Event("SBT:ConcurrencyClosed:11",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-11"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:11",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::userId"})});sync({request:Event("SBT:ConcurrencyClosed:11",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-11";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::userId",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:11",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::userId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_organizers_tools__item_id__put__name", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/organizers/tools/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_organizers_tools__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:12",{oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:12",{oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:12")});
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["name"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-12";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:12",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name"})});sync({request:Event("SBT:ConcurrencyClosed:12",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-12"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:12",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name"})});sync({request:Event("SBT:ConcurrencyClosed:12",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-12";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:12",{oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_recipes_timeline_events__item_id__put__subject", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/recipes/timeline/events/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_recipes_timeline_events__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:13",{oracle_id:"concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:13",{oracle_id:"concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:13")});
  var __bodies = [{"subject":"sbt_generated_a_subject"},{"subject":"sbt_generated_b_subject"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["subject"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-13";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:13",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject"})});sync({request:Event("SBT:ConcurrencyClosed:13",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-13"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:13",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject"})});sync({request:Event("SBT:ConcurrencyClosed:13",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-13";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:13",{oracle_id:"concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",path:__path})});
});
bthread("sbt:concurrency:concurrency__noop__concurrency__same_field__update_one_api_households_mealplans__item_id__put__date", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:14",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans__item_id__put::date",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:14",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans__item_id__put::date",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:14")});
  var __bodies = [{"date":"2026-01-01"},{"date":"2026-01-02"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline||__baseline["date"]===undefined){sync({request:Event("SBT:ConcurrencyClosed:14",{reason:"noop-baseline-unavailable"})});return;}
  __bodies[0]["date"]=__baseline["date"];
  __bodies[1]["date"]=__sbtNextValue(__baseline["date"],{candidate_a:"2026-01-01",candidate_b:"2026-01-02"});
  if(__sbtEqual(__bodies[0]["date"],__bodies[1]["date"])){sync({request:Event("SBT:ConcurrencyClosed:14",{reason:"noop-distinct-value-unavailable"})});return;}
  var __requestFields = ["date","entryType","groupId","id","text","title","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-14";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); if(__i===0){var __noopRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-noop-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__noopRead=JSON.parse(r.body);}catch(e){}}}});if(!__noopRead||!__sbtEqual(__noopRead["date"],__baseline["date"])){__serialOk=false;}} }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:14",{reason:"sequential-control-failed",oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans__item_id__put::date"})});sync({request:Event("SBT:ConcurrencyClosed:14",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-14"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __resetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-14","X-Provengo-Operation-Id":"generated-reset-14-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__resetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__resetRead||["date"].some(function(f){return __baseline[f]===undefined||__resetRead[f]===undefined||!__sbtEqual(__resetRead[f],__baseline[f]);})){__serialOk=false;}
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:14",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans__item_id__put::date"})});sync({request:Event("SBT:ConcurrencyClosed:14",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-14";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans__item_id__put::date",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:14",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans__item_id__put::date",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint_put__update_one_api_households_mealplans__item_id__put", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:15",{oracle_id:"concurrency::disjoint-put::update_one_api_households_mealplans__item_id__put",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:15",{oracle_id:"concurrency::disjoint-put::update_one_api_households_mealplans__item_id__put",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:15")});
  var __bodies = [{"date":"2026-01-01"},{"entryType":"lunch"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["date","entryType","groupId","id","text","title","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-15";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:15",{reason:"sequential-control-failed",oracle_id:"concurrency::disjoint-put::update_one_api_households_mealplans__item_id__put"})});sync({request:Event("SBT:ConcurrencyClosed:15",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-15"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __resetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-15","X-Provengo-Operation-Id":"generated-reset-15-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__resetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__resetRead||["date","entryType"].some(function(f){return __baseline[f]===undefined||__resetRead[f]===undefined||!__sbtEqual(__resetRead[f],__baseline[f]);})){__serialOk=false;}
  var __reverseEpoch = "generated-reverse-control-15";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.put(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-15"; svc.put(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __reverseResetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-reverse-15","X-Provengo-Operation-Id":"generated-reset-reverse-15-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__reverseResetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__reverseResetRead||["date","entryType"].some(function(f){return __baseline[f]===undefined||__reverseResetRead[f]===undefined||!__sbtEqual(__reverseResetRead[f],__baseline[f]);})){__serialOk=false;}
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:15",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::disjoint-put::update_one_api_households_mealplans__item_id__put"})});sync({request:Event("SBT:ConcurrencyClosed:15",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-15";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint-put::update_one_api_households_mealplans__item_id__put",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:15",{oracle_id:"concurrency::disjoint-put::update_one_api_households_mealplans__item_id__put",path:__path})});
});
bthread("sbt:concurrency:concurrency__noop__concurrency__same_field__update_one_api_households_mealplans_rules__item_id__put__day", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/rules/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans_rules__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:16",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:16",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:16")});
  var __bodies = [{"day":"monday"},{"day":"tuesday"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline||__baseline["day"]===undefined){sync({request:Event("SBT:ConcurrencyClosed:16",{reason:"noop-baseline-unavailable"})});return;}
  __bodies[0]["day"]=__baseline["day"];
  __bodies[1]["day"]=__sbtNextValue(__baseline["day"],{candidate_a:"monday",candidate_b:"tuesday"});
  if(__sbtEqual(__bodies[0]["day"],__bodies[1]["day"])){sync({request:Event("SBT:ConcurrencyClosed:16",{reason:"noop-distinct-value-unavailable"})});return;}
  var __requestFields = ["day","entryType","queryFilterString"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-16";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); if(__i===0){var __noopRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-noop-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__noopRead=JSON.parse(r.body);}catch(e){}}}});if(!__noopRead||!__sbtEqual(__noopRead["day"],__baseline["day"])){__serialOk=false;}} }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:16",{reason:"sequential-control-failed",oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day"})});sync({request:Event("SBT:ConcurrencyClosed:16",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-16"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __resetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-16","X-Provengo-Operation-Id":"generated-reset-16-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__resetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__resetRead||["day"].some(function(f){return __baseline[f]===undefined||__resetRead[f]===undefined||!__sbtEqual(__resetRead[f],__baseline[f]);})){__serialOk=false;}
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:16",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day"})});sync({request:Event("SBT:ConcurrencyClosed:16",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-16";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:16",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint_put__update_one_api_households_mealplans_rules__item_id__put", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/households/mealplans/rules/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_households_mealplans_rules__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:17",{oracle_id:"concurrency::disjoint-put::update_one_api_households_mealplans_rules__item_id__put",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:17",{oracle_id:"concurrency::disjoint-put::update_one_api_households_mealplans_rules__item_id__put",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:17")});
  var __bodies = [{"day":"monday"},{"entryType":"lunch"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["day","entryType","queryFilterString"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-17";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:17",{reason:"sequential-control-failed",oracle_id:"concurrency::disjoint-put::update_one_api_households_mealplans_rules__item_id__put"})});sync({request:Event("SBT:ConcurrencyClosed:17",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-17"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __resetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-17","X-Provengo-Operation-Id":"generated-reset-17-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__resetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__resetRead||["day","entryType"].some(function(f){return __baseline[f]===undefined||__resetRead[f]===undefined||!__sbtEqual(__resetRead[f],__baseline[f]);})){__serialOk=false;}
  var __reverseEpoch = "generated-reverse-control-17";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.put(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-17"; svc.put(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __reverseResetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-reverse-17","X-Provengo-Operation-Id":"generated-reset-reverse-17-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__reverseResetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__reverseResetRead||["day","entryType"].some(function(f){return __baseline[f]===undefined||__reverseResetRead[f]===undefined||!__sbtEqual(__reverseResetRead[f],__baseline[f]);})){__serialOk=false;}
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:17",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::disjoint-put::update_one_api_households_mealplans_rules__item_id__put"})});sync({request:Event("SBT:ConcurrencyClosed:17",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-17";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint-put::update_one_api_households_mealplans_rules__item_id__put",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:17",{oracle_id:"concurrency::disjoint-put::update_one_api_households_mealplans_rules__item_id__put",path:__path})});
});
bthread("sbt:concurrency:concurrency__noop__concurrency__same_field__update_one_api_organizers_tools__item_id__put__name", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/organizers/tools/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_organizers_tools__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:18",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:18",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:18")});
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline||__baseline["name"]===undefined){sync({request:Event("SBT:ConcurrencyClosed:18",{reason:"noop-baseline-unavailable"})});return;}
  __bodies[0]["name"]=__baseline["name"];
  __bodies[1]["name"]=__sbtNextValue(__baseline["name"],{candidate_a:"sbt_generated_a_name",candidate_b:"sbt_generated_b_name"});
  if(__sbtEqual(__bodies[0]["name"],__bodies[1]["name"])){sync({request:Event("SBT:ConcurrencyClosed:18",{reason:"noop-distinct-value-unavailable"})});return;}
  var __requestFields = ["name"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-18";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); if(__i===0){var __noopRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-noop-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__noopRead=JSON.parse(r.body);}catch(e){}}}});if(!__noopRead||!__sbtEqual(__noopRead["name"],__baseline["name"])){__serialOk=false;}} }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:18",{reason:"sequential-control-failed",oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_organizers_tools__item_id__put::name"})});sync({request:Event("SBT:ConcurrencyClosed:18",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-18"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __resetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-18","X-Provengo-Operation-Id":"generated-reset-18-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__resetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__resetRead||["name"].some(function(f){return __baseline[f]===undefined||__resetRead[f]===undefined||!__sbtEqual(__resetRead[f],__baseline[f]);})){__serialOk=false;}
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:18",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_organizers_tools__item_id__put::name"})});sync({request:Event("SBT:ConcurrencyClosed:18",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-18";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::noop::concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:18",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__noop__concurrency__same_field__update_one_api_recipes_timeline_events__item_id__put__subject", function(){
  var __prefixStory=null; var __prefixCount=0;
  var __prefixPathPattern=new RegExp("^/api/recipes/timeline/events/[^/]+$");
  var __first=sync({waitFor:EventSet("verified matching prefix start",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.round===1&&
    e.data.operation_id==="update_one_api_recipes_timeline_events__item_id__put"&&__prefixPathPattern.test(e.data.path));})});
  var __path=__first.data.path; __prefixStory=__first.data.story; __prefixCount=1;
  while(__prefixCount < 8){
    var __step=sync({waitFor:EventSet("verified same-resource prefix",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&e.data.path===__path&&e.data.round===__prefixCount+1&&(__prefixStory===null||e.data.story===__prefixStory));})});
    if(__prefixStory===null){__prefixStory=__step.data.story;} __prefixCount++;
  }
  sync({request:Event("SBT:PrefixAdmitted:19",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:19",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:19")});
  var __bodies = [{"subject":"sbt_generated_a_subject"},{"subject":"sbt_generated_b_subject"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline||__baseline["subject"]===undefined){sync({request:Event("SBT:ConcurrencyClosed:19",{reason:"noop-baseline-unavailable"})});return;}
  __bodies[0]["subject"]=__baseline["subject"];
  __bodies[1]["subject"]=__sbtNextValue(__baseline["subject"],{candidate_a:"sbt_generated_a_subject",candidate_b:"sbt_generated_b_subject"});
  if(__sbtEqual(__bodies[0]["subject"],__bodies[1]["subject"])){sync({request:Event("SBT:ConcurrencyClosed:19",{reason:"noop-distinct-value-unavailable"})});return;}
  var __requestFields = ["subject"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-19";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); if(__i===0){var __noopRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-noop-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__noopRead=JSON.parse(r.body);}catch(e){}}}});if(!__noopRead||!__sbtEqual(__noopRead["subject"],__baseline["subject"])){__serialOk=false;}} }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:19",{reason:"sequential-control-failed",oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject"})});sync({request:Event("SBT:ConcurrencyClosed:19",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-19"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  var __resetRead=null;svc.get(__path,{headers:{"X-Provengo-Epoch-Id":"generated-reset-19","X-Provengo-Operation-Id":"generated-reset-19-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if(r.code===200){try{__resetRead=JSON.parse(r.body);}catch(e){}}}});
  if(!__baseline||!__resetRead||["subject"].some(function(f){return __baseline[f]===undefined||__resetRead[f]===undefined||!__sbtEqual(__resetRead[f],__baseline[f]);})){__serialOk=false;}
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:19",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject"})});sync({request:Event("SBT:ConcurrencyClosed:19",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-19";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::noop::concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:19",{oracle_id:"concurrency::noop::concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",path:__path})});
});
bthread("sbt:cross-entity:concurrency__cross_entity__update_one_api_recipes_timeline_events__item_id__put__update_one_api_households_mealplans__item_id__put",function(){
  var __targets=[{"operation_id":"update_one_api_recipes_timeline_events__item_id__put","pattern":"^/api/recipes/timeline/events/[^/]+$","method":"PUT","field":{"name":"subject","type":"string","format":null,"example":null,"enum":null,"minimum":null,"maximum":null,"minLength":null,"maxLength":null,"pattern":null,"media_type":"application/json","source":"openapi-request-schema","candidate_a":"sbt_generated_a_subject","candidate_b":"sbt_generated_b_subject"},"media_type":"application/json","request_fields":["subject"],"success_statuses":[200]},{"operation_id":"update_one_api_households_mealplans__item_id__put","pattern":"^/api/households/mealplans/[^/]+$","method":"PUT","field":{"name":"date","type":"string","format":"date","example":null,"enum":null,"minimum":null,"maximum":null,"minLength":null,"maxLength":null,"pattern":null,"media_type":"application/json","source":"openapi-request-schema","candidate_a":"2026-01-01","candidate_b":"2026-01-02"},"media_type":"application/json","request_fields":["date","entryType","groupId","id","text","title","userId"],"success_statuses":[200]}]; var __minimum=8;
  var __paths=[null,null],__stories=[null,null],__rounds=[0,0];
  while(__rounds[0]<__minimum||__rounds[1]<__minimum){
    var __next=sync({waitFor:EventSet("cross-entity verified prefix",function(e){
      if(!e||e.name!=="SBT:PrefixVerified"||!e.data){return false;}
      for(var k=0;k<2;k++){var t=__targets[k];if(e.data.operation_id===t.operation_id&&
        new RegExp(t.pattern).test(e.data.path)&&__rounds[k]<__minimum&&
        e.data.round===__rounds[k]+1&&(__paths[k]===null||__paths[k]===e.data.path)&&
        (__stories[k]===null||__stories[k]===e.data.story)){return true;}}return false;})});
    for(var k=0;k<2;k++){var t=__targets[k];if(__next.data.operation_id===t.operation_id&&
      new RegExp(t.pattern).test(__next.data.path)&&__next.data.round===__rounds[k]+1&&
      (__paths[k]===null||__paths[k]===__next.data.path)&&
      (__stories[k]===null||__stories[k]===__next.data.story)){
      __paths[k]=__next.data.path;__stories[k]=__next.data.story;__rounds[k]++;break;}}
  }
  sync({request:Event("SBT:ConcurrencyReady:20",{oracle_id:"concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans__item_id__put",paths:__paths,rounds:__rounds})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:20")});
  var __bodies=[],__baselines=[],__valid=true;
  for(var k=0;k<2;k++){
    var __baseline=null;svc.get(__paths[k],{expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(r.code===200){try{__baseline=JSON.parse(r.body);}catch(e){}}}});
    var t=__targets[k];if(!__baseline||__baseline[t.field.name]===undefined||
      t.request_fields.some(function(f){return __baseline[f]===undefined||__baseline[f]===null;})){__valid=false;break;}
    __baselines.push(__baseline);var __body={};
    for(var p=0;p<t.request_fields.length;p++){var f=t.request_fields[p];__body[f]=__baseline[f];}
    __body[t.field.name]=__sbtNextValue(__baseline[t.field.name],t.field);
    if(__sbtEqual(__body[t.field.name],__baseline[t.field.name])){__valid=false;break;}
    __bodies.push(__body);
    var __ctrl="generated-control-20";
    svc[t.method.toLowerCase()](__paths[k],{body:JSON.stringify(__body),
      headers:{"Content-Type":t.media_type,"X-Provengo-Epoch-Id":__ctrl,
      "X-Provengo-Operation-Id":__ctrl+"-op-"+k},expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(t.success_statuses.indexOf(r.code)<0){__valid=false;}}});
    var __check=null;svc.get(__paths[k],{headers:{"X-Provengo-Epoch-Id":__ctrl,
      "X-Provengo-Operation-Id":__ctrl+"-observe-"+k},expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(r.code===200){try{__check=JSON.parse(r.body);}catch(e){}}}});
    if(!__check||!__sbtEqual(__check[t.field.name],__body[t.field.name])){__valid=false;}
    var __reset="generated-reset-20";
    var __carry={};for(var p=0;p<t.request_fields.length;p++){var f=t.request_fields[p];__carry[f]=__baseline[f];}
    __carry[t.field.name]=__baseline[t.field.name];
    svc[t.method.toLowerCase()](__paths[k],{body:JSON.stringify(__carry),
      headers:{"Content-Type":t.media_type,"X-Provengo-Epoch-Id":__reset,
      "X-Provengo-Operation-Id":__reset+"-op-"+k},expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(t.success_statuses.indexOf(r.code)<0){__valid=false;}}});
    var __recheck=null;svc.get(__paths[k],{headers:{"X-Provengo-Epoch-Id":__reset,
      "X-Provengo-Operation-Id":__reset+"-observe-"+k},expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(r.code===200){try{__recheck=JSON.parse(r.body);}catch(e){}}}});
    if(!__recheck||!__sbtEqual(__recheck[t.field.name],__baseline[t.field.name])){__valid=false;}
  }
  if(!__valid){sync({request:Event("SBT:ConcurrencySkipped:20",{reason:"cross-entity-control-failed"})});
    sync({request:Event("SBT:ConcurrencyClosed:20")});return;}
  var __epoch="generated-epoch-20";var __ops=[];
  for(var k=0;k<2;k++){var t=__targets[k];__ops.push({operation_id:__epoch+"-op-"+k,
    method:t.method,path:__paths[k],body:__bodies[k],delay_ms:0,
    headers:{"Content-Type":t.media_type,"X-Provengo-Prefix-Phase":"epoch",
      "X-Provengo-Prefix-Story":__stories[k],"X-Provengo-Prefix-Round":String(__rounds[k])}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans__item_id__put",
    operations:__ops,post_join_observations:__paths.map(function(p){return {method:"GET",path:p};})}),
    expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:20",{oracle_id:"concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans__item_id__put"})});
});
bthread("sbt:cross-entity:concurrency__cross_entity__update_one_api_recipes_timeline_events__item_id__put__update_one_api_households_mealplans_rules__item_id__put",function(){
  var __targets=[{"operation_id":"update_one_api_recipes_timeline_events__item_id__put","pattern":"^/api/recipes/timeline/events/[^/]+$","method":"PUT","field":{"name":"subject","type":"string","format":null,"example":null,"enum":null,"minimum":null,"maximum":null,"minLength":null,"maxLength":null,"pattern":null,"media_type":"application/json","source":"openapi-request-schema","candidate_a":"sbt_generated_a_subject","candidate_b":"sbt_generated_b_subject"},"media_type":"application/json","request_fields":["subject"],"success_statuses":[200]},{"operation_id":"update_one_api_households_mealplans_rules__item_id__put","pattern":"^/api/households/mealplans/rules/[^/]+$","method":"PUT","field":{"name":"day","type":"string","format":null,"example":null,"enum":["monday","tuesday","wednesday","thursday","friday","saturday","sunday","unset"],"minimum":null,"maximum":null,"minLength":null,"maxLength":null,"pattern":null,"media_type":"application/json","source":"openapi-request-schema","candidate_a":"monday","candidate_b":"tuesday"},"media_type":"application/json","request_fields":["day","entryType","queryFilterString"],"success_statuses":[200]}]; var __minimum=8;
  var __paths=[null,null],__stories=[null,null],__rounds=[0,0];
  while(__rounds[0]<__minimum||__rounds[1]<__minimum){
    var __next=sync({waitFor:EventSet("cross-entity verified prefix",function(e){
      if(!e||e.name!=="SBT:PrefixVerified"||!e.data){return false;}
      for(var k=0;k<2;k++){var t=__targets[k];if(e.data.operation_id===t.operation_id&&
        new RegExp(t.pattern).test(e.data.path)&&__rounds[k]<__minimum&&
        e.data.round===__rounds[k]+1&&(__paths[k]===null||__paths[k]===e.data.path)&&
        (__stories[k]===null||__stories[k]===e.data.story)){return true;}}return false;})});
    for(var k=0;k<2;k++){var t=__targets[k];if(__next.data.operation_id===t.operation_id&&
      new RegExp(t.pattern).test(__next.data.path)&&__next.data.round===__rounds[k]+1&&
      (__paths[k]===null||__paths[k]===__next.data.path)&&
      (__stories[k]===null||__stories[k]===__next.data.story)){
      __paths[k]=__next.data.path;__stories[k]=__next.data.story;__rounds[k]++;break;}}
  }
  sync({request:Event("SBT:ConcurrencyReady:21",{oracle_id:"concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans_rules__item_id__put",paths:__paths,rounds:__rounds})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:21")});
  var __bodies=[],__baselines=[],__valid=true;
  for(var k=0;k<2;k++){
    var __baseline=null;svc.get(__paths[k],{expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(r.code===200){try{__baseline=JSON.parse(r.body);}catch(e){}}}});
    var t=__targets[k];if(!__baseline||__baseline[t.field.name]===undefined||
      t.request_fields.some(function(f){return __baseline[f]===undefined||__baseline[f]===null;})){__valid=false;break;}
    __baselines.push(__baseline);var __body={};
    for(var p=0;p<t.request_fields.length;p++){var f=t.request_fields[p];__body[f]=__baseline[f];}
    __body[t.field.name]=__sbtNextValue(__baseline[t.field.name],t.field);
    if(__sbtEqual(__body[t.field.name],__baseline[t.field.name])){__valid=false;break;}
    __bodies.push(__body);
    var __ctrl="generated-control-21";
    svc[t.method.toLowerCase()](__paths[k],{body:JSON.stringify(__body),
      headers:{"Content-Type":t.media_type,"X-Provengo-Epoch-Id":__ctrl,
      "X-Provengo-Operation-Id":__ctrl+"-op-"+k},expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(t.success_statuses.indexOf(r.code)<0){__valid=false;}}});
    var __check=null;svc.get(__paths[k],{headers:{"X-Provengo-Epoch-Id":__ctrl,
      "X-Provengo-Operation-Id":__ctrl+"-observe-"+k},expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(r.code===200){try{__check=JSON.parse(r.body);}catch(e){}}}});
    if(!__check||!__sbtEqual(__check[t.field.name],__body[t.field.name])){__valid=false;}
    var __reset="generated-reset-21";
    var __carry={};for(var p=0;p<t.request_fields.length;p++){var f=t.request_fields[p];__carry[f]=__baseline[f];}
    __carry[t.field.name]=__baseline[t.field.name];
    svc[t.method.toLowerCase()](__paths[k],{body:JSON.stringify(__carry),
      headers:{"Content-Type":t.media_type,"X-Provengo-Epoch-Id":__reset,
      "X-Provengo-Operation-Id":__reset+"-op-"+k},expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(t.success_statuses.indexOf(r.code)<0){__valid=false;}}});
    var __recheck=null;svc.get(__paths[k],{headers:{"X-Provengo-Epoch-Id":__reset,
      "X-Provengo-Operation-Id":__reset+"-observe-"+k},expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(r.code===200){try{__recheck=JSON.parse(r.body);}catch(e){}}}});
    if(!__recheck||!__sbtEqual(__recheck[t.field.name],__baseline[t.field.name])){__valid=false;}
  }
  if(!__valid){sync({request:Event("SBT:ConcurrencySkipped:21",{reason:"cross-entity-control-failed"})});
    sync({request:Event("SBT:ConcurrencyClosed:21")});return;}
  var __epoch="generated-epoch-21";var __ops=[];
  for(var k=0;k<2;k++){var t=__targets[k];__ops.push({operation_id:__epoch+"-op-"+k,
    method:t.method,path:__paths[k],body:__bodies[k],delay_ms:0,
    headers:{"Content-Type":t.media_type,"X-Provengo-Prefix-Phase":"epoch",
      "X-Provengo-Prefix-Story":__stories[k],"X-Provengo-Prefix-Round":String(__rounds[k])}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans_rules__item_id__put",
    operations:__ops,post_join_observations:__paths.map(function(p){return {method:"GET",path:p};})}),
    expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:21",{oracle_id:"concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans_rules__item_id__put"})});
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
bthread("sbt:prefix-isolation:16",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:16")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:16"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:17",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:17")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:17"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:18",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:18")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:18"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:prefix-isolation:19",function(){
  sync({waitFor:Event("SBT:PrefixAdmitted:19")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:19"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:cross-isolation:20",function(){
  sync({waitFor:Event("SBT:ConcurrencyPermit:20")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:20"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
bthread("sbt:cross-isolation:21",function(){
  sync({waitFor:Event("SBT:ConcurrencyPermit:21")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:21"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
});
function __sbtNamedEvent(__name){ return EventSet("SBT named event "+__name,function(e){return !!(e&&e.name===__name);}); }
function __sbtAnyConcurrencyReady(){ return EventSet("SBT any concurrency ready",function(e){return !!(e&&e.name&&e.name.indexOf("SBT:ConcurrencyReady:")===0);}); }
function __sbtAnyHttpDelete(){ return EventSet("SBT any HTTP DELETE",function(e){return !!(e&&e.name==="DELETE");}); }
function __sbtConcurrencyBusyBlock(){ return EventSet("SBT concurrency admission or cleanup",function(e){return !!(e&&e.name&&(e.name==="DELETE"||e.name.indexOf("SBT:ConcurrencyReady:")===0));}); }
bthread("sbt:concurrency-controller",function(){
  var __readySeen={}; var __readyCount=0; var __readyTotal=22;
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
