// GENERATED INCREMENT 8 PROVENGO-NATIVE CONCURRENT EPOCH STORIES
//@provengo summon rest
var __c8AdapterPort=(typeof concurrencyPort!=="undefined")?concurrencyPort:3458;
var __c8Adapter=new RESTSession("http://127.0.0.1:"+__c8AdapterPort,"provengo-concurrent-rest",{headers:{"Content-Type":"application/json"}});
function __c8Named(n){return EventSet("increment8:"+n,function(e){return e.name===n;});}
function __c8Blocked(e){return e.name==="Intent:UpdateProject"||e.name==="Milestone:AuxReadyForMutation"||e.name==="MultiResourceVerifiedActionsComplete";}
function __c8Execute(payload){
  let result=null;
  __c8Adapter.post("/epochs",{body:JSON.stringify(payload),expectedResponseCodes:[200],callback:function(response){try{result=JSON.parse(response.body);}catch(e){result={parse_error:String(e),raw:String(response.body)};}}});
  return result;
}
bthread("constraint:increment8-before-base-mutations",function(){sync({waitFor:__c8Named("Milestone:AllConcurrentEpochVerifiersClosed"),block:EventSet("increment8:block-base",__c8Blocked)});});
bthread("scheduler:increment8-epochs",function(){
  sync({waitFor:__c8Named("Milestone:AllDisjointPatchVerifiersClosed")});
  let remaining={};
  remaining["Permit:Increment8:Epoch:0"]=Event("Permit:Increment8:Epoch:0");
  remaining["Permit:Increment8:Epoch:1"]=Event("Permit:Increment8:Epoch:1");
  remaining["Permit:Increment8:Epoch:2"]=Event("Permit:Increment8:Epoch:2");
  remaining["Permit:Increment8:Epoch:3"]=Event("Permit:Increment8:Epoch:3");
  remaining["Permit:Increment8:Epoch:4"]=Event("Permit:Increment8:Epoch:4");
  remaining["Permit:Increment8:Epoch:5"]=Event("Permit:Increment8:Epoch:5");
  while(Object.keys(remaining).length){let selected=sync({request:Object.values(remaining)});delete remaining[selected.name];}
});

bthread("increment8:task:0:concurrent-epoch",function(){
  let task=sync({waitFor:__c8Named("State:TaskReady:0")}).data||{};
  sync({waitFor:__c8Named("VerifierClosed:TaskCreate:0")});
  sync({waitFor:__c8Named("Milestone:AllDisjointPatchVerifiersClosed")});
  sync({waitFor:__c8Named("Permit:Increment8:Epoch:0")});
  let epochId="increment8-task-0";
  let titleOp={operation_id:epochId+"-title",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{title:"increment8_task_0_title"}};
  let descriptionOp={operation_id:epochId+"-description",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{description:"increment8_task_0_description"}};
  sync({request:Event("ConcurrentEpochDeclared",{epoch_id:epochId,width:2,task_id:task.id,hazard:"disjoint-write-write"})});
  sync({request:Event("ConcurrentOperationRegistered",titleOp)});
  sync({request:Event("ConcurrentOperationRegistered",descriptionOp)});
  sync({request:Event("ConcurrentEpochRelease",{epoch_id:epochId})});
  let result=__c8Execute({epoch_id:epochId,operations:[titleOp,descriptionOp]});
  sync({request:Event("ConcurrentEpochJoined",{epoch_id:epochId,result:result})});
  sync({request:Event("ConcurrentEpochObserve",{epoch_id:epochId,task_id:task.id})});
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConcurrentEpochVerifierClosed:Task:0",{epoch_id:epochId,task_id:task.id})});
});

