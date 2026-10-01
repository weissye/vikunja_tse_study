//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for vikunja.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":29,"contract_verifiers":29,"mutations":20,"state_verified_mutations":12,"contract_only_mutations":8,"concurrency_oracles":71};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtCreateEvent(entityKey){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__entityKey===entityKey && e.data.__httpResponse); }); }
bthread("sbt:concurrency:concurrency__same_field__labels_update__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("labels")});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::same-field::labels-update::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __path = "/labels/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","hex_color","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-0";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::labels-update::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::labels-update::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__labels_update__hex_color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("labels")});
  sync({request:Event("SBT:ConcurrencyReady:1",{oracle_id:"concurrency::same-field::labels-update::hex_color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:1")});
  var __path = "/labels/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"hex_color":"sbt_generated_a_hex_color"},{"hex_color":"sbt_generated_b_hex_color"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","hex_color","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-1";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-1";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::labels-update::hex_color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::same-field::labels-update::hex_color",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__labels_update__title", function(){
  var __created = sync({waitFor:__sbtCreateEvent("labels")});
  sync({request:Event("SBT:ConcurrencyReady:2",{oracle_id:"concurrency::same-field::labels-update::title"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:2")});
  var __path = "/labels/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"title":"sbt_generated_a_title"},{"title":"sbt_generated_b_title"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","hex_color","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-2";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-2";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::labels-update::title",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::same-field::labels-update::title",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_labels_read__description__hex_color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("labels")});
  sync({request:Event("SBT:ConcurrencyReady:3",{oracle_id:"concurrency::disjoint::patch-labels-read::description::hex_color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:3")});
  var __path = "/labels/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"hex_color":"sbt_generated_b_hex_color"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-3";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-3";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-labels-read::description::hex_color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::disjoint::patch-labels-read::description::hex_color",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_labels_read__description__title", function(){
  var __created = sync({waitFor:__sbtCreateEvent("labels")});
  sync({request:Event("SBT:ConcurrencyReady:4",{oracle_id:"concurrency::disjoint::patch-labels-read::description::title"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:4")});
  var __path = "/labels/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"title":"sbt_generated_b_title"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-4";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-4";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-labels-read::description::title",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::disjoint::patch-labels-read::description::title",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_labels_read__hex_color__title", function(){
  var __created = sync({waitFor:__sbtCreateEvent("labels")});
  sync({request:Event("SBT:ConcurrencyReady:5",{oracle_id:"concurrency::disjoint::patch-labels-read::hex_color::title"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:5")});
  var __path = "/labels/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"hex_color":"sbt_generated_a_hex_color"},{"title":"sbt_generated_b_title"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-5";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-5";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-labels-read::hex_color::title",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::disjoint::patch-labels-read::hex_color::title",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_labels_read__description__hex_color__title", function(){
  var __created = sync({waitFor:__sbtCreateEvent("labels")});
  sync({request:Event("SBT:ConcurrencyReady:6",{oracle_id:"concurrency::disjoint3::patch-labels-read::description::hex_color::title"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:6")});
  var __path = "/labels/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"hex_color":"sbt_generated_b_hex_color"},{"title":"sbt_generated_c_title"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-6";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-6";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-labels-read::description::hex_color::title",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::disjoint3::patch-labels-read::description::hex_color::title",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_labels_read__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("labels")});
  sync({request:Event("SBT:ConcurrencyReady:7",{oracle_id:"concurrency::same-field::patch-labels-read::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:7")});
  var __path = "/labels/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-7";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-7";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-labels-read::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::same-field::patch-labels-read::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_labels_read__hex_color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("labels")});
  sync({request:Event("SBT:ConcurrencyReady:8",{oracle_id:"concurrency::same-field::patch-labels-read::hex_color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:8")});
  var __path = "/labels/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"hex_color":"sbt_generated_a_hex_color"},{"hex_color":"sbt_generated_b_hex_color"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-8";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-8";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-labels-read::hex_color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::same-field::patch-labels-read::hex_color",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_labels_read__title", function(){
  var __created = sync({waitFor:__sbtCreateEvent("labels")});
  sync({request:Event("SBT:ConcurrencyReady:9",{oracle_id:"concurrency::same-field::patch-labels-read::title"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:9")});
  var __path = "/labels/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"title":"sbt_generated_a_title"},{"title":"sbt_generated_b_title"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-9";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-9";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-labels-read::title",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::patch-labels-read::title",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__projects_update__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:10",{oracle_id:"concurrency::same-field::projects-update::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:10")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","hex_color","identifier","is_archived","is_favorite","parent_project_id","position","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-10";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-10";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::projects-update::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::projects-update::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__projects_update__hex_color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:11",{oracle_id:"concurrency::same-field::projects-update::hex_color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:11")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"hex_color":"sbt_generated_a_hex_color"},{"hex_color":"sbt_generated_b_hex_color"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","hex_color","identifier","is_archived","is_favorite","parent_project_id","position","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-11";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-11";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::projects-update::hex_color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:11",{oracle_id:"concurrency::same-field::projects-update::hex_color",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__projects_update__identifier", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:12",{oracle_id:"concurrency::same-field::projects-update::identifier"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:12")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"identifier":"sbt_generated_a_identifier"},{"identifier":"sbt_generated_b_identifier"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","hex_color","identifier","is_archived","is_favorite","parent_project_id","position","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-12";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-12";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::projects-update::identifier",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:12",{oracle_id:"concurrency::same-field::projects-update::identifier",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__projects_update__is_archived", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:13",{oracle_id:"concurrency::same-field::projects-update::is_archived"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:13")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"is_archived":true},{"is_archived":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","hex_color","identifier","is_archived","is_favorite","parent_project_id","position","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-13";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-13";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::projects-update::is_archived",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:13",{oracle_id:"concurrency::same-field::projects-update::is_archived",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__projects_update__is_favorite", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:14",{oracle_id:"concurrency::same-field::projects-update::is_favorite"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:14")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"is_favorite":true},{"is_favorite":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","hex_color","identifier","is_archived","is_favorite","parent_project_id","position","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-14";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-14";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::projects-update::is_favorite",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:14",{oracle_id:"concurrency::same-field::projects-update::is_favorite",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__projects_update__parent_project_id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:15",{oracle_id:"concurrency::same-field::projects-update::parent_project_id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:15")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"parent_project_id":1},{"parent_project_id":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","hex_color","identifier","is_archived","is_favorite","parent_project_id","position","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-15";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-15";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::projects-update::parent_project_id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:15",{oracle_id:"concurrency::same-field::projects-update::parent_project_id",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_projects_read__description__hex_color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:16",{oracle_id:"concurrency::disjoint::patch-projects-read::description::hex_color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:16")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"hex_color":"sbt_generated_b_hex_color"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-16";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-16";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-projects-read::description::hex_color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:16",{oracle_id:"concurrency::disjoint::patch-projects-read::description::hex_color",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_projects_read__description__identifier", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:17",{oracle_id:"concurrency::disjoint::patch-projects-read::description::identifier"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:17")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"identifier":"sbt_generated_b_identifier"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-17";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-17";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-projects-read::description::identifier",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:17",{oracle_id:"concurrency::disjoint::patch-projects-read::description::identifier",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_projects_read__description__is_archived", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:18",{oracle_id:"concurrency::disjoint::patch-projects-read::description::is_archived"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:18")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"is_archived":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-18";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-18";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-projects-read::description::is_archived",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:18",{oracle_id:"concurrency::disjoint::patch-projects-read::description::is_archived",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_projects_read__description__is_favorite", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:19",{oracle_id:"concurrency::disjoint::patch-projects-read::description::is_favorite"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:19")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"is_favorite":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-19";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-19";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-projects-read::description::is_favorite",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:19",{oracle_id:"concurrency::disjoint::patch-projects-read::description::is_favorite",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_projects_read__description__parent_project_id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:20",{oracle_id:"concurrency::disjoint::patch-projects-read::description::parent_project_id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:20")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"parent_project_id":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-20";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-20";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-projects-read::description::parent_project_id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:20",{oracle_id:"concurrency::disjoint::patch-projects-read::description::parent_project_id",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_projects_read__description__position", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:21",{oracle_id:"concurrency::disjoint::patch-projects-read::description::position"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:21")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"position":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-21";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-21";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-projects-read::description::position",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:21",{oracle_id:"concurrency::disjoint::patch-projects-read::description::position",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_projects_read__description__hex_color__identifier", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:22",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::identifier"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:22")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"hex_color":"sbt_generated_b_hex_color"},{"identifier":"sbt_generated_c_identifier"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-22";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-22";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-projects-read::description::hex_color::identifier",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:22",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::identifier",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_projects_read__description__hex_color__is_archived", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:23",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::is_archived"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:23")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"hex_color":"sbt_generated_b_hex_color"},{"is_archived":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-23";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-23";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-projects-read::description::hex_color::is_archived",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:23",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::is_archived",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_projects_read__description__hex_color__is_favorite", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:24",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::is_favorite"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:24")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"hex_color":"sbt_generated_b_hex_color"},{"is_favorite":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-24";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-24";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-projects-read::description::hex_color::is_favorite",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:24",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::is_favorite",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_projects_read__description__hex_color__parent_project_id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:25",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::parent_project_id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:25")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"hex_color":"sbt_generated_b_hex_color"},{"parent_project_id":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-25";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-25";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-projects-read::description::hex_color::parent_project_id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:25",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::parent_project_id",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_projects_read__description__hex_color__position", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:26",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::position"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:26")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"hex_color":"sbt_generated_b_hex_color"},{"position":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-26";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-26";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-projects-read::description::hex_color::position",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:26",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::position",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_projects_read__description__hex_color__title", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:27",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::title"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:27")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"hex_color":"sbt_generated_b_hex_color"},{"title":"sbt_generated_c_title"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-27";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-27";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-projects-read::description::hex_color::title",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:27",{oracle_id:"concurrency::disjoint3::patch-projects-read::description::hex_color::title",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_projects_read__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:28",{oracle_id:"concurrency::same-field::patch-projects-read::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:28")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-28";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-28";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-projects-read::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:28",{oracle_id:"concurrency::same-field::patch-projects-read::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_projects_read__hex_color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:29",{oracle_id:"concurrency::same-field::patch-projects-read::hex_color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:29")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"hex_color":"sbt_generated_a_hex_color"},{"hex_color":"sbt_generated_b_hex_color"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-29";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-29";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-projects-read::hex_color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:29",{oracle_id:"concurrency::same-field::patch-projects-read::hex_color",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_projects_read__identifier", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:30",{oracle_id:"concurrency::same-field::patch-projects-read::identifier"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:30")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"identifier":"sbt_generated_a_identifier"},{"identifier":"sbt_generated_b_identifier"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-30";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-30";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-projects-read::identifier",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:30",{oracle_id:"concurrency::same-field::patch-projects-read::identifier",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_projects_read__is_archived", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:31",{oracle_id:"concurrency::same-field::patch-projects-read::is_archived"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:31")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"is_archived":true},{"is_archived":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-31";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-31";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-projects-read::is_archived",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:31",{oracle_id:"concurrency::same-field::patch-projects-read::is_archived",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_projects_read__is_favorite", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:32",{oracle_id:"concurrency::same-field::patch-projects-read::is_favorite"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:32")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"is_favorite":true},{"is_favorite":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-32";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-32";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-projects-read::is_favorite",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:32",{oracle_id:"concurrency::same-field::patch-projects-read::is_favorite",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_projects_read__parent_project_id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("projects")});
  sync({request:Event("SBT:ConcurrencyReady:33",{oracle_id:"concurrency::same-field::patch-projects-read::parent_project_id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:33")});
  var __path = "/projects/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"parent_project_id":1},{"parent_project_id":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-33";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-33";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-projects-read::parent_project_id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:33",{oracle_id:"concurrency::same-field::patch-projects-read::parent_project_id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__tasks_update__bucket_id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:34",{oracle_id:"concurrency::same-field::tasks-update::bucket_id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:34")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"bucket_id":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["bucket_id","cover_image_attachment_id","description","done","due_date","end_date","hex_color","is_favorite","percent_done","priority","project_id","repeat_after","repeat_mode","start_date","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-34";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-34";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::tasks-update::bucket_id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:34",{oracle_id:"concurrency::same-field::tasks-update::bucket_id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__tasks_update__cover_image_attachment_id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:35",{oracle_id:"concurrency::same-field::tasks-update::cover_image_attachment_id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:35")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"cover_image_attachment_id":1},{"cover_image_attachment_id":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["bucket_id","cover_image_attachment_id","description","done","due_date","end_date","hex_color","is_favorite","percent_done","priority","project_id","repeat_after","repeat_mode","start_date","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-35";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-35";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::tasks-update::cover_image_attachment_id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:35",{oracle_id:"concurrency::same-field::tasks-update::cover_image_attachment_id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__tasks_update__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:36",{oracle_id:"concurrency::same-field::tasks-update::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:36")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["bucket_id","cover_image_attachment_id","description","done","due_date","end_date","hex_color","is_favorite","percent_done","priority","project_id","repeat_after","repeat_mode","start_date","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-36";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-36";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::tasks-update::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:36",{oracle_id:"concurrency::same-field::tasks-update::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__tasks_update__done", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:37",{oracle_id:"concurrency::same-field::tasks-update::done"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:37")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"done":true},{"done":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["bucket_id","cover_image_attachment_id","description","done","due_date","end_date","hex_color","is_favorite","percent_done","priority","project_id","repeat_after","repeat_mode","start_date","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-37";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-37";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::tasks-update::done",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:37",{oracle_id:"concurrency::same-field::tasks-update::done",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__tasks_update__due_date", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:38",{oracle_id:"concurrency::same-field::tasks-update::due_date"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:38")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"due_date":"sbt_generated_a_due_date"},{"due_date":"sbt_generated_b_due_date"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["bucket_id","cover_image_attachment_id","description","done","due_date","end_date","hex_color","is_favorite","percent_done","priority","project_id","repeat_after","repeat_mode","start_date","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-38";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-38";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::tasks-update::due_date",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:38",{oracle_id:"concurrency::same-field::tasks-update::due_date",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__tasks_update__end_date", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:39",{oracle_id:"concurrency::same-field::tasks-update::end_date"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:39")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"end_date":"sbt_generated_a_end_date"},{"end_date":"sbt_generated_b_end_date"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["bucket_id","cover_image_attachment_id","description","done","due_date","end_date","hex_color","is_favorite","percent_done","priority","project_id","repeat_after","repeat_mode","start_date","title"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-39";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-39";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::tasks-update::end_date",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:39",{oracle_id:"concurrency::same-field::tasks-update::end_date",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_tasks_read__bucket_id__cover_image_attachment_id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:40",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::cover_image_attachment_id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:40")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"cover_image_attachment_id":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-40";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-40";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-tasks-read::bucket_id::cover_image_attachment_id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:40",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::cover_image_attachment_id",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_tasks_read__bucket_id__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:41",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:41")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-41";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-41";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-tasks-read::bucket_id::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:41",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_tasks_read__bucket_id__done", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:42",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::done"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:42")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"done":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-42";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-42";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-tasks-read::bucket_id::done",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:42",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::done",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_tasks_read__bucket_id__due_date", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:43",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::due_date"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:43")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"due_date":"sbt_generated_b_due_date"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-43";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-43";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-tasks-read::bucket_id::due_date",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:43",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::due_date",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_tasks_read__bucket_id__end_date", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:44",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::end_date"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:44")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"end_date":"sbt_generated_b_end_date"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-44";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-44";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-tasks-read::bucket_id::end_date",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:44",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::end_date",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint__patch_tasks_read__bucket_id__hex_color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:45",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::hex_color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:45")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"hex_color":"sbt_generated_b_hex_color"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-45";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-45";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint::patch-tasks-read::bucket_id::hex_color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:45",{oracle_id:"concurrency::disjoint::patch-tasks-read::bucket_id::hex_color",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_tasks_read__bucket_id__cover_image_attachment_id__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:46",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:46")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"cover_image_attachment_id":2},{"description":"sbt_generated_c_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-46";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-46";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:46",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_tasks_read__bucket_id__cover_image_attachment_id__done", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:47",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::done"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:47")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"cover_image_attachment_id":2},{"done":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-47";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-47";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::done",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:47",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::done",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_tasks_read__bucket_id__cover_image_attachment_id__due_date", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:48",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::due_date"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:48")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"cover_image_attachment_id":2},{"due_date":"sbt_generated_c_due_date"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-48";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-48";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::due_date",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:48",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::due_date",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_tasks_read__bucket_id__cover_image_attachment_id__end_date", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:49",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::end_date"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:49")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"cover_image_attachment_id":2},{"end_date":"sbt_generated_c_end_date"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-49";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-49";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::end_date",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:49",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::end_date",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_tasks_read__bucket_id__cover_image_attachment_id__hex_color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:50",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::hex_color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:50")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"cover_image_attachment_id":2},{"hex_color":"sbt_generated_c_hex_color"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-50";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-50";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::hex_color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:50",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::hex_color",path:__path})});
});
bthread("sbt:concurrency:concurrency__disjoint3__patch_tasks_read__bucket_id__cover_image_attachment_id__is_favorite", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:51",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::is_favorite"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:51")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"cover_image_attachment_id":2},{"is_favorite":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-51";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-51";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::is_favorite",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:51",{oracle_id:"concurrency::disjoint3::patch-tasks-read::bucket_id::cover_image_attachment_id::is_favorite",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_tasks_read__bucket_id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:52",{oracle_id:"concurrency::same-field::patch-tasks-read::bucket_id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:52")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"bucket_id":1},{"bucket_id":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-52";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-52";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-tasks-read::bucket_id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:52",{oracle_id:"concurrency::same-field::patch-tasks-read::bucket_id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_tasks_read__cover_image_attachment_id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:53",{oracle_id:"concurrency::same-field::patch-tasks-read::cover_image_attachment_id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:53")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"cover_image_attachment_id":1},{"cover_image_attachment_id":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-53";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-53";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-tasks-read::cover_image_attachment_id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:53",{oracle_id:"concurrency::same-field::patch-tasks-read::cover_image_attachment_id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_tasks_read__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:54",{oracle_id:"concurrency::same-field::patch-tasks-read::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:54")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-54";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-54";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-tasks-read::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:54",{oracle_id:"concurrency::same-field::patch-tasks-read::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_tasks_read__done", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:55",{oracle_id:"concurrency::same-field::patch-tasks-read::done"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:55")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"done":true},{"done":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-55";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-55";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-tasks-read::done",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:55",{oracle_id:"concurrency::same-field::patch-tasks-read::done",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_tasks_read__due_date", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:56",{oracle_id:"concurrency::same-field::patch-tasks-read::due_date"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:56")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"due_date":"sbt_generated_a_due_date"},{"due_date":"sbt_generated_b_due_date"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-56";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-56";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-tasks-read::due_date",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:56",{oracle_id:"concurrency::same-field::patch-tasks-read::due_date",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_tasks_read__end_date", function(){
  var __created = sync({waitFor:__sbtCreateEvent("tasks")});
  sync({request:Event("SBT:ConcurrencyReady:57",{oracle_id:"concurrency::same-field::patch-tasks-read::end_date"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:57")});
  var __path = "/tasks/{task}";
  __path = __path.replace("{task}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"end_date":"sbt_generated_a_end_date"},{"end_date":"sbt_generated_b_end_date"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-57";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-57";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-tasks-read::end_date",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:57",{oracle_id:"concurrency::same-field::patch-tasks-read::end_date",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__task_comments_update__comment", function(){
  var __created = sync({waitFor:__sbtCreateEvent("task-comments")});
  sync({request:Event("SBT:ConcurrencyReady:58",{oracle_id:"concurrency::same-field::task-comments-update::comment"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:58")});
  var __path = "/tasks/{task}/comments/{commentid}";
  __path = __path.replace("{commentid}", String(__created.data.__httpResponse["id"]));
  __path = __path.replace("{task}", String(__created.data["task"]));
  var __bodies = [{"comment":"sbt_generated_a_comment"},{"comment":"sbt_generated_b_comment"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["comment"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-58";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-58";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::task-comments-update::comment",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:58",{oracle_id:"concurrency::same-field::task-comments-update::comment",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__patch_task_comments_read__comment", function(){
  var __created = sync({waitFor:__sbtCreateEvent("task-comments")});
  sync({request:Event("SBT:ConcurrencyReady:59",{oracle_id:"concurrency::same-field::patch-task-comments-read::comment"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:59")});
  var __path = "/tasks/{task}/comments/{commentid}";
  __path = __path.replace("{commentid}", String(__created.data.__httpResponse["id"]));
  __path = __path.replace("{task}", String(__created.data["task"]));
  var __bodies = [{"comment":"sbt_generated_a_comment"},{"comment":"sbt_generated_b_comment"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-59";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/merge-patch+json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-59";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::patch-task-comments-read::comment",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:59",{oracle_id:"concurrency::same-field::patch-task-comments-read::comment",path:__path})});
});
bthread("sbt:concurrency-controller",function(){
  sync({waitFor:Event("SBT:ConcurrencyReady:0")});
  sync({request:Event("SBT:ConcurrencyPermit:0")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:0")});
  sync({waitFor:Event("SBT:ConcurrencyReady:1")});
  sync({request:Event("SBT:ConcurrencyPermit:1")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:1")});
  sync({waitFor:Event("SBT:ConcurrencyReady:2")});
  sync({request:Event("SBT:ConcurrencyPermit:2")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:2")});
  sync({waitFor:Event("SBT:ConcurrencyReady:3")});
  sync({request:Event("SBT:ConcurrencyPermit:3")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:3")});
  sync({waitFor:Event("SBT:ConcurrencyReady:4")});
  sync({request:Event("SBT:ConcurrencyPermit:4")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:4")});
  sync({waitFor:Event("SBT:ConcurrencyReady:5")});
  sync({request:Event("SBT:ConcurrencyPermit:5")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:5")});
  sync({waitFor:Event("SBT:ConcurrencyReady:6")});
  sync({request:Event("SBT:ConcurrencyPermit:6")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:6")});
  sync({waitFor:Event("SBT:ConcurrencyReady:7")});
  sync({request:Event("SBT:ConcurrencyPermit:7")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:7")});
  sync({waitFor:Event("SBT:ConcurrencyReady:8")});
  sync({request:Event("SBT:ConcurrencyPermit:8")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:8")});
  sync({waitFor:Event("SBT:ConcurrencyReady:9")});
  sync({request:Event("SBT:ConcurrencyPermit:9")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:9")});
  sync({waitFor:Event("SBT:ConcurrencyReady:10")});
  sync({request:Event("SBT:ConcurrencyPermit:10")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:10")});
  sync({waitFor:Event("SBT:ConcurrencyReady:11")});
  sync({request:Event("SBT:ConcurrencyPermit:11")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:11")});
  sync({waitFor:Event("SBT:ConcurrencyReady:12")});
  sync({request:Event("SBT:ConcurrencyPermit:12")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:12")});
  sync({waitFor:Event("SBT:ConcurrencyReady:13")});
  sync({request:Event("SBT:ConcurrencyPermit:13")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:13")});
  sync({waitFor:Event("SBT:ConcurrencyReady:14")});
  sync({request:Event("SBT:ConcurrencyPermit:14")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:14")});
  sync({waitFor:Event("SBT:ConcurrencyReady:15")});
  sync({request:Event("SBT:ConcurrencyPermit:15")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:15")});
  sync({waitFor:Event("SBT:ConcurrencyReady:16")});
  sync({request:Event("SBT:ConcurrencyPermit:16")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:16")});
  sync({waitFor:Event("SBT:ConcurrencyReady:17")});
  sync({request:Event("SBT:ConcurrencyPermit:17")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:17")});
  sync({waitFor:Event("SBT:ConcurrencyReady:18")});
  sync({request:Event("SBT:ConcurrencyPermit:18")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:18")});
  sync({waitFor:Event("SBT:ConcurrencyReady:19")});
  sync({request:Event("SBT:ConcurrencyPermit:19")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:19")});
  sync({waitFor:Event("SBT:ConcurrencyReady:20")});
  sync({request:Event("SBT:ConcurrencyPermit:20")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:20")});
  sync({waitFor:Event("SBT:ConcurrencyReady:21")});
  sync({request:Event("SBT:ConcurrencyPermit:21")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:21")});
  sync({waitFor:Event("SBT:ConcurrencyReady:22")});
  sync({request:Event("SBT:ConcurrencyPermit:22")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:22")});
  sync({waitFor:Event("SBT:ConcurrencyReady:23")});
  sync({request:Event("SBT:ConcurrencyPermit:23")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:23")});
  sync({waitFor:Event("SBT:ConcurrencyReady:24")});
  sync({request:Event("SBT:ConcurrencyPermit:24")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:24")});
  sync({waitFor:Event("SBT:ConcurrencyReady:25")});
  sync({request:Event("SBT:ConcurrencyPermit:25")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:25")});
  sync({waitFor:Event("SBT:ConcurrencyReady:26")});
  sync({request:Event("SBT:ConcurrencyPermit:26")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:26")});
  sync({waitFor:Event("SBT:ConcurrencyReady:27")});
  sync({request:Event("SBT:ConcurrencyPermit:27")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:27")});
  sync({waitFor:Event("SBT:ConcurrencyReady:28")});
  sync({request:Event("SBT:ConcurrencyPermit:28")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:28")});
  sync({waitFor:Event("SBT:ConcurrencyReady:29")});
  sync({request:Event("SBT:ConcurrencyPermit:29")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:29")});
  sync({waitFor:Event("SBT:ConcurrencyReady:30")});
  sync({request:Event("SBT:ConcurrencyPermit:30")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:30")});
  sync({waitFor:Event("SBT:ConcurrencyReady:31")});
  sync({request:Event("SBT:ConcurrencyPermit:31")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:31")});
  sync({waitFor:Event("SBT:ConcurrencyReady:32")});
  sync({request:Event("SBT:ConcurrencyPermit:32")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:32")});
  sync({waitFor:Event("SBT:ConcurrencyReady:33")});
  sync({request:Event("SBT:ConcurrencyPermit:33")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:33")});
  sync({waitFor:Event("SBT:ConcurrencyReady:34")});
  sync({request:Event("SBT:ConcurrencyPermit:34")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:34")});
  sync({waitFor:Event("SBT:ConcurrencyReady:35")});
  sync({request:Event("SBT:ConcurrencyPermit:35")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:35")});
  sync({waitFor:Event("SBT:ConcurrencyReady:36")});
  sync({request:Event("SBT:ConcurrencyPermit:36")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:36")});
  sync({waitFor:Event("SBT:ConcurrencyReady:37")});
  sync({request:Event("SBT:ConcurrencyPermit:37")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:37")});
  sync({waitFor:Event("SBT:ConcurrencyReady:38")});
  sync({request:Event("SBT:ConcurrencyPermit:38")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:38")});
  sync({waitFor:Event("SBT:ConcurrencyReady:39")});
  sync({request:Event("SBT:ConcurrencyPermit:39")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:39")});
  sync({waitFor:Event("SBT:ConcurrencyReady:40")});
  sync({request:Event("SBT:ConcurrencyPermit:40")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:40")});
  sync({waitFor:Event("SBT:ConcurrencyReady:41")});
  sync({request:Event("SBT:ConcurrencyPermit:41")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:41")});
  sync({waitFor:Event("SBT:ConcurrencyReady:42")});
  sync({request:Event("SBT:ConcurrencyPermit:42")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:42")});
  sync({waitFor:Event("SBT:ConcurrencyReady:43")});
  sync({request:Event("SBT:ConcurrencyPermit:43")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:43")});
  sync({waitFor:Event("SBT:ConcurrencyReady:44")});
  sync({request:Event("SBT:ConcurrencyPermit:44")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:44")});
  sync({waitFor:Event("SBT:ConcurrencyReady:45")});
  sync({request:Event("SBT:ConcurrencyPermit:45")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:45")});
  sync({waitFor:Event("SBT:ConcurrencyReady:46")});
  sync({request:Event("SBT:ConcurrencyPermit:46")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:46")});
  sync({waitFor:Event("SBT:ConcurrencyReady:47")});
  sync({request:Event("SBT:ConcurrencyPermit:47")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:47")});
  sync({waitFor:Event("SBT:ConcurrencyReady:48")});
  sync({request:Event("SBT:ConcurrencyPermit:48")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:48")});
  sync({waitFor:Event("SBT:ConcurrencyReady:49")});
  sync({request:Event("SBT:ConcurrencyPermit:49")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:49")});
  sync({waitFor:Event("SBT:ConcurrencyReady:50")});
  sync({request:Event("SBT:ConcurrencyPermit:50")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:50")});
  sync({waitFor:Event("SBT:ConcurrencyReady:51")});
  sync({request:Event("SBT:ConcurrencyPermit:51")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:51")});
  sync({waitFor:Event("SBT:ConcurrencyReady:52")});
  sync({request:Event("SBT:ConcurrencyPermit:52")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:52")});
  sync({waitFor:Event("SBT:ConcurrencyReady:53")});
  sync({request:Event("SBT:ConcurrencyPermit:53")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:53")});
  sync({waitFor:Event("SBT:ConcurrencyReady:54")});
  sync({request:Event("SBT:ConcurrencyPermit:54")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:54")});
  sync({waitFor:Event("SBT:ConcurrencyReady:55")});
  sync({request:Event("SBT:ConcurrencyPermit:55")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:55")});
  sync({waitFor:Event("SBT:ConcurrencyReady:56")});
  sync({request:Event("SBT:ConcurrencyPermit:56")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:56")});
  sync({waitFor:Event("SBT:ConcurrencyReady:57")});
  sync({request:Event("SBT:ConcurrencyPermit:57")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:57")});
  sync({waitFor:Event("SBT:ConcurrencyReady:58")});
  sync({request:Event("SBT:ConcurrencyPermit:58")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:58")});
  sync({waitFor:Event("SBT:ConcurrencyReady:59")});
  sync({request:Event("SBT:ConcurrencyPermit:59")});
  sync({waitFor:Event("SBT:ConcurrencyClosed:59")});
  sync({request:Event("SBT:AllGeneratedConcurrencyClosed")});
});
