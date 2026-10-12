//@provengo summon context
// Generated Context DAL using the built-in Provengo Context library.

// Context contains expected request-derived state, never a copy of an observed response.
// Real identities and server snapshots are kept only in runtime variables at the boundary.
function getModelEntity(id) {
    var found=ctx.runQuery("Resource.All").filter(function(e){return e.id===id;});
    if(found.length!==1) throw new Error("Missing/ambiguous Context resource "+id);
    return found[0];
}
function cloneExpected(value) {return JSON.parse(JSON.stringify(value));}
function applyInterfaceEffect(event) {
    var data=extractEventData(event);
    if(data && data.action==="f02") {applyF02Effect(data);return;}
    if(data && data.action==="contribute") {applyContributionEffect(data);return;}
    if(!data || (data.action!=="create" && data.action!=="update")) return;
    if(data.action==="create") {
        ctx.insertEntity(ctx.Entity(data.logicalId,"resource",{
            resourceType:data.type,expected:cloneExpected(data.expected),revision:1,verifiedRevision:0
        }));
    } else {
        var resource=getModelEntity(data.logicalId);
        var expected=cloneExpected(resource.expected);
        Object.keys(data.expected).forEach(function(k){expected[k]=cloneExpected(data.expected[k]);});
        ctx.removeEntity(resource.id);
        ctx.insertEntity(ctx.Entity(resource.id,"resource",{
            resourceType:resource.resourceType,expected:expected,revision:resource.revision+1,
            verifiedRevision:resource.verifiedRevision
        }));
    }
}
["POST","PUT","PATCH"].forEach(function(method){
    ctx.registerEffect(method,function(data){applyInterfaceEffect(bp.Event(method,data));});
});
ctx.registerEffect("ModelWriteBegin",function(data){
    ctx.insertEntity(ctx.Entity("lock_"+data.owner,"writeLock",{logicalId:data.logicalId,owner:data.owner,revision:data.revision}));
});
ctx.registerQuery("WriteLock.All",function(e){return e.type==="writeLock";});
ctx.registerEffect("ModelVerified",function(data){
    ctx.runQuery("WriteLock.All").forEach(function(lock){
        if(lock.logicalId===data.logicalId && lock.revision===data.revision) ctx.removeEntity(lock.id);
    });
    var resource=getModelEntity(data.logicalId);
    if(resource.revision!==data.revision) throw new Error("Stale verification acknowledgement");
    ctx.removeEntity(resource.id);
    ctx.insertEntity(ctx.Entity(resource.id,"resource",{
        resourceType:resource.resourceType,expected:cloneExpected(resource.expected),
        revision:resource.revision,verifiedRevision:data.revision
    }));
});
ctx.registerQuery("Resource.All",function(e){return e.type==="resource";});
ctx.registerQuery("Verification.Pending",function(e){return e.type==="resource" && e.verifiedRevision<e.revision;});
function waitForResource(logicalId, revision) {
    while(true) {
        var resources=ctx.runQuery("Resource.All").filter(function(e){return e.id===logicalId;});
        if(resources.length===1 && resources[0].verifiedRevision>=revision && resources[0].verifiedRevision===resources[0].revision) return resources[0];
        waitFor(bp.EventSet("Resource verified "+logicalId,function(event){return event.name==="ModelVerified" && event.data.logicalId===logicalId;}));
    }
}
function readyResources(type) {
    return ctx.runQuery(type+".Ready");
}
function waitForDependencies(types, bindings) {
    // Each wakeup re-evaluates ALL dependencies. No fixed ordering of parents.
    while(true) {
        var chosen={};
        var missing=[];
        types.forEach(function(type){
            if(chosen[type]) return;
            var available=readyResources(type).filter(function(resource){return !bindings || !bindings[type] || resource.id===bindings[type];});
            if(available.length) chosen[type]=available[0]; else missing.push(type);
        });
        if(!missing.length) return chosen;
        waitFor(bp.EventSet("Any required dependency becomes verified",function(event){
            return event.name==="ModelVerified";
        }));
    }
}

ctx.registerQuery("ModelsProject.Ready",function(e){return e.type==="resource" && e.resourceType==="ModelsProject" && e.verifiedRevision===e.revision;});
ctx.registerQuery("ModelsTask.Ready",function(e){return e.type==="resource" && e.resourceType==="ModelsTask" && e.verifiedRevision===e.revision;});
ctx.registerQuery("ModelsLabel.Ready",function(e){return e.type==="resource" && e.resourceType==="ModelsLabel" && e.verifiedRevision===e.revision;});
ctx.registerQuery("ModelsProjectView.Ready",function(e){return e.type==="resource" && e.resourceType==="ModelsProjectView" && e.verifiedRevision===e.revision;});
ctx.registerQuery("ModelsTaskComment.Ready",function(e){return e.type==="resource" && e.resourceType==="ModelsTaskComment" && e.verifiedRevision===e.revision;});
ctx.registerQuery("ModelsTeam.Ready",function(e){return e.type==="resource" && e.resourceType==="ModelsTeam" && e.verifiedRevision===e.revision;});
ctx.registerQuery("ModelsSavedFilter.Ready",function(e){return e.type==="resource" && e.resourceType==="ModelsSavedFilter" && e.verifiedRevision===e.revision;});
ctx.registerQuery("ModelsLinkSharing.Ready",function(e){return e.type==="resource" && e.resourceType==="ModelsLinkSharing" && e.verifiedRevision===e.revision;});

ctx.registerEffect('NegativeBegin',function(data){ctx.insertEntity(ctx.Entity(data.caseId,'negativePending',{caseId:data.caseId,logicalId:data.logicalId,resourceType:data.resourceType,caseDef:data.caseDef,expected:cloneExpected(data.expected),revision:data.revision}));});
ctx.registerEffect('NegativeCatalogReady',function(data){data.rules.forEach(function(rule,index){ctx.insertEntity(ctx.Entity('negative_rule_'+index,'negativeRule',{resourceType:rule.resource,caseDef:rule,expectation:'DENY_SCHEMA_INPUT',requiredState:'VERIFIED_CREATED_RESOURCE'}));});});
ctx.registerQuery('Negative.Rules',function(e){return e.type==='negativeRule';});
ctx.registerQuery('Negative.ReadySubjects',function(e){return e.type==='resource'&&e.revision===1&&e.verifiedRevision===1;});
ctx.registerQuery('Negative.Pending',function(e){return e.type==='negativePending';});
ctx.registerEffect('NegativeVerified',function(data){ctx.removeEntity(data.caseId);});

