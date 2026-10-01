//@provengo summon rest
// GENERATED INCREMENT 9 PROVENGO-DRIVEN CONCURRENCY SEARCH
var __i9Host=(typeof host!=="undefined")?host:"127.0.0.1";
var __i9Port=(typeof port!=="undefined")?port:3457;
var __i9AdapterPort=(typeof concurrencyPort!=="undefined")?concurrencyPort:3459;
var __i9Sut=new RESTSession("http://"+__i9Host+":"+__i9Port,"increment9-sut",{headers:{"Content-Type":"application/json"}});
var __i9Adapter=new RESTSession("http://127.0.0.1:"+__i9AdapterPort,"increment9-adapter",{headers:{"Content-Type":"application/json"}});
function __i9Named(n){return EventSet("increment9:"+n,function(e){return e.name===n;});}
function __i9Call(method,path,body,codes,epochId,operationId){
  let out={code:null,body:null};let headers={"Content-Type":"application/merge-patch+json"};
  if(epochId)headers["X-Provengo-Epoch-Id"]=epochId;if(operationId)headers["X-Provengo-Operation-Id"]=operationId;
  let options={headers:headers,expectedResponseCodes:codes,callback:function(r){out.code=r.code;try{out.body=JSON.parse(r.body);}catch(e){out.body=r.body;}}};
  if(body!==null&&typeof body!=="undefined")options.body=JSON.stringify(body);
  if(method==="GET")__i9Sut.get(path,options);else if(method==="POST")__i9Sut.post(path,options);else if(method==="PATCH")__i9Sut.patch(path,options);else if(method==="DELETE")__i9Sut.delete(path,options);else throw "unsupported method";
  return out;
}
function __i9CreateTask(projectId,title){return __i9Call("POST","/projects/"+projectId+"/tasks",{title:title,description:"increment9_baseline_description",priority:1},[201],null,null).body;}
function __i9Sequential(epochId,taskId,ops){for(let i=0;i<ops.length;i++){let o=ops[i];__i9Call(o.method,"/tasks/"+taskId,o.body,o.method==="DELETE"?[204]:[200],epochId,epochId+"-op-"+i);}return __i9Call("GET","/tasks/"+taskId,null,[200,404],epochId,epochId+"-observe");}
function __i9Concurrent(epochId,scenario,ops){let out=null;__i9Adapter.post("/epochs",{body:JSON.stringify({epoch_id:epochId,scenario:scenario,operations:ops}),expectedResponseCodes:[200],callback:function(r){try{out=JSON.parse(r.body);}catch(e){out={error:String(e)};}}});return out;}

bthread("increment9:setup",function(){
  let project=__i9Call("POST","/projects",{title:"increment9_concurrency_campaign"},[201],null,null).body;
  sync({request:Event("Increment9:ProjectReady",{id:project.id})});
  sync({waitFor:__i9Named("Increment9:AllScenariosClosed")});
  __i9Call("DELETE","/projects/"+project.id,null,[204],null,null);
});

bthread("increment9:scheduler",function(){
  let ready={};
  ready["Increment9:ScenarioReady:0"]=__i9Named("Increment9:ScenarioReady:0");
  ready["Increment9:ScenarioReady:1"]=__i9Named("Increment9:ScenarioReady:1");
  ready["Increment9:ScenarioReady:2"]=__i9Named("Increment9:ScenarioReady:2");
  ready["Increment9:ScenarioReady:3"]=__i9Named("Increment9:ScenarioReady:3");
  ready["Increment9:ScenarioReady:4"]=__i9Named("Increment9:ScenarioReady:4");
  ready["Increment9:ScenarioReady:5"]=__i9Named("Increment9:ScenarioReady:5");
  while(Object.keys(ready).length){let e=sync({waitFor:Object.values(ready)});delete ready[e.name];}
  let permits={};
  permits["Increment9:Permit:0"]=Event("Increment9:Permit:0");
  permits["Increment9:Permit:1"]=Event("Increment9:Permit:1");
  permits["Increment9:Permit:2"]=Event("Increment9:Permit:2");
  permits["Increment9:Permit:3"]=Event("Increment9:Permit:3");
  permits["Increment9:Permit:4"]=Event("Increment9:Permit:4");
  permits["Increment9:Permit:5"]=Event("Increment9:Permit:5");
  while(Object.keys(permits).length){let e=sync({request:Object.values(permits)});delete permits[e.name];}
});

