#!/usr/bin/env python3
"""Evaluate the first Vikunja run from its external, redacted HTTP trace."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


def _events(path: Path) -> List[Dict[str, Any]]:
    result = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"Invalid JSONL at line {line_number}: {exc}") from exc
        if isinstance(event, dict):
            result.append(event)
    return result


def _id(value: Any) -> Optional[int]:
    if isinstance(value, dict) and isinstance(value.get("id"), int):
        return value["id"]
    return None


def _first(events: Iterable[Dict[str, Any]], method: str, prefix: str,
           statuses: set[int]) -> Optional[Dict[str, Any]]:
    return next((event for event in events
                 if event.get("method") == method
                 and str(event.get("model_path", "")).startswith(prefix)
                 and event.get("status") in statuses), None)


def evaluate(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    project_create = _first(events, "POST", "/projects", {200, 201})
    label_create = _first(events, "POST", "/labels", {200, 201})
    project_id = _id(project_create.get("response")) if project_create else None
    label_id = _id(label_create.get("response")) if label_create else None

    task_create = None
    if project_id is not None:
        task_create = _first(events, "POST", f"/projects/{project_id}/tasks", {200, 201})
    task_id = _id(task_create.get("response")) if task_create else None

    attach = None
    detach = None
    if task_id is not None and label_id is not None:
        for event in events:
            path = str(event.get("model_path", ""))
            if (event.get("method") == "POST" and path == f"/tasks/{task_id}/labels"
                    and event.get("status") in {200, 201}
                    and isinstance(event.get("request"), dict)
                    and event["request"].get("label_id") == label_id):
                attach = event
                break
        detach = _first(events, "DELETE", f"/tasks/{task_id}/labels/{label_id}", {200, 204})

    required_checks = {
        "project_created": project_id is not None,
        "task_created_under_created_project": task_id is not None,
        "label_created": label_id is not None,
        "created_label_attached_to_created_task": attach is not None,
    }
    diagnostic_checks = {
        # Attach and detach are independent generated action stories, so their
        # relative schedule is intentionally unconstrained.  A successful
        # detach is recorded but is not a smoke-pass prerequisite.
        "created_label_detached_from_created_task": detach is not None,
    }
    statuses: Dict[str, int] = {}
    for event in events:
        key = str(event.get("status"))
        statuses[key] = statuses.get(key, 0) + 1

    return {
        "evaluation_basis": "external redacted HTTP trace",
        "event_count": len(events),
        "required_checks": required_checks,
        "diagnostic_checks": diagnostic_checks,
        "passed_count": sum(required_checks.values()),
        "required_count": len(required_checks),
        "smoke_passed": all(required_checks.values()),
        "observed_ids": {
            "project_id": project_id,
            "task_id": task_id,
            "label_id": label_id,
        },
        "status_histogram": dict(sorted(statuses.items())),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--output")
    args = parser.parse_args()

    result = evaluate(_events(Path(args.trace)))
    text = json.dumps(result, indent=2, sort_keys=True)
    if args.output:
        Path(args.output).write_text(text + "\n", encoding="utf-8")
    print(text)
    raise SystemExit(0 if result["smoke_passed"] else 2)


if __name__ == "__main__":
    main()
