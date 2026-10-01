// GENERATED INCREMENT 7 DISJOINT-UPDATE STORIES -- OpenAPI grounded
function __c7Named(n){return EventSet("increment7:"+n,function(e){return e.name===n;});}
function __c7Blocked(e){return e.name==="Intent:UpdateProject"||e.name==="Milestone:AuxReadyForMutation"||e.name==="MultiResourceVerifiedActionsComplete";}
bthread("constraint:increment7-before-base-mutations",function(){sync({waitFor:__c7Named("Milestone:AllDisjointUpdateVerifiersClosed"),block:EventSet("increment7:block-base",__c7Blocked)});});

bthread("increment7:task:0:title",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:0")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:0")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:0:title")});
  sync({request:Event("Intent:Increment7:Task:0:title")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_task_0_title"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:0:title")});
});

bthread("increment7:task:0:description",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:0")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:0")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:0:description")});
  sync({request:Event("Intent:Increment7:Task:0:description")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_task_0_description"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:0:description")});
});

bthread("increment7:task:0:verifier",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:0")}).data||{};
  let pending={};
  pending["DisjointWriteClosed:Task:0:title"]=__c7Named("DisjointWriteClosed:Task:0:title");
  pending["DisjointWriteClosed:Task:0:description"]=__c7Named("DisjointWriteClosed:Task:0:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointVerifierClosed:Task:0")});
});

bthread("increment7:task:1:title",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:1")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:1")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:1:title")});
  sync({request:Event("Intent:Increment7:Task:1:title")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_task_1_title"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:1:title")});
});

bthread("increment7:task:1:description",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:1")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:1")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:1:description")});
  sync({request:Event("Intent:Increment7:Task:1:description")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_task_1_description"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:1:description")});
});

bthread("increment7:task:1:verifier",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:1")}).data||{};
  let pending={};
  pending["DisjointWriteClosed:Task:1:title"]=__c7Named("DisjointWriteClosed:Task:1:title");
  pending["DisjointWriteClosed:Task:1:description"]=__c7Named("DisjointWriteClosed:Task:1:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointVerifierClosed:Task:1")});
});

bthread("increment7:task:2:title",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:2")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:2")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:2:title")});
  sync({request:Event("Intent:Increment7:Task:2:title")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_task_2_title"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:2:title")});
});

bthread("increment7:task:2:description",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:2")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:2")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:2:description")});
  sync({request:Event("Intent:Increment7:Task:2:description")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_task_2_description"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:2:description")});
});

bthread("increment7:task:2:verifier",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:2")}).data||{};
  let pending={};
  pending["DisjointWriteClosed:Task:2:title"]=__c7Named("DisjointWriteClosed:Task:2:title");
  pending["DisjointWriteClosed:Task:2:description"]=__c7Named("DisjointWriteClosed:Task:2:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointVerifierClosed:Task:2")});
});

bthread("increment7:task:3:title",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:3")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:3")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:3:title")});
  sync({request:Event("Intent:Increment7:Task:3:title")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_task_3_title"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:3:title")});
});

bthread("increment7:task:3:description",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:3")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:3")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:3:description")});
  sync({request:Event("Intent:Increment7:Task:3:description")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_task_3_description"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:3:description")});
});

bthread("increment7:task:3:verifier",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:3")}).data||{};
  let pending={};
  pending["DisjointWriteClosed:Task:3:title"]=__c7Named("DisjointWriteClosed:Task:3:title");
  pending["DisjointWriteClosed:Task:3:description"]=__c7Named("DisjointWriteClosed:Task:3:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointVerifierClosed:Task:3")});
});

bthread("increment7:task:4:title",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:4")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:4")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:4:title")});
  sync({request:Event("Intent:Increment7:Task:4:title")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_task_4_title"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:4:title")});
});

bthread("increment7:task:4:description",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:4")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:4")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:4:description")});
  sync({request:Event("Intent:Increment7:Task:4:description")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_task_4_description"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:4:description")});
});

bthread("increment7:task:4:verifier",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:4")}).data||{};
  let pending={};
  pending["DisjointWriteClosed:Task:4:title"]=__c7Named("DisjointWriteClosed:Task:4:title");
  pending["DisjointWriteClosed:Task:4:description"]=__c7Named("DisjointWriteClosed:Task:4:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointVerifierClosed:Task:4")});
});

bthread("increment7:task:5:title",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:5")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:5")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:5:title")});
  sync({request:Event("Intent:Increment7:Task:5:title")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({title:"increment7_task_5_title"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:5:title")});
});

bthread("increment7:task:5:description",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:5")}).data||{};
  sync({waitFor:__c7Named("VerifierClosed:TaskCreate:5")});
  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});
  sync({request:Event("Permit:Increment7:Task:5:description")});
  sync({request:Event("Intent:Increment7:Task:5:description")});
  svc.put("/tasks/"+task.id,{body:JSON.stringify({description:"increment7_task_5_description"}),expectedResponseCodes:[200]});
  sync({request:Event("DisjointWriteClosed:Task:5:description")});
});

bthread("increment7:task:5:verifier",function(){
  let task=sync({waitFor:__c7Named("State:TaskReady:5")}).data||{};
  let pending={};
  pending["DisjointWriteClosed:Task:5:title"]=__c7Named("DisjointWriteClosed:Task:5:title");
  pending["DisjointWriteClosed:Task:5:description"]=__c7Named("DisjointWriteClosed:Task:5:description");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("DisjointVerifierClosed:Task:5")});
});

bthread("coordinator:increment7-verifiers-closed",function(){
  let pending={};
  pending["DisjointVerifierClosed:Task:0"]=__c7Named("DisjointVerifierClosed:Task:0");
  pending["DisjointVerifierClosed:Task:1"]=__c7Named("DisjointVerifierClosed:Task:1");
  pending["DisjointVerifierClosed:Task:2"]=__c7Named("DisjointVerifierClosed:Task:2");
  pending["DisjointVerifierClosed:Task:3"]=__c7Named("DisjointVerifierClosed:Task:3");
  pending["DisjointVerifierClosed:Task:4"]=__c7Named("DisjointVerifierClosed:Task:4");
  pending["DisjointVerifierClosed:Task:5"]=__c7Named("DisjointVerifierClosed:Task:5");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  sync({request:Event("Milestone:AllDisjointUpdateVerifiersClosed")});
});