bthread("increment9:scenario:0:disjoint-title-description",function(){
  let project=sync({waitFor:__i9Named("Increment9:ProjectReady")}).data;
  let control=__i9CreateTask(project.id,"increment9_control_0");
  let candidate=__i9CreateTask(project.id,"increment9_candidate_0");
  sync({request:Event("Increment9:ScenarioReady:0",{scenario:"disjoint-title-description",control_task_id:control.id,candidate_task_id:candidate.id})});
  sync({waitFor:__i9Named("Increment9:Permit:0")});
  let controlOps=[];
  controlOps.push({method:"PATCH",body:{"title":"increment9_title_a"}});
  controlOps.push({method:"PATCH",body:{"description":"increment9_description_a"}});
  let controlObservation=__i9Sequential("increment9-control-0",control.id,controlOps);
  sync({request:Event("Increment9:SequentialControlComplete",{scenario:"disjoint-title-description",epoch_id:"increment9-control-0",task_id:control.id,status:controlObservation.code})});
  let concurrentOps=[];
  concurrentOps.push({operation_id:"increment9-epoch-0-op-0",method:"PATCH",path:"/tasks/"+candidate.id,body:{"title":"increment9_title_a"},delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});
  concurrentOps.push({operation_id:"increment9-epoch-0-op-1",method:"PATCH",path:"/tasks/"+candidate.id,body:{"description":"increment9_description_a"},delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});
  sync({request:Event("Increment9:EpochDeclared",{scenario:"disjoint-title-description",epoch_id:"increment9-epoch-0",task_id:candidate.id,width:concurrentOps.length})});
  let result=__i9Concurrent("increment9-epoch-0","disjoint-title-description",concurrentOps);
  sync({request:Event("Increment9:EpochJoined",{scenario:"disjoint-title-description",epoch_id:"increment9-epoch-0",result:result})});
  let observation=__i9Call("GET","/tasks/"+candidate.id,null,[200,404],"increment9-epoch-0","increment9-epoch-0-observe");
  sync({request:Event("Increment9:ScenarioClosed",{scenario:"disjoint-title-description",epoch_id:"increment9-epoch-0",task_id:candidate.id,status:observation.code})});
  if(controlObservation.code!==404)__i9Call("DELETE","/tasks/"+control.id,null,[204,404],null,null);
  if(observation.code!==404)__i9Call("DELETE","/tasks/"+candidate.id,null,[204,404],null,null);
});

bthread("increment9:scenario:1:disjoint-title-priority-staggered",function(){
  let project=sync({waitFor:__i9Named("Increment9:ProjectReady")}).data;
  let control=__i9CreateTask(project.id,"increment9_control_1");
  let candidate=__i9CreateTask(project.id,"increment9_candidate_1");
  sync({request:Event("Increment9:ScenarioReady:1",{scenario:"disjoint-title-priority-staggered",control_task_id:control.id,candidate_task_id:candidate.id})});
  sync({waitFor:__i9Named("Increment9:Permit:1")});
  let controlOps=[];
  controlOps.push({method:"PATCH",body:{"title":"increment9_title_b"}});
  controlOps.push({method:"PATCH",body:{"priority":3}});
  let controlObservation=__i9Sequential("increment9-control-1",control.id,controlOps);
  sync({request:Event("Increment9:SequentialControlComplete",{scenario:"disjoint-title-priority-staggered",epoch_id:"increment9-control-1",task_id:control.id,status:controlObservation.code})});
  let concurrentOps=[];
  concurrentOps.push({operation_id:"increment9-epoch-1-op-0",method:"PATCH",path:"/tasks/"+candidate.id,body:{"title":"increment9_title_b"},delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});
  concurrentOps.push({operation_id:"increment9-epoch-1-op-1",method:"PATCH",path:"/tasks/"+candidate.id,body:{"priority":3},delay_ms:5,headers:{"Content-Type":"application/merge-patch+json"}});
  sync({request:Event("Increment9:EpochDeclared",{scenario:"disjoint-title-priority-staggered",epoch_id:"increment9-epoch-1",task_id:candidate.id,width:concurrentOps.length})});
  let result=__i9Concurrent("increment9-epoch-1","disjoint-title-priority-staggered",concurrentOps);
  sync({request:Event("Increment9:EpochJoined",{scenario:"disjoint-title-priority-staggered",epoch_id:"increment9-epoch-1",result:result})});
  let observation=__i9Call("GET","/tasks/"+candidate.id,null,[200,404],"increment9-epoch-1","increment9-epoch-1-observe");
  sync({request:Event("Increment9:ScenarioClosed",{scenario:"disjoint-title-priority-staggered",epoch_id:"increment9-epoch-1",task_id:candidate.id,status:observation.code})});
  if(controlObservation.code!==404)__i9Call("DELETE","/tasks/"+control.id,null,[204,404],null,null);
  if(observation.code!==404)__i9Call("DELETE","/tasks/"+candidate.id,null,[204,404],null,null);
});

