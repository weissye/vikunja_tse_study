// GENERATED INCREMENT 7.2 DISJOINT PATCH STORIES -- OpenAPI grounded
function __c72Named(n){return EventSet("increment7_2:"+n,function(e){return e.name===n;});}
function __c72Blocked(e){return e.name==="Intent:UpdateProject"||e.name==="Milestone:AuxReadyForMutation"||e.name==="MultiResourceVerifiedActionsComplete";}
bthread("constraint:increment7_2-before-base-mutations",function(){sync({waitFor:__c72Named("Milestone:AllDisjointPatchVerifiersClosed"),block:EventSet("increment7_2:block-base",__c72Blocked)});});

bthread("increment7_2:task:0:title",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:0")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:0")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:0:title")});
  sync({request:Event("Intent:Increment7_2:Task:0:title")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_2_task_0_title"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:0:title")});
});

bthread("increment7_2:task:0:description",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:0")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:0")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:0:description")});
  sync({request:Event("Intent:Increment7_2:Task:0:description")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_2_task_0_description"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:0:description")});
});

bthread("increment7_2:task:0:verifier",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:0")}).data||{};
  let pending={};
  pending["DisjointPatchClosed:Task:0:title"]=__c72Named("DisjointPatchClosed:Task:0:title");
  pending["DisjointPatchClosed:Task:0:description"]=__c72Named("DisjointPatchClosed:Task:0:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchVerifierClosed:Task:0")});
});

bthread("increment7_2:task:1:title",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:1")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:1")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:1:title")});
  sync({request:Event("Intent:Increment7_2:Task:1:title")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_2_task_1_title"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:1:title")});
});

bthread("increment7_2:task:1:description",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:1")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:1")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:1:description")});
  sync({request:Event("Intent:Increment7_2:Task:1:description")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_2_task_1_description"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:1:description")});
});

bthread("increment7_2:task:1:verifier",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:1")}).data||{};
  let pending={};
  pending["DisjointPatchClosed:Task:1:title"]=__c72Named("DisjointPatchClosed:Task:1:title");
  pending["DisjointPatchClosed:Task:1:description"]=__c72Named("DisjointPatchClosed:Task:1:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchVerifierClosed:Task:1")});
});

bthread("increment7_2:task:2:title",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:2")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:2")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:2:title")});
  sync({request:Event("Intent:Increment7_2:Task:2:title")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_2_task_2_title"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:2:title")});
});

bthread("increment7_2:task:2:description",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:2")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:2")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:2:description")});
  sync({request:Event("Intent:Increment7_2:Task:2:description")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_2_task_2_description"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:2:description")});
});

bthread("increment7_2:task:2:verifier",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:2")}).data||{};
  let pending={};
  pending["DisjointPatchClosed:Task:2:title"]=__c72Named("DisjointPatchClosed:Task:2:title");
  pending["DisjointPatchClosed:Task:2:description"]=__c72Named("DisjointPatchClosed:Task:2:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchVerifierClosed:Task:2")});
});

bthread("increment7_2:task:3:title",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:3")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:3")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:3:title")});
  sync({request:Event("Intent:Increment7_2:Task:3:title")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_2_task_3_title"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:3:title")});
});

bthread("increment7_2:task:3:description",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:3")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:3")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:3:description")});
  sync({request:Event("Intent:Increment7_2:Task:3:description")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_2_task_3_description"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:3:description")});
});

bthread("increment7_2:task:3:verifier",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:3")}).data||{};
  let pending={};
  pending["DisjointPatchClosed:Task:3:title"]=__c72Named("DisjointPatchClosed:Task:3:title");
  pending["DisjointPatchClosed:Task:3:description"]=__c72Named("DisjointPatchClosed:Task:3:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchVerifierClosed:Task:3")});
});

bthread("increment7_2:task:4:title",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:4")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:4")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:4:title")});
  sync({request:Event("Intent:Increment7_2:Task:4:title")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_2_task_4_title"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:4:title")});
});

bthread("increment7_2:task:4:description",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:4")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:4")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:4:description")});
  sync({request:Event("Intent:Increment7_2:Task:4:description")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_2_task_4_description"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:4:description")});
});

bthread("increment7_2:task:4:verifier",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:4")}).data||{};
  let pending={};
  pending["DisjointPatchClosed:Task:4:title"]=__c72Named("DisjointPatchClosed:Task:4:title");
  pending["DisjointPatchClosed:Task:4:description"]=__c72Named("DisjointPatchClosed:Task:4:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchVerifierClosed:Task:4")});
});

bthread("increment7_2:task:5:title",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:5")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:5")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:5:title")});
  sync({request:Event("Intent:Increment7_2:Task:5:title")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_2_task_5_title"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:5:title")});
});

bthread("increment7_2:task:5:description",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:5")}).data||{};
  sync({waitFor:__c72Named("VerifierClosed:TaskCreate:5")});
  sync({waitFor:__c72Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7_2:Task:5:description")});
  sync({request:Event("Intent:Increment7_2:Task:5:description")});
  svc.patch("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_2_task_5_description"}),headers:{"Content-Type":"application/merge-patch+json"},expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchClosed:Task:5:description")});
});

bthread("increment7_2:task:5:verifier",function(){
  let task=sync({waitFor:__c72Named("State:TaskReady:5")}).data||{};
  let pending={};
  pending["DisjointPatchClosed:Task:5:title"]=__c72Named("DisjointPatchClosed:Task:5:title");
  pending["DisjointPatchClosed:Task:5:description"]=__c72Named("DisjointPatchClosed:Task:5:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointPatchVerifierClosed:Task:5")});
});

bthread("coordinator:increment7_2-verifiers-closed",function(){
  let pending={};
  pending["DisjointPatchVerifierClosed:Task:0"]=__c72Named("DisjointPatchVerifierClosed:Task:0");
  pending["DisjointPatchVerifierClosed:Task:1"]=__c72Named("DisjointPatchVerifierClosed:Task:1");
  pending["DisjointPatchVerifierClosed:Task:2"]=__c72Named("DisjointPatchVerifierClosed:Task:2");
  pending["DisjointPatchVerifierClosed:Task:3"]=__c72Named("DisjointPatchVerifierClosed:Task:3");
  pending["DisjointPatchVerifierClosed:Task:4"]=__c72Named("DisjointPatchVerifierClosed:Task:4");
  pending["DisjointPatchVerifierClosed:Task:5"]=__c72Named("DisjointPatchVerifierClosed:Task:5");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  sync({request:Event("Milestone:AllDisjointPatchVerifiersClosed")});
});