bthread("increment8:task:1:concurrent-epoch",function(){
  let task=sync({waitFor:__c8Named("State:TaskReady:1")}).data||{};
  sync({waitFor:__c8Named("VerifierClosed:TaskCreate:1")});
  sync({waitFor:__c8Named("Milestone:AllDisjointPatchVerifiersClosed")});
  sync({waitFor:__c8Named("Permit:Increment8:Epoch:1")});
  let epochId="increment8-task-1";
  let titleOp={operation_id:epochId+"-title",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{title:"increment8_task_1_title"}};
  let descriptionOp={operation_id:epochId+"-description",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{description:"increment8_task_1_description"}};
  sync({request:Event("ConcurrentEpochDeclared",{epoch_id:epochId,width:2,task_id:task.id,hazard:"disjoint-write-write"})});
  sync({request:Event("ConcurrentOperationRegistered",titleOp)});
  sync({request:Event("ConcurrentOperationRegistered",descriptionOp)});
  sync({request:Event("ConcurrentEpochRelease",{epoch_id:epochId})});
  let result=__c8Execute({epoch_id:epochId,operations:[titleOp,descriptionOp]});
  sync({request:Event("ConcurrentEpochJoined",{epoch_id:epochId,result:result})});
  sync({request:Event("ConcurrentEpochObserve",{epoch_id:epochId,task_id:task.id})});
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConcurrentEpochVerifierClosed:Task:1",{epoch_id:epochId,task_id:task.id})});
});

bthread("increment8:task:2:concurrent-epoch",function(){
  let task=sync({waitFor:__c8Named("State:TaskReady:2")}).data||{};
  sync({waitFor:__c8Named("VerifierClosed:TaskCreate:2")});
  sync({waitFor:__c8Named("Milestone:AllDisjointPatchVerifiersClosed")});
  sync({waitFor:__c8Named("Permit:Increment8:Epoch:2")});
  let epochId="increment8-task-2";
  let titleOp={operation_id:epochId+"-title",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{title:"increment8_task_2_title"}};
  let descriptionOp={operation_id:epochId+"-description",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{description:"increment8_task_2_description"}};
  sync({request:Event("ConcurrentEpochDeclared",{epoch_id:epochId,width:2,task_id:task.id,hazard:"disjoint-write-write"})});
  sync({request:Event("ConcurrentOperationRegistered",titleOp)});
  sync({request:Event("ConcurrentOperationRegistered",descriptionOp)});
  sync({request:Event("ConcurrentEpochRelease",{epoch_id:epochId})});
  let result=__c8Execute({epoch_id:epochId,operations:[titleOp,descriptionOp]});
  sync({request:Event("ConcurrentEpochJoined",{epoch_id:epochId,result:result})});
  sync({request:Event("ConcurrentEpochObserve",{epoch_id:epochId,task_id:task.id})});
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConcurrentEpochVerifierClosed:Task:2",{epoch_id:epochId,task_id:task.id})});
});

bthread("increment8:task:3:concurrent-epoch",function(){
  let task=sync({waitFor:__c8Named("State:TaskReady:3")}).data||{};
  sync({waitFor:__c8Named("VerifierClosed:TaskCreate:3")});
  sync({waitFor:__c8Named("Milestone:AllDisjointPatchVerifiersClosed")});
  sync({waitFor:__c8Named("Permit:Increment8:Epoch:3")});
  let epochId="increment8-task-3";
  let titleOp={operation_id:epochId+"-title",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{title:"increment8_task_3_title"}};
  let descriptionOp={operation_id:epochId+"-description",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{description:"increment8_task_3_description"}};
  sync({request:Event("ConcurrentEpochDeclared",{epoch_id:epochId,width:2,task_id:task.id,hazard:"disjoint-write-write"})});
  sync({request:Event("ConcurrentOperationRegistered",titleOp)});
  sync({request:Event("ConcurrentOperationRegistered",descriptionOp)});
  sync({request:Event("ConcurrentEpochRelease",{epoch_id:epochId})});
  let result=__c8Execute({epoch_id:epochId,operations:[titleOp,descriptionOp]});
  sync({request:Event("ConcurrentEpochJoined",{epoch_id:epochId,result:result})});
  sync({request:Event("ConcurrentEpochObserve",{epoch_id:epochId,task_id:task.id})});
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConcurrentEpochVerifierClosed:Task:3",{epoch_id:epochId,task_id:task.id})});
});

