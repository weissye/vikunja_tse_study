//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for pharmacy.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":29,"contract_verifiers":29,"mutations":18,"state_verified_mutations":10,"contract_only_mutations":8,"concurrency_oracles":12};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtCreateEvent(entityKey){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__entityKey===entityKey && e.data.__httpResponse); }); }
bthread("sbt:concurrency:concurrency__same_field__put__drugs__id___id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("drugs")});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::same-field::put:/drugs/{id}::id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __path = "/drugs/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"id":"sbt_generated_a_id"},{"id":"sbt_generated_b_id"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["id","name"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-0";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/drugs/{id}::id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::put:/drugs/{id}::id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__drugs__id___name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("drugs")});
  sync({request:Event("SBT:ConcurrencyReady:1",{oracle_id:"concurrency::same-field::put:/drugs/{id}::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:1")});
  var __path = "/drugs/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["id","name"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-1";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-1";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/drugs/{id}::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::same-field::put:/drugs/{id}::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__patients__id___id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("patients")});
  sync({request:Event("SBT:ConcurrencyReady:2",{oracle_id:"concurrency::same-field::put:/patients/{id}::id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:2")});
  var __path = "/patients/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"id":"sbt_generated_a_id"},{"id":"sbt_generated_b_id"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["id","name"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-2";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-2";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/patients/{id}::id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::same-field::put:/patients/{id}::id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__patients__id___name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("patients")});
  sync({request:Event("SBT:ConcurrencyReady:3",{oracle_id:"concurrency::same-field::put:/patients/{id}::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:3")});
  var __path = "/patients/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["id","name"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-3";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-3";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/patients/{id}::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::same-field::put:/patients/{id}::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__orders__id___id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orders")});
  sync({request:Event("SBT:ConcurrencyReady:4",{oracle_id:"concurrency::same-field::put:/orders/{id}::id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:4")});
  var __path = "/orders/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"id":"sbt_generated_a_id"},{"id":"sbt_generated_b_id"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["id"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-4";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-4";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/orders/{id}::id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::same-field::put:/orders/{id}::id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__prescriptions__id___id", function(){
  var __created = sync({waitFor:__sbtCreateEvent("prescriptions")});
  sync({request:Event("SBT:ConcurrencyReady:5",{oracle_id:"concurrency::same-field::put:/prescriptions/{id}::id"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:5")});
  var __path = "/prescriptions/{id}";
  __path = __path.replace("{id}", String(__created.data.__httpResponse["id"]));
  var __bodies = [{"id":"sbt_generated_a_id"},{"id":"sbt_generated_b_id"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["id"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-5";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-5";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/prescriptions/{id}::id",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::same-field::put:/prescriptions/{id}::id",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__inventory__ndc___ndc", function(){
  var __created = sync({waitFor:__sbtCreateEvent("inventory")});
  sync({request:Event("SBT:ConcurrencyReady:6",{oracle_id:"concurrency::same-field::put:/inventory/{ndc}::ndc"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:6")});
  var __path = "/inventory/{ndc}";
  __path = __path.replace("{ndc}", String(__created.data.__httpResponse["ndc"]));
  var __bodies = [{"ndc":"sbt_generated_a_ndc"},{"ndc":"sbt_generated_b_ndc"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["ndc"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-6";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-6";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/inventory/{ndc}::ndc",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::same-field::put:/inventory/{ndc}::ndc",path:__path})});
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
  sync({request:Event("SBT:AllGeneratedConcurrencyClosed")});
});