bthread("increment9:scenario:2:same-field-title",function(){
  let project=sync({waitFor:__i9Named("Increment9:ProjectReady")}).data;
  let control=__i9CreateTask(project.id,"increment9_control_2");
  let candidate=__i9CreateTask(project.id,"increment9_candidate_2");
  sync({request:Event("Increment9:ScenarioReady:2",{scenario:"same-field-title",control_task_id:control.id,candidate_task_id:candidate.id})});
  sync({waitFor:__i9Named("Increment9:Permit:2")});
  let controlOps=[];
  controlOps.push({method:"PATCH",body:{"title":"increment9_title_first"}});
  controlOps.push({method:"PATCH",body:{"title":"increment9_title_second"}});
  let controlObservation=__i9Sequential("increment9-control-2",control.id,controlOps);
  sync({request:Event("Increment9:SequentialControlComplete",{scenario:"same-field-title",epoch_id:"increment9-control-2",task_id:control.id,status:controlObservation.code})});
  let concurrentOps=[];
  concurrentOps.push({operation_id:"increment9-epoch-2-op-0",method:"PATCH",path:"/tasks/"+candidate.id,body:{"title":"increment9_title_first"},delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});
  concurrentOps.push({operation_id:"increment9-epoch-2-op-1",method:"PATCH",path:"/tasks/"+candidate.id,body:{"title":"increment9_title_second"},delay_ms:5,headers:{"Content-Type":"application/merge-patch+json"}});
  sync({request:Event("Increment9:EpochDeclared",{scenario:"same-field-title",epoch_id:"increment9-epoch-2",task_id:candidate.id,width:concurrentOps.length})});
  let result=__i9Concurrent("increment9-epoch-2","same-field-title",concurrentOps);
  sync({request:Event("Increment9:EpochJoined",{scenario:"same-field-title",epoch_id:"increment9-epoch-2",result:result})});
  let observation=__i9Call("GET","/tasks/"+candidate.id,null,[200,404],"increment9-epoch-2","increment9-epoch-2-observe");
  sync({request:Event("Increment9:ScenarioClosed",{scenario:"same-field-title",epoch_id:"increment9-epoch-2",task_id:candidate.id,status:observation.code})});
  if(controlObservation.code!==404)__i9Call("DELETE","/tasks/"+control.id,null,[204,404],null,null);
  if(observation.code!==404)__i9Call("DELETE","/tasks/"+candidate.id,null,[204,404],null,null);
});

