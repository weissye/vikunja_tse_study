//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for library.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":13,"contract_verifiers":13,"mutations":8,"state_verified_mutations":1,"contract_only_mutations":7,"concurrency_oracles":0};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtCreateEvent(entityKey){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__entityKey===entityKey && e.data.__httpResponse); }); }
bthread("sbt:concurrency-controller",function(){
  sync({request:Event("SBT:AllGeneratedConcurrencyClosed")});
});
