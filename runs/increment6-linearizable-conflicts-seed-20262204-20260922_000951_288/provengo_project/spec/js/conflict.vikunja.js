// GENERATED INCREMENT 6 CONFLICT STORIES -- OpenAPI grounded
function __c6Named(n){return EventSet("conflict6:"+n,function(e){return e.name===n;});}
function __c6Blocked(e){return e.name==="Intent:UpdateProject"||e.name==="Milestone:AuxReadyForMutation"||e.name==="MultiResourceVerifiedActionsComplete";}
bthread("constraint:conflict6-before-base-mutations",function(){sync({waitFor:__c6Named("Milestone:AllConflictVerifiersClosed"),block:EventSet("conflict6:block-base",__c6Blocked)});});

bthread("conflict6:project:A",function(){
  let pending={};
  pending["resource"]=__c6Named("State:ProjectReady");
  pending["verified"]=__c6Named("VerifierClosed:ProjectCreate");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:project:0:A")});
  sync({request:Event("Intent:Conflict6:project:0:A")});
  svc.put("/projects/"+data.resource.id,{body:JSON.stringify({title:"conflict6_project_0_A"}),expectedResponseCodes:[200]});
  svc.get("/projects/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:project:0:A")});
});

bthread("conflict6:project:B",function(){
  let pending={};
  pending["resource"]=__c6Named("State:ProjectReady");
  pending["verified"]=__c6Named("VerifierClosed:ProjectCreate");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:project:0:B")});
  sync({request:Event("Intent:Conflict6:project:0:B")});
  svc.put("/projects/"+data.resource.id,{body:JSON.stringify({title:"conflict6_project_0_B"}),expectedResponseCodes:[200]});
  svc.get("/projects/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:project:0:B")});
});

bthread("conflict6:task:0:A",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:0");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:0");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:0:A")});
  sync({request:Event("Intent:Conflict6:task:0:A")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_0_A",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:0:A")});
});

bthread("conflict6:task:0:B",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:0");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:0");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:0:B")});
  sync({request:Event("Intent:Conflict6:task:0:B")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_0_B",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:0:B")});
});

bthread("conflict6:task:1:A",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:1");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:1");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:1:A")});
  sync({request:Event("Intent:Conflict6:task:1:A")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_1_A",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:1:A")});
});

bthread("conflict6:task:1:B",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:1");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:1");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:1:B")});
  sync({request:Event("Intent:Conflict6:task:1:B")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_1_B",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:1:B")});
});

bthread("conflict6:task:2:A",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:2");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:2");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:2:A")});
  sync({request:Event("Intent:Conflict6:task:2:A")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_2_A",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:2:A")});
});

bthread("conflict6:task:2:B",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:2");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:2");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:2:B")});
  sync({request:Event("Intent:Conflict6:task:2:B")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_2_B",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:2:B")});
});

bthread("conflict6:task:3:A",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:3");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:3");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:3:A")});
  sync({request:Event("Intent:Conflict6:task:3:A")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_3_A",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:3:A")});
});

bthread("conflict6:task:3:B",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:3");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:3");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:3:B")});
  sync({request:Event("Intent:Conflict6:task:3:B")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_3_B",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:3:B")});
});

bthread("conflict6:task:4:A",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:4");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:4");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:4:A")});
  sync({request:Event("Intent:Conflict6:task:4:A")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_4_A",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:4:A")});
});

bthread("conflict6:task:4:B",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:4");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:4");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:4:B")});
  sync({request:Event("Intent:Conflict6:task:4:B")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_4_B",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:4:B")});
});

bthread("conflict6:task:5:A",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:5");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:5");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:5:A")});
  sync({request:Event("Intent:Conflict6:task:5:A")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_5_A",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:5:A")});
});

bthread("conflict6:task:5:B",function(){
  let pending={};
  pending["resource"]=__c6Named("State:TaskReady:5");
  pending["verified"]=__c6Named("VerifierClosed:TaskCreate:5");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:task:5:B")});
  sync({request:Event("Intent:Conflict6:task:5:B")});
  svc.put("/tasks/"+data.resource.id,{body:JSON.stringify({title:"conflict6_task_5_B",done:false}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:task:5:B")});
});

bthread("conflict6:label:0:A",function(){
  let pending={};
  pending["resource"]=__c6Named("State:LabelReady:0");
  pending["verified"]=__c6Named("VerifierClosed:LabelCreate:0");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:label:0:A")});
  sync({request:Event("Intent:Conflict6:label:0:A")});
  svc.put("/labels/"+data.resource.id,{body:JSON.stringify({title:"conflict6_label_0_A"}),expectedResponseCodes:[200]});
  svc.get("/labels/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:label:0:A")});
});

bthread("conflict6:label:0:B",function(){
  let pending={};
  pending["resource"]=__c6Named("State:LabelReady:0");
  pending["verified"]=__c6Named("VerifierClosed:LabelCreate:0");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:label:0:B")});
  sync({request:Event("Intent:Conflict6:label:0:B")});
  svc.put("/labels/"+data.resource.id,{body:JSON.stringify({title:"conflict6_label_0_B"}),expectedResponseCodes:[200]});
  svc.get("/labels/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:label:0:B")});
});

