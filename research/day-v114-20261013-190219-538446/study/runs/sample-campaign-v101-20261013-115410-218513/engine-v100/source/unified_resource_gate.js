// Protect negative baselines over potential effects; Provengo chooses order.
bthread("resource-local negative observation isolation",function(){
 var operations={},writes={},creations={},negatives={};
 function footprint(id,extra){
  var ids=(RESOURCE_EFFECT_FOOTPRINTS[id]||[id]).slice();
  (extra||[]).forEach(function(item){if(ids.indexOf(item)<0)ids.push(item);});
  return ids;
 }
 function intersects(a,b){return a.some(function(id){return b.indexOf(id)>=0;});}
 function overlaps(map,ids){return Object.keys(map).some(function(k){return intersects(map[k].ids,ids);});}
 function conflicts(ids,caseId){return Object.keys(negatives).some(function(k){return k!==caseId&&intersects(negatives[k].ids,ids);});}
 function operationKey(d){return (d.session||"A")+"/"+d.logicalId;}
 while(true){
  var event=sync({waitFor:bp.all,block:bp.EventSet("resource-local observation conflicts",function(e){
   var d=e.data||{},m=d.model;
   if(e.name==="NegativeAcquire"){
    var ids=footprint(d.logicalId);
    return overlaps(operations,ids)||overlaps(writes,ids)||overlaps(creations,ids)||conflicts(ids,d.caseId);
   }
   if(e.name==="OperationAcquire"||e.name==="ModelWriteBegin")return conflicts(footprint(d.logicalId),null);
   if(!m||["create","update","delete","negative_attempt"].indexOf(m.action)<0)return false;
   return conflicts(footprint(m.logicalId,m.affected),m.action==="negative_attempt"?m.caseId:null);
  })});
  var d=event.data||{},m=d.model;
  if(event.name==="OperationAcquire")operations[operationKey(d)]={ids:footprint(d.logicalId)};
  if(event.name==="OperationRelease")delete operations[operationKey(d)];
  if(event.name==="ModelWriteBegin")writes[d.logicalId]={ids:footprint(d.logicalId),revision:d.revision};
  if(m&&m.action==="create")creations[m.logicalId]={ids:footprint(m.logicalId,m.affected)};
  if(event.name==="ModelVerified"){
   if(writes[d.logicalId]&&writes[d.logicalId].revision===d.revision)delete writes[d.logicalId];
   delete creations[d.logicalId];
  }
  if(event.name==="NegativeAcquire")negatives[d.caseId]={ids:footprint(d.logicalId)};
  if(event.name==="NegativeRelease")delete negatives[d.caseId];
 }
});
