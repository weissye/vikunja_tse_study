// Exploratory observed state does not replace the business expected-state model.
function interactionBusinessState(){
 if(ctx.runQuery("WriteLock.All").length||ctx.runQuery("Verification.Pending").length||ctx.runQuery("Negative.Pending").length)throw new Error("Interaction checkpoint requires drained business verifiers");
 var rows=ctx.runQuery("Resource.All").map(function(r){return {id:r.id,resourceType:r.resourceType,expected:cloneExpected(r.expected),revision:r.revision,verifiedRevision:r.verifiedRevision};});
 rows.sort(function(a,b){return a.id<b.id?-1:a.id>b.id?1:0;});return JSON.stringify(rows);
}
ctx.registerQuery("Interaction.Active",function(e){return e.type==="interactionGroup";});
ctx.registerEffect("InteractionAcquire",function(d){ctx.insertEntity(ctx.Entity("interaction_"+d.groupId,"interactionGroup",{groupId:d.groupId,logicalId:d.logicalId}));});
ctx.registerEffect("InteractionRelease",function(d){ctx.removeEntity("interaction_"+d.groupId);});
