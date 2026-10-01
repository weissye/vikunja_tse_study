//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for mealie.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":76,"contract_verifiers":76,"mutations":48,"state_verified_mutations":24,"contract_only_mutations":24,"concurrency_oracles":1};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtReadPath(value,path){var parts=String(path).split("."); for(var i=0;i<parts.length;i++){if(value===null||typeof value==="undefined"){return undefined;} value=value[parts[i]];} return value;}
function __sbtCreateEvent(operationId){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__operationId===operationId && e.data.__httpResponse); }); }
function __sbtEqual(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function __sbtNextValue(current,field){return __sbtEqual(current,field.candidate_b)?field.candidate_a:field.candidate_b;}
var __sbtControlHttpStatuses=[]; for(var __sc=100;__sc<=599;__sc++){__sbtControlHttpStatuses.push(__sc);}
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
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans_rules__item_id__put",paths:__paths,rounds:__rounds})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
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
    var __ctrl="generated-control-0";
    svc[t.method.toLowerCase()](__paths[k],{body:JSON.stringify(__body),
      headers:{"Content-Type":t.media_type,"X-Provengo-Epoch-Id":__ctrl,
      "X-Provengo-Operation-Id":__ctrl+"-op-"+k},expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(t.success_statuses.indexOf(r.code)<0){__valid=false;}}});
    var __check=null;svc.get(__paths[k],{headers:{"X-Provengo-Epoch-Id":__ctrl,
      "X-Provengo-Operation-Id":__ctrl+"-observe-"+k},expectedResponseCodes:__sbtControlHttpStatuses,
      callback:function(r){if(r.code===200){try{__check=JSON.parse(r.body);}catch(e){}}}});
    if(!__check||!__sbtEqual(__check[t.field.name],__body[t.field.name])){__valid=false;}
    var __reset="generated-reset-0";
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
  if(!__valid){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"cross-entity-control-failed"})});
    sync({request:Event("SBT:ConcurrencyClosed:0")});return;}
  var __epoch="generated-epoch-0";var __ops=[];
  for(var k=0;k<2;k++){var t=__targets[k];__ops.push({operation_id:__epoch+"-op-"+k,
    method:t.method,path:__paths[k],body:__bodies[k],delay_ms:0,
    headers:{"Content-Type":t.media_type,"X-Provengo-Prefix-Phase":"epoch",
      "X-Provengo-Prefix-Story":__stories[k],"X-Provengo-Prefix-Round":String(__rounds[k])}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans_rules__item_id__put",
    operations:__ops,post_join_observations:__paths.map(function(p){return {method:"GET",path:p};})}),
    expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::cross-entity::update_one_api_recipes_timeline_events__item_id__put::update_one_api_households_mealplans_rules__item_id__put"})});
});
bthread("sbt:cross-isolation:0",function(){
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:0"),block:EventSet("block other mutation stories",function(e){return !!(e&&["POST","PUT","PATCH","DELETE"].indexOf(e.name)>=0);})});
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
