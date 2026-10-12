"""Optional shared response observation. No domain or authorization probes are selected."""

INTERFACES = r'''

// HTTP transport collection is separate from contract classification.
function observedResponseCodes(declared) {
    var codes=declared.slice();
    for(var code=400;code<=599;code++) if(codes.indexOf(code)<0) codes.push(code);
    return codes;
}
function requestObservedRest(method,url,body,declared,id,targets) {
    if(!targets.length) throw new Error('Observation needs identity-bound readbacks');
    sync({request:bp.Event('ObservationBegin',{id:id,targets:targets})});
    var source='var raw=response||{};var r={code:raw.code,body:raw.body,captureComplete:typeof raw.code==="number" && raw.code%1===0 && raw.code>=100 && raw.code<=599,contractStatusValid:'+JSON.stringify(declared)+'.indexOf(raw.code)>=0};';
    source+='pvg.rtv.set('+JSON.stringify('OBS_'+id)+',JSON.stringify(r));';
    requestRest(method,url,body,observedResponseCodes(declared),
        {action:'observe',observationId:id},callbackFromSource(source));
    sync({request:bp.Event('ObservationReady',{id:id})});
}
function readObservedTarget(observation,target,index) {
    var source='var key='+JSON.stringify('OBS_'+observation.id)+';';
    source+='var record=JSON.parse(pvg.rtv.get(key));';
    source+='record.readbacks=record.readbacks||[];';
    source+='var target='+JSON.stringify(target)+';';
    source+='var read={logicalId:target.logicalId,code:response.code,usable:false};';
    source+='try{var payload=JSON.parse(response.body);read.actual=payload;';
    source+='read.identityMatches=payload[target.identityField]!==undefined && pvg.rtv.get(target.identityKey)!==undefined && String(payload[target.identityField])===String(pvg.rtv.get(target.identityKey));';
    source+='function resolve(v){if(typeof v==="string"){var m=/^@\\{([A-Za-z0-9_]+)\\}$/.exec(v);return m?pvg.rtv.get(m[1]):v;}if(Array.isArray(v))return v.map(resolve);if(v && typeof v==="object"){var out={};Object.keys(v).forEach(function(k){out[k]=resolve(v[k]);});return out;}return v;}target.expected=resolve(target.expected);';
    source+='read.expectedMatches=Object.keys(target.expected).every(function(k){return JSON.stringify(payload[k])===JSON.stringify(target.expected[k]);});';
    source+='read.usable=target.codes.indexOf(response.code)>=0 && read.identityMatches;';
    source+='}catch(error){read.decodeError=String(error);}';
    source+='record.readbacks['+index+']=read;pvg.rtv.set(key,JSON.stringify(record));';
    if(index===observation.targets.length-1) {
        source+='record.observationsComplete=record.captureComplete && record.readbacks.length==='+observation.targets.length+' && record.readbacks.every(function(r){return !!r && r.usable;});';
        source+='pvg.rtv.set(key,JSON.stringify(record));bp.log.info("OBSERVATION_EVIDENCE "+JSON.stringify(record));';
        source+='if(!record.observationsComplete || !record.contractStatusValid) pvg.fail("Observation incomplete or contract failure after readbacks");';
    }
    return requestRest('GET',target.url,undefined,observedResponseCodes(target.codes),
        {action:'observationReadback',observationId:observation.id},callbackFromSource(source));
}
'''

DAL = r'''

ctx.registerQuery('Observation.All',function(e){return e.type==='observation';});
ctx.registerQuery('Observation.Pending',function(e){return e.type==='observation' && e.ready;});
ctx.registerEffect('ObservationBegin',function(data){
    if(ctx.runQuery('Observation.All').some(function(e){return e.id===data.id;})) throw new Error('Duplicate observation');
    data.targets.forEach(function(target){
        var resource=getModelEntity(target.logicalId);
        if(JSON.stringify(resource.expected)!==JSON.stringify(target.expected)) throw new Error('Expected readback differs from DAL');
        if(resource.revision!==resource.verifiedRevision) throw new Error('Unverified observation target');
        if(!target.identityKey || !target.identityField || !target.url || !target.codes.length) throw new Error('Incomplete observation binding');
    });
    ctx.insertEntity(ctx.Entity(data.id,'observation',{targets:cloneExpected(data.targets),ready:false}));
});
ctx.registerEffect('ObservationReady',function(data){
    var found=ctx.runQuery('Observation.All').filter(function(e){return e.id===data.id;});
    if(found.length!==1 || found[0].ready) throw new Error('Missing/duplicate captured action');
    var targets=cloneExpected(found[0].targets);
    ctx.removeEntity(data.id);
    ctx.insertEntity(ctx.Entity(data.id,'observation',{targets:targets,ready:true}));
});
ctx.registerEffect('ObservationCompleted',function(data){ctx.removeEntity(data.id);});
'''

STORIES = r'''

// Separate Context verifier bthread per pending observation instance.
ctx.bthread('complete observed response','Observation.Pending',function(observation){
    for(var index=0;index<observation.targets.length;index++) {
        readObservedTarget(observation,observation.targets[index],index);
    }
    sync({request:bp.Event('ObservationCompleted',{id:observation.id})});
});
ctx.bthread('protect observation readbacks','Observation.All',function(observation){
    var protectedWrites=bp.EventSet('Observed resources',function(event){
        if(event.name==='ObservationBegin') return !!(event.data && event.data.targets && event.data.targets.some(function(t){return observation.targets.some(function(p){return p.logicalId===t.logicalId;});}));
        var model=event.data && event.data.model;
        return !!(model && (model.action==='update' || model.action==='create') &&
            observation.targets.some(function(t){return (model.affected || [model.logicalId]).indexOf(t.logicalId)>=0;}));
    });
    var completed=bp.EventSet('Observation done',function(event){return !!(event.name==='ObservationCompleted' && event.data && event.data.id===observation.id);});
    sync({block:protectedWrites,waitFor:completed});
});
'''
