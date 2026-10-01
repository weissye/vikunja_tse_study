//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for mealie.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":76,"contract_verifiers":76,"mutations":48,"state_verified_mutations":24,"contract_only_mutations":24,"concurrency_oracles":1};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtReadPath(value,path){var parts=String(path).split("."); for(var i=0;i<parts.length;i++){if(value===null||typeof value==="undefined"){return undefined;} value=value[parts[i]];} return value;}
function __sbtCreateEvent(operationId){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__operationId===operationId && e.data.__httpResponse); }); }
var __sbtControlHttpStatuses=[]; for(var __sc=100;__sc<=599;__sc++){__sbtControlHttpStatuses.push(__sc);}
bthread("sbt:resource-bridge:create_one_api_households_mealplans_post", function(){
  var __created = sync({waitFor:__sbtCreateEvent("create_one_api_households_mealplans_post")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["item_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:Mealplans:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"create_one_api_households_mealplans_post",ready_event:"InstanceReady:Mealplans:1"})});
});
bthread("sbt:cross-method:cross_method__update_delete__update_one_api_households_mealplans__item_id__put__delete_one_api_households_mealplans__item_id__delete", function(){
  var __paths=[];
  var __readyByName={};
  var __readyPrefix="InstanceReady:PlanEntryPaginations:";
  for(var __i=0;__i<3;__i++){
    var __created=sync({waitFor:EventSet("Cross-method verified instance",function(e){
      if(!e || typeof e.name!=="string" || !e.data || e.name.indexOf(__readyPrefix)!==0){return false;}
      var __number=e.name.substring(__readyPrefix.length);
      return (__number==="1" || __number==="2" || __number==="3") && !__readyByName[e.name];
    })});
    __readyByName[__created.name]=__created.data;
  }
  for(var __i=1;__i<=3;__i++){
    var __ready=__readyByName[__readyPrefix+__i];
    var __path="/api/households/mealplans/{item_id}";
    __path=__path.replace("{item_id}",String(__sbtReadPath(__ready,"id")));
    if(__path.indexOf("{")>=0 || __path.indexOf("undefined")>=0 || __paths.indexOf(__path)>=0){return;}
    __paths.push(__path);
  }
  var __body={"date":"2026-01-02"};
  var __bodies=[]; var __serialOk=true;
  for(var __j=0;__j<3;__j++){
    var __check="cross-baseline-0-"+__j;
    svc.get(__paths[__j],{headers:{"X-Provengo-Epoch-Id":__check,"X-Provengo-Operation-Id":__check+"-observe"},expectedResponseCodes:[200,400,401,403,404,409,410,422],callback:function(r){try{var __item=JSON.parse(r.body);var __full={};for(var __f of ["date","entryType","groupId","id","recipeId","text","title","userId"]){if(__item[__f]===undefined){__serialOk=false;}else{__full[__f]=__item[__f];}}__full["date"]="2026-01-02";__bodies.push(__full);if([200].indexOf(r.code)<0){__serialOk=false;}}catch(__e){__serialOk=false;}}});
  }
  if(!__serialOk || __bodies.length!==3){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"read-derived-body-unavailable"})});sync({request:Event("SBT:ConcurrencyClosed:0")});return;}
  var __ctrl="cross-control-a-0";
  var __cp=__paths[0];
  svc.put(__cp,{body:JSON.stringify(__bodies[0]),headers:{"Content-Type":"application/json" ,"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-0"},expectedResponseCodes:[200,400,401,403,404,409,410,422],callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-0"},expectedResponseCodes:[200,400,401,403,404,409,410,422],callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  svc.delete(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-1"},expectedResponseCodes:[200,400,401,403,404,409,410,422],callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-1"},expectedResponseCodes:[200,400,401,403,404,409,410,422],callback:function(r){if([400,404,410].indexOf(r.code)<0){__serialOk=false;}}});
  var __ctrl="cross-control-b-0";
  var __cp=__paths[1];
  svc.delete(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-0"},expectedResponseCodes:[200,400,401,403,404,409,410,422],callback:function(r){if([200].indexOf(r.code)<0){__serialOk=false;}}});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-0"},expectedResponseCodes:[200,400,401,403,404,409,410,422],callback:function(r){if([400,404,410].indexOf(r.code)<0){__serialOk=false;}}});
  svc.put(__cp,{body:JSON.stringify(__bodies[1]),headers:{"Content-Type":"application/json" ,"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-1"},expectedResponseCodes:[200,400,401,403,404,409,410,422],callback:function(r){if([400,404,409,410,422].indexOf(r.code)<0){__serialOk=false;}}});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-1"},expectedResponseCodes:[200,400,401,403,404,409,410,422],callback:function(r){if([400,404,410].indexOf(r.code)<0){__serialOk=false;}}});
  if(!__serialOk){sync({request:Event("SBT:ConcurrencySkipped:0",{reason:"serial-control-failed"})});sync({request:Event("SBT:ConcurrencyClosed:0")});return;}
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"cross-method::update-delete::update_one_api_households_mealplans__item_id__put::delete_one_api_households_mealplans__item_id__delete"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __epoch="generated-epoch-0";
  var __ops=[{operation_id:__epoch+"-op-0",method:"PUT",path:__paths[2],body:__bodies[2],headers:{"Content-Type":"application/json"}},
             {operation_id:__epoch+"-op-1",method:"DELETE",path:__paths[2],headers:{}}];
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"cross-method::update-delete::update_one_api_households_mealplans__item_id__put::delete_one_api_households_mealplans__item_id__delete",operations:__ops,post_join_observation:{method:"GET",path:__paths[2]}}),expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"cross-method::update-delete::update_one_api_households_mealplans__item_id__put::delete_one_api_households_mealplans__item_id__delete",path:__paths[2]})});
});
function __sbtNamedEvent(__name){ return EventSet("SBT named event "+__name,function(e){return !!(e&&e.name===__name);}); }
function __sbtAnyConcurrencyReady(){ return EventSet("SBT any concurrency ready",function(e){return !!(e&&e.name&&e.name.indexOf("SBT:ConcurrencyReady:")===0);}); }
function __sbtAnyHttpDelete(){ return EventSet("SBT any HTTP DELETE",function(e){return !!(e&&e.name==="DELETE");}); }
function __sbtConcurrencyBusyBlock(){ return __sbtAnyConcurrencyReady(); }
bthread("sbt:concurrency-controller",function(){
  var __readySeen={}; var __readyCount=0; var __readyTotal=1;
  while(__readyCount<__readyTotal){
    var __readyEvent=sync({waitFor:__sbtAnyConcurrencyReady()});
    if(__readySeen[__readyEvent.name]){continue;}
    __readySeen[__readyEvent.name]=true; __readyCount++;
    var __readyIndex=__readyEvent.name.substring("SBT:ConcurrencyReady:".length);
    sync({request:Event("SBT:ConcurrencyPermit:"+__readyIndex),block:__sbtConcurrencyBusyBlock()});
    sync({waitFor:__sbtNamedEvent("SBT:ConcurrencyClosed:"+__readyIndex),block:__sbtConcurrencyBusyBlock()});
  }
  sync({request:Event("SBT:AllGeneratedConcurrencyClosed")});
});