bthread("increment8:task:4:concurrent-epoch",function(){
  let task=sync({waitFor:__c8Named("State:TaskReady:4")}).data||{};
  sync({waitFor:__c8Named("VerifierClosed:TaskCreate:4")});
  sync({waitFor:__c8Named("Milestone:AllDisjointPatchVerifiersClosed")});
  sync({waitFor:__c8Named("Permit:Increment8:Epoch:4")});
  let epochId="increment8-task-4";
  let titleOp={operation_id:epochId+"-title",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{title:"increment8_task_4_title"}};
  let descriptionOp={operation_id:epochId+"-description",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{description:"increment8_task_4_description"}};
  sync({request:Event("ConcurrentEpochDeclared",{epoch_id:epochId,width:2,task_id:task.id,hazard:"disjoint-write-write"})});
  sync({request:Event("ConcurrentOperationRegistered",titleOp)});
  sync({request:Event("ConcurrentOperationRegistered",descriptionOp)});
  sync({request:Event("ConcurrentEpochRelease",{epoch_id:epochId})});
  let result=__c8Execute({epoch_id:epochId,operations:[titleOp,descriptionOp]});
  sync({request:Event("ConcurrentEpochJoined",{epoch_id:epochId,result:result})});
  sync({request:Event("ConcurrentEpochObserve",{epoch_id:epochId,task_id:task.id})});
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConcurrentEpochVerifierClosed:Task:4",{epoch_id:epochId,task_id:task.id})});
});

bthread("increment8:task:5:concurrent-epoch",function(){
  let task=sync({waitFor:__c8Named("State:TaskReady:5")}).data||{};
  sync({waitFor:__c8Named("VerifierClosed:TaskCreate:5")});
  sync({waitFor:__c8Named("Milestone:AllDisjointPatchVerifiersClosed")});
  sync({waitFor:__c8Named("Permit:Increment8:Epoch:5")});
  let epochId="increment8-task-5";
  let titleOp={operation_id:epochId+"-title",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{title:"increment8_task_5_title"}};
  let descriptionOp={operation_id:epochId+"-description",method:"PATCH",path:"/tasks/"+task.id,headers:{"Content-Type":"application/merge-patch+json"},body:{description:"increment8_task_5_description"}};
  sync({request:Event("ConcurrentEpochDeclared",{epoch_id:epochId,width:2,task_id:task.id,hazard:"disjoint-write-write"})});
  sync({request:Event("ConcurrentOperationRegistered",titleOp)});
  sync({request:Event("ConcurrentOperationRegistered",descriptionOp)});
  sync({request:Event("ConcurrentEpochRelease",{epoch_id:epochId})});
  let result=__c8Execute({epoch_id:epochId,operations:[titleOp,descriptionOp]});
  sync({request:Event("ConcurrentEpochJoined",{epoch_id:epochId,result:result})});
  sync({request:Event("ConcurrentEpochObserve",{epoch_id:epochId,task_id:task.id})});
  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConcurrentEpochVerifierClosed:Task:5",{epoch_id:epochId,task_id:task.id})});
});

bthread("coordinator:increment8-verifiers-closed",function(){
  let pending={};
  pending["ConcurrentEpochVerifierClosed:Task:0"]=__c8Named("ConcurrentEpochVerifierClosed:Task:0");
  pending["ConcurrentEpochVerifierClosed:Task:1"]=__c8Named("ConcurrentEpochVerifierClosed:Task:1");
  pending["ConcurrentEpochVerifierClosed:Task:2"]=__c8Named("ConcurrentEpochVerifierClosed:Task:2");
  pending["ConcurrentEpochVerifierClosed:Task:3"]=__c8Named("ConcurrentEpochVerifierClosed:Task:3");
  pending["ConcurrentEpochVerifierClosed:Task:4"]=__c8Named("ConcurrentEpochVerifierClosed:Task:4");
  pending["ConcurrentEpochVerifierClosed:Task:5"]=__c8Named("ConcurrentEpochVerifierClosed:Task:5");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  sync({request:Event("Milestone:AllConcurrentEpochVerifiersClosed")});
});
