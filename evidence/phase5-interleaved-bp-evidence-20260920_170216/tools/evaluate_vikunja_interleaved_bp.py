#!/usr/bin/env python3
"""External HTTP-trace oracle for the interleaved BP relation profile."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def load_trace(path: str) -> list[dict]:
    events = [json.loads(line) for line in Path(path).read_text(encoding="utf-8-sig").splitlines() if line.strip()]
    for index, event in enumerate(events):
        event["_index"] = index
    return events


def response_id(event: dict | None):
    response = event.get("response") if event else None
    return response.get("id") if isinstance(response, dict) else None


def request_body(event: dict) -> dict:
    value = event.get("request")
    if isinstance(value, dict):
        return value
    value = event.get("request_body")
    return value if isinstance(value, dict) else {}


def relation_map(response) -> dict[str, set[int]]:
    related = response.get("related_tasks", {}) if isinstance(response, dict) else {}
    result: dict[str, set[int]] = {}
    if isinstance(related, dict):
        for kind, tasks in related.items():
            if isinstance(tasks, list):
                result[kind] = {
                    task["id"] for task in tasks
                    if isinstance(task, dict) and isinstance(task.get("id"), int)
                }
    return result


def evaluate(events: list[dict], expected_tasks: int,
             profile: str = "interleaved-relational-lifecycle") -> dict:
    anomalies: list[dict] = []
    project_create = next((e for e in events if e.get("method") == "POST"
                           and e.get("model_path") == "/projects"
                           and e.get("status") in (200, 201)), None)
    project_id = response_id(project_create)
    task_creates = [e for e in events if e.get("method") == "POST"
                    and str(e.get("model_path", "")).startswith(f"/projects/{project_id}/tasks")
                    and e.get("status") in (200, 201)] if project_id is not None else []
    task_ids = [response_id(e) for e in task_creates]
    task_ids = [value for value in task_ids if isinstance(value, int)]
    expected_relations = max(0, expected_tasks - 1)

    relation_creates = [e for e in events if e.get("method") == "POST"
                        and "/relations" in str(e.get("model_path", ""))
                        and e.get("status") in (200, 201)]
    initial_relations = relation_creates[:expected_relations]
    recreated_relations = relation_creates[expected_relations:]
    observed_initial = 0
    for create in initial_relations:
        response = create.get("response", {})
        source = response.get("task_id") if isinstance(response, dict) else None
        target = response.get("other_task_id") if isinstance(response, dict) else None
        kind = response.get("relation_kind") if isinstance(response, dict) else None
        delete_index = next((e["_index"] for e in events[create["_index"] + 1:]
                             if e.get("method") == "DELETE"
                             and "/relations/" in str(e.get("model_path", ""))
                             and str(source) in str(e.get("model_path", ""))
                             and str(target) in str(e.get("model_path", ""))), len(events))
        reads = [e for e in events if create["_index"] < e["_index"] < delete_index
                 and e.get("method") == "GET" and e.get("status") == 200]
        source_read = next((e for e in reads if e.get("model_path") == f"/tasks/{source}"
                            and target in relation_map(e.get("response", {})).get(kind, set())), None)
        target_read = next((e for e in reads if e.get("model_path") == f"/tasks/{target}"
                            and any(source in ids for ids in relation_map(e.get("response", {})).values())), None)
        if source_read and target_read:
            observed_initial += 1
        else:
            anomalies.append({"phase": "initial_relation_observation", "source": source,
                              "target": target, "kind": kind,
                              "source_observed": bool(source_read), "target_observed": bool(target_read)})

    relation_deletes = [e for e in events if e.get("method") == "DELETE"
                        and "/relations/" in str(e.get("model_path", ""))
                        and e.get("status") in (200, 204)]
    unlink_observed = 0
    for delete in relation_deletes:
        parts = str(delete.get("model_path", "")).strip("/").split("/")
        if len(parts) < 5:
            continue
        source, target = parts[1], parts[-1]
        next_create = next((e["_index"] for e in events[delete["_index"] + 1:]
                            if e.get("method") == "POST" and "/relations" in str(e.get("model_path", ""))
                            and e.get("model_path") == f"/tasks/{source}/relations"), len(events))
        read = next((e for e in events if delete["_index"] < e["_index"] < next_create
                     and e.get("method") == "GET" and e.get("model_path") == f"/tasks/{source}"
                     and e.get("status") == 200), None)
        if read and not any(int(target) in ids for ids in relation_map(read.get("response", {})).values()):
            unlink_observed += 1
        else:
            anomalies.append({"phase": "unlink_observation", "source": source, "target": target})

    updates = [e for e in events if e.get("method") == "PUT"
               and str(e.get("model_path", "")).startswith("/tasks/")
               and e.get("status") == 200]
    persisted_updates = 0
    for update in updates:
        read = next((e for e in events[update["_index"] + 1:]
                     if e.get("method") == "GET" and e.get("model_path") == update.get("model_path")
                     and e.get("status") == 200), None)
        requested = {key: value for key, value in request_body(update).items() if key in ("title", "done")}
        response = read.get("response", {}) if read else {}
        if requested and all(response.get(key) == value for key, value in requested.items()):
            persisted_updates += 1
        else:
            anomalies.append({"phase": "update_persistence", "path": update.get("model_path")})

    task_deletes = [e for e in events if e.get("method") == "DELETE"
                    and str(e.get("model_path", "")).startswith("/tasks/")
                    and "/relations/" not in str(e.get("model_path", ""))
                    and e.get("status") in (200, 204)]
    probes = {e.get("model_path") for e in events if e.get("method") == "GET" and e.get("status") == 404}
    expected_probes = {f"/tasks/{task_id}" for task_id in task_ids}
    if project_id is not None:
        expected_probes.add(f"/projects/{project_id}")
    project_deleted = any(e.get("method") == "DELETE" and e.get("model_path") == f"/projects/{project_id}"
                          and e.get("status") in (200, 204) for e in events)
    checks = {
        "project_created": isinstance(project_id, int),
        "all_tasks_created": len(task_ids) == expected_tasks and len(set(task_ids)) == expected_tasks,
        "initial_relation_chain_created": len(initial_relations) == expected_relations,
        "initial_relations_bidirectionally_observed": observed_initial == expected_relations,
        "all_relation_unlinks_executed": len(relation_deletes) == expected_relations,
        "all_relation_unlinks_observed": unlink_observed == expected_relations,
        "alternating_relations_recreated": len(recreated_relations) == (expected_relations + 1) // 2,
        "all_task_updates_executed": len(updates) == expected_tasks,
        "all_task_updates_persisted": persisted_updates == expected_tasks,
        "all_tasks_deleted": len(task_deletes) == expected_tasks,
        "project_deleted": project_deleted,
        "all_deletions_externally_observable": expected_probes.issubset(probes),
        "no_semantic_anomalies": not anomalies,
    }
    return {
        "profile": profile,
        "evaluation_basis": "external redacted HTTP trace",
        "event_count": len(events),
        "expected_tasks": expected_tasks,
        "observed_ids": {"project_id": project_id, "task_ids": task_ids},
        "counts": {"task_creates": len(task_ids), "initial_relation_creates": len(initial_relations),
                   "relation_recreates": len(recreated_relations), "relation_deletes": len(relation_deletes),
                   "updates": len(updates), "task_deletes": len(task_deletes)},
        "checks": checks,
        "anomalies": anomalies,
        "passed_count": sum(checks.values()),
        "required_count": len(checks),
        "phase5_bp_passed": all(checks.values()),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--expected-tasks", type=int, default=8)
    parser.add_argument("--profile", default="interleaved-relational-lifecycle")
    parser.add_argument("--output")
    args = parser.parse_args()
    result = evaluate(load_trace(args.trace), args.expected_tasks, args.profile)
    text = json.dumps(result, indent=2, sort_keys=True)
    print(text)
    if args.output:
        Path(args.output).write_text(text + "\n", encoding="utf-8")
    raise SystemExit(0 if result["phase5_bp_passed"] else 2)


if __name__ == "__main__":
    main()