bthread("increment9:scenario:3:three-way-disjoint",function(){
  let project=sync({waitFor:__i9Named("Increment9:ProjectReady")}).data;
  let control=__i9CreateTask(project.id,"increment9_control_3");
  let candidate=__i9CreateTask(project.id,"increment9_candidate_3");
  sync({request:Event("Increment9:ScenarioReady:3",{scenario:"three-way-disjoint",control_task_id:control.id,candidate_task_id:candidate.id})});
  sync({waitFor:__i9Named("Increment9:Permit:3")});
  let controlOps=[];
  controlOps.push({method:"PATCH",body:{"title":"increment9_title_c"}});
  controlOps.push({method:"PATCH",body:{"description":"increment9_description_c"}});
  controlOps.push({method:"PATCH",body:{"priority":4}});
  let controlObservation=__i9Sequential("increment9-control-3",control.id,controlOps);
  sync({request:Event("Increment9:SequentialControlComplete",{scenario:"three-way-disjoint",epoch_id:"increment9-control-3",task_id:control.id,status:controlObservation.code})});
  let concurrentOps=[];
  concurrentOps.push({operation_id:"increment9-epoch-3-op-0",method:"PATCH",path:"/tasks/"+candidate.id,body:{"title":"increment9_title_c"},delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});
  concurrentOps.push({operation_id:"increment9-epoch-3-op-1",method:"PATCH",path:"/tasks/"+candidate.id,body:{"description":"increment9_description_c"},delay_ms:3,headers:{"Content-Type":"application/merge-patch+json"}});
  concurrentOps.push({operation_id:"increment9-epoch-3-op-2",method:"PATCH",path:"/tasks/"+candidate.id,body:{"priority":4},delay_ms:6,headers:{"Content-Type":"application/merge-patch+json"}});
  sync({request:Event("Increment9:EpochDeclared",{scenario:"three-way-disjoint",epoch_id:"increment9-epoch-3",task_id:candidate.id,width:concurrentOps.length})});
  let result=__i9Concurrent("increment9-epoch-3","three-way-disjoint",concurrentOps);
  sync({request:Event("Increment9:EpochJoined",{scenario:"three-way-disjoint",epoch_id:"increment9-epoch-3",result:result})});
  let observation=__i9Call("GET","/tasks/"+candidate.id,null,[200,404],"increment9-epoch-3","increment9-epoch-3-observe");
  sync({request:Event("Increment9:ScenarioClosed",{scenario:"three-way-disjoint",epoch_id:"increment9-epoch-3",task_id:candidate.id,status:observation.code})});
  if(controlObservation.code!==404)__i9Call("DELETE","/tasks/"+control.id,null,[204,404],null,null);
  if(observation.code!==404)__i9Call("DELETE","/tasks/"+candidate.id,null,[204,404],null,null);
});

bthread("increment9:scenario:4:update-delete",function(){
  let project=sync({waitFor:__i9Named("Increment9:ProjectReady")}).data;
  let control=__i9CreateTask(project.id,"increment9_control_4");
  let candidate=__i9CreateTask(project.id,"increment9_candidate_4");
  sync({request:Event("Increment9:ScenarioReady:4",{scenario:"update-delete",control_task_id:control.id,candidate_task_id:candidate.id})});
  sync({waitFor:__i9Named("Increment9:Permit:4")});
  let controlOps=[];
  controlOps.push({method:"PATCH",body:{"title":"increment9_title_before_delete"}});
  controlOps.push({method:"DELETE",body:null});
  let controlObservation=__i9Sequential("increment9-control-4",control.id,controlOps);
  sync({request:Event("Increment9:SequentialControlComplete",{scenario:"update-delete",epoch_id:"increment9-control-4",task_id:control.id,status:controlObservation.code})});
  let concurrentOps=[];
  concurrentOps.push({operation_id:"increment9-epoch-4-op-0",method:"PATCH",path:"/tasks/"+candidate.id,body:{"title":"increment9_title_before_delete"},delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});
  concurrentOps.push({operation_id:"increment9-epoch-4-op-1",method:"DELETE",path:"/tasks/"+candidate.id,body:null,delay_ms:5,headers:{"Content-Type":"application/merge-patch+json"}});
  sync({request:Event("Increment9:EpochDeclared",{scenario:"update-delete",epoch_id:"increment9-epoch-4",task_id:candidate.id,width:concurrentOps.length})});
  let result=__i9Concurrent("increment9-epoch-4","update-delete",concurrentOps);
  sync({request:Event("Increment9:EpochJoined",{scenario:"update-delete",epoch_id:"increment9-epoch-4",result:result})});
  let observation=__i9Call("GET","/tasks/"+candidate.id,null,[200,404],"increment9-epoch-4","increment9-epoch-4-observe");
  sync({request:Event("Increment9:ScenarioClosed",{scenario:"update-delete",epoch_id:"increment9-epoch-4",task_id:candidate.id,status:observation.code})});
  if(controlObservation.code!==404)__i9Call("DELETE","/tasks/"+control.id,null,[204,404],null,null);
  if(observation.code!==404)__i9Call("DELETE","/tasks/"+candidate.id,null,[204,404],null,null);
});

