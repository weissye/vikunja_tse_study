//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for immich.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":243,"contract_verifiers":243,"mutations":125,"state_verified_mutations":18,"contract_only_mutations":107,"concurrency_oracles":2};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtReadPath(value,path){var parts=String(path).split("."); for(var i=0;i<parts.length;i++){if(value===null||typeof value==="undefined"){return undefined;} value=value[parts[i]];} return value;}
function __sbtCreateEvent(operationId){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__operationId===operationId && e.data.__httpResponse); }); }
bthread("sbt:resource-bridge:createAlbum", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:Albums:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"createAlbum",ready_event:"InstanceReady:Albums:1"})});
});
bthread("sbt:resource-bridge:createSharedLink", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:SharedLinks:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"createSharedLink",ready_event:"InstanceReady:SharedLinks:1"})});
});
bthread("sbt:cross-method-dependency-gate:0", function(){
  var __closed={}; var __ready=false;
  var __children=[1];
  while(!__ready || Object.keys(__closed).length<__children.length){
    var __signal=sync({waitFor:EventSet("cross-method prerequisites",function(e){
      if(!e || typeof e.name!=="string"){return false;}
      if(e.name==="SBT:EmpiricalDependencyReady:0"){return !__ready;}
      for(var __k=0;__k<__children.length;__k++){
        if(e.name==="SBT:ConcurrencyClosed:"+__children[__k] && !__closed[__children[__k]]){return true;}
      } return false;
    })});
    if(__signal.name==="SBT:EmpiricalDependencyReady:0"){__ready=true;}
    else{__closed[__signal.name.substring("SBT:ConcurrencyClosed:".length)]=true;}
  }
  sync({request:Event("SBT:EmpiricalDependencyPermit:0")});
});
bthread("sbt:cross-method:cross_method__update_delete__updateAlbumInfo__deleteAlbum", function(){
  var __paths=[];
  var __readyByName={};
  var __readyPrefix="InstanceReady:AlbumResponseDtos:";
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
    var __path="/albums/{id}";
    __path=__path.replace("{id}",String(__sbtReadPath(__ready,"id")));
    if(__path.indexOf("{")>=0 || __path.indexOf("undefined")>=0 || __paths.indexOf(__path)>=0){return;}
    __paths.push(__path);
  }
  var __body={"albumName":"sbt_generated_b_albumName"};
  sync({request:Event("SBT:EmpiricalDependencyReady:0")});
  sync({waitFor:Event("SBT:EmpiricalDependencyPermit:0")});
  for(var __j=0;__j<3;__j++){
    var __check="cross-baseline-0-"+__j;
    svc.get(__paths[__j],{headers:{"X-Provengo-Epoch-Id":__check,"X-Provengo-Operation-Id":__check+"-observe"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  }
  var __ctrl="cross-control-a-0";
  var __cp=__paths[0];
  svc.patch(__cp,{body:JSON.stringify(__body),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-0"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-0"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  svc.delete(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-1"},expectedResponseCodes:[204,400,401,403,404,409,410,422]});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-1"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  var __ctrl="cross-control-b-0";
  var __cp=__paths[1];
  svc.delete(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-0"},expectedResponseCodes:[204,400,401,403,404,409,410,422]});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-0"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  svc.patch(__cp,{body:JSON.stringify(__body),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-1"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-1"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"cross-method::update-delete::updateAlbumInfo::deleteAlbum"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __epoch="generated-epoch-0";
  var __ops=[{operation_id:__epoch+"-op-0",method:"PATCH",path:__paths[2],body:__body,headers:{"Content-Type":"application/json"}},
             {operation_id:__epoch+"-op-1",method:"DELETE",path:__paths[2],headers:{}}];
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"cross-method::update-delete::updateAlbumInfo::deleteAlbum",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__paths[2],{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"cross-method::update-delete::updateAlbumInfo::deleteAlbum",path:__paths[2]})});
});
bthread("sbt:cross-method:cross_method__update_delete__updateSharedLink__removeSharedLink", function(){
  var __paths=[];
  var __readyByName={};
  var __readyPrefix="InstanceReady:SharedLinkResponseDtos:";
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
    var __path="/shared-links/{id}";
    __path=__path.replace("{id}",String(__sbtReadPath(__ready,"id")));
    if(__path.indexOf("{")>=0 || __path.indexOf("undefined")>=0 || __paths.indexOf(__path)>=0){return;}
    __paths.push(__path);
  }
  var __body={"allowDownload":false};
  for(var __j=0;__j<3;__j++){
    var __check="cross-baseline-1-"+__j;
    svc.get(__paths[__j],{headers:{"X-Provengo-Epoch-Id":__check,"X-Provengo-Operation-Id":__check+"-observe"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  }
  var __ctrl="cross-control-a-1";
  var __cp=__paths[0];
  svc.patch(__cp,{body:JSON.stringify(__body),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-0"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-0"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  svc.delete(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-1"},expectedResponseCodes:[204,400,401,403,404,409,410,422]});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-1"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  var __ctrl="cross-control-b-1";
  var __cp=__paths[1];
  svc.delete(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-0"},expectedResponseCodes:[204,400,401,403,404,409,410,422]});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-0"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  svc.patch(__cp,{body:JSON.stringify(__body),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-op-1"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  svc.get(__cp,{headers:{"X-Provengo-Epoch-Id":__ctrl,"X-Provengo-Operation-Id":__ctrl+"-read-1"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  sync({request:Event("SBT:ConcurrencyReady:1",{oracle_id:"cross-method::update-delete::updateSharedLink::removeSharedLink"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:1")});
  var __epoch="generated-epoch-1";
  var __ops=[{operation_id:__epoch+"-op-0",method:"PATCH",path:__paths[2],body:__body,headers:{"Content-Type":"application/json"}},
             {operation_id:__epoch+"-op-1",method:"DELETE",path:__paths[2],headers:{}}];
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"cross-method::update-delete::updateSharedLink::removeSharedLink",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__paths[2],{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200,400,401,403,404,409,410,422]});
  sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"cross-method::update-delete::updateSharedLink::removeSharedLink",path:__paths[2]})});
});
function __sbtNamedEvent(__name){ return EventSet("SBT named event "+__name,function(e){return !!(e&&e.name===__name);}); }
function __sbtAnyConcurrencyReady(){ return EventSet("SBT any concurrency ready",function(e){return !!(e&&e.name&&e.name.indexOf("SBT:ConcurrencyReady:")===0);}); }
function __sbtAnyHttpDelete(){ return EventSet("SBT any HTTP DELETE",function(e){return !!(e&&e.name==="DELETE");}); }
function __sbtConcurrencyBusyBlock(){ return __sbtAnyConcurrencyReady(); }
bthread("sbt:concurrency-controller",function(){
  var __readySeen={}; var __readyCount=0; var __readyTotal=2;
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
