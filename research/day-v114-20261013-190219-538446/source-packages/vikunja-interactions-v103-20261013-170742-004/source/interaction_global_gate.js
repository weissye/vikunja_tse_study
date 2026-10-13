// Whole-store snapshots require drained writes and global mutation admission.
// Worker order inside the active group is still selected by Provengo.
bthread("interaction cold restore admission",function(){
 var reservations={},active=null,operations={},writes={},creations={},negatives={};
 function busy(){return Object.keys(operations).length||Object.keys(writes).length||Object.keys(creations).length||Object.keys(negatives).length;}
 function opKey(d){return (d.session||"A")+"/"+d.logicalId;}
 while(true){var e=sync({waitFor:bp.all,block:bp.EventSet("interaction snapshot conflicts",function(event){
  var d=event.data||{},m=d.model,waiting=Object.keys(reservations).length>0;
  if(event.name==="InteractionAcquire")return active!==null||!!busy();
  if(event.name==="InteractionReserve")return active!==null;
  if(event.name==="OperationAcquire"||event.name==="NegativeAcquire")return active!==null||waiting;
  if(!m)return false;
  if(m.action==="authenticate")return false;
  if(active!==null)return !(m.groupId===active&&m.action.indexOf("interaction_")===0);
  return waiting&&m.action==="create";
 })});var d=e.data||{},m=d.model;
 if(e.name==="OperationAcquire")operations[opKey(d)]=true;
 if(e.name==="OperationRelease")delete operations[opKey(d)];
 if(e.name==="ModelWriteBegin")writes[d.logicalId]=d.revision;
 if(m&&m.action==="create")creations[m.logicalId]=true;
 if(e.name==="ModelVerified"){if(writes[d.logicalId]===d.revision)delete writes[d.logicalId];delete creations[d.logicalId];}
 if(e.name==="NegativeAcquire")negatives[d.caseId]=true;
 if(e.name==="NegativeRelease")delete negatives[d.caseId];
 if(e.name==="InteractionReserve")reservations[d.groupId]=true;
 if(e.name==="InteractionAcquire")active=d.groupId;
 if(e.name==="InteractionRelease"){delete reservations[d.groupId];active=null;}
 }
});
