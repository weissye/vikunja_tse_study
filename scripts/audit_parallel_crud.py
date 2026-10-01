#!/usr/bin/env python3
"""Check generated worker, observer, and dependency topology against its graph."""
import argparse
import json
from pathlib import Path
import re


def audit(story_path, graph_path, processes, instances):
    story = Path(story_path).read_text(encoding="utf-8")
    graph = json.loads(Path(graph_path).read_text(encoding="utf-8"))
    creators = set(graph["nodes"])
    workers = re.findall(r'bthread\("crud:(P\d+):([^"\n]+):(\d+)"', story)
    observers = re.findall(r'bthread\("verify:(P\d+):([^"\n]+):(\d+)"', story)
    lookup_observers = re.findall(r'bthread\("verify-lookup:(P\d+):([^"\n]+):(\d+)"', story)
    expected = {(f"P{p}", entity, str(i)) for p in range(1, processes + 1)
                for entity in creators for i in range(1, instances + 1)}
    assert len(workers) == len(expected) and set(workers) == expected, "wrong worker cardinality"
    assert len(observers) == len(expected) and set(observers) == expected, "missing per-worker verifier"
    assert story.count('SBT:CrudStep') > len(workers), "worker actions are not observed"
    assert story.count('SBT:CrudVerified') > len(observers), "missing verifier acknowledgements"
    assert 'SBT:BindParent' in story and 'SBT_POOL' in story, "no dynamic parent selection"
    assert 'pvg.rtv.set(' in story and '@{sbt_' in story, "server IDs are not bound to RTV"
    assert 'created.code' not in story and 'bound.code' not in story, "sampling inspects runtime HTTP results"
    assert 'pvg.fail(' in story, "runtime callbacks do not reject incorrect HTTP results"
    assert 'SBT:WorkerFinished' in story, "missing deletion/finish barrier"
    assert 'SBT:InstanceReady:' not in story, "an instance-number-specific dependency remains"
    # Verify every inferred edge is respected in each logical process. The
    # parent can be ANY ready instance; its numeric child index is irrelevant.
    for edge in graph["edges"]:
        if edge["source"] not in creators or edge["target"] not in creators:
            continue
        for process in range(1, processes + 1):
            for instance in range(1, instances + 1):
                label = f'crud:P{process}:{edge["source"]}:{instance}'
                start = story.find('bthread(' + json.dumps(label) + ', function() {')
                assert start >= 0, label
                end = story.find('\nbthread(', start + 1)
                worker = story[start:end if end >= 0 else None]
                assert f'{process}:{edge["target"]}' in worker, f'{label} lacks {edge["target"]}'
                assert 'SBT:BindParent' in worker, f'{label} cannot select a parent'
    return {"result": "PASS", "entity_types": len(creators), "dependency_edges": len(graph["edges"]),
            "logical_processes": processes, "instances_per_entity_per_process": instances,
            "crud_bthreads": len(workers), "verifier_bthreads": len(observers),
            "lookup_verifier_bthreads": len(lookup_observers),
            "verified_stage_counts": {stage: story.count('verified("' + stage + '")')
                                      for stage in ('readback', 'create', 'read', 'update', 'delete')}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--stories', required=True)
    parser.add_argument('--graph', required=True)
    parser.add_argument('--processes', required=True, type=int)
    parser.add_argument('--instances', required=True, type=int)
    args = parser.parse_args()
    print(json.dumps(audit(args.stories, args.graph, args.processes, args.instances), indent=2))


if __name__ == '__main__':
    main()
