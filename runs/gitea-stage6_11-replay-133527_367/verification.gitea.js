//@provengo summon rest
// OpenAPI-only generated verifier/concurrency overlay for gitea.
// No application names, business rules, or hidden SUT facts are inputs.
var sbtConcurrencyAdapterUrl = (typeof sbtConcurrencyAdapterUrl !== "undefined") ? sbtConcurrencyAdapterUrl : "http://127.0.0.1:3459";
const __sbtAdapter = new RESTSession(sbtConcurrencyAdapterUrl, "sbt-generated-concurrency", {headers:{"Content-Type":"application/json"}});
const __sbtVerificationCoverage = {"operations":478,"contract_verifiers":478,"mutations":236,"state_verified_mutations":118,"contract_only_mutations":118,"concurrency_oracles":181};
bthread("sbt:verification-coverage", function(){ sync({request:Event("SBT:VerificationCoverageReady", __sbtVerificationCoverage)}); });
function __sbtReadPath(value,path){var parts=String(path).split("."); for(var i=0;i<parts.length;i++){if(value===null||typeof value==="undefined"){return undefined;} value=value[parts[i]];} return value;}
function __sbtCreateEvent(operationId){ return EventSet("SBT created resource", function(e){ return !!(e && e.name && e.name.indexOf("Done: ")===0 && e.data && e.data.__operationId===operationId && e.data.__httpResponse); }); }
bthread("sbt:resource-bridge:adminCreateHook", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="adminCreateHook") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="adminCreateHook")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:adminCreateHook",{operation_id:"adminCreateHook",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Hooks:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:hooks:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"adminCreateHook",ready_event:"SBT:InstanceReady:hooks:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:adminCreateHook",{operation_id:"adminCreateHook",valid:__valid})});
});
bthread("sbt:resource-bridge-guard:createCurrentUserRepo", function(){
  sync({waitFor:Event("SBT:ResourceBridgeFinished:createCurrentUserRepo"),block:Event("SBT:InstanceUnavailable:repos:1")});
});
bthread("sbt:resource-bridge:createCurrentUserRepo", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="createCurrentUserRepo") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="createCurrentUserRepo")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:createCurrentUserRepo",{operation_id:"createCurrentUserRepo",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["owner"]=__sbtReadPath(__created.data.__httpResponse,"owner.login");
  __resourceData["repo"]=__sbtReadPath(__created.data.__httpResponse,"name");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Repos:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:repos:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"createCurrentUserRepo",ready_event:"SBT:InstanceReady:repos:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:createCurrentUserRepo",{operation_id:"createCurrentUserRepo",valid:__valid})});
});
bthread("sbt:resource-bridge:issueCreateComment", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="issueCreateComment") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="issueCreateComment")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:issueCreateComment",{operation_id:"issueCreateComment",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Comments:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:comments:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"issueCreateComment",ready_event:"SBT:InstanceReady:comments:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:issueCreateComment",{operation_id:"issueCreateComment",valid:__valid})});
});
bthread("sbt:resource-bridge:issueCreateIssue", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="issueCreateIssue") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="issueCreateIssue")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:issueCreateIssue",{operation_id:"issueCreateIssue",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["index"]=__sbtReadPath(__created.data.__httpResponse,"number");
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["index"]!==undefined && __resourceData["index"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Issues:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:issues:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"issueCreateIssue",ready_event:"SBT:InstanceReady:issues:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:issueCreateIssue",{operation_id:"issueCreateIssue",valid:__valid})});
});
bthread("sbt:resource-bridge:issueCreateIssueAttachment", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="issueCreateIssueAttachment") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="issueCreateIssueAttachment")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:issueCreateIssueAttachment",{operation_id:"issueCreateIssueAttachment",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["attachment_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["index"]=__created.data["index"];
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["attachment_id"]!==undefined && __resourceData["attachment_id"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null && __resourceData["index"]!==undefined && __resourceData["index"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Assets:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:assets:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"issueCreateIssueAttachment",ready_event:"SBT:InstanceReady:assets:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:issueCreateIssueAttachment",{operation_id:"issueCreateIssueAttachment",valid:__valid})});
});
bthread("sbt:resource-bridge:issueCreateIssueCommentAttachment", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="issueCreateIssueCommentAttachment") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="issueCreateIssueCommentAttachment")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:issueCreateIssueCommentAttachment",{operation_id:"issueCreateIssueCommentAttachment",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["attachment_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null && __resourceData["attachment_id"]!==undefined && __resourceData["attachment_id"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Assets:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:assets:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"issueCreateIssueCommentAttachment",ready_event:"SBT:InstanceReady:assets:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:issueCreateIssueCommentAttachment",{operation_id:"issueCreateIssueCommentAttachment",valid:__valid})});
});
bthread("sbt:resource-bridge:issueCreateLabel", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="issueCreateLabel") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="issueCreateLabel")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:issueCreateLabel",{operation_id:"issueCreateLabel",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Labels:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:labels:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"issueCreateLabel",ready_event:"SBT:InstanceReady:labels:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:issueCreateLabel",{operation_id:"issueCreateLabel",valid:__valid})});
});
bthread("sbt:resource-bridge:issueCreateMilestone", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="issueCreateMilestone") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="issueCreateMilestone")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:issueCreateMilestone",{operation_id:"issueCreateMilestone",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Milestones:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:milestones:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"issueCreateMilestone",ready_event:"SBT:InstanceReady:milestones:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:issueCreateMilestone",{operation_id:"issueCreateMilestone",valid:__valid})});
});
bthread("sbt:resource-bridge:orgCreate", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="orgCreate") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="orgCreate")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:orgCreate",{operation_id:"orgCreate",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["org"]=__sbtReadPath(__created.data.__httpResponse,"name");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["org"]!==undefined && __resourceData["org"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Orgs:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:orgs:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"orgCreate",ready_event:"SBT:InstanceReady:orgs:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:orgCreate",{operation_id:"orgCreate",valid:__valid})});
});
bthread("sbt:resource-bridge:orgCreateHook", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="orgCreateHook") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="orgCreateHook")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:orgCreateHook",{operation_id:"orgCreateHook",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["org"]=__created.data["org"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null && __resourceData["org"]!==undefined && __resourceData["org"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Hooks:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:hooks:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"orgCreateHook",ready_event:"SBT:InstanceReady:hooks:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:orgCreateHook",{operation_id:"orgCreateHook",valid:__valid})});
});
bthread("sbt:resource-bridge:orgCreateLabel", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="orgCreateLabel") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="orgCreateLabel")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:orgCreateLabel",{operation_id:"orgCreateLabel",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["org"]=__created.data["org"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null && __resourceData["org"]!==undefined && __resourceData["org"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Labels:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:labels:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"orgCreateLabel",ready_event:"SBT:InstanceReady:labels:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:orgCreateLabel",{operation_id:"orgCreateLabel",valid:__valid})});
});
bthread("sbt:resource-bridge:orgCreateTeam", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="orgCreateTeam") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="orgCreateTeam")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:orgCreateTeam",{operation_id:"orgCreateTeam",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Teams:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:teams:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"orgCreateTeam",ready_event:"SBT:InstanceReady:teams:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:orgCreateTeam",{operation_id:"orgCreateTeam",valid:__valid})});
});
bthread("sbt:resource-bridge:repoCreateHook", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="repoCreateHook") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="repoCreateHook")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:repoCreateHook",{operation_id:"repoCreateHook",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Hooks:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:hooks:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"repoCreateHook",ready_event:"SBT:InstanceReady:hooks:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:repoCreateHook",{operation_id:"repoCreateHook",valid:__valid})});
});
bthread("sbt:resource-bridge:repoCreatePullRequest", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="repoCreatePullRequest") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="repoCreatePullRequest")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:repoCreatePullRequest",{operation_id:"repoCreatePullRequest",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["index"]=__sbtReadPath(__created.data.__httpResponse,"number");
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["index"]!==undefined && __resourceData["index"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Pulls:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:pulls:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"repoCreatePullRequest",ready_event:"SBT:InstanceReady:pulls:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:repoCreatePullRequest",{operation_id:"repoCreatePullRequest",valid:__valid})});
});
bthread("sbt:resource-bridge:repoCreateRelease", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="repoCreateRelease") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="repoCreateRelease")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:repoCreateRelease",{operation_id:"repoCreateRelease",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Releases:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:releases:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"repoCreateRelease",ready_event:"SBT:InstanceReady:releases:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:repoCreateRelease",{operation_id:"repoCreateRelease",valid:__valid})});
});
bthread("sbt:resource-bridge:repoCreateReleaseAttachment", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="repoCreateReleaseAttachment") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="repoCreateReleaseAttachment")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:repoCreateReleaseAttachment",{operation_id:"repoCreateReleaseAttachment",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["attachment_id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null && __resourceData["attachment_id"]!==undefined && __resourceData["attachment_id"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Assets:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:assets:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"repoCreateReleaseAttachment",ready_event:"SBT:InstanceReady:assets:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:repoCreateReleaseAttachment",{operation_id:"repoCreateReleaseAttachment",valid:__valid})});
});
bthread("sbt:resource-bridge:repoCreateTagProtection", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="repoCreateTagProtection") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="repoCreateTagProtection")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:repoCreateTagProtection",{operation_id:"repoCreateTagProtection",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  __resourceData["owner"]=__created.data["owner"];
  __resourceData["repo"]=__created.data["repo"];
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null && __resourceData["owner"]!==undefined && __resourceData["owner"]!==null && __resourceData["repo"]!==undefined && __resourceData["repo"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:TagProtections:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:tag_protections:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"repoCreateTagProtection",ready_event:"SBT:InstanceReady:tag_protections:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:repoCreateTagProtection",{operation_id:"repoCreateTagProtection",valid:__valid})});
});
bthread("sbt:resource-bridge:userCreateHook", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="userCreateHook") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="userCreateHook")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:userCreateHook",{operation_id:"userCreateHook",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Hooks:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:hooks:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"userCreateHook",ready_event:"SBT:InstanceReady:hooks:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:userCreateHook",{operation_id:"userCreateHook",valid:__valid})});
});
bthread("sbt:resource-bridge:userCreateOAuth2Application", function(){
  var __created = sync({waitFor:EventSet("SBT producer outcome",function(e){return !!(e && e.data && ((e.name && e.name.indexOf("Done: ")===0 && e.data.__operationId==="userCreateOAuth2Application") || (e.name==="SBT:OperationOutcome" && e.data.operation_id==="userCreateOAuth2Application")));})});
  if(__created.name==="SBT:OperationOutcome"){
    sync({request:Event("SBT:ResourceBridgeFinished:userCreateOAuth2Application",{operation_id:"userCreateOAuth2Application",valid:false})});
    return;
  }
  var __resourceData={};
  for(var __key in __created.data){if(__key.indexOf("__")!==0){__resourceData[__key]=__created.data[__key];}}
  __resourceData["id"]=__sbtReadPath(__created.data.__httpResponse,"id");
  var __valid = [201].indexOf(__created.data.__httpCode)>=0 && __resourceData["id"]!==undefined && __resourceData["id"]!==null;
  if(__valid){
    sync({request:Event("InstanceReady:Oauth2:1",__resourceData)});
    sync({request:Event("SBT:InstanceReady:oauth2:1",__resourceData)});
    sync({request:Event("SBT:ResourceBridgePublished",{operation_id:"userCreateOAuth2Application",ready_event:"SBT:InstanceReady:oauth2:1"})});
  }
  sync({request:Event("SBT:ResourceBridgeFinished:userCreateOAuth2Application",{operation_id:"userCreateOAuth2Application",valid:__valid})});
});
bthread("sbt:concurrency:concurrency__same_field__adminEditHook__active", function(){
  var __created = sync({waitFor:__sbtCreateEvent("adminCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:0",{oracle_id:"concurrency::same-field::adminEditHook::active"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:0")});
  var __path = "/admin/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"active":true},{"active":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-0";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-0"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-0";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::adminEditHook::active",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:0",{oracle_id:"concurrency::same-field::adminEditHook::active",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__adminEditHook__authorization_header", function(){
  var __created = sync({waitFor:__sbtCreateEvent("adminCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:1",{oracle_id:"concurrency::same-field::adminEditHook::authorization_header"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:1")});
  var __path = "/admin/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"authorization_header":"sbt_generated_a_authorization_header"},{"authorization_header":"sbt_generated_b_authorization_header"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-1";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-1"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-1";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::adminEditHook::authorization_header",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:1",{oracle_id:"concurrency::same-field::adminEditHook::authorization_header",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__adminEditHook__branch_filter", function(){
  var __created = sync({waitFor:__sbtCreateEvent("adminCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:2",{oracle_id:"concurrency::same-field::adminEditHook::branch_filter"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:2")});
  var __path = "/admin/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"branch_filter":"sbt_generated_a_branch_filter"},{"branch_filter":"sbt_generated_b_branch_filter"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-2";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-2"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-2";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::adminEditHook::branch_filter",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:2",{oracle_id:"concurrency::same-field::adminEditHook::branch_filter",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__adminEditHook__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("adminCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:3",{oracle_id:"concurrency::same-field::adminEditHook::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:3")});
  var __path = "/admin/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-3";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-3"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-3";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::adminEditHook::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:3",{oracle_id:"concurrency::same-field::adminEditHook::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEdit__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreate")});
  sync({request:Event("SBT:ConcurrencyReady:4",{oracle_id:"concurrency::same-field::orgEdit::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:4")});
  var __path = "/orgs/{org}";
  __path = __path.replace("{org}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-4";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-4"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-4";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEdit::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:4",{oracle_id:"concurrency::same-field::orgEdit::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEdit__email", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreate")});
  sync({request:Event("SBT:ConcurrencyReady:5",{oracle_id:"concurrency::same-field::orgEdit::email"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:5")});
  var __path = "/orgs/{org}";
  __path = __path.replace("{org}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"email":"sbt-a@example.invalid"},{"email":"sbt-b@example.invalid"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-5";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-5"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-5";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEdit::email",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:5",{oracle_id:"concurrency::same-field::orgEdit::email",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEdit__full_name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreate")});
  sync({request:Event("SBT:ConcurrencyReady:6",{oracle_id:"concurrency::same-field::orgEdit::full_name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:6")});
  var __path = "/orgs/{org}";
  __path = __path.replace("{org}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"full_name":"sbt_generated_a_full_name"},{"full_name":"sbt_generated_b_full_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-6";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-6"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-6";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEdit::full_name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:6",{oracle_id:"concurrency::same-field::orgEdit::full_name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEdit__location", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreate")});
  sync({request:Event("SBT:ConcurrencyReady:7",{oracle_id:"concurrency::same-field::orgEdit::location"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:7")});
  var __path = "/orgs/{org}";
  __path = __path.replace("{org}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"location":"sbt_generated_a_location"},{"location":"sbt_generated_b_location"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-7";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-7"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-7";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEdit::location",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:7",{oracle_id:"concurrency::same-field::orgEdit::location",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEdit__repo_admin_change_team_access", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreate")});
  sync({request:Event("SBT:ConcurrencyReady:8",{oracle_id:"concurrency::same-field::orgEdit::repo_admin_change_team_access"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:8")});
  var __path = "/orgs/{org}";
  __path = __path.replace("{org}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"repo_admin_change_team_access":true},{"repo_admin_change_team_access":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-8";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-8"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-8";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEdit::repo_admin_change_team_access",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:8",{oracle_id:"concurrency::same-field::orgEdit::repo_admin_change_team_access",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEdit__visibility", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreate")});
  sync({request:Event("SBT:ConcurrencyReady:9",{oracle_id:"concurrency::same-field::orgEdit::visibility"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:9")});
  var __path = "/orgs/{org}";
  __path = __path.replace("{org}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"visibility":"public"},{"visibility":"limited"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-9";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-9"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-9";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEdit::visibility",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:9",{oracle_id:"concurrency::same-field::orgEdit::visibility",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditHook__active", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:10",{oracle_id:"concurrency::same-field::orgEditHook::active"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:10")});
  var __path = "/orgs/{org}/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{org}", String(__created.data["org"]));
  var __bodies = [{"active":true},{"active":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-10";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-10"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-10";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditHook::active",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:10",{oracle_id:"concurrency::same-field::orgEditHook::active",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditHook__authorization_header", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:11",{oracle_id:"concurrency::same-field::orgEditHook::authorization_header"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:11")});
  var __path = "/orgs/{org}/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{org}", String(__created.data["org"]));
  var __bodies = [{"authorization_header":"sbt_generated_a_authorization_header"},{"authorization_header":"sbt_generated_b_authorization_header"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-11";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-11"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-11";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditHook::authorization_header",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:11",{oracle_id:"concurrency::same-field::orgEditHook::authorization_header",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditHook__branch_filter", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:12",{oracle_id:"concurrency::same-field::orgEditHook::branch_filter"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:12")});
  var __path = "/orgs/{org}/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{org}", String(__created.data["org"]));
  var __bodies = [{"branch_filter":"sbt_generated_a_branch_filter"},{"branch_filter":"sbt_generated_b_branch_filter"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-12";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-12"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-12";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditHook::branch_filter",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:12",{oracle_id:"concurrency::same-field::orgEditHook::branch_filter",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditHook__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:13",{oracle_id:"concurrency::same-field::orgEditHook::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:13")});
  var __path = "/orgs/{org}/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{org}", String(__created.data["org"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-13";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-13"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-13";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditHook::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:13",{oracle_id:"concurrency::same-field::orgEditHook::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditLabel__color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateLabel")});
  sync({request:Event("SBT:ConcurrencyReady:14",{oracle_id:"concurrency::same-field::orgEditLabel::color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:14")});
  var __path = "/orgs/{org}/labels/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{org}", String(__created.data["org"]));
  var __bodies = [{"color":"#00aabb"},{"color":"#00aabc"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-14";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-14"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-14";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditLabel::color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:14",{oracle_id:"concurrency::same-field::orgEditLabel::color",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditLabel__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateLabel")});
  sync({request:Event("SBT:ConcurrencyReady:15",{oracle_id:"concurrency::same-field::orgEditLabel::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:15")});
  var __path = "/orgs/{org}/labels/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{org}", String(__created.data["org"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-15";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-15"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-15";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditLabel::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:15",{oracle_id:"concurrency::same-field::orgEditLabel::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditLabel__exclusive", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateLabel")});
  sync({request:Event("SBT:ConcurrencyReady:16",{oracle_id:"concurrency::same-field::orgEditLabel::exclusive"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:16")});
  var __path = "/orgs/{org}/labels/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{org}", String(__created.data["org"]));
  var __bodies = [{"exclusive":true},{"exclusive":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-16";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-16"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-16";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditLabel::exclusive",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:16",{oracle_id:"concurrency::same-field::orgEditLabel::exclusive",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditLabel__is_archived", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateLabel")});
  sync({request:Event("SBT:ConcurrencyReady:17",{oracle_id:"concurrency::same-field::orgEditLabel::is_archived"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:17")});
  var __path = "/orgs/{org}/labels/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{org}", String(__created.data["org"]));
  var __bodies = [{"is_archived":true},{"is_archived":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-17";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-17"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-17";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditLabel::is_archived",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:17",{oracle_id:"concurrency::same-field::orgEditLabel::is_archived",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditLabel__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateLabel")});
  sync({request:Event("SBT:ConcurrencyReady:18",{oracle_id:"concurrency::same-field::orgEditLabel::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:18")});
  var __path = "/orgs/{org}/labels/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{org}", String(__created.data["org"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-18";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-18"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-18";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditLabel::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:18",{oracle_id:"concurrency::same-field::orgEditLabel::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEdit__allow_fast_forward_only_merge", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createCurrentUserRepo")});
  sync({request:Event("SBT:ConcurrencyReady:19",{oracle_id:"concurrency::same-field::repoEdit::allow_fast_forward_only_merge"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:19")});
  var __path = "/repos/{owner}/{repo}";
  __path = __path.replace("{owner}", String(__sbtReadPath(__created.data.__httpResponse,"owner.login")));
  __path = __path.replace("{repo}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"allow_fast_forward_only_merge":true},{"allow_fast_forward_only_merge":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-19";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-19"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-19";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEdit::allow_fast_forward_only_merge",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:19",{oracle_id:"concurrency::same-field::repoEdit::allow_fast_forward_only_merge",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEdit__allow_manual_merge", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createCurrentUserRepo")});
  sync({request:Event("SBT:ConcurrencyReady:20",{oracle_id:"concurrency::same-field::repoEdit::allow_manual_merge"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:20")});
  var __path = "/repos/{owner}/{repo}";
  __path = __path.replace("{owner}", String(__sbtReadPath(__created.data.__httpResponse,"owner.login")));
  __path = __path.replace("{repo}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"allow_manual_merge":true},{"allow_manual_merge":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-20";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-20"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-20";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEdit::allow_manual_merge",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:20",{oracle_id:"concurrency::same-field::repoEdit::allow_manual_merge",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEdit__allow_merge_commits", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createCurrentUserRepo")});
  sync({request:Event("SBT:ConcurrencyReady:21",{oracle_id:"concurrency::same-field::repoEdit::allow_merge_commits"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:21")});
  var __path = "/repos/{owner}/{repo}";
  __path = __path.replace("{owner}", String(__sbtReadPath(__created.data.__httpResponse,"owner.login")));
  __path = __path.replace("{repo}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"allow_merge_commits":true},{"allow_merge_commits":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-21";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-21"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-21";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEdit::allow_merge_commits",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:21",{oracle_id:"concurrency::same-field::repoEdit::allow_merge_commits",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEdit__allow_merge_update", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createCurrentUserRepo")});
  sync({request:Event("SBT:ConcurrencyReady:22",{oracle_id:"concurrency::same-field::repoEdit::allow_merge_update"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:22")});
  var __path = "/repos/{owner}/{repo}";
  __path = __path.replace("{owner}", String(__sbtReadPath(__created.data.__httpResponse,"owner.login")));
  __path = __path.replace("{repo}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"allow_merge_update":true},{"allow_merge_update":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-22";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-22"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-22";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEdit::allow_merge_update",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:22",{oracle_id:"concurrency::same-field::repoEdit::allow_merge_update",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEdit__allow_rebase", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createCurrentUserRepo")});
  sync({request:Event("SBT:ConcurrencyReady:23",{oracle_id:"concurrency::same-field::repoEdit::allow_rebase"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:23")});
  var __path = "/repos/{owner}/{repo}";
  __path = __path.replace("{owner}", String(__sbtReadPath(__created.data.__httpResponse,"owner.login")));
  __path = __path.replace("{repo}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"allow_rebase":true},{"allow_rebase":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-23";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-23"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-23";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEdit::allow_rebase",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:23",{oracle_id:"concurrency::same-field::repoEdit::allow_rebase",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEdit__allow_rebase_explicit", function(){
  var __created = sync({waitFor:__sbtCreateEvent("createCurrentUserRepo")});
  sync({request:Event("SBT:ConcurrencyReady:24",{oracle_id:"concurrency::same-field::repoEdit::allow_rebase_explicit"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:24")});
  var __path = "/repos/{owner}/{repo}";
  __path = __path.replace("{owner}", String(__sbtReadPath(__created.data.__httpResponse,"owner.login")));
  __path = __path.replace("{repo}", String(__sbtReadPath(__created.data.__httpResponse,"name")));
  var __bodies = [{"allow_rebase_explicit":true},{"allow_rebase_explicit":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-24";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-24"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-24";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEdit::allow_rebase_explicit",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:24",{oracle_id:"concurrency::same-field::repoEdit::allow_rebase_explicit",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditHook__active", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:25",{oracle_id:"concurrency::same-field::repoEditHook::active"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:25")});
  var __path = "/repos/{owner}/{repo}/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"active":true},{"active":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-25";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-25"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-25";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditHook::active",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:25",{oracle_id:"concurrency::same-field::repoEditHook::active",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditHook__authorization_header", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:26",{oracle_id:"concurrency::same-field::repoEditHook::authorization_header"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:26")});
  var __path = "/repos/{owner}/{repo}/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"authorization_header":"sbt_generated_a_authorization_header"},{"authorization_header":"sbt_generated_b_authorization_header"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-26";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-26"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-26";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditHook::authorization_header",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:26",{oracle_id:"concurrency::same-field::repoEditHook::authorization_header",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditHook__branch_filter", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:27",{oracle_id:"concurrency::same-field::repoEditHook::branch_filter"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:27")});
  var __path = "/repos/{owner}/{repo}/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"branch_filter":"sbt_generated_a_branch_filter"},{"branch_filter":"sbt_generated_b_branch_filter"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-27";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-27"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-27";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditHook::branch_filter",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:27",{oracle_id:"concurrency::same-field::repoEditHook::branch_filter",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditHook__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:28",{oracle_id:"concurrency::same-field::repoEditHook::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:28")});
  var __path = "/repos/{owner}/{repo}/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-28";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-28"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-28";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditHook::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:28",{oracle_id:"concurrency::same-field::repoEditHook::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditComment__body", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateComment")});
  sync({request:Event("SBT:ConcurrencyReady:29",{oracle_id:"concurrency::same-field::issueEditComment::body"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:29")});
  var __path = "/repos/{owner}/{repo}/issues/comments/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"body":"sbt_generated_a_body"},{"body":"sbt_generated_b_body"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-29";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200,204]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-29"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200,204]}); }
  var __epoch = "generated-epoch-29";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditComment::body",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:29",{oracle_id:"concurrency::same-field::issueEditComment::body",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditIssueCommentAttachment__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateIssueCommentAttachment")});
  sync({request:Event("SBT:ConcurrencyReady:30",{oracle_id:"concurrency::same-field::issueEditIssueCommentAttachment::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:30")});
  var __path = "/repos/{owner}/{repo}/issues/comments/{id}/assets/{attachment_id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{attachment_id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-30";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-30"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-30";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditIssueCommentAttachment::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:30",{oracle_id:"concurrency::same-field::issueEditIssueCommentAttachment::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditIssue__assignee", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateIssue")});
  sync({request:Event("SBT:ConcurrencyReady:31",{oracle_id:"concurrency::same-field::issueEditIssue::assignee"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:31")});
  var __path = "/repos/{owner}/{repo}/issues/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"assignee":"sbt_generated_a_assignee"},{"assignee":"sbt_generated_b_assignee"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-31";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-31"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-31";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditIssue::assignee",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:31",{oracle_id:"concurrency::same-field::issueEditIssue::assignee",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditIssue__body", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateIssue")});
  sync({request:Event("SBT:ConcurrencyReady:32",{oracle_id:"concurrency::same-field::issueEditIssue::body"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:32")});
  var __path = "/repos/{owner}/{repo}/issues/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"body":"sbt_generated_a_body"},{"body":"sbt_generated_b_body"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-32";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-32"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-32";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditIssue::body",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:32",{oracle_id:"concurrency::same-field::issueEditIssue::body",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditIssue__content_version", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateIssue")});
  sync({request:Event("SBT:ConcurrencyReady:33",{oracle_id:"concurrency::same-field::issueEditIssue::content_version"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:33")});
  var __path = "/repos/{owner}/{repo}/issues/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"content_version":1},{"content_version":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-33";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-33"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-33";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditIssue::content_version",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:33",{oracle_id:"concurrency::same-field::issueEditIssue::content_version",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditIssue__due_date", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateIssue")});
  sync({request:Event("SBT:ConcurrencyReady:34",{oracle_id:"concurrency::same-field::issueEditIssue::due_date"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:34")});
  var __path = "/repos/{owner}/{repo}/issues/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"due_date":"2026-01-01T00:00:00Z"},{"due_date":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-34";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-34"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-34";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditIssue::due_date",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:34",{oracle_id:"concurrency::same-field::issueEditIssue::due_date",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditIssue__milestone", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateIssue")});
  sync({request:Event("SBT:ConcurrencyReady:35",{oracle_id:"concurrency::same-field::issueEditIssue::milestone"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:35")});
  var __path = "/repos/{owner}/{repo}/issues/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"milestone":1},{"milestone":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-35";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-35"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-35";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditIssue::milestone",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:35",{oracle_id:"concurrency::same-field::issueEditIssue::milestone",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditIssue__ref", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateIssue")});
  sync({request:Event("SBT:ConcurrencyReady:36",{oracle_id:"concurrency::same-field::issueEditIssue::ref"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:36")});
  var __path = "/repos/{owner}/{repo}/issues/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"ref":"sbt_generated_a_ref"},{"ref":"sbt_generated_b_ref"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-36";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-36"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-36";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditIssue::ref",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:36",{oracle_id:"concurrency::same-field::issueEditIssue::ref",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditIssueAttachment__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateIssueAttachment")});
  sync({request:Event("SBT:ConcurrencyReady:37",{oracle_id:"concurrency::same-field::issueEditIssueAttachment::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:37")});
  var __path = "/repos/{owner}/{repo}/issues/{index}/assets/{attachment_id}";
  __path = __path.replace("{attachment_id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  __path = __path.replace("{index}", String(__created.data["index"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-37";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-37"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-37";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditIssueAttachment::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:37",{oracle_id:"concurrency::same-field::issueEditIssueAttachment::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditLabel__color", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateLabel")});
  sync({request:Event("SBT:ConcurrencyReady:38",{oracle_id:"concurrency::same-field::issueEditLabel::color"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:38")});
  var __path = "/repos/{owner}/{repo}/labels/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"color":"#00aabb"},{"color":"#00aabc"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-38";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-38"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-38";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditLabel::color",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:38",{oracle_id:"concurrency::same-field::issueEditLabel::color",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditLabel__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateLabel")});
  sync({request:Event("SBT:ConcurrencyReady:39",{oracle_id:"concurrency::same-field::issueEditLabel::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:39")});
  var __path = "/repos/{owner}/{repo}/labels/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-39";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-39"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-39";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditLabel::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:39",{oracle_id:"concurrency::same-field::issueEditLabel::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditLabel__exclusive", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateLabel")});
  sync({request:Event("SBT:ConcurrencyReady:40",{oracle_id:"concurrency::same-field::issueEditLabel::exclusive"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:40")});
  var __path = "/repos/{owner}/{repo}/labels/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"exclusive":true},{"exclusive":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-40";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-40"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-40";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditLabel::exclusive",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:40",{oracle_id:"concurrency::same-field::issueEditLabel::exclusive",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditLabel__is_archived", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateLabel")});
  sync({request:Event("SBT:ConcurrencyReady:41",{oracle_id:"concurrency::same-field::issueEditLabel::is_archived"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:41")});
  var __path = "/repos/{owner}/{repo}/labels/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"is_archived":true},{"is_archived":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-41";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-41"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-41";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditLabel::is_archived",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:41",{oracle_id:"concurrency::same-field::issueEditLabel::is_archived",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditLabel__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateLabel")});
  sync({request:Event("SBT:ConcurrencyReady:42",{oracle_id:"concurrency::same-field::issueEditLabel::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:42")});
  var __path = "/repos/{owner}/{repo}/labels/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-42";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-42"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-42";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditLabel::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:42",{oracle_id:"concurrency::same-field::issueEditLabel::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditMilestone__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateMilestone")});
  sync({request:Event("SBT:ConcurrencyReady:43",{oracle_id:"concurrency::same-field::issueEditMilestone::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:43")});
  var __path = "/repos/{owner}/{repo}/milestones/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-43";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-43"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-43";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditMilestone::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:43",{oracle_id:"concurrency::same-field::issueEditMilestone::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditMilestone__due_on", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateMilestone")});
  sync({request:Event("SBT:ConcurrencyReady:44",{oracle_id:"concurrency::same-field::issueEditMilestone::due_on"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:44")});
  var __path = "/repos/{owner}/{repo}/milestones/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"due_on":"2026-01-01T00:00:00Z"},{"due_on":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-44";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-44"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-44";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditMilestone::due_on",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:44",{oracle_id:"concurrency::same-field::issueEditMilestone::due_on",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditMilestone__state", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateMilestone")});
  sync({request:Event("SBT:ConcurrencyReady:45",{oracle_id:"concurrency::same-field::issueEditMilestone::state"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:45")});
  var __path = "/repos/{owner}/{repo}/milestones/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"state":"open"},{"state":"closed"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-45";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-45"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-45";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditMilestone::state",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:45",{oracle_id:"concurrency::same-field::issueEditMilestone::state",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__issueEditMilestone__title", function(){
  var __created = sync({waitFor:__sbtCreateEvent("issueCreateMilestone")});
  sync({request:Event("SBT:ConcurrencyReady:46",{oracle_id:"concurrency::same-field::issueEditMilestone::title"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:46")});
  var __path = "/repos/{owner}/{repo}/milestones/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"title":"sbt_generated_a_title"},{"title":"sbt_generated_b_title"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-46";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-46"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-46";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::issueEditMilestone::title",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:46",{oracle_id:"concurrency::same-field::issueEditMilestone::title",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditPullRequest__allow_maintainer_edit", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreatePullRequest")});
  sync({request:Event("SBT:ConcurrencyReady:47",{oracle_id:"concurrency::same-field::repoEditPullRequest::allow_maintainer_edit"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:47")});
  var __path = "/repos/{owner}/{repo}/pulls/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"allow_maintainer_edit":true},{"allow_maintainer_edit":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-47";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-47"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-47";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditPullRequest::allow_maintainer_edit",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:47",{oracle_id:"concurrency::same-field::repoEditPullRequest::allow_maintainer_edit",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditPullRequest__assignee", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreatePullRequest")});
  sync({request:Event("SBT:ConcurrencyReady:48",{oracle_id:"concurrency::same-field::repoEditPullRequest::assignee"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:48")});
  var __path = "/repos/{owner}/{repo}/pulls/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"assignee":"sbt_generated_a_assignee"},{"assignee":"sbt_generated_b_assignee"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-48";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-48"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-48";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditPullRequest::assignee",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:48",{oracle_id:"concurrency::same-field::repoEditPullRequest::assignee",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditPullRequest__base", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreatePullRequest")});
  sync({request:Event("SBT:ConcurrencyReady:49",{oracle_id:"concurrency::same-field::repoEditPullRequest::base"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:49")});
  var __path = "/repos/{owner}/{repo}/pulls/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"base":"sbt_generated_a_base"},{"base":"sbt_generated_b_base"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-49";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-49"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-49";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditPullRequest::base",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:49",{oracle_id:"concurrency::same-field::repoEditPullRequest::base",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditPullRequest__body", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreatePullRequest")});
  sync({request:Event("SBT:ConcurrencyReady:50",{oracle_id:"concurrency::same-field::repoEditPullRequest::body"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:50")});
  var __path = "/repos/{owner}/{repo}/pulls/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"body":"sbt_generated_a_body"},{"body":"sbt_generated_b_body"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-50";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-50"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-50";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditPullRequest::body",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:50",{oracle_id:"concurrency::same-field::repoEditPullRequest::body",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditPullRequest__content_version", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreatePullRequest")});
  sync({request:Event("SBT:ConcurrencyReady:51",{oracle_id:"concurrency::same-field::repoEditPullRequest::content_version"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:51")});
  var __path = "/repos/{owner}/{repo}/pulls/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"content_version":1},{"content_version":2}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-51";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-51"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-51";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditPullRequest::content_version",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:51",{oracle_id:"concurrency::same-field::repoEditPullRequest::content_version",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditPullRequest__due_date", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreatePullRequest")});
  sync({request:Event("SBT:ConcurrencyReady:52",{oracle_id:"concurrency::same-field::repoEditPullRequest::due_date"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:52")});
  var __path = "/repos/{owner}/{repo}/pulls/{index}";
  __path = __path.replace("{index}", String(__sbtReadPath(__created.data.__httpResponse,"number")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"due_date":"2026-01-01T00:00:00Z"},{"due_date":"2026-01-02T00:00:00Z"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-52";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-52"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-52";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditPullRequest::due_date",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:52",{oracle_id:"concurrency::same-field::repoEditPullRequest::due_date",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditRelease__body", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateRelease")});
  sync({request:Event("SBT:ConcurrencyReady:53",{oracle_id:"concurrency::same-field::repoEditRelease::body"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:53")});
  var __path = "/repos/{owner}/{repo}/releases/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"body":"sbt_generated_a_body"},{"body":"sbt_generated_b_body"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-53";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-53"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-53";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditRelease::body",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:53",{oracle_id:"concurrency::same-field::repoEditRelease::body",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditRelease__draft", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateRelease")});
  sync({request:Event("SBT:ConcurrencyReady:54",{oracle_id:"concurrency::same-field::repoEditRelease::draft"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:54")});
  var __path = "/repos/{owner}/{repo}/releases/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"draft":true},{"draft":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-54";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-54"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-54";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditRelease::draft",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:54",{oracle_id:"concurrency::same-field::repoEditRelease::draft",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditRelease__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateRelease")});
  sync({request:Event("SBT:ConcurrencyReady:55",{oracle_id:"concurrency::same-field::repoEditRelease::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:55")});
  var __path = "/repos/{owner}/{repo}/releases/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-55";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-55"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-55";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditRelease::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:55",{oracle_id:"concurrency::same-field::repoEditRelease::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditRelease__prerelease", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateRelease")});
  sync({request:Event("SBT:ConcurrencyReady:56",{oracle_id:"concurrency::same-field::repoEditRelease::prerelease"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:56")});
  var __path = "/repos/{owner}/{repo}/releases/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"prerelease":true},{"prerelease":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-56";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-56"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-56";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditRelease::prerelease",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:56",{oracle_id:"concurrency::same-field::repoEditRelease::prerelease",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditRelease__tag_name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateRelease")});
  sync({request:Event("SBT:ConcurrencyReady:57",{oracle_id:"concurrency::same-field::repoEditRelease::tag_name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:57")});
  var __path = "/repos/{owner}/{repo}/releases/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"tag_name":"sbt_generated_a_tag_name"},{"tag_name":"sbt_generated_b_tag_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-57";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-57"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-57";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditRelease::tag_name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:57",{oracle_id:"concurrency::same-field::repoEditRelease::tag_name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditRelease__target_commitish", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateRelease")});
  sync({request:Event("SBT:ConcurrencyReady:58",{oracle_id:"concurrency::same-field::repoEditRelease::target_commitish"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:58")});
  var __path = "/repos/{owner}/{repo}/releases/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"target_commitish":"sbt_generated_a_target_commitish"},{"target_commitish":"sbt_generated_b_target_commitish"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-58";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-58"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-58";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditRelease::target_commitish",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:58",{oracle_id:"concurrency::same-field::repoEditRelease::target_commitish",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditReleaseAttachment__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateReleaseAttachment")});
  sync({request:Event("SBT:ConcurrencyReady:59",{oracle_id:"concurrency::same-field::repoEditReleaseAttachment::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:59")});
  var __path = "/repos/{owner}/{repo}/releases/{id}/assets/{attachment_id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{attachment_id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-59";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[201]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-59"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[201]}); }
  var __epoch = "generated-epoch-59";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditReleaseAttachment::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:59",{oracle_id:"concurrency::same-field::repoEditReleaseAttachment::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__repoEditTagProtection__name_pattern", function(){
  var __created = sync({waitFor:__sbtCreateEvent("repoCreateTagProtection")});
  sync({request:Event("SBT:ConcurrencyReady:60",{oracle_id:"concurrency::same-field::repoEditTagProtection::name_pattern"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:60")});
  var __path = "/repos/{owner}/{repo}/tag_protections/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  __path = __path.replace("{owner}", String(__created.data["owner"]));
  __path = __path.replace("{repo}", String(__created.data["repo"]));
  var __bodies = [{"name_pattern":"sbt_generated_a_name_pattern"},{"name_pattern":"sbt_generated_b_name_pattern"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-60";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-60"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-60";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::repoEditTagProtection::name_pattern",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:60",{oracle_id:"concurrency::same-field::repoEditTagProtection::name_pattern",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditTeam__can_create_org_repo", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateTeam")});
  sync({request:Event("SBT:ConcurrencyReady:61",{oracle_id:"concurrency::same-field::orgEditTeam::can_create_org_repo"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:61")});
  var __path = "/teams/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"can_create_org_repo":true},{"can_create_org_repo":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-61";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-61"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-61";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditTeam::can_create_org_repo",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:61",{oracle_id:"concurrency::same-field::orgEditTeam::can_create_org_repo",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditTeam__description", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateTeam")});
  sync({request:Event("SBT:ConcurrencyReady:62",{oracle_id:"concurrency::same-field::orgEditTeam::description"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:62")});
  var __path = "/teams/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"description":"sbt_generated_a_description"},{"description":"sbt_generated_b_description"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-62";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-62"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-62";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditTeam::description",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:62",{oracle_id:"concurrency::same-field::orgEditTeam::description",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditTeam__includes_all_repositories", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateTeam")});
  sync({request:Event("SBT:ConcurrencyReady:63",{oracle_id:"concurrency::same-field::orgEditTeam::includes_all_repositories"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:63")});
  var __path = "/teams/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"includes_all_repositories":true},{"includes_all_repositories":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-63";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-63"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-63";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditTeam::includes_all_repositories",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:63",{oracle_id:"concurrency::same-field::orgEditTeam::includes_all_repositories",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditTeam__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateTeam")});
  sync({request:Event("SBT:ConcurrencyReady:64",{oracle_id:"concurrency::same-field::orgEditTeam::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:64")});
  var __path = "/teams/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-64";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-64"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-64";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditTeam::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:64",{oracle_id:"concurrency::same-field::orgEditTeam::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditTeam__permission", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateTeam")});
  sync({request:Event("SBT:ConcurrencyReady:65",{oracle_id:"concurrency::same-field::orgEditTeam::permission"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:65")});
  var __path = "/teams/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"permission":"read"},{"permission":"write"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-65";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-65"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-65";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditTeam::permission",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:65",{oracle_id:"concurrency::same-field::orgEditTeam::permission",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__orgEditTeam__visibility", function(){
  var __created = sync({waitFor:__sbtCreateEvent("orgCreateTeam")});
  sync({request:Event("SBT:ConcurrencyReady:66",{oracle_id:"concurrency::same-field::orgEditTeam::visibility"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:66")});
  var __path = "/teams/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"visibility":"public"},{"visibility":"limited"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-66";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-66"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-66";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::orgEditTeam::visibility",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:66",{oracle_id:"concurrency::same-field::orgEditTeam::visibility",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__userUpdateOAuth2Application__confidential_client", function(){
  var __created = sync({waitFor:__sbtCreateEvent("userCreateOAuth2Application")});
  sync({request:Event("SBT:ConcurrencyReady:67",{oracle_id:"concurrency::same-field::userUpdateOAuth2Application::confidential_client"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:67")});
  var __path = "/user/applications/oauth2/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"confidential_client":true},{"confidential_client":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["name","redirect_uris"];
  if(!__baseline || __requestFields.some(function(__rf){return __baseline[__rf]===undefined || __baseline[__rf]===null;})){sync({request:Event("SBT:ConcurrencyClosed:67",{oracle_id:"concurrency::same-field::userUpdateOAuth2Application::confidential_client",reason:"documented-carry-fields-unavailable"})});return;}
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-67";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-67"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-67";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::userUpdateOAuth2Application::confidential_client",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:67",{oracle_id:"concurrency::same-field::userUpdateOAuth2Application::confidential_client",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__userUpdateOAuth2Application__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("userCreateOAuth2Application")});
  sync({request:Event("SBT:ConcurrencyReady:68",{oracle_id:"concurrency::same-field::userUpdateOAuth2Application::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:68")});
  var __path = "/user/applications/oauth2/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["name","redirect_uris"];
  if(!__baseline || __requestFields.some(function(__rf){return __baseline[__rf]===undefined || __baseline[__rf]===null;})){sync({request:Event("SBT:ConcurrencyClosed:68",{oracle_id:"concurrency::same-field::userUpdateOAuth2Application::name",reason:"documented-carry-fields-unavailable"})});return;}
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-68";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-68"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-68";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::userUpdateOAuth2Application::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:68",{oracle_id:"concurrency::same-field::userUpdateOAuth2Application::name",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__userUpdateOAuth2Application__skip_secondary_authorization", function(){
  var __created = sync({waitFor:__sbtCreateEvent("userCreateOAuth2Application")});
  sync({request:Event("SBT:ConcurrencyReady:69",{oracle_id:"concurrency::same-field::userUpdateOAuth2Application::skip_secondary_authorization"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:69")});
  var __path = "/user/applications/oauth2/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"skip_secondary_authorization":true},{"skip_secondary_authorization":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __requestFields = ["name","redirect_uris"];
  if(!__baseline || __requestFields.some(function(__rf){return __baseline[__rf]===undefined || __baseline[__rf]===null;})){sync({request:Event("SBT:ConcurrencyClosed:69",{oracle_id:"concurrency::same-field::userUpdateOAuth2Application::skip_secondary_authorization",reason:"documented-carry-fields-unavailable"})});return;}
  for(var __m=0;__m<__bodies.length;__m++){var __full={}; for(var __n=0;__n<__requestFields.length;__n++){var __rf=__requestFields[__n]; if(__baseline && __baseline[__rf]!==undefined){__full[__rf]=__baseline[__rf];}} for(var __override in __bodies[__m]){__full[__override]=__bodies[__m][__override];} __bodies[__m]=__full;}
  var __controlEpoch = "generated-control-69";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-69"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-69";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::userUpdateOAuth2Application::skip_secondary_authorization",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:69",{oracle_id:"concurrency::same-field::userUpdateOAuth2Application::skip_secondary_authorization",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__userEditHook__active", function(){
  var __created = sync({waitFor:__sbtCreateEvent("userCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:70",{oracle_id:"concurrency::same-field::userEditHook::active"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:70")});
  var __path = "/user/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"active":true},{"active":false}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-70";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-70"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-70";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::userEditHook::active",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:70",{oracle_id:"concurrency::same-field::userEditHook::active",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__userEditHook__authorization_header", function(){
  var __created = sync({waitFor:__sbtCreateEvent("userCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:71",{oracle_id:"concurrency::same-field::userEditHook::authorization_header"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:71")});
  var __path = "/user/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"authorization_header":"sbt_generated_a_authorization_header"},{"authorization_header":"sbt_generated_b_authorization_header"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-71";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-71"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-71";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::userEditHook::authorization_header",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:71",{oracle_id:"concurrency::same-field::userEditHook::authorization_header",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__userEditHook__branch_filter", function(){
  var __created = sync({waitFor:__sbtCreateEvent("userCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:72",{oracle_id:"concurrency::same-field::userEditHook::branch_filter"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:72")});
  var __path = "/user/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"branch_filter":"sbt_generated_a_branch_filter"},{"branch_filter":"sbt_generated_b_branch_filter"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-72";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-72"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-72";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::userEditHook::branch_filter",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:72",{oracle_id:"concurrency::same-field::userEditHook::branch_filter",path:__path})});
});
bthread("sbt:concurrency:concurrency__same_field__userEditHook__name", function(){
  var __created = sync({waitFor:__sbtCreateEvent("userCreateHook")});
  sync({request:Event("SBT:ConcurrencyReady:73",{oracle_id:"concurrency::same-field::userEditHook::name"})});
  sync({waitFor:Event("SBT:ConcurrencyPermit:73")});
  var __path = "/user/hooks/{id}";
  __path = __path.replace("{id}", String(__sbtReadPath(__created.data.__httpResponse,"id")));
  var __bodies = [{"name":"sbt_generated_a_name"},{"name":"sbt_generated_b_name"}];
  var __baseline = null;
  svc.get(__path,{expectedResponseCodes:[200],callback:function(r){try{__baseline=JSON.parse(r.body);}catch(e){__baseline=null;}}});
  var __controlEpoch = "generated-control-73";
  for(var __i=0;__i<__bodies.length;__i++){ svc.patch(__path,{body:JSON.stringify(__bodies[__i]),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-op-"+__i},expectedResponseCodes:[200]}); }
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__controlEpoch,"X-Provengo-Operation-Id":__controlEpoch+"-observe"},expectedResponseCodes:[200]});
  if(__baseline){ var __reset={}; for(var __j=0;__j<__bodies.length;__j++){for(var __f in __bodies[__j]){if(__baseline[__f]!==undefined){__reset[__f]=__baseline[__f];}}} var __resetEpoch="generated-reset-73"; svc.patch(__path,{body:JSON.stringify(__reset),headers:{"Content-Type":"application/json","X-Provengo-Epoch-Id":__resetEpoch,"X-Provengo-Operation-Id":__resetEpoch+"-op-0"},expectedResponseCodes:[200]}); }
  var __epoch = "generated-epoch-73";
  var __ops=[]; for(var __k=0;__k<__bodies.length;__k++){__ops.push({operation_id:__epoch+"-op-"+__k,method:"PATCH",path:__path,body:__bodies[__k],delay_ms:0,headers:{"Content-Type":"application/json"}});}
  __sbtAdapter.post("/epochs",{body:JSON.stringify({epoch_id:__epoch,scenario:"concurrency::same-field::userEditHook::name",operations:__ops}),expectedResponseCodes:[200]});
  svc.get(__path,{headers:{"X-Provengo-Epoch-Id":__epoch,"X-Provengo-Operation-Id":__epoch+"-observe"},expectedResponseCodes:[200]});
  sync({request:Event("SBT:ConcurrencyClosed:73",{oracle_id:"concurrency::same-field::userEditHook::name",path:__path})});
});
function __sbtNamedEvent(__name){ return EventSet("SBT named event "+__name,function(e){return !!(e&&e.name===__name);}); }
function __sbtAnyConcurrencyReady(){ return EventSet("SBT any concurrency ready",function(e){return !!(e&&e.name&&e.name.indexOf("SBT:ConcurrencyReady:")===0);}); }
function __sbtAnyHttpDelete(){ return EventSet("SBT any HTTP DELETE",function(e){return !!(e&&e.name==="DELETE");}); }
function __sbtConcurrencyBusyBlock(){ return EventSet("SBT concurrency admission or cleanup",function(e){return !!(e&&e.name&&(e.name==="DELETE"||e.name.indexOf("SBT:ConcurrencyReady:")===0));}); }
bthread("sbt:concurrency-controller",function(){
  var __readySeen={}; var __readyCount=0; var __readyTotal=74;
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
