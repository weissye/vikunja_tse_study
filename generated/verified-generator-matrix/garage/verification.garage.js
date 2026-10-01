//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for garage.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":32,"contract_verifiers":32,"mutations":20,"state_verified_mutations":18,"contract_only_mutations":2,"concurrency_oracles":46};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtCreateEvent(entityKey){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__entityKey===entityKey && e.data.__httpResponse); }); }
bthread("sbt:concurrency:concurrency__same_field__put__chains__chainId___active", function(){
  var __created = sync({waitFor:__sbtCreateEvent("chains")});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::same-field::put:/chains/{chainId}::active"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __path = "/chains/{chainId}";
  __path = __path.replace("{chainId}", String(__created.data.__httpResponse["chainId"]));
  var __bodies = [{"active":true},{"active":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["active","description","name","supportEmail"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-0";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/chains/{chainId}::active",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::put:/chains/{chainId}::active",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__chains__chainId___description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("chains")});
  sync({request:Event("SBT:ConcurrencyReady:1",{oracle_id:"concurrency::same-field::put:/chains/{chainId}::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:1")});
  var __path = "/chains/{chainId}";
  __path = __path.replace("{chainId}", String(__created.data.__httpResponse["chainId"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["active","description","name","supportEmail"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-1";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-1";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/chains/{chainId}::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::same-field::put:/chains/{chainId}::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__chains__chainId___name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("chains")});
  sync({request:Event("SBT:ConcurrencyReady:2",{oracle_id:"concurrency::same-field::put:/chains/{chainId}::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:2")});
  var __path = "/chains/{chainId}";
  __path = __path.replace("{chainId}", String(__created.data.__httpResponse["chainId"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["active","description","name","supportEmail"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-2";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-2";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/chains/{chainId}::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::same-field::put:/chains/{chainId}::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__chains__chainId___supportEmail", function(){
  var __created = sync({waitFor:__sbtCreateEvent("chains")});
  sync({request:Event("SBT:ConcurrencyReady:3",{oracle_id:"concurrency::same-field::put:/chains/{chainId}::supportEmail"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:3")});
  var __path = "/chains/{chainId}";
  __path = __path.replace("{chainId}", String(__created.data.__httpResponse["chainId"]));
  var __bodies = [{"supportEmail":"sbt_generated_a_supportEmail"},{"supportEmail":"sbt_generated_b_supportEmail"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["active","description","name","supportEmail"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-3";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-3";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/chains/{chainId}::supportEmail",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::same-field::put:/chains/{chainId}::supportEmail",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__garages__garageId___active", function(){
  var __created = sync({waitFor:__sbtCreateEvent("garages")});
  sync({request:Event("SBT:ConcurrencyReady:4",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::active"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:4")});
  var __path = "/garages/{garageId}";
  __path = __path.replace("{garageId}", String(__created.data.__httpResponse["garageId"]));
  var __bodies = [{"active":true},{"active":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["active","bayCount","capacity","chainId","description","name","phone"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-4";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-4";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/garages/{garageId}::active",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::active",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__garages__garageId___bayCount", function(){
  var __created = sync({waitFor:__sbtCreateEvent("garages")});
  sync({request:Event("SBT:ConcurrencyReady:5",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::bayCount"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:5")});
  var __path = "/garages/{garageId}";
  __path = __path.replace("{garageId}", String(__created.data.__httpResponse["garageId"]));
  var __bodies = [{"bayCount":1},{"bayCount":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["active","bayCount","capacity","chainId","description","name","phone"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-5";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-5";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/garages/{garageId}::bayCount",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::bayCount",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__garages__garageId___capacity", function(){
  var __created = sync({waitFor:__sbtCreateEvent("garages")});
  sync({request:Event("SBT:ConcurrencyReady:6",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::capacity"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:6")});
  var __path = "/garages/{garageId}";
  __path = __path.replace("{garageId}", String(__created.data.__httpResponse["garageId"]));
  var __bodies = [{"capacity":1},{"capacity":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["active","bayCount","capacity","chainId","description","name","phone"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-6";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-6";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/garages/{garageId}::capacity",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::capacity",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__garages__garageId___chainId", function(){
  var __created = sync({waitFor:__sbtCreateEvent("garages")});
  sync({request:Event("SBT:ConcurrencyReady:7",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::chainId"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:7")});
  var __path = "/garages/{garageId}";
  __path = __path.replace("{garageId}", String(__created.data.__httpResponse["garageId"]));
  var __bodies = [{"chainId":"sbt_generated_a_chainId"},{"chainId":"sbt_generated_b_chainId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["active","bayCount","capacity","chainId","description","name","phone"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-7";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-7";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/garages/{garageId}::chainId",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::chainId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__garages__garageId___description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("garages")});
  sync({request:Event("SBT:ConcurrencyReady:8",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:8")});
  var __path = "/garages/{garageId}";
  __path = __path.replace("{garageId}", String(__created.data.__httpResponse["garageId"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["active","bayCount","capacity","chainId","description","name","phone"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-8";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-8";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/garages/{garageId}::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__garages__garageId___name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("garages")});
  sync({request:Event("SBT:ConcurrencyReady:9",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:9")});
  var __path = "/garages/{garageId}";
  __path = __path.replace("{garageId}", String(__created.data.__httpResponse["garageId"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["active","bayCount","capacity","chainId","description","name","phone"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-9";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-9";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/garages/{garageId}::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::put:/garages/{garageId}::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__customers__customerId___description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("customers")});
  sync({request:Event("SBT:ConcurrencyReady:10",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:10")});
  var __path = "/customers/{customerId}";
  __path = __path.replace("{customerId}", String(__created.data.__httpResponse["customerId"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","email","fullName","name","phone","preferredGarageId","type"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-10";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-10";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/customers/{customerId}::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__customers__customerId___email", function(){
  var __created = sync({waitFor:__sbtCreateEvent("customers")});
  sync({request:Event("SBT:ConcurrencyReady:11",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::email"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:11")});
  var __path = "/customers/{customerId}";
  __path = __path.replace("{customerId}", String(__created.data.__httpResponse["customerId"]));
  var __bodies = [{"email":"sbt_generated_a_email"},{"email":"sbt_generated_b_email"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","email","fullName","name","phone","preferredGarageId","type"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-11";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-11";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/customers/{customerId}::email",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:11",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::email",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__customers__customerId___fullName", function(){
  var __created = sync({waitFor:__sbtCreateEvent("customers")});
  sync({request:Event("SBT:ConcurrencyReady:12",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::fullName"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:12")});
  var __path = "/customers/{customerId}";
  __path = __path.replace("{customerId}", String(__created.data.__httpResponse["customerId"]));
  var __bodies = [{"fullName":"sbt_generated_a_fullName"},{"fullName":"sbt_generated_b_fullName"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","email","fullName","name","phone","preferredGarageId","type"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-12";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-12";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/customers/{customerId}::fullName",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:12",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::fullName",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__customers__customerId___name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("customers")});
  sync({request:Event("SBT:ConcurrencyReady:13",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:13")});
  var __path = "/customers/{customerId}";
  __path = __path.replace("{customerId}", String(__created.data.__httpResponse["customerId"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","email","fullName","name","phone","preferredGarageId","type"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-13";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-13";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/customers/{customerId}::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:13",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__customers__customerId___phone", function(){
  var __created = sync({waitFor:__sbtCreateEvent("customers")});
  sync({request:Event("SBT:ConcurrencyReady:14",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::phone"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:14")});
  var __path = "/customers/{customerId}";
  __path = __path.replace("{customerId}", String(__created.data.__httpResponse["customerId"]));
  var __bodies = [{"phone":"sbt_generated_a_phone"},{"phone":"sbt_generated_b_phone"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","email","fullName","name","phone","preferredGarageId","type"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-14";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-14";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/customers/{customerId}::phone",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:14",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::phone",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__customers__customerId___preferredGarageId", function(){
  var __created = sync({waitFor:__sbtCreateEvent("customers")});
  sync({request:Event("SBT:ConcurrencyReady:15",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::preferredGarageId"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:15")});
  var __path = "/customers/{customerId}";
  __path = __path.replace("{customerId}", String(__created.data.__httpResponse["customerId"]));
  var __bodies = [{"preferredGarageId":"sbt_generated_a_preferredGarageId"},{"preferredGarageId":"sbt_generated_b_preferredGarageId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["description","email","fullName","name","phone","preferredGarageId","type"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-15";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-15";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/customers/{customerId}::preferredGarageId",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:15",{oracle_id:"concurrency::same-field::put:/customers/{customerId}::preferredGarageId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__cars__vin___color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("cars")});
  sync({request:Event("SBT:ConcurrencyReady:16",{oracle_id:"concurrency::same-field::put:/cars/{vin}::color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:16")});
  var __path = "/cars/{vin}";
  __path = __path.replace("{vin}", String(__created.data.__httpResponse["vin"]));
  var __bodies = [{"color":"sbt_generated_a_color"},{"color":"sbt_generated_b_color"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["color","description","homeGarageId","licensePlate","make","mileage","model","ownerCustomerId","year"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-16";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-16";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/cars/{vin}::color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:16",{oracle_id:"concurrency::same-field::put:/cars/{vin}::color",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__cars__vin___description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("cars")});
  sync({request:Event("SBT:ConcurrencyReady:17",{oracle_id:"concurrency::same-field::put:/cars/{vin}::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:17")});
  var __path = "/cars/{vin}";
  __path = __path.replace("{vin}", String(__created.data.__httpResponse["vin"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["color","description","homeGarageId","licensePlate","make","mileage","model","ownerCustomerId","year"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-17";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-17";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/cars/{vin}::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:17",{oracle_id:"concurrency::same-field::put:/cars/{vin}::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__cars__vin___homeGarageId", function(){
  var __created = sync({waitFor:__sbtCreateEvent("cars")});
  sync({request:Event("SBT:ConcurrencyReady:18",{oracle_id:"concurrency::same-field::put:/cars/{vin}::homeGarageId"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:18")});
  var __path = "/cars/{vin}";
  __path = __path.replace("{vin}", String(__created.data.__httpResponse["vin"]));
  var __bodies = [{"homeGarageId":"sbt_generated_a_homeGarageId"},{"homeGarageId":"sbt_generated_b_homeGarageId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["color","description","homeGarageId","licensePlate","make","mileage","model","ownerCustomerId","year"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-18";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-18";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/cars/{vin}::homeGarageId",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:18",{oracle_id:"concurrency::same-field::put:/cars/{vin}::homeGarageId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__cars__vin___licensePlate", function(){
  var __created = sync({waitFor:__sbtCreateEvent("cars")});
  sync({request:Event("SBT:ConcurrencyReady:19",{oracle_id:"concurrency::same-field::put:/cars/{vin}::licensePlate"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:19")});
  var __path = "/cars/{vin}";
  __path = __path.replace("{vin}", String(__created.data.__httpResponse["vin"]));
  var __bodies = [{"licensePlate":"sbt_generated_a_licensePlate"},{"licensePlate":"sbt_generated_b_licensePlate"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["color","description","homeGarageId","licensePlate","make","mileage","model","ownerCustomerId","year"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-19";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-19";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/cars/{vin}::licensePlate",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:19",{oracle_id:"concurrency::same-field::put:/cars/{vin}::licensePlate",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__cars__vin___make", function(){
  var __created = sync({waitFor:__sbtCreateEvent("cars")});
  sync({request:Event("SBT:ConcurrencyReady:20",{oracle_id:"concurrency::same-field::put:/cars/{vin}::make"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:20")});
  var __path = "/cars/{vin}";
  __path = __path.replace("{vin}", String(__created.data.__httpResponse["vin"]));
  var __bodies = [{"make":"sbt_generated_a_make"},{"make":"sbt_generated_b_make"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["color","description","homeGarageId","licensePlate","make","mileage","model","ownerCustomerId","year"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-20";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-20";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/cars/{vin}::make",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:20",{oracle_id:"concurrency::same-field::put:/cars/{vin}::make",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__cars__vin___mileage", function(){
  var __created = sync({waitFor:__sbtCreateEvent("cars")});
  sync({request:Event("SBT:ConcurrencyReady:21",{oracle_id:"concurrency::same-field::put:/cars/{vin}::mileage"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:21")});
  var __path = "/cars/{vin}";
  __path = __path.replace("{vin}", String(__created.data.__httpResponse["vin"]));
  var __bodies = [{"mileage":1},{"mileage":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["color","description","homeGarageId","licensePlate","make","mileage","model","ownerCustomerId","year"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-21";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-21";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/cars/{vin}::mileage",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:21",{oracle_id:"concurrency::same-field::put:/cars/{vin}::mileage",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__periodic_maintenance__pmId___carVin", function(){
  var __created = sync({waitFor:__sbtCreateEvent("periodic-maintenance")});
  sync({request:Event("SBT:ConcurrencyReady:22",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::carVin"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:22")});
  var __path = "/periodic-maintenance/{pmId}";
  __path = __path.replace("{pmId}", String(__created.data.__httpResponse["pmId"]));
  var __bodies = [{"carVin":"sbt_generated_a_carVin"},{"carVin":"sbt_generated_b_carVin"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","description","garageId","intervalKm","intervalMonths","planType","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-22";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-22";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/periodic-maintenance/{pmId}::carVin",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:22",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::carVin",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__periodic_maintenance__pmId___description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("periodic-maintenance")});
  sync({request:Event("SBT:ConcurrencyReady:23",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:23")});
  var __path = "/periodic-maintenance/{pmId}";
  __path = __path.replace("{pmId}", String(__created.data.__httpResponse["pmId"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","description","garageId","intervalKm","intervalMonths","planType","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-23";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-23";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/periodic-maintenance/{pmId}::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:23",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__periodic_maintenance__pmId___garageId", function(){
  var __created = sync({waitFor:__sbtCreateEvent("periodic-maintenance")});
  sync({request:Event("SBT:ConcurrencyReady:24",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::garageId"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:24")});
  var __path = "/periodic-maintenance/{pmId}";
  __path = __path.replace("{pmId}", String(__created.data.__httpResponse["pmId"]));
  var __bodies = [{"garageId":"sbt_generated_a_garageId"},{"garageId":"sbt_generated_b_garageId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","description","garageId","intervalKm","intervalMonths","planType","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-24";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-24";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/periodic-maintenance/{pmId}::garageId",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:24",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::garageId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__periodic_maintenance__pmId___intervalKm", function(){
  var __created = sync({waitFor:__sbtCreateEvent("periodic-maintenance")});
  sync({request:Event("SBT:ConcurrencyReady:25",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::intervalKm"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:25")});
  var __path = "/periodic-maintenance/{pmId}";
  __path = __path.replace("{pmId}", String(__created.data.__httpResponse["pmId"]));
  var __bodies = [{"intervalKm":1},{"intervalKm":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","description","garageId","intervalKm","intervalMonths","planType","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-25";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-25";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/periodic-maintenance/{pmId}::intervalKm",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:25",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::intervalKm",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__periodic_maintenance__pmId___intervalMonths", function(){
  var __created = sync({waitFor:__sbtCreateEvent("periodic-maintenance")});
  sync({request:Event("SBT:ConcurrencyReady:26",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::intervalMonths"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:26")});
  var __path = "/periodic-maintenance/{pmId}";
  __path = __path.replace("{pmId}", String(__created.data.__httpResponse["pmId"]));
  var __bodies = [{"intervalMonths":1},{"intervalMonths":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","description","garageId","intervalKm","intervalMonths","planType","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-26";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-26";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/periodic-maintenance/{pmId}::intervalMonths",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:26",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::intervalMonths",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__periodic_maintenance__pmId___planType", function(){
  var __created = sync({waitFor:__sbtCreateEvent("periodic-maintenance")});
  sync({request:Event("SBT:ConcurrencyReady:27",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::planType"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:27")});
  var __path = "/periodic-maintenance/{pmId}";
  __path = __path.replace("{pmId}", String(__created.data.__httpResponse["pmId"]));
  var __bodies = [{"planType":"sbt_generated_a_planType"},{"planType":"sbt_generated_b_planType"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","description","garageId","intervalKm","intervalMonths","planType","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-27";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-27";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/periodic-maintenance/{pmId}::planType",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:27",{oracle_id:"concurrency::same-field::put:/periodic-maintenance/{pmId}::planType",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__repair_orders__roId___carVin", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repair-orders")});
  sync({request:Event("SBT:ConcurrencyReady:28",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::carVin"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:28")});
  var __path = "/repair-orders/{roId}";
  __path = __path.replace("{roId}", String(__created.data.__httpResponse["roId"]));
  var __bodies = [{"carVin":"sbt_generated_a_carVin"},{"carVin":"sbt_generated_b_carVin"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","complaint","customerId","description","garageId","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-28";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-28";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/repair-orders/{roId}::carVin",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:28",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::carVin",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__repair_orders__roId___complaint", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repair-orders")});
  sync({request:Event("SBT:ConcurrencyReady:29",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::complaint"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:29")});
  var __path = "/repair-orders/{roId}";
  __path = __path.replace("{roId}", String(__created.data.__httpResponse["roId"]));
  var __bodies = [{"complaint":"sbt_generated_a_complaint"},{"complaint":"sbt_generated_b_complaint"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","complaint","customerId","description","garageId","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-29";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-29";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/repair-orders/{roId}::complaint",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:29",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::complaint",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__repair_orders__roId___customerId", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repair-orders")});
  sync({request:Event("SBT:ConcurrencyReady:30",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::customerId"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:30")});
  var __path = "/repair-orders/{roId}";
  __path = __path.replace("{roId}", String(__created.data.__httpResponse["roId"]));
  var __bodies = [{"customerId":"sbt_generated_a_customerId"},{"customerId":"sbt_generated_b_customerId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","complaint","customerId","description","garageId","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-30";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-30";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/repair-orders/{roId}::customerId",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:30",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::customerId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__repair_orders__roId___description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repair-orders")});
  sync({request:Event("SBT:ConcurrencyReady:31",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:31")});
  var __path = "/repair-orders/{roId}";
  __path = __path.replace("{roId}", String(__created.data.__httpResponse["roId"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","complaint","customerId","description","garageId","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-31";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-31";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/repair-orders/{roId}::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:31",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__repair_orders__roId___garageId", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repair-orders")});
  sync({request:Event("SBT:ConcurrencyReady:32",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::garageId"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:32")});
  var __path = "/repair-orders/{roId}";
  __path = __path.replace("{roId}", String(__created.data.__httpResponse["roId"]));
  var __bodies = [{"garageId":"sbt_generated_a_garageId"},{"garageId":"sbt_generated_b_garageId"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","complaint","customerId","description","garageId","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-32";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-32";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/repair-orders/{roId}::garageId",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:32",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::garageId",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__put__repair_orders__roId___status", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repair-orders")});
  sync({request:Event("SBT:ConcurrencyReady:33",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::status"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:33")});
  var __path = "/repair-orders/{roId}";
  __path = __path.replace("{roId}", String(__created.data.__httpResponse["roId"]));
  var __bodies = [{"status":"sbt_generated_a_status"},{"status":"sbt_generated_b_status"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["carVin","complaint","customerId","description","garageId","status"];
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-33";
  for(var __i=0;__i<__bodies.length;__i++){ svc.put(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} svc.put(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-33";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PUT",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::put:/repair-orders/{roId}::status",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:33",{oracle_id:"concurrency::same-field::put:/repair-orders/{roId}::status",path:__path})});
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
  sync({request:Event("SBT:AllGeneratedConcurrencyClosed")});
});
