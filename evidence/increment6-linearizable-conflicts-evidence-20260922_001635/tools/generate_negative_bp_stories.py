#!/usr/bin/env python3
"""Generate OpenAPI-grounded BP stories for negative and post-delete probes."""
import argparse, hashlib, json
from pathlib import Path

REQUIRED = {
    ("GET", "/projects/{id}"), ("PUT", "/projects/{id}"), ("DELETE", "/projects/{id}"),
    ("GET", "/tasks/{task}"), ("PUT", "/tasks/{task}"), ("DELETE", "/tasks/{task}"),
    ("GET", "/labels/{id}"), ("PUT", "/labels/{id}"), ("DELETE", "/labels/{id}"),
    ("GET", "/tasks/{task}/comments/{commentid}"),
    ("PUT", "/tasks/{task}/comments/{commentid}"),
    ("DELETE", "/tasks/{task}/comments/{commentid}"),
    ("DELETE", "/tasks/{task}/relations/{relationKind}/{otherTask}"),
}
# Keep Provengo's actuator expectation aligned with the external oracle:
# every client-error response is an accepted rejection, while 2xx/3xx/5xx are not.
NEGATIVE_CODES = "[" + ",".join(str(code) for code in range(400, 500)) + "]"

def q(value): return json.dumps(value, separators=(",", ":"))
def require_contract(spec):
    available={(m.upper(),p) for p,item in spec.get("paths",{}).items() for m,v in item.items() if isinstance(v,dict)}
    missing=sorted(REQUIRED-available)
    if missing: raise ValueError(f"Required negative-probe operations missing: {missing}")
    for method,path in REQUIRED:
        responses=spec["paths"][path][method.lower()].get("responses",{})
        if "default" not in responses and not any(str(code).startswith("4") for code in responses):
            raise ValueError(f"No error response contract for {method} {path}")
def deref(spec,schema):
    seen=set()
    while isinstance(schema,dict) and '$ref' in schema:
        ref=schema['$ref']
        if ref in seen or not ref.startswith('#/'):raise ValueError(f'Unsupported schema reference: {ref}')
        seen.add(ref);value=spec
        for part in ref[2:].split('/'):value=value[part.replace('~1','/').replace('~0','~')]
        schema=value
    return schema

def gather(name, waits, body):
    lines=[f'bthread({q(name)},function(){{','  let pending={};']
    for key,event in waits: lines.append(f'  pending[{q(key)}]=__negNamed({q(event)});')
    lines += ['  let data={};','  while(Object.keys(pending).length){','    let e=sync({waitFor:Object.values(pending)});',
              '    for(let k in pending){if(pending[k].contains(e)){data[k]=e.data||{};delete pending[k];break;}}','  }']
    lines += ['  '+x for x in body]+['});','']
    return lines

