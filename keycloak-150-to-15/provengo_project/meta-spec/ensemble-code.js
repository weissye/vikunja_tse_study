// Race-ranked 2x8 ensemble. Runtime overlap is checked by the relay after selection.
function rankingFunction(ensemble) {
  var order={},neighbor={},parent={},entityEdge={},context={},activeBucket={},crudEdge={};
  for (var n=0;n<ensemble.length;n++) {
    var t=ensemble[n],ready={},finished={},entities={},processes={},races=[],steps=[];
    var bind=0,bound=0,verified=0,dispatch=0,active={},activeCount=0,previous=null,previousEntity=null;
    for (var i=0;i<t.length;i++) {
      var e=t[i],d=e.data||{},owner=String(d.owner||'');
      if (e.name==='SBT:InstanceReady') {
        ready[owner]=true;entities[d.entity]=(entities[d.entity]||0)+1;
        processes[d.process]=(processes[d.process]||0)+1;
        if (!active[owner]) {active[owner]=true;activeCount++;}
      } else if (e.name==='SBT:WorkerFinished') {
        if (d.reason!=='complete') return -1000000000;
        finished[owner]=true;if (active[owner]) {delete active[owner];activeCount--;}
      } else if (e.name==='SBT:BindParent') {
        bind++;parent[d.child+'|'+d.type+'|'+d.index]=true;
      } else if (e.name==='SBT:ParentsBound') {
        bound++;for(var type in d.parents) if(Object.prototype.hasOwnProperty.call(d.parents,type))
          parent[owner+'|'+type+'|'+JSON.stringify(d.parents[type])]=true;
      } else if (e.name==='SBT:CrudVerified' && d.stage==='race' && d.ok===true) verified++;
      else if (e.name==='POST' && d.url && String(d.url).indexOf('/__sbt_race?path=')>=0) dispatch++;
      if (e.name!=='SBT:CrudStep') continue;
      var current=owner+'#'+d.stage;
      if(previous!==null && previous!==current) {
        crudEdge[previous+'|'+current]=true;
        entityEdge[previousEntity+'|'+d.entity+'|'+d.stage]=true;
      }
      previous=current;previousEntity=d.entity;steps.push(current);
      if(d.stage==='race') {
        races.push({owner:owner,step:steps.length-1});
        activeBucket[d.entity+'|'+d.process+'|'+Math.min(20,Math.floor(activeCount/20))]=true;
      }
    }
    if(Object.keys(ready).length!==400 || Object.keys(finished).length!==400 ||
       Object.keys(entities).length!==25 || processes[1]!==200 || processes[2]!==200 ||
       bind!==624 || bound!==384 || races.length!==224 || verified!==224 || dispatch!==224)
      return -1000000000;
    for(var key in entities) if(entities[key]!==16) return -1000000000;
    var owners={};for(var a=0;a<races.length;a++)owners[races[a].owner]=true;
    if(Object.keys(owners).length!==224)return -1000000000;
    for(var r=0;r<races.length;r++) {
      var x=races[r],before=r?races[r-1].owner:'START',after=r+1<races.length?races[r+1].owner:'END';
      neighbor[x.owner+'|'+before+'|'+after]=true;
      context[x.owner+'|'+(x.step?steps[x.step-1]:'START')+'|'+
              (x.step+1<steps.length?steps[x.step+1]:'END')]=true;
      for(var j=r+1;j<races.length;j++) {
        var y=races[j].owner;
        order[x.owner<y?x.owner+'|'+y+'|AB':y+'|'+x.owner+'|BA']=true;
      }
    }
  }
  return Object.keys(order).length*20+Object.keys(parent).length*50+
         Object.keys(entityEdge).length*25+Object.keys(neighbor).length*10+
         Object.keys(context).length*4+Object.keys(activeBucket).length*8+
         Object.keys(crudEdge).length;
}
