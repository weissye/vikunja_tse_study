#!/usr/bin/env python3
"""Generate a self-contained Provengo Increment 9 concurrency campaign."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

REQUIRED = {
    ("POST", "/projects"),
    ("POST", "/projects/{project}/tasks"),
    ("GET", "/tasks/{task}"),
    ("PATCH", "/tasks/{task}"),
    ("DELETE", "/tasks/{task}"),
}

SCENARIOS = [
    {"id": "disjoint-title-description", "kind": "commutative", "ops": [("PATCH", "title", "increment9_title_a", 0), ("PATCH", "description", "increment9_description_a", 0)]},
    {"id": "disjoint-title-priority-staggered", "kind": "commutative", "ops": [("PATCH", "title", "increment9_title_b", 0), ("PATCH", "priority", 3, 5)]},
    {"id": "same-field-title", "kind": "same-field", "ops": [("PATCH", "title", "increment9_title_first", 0), ("PATCH", "title", "increment9_title_second", 5)]},
    {"id": "three-way-disjoint", "kind": "commutative", "ops": [("PATCH", "title", "increment9_title_c", 0), ("PATCH", "description", "increment9_description_c", 3), ("PATCH", "priority", 4, 6)]},
    {"id": "update-delete", "kind": "update-delete", "ops": [("PATCH", "title", "increment9_title_before_delete", 0), ("DELETE", None, None, 5)]},
    {"id": "disjoint-description-priority-reversed", "kind": "commutative", "ops": [("PATCH", "description", "increment9_description_d", 5), ("PATCH", "priority", 2, 0)]},
]


def check_contract(spec: dict) -> None:
    available = {(method.upper(), path) for path, item in spec.get("paths", {}).items()
                 for method, operation in item.items() if isinstance(operation, dict)}
    missing = sorted(REQUIRED - available)
    if missing:
        raise ValueError(f"Increment 9 OpenAPI operations missing: {missing}")
    fields = spec.get("components", {}).get("schemas", {}).get("TaskReadOneBody", {}).get("properties", {})
    for field in ("title", "description", "priority"):
        if field not in fields or fields[field].get("readOnly") is True:
            raise ValueError(f"Writable task field is missing: {field}")


def q(value) -> str:
    return json.dumps(value, separators=(",", ":"))


def js_operation(epoch_id: str, index: int, op: tuple, task_expr: str) -> str:
    method, field, value, delay = op
    body = "null" if method == "DELETE" else q({field: value})
    return "{operation_id:%s,method:%s,path:\"/tasks/\"+%s,body:%s,delay_ms:%s,headers:{\"Content-Type\":\"application/merge-patch+json\"}}" % (
        q(f"{epoch_id}-op-{index}"), q(method), task_expr, body, delay)


def render(adapter_port: int) -> str:
    lines = [
        "//@provengo summon rest",
        "// GENERATED INCREMENT 9 PROVENGO-DRIVEN CONCURRENCY SEARCH",
        'var __i9Host=(typeof host!=="undefined")?host:"127.0.0.1";',
        'var __i9Port=(typeof port!=="undefined")?port:3457;',
        f'var __i9AdapterPort=(typeof concurrencyPort!=="undefined")?concurrencyPort:{adapter_port};',
        'var __i9Sut=new RESTSession("http://"+__i9Host+":"+__i9Port,"increment9-sut",{headers:{"Content-Type":"application/json"}});',
        'var __i9Adapter=new RESTSession("http://127.0.0.1:"+__i9AdapterPort,"increment9-adapter",{headers:{"Content-Type":"application/json"}});',
        'function __i9Named(n){return EventSet("increment9:"+n,function(e){return e.name===n;});}',
        'function __i9Call(method,path,body,codes,epochId,operationId){',
        '  let out={code:null,body:null};let headers={"Content-Type":"application/merge-patch+json"};',
        '  if(epochId)headers["X-Provengo-Epoch-Id"]=epochId;if(operationId)headers["X-Provengo-Operation-Id"]=operationId;',
        '  let options={headers:headers,expectedResponseCodes:codes,callback:function(r){out.code=r.code;try{out.body=JSON.parse(r.body);}catch(e){out.body=r.body;}}};',
        '  if(body!==null&&typeof body!=="undefined")options.body=JSON.stringify(body);',
        '  if(method==="GET")__i9Sut.get(path,options);else if(method==="POST")__i9Sut.post(path,options);else if(method==="PATCH")__i9Sut.patch(path,options);else if(method==="DELETE")__i9Sut.delete(path,options);else throw "unsupported method";',
        '  return out;',
        '}',
        'function __i9CreateTask(projectId,title){return __i9Call("POST","/projects/"+projectId+"/tasks",{title:title,description:"increment9_baseline_description",priority:1},[201],null,null).body;}',
        'function __i9Sequential(epochId,taskId,ops){for(let i=0;i<ops.length;i++){let o=ops[i];__i9Call(o.method,"/tasks/"+taskId,o.body,o.method==="DELETE"?[204]:[200],epochId,epochId+"-op-"+i);}return __i9Call("GET","/tasks/"+taskId,null,[200,404],epochId,epochId+"-observe");}',
        'function __i9Concurrent(epochId,scenario,ops){let out=null;__i9Adapter.post("/epochs",{body:JSON.stringify({epoch_id:epochId,scenario:scenario,operations:ops}),expectedResponseCodes:[200],callback:function(r){try{out=JSON.parse(r.body);}catch(e){out={error:String(e)};}}});return out;}',
        '',
        'bthread("increment9:setup",function(){',
        '  let project=__i9Call("POST","/projects",{title:"increment9_concurrency_campaign"},[201],null,null).body;',
        '  sync({request:Event("Increment9:ProjectReady",{id:project.id})});',
        '  sync({waitFor:__i9Named("Increment9:AllScenariosClosed")});',
        '  __i9Call("DELETE","/projects/"+project.id,null,[204],null,null);',
        '});',
        '',
        'bthread("increment9:scheduler",function(){',
        '  let ready={};',
    ]
    for index in range(len(SCENARIOS)):
        lines.append(f'  ready[{q(f"Increment9:ScenarioReady:{index}")}]=__i9Named({q(f"Increment9:ScenarioReady:{index}")});')
    lines.extend([
        '  while(Object.keys(ready).length){let e=sync({waitFor:Object.values(ready)});delete ready[e.name];}',
        '  let permits={};',
    ])
    for index in range(len(SCENARIOS)):
        lines.append(f'  permits[{q(f"Increment9:Permit:{index}")}]=Event({q(f"Increment9:Permit:{index}")});')
    lines.extend([
        '  while(Object.keys(permits).length){let e=sync({request:Object.values(permits)});delete permits[e.name];}',
        '});',
        '',
    ])
    for index, scenario in enumerate(SCENARIOS):
        control_epoch = f"increment9-control-{index}"
        concurrent_epoch = f"increment9-epoch-{index}"
        lines.extend([
            f'bthread({q("increment9:scenario:" + str(index) + ":" + scenario["id"])},function(){{',
            '  let project=sync({waitFor:__i9Named("Increment9:ProjectReady")}).data;',
            f'  let control=__i9CreateTask(project.id,{q(f"increment9_control_{index}")});',
            f'  let candidate=__i9CreateTask(project.id,{q(f"increment9_candidate_{index}")});',
            f'  sync({{request:Event({q(f"Increment9:ScenarioReady:{index}")},{{scenario:{q(scenario["id"])},control_task_id:control.id,candidate_task_id:candidate.id}})}});',
            f'  sync({{waitFor:__i9Named({q(f"Increment9:Permit:{index}")})}});',
            f'  let controlOps=[];',
        ])
        for op_index, op in enumerate(scenario["ops"]):
            method, field, value, _delay = op
            body = "null" if method == "DELETE" else q({field: value})
            lines.append(f'  controlOps.push({{method:{q(method)},body:{body}}});')
        lines.extend([
            f'  let controlObservation=__i9Sequential({q(control_epoch)},control.id,controlOps);',
            f'  sync({{request:Event("Increment9:SequentialControlComplete",{{scenario:{q(scenario["id"])},epoch_id:{q(control_epoch)},task_id:control.id,status:controlObservation.code}})}});',
            '  let concurrentOps=[];',
        ])
        for op_index, op in enumerate(scenario["ops"]):
            lines.append(f'  concurrentOps.push({js_operation(concurrent_epoch, op_index, op, "candidate.id")});')
        lines.extend([
            f'  sync({{request:Event("Increment9:EpochDeclared",{{scenario:{q(scenario["id"])},epoch_id:{q(concurrent_epoch)},task_id:candidate.id,width:concurrentOps.length}})}});',
            f'  let result=__i9Concurrent({q(concurrent_epoch)},{q(scenario["id"])},concurrentOps);',
            f'  sync({{request:Event("Increment9:EpochJoined",{{scenario:{q(scenario["id"])},epoch_id:{q(concurrent_epoch)},result:result}})}});',
            f'  let observation=__i9Call("GET","/tasks/"+candidate.id,null,[200,404],{q(concurrent_epoch)},{q(concurrent_epoch + "-observe")});',
            f'  sync({{request:Event("Increment9:ScenarioClosed",{{scenario:{q(scenario["id"])},epoch_id:{q(concurrent_epoch)},task_id:candidate.id,status:observation.code}})}});',
            '  if(controlObservation.code!==404)__i9Call("DELETE","/tasks/"+control.id,null,[204,404],null,null);',
            '  if(observation.code!==404)__i9Call("DELETE","/tasks/"+candidate.id,null,[204,404],null,null);',
            '});',
            '',
        ])
    lines.extend([
        'bthread("increment9:completion",function(){',
        '  let pending={};',
    ])
    for index in range(len(SCENARIOS)):
        lines.append(f'  pending[{q(SCENARIOS[index]["id"])}]=EventSet({q("increment9:closed:" + str(index))},function(e){{return e.name==="Increment9:ScenarioClosed"&&e.data&&e.data.scenario==={q(SCENARIOS[index]["id"])};}});')
    lines.extend([
        '  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(e.data&&pending[e.data.scenario])delete pending[e.data.scenario];}',
        '  sync({request:Event("Increment9:AllScenariosClosed")});',
        '});',
    ])
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--openapi", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--adapter-port", type=int, default=3459)
    args = parser.parse_args()
    source = Path(args.openapi)
    spec = json.loads(source.read_text(encoding="utf-8-sig"))
    check_contract(spec)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render(args.adapter_port), encoding="utf-8")
    manifest = {
        "schema_version": 1,
        "profile": "provengo-driven-vikunja-concurrency-search",
        "source_openapi_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "decision_owner": "Provengo BP model",
        "adapter_role": "validated barrier release and HTTP transport only",
        "primary_backend": "postgresql",
        "scenarios": [
            {"index": i, "scenario_id": s["id"], "kind": s["kind"], "width": len(s["ops"]),
             "operations": [{"method": o[0], "field": o[1], "value": o[2], "delay_ms": o[3]} for o in s["ops"]]}
            for i, s in enumerate(SCENARIOS)
        ],
        "gates": ["sequential-control", "barrier-readiness", "distinct-connections", "adapter-overlap", "proxy-overlap", "post-join-observation"],
        "candidate_policy": "Search findings require independent direct confirmation in Increment 9.1",
    }
    Path(args.manifest).write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"scenarios": len(SCENARIOS), "epochs": len(SCENARIOS), "output": str(output)}, sort_keys=True))


if __name__ == "__main__":
    main()