bthread("conflict6:label:1:A",function(){
  let pending={};
  pending["resource"]=__c6Named("State:LabelReady:1");
  pending["verified"]=__c6Named("VerifierClosed:LabelCreate:1");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:label:1:A")});
  sync({request:Event("Intent:Conflict6:label:1:A")});
  svc.put("/labels/"+data.resource.id,{body:JSON.stringify({title:"conflict6_label_1_A"}),expectedResponseCodes:[200]});
  svc.get("/labels/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:label:1:A")});
});

bthread("conflict6:label:1:B",function(){
  let pending={};
  pending["resource"]=__c6Named("State:LabelReady:1");
  pending["verified"]=__c6Named("VerifierClosed:LabelCreate:1");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:label:1:B")});
  sync({request:Event("Intent:Conflict6:label:1:B")});
  svc.put("/labels/"+data.resource.id,{body:JSON.stringify({title:"conflict6_label_1_B"}),expectedResponseCodes:[200]});
  svc.get("/labels/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:label:1:B")});
});

bthread("conflict6:label:2:A",function(){
  let pending={};
  pending["resource"]=__c6Named("State:LabelReady:2");
  pending["verified"]=__c6Named("VerifierClosed:LabelCreate:2");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:label:2:A")});
  sync({request:Event("Intent:Conflict6:label:2:A")});
  svc.put("/labels/"+data.resource.id,{body:JSON.stringify({title:"conflict6_label_2_A"}),expectedResponseCodes:[200]});
  svc.get("/labels/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:label:2:A")});
});

