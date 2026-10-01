//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for immich.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":243,"contract_verifiers":243,"mutations":125,"state_verified_mutations":18,"contract_only_mutations":107,"concurrency_oracles":34};
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
bthread("sbt:resource-bridge:createNotification", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createNotification")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:Notifications:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"createNotification",ready_event:"InstanceReady:Notifications:1"})});
});
bthread("sbt:resource-bridge:createSharedLink", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  sync({request:Event("InstanceReady:SharedLinks:1",__resourceData)});
  sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"createSharedLink",ready_event:"InstanceReady:SharedLinks:1"})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateAlbumInfo__albumName__albumThumbnailAssetId", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::disjoint::updateAlbumInfo::albumName::albumThumbnailAssetId"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"albumName":"sbt_generated_a_albumName"},{"albumThumbnailAssetId":"00000000-0000-4000-8000-000000000002"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-0";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-0"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-0";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-0"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateAlbumInfo::albumName::albumThumbnailAssetId",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::disjoint::updateAlbumInfo::albumName::albumThumbnailAssetId",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateAlbumInfo__albumName__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:1",{oracle_id:"concurrency::disjoint::updateAlbumInfo::albumName::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:1")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"albumName":"sbt_generated_a_albumName"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-1";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-1"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-1";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-1"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-1";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateAlbumInfo::albumName::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::disjoint::updateAlbumInfo::albumName::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateAlbumInfo__albumName__isActivityEnabled", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:2",{oracle_id:"concurrency::disjoint::updateAlbumInfo::albumName::isActivityEnabled"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:2")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"albumName":"sbt_generated_a_albumName"},{"isActivityEnabled":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-2";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-2"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-2";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-2"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-2";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateAlbumInfo::albumName::isActivityEnabled",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::disjoint::updateAlbumInfo::albumName::isActivityEnabled",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateAlbumInfo__albumName__order", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:3",{oracle_id:"concurrency::disjoint::updateAlbumInfo::albumName::order"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:3")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"albumName":"sbt_generated_a_albumName"},{"order":"desc"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-3";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-3"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-3";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-3"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-3";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateAlbumInfo::albumName::order",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::disjoint::updateAlbumInfo::albumName::order",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateAlbumInfo__albumName__albumThumbnailAssetId__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:4",{oracle_id:"concurrency::disjoint3::updateAlbumInfo::albumName::albumThumbnailAssetId::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:4")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"albumName":"sbt_generated_a_albumName"},{"albumThumbnailAssetId":"00000000-0000-4000-8000-000000000002"},{"description":"sbt_generated_c_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-4";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-4"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-4";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-4"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-4";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateAlbumInfo::albumName::albumThumbnailAssetId::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::disjoint3::updateAlbumInfo::albumName::albumThumbnailAssetId::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateAlbumInfo__albumName__albumThumbnailAssetId__isActivityEnabled", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:5",{oracle_id:"concurrency::disjoint3::updateAlbumInfo::albumName::albumThumbnailAssetId::isActivityEnabled"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:5")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"albumName":"sbt_generated_a_albumName"},{"albumThumbnailAssetId":"00000000-0000-4000-8000-000000000002"},{"isActivityEnabled":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-5";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-5"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-5";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-5"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-5";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateAlbumInfo::albumName::albumThumbnailAssetId::isActivityEnabled",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::disjoint3::updateAlbumInfo::albumName::albumThumbnailAssetId::isActivityEnabled",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateAlbumInfo__albumName__albumThumbnailAssetId__order", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:6",{oracle_id:"concurrency::disjoint3::updateAlbumInfo::albumName::albumThumbnailAssetId::order"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:6")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"albumName":"sbt_generated_a_albumName"},{"albumThumbnailAssetId":"00000000-0000-4000-8000-000000000002"},{"order":"desc"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-6";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-6"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-6";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-6"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-6";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateAlbumInfo::albumName::albumThumbnailAssetId::order",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::disjoint3::updateAlbumInfo::albumName::albumThumbnailAssetId::order",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateAlbumInfo__albumName__description__isActivityEnabled", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:7",{oracle_id:"concurrency::disjoint3::updateAlbumInfo::albumName::description::isActivityEnabled"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:7")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"albumName":"sbt_generated_a_albumName"},{"description":"sbt_generated_b_description"},{"isActivityEnabled":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-7";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-7"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-7";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-7"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-7";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateAlbumInfo::albumName::description::isActivityEnabled",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::disjoint3::updateAlbumInfo::albumName::description::isActivityEnabled",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateAlbumInfo__albumName", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:8",{oracle_id:"concurrency::same-field::updateAlbumInfo::albumName"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:8")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"albumName":"sbt_generated_a_albumName"},{"albumName":"sbt_generated_b_albumName"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-8";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-8"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-8";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateAlbumInfo::albumName",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::same-field::updateAlbumInfo::albumName",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateAlbumInfo__albumThumbnailAssetId", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:9",{oracle_id:"concurrency::same-field::updateAlbumInfo::albumThumbnailAssetId"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:9")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"albumThumbnailAssetId":"00000000-0000-4000-8000-000000000001"},{"albumThumbnailAssetId":"00000000-0000-4000-8000-000000000002"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-9";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-9"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-9";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateAlbumInfo::albumThumbnailAssetId",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::updateAlbumInfo::albumThumbnailAssetId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateAlbumInfo__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:10",{oracle_id:"concurrency::same-field::updateAlbumInfo::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:10")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-10";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-10"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-10";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateAlbumInfo::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::updateAlbumInfo::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateAlbumInfo__isActivityEnabled", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createAlbum")});
  sync({request:Event("SBT:ConcurrencyReady:11",{oracle_id:"concurrency::same-field::updateAlbumInfo::isActivityEnabled"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:11")});
  var __path = "/albums/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"isActivityEnabled":true},{"isActivityEnabled":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-11";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-11"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-11";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateAlbumInfo::isActivityEnabled",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:11",{oracle_id:"concurrency::same-field::updateAlbumInfo::isActivityEnabled",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateNotification__readAt", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createNotification")});
  sync({request:Event("SBT:ConcurrencyReady:12",{oracle_id:"concurrency::same-field::updateNotification::readAt"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:12")});
  var __path = "/notifications/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"readAt":"2026-01-01T00:00:00Z"},{"readAt":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["readAt"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-12";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-12"; svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-12";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateNotification::readAt",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:12",{oracle_id:"concurrency::same-field::updateNotification::readAt",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateSharedLink__allowDownload__allowUpload", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:13",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:13")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"allowDownload":true},{"allowUpload":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-13";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-13"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-13";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-13"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-13";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:13",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateSharedLink__allowDownload__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:14",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:14")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"allowDownload":true},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-14";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-14"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-14";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-14"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-14";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateSharedLink::allowDownload::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:14",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateSharedLink__allowDownload__expiresAt", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:15",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:15")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"allowDownload":true},{"expiresAt":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-15";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-15"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-15";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-15"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-15";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:15",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateSharedLink__allowDownload__password", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:16",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::password"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:16")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"allowDownload":true},{"password":"sbt_generated_b_password"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-16";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-16"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-16";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-16"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-16";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateSharedLink::allowDownload::password",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:16",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::password",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateSharedLink__allowDownload__allowUpload__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:17",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:17")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"allowDownload":true},{"allowUpload":false},{"description":"sbt_generated_c_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-17";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-17"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-17";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-17"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-17";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:17",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateSharedLink__allowDownload__allowUpload__expiresAt", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:18",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:18")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"allowDownload":true},{"allowUpload":false},{"expiresAt":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-18";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-18"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-18";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-18"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-18";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:18",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateSharedLink__allowDownload__allowUpload__password", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:19",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:19")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"allowDownload":true},{"allowUpload":false},{"password":"sbt_generated_c_password"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-19";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-19"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-19";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-19"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-19";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:19",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateSharedLink__allowDownload__allowUpload__showMetadata", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:20",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:20")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"allowDownload":true},{"allowUpload":false},{"showMetadata":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-20";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-20"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __reverseEpoch = "generated-reverse-control-20";
  for(var __r=__bodies.length-1;__r>=0;__r--){ svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-20"; svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-20";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:20",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateSharedLink__allowDownload", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:21",{oracle_id:"concurrency::same-field::updateSharedLink::allowDownload"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:21")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"allowDownload":true},{"allowDownload":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-21";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-21"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-21";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateSharedLink::allowDownload",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:21",{oracle_id:"concurrency::same-field::updateSharedLink::allowDownload",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateSharedLink__allowUpload", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:22",{oracle_id:"concurrency::same-field::updateSharedLink::allowUpload"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:22")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"allowUpload":true},{"allowUpload":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-22";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-22"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-22";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateSharedLink::allowUpload",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:22",{oracle_id:"concurrency::same-field::updateSharedLink::allowUpload",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateSharedLink__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:23",{oracle_id:"concurrency::same-field::updateSharedLink::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:23")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-23";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-23"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-23";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateSharedLink::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:23",{oracle_id:"concurrency::same-field::updateSharedLink::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateSharedLink__expiresAt", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createSharedLink")});
  sync({request:Event("SBT:ConcurrencyReady:24",{oracle_id:"concurrency::same-field::updateSharedLink::expiresAt"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:24")});
  var __path = "/shared-links/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"expiresAt":"2026-01-01T00:00:00Z"},{"expiresAt":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-24";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-24"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-24";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateSharedLink::expiresAt",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:24",{oracle_id:"concurrency::same-field::updateSharedLink::expiresAt",path:__path})});
});
function __sbtNamedEvent(__name){ return EventSet("SBT named event "+__name,function(e){return !!(e&&e.name===__name);}); }
function __sbtAnyConcurrencyReady(){ return EventSet("SBT any concurrency ready",function(e){return !!(e&&e.name&&e.name.indexOf("SBT:ConcurrencyReady:")===0);}); }
function __sbtAnyHttpDelete(){ return EventSet("SBT any HTTP DELETE",function(e){return !!(e&&e.name==="DELETE");}); }
function __sbtConcurrencyBusyBlock(){ return EventSet("SBT concurrency admission or cleanup",function(e){return !!(e&&e.name&&(e.name==="DELETE"||e.name.indexOf("SBT:ConcurrencyReady:")===0));}); }
bthread("sbt:concurrency-controller",function(){
  var __readySeen={}; var __readyCount=0; var __readyTotal=25;
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
