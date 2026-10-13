function interactionEvent(name,group,sid){return bp.Event(name,{groupId:group.id,logicalId:group.logical_id,session:sid});}
function interactionMatches(name,group){return bp.EventSet(name+" "+group.id,function(e){return e.name===name&&e.data.groupId===group.id;});}
function registerInteractionWorker(group,sid){
 bthread("interaction worker "+group.id+" "+sid,function(){
  awaitSession(sid);waitForResource(group.logical_id,1);
  waitFor(interactionMatches("InteractionOpen",group));
  captureInteractionRead(group,sid);
  request(interactionEvent("InteractionReadReady",group,sid));
  if(group.profile!=="free_stale_disjoint_fields")waitFor(interactionMatches("InteractionWritePermit",group));
  writeInteractionSnapshot(group,sid);
  request(interactionEvent("InteractionWriteDone",group,sid));
 });
}
function registerInteractionCoordinator(group){
 bthread("interaction coordinator "+group.id,function(){
  waitForResource(group.logical_id,1);
  request(interactionEvent("InteractionAcquire",group));
  request(interactionEvent("InteractionOpen",group));
  if(group.profile!=="free_stale_disjoint_fields"){
   var ready={};
   while(!(ready.A&&ready.B)){var e=waitFor(interactionMatches("InteractionReadReady",group));ready[e.data.session]=true;}
   request(interactionEvent("InteractionWritePermit",group));
  }
  var done={};
  while(!(done.A&&done.B)){var e=waitFor(interactionMatches("InteractionWriteDone",group));done[e.data.session]=true;}
  // Independent reader thread probes only after both writers finish.
  request(interactionEvent("InteractionProbeReady",group));
  waitFor(interactionMatches("InteractionProbeDone",group));
  request(interactionEvent("InteractionReconciliationRequired",group));
  // No silent Context overwrite; integration must validate reconciliation first.
  waitFor(interactionMatches("InteractionReconciled",group));
  request(interactionEvent("InteractionRelease",group));
 });
}
function registerInteractionVerifier(group){
 bthread("interaction verifier "+group.id,function(){
  waitFor(interactionMatches("InteractionProbeReady",group));
  awaitSession("A");probeInteraction(group,"A");
  awaitSession("B");probeInteraction(group,"B");
  request(interactionEvent("InteractionProbeDone",group));
 });
}
INTERACTION_GROUPS.forEach(function(group){
 registerInteractionCoordinator(group);
 ["A","B"].forEach(function(sid){registerInteractionWorker(group,sid);});
 registerInteractionVerifier(group);
});
// The generated extension is explicitly disabled until native reference/recovery
// acceptance exists. Lifecycle/control code remains present in the same model.
bthread("interaction live acceptance guard",function(){
 sync({block:bp.EventSet("unaccepted interaction activation",function(e){return e.name==="InteractionAcquire";})});
});
