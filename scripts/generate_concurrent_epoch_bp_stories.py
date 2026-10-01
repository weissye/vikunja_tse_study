#!/usr/bin/env python3
"""Generate Provengo-native Increment 8 concurrent-epoch stories."""
import argparse
import hashlib
import json
from pathlib import Path

REQUIRED = {("PATCH", "/tasks/{task}"), ("GET", "/tasks/{task}")}


def q(value):
    return json.dumps(value, separators=(",", ":"))


def check_contract(spec):
    available = {
        (method.upper(), path)
        for path, item in spec.get("paths", {}).items()
        for method, operation in item.items()
        if isinstance(operation, dict)
    }
    missing = sorted(REQUIRED - available)
    if missing:
        raise ValueError(f"Required concurrent operations missing: {missing}")
    fields = spec["components"]["schemas"]["TaskReadOneBody"].get("properties", {})
    for field in ("title", "description"):
        if field not in fields or fields[field].get("readOnly") is True:
            raise ValueError(f"Writable Task field is missing: {field}")


def render(tasks, adapter_port):
    lines = [
        "// GENERATED INCREMENT 8 PROVENGO-NATIVE CONCURRENT EPOCH STORIES",
        "//@provengo summon rest",
        f'var __c8AdapterPort=(typeof concurrencyPort!=="undefined")?concurrencyPort:{adapter_port};',
        'var __c8Adapter=new RESTSession("http://127.0.0.1:"+__c8AdapterPort,"provengo-concurrent-rest",{headers:{"Content-Type":"application/json"}});',
        'function __c8Named(n){return EventSet("increment8:"+n,function(e){return e.name===n;});}',
        'function __c8Blocked(e){return e.name==="Intent:UpdateProject"||e.name==="Milestone:AuxReadyForMutation"||e.name==="MultiResourceVerifiedActionsComplete";}',
        'function __c8Execute(payload){',
        '  let result=null;',
        '  __c8Adapter.post("/epochs",{body:JSON.stringify(payload),expectedResponseCodes:[200],callback:function(response){try{result=JSON.parse(response.body);}catch(e){result={parse_error:String(e),raw:String(response.body)};}}});',
        '  return result;',
        '}',
        'bthread("constraint:increment8-before-base-mutations",function(){sync({waitFor:__c8Named("Milestone:AllConcurrentEpochVerifiersClosed"),block:EventSet("increment8:block-base",__c8Blocked)});});',
        'bthread("scheduler:increment8-epochs",function(){',
        '  sync({waitFor:__c8Named("Milestone:AllDisjointPatchVerifiersClosed")});',
        '  let remaining={};',
    ]
    for index in range(tasks):
        lines.append(f'  remaining[{q(f"Permit:Increment8:Epoch:{index}")}]=Event({q(f"Permit:Increment8:Epoch:{index}")});')
    lines += [
        '  while(Object.keys(remaining).length){let selected=sync({request:Object.values(remaining)});delete remaining[selected.name];}',
        '});',
        "",
    ]
    verifier_events = []
    for index in range(tasks):
        title = f"increment8_task_{index}_title"
        description = f"increment8_task_{index}_description"
        epoch_id = f"increment8-task-{index}"
        verifier = f"ConcurrentEpochVerifierClosed:Task:{index}"
        verifier_events.append(verifier)
        lines += [
            f'bthread({q(f"increment8:task:{index}:concurrent-epoch")},function(){{',
            f'  let task=sync({{waitFor:__c8Named({q(f"State:TaskReady:{index}")})}}).data||{{}};',
            f'  sync({{waitFor:__c8Named({q(f"VerifierClosed:TaskCreate:{index}")})}});',
            '  sync({waitFor:__c8Named("Milestone:AllDisjointPatchVerifiersClosed")});',
            f'  sync({{waitFor:__c8Named({q(f"Permit:Increment8:Epoch:{index}")})}});',
            f'  let epochId={q(epoch_id)};',
            f'  let titleOp={{operation_id:epochId+"-title",method:"PATCH",path:"/tasks/"+task.id,headers:{{"Content-Type":"application/merge-patch+json"}},body:{{title:{q(title)}}}}};',
            f'  let descriptionOp={{operation_id:epochId+"-description",method:"PATCH",path:"/tasks/"+task.id,headers:{{"Content-Type":"application/merge-patch+json"}},body:{{description:{q(description)}}}}};',
            f'  sync({{request:Event("ConcurrentEpochDeclared",{{epoch_id:epochId,width:2,task_id:task.id,hazard:"disjoint-write-write"}})}});',
            '  sync({request:Event("ConcurrentOperationRegistered",titleOp)});',
            '  sync({request:Event("ConcurrentOperationRegistered",descriptionOp)});',
            '  sync({request:Event("ConcurrentEpochRelease",{epoch_id:epochId})});',
            '  let result=__c8Execute({epoch_id:epochId,operations:[titleOp,descriptionOp]});',
            '  sync({request:Event("ConcurrentEpochJoined",{epoch_id:epochId,result:result})});',
            '  sync({request:Event("ConcurrentEpochObserve",{epoch_id:epochId,task_id:task.id})});',
            '  svc.get("/tasks/"+task.id,{expectedResponseCodes:[200]});',
            f'  sync({{request:Event({q(verifier)},{{epoch_id:epochId,task_id:task.id}})}});',
            '});',
            "",
        ]
    lines += [
        'bthread("coordinator:increment8-verifiers-closed",function(){',
        '  let pending={};',
    ]
    for event in verifier_events:
        lines.append(f'  pending[{q(event)}]=__c8Named({q(event)});')
    lines += [
        '  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}',
        '  sync({request:Event("Milestone:AllConcurrentEpochVerifiersClosed")});',
        '});',
    ]
    return "\n".join(lines) + "\n", verifier_events


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--openapi", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--tasks", type=int, default=6)
    parser.add_argument("--adapter-port", type=int, default=3458)
    args = parser.parse_args()
    source = Path(args.openapi)
    spec = json.loads(source.read_text(encoding="utf-8-sig"))
    check_contract(spec)
    text, closed = render(args.tasks, args.adapter_port)
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(text, encoding="utf-8")
    manifest = {
        "schema_version": 1,
        "profile": "provengo-native-true-concurrent-disjoint-patches",
        "source_openapi_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "prefix": "increment8_",
        "expected": {"tasks": args.tasks, "epochs": args.tasks, "width": 2, "patches": 2 * args.tasks, "observations": args.tasks},
        "protocol": {
            "lifecycle": ["ConcurrentEpochDeclared", "ConcurrentOperationRegistered", "ConcurrentEpochRelease", "ConcurrentEpochJoined", "ConcurrentEpochObserve"],
            "decision_owner": "Provengo BP model",
            "transport_role": "barrier release and HTTP only",
        },
        "oracle": {
            "oracle_id": "concurrent-disjoint-patches-both-visible",
            "method": "PATCH",
            "media_type": "application/merge-patch+json",
            "fields": ["title", "description"],
            "require_adapter_overlap": True,
            "require_proxy_overlap": True,
            "expected_witness_count": args.tasks,
        },
        "closed_events": closed,
    }
    Path(args.manifest).write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"output": args.output, "manifest": args.manifest, "epochs": args.tasks, "patches": 2 * args.tasks}, indent=2))


if __name__ == "__main__":
    main()
