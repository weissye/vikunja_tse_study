//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for immich.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":243,"contract_verifiers":243,"mutations":125,"state_verified_mutations":18,"contract_only_mutations":107,"concurrency_oracles":20};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtReadPath(value,path){var parts=String(path).split("."); for(var i=0;i<parts.length;i++){if(value===null||typeof value==="undefined"){return undefined;} value=value[parts[i]];} return value;}
function __sbtCreateEvent(operationId){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__operationId===operationId && e.data.__httpResponse); }); }
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
bthread("sbt:concurrency:concurrency__same_field__updateNotification__readAt", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/notifications/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateNotification"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:0",{oracle_id:"concurrency::same-field::updateNotification::readAt",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::same-field::updateNotification::readAt",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __bodies = [{"readAt":"2026-01-01T00:00:00Z"},{"readAt":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::updateNotification::readAt",path:__path,reason:"baseline-unavailable"})});return;}
  var __requestFields = ["readAt"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  if(["readAt"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::updateNotification::readAt",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-0";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-0"; if(Object.keys(__reset).length){ svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::updateNotification::readAt",path:__path,reason:"sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateNotification::readAt",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::updateNotification::readAt",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateSharedLink__allowDownload__allowUpload", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:1",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:1",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:1")});
  var __bodies = [{"allowDownload":true},{"allowUpload":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload",path:__path,reason:"baseline-unavailable"})});return;}
  if(["allowDownload","allowUpload"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-1";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-1"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload",path:__path,reason:"sequential-control-failed"})});return;}
  var __reverseEpoch = "generated-reverse-control-1";
  var __reverseOk=true; var __reverseSucceeded={};
  for(var __r=__bodies.length-1;__r>=0;__r--){ var __ri=__r; svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__reverseOk=false;}else{__reverseSucceeded[__ri]=true; for(var __cf in __bodies[__ri]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__reverseOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __reverseSucceeded[__j]){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-1"; if(Object.keys(__resetReverse).length){svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__reverseOk=false;}}}); } }
  if(!__reverseOk){sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload",path:__path,reason:"reverse-sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-1";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::allowUpload",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateSharedLink__allowDownload__description", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:2",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::description",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:2",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::description",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:2")});
  var __bodies = [{"allowDownload":true},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::description",path:__path,reason:"baseline-unavailable"})});return;}
  if(["allowDownload","description"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::description",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-2";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-2"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::description",path:__path,reason:"sequential-control-failed"})});return;}
  var __reverseEpoch = "generated-reverse-control-2";
  var __reverseOk=true; var __reverseSucceeded={};
  for(var __r=__bodies.length-1;__r>=0;__r--){ var __ri=__r; svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__reverseOk=false;}else{__reverseSucceeded[__ri]=true; for(var __cf in __bodies[__ri]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__reverseOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __reverseSucceeded[__j]){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-2"; if(Object.keys(__resetReverse).length){svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__reverseOk=false;}}}); } }
  if(!__reverseOk){sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::description",path:__path,reason:"reverse-sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-2";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateSharedLink::allowDownload::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateSharedLink__allowDownload__expiresAt", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:3",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:3",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:3")});
  var __bodies = [{"allowDownload":true},{"expiresAt":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt",path:__path,reason:"baseline-unavailable"})});return;}
  if(["allowDownload","expiresAt"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-3";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-3"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt",path:__path,reason:"sequential-control-failed"})});return;}
  var __reverseEpoch = "generated-reverse-control-3";
  var __reverseOk=true; var __reverseSucceeded={};
  for(var __r=__bodies.length-1;__r>=0;__r--){ var __ri=__r; svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__reverseOk=false;}else{__reverseSucceeded[__ri]=true; for(var __cf in __bodies[__ri]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__reverseOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __reverseSucceeded[__j]){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-3"; if(Object.keys(__resetReverse).length){svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__reverseOk=false;}}}); } }
  if(!__reverseOk){sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt",path:__path,reason:"reverse-sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-3";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::expiresAt",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__updateSharedLink__allowDownload__password", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:4",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::password",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:4",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::password",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:4")});
  var __bodies = [{"allowDownload":true},{"password":"sbt_generated_b_password"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::password",path:__path,reason:"baseline-unavailable"})});return;}
  if(["allowDownload","password"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::password",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-4";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-4"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::password",path:__path,reason:"sequential-control-failed"})});return;}
  var __reverseEpoch = "generated-reverse-control-4";
  var __reverseOk=true; var __reverseSucceeded={};
  for(var __r=__bodies.length-1;__r>=0;__r--){ var __ri=__r; svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__reverseOk=false;}else{__reverseSucceeded[__ri]=true; for(var __cf in __bodies[__ri]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__reverseOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __reverseSucceeded[__j]){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-4"; if(Object.keys(__resetReverse).length){svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__reverseOk=false;}}}); } }
  if(!__reverseOk){sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::password",path:__path,reason:"reverse-sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-4";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::updateSharedLink::allowDownload::password",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::disjoint::updateSharedLink::allowDownload::password",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateSharedLink__allowDownload__allowUpload__description", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:5",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:5",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:5")});
  var __bodies = [{"allowDownload":true},{"allowUpload":false},{"description":"sbt_generated_c_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description",path:__path,reason:"baseline-unavailable"})});return;}
  if(["allowDownload","allowUpload","description"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-5";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-5"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description",path:__path,reason:"sequential-control-failed"})});return;}
  var __reverseEpoch = "generated-reverse-control-5";
  var __reverseOk=true; var __reverseSucceeded={};
  for(var __r=__bodies.length-1;__r>=0;__r--){ var __ri=__r; svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__reverseOk=false;}else{__reverseSucceeded[__ri]=true; for(var __cf in __bodies[__ri]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__reverseOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __reverseSucceeded[__j]){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-5"; if(Object.keys(__resetReverse).length){svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__reverseOk=false;}}}); } }
  if(!__reverseOk){sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description",path:__path,reason:"reverse-sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-5";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateSharedLink__allowDownload__allowUpload__expiresAt", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:6",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:6",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:6")});
  var __bodies = [{"allowDownload":true},{"allowUpload":false},{"expiresAt":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt",path:__path,reason:"baseline-unavailable"})});return;}
  if(["allowDownload","allowUpload","expiresAt"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-6";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-6"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt",path:__path,reason:"sequential-control-failed"})});return;}
  var __reverseEpoch = "generated-reverse-control-6";
  var __reverseOk=true; var __reverseSucceeded={};
  for(var __r=__bodies.length-1;__r>=0;__r--){ var __ri=__r; svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__reverseOk=false;}else{__reverseSucceeded[__ri]=true; for(var __cf in __bodies[__ri]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__reverseOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __reverseSucceeded[__j]){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-6"; if(Object.keys(__resetReverse).length){svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__reverseOk=false;}}}); } }
  if(!__reverseOk){sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt",path:__path,reason:"reverse-sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-6";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::expiresAt",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateSharedLink__allowDownload__allowUpload__password", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:7",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:7",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:7")});
  var __bodies = [{"allowDownload":true},{"allowUpload":false},{"password":"sbt_generated_c_password"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password",path:__path,reason:"baseline-unavailable"})});return;}
  if(["allowDownload","allowUpload","password"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-7";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-7"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password",path:__path,reason:"sequential-control-failed"})});return;}
  var __reverseEpoch = "generated-reverse-control-7";
  var __reverseOk=true; var __reverseSucceeded={};
  for(var __r=__bodies.length-1;__r>=0;__r--){ var __ri=__r; svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__reverseOk=false;}else{__reverseSucceeded[__ri]=true; for(var __cf in __bodies[__ri]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__reverseOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __reverseSucceeded[__j]){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-7"; if(Object.keys(__resetReverse).length){svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__reverseOk=false;}}}); } }
  if(!__reverseOk){sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password",path:__path,reason:"reverse-sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-7";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::password",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__updateSharedLink__allowDownload__allowUpload__showMetadata", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:8",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:8",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:8")});
  var __bodies = [{"allowDownload":true},{"allowUpload":false},{"showMetadata":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata",path:__path,reason:"baseline-unavailable"})});return;}
  if(["allowDownload","allowUpload","showMetadata"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-8";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-8"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata",path:__path,reason:"sequential-control-failed"})});return;}
  var __reverseEpoch = "generated-reverse-control-8";
  var __reverseOk=true; var __reverseSucceeded={};
  for(var __r=__bodies.length-1;__r>=0;__r--){ var __ri=__r; svc.patch(__path,{body:JSON.stringify(__bodies[__r]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-op-"+__r},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__reverseOk=false;}else{__reverseSucceeded[__ri]=true; for(var __cf in __bodies[__ri]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__reverseOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__reverseEpoch,"X-Provengo-Operation-Id":__reverseEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __resetReverse={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __reverseSucceeded[__j]){__resetReverse[__f]=__baseline[__f];}}} var __resetReverseEpoch="generated-reset-reverse-8"; if(Object.keys(__resetReverse).length){svc.patch(__path,{body:JSON.stringify(__resetReverse),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetReverseEpoch,"X-Provengo-Operation-Id":__resetReverseEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__reverseOk=false;}}}); } }
  if(!__reverseOk){sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata",path:__path,reason:"reverse-sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-8";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::disjoint3::updateSharedLink::allowDownload::allowUpload::showMetadata",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateSharedLink__allowDownload", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:9",{oracle_id:"concurrency::same-field::updateSharedLink::allowDownload",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:9",{oracle_id:"concurrency::same-field::updateSharedLink::allowDownload",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:9")});
  var __bodies = [{"allowDownload":true},{"allowDownload":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::updateSharedLink::allowDownload",path:__path,reason:"baseline-unavailable"})});return;}
  if(["allowDownload"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::updateSharedLink::allowDownload",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-9";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-9"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::updateSharedLink::allowDownload",path:__path,reason:"sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-9";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateSharedLink::allowDownload",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::updateSharedLink::allowDownload",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateSharedLink__allowUpload", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:10",{oracle_id:"concurrency::same-field::updateSharedLink::allowUpload",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:10",{oracle_id:"concurrency::same-field::updateSharedLink::allowUpload",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:10")});
  var __bodies = [{"allowUpload":true},{"allowUpload":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::updateSharedLink::allowUpload",path:__path,reason:"baseline-unavailable"})});return;}
  if(["allowUpload"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::updateSharedLink::allowUpload",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-10";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-10"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::updateSharedLink::allowUpload",path:__path,reason:"sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-10";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateSharedLink::allowUpload",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::updateSharedLink::allowUpload",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateSharedLink__description", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:11",{oracle_id:"concurrency::same-field::updateSharedLink::description",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:11",{oracle_id:"concurrency::same-field::updateSharedLink::description",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:11")});
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:11",{oracle_id:"concurrency::same-field::updateSharedLink::description",path:__path,reason:"baseline-unavailable"})});return;}
  if(["description"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:11",{oracle_id:"concurrency::same-field::updateSharedLink::description",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-11";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-11"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:11",{oracle_id:"concurrency::same-field::updateSharedLink::description",path:__path,reason:"sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-11";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateSharedLink::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:11",{oracle_id:"concurrency::same-field::updateSharedLink::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__updateSharedLink__expiresAt", function(){
  var __prefixStory=null; var __prefixCount=0; var __prefixStart=0; var __prefixEnd=0;
  var __prefixStreaks={};
  var __prefixPathPattern=new RegExp("^/shared\\-links/[^/]+$");
  while(__prefixCount < 7){
    var __step=sync({waitFor:EventSet("verified matching prefix round",function(e){return !!(e&&e.name==="SBT:PrefixVerified"&&e.data&&Number.isInteger(e.data.round)&&e.data.round>0&&typeof e.data.story==="string"&&typeof e.data.path==="string"&&
      e.data.operation_id==="updateSharedLink"&&__prefixPathPattern.test(e.data.path));})});
    var __d=__step.data; var __key=JSON.stringify([__d.story,__d.path]);
    var __prior=__prefixStreaks[__key];
    var __streak=(!__prior||__d.round!==__prior.end+1)?{start:__d.round,end:__d.round,length:1}:{start:__prior.start,end:__d.round,length:__prior.length+1};
    __prefixStreaks[__key]=__streak;
    if(__streak.length>=7){__prefixStory=__d.story; __path=__d.path; __prefixStart=__streak.start; __prefixEnd=__streak.end; __prefixCount=__streak.length;}
  }
  sync({request:Event("SBT:PrefixAdmitted:12",{oracle_id:"concurrency::same-field::updateSharedLink::expiresAt",path:__path,story:__prefixStory,start_round:__prefixStart,end_round:__prefixEnd,rounds:__prefixCount})});
  sync({request:Event("SBT:ConcurrencyReady:12",{oracle_id:"concurrency::same-field::updateSharedLink::expiresAt",prefix_story:__prefixStory,prefix_rounds:__prefixCount})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:12")});
  var __bodies = [{"expiresAt":"2026-01-01T00:00:00Z"},{"expiresAt":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  if(!__baseline){sync({request:Event("SBT:ConcurrencyClosed:12",{oracle_id:"concurrency::same-field::updateSharedLink::expiresAt",path:__path,reason:"baseline-unavailable"})});return;}
  if(["expiresAt"].some(function(__f){return __baseline[__f]===null || __baseline[__f]===undefined;})){sync({request:Event("SBT:ConcurrencyClosed:12",{oracle_id:"concurrency::same-field::updateSharedLink::expiresAt",path:__path,reason:"baseline-field-unrestorable"})});return;}
  var __controlEpoch = "generated-control-12";
  var __controlOk=true; var __controlSucceeded={};
  for(var __i=0;__i<__bodies.length;__i++){ var __ci=__i; svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200],callback:function(r){var __ok=[200].indexOf(r.code)>=0; if(!__ok){__controlOk=false;}else{__controlSucceeded[__ci]=true; for(var __cf in __bodies[__ci]){if(__baseline[__cf]===null || __baseline[__cf]===undefined){__controlOk=false;}}}}}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined && __baseline[__f]!==null && __controlSucceeded[__j]){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-12"; if(Object.keys(__reset).length){ svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200],callback:function(r){if([200].indexOf(r.code)<0){__controlOk=false;}}}); } }
  if(!__controlOk){sync({request:Event("SBT:ConcurrencyClosed:12",{oracle_id:"concurrency::same-field::updateSharedLink::expiresAt",path:__path,reason:"sequential-control-failed"})});return;}
  var __epoch = "generated-epoch-12";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json","X-Provengo-Prefix-Phase":"epoch","X-Provengo-Prefix-Story":__prefixStory,"X-Provengo-Prefix-Round":String(__prefixEnd),"X-Provengo-Prefix-Start-Round":String(__prefixStart)}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::updateSharedLink::expiresAt",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:12",{oracle_id:"concurrency::same-field::updateSharedLink::expiresAt",path:__path})});
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
function __sbtNamedEvent(__name){ return EventSet("SBT named event "+__name,function(e){return !!(e&&e.name===__name);}); }
function __sbtAnyConcurrencyReady(){ return EventSet("SBT any concurrency ready",function(e){return !!(e&&e.name&&e.name.indexOf("SBT:ConcurrencyReady:")===0);}); }
function __sbtAnyHttpDelete(){ return EventSet("SBT any HTTP DELETE",function(e){return !!(e&&e.name==="DELETE");}); }
function __sbtConcurrencyBusyBlock(){ return EventSet("SBT concurrency admission or cleanup",function(e){return !!(e&&e.name&&(e.name==="DELETE"||e.name.indexOf("SBT:ConcurrencyReady:")===0));}); }
bthread("sbt:concurrency-controller",function(){
  var __readySeen={}; var __readyCount=0; var __readyTotal=13;
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
