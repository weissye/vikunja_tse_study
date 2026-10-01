#!/usr/bin/env python3
"""Generate OpenAPI-grounded BP stories for disjoint-field task updates."""
import argparse
import hashlib
import json
from pathlib import Path

REQUIRED = {("PUT", "/tasks/{task}"), ("GET", "/tasks/{task}")}


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
        raise ValueError(f"Required disjoint-update operations missing: {missing}")
    schema = spec["components"]["schemas"]["TaskReadOneBody"]
    fields = schema.get("properties", {})
    for field in ("title", "description"):
        if field not in fields or fields[field].get("readOnly") is True:
            raise ValueError(f"Writable Task field is missing: {field}")


def render(tasks):
    lines = [
        "// GENERATED INCREMENT 7 DISJOINT-UPDATE STORIES -- OpenAPI grounded",
        'function __c7Named(n){return EventSet("increment7:"+n,function(e){return e.name===n;});}',
        'function __c7Blocked(e){return e.name==="Intent:UpdateProject"||e.name==="Milestone:AuxReadyForMutation"||e.name==="MultiResourceVerifiedActionsComplete";}',
        'bthread("constraint:increment7-before-base-mutations",function(){sync({waitFor:__c7Named("Milestone:AllDisjointUpdateVerifiersClosed"),block:EventSet("increment7:block-base",__c7Blocked)});});',
        "",
    ]
    verifier_closed = []
    for index in range(tasks):
        title = f"increment7_task_{index}_title"
        description = f"increment7_task_{index}_description"
        ready = f"State:TaskReady:{index}"
        created = f"VerifierClosed:TaskCreate:{index}"
        title_closed = f"DisjointWriteClosed:Task:{index}:title"
        description_closed = f"DisjointWriteClosed:Task:{index}:description"
        verifier = f"DisjointVerifierClosed:Task:{index}"
        verifier_closed.append(verifier)
        for field, value, closed in (
            ("title", title, title_closed),
            ("description", description, description_closed),
        ):
            lines += [
                f'bthread({q(f"increment7:task:{index}:{field}")},function(){{',
                f'  let task=sync({{waitFor:__c7Named({q(ready)})}}).data||{{}};',
                f'  sync({{waitFor:__c7Named({q(created)})}});',
                '  sync({waitFor:__c7Named("Milestone:AllConflictVerifiersClosed")});',
                f'  sync({{request:Event({q(f"Permit:Increment7:Task:{index}:{field}")})}});',
                f'  sync({{request:Event({q(f"Intent:Increment7:Task:{index}:{field}")})}});',
                f'  svc.put("/tasks/"+task.id,{{body:JSON.stringify({{{field}:{q(value)}}}),expectedResponseCodes:[200]}});',
                f'  sync({{request:Event({q(closed)})}});',
                "});",
                "",
            ]
        lines += [
            f'bthread({q(f"increment7:task:{index}:verifier")},function(){{',
            f'  let task=sync({{waitFor:__c7Named({q(ready)})}}).data||{{}};',
            "  let pending={};",
            f'  pending[{q(title_closed)}]=__c7Named({q(title_closed)});',
            f'  pending[{q(description_closed)}]=__c7Named({q(description_closed)});',
            "  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}",
            f'  svc.get("/tasks/"+task.id,{{expectedResponseCodes:[200]}});',
            f'  sync({{request:Event({q(verifier)})}});',
            "});",
            "",
        ]
    lines += [
        'bthread("coordinator:increment7-verifiers-closed",function(){',
        "  let pending={};",
    ]
    for event in verifier_closed:
        lines.append(f"  pending[{q(event)}]=__c7Named({q(event)});")
    lines += [
        "  while(Object.keys(pending).length){let e=sync({waitFor:Object.values(pending)});if(pending[e.name])delete pending[e.name];}",
        '  sync({request:Event("Milestone:AllDisjointUpdateVerifiersClosed")});',
        "});",
    ]
    return "\n".join(lines) + "\n", verifier_closed


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--openapi", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--tasks", type=int, default=6)
    args = parser.parse_args()
    source = Path(args.openapi)
    spec = json.loads(source.read_text(encoding="utf-8-sig"))
    check_contract(spec)
    text, closed = render(args.tasks)
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(text, encoding="utf-8")
    manifest = {
        "schema_version": 1,
        "profile": "disjoint-field-update-commutativity",
        "source_openapi_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "prefix": "increment7_",
        "expected": {
            "tasks": args.tasks,
            "disjoint_writes": 2 * args.tasks,
            "verifier_reads": args.tasks,
            "witnesses": args.tasks,
        },
        "oracle": {
            "oracle_id": "task-disjoint-updates-both-visible",
            "fields": ["title", "description"],
            "expected_witness_count": args.tasks,
        },
        "closed_events": closed,
    }
    Path(args.manifest).write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"output": args.output, "manifest": args.manifest, "disjoint_writes": 2 * args.tasks}, indent=2))


if __name__ == "__main__":
    main()