bthread("conflict6:label:2:B",function(){
  let pending={};
  pending["resource"]=__c6Named("State:LabelReady:2");
  pending["verified"]=__c6Named("VerifierClosed:LabelCreate:2");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:label:2:B")});
  sync({request:Event("Intent:Conflict6:label:2:B")});
  svc.put("/labels/"+data.resource.id,{body:JSON.stringify({title:"conflict6_label_2_B"}),expectedResponseCodes:[200]});
  svc.get("/labels/"+data.resource.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:label:2:B")});
});

bthread("conflict6:comment:0:A",function(){
  let pending={};
  pending["task"]=__c6Named("State:TaskReady:0");
  pending["comment"]=__c6Named("State:CommentReady:0");
  pending["updated"]=__c6Named("State:CommentUpdated:0");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:comment:0:A")});
  sync({request:Event("Intent:Conflict6:comment:0:A")});
  svc.put("/tasks/"+data.task.id+"/comments/"+data.comment.id,{body:JSON.stringify({comment:"conflict6_comment_0_A"}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.task.id+"/comments/"+data.comment.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:comment:0:A")});
});

bthread("conflict6:comment:0:B",function(){
  let pending={};
  pending["task"]=__c6Named("State:TaskReady:0");
  pending["comment"]=__c6Named("State:CommentReady:0");
  pending["updated"]=__c6Named("State:CommentUpdated:0");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:comment:0:B")});
  sync({request:Event("Intent:Conflict6:comment:0:B")});
  svc.put("/tasks/"+data.task.id+"/comments/"+data.comment.id,{body:JSON.stringify({comment:"conflict6_comment_0_B"}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.task.id+"/comments/"+data.comment.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:comment:0:B")});
});

bthread("conflict6:comment:1:A",function(){
  let pending={};
  pending["task"]=__c6Named("State:TaskReady:1");
  pending["comment"]=__c6Named("State:CommentReady:1");
  pending["updated"]=__c6Named("State:CommentUpdated:1");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:comment:1:A")});
  sync({request:Event("Intent:Conflict6:comment:1:A")});
  svc.put("/tasks/"+data.task.id+"/comments/"+data.comment.id,{body:JSON.stringify({comment:"conflict6_comment_1_A"}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.task.id+"/comments/"+data.comment.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:comment:1:A")});
});

bthread("conflict6:comment:1:B",function(){
  let pending={};
  pending["task"]=__c6Named("State:TaskReady:1");
  pending["comment"]=__c6Named("State:CommentReady:1");
  pending["updated"]=__c6Named("State:CommentUpdated:1");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:comment:1:B")});
  sync({request:Event("Intent:Conflict6:comment:1:B")});
  svc.put("/tasks/"+data.task.id+"/comments/"+data.comment.id,{body:JSON.stringify({comment:"conflict6_comment_1_B"}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.task.id+"/comments/"+data.comment.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:comment:1:B")});
});

bthread("conflict6:comment:2:A",function(){
  let pending={};
  pending["task"]=__c6Named("State:TaskReady:2");
  pending["comment"]=__c6Named("State:CommentReady:2");
  pending["updated"]=__c6Named("State:CommentUpdated:2");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:comment:2:A")});
  sync({request:Event("Intent:Conflict6:comment:2:A")});
  svc.put("/tasks/"+data.task.id+"/comments/"+data.comment.id,{body:JSON.stringify({comment:"conflict6_comment_2_A"}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.task.id+"/comments/"+data.comment.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:comment:2:A")});
});

bthread("conflict6:comment:2:B",function(){
  let pending={};
  pending["task"]=__c6Named("State:TaskReady:2");
  pending["comment"]=__c6Named("State:CommentReady:2");
  pending["updated"]=__c6Named("State:CommentUpdated:2");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:comment:2:B")});
  sync({request:Event("Intent:Conflict6:comment:2:B")});
  svc.put("/tasks/"+data.task.id+"/comments/"+data.comment.id,{body:JSON.stringify({comment:"conflict6_comment_2_B"}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.task.id+"/comments/"+data.comment.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:comment:2:B")});
});

bthread("conflict6:comment:3:A",function(){
  let pending={};
  pending["task"]=__c6Named("State:TaskReady:3");
  pending["comment"]=__c6Named("State:CommentReady:3");
  pending["updated"]=__c6Named("State:CommentUpdated:3");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:comment:3:A")});
  sync({request:Event("Intent:Conflict6:comment:3:A")});
  svc.put("/tasks/"+data.task.id+"/comments/"+data.comment.id,{body:JSON.stringify({comment:"conflict6_comment_3_A"}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.task.id+"/comments/"+data.comment.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:comment:3:A")});
});

bthread("conflict6:comment:3:B",function(){
  let pending={};
  pending["task"]=__c6Named("State:TaskReady:3");
  pending["comment"]=__c6Named("State:CommentReady:3");
  pending["updated"]=__c6Named("State:CommentUpdated:3");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Permit:Conflict6:comment:3:B")});
  sync({request:Event("Intent:Conflict6:comment:3:B")});
  svc.put("/tasks/"+data.task.id+"/comments/"+data.comment.id,{body:JSON.stringify({comment:"conflict6_comment_3_B"}),expectedResponseCodes:[200]});
  svc.get("/tasks/"+data.task.id+"/comments/"+data.comment.id,{expectedResponseCodes:[200]});
  sync({request:Event("ConflictClosed:comment:3:B")});
});

bthread("coordinator:conflict6-closed",function(){
  let pending={};
  pending["ConflictClosed:project:0:A"]=__c6Named("ConflictClosed:project:0:A");
  pending["ConflictClosed:project:0:B"]=__c6Named("ConflictClosed:project:0:B");
  pending["ConflictClosed:task:0:A"]=__c6Named("ConflictClosed:task:0:A");
  pending["ConflictClosed:task:0:B"]=__c6Named("ConflictClosed:task:0:B");
  pending["ConflictClosed:task:1:A"]=__c6Named("ConflictClosed:task:1:A");
  pending["ConflictClosed:task:1:B"]=__c6Named("ConflictClosed:task:1:B");
  pending["ConflictClosed:task:2:A"]=__c6Named("ConflictClosed:task:2:A");
  pending["ConflictClosed:task:2:B"]=__c6Named("ConflictClosed:task:2:B");
  pending["ConflictClosed:task:3:A"]=__c6Named("ConflictClosed:task:3:A");
  pending["ConflictClosed:task:3:B"]=__c6Named("ConflictClosed:task:3:B");
  pending["ConflictClosed:task:4:A"]=__c6Named("ConflictClosed:task:4:A");
  pending["ConflictClosed:task:4:B"]=__c6Named("ConflictClosed:task:4:B");
  pending["ConflictClosed:task:5:A"]=__c6Named("ConflictClosed:task:5:A");
  pending["ConflictClosed:task:5:B"]=__c6Named("ConflictClosed:task:5:B");
  pending["ConflictClosed:label:0:A"]=__c6Named("ConflictClosed:label:0:A");
  pending["ConflictClosed:label:0:B"]=__c6Named("ConflictClosed:label:0:B");
  pending["ConflictClosed:label:1:A"]=__c6Named("ConflictClosed:label:1:A");
  pending["ConflictClosed:label:1:B"]=__c6Named("ConflictClosed:label:1:B");
  pending["ConflictClosed:label:2:A"]=__c6Named("ConflictClosed:label:2:A");
  pending["ConflictClosed:label:2:B"]=__c6Named("ConflictClosed:label:2:B");
  pending["ConflictClosed:comment:0:A"]=__c6Named("ConflictClosed:comment:0:A");
  pending["ConflictClosed:comment:0:B"]=__c6Named("ConflictClosed:comment:0:B");
  pending["ConflictClosed:comment:1:A"]=__c6Named("ConflictClosed:comment:1:A");
  pending["ConflictClosed:comment:1:B"]=__c6Named("ConflictClosed:comment:1:B");
  pending["ConflictClosed:comment:2:A"]=__c6Named("ConflictClosed:comment:2:A");
  pending["ConflictClosed:comment:2:B"]=__c6Named("ConflictClosed:comment:2:B");
  pending["ConflictClosed:comment:3:A"]=__c6Named("ConflictClosed:comment:3:A");
  pending["ConflictClosed:comment:3:B"]=__c6Named("ConflictClosed:comment:3:B");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  sync({request:Event("Milestone:AllConflictVerifiersClosed")});
});