def render(tasks, labels, comments, relation_kinds):
    fake_project,fake_task,fake_label,fake_comment=2147483001,2147483002,2147483003,2147483004
    lines=['// GENERATED NEGATIVE EXPLORATION STORIES -- OpenAPI grounded',
           'function __negNamed(n){return EventSet("negative:"+n,function(e){return e.name===n;});}',
           'function __negDone(n,d){sync({request:Event("NegativeClosed:"+n,d||{})});}',
           'bthread("constraint:negative-completion",function(){sync({waitFor:__negNamed("Milestone:AllNegativeVerifiersClosed"),block:__negNamed("MultiResourceVerifiedActionsComplete")});});','']
    unknown=[("UnknownProject",f'/projects/{fake_project}'),("UnknownTask",f'/tasks/{fake_task}'),
             ("UnknownLabel",f'/labels/{fake_label}'),("UnknownComment",f'/tasks/{fake_task}/comments/{fake_comment}')]
    permit_names=[]
    for name,path in unknown:
        permit=f"Permit:Negative:{name}";permit_names.append(permit)
        lines += gather(f"negative:unknown:{name}",[("ready","State:ProjectReady"),("permit",permit)],
                        [f'sync({{request:Event("Intent:Negative{name}")}});',
                         f'svc.get({q(path)},{{expectedResponseCodes:{NEGATIVE_CODES}}});',
                         f'__negDone({q(name)});'])
    lines += ['bthread("scheduler:negative-unknown",function(){','  sync({waitFor:__negNamed("State:ProjectReady")});','  let remaining={};']
    for name in permit_names: lines.append(f'  remaining[{q(name)}]=Event({q(name)});')
    lines += ['  while(Object.keys(remaining).length){let e=sync({request:Object.values(remaining)});delete remaining[e.name];}','});','']
    lines += gather('negative:deleted-project',[("project","State:ProjectReady"),("deleted","State:ProjectDeleted")],[
        'let id=data.project.id; sync({request:Event("Intent:NegativeDeletedProject")});',
        f'svc.get("/projects/"+id,{{expectedResponseCodes:{NEGATIVE_CODES}}});',
        f'svc.put("/projects/"+id,{{body:JSON.stringify({{title:"negative-project"}}),expectedResponseCodes:{NEGATIVE_CODES}}});',
        f'svc.delete("/projects/"+id,{{expectedResponseCodes:{NEGATIVE_CODES}}});','__negDone("DeletedProject",{id:id});'])
    for i in range(tasks):
        lines += gather(f'negative:deleted-task:{i}',[("task",f"State:TaskDeleted:{i}")],[
            f'let id=data.task.id; sync({{request:Event("Intent:NegativeDeletedTask:{i}")}});',
            f'svc.get("/tasks/"+id,{{expectedResponseCodes:{NEGATIVE_CODES}}});',
            f'svc.put("/tasks/"+id,{{body:JSON.stringify({{title:"negative-task-{i}",done:false}}),expectedResponseCodes:{NEGATIVE_CODES}}});',
            f'svc.delete("/tasks/"+id,{{expectedResponseCodes:{NEGATIVE_CODES}}});',f'__negDone("DeletedTask:{i}",{{id:id}});'])
    for i in range(labels):
        lines += gather(f'negative:deleted-label:{i}',[("label",f"State:LabelDeleted:{i}")],[
            f'let id=data.label.id; sync({{request:Event("Intent:NegativeDeletedLabel:{i}")}});',
            f'svc.get("/labels/"+id,{{expectedResponseCodes:{NEGATIVE_CODES}}});',
            f'svc.put("/labels/"+id,{{body:JSON.stringify({{title:"negative-label-{i}"}}),expectedResponseCodes:{NEGATIVE_CODES}}});',
            f'svc.delete("/labels/"+id,{{expectedResponseCodes:{NEGATIVE_CODES}}});',f'__negDone("DeletedLabel:{i}",{{id:id}});'])
    for i in range(comments):
        lines += gather(f'negative:deleted-comment:{i}',[("task",f"State:TaskReady:{i}"),("comment",f"State:CommentReady:{i}"),("deleted",f"State:CommentDeleted:{i}")],[
            'let taskId=data.task.id,commentId=data.comment.id;',f'sync({{request:Event("Intent:NegativeDeletedComment:{i}")}});',
            f'svc.get("/tasks/"+taskId+"/comments/"+commentId,{{expectedResponseCodes:{NEGATIVE_CODES}}});',
            f'svc.put("/tasks/"+taskId+"/comments/"+commentId,{{body:JSON.stringify({{comment:"negative-comment-{i}"}}),expectedResponseCodes:{NEGATIVE_CODES}}});',
            f'svc.delete("/tasks/"+taskId+"/comments/"+commentId,{{expectedResponseCodes:{NEGATIVE_CODES}}});',f'__negDone("DeletedComment:{i}",{{taskId:taskId,commentId:commentId}});'])
    for i in range(tasks-1):
        kind=relation_kinds[i%len(relation_kinds)]
        lines += gather(f'negative:deleted-relation:{i}',[("a",f"State:TaskReady:{i}"),("b",f"State:TaskReady:{i+1}"),("deleted",f"State:RelationDeleted:{i}")],[
            'let a=data.a.id,b=data.b.id;',f'sync({{request:Event("Intent:NegativeDeletedRelation:{i}")}});',
            f'svc.delete("/tasks/"+a+"/relations/{kind}/"+b,{{expectedResponseCodes:{NEGATIVE_CODES}}});',
            'svc.get("/tasks/"+a,{expectedResponseCodes:[200]});',f'__negDone("DeletedRelation:{i}",{{taskId:a,otherTaskId:b,relationKind:{q(kind)}}});'])
    closed=[f"NegativeClosed:{x}" for x,_ in unknown]+["NegativeClosed:DeletedProject"]
    closed += [f"NegativeClosed:DeletedTask:{i}" for i in range(tasks)]
    closed += [f"NegativeClosed:DeletedLabel:{i}" for i in range(labels)]
    closed += [f"NegativeClosed:DeletedComment:{i}" for i in range(comments)]
    closed += [f"NegativeClosed:DeletedRelation:{i}" for i in range(tasks-1)]
    lines += ['bthread("coordinator:negative-closed",function(){','  let pending={};']
    for name in closed: lines.append(f'  pending[{q(name)}]=__negNamed({q(name)});')
    lines += ['  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}',
              '  sync({request:Event("Milestone:AllNegativeVerifiersClosed")});','});']
    return '\n'.join(lines)+'\n',closed

