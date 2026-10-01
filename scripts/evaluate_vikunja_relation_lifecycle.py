#!/usr/bin/env python3
"""Evaluate externally observable witnesses for the task-relation lifecycle."""
import argparse
import json
from pathlib import Path


def load(path):
    events = [json.loads(line) for line in Path(path).read_text(encoding="utf-8-sig").splitlines() if line.strip()]
    for index, event in enumerate(events):
        event["_i"] = index
    return events


def find(events, method, path, codes, after=-1):
    return next((e for e in events if e["_i"] > after and e.get("method") == method
                 and e.get("model_path") == path and e.get("status") in codes), None)


def created_id(event):
    response = event.get("response", {}) if event else {}
    return response.get("id") if isinstance(response, dict) else None


def relation_targets(response):
    """Return every task ID represented below the response's related_tasks field."""
    if not isinstance(response, dict):
        return set()
    root = response.get("related_tasks")
    found = set()
    def walk(value):
        if isinstance(value, dict):
            if isinstance(value.get("id"), int):
                found.add(value["id"])
            for nested in value.values():
                walk(nested)
        elif isinstance(value, list):
            for nested in value:
                walk(nested)
    walk(root)
    return found


def evaluate(events):
    project_create = find(events, "POST", "/projects", {200, 201})
    project_id = created_id(project_create)
    project_read = find(events, "GET", f"/projects/{project_id}", {200}) if project_id else None

    task_creates = [e for e in events if e.get("method") == "POST"
                    and e.get("model_path") == f"/projects/{project_id}/tasks"
                    and e.get("status") in (200, 201)] if project_id else []
    task_a_id = created_id(task_creates[0]) if len(task_creates) > 0 else None
    task_b_id = created_id(task_creates[1]) if len(task_creates) > 1 else None
    task_a_read = find(events, "GET", f"/tasks/{task_a_id}", {200}, task_creates[0]["_i"]) if task_a_id else None
    task_b_read = find(events, "GET", f"/tasks/{task_b_id}", {200}, task_creates[1]["_i"]) if task_b_id else None

    relation_path = f"/tasks/{task_a_id}/relations"
    relation_create = find(events, "POST", relation_path, {200, 201}) if task_a_id else None
    observe_a = find(events, "GET", f"/tasks/{task_a_id}", {200}, relation_create["_i"] if relation_create else -1) if task_a_id else None
    observe_b = find(events, "GET", f"/tasks/{task_b_id}", {200}, observe_a["_i"] if observe_a else -1) if task_b_id else None

    update = find(events, "PUT", f"/tasks/{task_a_id}", {200}, observe_b["_i"] if observe_b else -1) if task_a_id else None
    after_update = find(events, "GET", f"/tasks/{task_a_id}", {200}, update["_i"] if update else -1) if task_a_id else None
    request = update.get("request", {}) if update and isinstance(update.get("request"), dict) else {}
    response = after_update.get("response", {}) if after_update and isinstance(after_update.get("response"), dict) else {}
    update_fields = {k: v for k, v in request.items() if k in ("done", "title")}
    update_persisted = bool(update_fields and all(response.get(k) == v for k, v in update_fields.items()))

    delete_relation = next((e for e in events if e["_i"] > (after_update["_i"] if after_update else -1)
                            and e.get("method") == "DELETE" and e.get("status") in (200, 204)
                            and str(e.get("model_path", "")).startswith(relation_path + "/")), None)
    unlinked_a = find(events, "GET", f"/tasks/{task_a_id}", {200}, delete_relation["_i"] if delete_relation else -1) if task_a_id else None
    unlinked_b = find(events, "GET", f"/tasks/{task_b_id}", {200}, unlinked_a["_i"] if unlinked_a else -1) if task_b_id else None
    recreate = find(events, "POST", relation_path, {200, 201}, unlinked_b["_i"] if unlinked_b else -1) if task_a_id else None
    task_b_delete = find(events, "DELETE", f"/tasks/{task_b_id}", {200, 204}, recreate["_i"] if recreate else -1) if task_b_id else None
    survivor_read = find(events, "GET", f"/tasks/{task_a_id}", {200}, task_b_delete["_i"] if task_b_delete else -1) if task_a_id else None
    task_a_delete = find(events, "DELETE", f"/tasks/{task_a_id}", {200, 204}, survivor_read["_i"] if survivor_read else -1) if task_a_id else None
    project_delete = find(events, "DELETE", f"/projects/{project_id}", {200, 204}, task_a_delete["_i"] if task_a_delete else -1) if project_id else None

    probes = {
        "task_a": find(events, "GET", f"/tasks/{task_a_id}", {404}, task_a_delete["_i"] if task_a_delete else -1) if task_a_id else None,
        "task_b": find(events, "GET", f"/tasks/{task_b_id}", {404}, task_b_delete["_i"] if task_b_delete else -1) if task_b_id else None,
        "project": find(events, "GET", f"/projects/{project_id}", {404}, project_delete["_i"] if project_delete else -1) if project_id else None,
    }
    witnesses = {
        "01_project_created": project_id is not None,
        "02_project_read": project_read is not None,
        "03_task_a_created": task_a_id is not None,
        "04_task_a_read": task_a_read is not None,
        "05_task_b_created": task_b_id is not None,
        "06_task_b_read": task_b_read is not None,
        "07_relation_created": relation_create is not None,
        "08_relation_observable_from_a": bool(observe_a and task_b_id in relation_targets(observe_a.get("response"))),
        "09_relation_observable_from_b": bool(observe_b and task_a_id in relation_targets(observe_b.get("response"))),
        "10_task_updated": update is not None,
        "11_update_persisted": update_persisted,
        "12_relation_survived_update": bool(after_update and task_b_id in relation_targets(after_update.get("response"))),
        "13_relation_deleted": delete_relation is not None,
        "14_relation_absent_from_a": bool(unlinked_a and task_b_id not in relation_targets(unlinked_a.get("response"))),
        "15_relation_absent_from_b": bool(unlinked_b and task_a_id not in relation_targets(unlinked_b.get("response"))),
        "16_relation_recreated": recreate is not None,
        "17_task_b_deleted": task_b_delete is not None,
        "18_no_dangling_relation": bool(survivor_read and task_b_id not in relation_targets(survivor_read.get("response"))),
        "19_task_a_deleted": task_a_delete is not None,
        "20_project_deleted": project_delete is not None,
        "21_deletions_observable": all(probes.values()),
    }
    return {
        "profile": "validated-relation-lifecycle",
        "evaluation_basis": "external redacted HTTP trace",
        "event_count": len(events),
        "observed_ids": {"project_id": project_id, "task_a_id": task_a_id, "task_b_id": task_b_id},
        "persisted_update_fields": update_fields,
        "witnesses": witnesses,
        "passed_count": sum(witnesses.values()),
        "required_count": len(witnesses),
        "phase3b_pilot_passed": all(witnesses.values()),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--output")
    args = parser.parse_args()
    result = evaluate(load(args.trace))
    text = json.dumps(result, indent=2, sort_keys=True)
    print(text)
    if args.output:
        Path(args.output).write_text(text + "\n", encoding="utf-8")
    raise SystemExit(0 if result["phase3b_pilot_passed"] else 2)


if __name__ == "__main__":
    main()
