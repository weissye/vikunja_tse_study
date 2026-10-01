#!/usr/bin/env python3
"""Validate generated Task lifecycle oracles from an external HTTP trace."""

import argparse
import json
import re
from pathlib import Path


TASK_PATH = re.compile(r"^/tasks/(\d+)$")


def load_trace(path):
    events = []
    decoder = json.JSONDecoder()
    text = Path(path).read_text(encoding="utf-8-sig").replace("\x00", "")
    for line_number, line in enumerate(text.splitlines(), 1):
        remaining = line.strip().lstrip("\ufeff")
        while remaining:
            try:
                event, end = decoder.raw_decode(remaining)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Malformed trace at line {line_number}, column {exc.colno}") from exc
            if not isinstance(event, dict) or not {"method", "model_path", "status"}.issubset(event):
                raise ValueError(f"Invalid trace event at line {line_number}")
            event["_index"] = len(events)
            events.append(event)
            remaining = remaining[end:].strip()
    return events


def request_body(event):
    for key in ("request", "request_body"):
        if isinstance(event.get(key), dict):
            return event[key]
    return {}


def response_body(event):
    return event.get("response") if isinstance(event.get("response"), dict) else {}


def task_id_from_path(event):
    match = TASK_PATH.match(str(event.get("model_path", "")))
    return int(match.group(1)) if match else None


def next_read(events, start, task_id, before_methods=()):
    path = f"/tasks/{task_id}"
    for event in events[start + 1:]:
        if event.get("model_path") != path:
            continue
        method = str(event.get("method", "")).upper()
        if method in before_methods:
            return None, "superseded-before-observation"
        if method == "GET":
            return event, None
    return None, "observation-not-found"


def witness(oracle_id, trigger, observation, expected, observed, result, reason=None):
    value = {
        "oracle_id": oracle_id,
        "trigger_event": trigger.get("_index"),
        "observation_event": observation.get("_index") if observation else None,
        "resource_id": response_body(trigger).get("id") if oracle_id == "task-create-visibility" else task_id_from_path(trigger),
        "expected": expected,
        "observed": observed,
        "result": result,
    }
    if reason:
        value["reason"] = reason
    return value


def evaluate(events, manifest, expected_instances=None):
    by_id = {x["oracle_id"]: x for x in manifest.get("oracles", [])}
    required = {"task-create-visibility", "task-update-persistence", "task-delete-absence"}
    if set(by_id) != required:
        raise ValueError("Manifest must contain exactly the three Increment-1 Task oracles")

    witnesses = []
    for event in events:
        method = str(event.get("method", "")).upper()
        path = str(event.get("model_path", ""))
        status = event.get("status")

        if method == "POST" and re.match(r"^/projects/\d+/tasks$", path) and status in by_id["task-create-visibility"]["trigger"]["success_statuses"]:
            task_id = response_body(event).get("id")
            if not isinstance(task_id, int):
                witnesses.append(witness("task-create-visibility", event, None, {}, {}, "INCONCLUSIVE", "created-id-not-observable"))
                continue
            observation, reason = next_read(events, event["_index"], task_id, ("PUT", "PATCH", "DELETE"))
            expected = {"id": task_id, "title": request_body(event).get("title")}
            observed = response_body(observation) if observation else {}
            if not observation:
                result = "INCONCLUSIVE"
            elif observation.get("status") not in by_id["task-create-visibility"]["observation"]["success_statuses"]:
                result, reason = "VIOLATED", "created-resource-not-readable"
            elif observed.get("id") != task_id or (expected["title"] is not None and observed.get("title") != expected["title"]):
                result, reason = "VIOLATED", "created-state-mismatch"
            else:
                result, reason = "PASS", None
            witnesses.append(witness("task-create-visibility", event, observation, expected, {"id": observed.get("id"), "title": observed.get("title")}, result, reason))

        elif method == "PUT" and TASK_PATH.match(path) and status in by_id["task-update-persistence"]["trigger"]["success_statuses"]:
            task_id = task_id_from_path(event)
            observation, reason = next_read(events, event["_index"], task_id, ("PUT", "PATCH", "DELETE"))
            expected = {k: v for k, v in request_body(event).items() if k in ("title", "done")}
            observed_body = response_body(observation) if observation else {}
            observed = {k: observed_body.get(k) for k in expected}
            if not expected:
                result, reason = "INCONCLUSIVE", "no-stable-written-fields"
            elif not observation:
                result = "INCONCLUSIVE"
            elif observation.get("status") not in by_id["task-update-persistence"]["observation"]["success_statuses"]:
                result, reason = "VIOLATED", "updated-resource-not-readable"
            elif any(observed.get(k) != v for k, v in expected.items()):
                result, reason = "VIOLATED", "updated-state-mismatch"
            else:
                result, reason = "PASS", None
            witnesses.append(witness("task-update-persistence", event, observation, expected, observed, result, reason))

        elif method == "DELETE" and TASK_PATH.match(path) and status in by_id["task-delete-absence"]["trigger"]["success_statuses"]:
            task_id = task_id_from_path(event)
            observation, reason = next_read(events, event["_index"], task_id)
            observed = {"status": observation.get("status") if observation else None}
            if not observation:
                result = "INCONCLUSIVE"
            elif observation.get("status") in by_id["task-delete-absence"]["observation"]["absence_statuses"]:
                result, reason = "PASS", None
            else:
                result, reason = "VIOLATED", "deleted-resource-still-accessible"
            witnesses.append(witness("task-delete-absence", event, observation, {"status": 404}, observed, result, reason))

    summaries = {}
    for oracle_id in sorted(required):
        group = [x for x in witnesses if x["oracle_id"] == oracle_id]
        counts = {state: sum(x["result"] == state for x in group) for state in ("PASS", "VIOLATED", "INCONCLUSIVE")}
        missing = max(0, expected_instances - len(group)) if expected_instances is not None else 0
        status = "NOT_EXERCISED" if not group else ("VIOLATED" if counts["VIOLATED"] else ("INCONCLUSIVE" if counts["INCONCLUSIVE"] or missing else "PASS"))
        summaries[oracle_id] = {"status": status, "witness_count": len(group), "expected_witness_count": expected_instances, "missing_witness_count": missing, "counts": counts}

    run_status = "SEMANTIC_ANOMALY" if any(x["status"] == "VIOLATED" for x in summaries.values()) else (
        "INCONCLUSIVE" if any(x["status"] in ("INCONCLUSIVE", "NOT_EXERCISED") for x in summaries.values()) else "PASS"
    )
    return {
        "profile": "verified-task-lifecycle",
        "evaluation_basis": "external HTTP trace plus generated oracle manifest",
        "run_status": run_status,
        "confirmed_product_bug": False,
        "oracle_summary": summaries,
        "witnesses": witnesses,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--expected-instances", type=int)
    args = parser.parse_args()
    result = evaluate(load_trace(args.trace), json.loads(Path(args.manifest).read_text(encoding="utf-8-sig")), args.expected_instances)
    text = json.dumps(result, indent=2, sort_keys=True)
    Path(args.output).write_text(text + "\n", encoding="utf-8")
    print(text)
    raise SystemExit(0 if result["run_status"] == "PASS" else 2)


if __name__ == "__main__":
    main()
