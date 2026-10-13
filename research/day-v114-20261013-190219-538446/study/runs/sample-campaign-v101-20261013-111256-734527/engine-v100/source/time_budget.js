// Runtime admission control. Provengo still selects all event interleavings.
bthread("research time budget and stable boundary",function(){
 var started=java.lang.System.nanoTime(),active={},creates={};
 function expired(){return (java.lang.System.nanoTime()-started)/1000000000>=SOFT_SECONDS;}
 while(true){
  var event=sync({waitFor:bp.all,block:bp.EventSet("budget closes new operations",function(e){
   var d=e.data||{},m=d.model;
   return expired()&&(e.name==="OperationAcquire"||e.name==="NegativeAcquire"||(m&&m.action==="create"));
  })});
  var d=event.data||{},m=d.model;
  if(event.name==="OperationAcquire")active["work/"+d.logicalId]=true;
  if(event.name==="OperationRelease")delete active["work/"+d.logicalId];
  if(event.name==="NegativeAcquire")active["negative/"+d.caseId]=true;
  if(event.name==="NegativeRelease")delete active["negative/"+d.caseId];
  if(m&&m.action==="create")creates[m.logicalId]=true;
  if(event.name==="ModelVerified")delete creates[d.logicalId];
  bp.log.info("SHORT_RUN_BOUNDARY "+JSON.stringify({expired:expired(),active_operations:Object.keys(active).length,pending_creations:Object.keys(creates).length,pending_verifications:ctx.runQuery("Verification.Pending").length,write_locks:ctx.runQuery("WriteLock.All").length}));
 }
});
