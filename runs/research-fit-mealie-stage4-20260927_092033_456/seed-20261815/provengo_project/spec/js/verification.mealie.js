//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for mealie.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":76,"contract_verifiers":76,"mutations":48,"state_verified_mutations":24,"contract_only_mutations":24,"concurrency_oracles":42};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtReadPath(value,path){var parts=String(path).split("."); for(var i=0;i<parts.length;i++){if(value===null||typeof value==="undefined"){return undefined;} value=value[parts[i]];} return value;}
function __sbtCreateEvent(operationId){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__operationId===operationId && e.data.__httpResponse); }); }
bthread("sbt:resource-bridge:create_one_api_households_mealplans_post", function(){
  var __created = sync({waitFor:__sbtCreateEvent("create_one_api_households_mealplans_post")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:Mealplans:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_households_mealplans_post",ready_event:"InstanceReady:Mealplans:1"})});
});
bthread("sbt:resource-bridge:create_one_api_households_mealplans_rules_post", function(){
  var __created = sync({waitFor:__sbtCreateEvent("create_one_api_households_mealplans_rules_post")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:Rules:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_households_mealplans_rules_post",ready_event:"InstanceReady:Rules:1"})});
});
bthread("sbt:resource-bridge:create_one_api_households_shopping_lists_post", function(){
  var __created = sync({waitFor:__sbtCreateEvent("create_one_api_households_shopping_lists_post")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:Lists:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_households_shopping_lists_post",ready_event:"InstanceReady:Lists:1"})});
});
bthread("sbt:resource-bridge:create_one_api_organizers_tools_post", function(){
  var __created = sync({waitFor:__sbtCreateEvent("create_one_api_organizers_tools_post")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:Tools:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_organizers_tools_post",ready_event:"InstanceReady:Tools:1"})});
});
bthread("sbt:resource-bridge:create_one_api_recipes_timeline_events_post", function(){
  var __created = sync({waitFor:__sbtCreateEvent("create_one_api_recipes_timeline_events_post")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:Events:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_recipes_timeline_events_post",ready_event:"InstanceReady:Events:1"})});
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
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-0"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::day",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
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
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-1"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-1";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::entryType",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
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
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-2"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-2";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans_rules__item_id__put::queryFilterString",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
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
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-3"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-3";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::date",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
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
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-4"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-4";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::entryType",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
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
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-5"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-5";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::groupId",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::same-field::update_one_api_households_mealplans__item_id__put::groupId",path:__path})});
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
  sync({request:Event("SBT:PrefixAdmitted:6",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::groupId",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:6",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::groupId",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:6")});
  var __bodies = [{"groupId":"sbt_generated_a_groupId"},{"groupId":"sbt_generated_b_groupId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["groupId","id","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-6";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-6"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-6";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::groupId",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::groupId",path:__path})});
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
  sync({request:Event("SBT:PrefixAdmitted:7",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::id",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:7",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::id",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:7")});
  var __bodies = [{"id":"sbt_generated_a_id"},{"id":"sbt_generated_b_id"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["groupId","id","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-7";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-7"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-7";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::id",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::id",path:__path})});
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
  sync({request:Event("SBT:PrefixAdmitted:8",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::userId",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:8",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::userId",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:8")});
  var __bodies = [{"userId":"sbt_generated_a_userId"},{"userId":"sbt_generated_b_userId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["groupId","id","userId"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-8";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-8"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-8";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::userId",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::same-field::update_one_api_households_shopping_lists__item_id__put::userId",path:__path})});
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
  sync({request:Event("SBT:PrefixAdmitted:9",{oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:9",{oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:9")});
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["name"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-9";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-9"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-9";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",path:__path})});
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
  sync({request:Event("SBT:PrefixAdmitted:10",{oracle_id:"concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",path:__path,story:__prefixStory,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:10",{oracle_id:"concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:10")});
  var __bodies = [{"subject":"sbt_generated_a_subject"},{"subject":"sbt_generated_b_subject"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["subject"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-10";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-10"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes: __sbtObservedHttpStatuses}); }
  var __epoch = "generated-epoch-10";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixCount)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",operations:__ops}),expectedResponseCodes: __sbtObservedHttpStatuses});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::update_one_api_recipes_timeline_events__item_id__put::subject",path:__path})});
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
function __sbtNamedEvent(__name){ return EventSet("SBT named event "+__name,function(e){return !!(e&&e.name===__name);}); }
function __sbtAnyConcurrencyReady(){ return EventSet("SBT any concurrency ready",function(e){return !!(e&&e.name&&e.name.indexOf("SBT:ConcurrencyReady:")===0);}); }
function __sbtAnyHttpDelete(){ return EventSet("SBT any HTTP DELETE",function(e){return !!(e&&e.name==="DELETE");}); }
function __sbtConcurrencyBusyBlock(){ return EventSet("SBT concurrency admission or cleanup",function(e){return !!(e&&e.name&&(e.name==="DELETE"||e.name.indexOf("SBT:ConcurrencyReady:")===0));}); }
bthread("sbt:concurrency-controller",function(){
  var __readySeen={}; var __readyCount=0; var __readyTotal=11;
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