bthread("increment9:scenario:5:disjoint-description-priority-reversed",function(){
  let project=sync({waitFor:__i9Named("Increment9:ProjectReady")}).data;
  let control=__i9CreateTask(project.id,"increment9_control_5");
  let candidate=__i9CreateTask(project.id,"increment9_candidate_5");
  sync({request:Event("Increment9:ScenarioReady:5",{scenario:"disjoint-description-priority-reversed",control_task_id:control.id,candidate_task_id:candidate.id})});
  sync({waitFor:__i9Named("Increment9:Permit:5")});
  let controlOps=[];
  controlOps.push({method:"PATCH",body:{"description":"increment9_description_d"}});
  controlOps.push({method:"PATCH",body:{"priority":2}});
  let controlObservation=__i9Sequential("increment9-control-5",control.id,controlOps);
  sync({request:Event("Increment9:SequentialControlComplete",{scenario:"disjoint-description-priority-reversed",epoch_id:"increment9-control-5",task_id:control.id,status:controlObservation.code})});
  let concurrentOps=[];
  concurrentOps.push({operation_id:"increment9-epoch-5-op-0",method:"PATCH",path:"/tasks/"+candidate.id,body:{"description":"increment9_description_d"},delay_ms:5,headers:{"Content-Type":"application/merge-patch+json"}});
  concurrentOps.push({operation_id:"increment9-epoch-5-op-1",method:"PATCH",path:"/tasks/"+candidate.id,body:{"priority":2},delay_ms:0,headers:{"Content-Type":"application/merge-patch+json"}});
  sync({request:Event("Increment9:EpochDeclared",{scenario:"disjoint-description-priority-reversed",epoch_id:"increment9-epoch-5",task_id:candidate.id,width:concurrentOps.length})});
  let result=__i9Concurrent("increment9-epoch-5","disjoint-description-priority-reversed",concurrentOps);
  sync({request:Event("Increment9:EpochJoined",{scenario:"disjoint-description-priority-reversed",epoch_id:"increment9-epoch-5",result:result})});
  let observation=__i9Call("GET","/tasks/"+candidate.id,null,[200,404],"increment9-epoch-5","increment9-epoch-5-observe");
  sync({request:Event("Increment9:ScenarioClosed",{scenario:"disjoint-description-priority-reversed",epoch_id:"increment9-epoch-5",task_id:candidate.id,status:observation.code})});
  if(controlObservation.code!==404)__i9Call("DELETE","/tasks/"+control.id,null,[204,404],null,null);
  if(observation.code!==404)__i9Call("DELETE","/tasks/"+candidate.id,null,[204,404],null,null);
});

bthread("increment9:completion",function(){
  let pending={};
  pending["disjoint-title-description"]=EventSet("increment9:closed:0",function(e){return e.name==="Increment9:ScenarioClosed"&&e.data&&e.data.scenario==="disjoint-title-description";});
  pending["disjoint-title-priority-staggered"]=EventSet("increment9:closed:1",function(e){return e.name==="Increment9:ScenarioClosed"&&e.data&&e.data.scenario==="disjoint-title-priority-staggered";});
  pending["same-field-title"]=EventSet("increment9:closed:2",function(e){return e.name==="Increment9:ScenarioClosed"&&e.data&&e.data.scenario==="same-field-title";});
  pending["three-way-disjoint"]=EventSet("increment9:closed:3",function(e){return e.name==="Increment9:ScenarioClosed"&&e.data&&e.data.scenario==="three-way-disjoint";});
  pending["update-delete"]=EventSet("increment9:closed:4",function(e){return e.name==="Increment9:ScenarioClosed"&&e.data&&e.data.scenario==="update-delete";});
  pending["disjoint-description-priority-reversed"]=EventSet("increment9:closed:5",function(e){return e.name==="Increment9:ScenarioClosed"&&e.data&&e.data.scenario==="disjoint-description-priority-reversed";});
  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(e.data&&pending[e.data.scenario])delete pending[e.data.scenario];}
  sync({request:Event("Increment9:AllScenariosClosed")});
});
