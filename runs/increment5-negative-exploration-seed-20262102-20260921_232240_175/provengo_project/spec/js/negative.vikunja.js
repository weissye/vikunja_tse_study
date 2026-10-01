// GENERATED NEGATIVE EXPLORATION STORIES -- OpenAPI grounded
function __negNamed(n){return EventSet("negative:"+n,function(e){return e.name===n;});}
function __negDone(n,d){sync({request:Event("NegativeClosed:"+n,d||{})});}
bthread("constraint:negative-completion",function(){sync({waitFor:__negNamed("Milestone:AllNegativeVerifiersClosed"),block:__negNamed("MultiResourceVerifiedActionsComplete")});});

bthread("negative:unknown:UnknownProject",function(){
  let pending={};
  pending["ready"]=__negNamed("State:ProjectReady");
  pending["permit"]=__negNamed("Permit:Negative:UnknownProject");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Intent:NegativeUnknownProject")});
  svc.get("/projects/2147483001",{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("UnknownProject");
});

bthread("negative:unknown:UnknownTask",function(){
  let pending={};
  pending["ready"]=__negNamed("State:ProjectReady");
  pending["permit"]=__negNamed("Permit:Negative:UnknownTask");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Intent:NegativeUnknownTask")});
  svc.get("/tasks/2147483002",{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("UnknownTask");
});

bthread("negative:unknown:UnknownLabel",function(){
  let pending={};
  pending["ready"]=__negNamed("State:ProjectReady");
  pending["permit"]=__negNamed("Permit:Negative:UnknownLabel");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Intent:NegativeUnknownLabel")});
  svc.get("/labels/2147483003",{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("UnknownLabel");
});

bthread("negative:unknown:UnknownComment",function(){
  let pending={};
  pending["ready"]=__negNamed("State:ProjectReady");
  pending["permit"]=__negNamed("Permit:Negative:UnknownComment");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  sync({request:Event("Intent:NegativeUnknownComment")});
  svc.get("/tasks/2147483002/comments/2147483004",{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("UnknownComment");
});

bthread("scheduler:negative-unknown",function(){
  sync({waitFor:__negNamed("State:ProjectReady")});
  let remaining={};
  remaining["Permit:Negative:UnknownProject"]=Event("Permit:Negative:UnknownProject");
  remaining["Permit:Negative:UnknownTask"]=Event("Permit:Negative:UnknownTask");
  remaining["Permit:Negative:UnknownLabel"]=Event("Permit:Negative:UnknownLabel");
  remaining["Permit:Negative:UnknownComment"]=Event("Permit:Negative:UnknownComment");
  while(Object.keys(remaining).length){let e=sync({request:Object.values(remaining)});delete remaining[e.name];}
});

bthread("negative:deleted-project",function(){
  let pending={};
  pending["project"]=__negNamed("State:ProjectReady");
  pending["deleted"]=__negNamed("State:ProjectDeleted");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let id=data.project.id; sync({request:Event("Intent:NegativeDeletedProject")});
  svc.get("/projects/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/projects/"+id,{body:JSON.stringify({title:"negative-project"}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/projects/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedProject",{id:id});
});

bthread("negative:deleted-task:0",function(){
  let pending={};
  pending["task"]=__negNamed("State:TaskDeleted:0");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let id=data.task.id; sync({request:Event("Intent:NegativeDeletedTask:0")});
  svc.get("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/tasks/"+id,{body:JSON.stringify({title:"negative-task-0",done:false}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedTask:0",{id:id});
});

bthread("negative:deleted-task:1",function(){
  let pending={};
  pending["task"]=__negNamed("State:TaskDeleted:1");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let id=data.task.id; sync({request:Event("Intent:NegativeDeletedTask:1")});
  svc.get("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/tasks/"+id,{body:JSON.stringify({title:"negative-task-1",done:false}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedTask:1",{id:id});
});

bthread("negative:deleted-task:2",function(){
  let pending={};
  pending["task"]=__negNamed("State:TaskDeleted:2");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let id=data.task.id; sync({request:Event("Intent:NegativeDeletedTask:2")});
  svc.get("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/tasks/"+id,{body:JSON.stringify({title:"negative-task-2",done:false}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedTask:2",{id:id});
});

bthread("negative:deleted-task:3",function(){
  let pending={};
  pending["task"]=__negNamed("State:TaskDeleted:3");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let id=data.task.id; sync({request:Event("Intent:NegativeDeletedTask:3")});
  svc.get("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/tasks/"+id,{body:JSON.stringify({title:"negative-task-3",done:false}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedTask:3",{id:id});
});

bthread("negative:deleted-task:4",function(){
  let pending={};
  pending["task"]=__negNamed("State:TaskDeleted:4");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let id=data.task.id; sync({request:Event("Intent:NegativeDeletedTask:4")});
  svc.get("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/tasks/"+id,{body:JSON.stringify({title:"negative-task-4",done:false}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedTask:4",{id:id});
});

bthread("negative:deleted-task:5",function(){
  let pending={};
  pending["task"]=__negNamed("State:TaskDeleted:5");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let id=data.task.id; sync({request:Event("Intent:NegativeDeletedTask:5")});
  svc.get("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/tasks/"+id,{body:JSON.stringify({title:"negative-task-5",done:false}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/tasks/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedTask:5",{id:id});
});

bthread("negative:deleted-label:0",function(){
  let pending={};
  pending["label"]=__negNamed("State:LabelDeleted:0");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let id=data.label.id; sync({request:Event("Intent:NegativeDeletedLabel:0")});
  svc.get("/labels/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/labels/"+id,{body:JSON.stringify({title:"negative-label-0"}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/labels/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedLabel:0",{id:id});
});

bthread("negative:deleted-label:1",function(){
  let pending={};
  pending["label"]=__negNamed("State:LabelDeleted:1");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let id=data.label.id; sync({request:Event("Intent:NegativeDeletedLabel:1")});
  svc.get("/labels/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/labels/"+id,{body:JSON.stringify({title:"negative-label-1"}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/labels/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedLabel:1",{id:id});
});

bthread("negative:deleted-label:2",function(){
  let pending={};
  pending["label"]=__negNamed("State:LabelDeleted:2");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let id=data.label.id; sync({request:Event("Intent:NegativeDeletedLabel:2")});
  svc.get("/labels/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/labels/"+id,{body:JSON.stringify({title:"negative-label-2"}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/labels/"+id,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedLabel:2",{id:id});
});

bthread("negative:deleted-comment:0",function(){
  let pending={};
  pending["task"]=__negNamed("State:TaskReady:0");
  pending["comment"]=__negNamed("State:CommentReady:0");
  pending["deleted"]=__negNamed("State:CommentDeleted:0");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let taskId=data.task.id,commentId=data.comment.id;
  sync({request:Event("Intent:NegativeDeletedComment:0")});
  svc.get("/tasks/"+taskId+"/comments/"+commentId,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/tasks/"+taskId+"/comments/"+commentId,{body:JSON.stringify({comment:"negative-comment-0"}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/tasks/"+taskId+"/comments/"+commentId,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedComment:0",{taskId:taskId,commentId:commentId});
});

bthread("negative:deleted-comment:1",function(){
  let pending={};
  pending["task"]=__negNamed("State:TaskReady:1");
  pending["comment"]=__negNamed("State:CommentReady:1");
  pending["deleted"]=__negNamed("State:CommentDeleted:1");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let taskId=data.task.id,commentId=data.comment.id;
  sync({request:Event("Intent:NegativeDeletedComment:1")});
  svc.get("/tasks/"+taskId+"/comments/"+commentId,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/tasks/"+taskId+"/comments/"+commentId,{body:JSON.stringify({comment:"negative-comment-1"}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/tasks/"+taskId+"/comments/"+commentId,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedComment:1",{taskId:taskId,commentId:commentId});
});

bthread("negative:deleted-comment:2",function(){
  let pending={};
  pending["task"]=__negNamed("State:TaskReady:2");
  pending["comment"]=__negNamed("State:CommentReady:2");
  pending["deleted"]=__negNamed("State:CommentDeleted:2");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let taskId=data.task.id,commentId=data.comment.id;
  sync({request:Event("Intent:NegativeDeletedComment:2")});
  svc.get("/tasks/"+taskId+"/comments/"+commentId,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/tasks/"+taskId+"/comments/"+commentId,{body:JSON.stringify({comment:"negative-comment-2"}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/tasks/"+taskId+"/comments/"+commentId,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedComment:2",{taskId:taskId,commentId:commentId});
});

bthread("negative:deleted-comment:3",function(){
  let pending={};
  pending["task"]=__negNamed("State:TaskReady:3");
  pending["comment"]=__negNamed("State:CommentReady:3");
  pending["deleted"]=__negNamed("State:CommentDeleted:3");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let taskId=data.task.id,commentId=data.comment.id;
  sync({request:Event("Intent:NegativeDeletedComment:3")});
  svc.get("/tasks/"+taskId+"/comments/"+commentId,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.put("/tasks/"+taskId+"/comments/"+commentId,{body:JSON.stringify({comment:"negative-comment-3"}),expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.delete("/tasks/"+taskId+"/comments/"+commentId,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  __negDone("DeletedComment:3",{taskId:taskId,commentId:commentId});
});

bthread("negative:deleted-relation:0",function(){
  let pending={};
  pending["a"]=__negNamed("State:TaskReady:0");
  pending["b"]=__negNamed("State:TaskReady:1");
  pending["deleted"]=__negNamed("State:RelationDeleted:0");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let a=data.a.id,b=data.b.id;
  sync({request:Event("Intent:NegativeDeletedRelation:0")});
  svc.delete("/tasks/"+a+"/relations/subtask/"+b,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.get("/tasks/"+a,{expectedResponseCodes:[200]});
  __negDone("DeletedRelation:0",{taskId:a,otherTaskId:b,relationKind:"subtask"});
});

bthread("negative:deleted-relation:1",function(){
  let pending={};
  pending["a"]=__negNamed("State:TaskReady:1");
  pending["b"]=__negNamed("State:TaskReady:2");
  pending["deleted"]=__negNamed("State:RelationDeleted:1");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let a=data.a.id,b=data.b.id;
  sync({request:Event("Intent:NegativeDeletedRelation:1")});
  svc.delete("/tasks/"+a+"/relations/parenttask/"+b,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.get("/tasks/"+a,{expectedResponseCodes:[200]});
  __negDone("DeletedRelation:1",{taskId:a,otherTaskId:b,relationKind:"parenttask"});
});

bthread("negative:deleted-relation:2",function(){
  let pending={};
  pending["a"]=__negNamed("State:TaskReady:2");
  pending["b"]=__negNamed("State:TaskReady:3");
  pending["deleted"]=__negNamed("State:RelationDeleted:2");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let a=data.a.id,b=data.b.id;
  sync({request:Event("Intent:NegativeDeletedRelation:2")});
  svc.delete("/tasks/"+a+"/relations/related/"+b,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.get("/tasks/"+a,{expectedResponseCodes:[200]});
  __negDone("DeletedRelation:2",{taskId:a,otherTaskId:b,relationKind:"related"});
});

bthread("negative:deleted-relation:3",function(){
  let pending={};
  pending["a"]=__negNamed("State:TaskReady:3");
  pending["b"]=__negNamed("State:TaskReady:4");
  pending["deleted"]=__negNamed("State:RelationDeleted:3");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let a=data.a.id,b=data.b.id;
  sync({request:Event("Intent:NegativeDeletedRelation:3")});
  svc.delete("/tasks/"+a+"/relations/duplicateof/"+b,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.get("/tasks/"+a,{expectedResponseCodes:[200]});
  __negDone("DeletedRelation:3",{taskId:a,otherTaskId:b,relationKind:"duplicateof"});
});

bthread("negative:deleted-relation:4",function(){
  let pending={};
  pending["a"]=__negNamed("State:TaskReady:4");
  pending["b"]=__negNamed("State:TaskReady:5");
  pending["deleted"]=__negNamed("State:RelationDeleted:4");
  let data={};
  while(Object.keys(pending).length){
    let e=sync({waitFor:Object.values(pending)});
    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}
  }
  let a=data.a.id,b=data.b.id;
  sync({request:Event("Intent:NegativeDeletedRelation:4")});
  svc.delete("/tasks/"+a+"/relations/duplicates/"+b,{expectedResponseCodes:[400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]});
  svc.get("/tasks/"+a,{expectedResponseCodes:[200]});
  __negDone("DeletedRelation:4",{taskId:a,otherTaskId:b,relationKind:"duplicates"});
});

bthread("coordinator:negative-closed",function(){
  let pending={};
  pending["NegativeClosed:UnknownProject"]=__negNamed("NegativeClosed:UnknownProject");
  pending["NegativeClosed:UnknownTask"]=__negNamed("NegativeClosed:UnknownTask");
  pending["NegativeClosed:UnknownLabel"]=__negNamed("NegativeClosed:UnknownLabel");
  pending["NegativeClosed:UnknownComment"]=__negNamed("NegativeClosed:UnknownComment");
  pending["NegativeClosed:DeletedProject"]=__negNamed("NegativeClosed:DeletedProject");
  pending["NegativeClosed:DeletedTask:0"]=__negNamed("NegativeClosed:DeletedTask:0");
  pending["NegativeClosed:DeletedTask:1"]=__negNamed("NegativeClosed:DeletedTask:1");
  pending["NegativeClosed:DeletedTask:2"]=__negNamed("NegativeClosed:DeletedTask:2");
  pending["NegativeClosed:DeletedTask:3"]=__negNamed("NegativeClosed:DeletedTask:3");
  pending["NegativeClosed:DeletedTask:4"]=__negNamed("NegativeClosed:DeletedTask:4");
  pending["NegativeClosed:DeletedTask:5"]=__negNamed("NegativeClosed:DeletedTask:5");
  pending["NegativeClosed:DeletedLabel:0"]=__negNamed("NegativeClosed:DeletedLabel:0");
  pending["NegativeClosed:DeletedLabel:1"]=__negNamed("NegativeClosed:DeletedLabel:1");
  pending["NegativeClosed:DeletedLabel:2"]=__negNamed("NegativeClosed:DeletedLabel:2");
  pending["NegativeClosed:DeletedComment:0"]=__negNamed("NegativeClosed:DeletedComment:0");
  pending["NegativeClosed:DeletedComment:1"]=__negNamed("NegativeClosed:DeletedComment:1");
  pending["NegativeClosed:DeletedComment:2"]=__negNamed("NegativeClosed:DeletedComment:2");
  pending["NegativeClosed:DeletedComment:3"]=__negNamed("NegativeClosed:DeletedComment:3");
  pending["NegativeClosed:DeletedRelation:0"]=__negNamed("NegativeClosed:DeletedRelation:0");
  pending["NegativeClosed:DeletedRelation:1"]=__negNamed("NegativeClosed:DeletedRelation:1");
  pending["NegativeClosed:DeletedRelation:2"]=__negNamed("NegativeClosed:DeletedRelation:2");
  pending["NegativeClosed:DeletedRelation:3"]=__negNamed("NegativeClosed:DeletedRelation:3");
  pending["NegativeClosed:DeletedRelation:4"]=__negNamed("NegativeClosed:DeletedRelation:4");
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}
  sync({request:Event("Milestone:AllNegativeVerifiersClosed")});
});
