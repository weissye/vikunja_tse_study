// Generic observation isolation over declared write footprints.
// The scheduler remains Provengo's; disjoint resources are not blocked.
bthread("resource-local negative observation isolation",function(){
    var positives={},negatives={};
    function affected(m){
        var ids=[];
        if(m.logicalId)ids.push(m.logicalId);
        (m.affected||[]).forEach(function(id){if(ids.indexOf(id)<0)ids.push(id);});
        return ids;
    }
    while(true){
        var event=sync({waitFor:bp.all,block:bp.EventSet("resource-local observation conflicts",function(e){
            var d=e.data||{};
            if(e.name==="NegativeAcquire")return !!positives[d.logicalId]||!!negatives[d.logicalId];
            if(e.name==="ModelWriteBegin")return !!negatives[d.logicalId];
            var m=d.model;
            if(!m)return false;
            if(m.action!=="create"&&m.action!=="update"&&m.action!=="delete"&&m.action!=="negative_attempt")return false;
            return affected(m).some(function(id){
                return !!negatives[id] && !(m.action==="negative_attempt"&&negatives[id]===m.caseId);
            });
        })});
        var data=event.data||{};
        if(event.name==="ModelWriteBegin")positives[data.logicalId]=data.revision;
        if(event.name==="ModelVerified" && positives[data.logicalId]===data.revision)delete positives[data.logicalId];
        if(event.name==="NegativeAcquire")negatives[data.logicalId]=data.caseId;
        if(event.name==="NegativeRelease" && negatives[data.logicalId]===data.caseId)delete negatives[data.logicalId];
    }
});
