#!/usr/bin/env python3
"""Generate OpenAPI-grounded BP stories for linearizable competing writes."""
import argparse, hashlib, json
from pathlib import Path

REQUIRED={
 ('PUT','/projects/{id}'),('GET','/projects/{id}'),
 ('PUT','/tasks/{task}'),('GET','/tasks/{task}'),
 ('PUT','/labels/{id}'),('GET','/labels/{id}'),
 ('PUT','/tasks/{task}/comments/{commentid}'),('GET','/tasks/{task}/comments/{commentid}'),
}

def q(value): return json.dumps(value,separators=(',',':'))
def check_contract(spec):
    available={(m.upper(),p) for p,item in spec.get('paths',{}).items() for m,v in item.items() if isinstance(v,dict)}
    missing=sorted(REQUIRED-available)
    if missing: raise ValueError(f'Required conflict operations missing: {missing}')

def wait_all(lines, waits):
    lines.append('  let pending={};')
    for key,event in waits: lines.append(f'  pending[{q(key)}]=__c6Named({q(event)});')
    lines += ['  let data={};','  while(Object.keys(pending).length){','    let e=sync({waitFor:Object.values(pending)});','    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}','  }']

def writer(name,waits,resource,index,variant,path_expr,body_expr,closed):
    lines=[f'bthread({q(name)},function(){{'];wait_all(lines,waits)
    permit=f'Permit:Conflict6:{resource}:{index}:{variant}'
    lines += [f'  sync({{request:Event({q(permit)})}});',f'  sync({{request:Event({q("Intent:Conflict6:"+resource+":"+str(index)+":"+variant)})}});',
              f'  svc.put({path_expr},{{body:JSON.stringify({body_expr}),expectedResponseCodes:[200]}});',
              f'  svc.get({path_expr},{{expectedResponseCodes:[200]}});',
              f'  sync({{request:Event({q("ConflictClosed:"+resource+":"+str(index)+":"+variant)})}});','});','']
    closed.append(f'ConflictClosed:{resource}:{index}:{variant}')
    return lines

def render(tasks,labels,comments):
    lines=['// GENERATED INCREMENT 6 CONFLICT STORIES -- OpenAPI grounded',
           'function __c6Named(n){return EventSet("conflict6:"+n,function(e){return e.name===n;});}',
           'function __c6Blocked(e){return e.name==="Intent:UpdateProject"||e.name==="Milestone:AuxReadyForMutation"||e.name==="MultiResourceVerifiedActionsComplete";}',
           'bthread("constraint:conflict6-before-base-mutations",function(){sync({waitFor:__c6Named("Milestone:AllConflictVerifiersClosed"),block:EventSet("conflict6:block-base",__c6Blocked)});});','']
    closed=[]
    common=[('project',0,[('resource','State:ProjectReady'),('verified','VerifierClosed:ProjectCreate')],'"/projects/"+data.resource.id',lambda v:'{title:'+q(f'conflict6_project_0_{v}')+'}')]
    for resource,index,waits,path_expr,body in common:
        for variant in ('A','B'): lines+=writer(f'conflict6:{resource}:{variant}',waits,resource,index,variant,path_expr,body(variant),closed)
    for i in range(tasks):
        waits=[('resource',f'State:TaskReady:{i}'),('verified',f'VerifierClosed:TaskCreate:{i}')]
        for variant in ('A','B'):
            lines+=writer(f'conflict6:task:{i}:{variant}',waits,'task',i,variant,'"/tasks/"+data.resource.id','{title:'+q(f'conflict6_task_{i}_{variant}')+',done:false}',closed)
    for i in range(labels):
        waits=[('resource',f'State:LabelReady:{i}'),('verified',f'VerifierClosed:LabelCreate:{i}')]
        for variant in ('A','B'):
            lines+=writer(f'conflict6:label:{i}:{variant}',waits,'label',i,variant,'"/labels/"+data.resource.id','{title:'+q(f'conflict6_label_{i}_{variant}')+'}',closed)
    for i in range(comments):
        waits=[('task',f'State:TaskReady:{i}'),('comment',f'State:CommentReady:{i}'),('updated',f'State:CommentUpdated:{i}')]
        for variant in ('A','B'):
            path='"/tasks/"+data.task.id+"/comments/"+data.comment.id'
            lines+=writer(f'conflict6:comment:{i}:{variant}',waits,'comment',i,variant,path,'{comment:'+q(f'conflict6_comment_{i}_{variant}')+'}',closed)
    lines += ['bthread("coordinator:conflict6-closed",function(){','  let pending={};']
    for name in closed: lines.append(f'  pending[{q(name)}]=__c6Named({q(name)});')
    lines += ['  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}',
              '  sync({request:Event("Milestone:AllConflictVerifiersClosed")});','});']
    return '\n'.join(lines)+'\n',closed

def main():
    p=argparse.ArgumentParser();p.add_argument('--openapi',required=True);p.add_argument('--output',required=True);p.add_argument('--manifest',required=True);p.add_argument('--tasks',type=int,default=6);a=p.parse_args()
    source=Path(a.openapi);spec=json.loads(source.read_text(encoding='utf-8-sig'));check_contract(spec)
    labels=max(2,min(4,a.tasks//2));comments=max(2,min(4,a.tasks));text,closed=render(a.tasks,labels,comments)
    Path(a.output).parent.mkdir(parents=True,exist_ok=True);Path(a.output).write_text(text,encoding='utf-8')
    counts={'project-last-successful-write-visible':2,'task-last-successful-write-visible':2*a.tasks,'label-last-successful-write-visible':2*labels,'comment-last-successful-write-visible':2*comments}
    manifest={'schema_version':1,'profile':'linearizable-write-conflicts','source_openapi_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'prefix':'conflict6_','expected':{'tasks':a.tasks,'labels':labels,'comments':comments,'conflict_writes':sum(counts.values()),'conflict_reads':sum(counts.values())},'oracles':[{'oracle_id':k,'expected_witness_count':v} for k,v in counts.items()],'closed_events':closed}
    Path(a.manifest).write_text(json.dumps(manifest,indent=2,sort_keys=True)+'\n',encoding='utf-8')
    print(json.dumps({'output':a.output,'manifest':a.manifest,'conflict_writes':sum(counts.values())},indent=2))
if __name__=='__main__':main()
