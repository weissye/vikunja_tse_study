#!/usr/bin/env python3
"""External semantic evaluator for the high-complexity relation-kind campaign."""
import argparse
import json
from pathlib import Path


def load(path):
    events = [json.loads(line) for line in Path(path).read_text(encoding="utf-8-sig").splitlines() if line.strip()]
    for i, event in enumerate(events):
        event["_i"] = i
    return events


def response_id(event):
    response = event.get("response", {}) if event else {}
    return response.get("id") if isinstance(response, dict) else None


def relation_map(response):
    related = response.get("related_tasks", {}) if isinstance(response, dict) else {}
    result = {}
    if not isinstance(related, dict):
        return result
    for kind, tasks in related.items():
        if isinstance(tasks, list):
            for task in tasks:
                if isinstance(task, dict) and isinstance(task.get("id"), int):
                    result.setdefault(kind, set()).add(task["id"])
    return result


def has_target(response, target):
    return any(target in ids for ids in relation_map(response).values())


def evaluate(events):
    anomalies = []
    project_create = next((e for e in events if e.get("method") == "POST" and e.get("model_path") == "/projects"
                           and e.get("status") in (200, 201)), None)
    project_id = response_id(project_create)
    task_creates = [e for e in events if e.get("method") == "POST"
                    and e.get("model_path") == f"/projects/{project_id}/tasks"
                    and e.get("status") in (200, 201)] if project_id else []
    task_ids = [response_id(e) for e in task_creates]
    task_ids = [value for value in task_ids if isinstance(value, int)]
    hub = task_ids[0] if task_ids else None
    spokes = task_ids[1:]

    relation_creates = [e for e in events if e.get("method") == "POST"
                        and e.get("model_path") == f"/tasks/{hub}/relations"
                        and e.get("status") in (200, 201)] if hub else []
    initial_creates = relation_creates[:11]
    kinds = [e.get("request", {}).get("relation_kind") for e in initial_creates]
    other_ids = [e.get("request", {}).get("other_task_id") for e in initial_creates]
    last_initial_create = initial_creates[-1]["_i"] if initial_creates else -1
    first_update = next((e for e in events if e["_i"] > last_initial_create and e.get("method") == "PUT"
                         and str(e.get("model_path", "")).startswith("/tasks/")), None)
    before_update_end = first_update["_i"] if first_update else len(events)
    initial_reads = [e for e in events if last_initial_create < e["_i"] < before_update_end
                     and e.get("method") == "GET" and e.get("status") == 200
                     and str(e.get("model_path", "")).startswith("/tasks/")]
    initial_by_id = {response_id(e): e for e in initial_reads if response_id(e) is not None}
    for kind, spoke in zip(kinds, other_ids):
        hub_read = initial_by_id.get(hub)
        spoke_read = initial_by_id.get(spoke)
        if not hub_read or spoke not in relation_map(hub_read.get("response", {})).get(kind, set()):
            anomalies.append({"phase": "initial_graph", "kind": kind, "edge": [hub, spoke], "side": "hub"})
        if not spoke_read or not has_target(spoke_read.get("response", {}), hub):
            anomalies.append({"phase": "initial_graph", "kind": kind, "edge": [hub, spoke], "side": "inverse"})

    updates = [e for e in events if e.get("method") == "PUT" and str(e.get("model_path", "")).startswith("/tasks/")
               and e.get("status") == 200]
    persisted_updates = 0
    for update in updates:
        follow = next((e for e in events if e["_i"] > update["_i"] and e.get("method") == "GET"
                       and e.get("model_path") == update.get("model_path") and e.get("status") == 200), None)
        request = update.get("request", {}) if isinstance(update.get("request"), dict) else {}
        response = follow.get("response", {}) if follow and isinstance(follow.get("response"), dict) else {}
        fields = {key: value for key, value in request.items() if key in ("done", "title")}
        if fields and all(response.get(key) == value for key, value in fields.items()):
            persisted_updates += 1
        else:
            anomalies.append({"phase": "update", "path": update.get("model_path"), "reason": "not persisted"})

    relation_deletes = [e for e in events if e.get("method") == "DELETE"
                        and "/relations/" in str(e.get("model_path", "")) and e.get("status") in (200, 204)]
    last_relation_delete = relation_deletes[-1]["_i"] if relation_deletes else -1
    recreates = relation_creates[11:]
    first_recreate = recreates[0]["_i"] if recreates else len(events)
    unlinked_reads = [e for e in events if last_relation_delete < e["_i"] < first_recreate
                      and e.get("method") == "GET" and e.get("status") == 200
                      and str(e.get("model_path", "")).startswith("/tasks/")]
    residual = []
    for read in unlinked_reads:
        targets = sorted({value for ids in relation_map(read.get("response", {})).values() for value in ids})
        if targets:
            residual.append({"task": response_id(read), "targets": targets})
    if residual:
        anomalies.append({"phase": "unlink", "residual_relations": residual})

    task_deletes = [e for e in events if e.get("method") == "DELETE" and e.get("status") in (200, 204)
                    and str(e.get("model_path", "")).startswith("/tasks/") and "/relations/" not in str(e.get("model_path", ""))]
    cascade_observations = 0
    for deletion in task_deletes:
        deleted = int(str(deletion["model_path"]).rsplit("/", 1)[-1])
        if deleted == hub:
            continue
        follow = next((e for e in events if e["_i"] > deletion["_i"] and e.get("method") == "GET"
                       and e.get("model_path") == f"/tasks/{hub}" and e.get("status") == 200), None)
        if follow:
            if has_target(follow.get("response", {}), deleted):
                anomalies.append({"phase": "cascade", "deleted_task": deleted, "reason": "dangling relation"})
            else:
                cascade_observations += 1

    probes = [e for e in events if e.get("method") == "GET" and e.get("status") == 404]
    probed_paths = {e.get("model_path") for e in probes}
    expected_probe_paths = {f"/tasks/{task_id}" for task_id in task_ids}
    if project_id:
        expected_probe_paths.add(f"/projects/{project_id}")

    checks = {
        "project_created": project_id is not None,
        "twelve_tasks_created": len(task_ids) == 12 and len(set(task_ids)) == 12,
        "eleven_relation_kinds_created": len(initial_creates) == 11 and len(set(kinds)) == 11,
        "all_relation_targets_distinct": len(other_ids) == 11 and len(set(other_ids)) == 11,
        "initial_graph_bidirectionally_observable": not any(a.get("phase") == "initial_graph" for a in anomalies),
        "four_updates_executed": len(updates) == 4,
        "all_updates_persisted": persisted_updates == len(updates) == 4,
        "eleven_relations_deleted": len(relation_deletes) == 11,
        "all_relations_absent_after_unlink": len(unlinked_reads) == 12 and not residual,
        "six_relations_recreated": len(recreates) == 6,
        "six_cascade_observations_clean": cascade_observations == 6,
        "all_tasks_deleted": len(task_deletes) == 12,
        "project_deleted": any(e.get("method") == "DELETE" and e.get("model_path") == f"/projects/{project_id}"
                               and e.get("status") in (200, 204) for e in events),
        "all_deletions_externally_observable": expected_probe_paths.issubset(probed_paths),
        "no_semantic_anomalies": len(anomalies) == 0,
    }
    return {
        "profile": "relation-kind-campaign",
        "evaluation_basis": "external redacted HTTP trace",
        "event_count": len(events),
        "observed_ids": {"project_id": project_id, "hub_task_id": hub, "spoke_task_ids": spokes},
        "relation_kinds": kinds,
        "counts": {"task_creates": len(task_ids), "initial_relation_creates": len(initial_creates),
                   "updates": len(updates), "relation_deletes": len(relation_deletes),
                   "relation_recreates": len(recreates), "task_deletes": len(task_deletes),
                   "cascade_observations": cascade_observations},
        "checks": checks,
        "passed_count": sum(checks.values()),
        "required_count": len(checks),
        "anomalies": anomalies,
        "campaign_passed": all(checks.values()),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--output")
    args = parser.parse_args()
    result = evaluate(load(args.trace))
    rendered = json.dumps(result, indent=2, sort_keys=True)
    print(rendered)
    if args.output:
        Path(args.output).write_text(rendered + "\n", encoding="utf-8")
    raise SystemExit(0 if result["campaign_passed"] else 2)


if __name__ == "__main__":
    main()
