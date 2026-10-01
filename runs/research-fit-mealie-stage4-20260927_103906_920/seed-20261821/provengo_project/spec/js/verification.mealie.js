//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for mealie.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":76,"contract_verifiers":76,"mutations":48,"state_verified_mutations":24,"contract_only_mutations":24,"concurrency_oracles":3};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtReadPath(value,path){var parts=String(path).split("."); for(var i=0;i<parts.length;i++){if(value===null||typeof value==="undefined"){return undefined;} value=value[parts[i]];} return value;}
function __sbtCreateEvent(operationId){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__operationId===operationId && e.data.__httpResponse); }); }
var __sbtControlHttpStatuses=[]; for(var __sc=100;__sc<=599;__sc++){__sbtControlHttpStatuses.push(__sc);}
bthread("sbt:resource-bridge:create_one_api_organizers_tools_post", function(){
  var __created = sync({waitFor:__sbtCreateEvent("create_one_api_organizers_tools_post")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:Tools:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_organizers_tools_post",ready_event:"InstanceReady:Tools:1"})});
});
bthread("sbt:concurrency:concurrency__same_field__update_one_api_organizers_tools__item_id__put__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("create_one_api_organizers_tools_post")});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __path = "/api/organizers/tools/{item_id}";
  __path = __path.replace("{item_id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes: __sbtObservedHttpStatuses,callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["name"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-0";
  var __serialOk=true;
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"sequential-control-failed",oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name"})});sync({request:Event("SBT:ConcurrencyClosed:0",{reason:"sequential-control-failed"})});return;}
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-0"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:__sbtControlHttpStatuses,callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}}); }
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"sequential-reset-or-reverse-failed",oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name"})});sync({request:Event("SBT:ConcurrencyClosed:0",{reason:"sequential-reset-or-reverse-failed"})});return;}
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",operations:__ops,post_join_observation:{method:"GET",path:__path}}),expectedResponseCodes: __sbtObservedHttpStatuses});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::update_one_api_organizers_tools__item_id__put::name",path:__path})});
});
function __sbtNamedEvent(__name){ return EventSet("SBT named event "+__name,function(e){return !!(e&&e.name===__name);}); }
function __sbtAnyConcurrencyReady(){ return EventSet("SBT any concurrency ready",function(e){return !!(e&&e.name&&e.name.indexOf("SBT:ConcurrencyReady:")===0);}); }
function __sbtAnyHttpDelete(){ return EventSet("SBT any HTTP DELETE",function(e){return !!(e&&e.name==="DELETE");}); }
function __sbtConcurrencyBusyBlock(){ return EventSet("SBT concurrency admission or cleanup",function(e){return !!(e&&e.name&&(e.name==="DELETE"||e.name.indexOf("SBT:ConcurrencyReady:")===0));}); }
bthread("sbt:concurrency-controller",function(){
  var __readySeen={}; var __readyCount=0; var __readyTotal=1;
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