def main():
    p=argparse.ArgumentParser();p.add_argument('--openapi',required=True);p.add_argument('--output',required=True);p.add_argument('--manifest',required=True);p.add_argument('--tasks',type=int,default=6);a=p.parse_args()
    source=Path(a.openapi);spec=json.loads(source.read_text(encoding='utf-8-sig'));require_contract(spec)
    labels=max(2,min(4,a.tasks//2));comments=max(2,min(4,a.tasks))
    relation_schema=deref(spec,spec['paths']['/tasks/{task}/relations']['post']['requestBody']['content']['application/json']['schema'])
    enum=deref(spec,relation_schema.get('properties',{}).get('relation_kind',{})).get('enum',[])
    if not enum: raise ValueError('relation_kind enum missing')
    text,closed=render(a.tasks,labels,comments,enum);Path(a.output).parent.mkdir(parents=True,exist_ok=True);Path(a.output).write_text(text,encoding='utf-8')
    http_witnesses=4+3+3*a.tasks+3*labels+3*comments+2*(a.tasks-1)
    oracle_counts={'unknown-project-rejected':1,'unknown-task-rejected':1,'unknown-label-rejected':1,'unknown-comment-rejected':1}
    for resource,n in [('project',1),('task',a.tasks),('label',labels),('comment',comments)]:
        for operation in ('read','update','delete'): oracle_counts[f'deleted-{resource}-{operation}-rejected']=n
    oracle_counts['deleted-relation-delete-rejected-and-absent']=a.tasks-1
    manifest={'schema_version':1,'profile':'negative-and-conflict-exploration','source_openapi_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'expected':{'tasks':a.tasks,'labels':labels,'comments':comments,'relations':a.tasks-1,'negative_groups':len(closed),'negative_http_witnesses':http_witnesses},'accepted_failure_class':'HTTP 4xx only','rejected_outcomes':['HTTP 2xx','HTTP 3xx','HTTP 5xx','missing observation'],'oracles':[{'oracle_id':k,'expected_witness_count':v} for k,v in oracle_counts.items()],'closed_events':closed}
    Path(a.manifest).write_text(json.dumps(manifest,indent=2,sort_keys=True)+'\n',encoding='utf-8')
    print(json.dumps({'output':a.output,'manifest':a.manifest,'negative_groups':len(closed)},indent=2))
if __name__=='__main__':main()
