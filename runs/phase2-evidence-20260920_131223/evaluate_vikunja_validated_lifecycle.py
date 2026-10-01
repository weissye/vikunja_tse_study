#!/usr/bin/env python3
"""Evaluate the 15 Phase-2 lifecycle witnesses from an external HTTP trace."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Optional


def load_events(path: Path) -> List[Dict[str, Any]]:
    events: List[Dict[str, Any]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"Invalid JSONL at line {line_number}: {exc}") from exc
        if isinstance(item, dict):
            item["_trace_index"] = len(events)
            events.append(item)
    return events


def response_id(event: Optional[Dict[str, Any]]) -> Optional[int]:
    value = event.get("response") if event else None
    return value.get("id") if isinstance(value, dict) and isinstance(value.get("id"), int) else None


def find(events: List[Dict[str, Any]], method: str, path: str, statuses: set[int],
         after: int = -1) -> Optional[Dict[str, Any]]:
    return next((event for event in events
                 if event["_trace_index"] > after
                 and event.get("method") == method
                 and event.get("model_path") == path
                 and event.get("status") in statuses), None)


def listed_ids(response: Any) -> set[int]:
    if isinstance(response, dict):
        values = response.get("items", response.get("labels", []))
    else:
        values = response
    if not isinstance(values, list):
        return set()
    result = set()
    for value in values:
        if not isinstance(value, dict):
            continue
        candidate = value.get("id", value.get("label_id"))
        if isinstance(candidate, int):
            result.add(candidate)
    return result


def evaluate(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    project_create = find(events, "POST", "/projects", {200, 201})
    project_id = response_id(project_create)
    project_read = find(events, "GET", f"/projects/{project_id}", {200}) if project_id else None

    task_create = find(events, "POST", f"/projects/{project_id}/tasks", {200, 201}) if project_id else None
    task_id = response_id(task_create)
    task_read_1 = find(events, "GET", f"/tasks/{task_id}", {200}) if task_id else None
    update = None
    if task_id is not None:
        update = next((event for event in events
                       if event.get("method") in {"PUT", "PATCH"}
                       and event.get("model_path") == f"/tasks/{task_id}"
                       and event.get("status") in {200, 204}), None)
    task_read_2 = find(events, "GET", f"/tasks/{task_id}", {200},
                       update["_trace_index"] if update else -1) if task_id else None

    request = update.get("request") if update and isinstance(update.get("request"), dict) else {}
    persisted_fields = {}
    if task_read_2 and isinstance(task_read_2.get("response"), dict):
        for key, value in request.items():
            if key not in {"id", "project_id", "created_by", "subscription"}:
                persisted_fields[key] = task_read_2["response"].get(key) == value

    label_create = find(events, "POST", "/labels", {200, 201})
    label_id = response_id(label_create)
    label_read = find(events, "GET", f"/labels/{label_id}", {200}) if label_id else None
    attach = find(events, "POST", f"/tasks/{task_id}/labels", {200, 201}) if task_id else None
    attach_correct = bool(attach and isinstance(attach.get("request"), dict)
                          and attach["request"].get("label_id") == label_id)
    list_1 = find(events, "GET", f"/tasks/{task_id}/labels", {200},
                  attach["_trace_index"] if attach else -1) if task_id else None
    detach = find(events, "DELETE", f"/tasks/{task_id}/labels/{label_id}", {200, 204},
                  list_1["_trace_index"] if list_1 else -1) if task_id and label_id else None
    list_2 = find(events, "GET", f"/tasks/{task_id}/labels", {200},
                  detach["_trace_index"] if detach else -1) if task_id else None

    task_delete = find(events, "DELETE", f"/tasks/{task_id}", {200, 204}) if task_id else None
    label_delete = find(events, "DELETE", f"/labels/{label_id}", {200, 204}) if label_id else None
    project_delete = find(events, "DELETE", f"/projects/{project_id}", {200, 204}) if project_id else None
    # Vikunja deliberately maps an inaccessible/deleted label to 403, whereas
    # deleted tasks and projects produce 404.  A label 403 is accepted only
    # after this token read the label successfully and DELETE returned 2xx.
    deletion_probe = bool(task_id and label_id and project_id and label_read and
                          find(events, "GET", f"/tasks/{task_id}", {404},
                               task_delete["_trace_index"] if task_delete else -1) and
                          find(events, "GET", f"/labels/{label_id}", {403, 404},
                               label_delete["_trace_index"] if label_delete else -1) and
                          find(events, "GET", f"/projects/{project_id}", {404},
                               project_delete["_trace_index"] if project_delete else -1))

    witnesses = {
        "01_project_created": project_id is not None,
        "02_project_read": project_read is not None,
        "03_task_created_under_project": task_id is not None,
        "04_task_read": task_read_1 is not None,
        "05_task_updated": update is not None,
        "06_update_persisted": bool(persisted_fields) and all(persisted_fields.values()),
        "07_label_created": label_id is not None,
        "08_label_attached": attach_correct,
        "09_attach_observable": bool(list_1 and label_id in listed_ids(list_1.get("response"))),
        "10_label_detached": detach is not None,
        "11_detach_observable": bool(list_2 and label_id not in listed_ids(list_2.get("response"))),
        "12_task_deleted": task_delete is not None,
        "13_label_deleted": label_delete is not None,
        "14_project_deleted": project_delete is not None,
        "15_deletions_observable": deletion_probe,
    }
    passed = all(witnesses.values())
    return {
        "evaluation_basis": "external redacted HTTP trace",
        "profile": "validated-lifecycle",
        "witnesses": witnesses,
        "passed_count": sum(witnesses.values()),
        "required_count": 15,
        "phase2_passed": passed,
        "observed_ids": {"project_id": project_id, "task_id": task_id, "label_id": label_id},
        "persisted_update_fields": persisted_fields,
        "deletion_observation_policy": {
            "task": [404],
            "project": [404],
            "label": [403, 404],
            "label_403_requires_predelete_read": True,
        },
        "event_count": len(events),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--output")
    args = parser.parse_args()
    result = evaluate(load_events(Path(args.trace)))
    text = json.dumps(result, indent=2, sort_keys=True)
    if args.output:
        Path(args.output).write_text(text + "\n", encoding="utf-8")
    print(text)
    raise SystemExit(0 if result["phase2_passed"] else 2)


if __name__ == "__main__":
    main()
