#!/usr/bin/env python3
"""External validator for generated Task, Project and Label verifiers."""

import argparse
import json
import re
from pathlib import Path


ITEM = re.compile(r"^/(tasks|projects|labels)/(\d+)$")
CREATE = {
    "task": re.compile(r"^/projects/\d+/tasks$"),
    "project": re.compile(r"^/projects$"),
    "label": re.compile(r"^/labels$"),
}


def load_trace(path):
    events, decoder = [], json.JSONDecoder()
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


def is_generated_incremental_write(event):
    """Increment 6/7 writes are evaluated by their dedicated trace oracles."""
    return any(isinstance(value, str) and value.startswith(("conflict6_", "increment7_"))
               for value in request_body(event).values())


def item(event):
    match = ITEM.match(str(event.get("model_path", "")))
    if not match:
        return None, None
    singular = {"tasks": "task", "projects": "project", "labels": "label"}[match.group(1)]
    return singular, int(match.group(2))


def next_read(events, start, resource, resource_id, before_methods=()):
    path = f"/{resource}s/{resource_id}"
    for event in events[start + 1:]:
        if event.get("model_path") != path:
            continue
        method = str(event.get("method", "")).upper()
        if method in before_methods:
            return None, "superseded-before-observation"
        if method == "GET":
            return event, None
    return None, "observation-not-found"


def make_witness(oracle_id, resource, resource_id, trigger, observation,
                 expected, observed, result, reason=None):
    value = {"oracle_id": oracle_id, "resource": resource, "resource_id": resource_id,
             "trigger_event": trigger.get("_index"),
             "observation_event": observation.get("_index") if observation else None,
             "expected": expected, "observed": observed, "result": result}
    if reason:
        value["reason"] = reason
    return value


def evaluate(events, manifest, expected):
    # Keep evaluate() directly unit-testable; load_trace() already supplies
    # these immutable sequence indices for real executions.
    for index, event in enumerate(events):
        event.setdefault("_index", index)
    by_id = {x["oracle_id"]: x for x in manifest.get("oracles", [])}
    required = {f"{resource}-{phase}" for resource in ("task", "project", "label")
                for phase in ("create-visibility", "update-persistence", "delete-absence")}
    if set(by_id) != required:
        raise ValueError("Manifest must contain exactly nine Increment-3 resource oracles")
    visible_before_delete = set()
    witnesses = []
    for event in events:
        method, path, status = str(event.get("method", "")).upper(), str(event.get("model_path", "")), event.get("status")
        resource, resource_id = item(event)
        if method == "GET" and resource and 200 <= int(status) < 300:
            visible_before_delete.add((resource, resource_id))

        create_resource = next((r for r, pattern in CREATE.items() if method == "POST" and pattern.match(path)), None)
        if create_resource:
            oracle_id = f"{create_resource}-create-visibility"
            if status not in by_id[oracle_id]["trigger"]["success_statuses"]:
                continue
            resource_id = response_body(event).get("id")
            if not isinstance(resource_id, int):
                witnesses.append(make_witness(oracle_id, create_resource, resource_id, event, None, {}, {}, "INCONCLUSIVE", "created-id-not-observable"))
                continue
            observation, reason = next_read(events, event["_index"], create_resource, resource_id, ("PUT", "PATCH", "DELETE"))
            expected_value = {"id": resource_id, "title": request_body(event).get("title")}
            body = response_body(observation) if observation else {}
            observed = {"id": body.get("id"), "title": body.get("title")}
            if not observation:
                result = "INCONCLUSIVE"
            elif observation.get("status") not in by_id[oracle_id]["observation"]["success_statuses"]:
                result, reason = "VIOLATED", "created-resource-not-readable"
            elif observed["id"] != resource_id or (expected_value["title"] is not None and observed["title"] != expected_value["title"]):
                result, reason = "VIOLATED", "created-state-mismatch"
            else:
                result, reason = "PASS", None
            witnesses.append(make_witness(oracle_id, create_resource, resource_id, event, observation, expected_value, observed, result, reason))
            continue

        if method == "PUT" and resource:
            # Later incremental writes have dedicated trace-order oracles.
            # Excluding them here preserves the original positive witnesses.
            if is_generated_incremental_write(event):
                continue
            oracle_id = f"{resource}-update-persistence"
            if status not in by_id[oracle_id]["trigger"]["success_statuses"]:
                continue
            fields = next(a["fields"] for a in by_id[oracle_id]["assertions"] if a["type"] == "written_fields_persist")
            expected_value = {k: v for k, v in request_body(event).items() if k in fields}
            observation, reason = next_read(events, event["_index"], resource, resource_id, ("PUT", "PATCH", "DELETE"))
            body = response_body(observation) if observation else {}
            observed = {k: body.get(k) for k in expected_value}
            if not expected_value:
                result, reason = "INCONCLUSIVE", "no-stable-written-fields"
            elif not observation:
                result = "INCONCLUSIVE"
            elif observation.get("status") not in by_id[oracle_id]["observation"]["success_statuses"]:
                result, reason = "VIOLATED", "updated-resource-not-readable"
            elif any(observed[k] != value for k, value in expected_value.items()):
                result, reason = "VIOLATED", "updated-state-mismatch"
            else:
                result, reason = "PASS", None
            witnesses.append(make_witness(oracle_id, resource, resource_id, event, observation, expected_value, observed, result, reason))
            continue

        if method == "DELETE" and resource:
            oracle_id = f"{resource}-delete-absence"
            if status not in by_id[oracle_id]["trigger"]["success_statuses"]:
                continue
            observation, reason = next_read(events, event["_index"], resource, resource_id)
            observed_status = observation.get("status") if observation else None
            accepted = by_id[oracle_id]["observation"]["absence_statuses"]
            if not observation:
                result = "INCONCLUSIVE"
            elif observed_status not in accepted:
                result, reason = "VIOLATED", "deleted-resource-still-accessible"
            elif resource == "label" and observed_status == 403 and (resource, resource_id) not in visible_before_delete:
                result, reason = "INCONCLUSIVE", "label-403-without-predelete-visibility"
            else:
                result, reason = "PASS", None
            witnesses.append(make_witness(oracle_id, resource, resource_id, event, observation,
                                          {"status_in": accepted}, {"status": observed_status}, result, reason))

    summaries = {}
    for oracle_id in sorted(required):
        resource = oracle_id.split("-", 1)[0]
        expected_count = int(expected[resource])
        group = [x for x in witnesses if x["oracle_id"] == oracle_id]
        counts = {state: sum(x["result"] == state for x in group) for state in ("PASS", "VIOLATED", "INCONCLUSIVE")}
        missing = max(0, expected_count - len(group))
        status = "NOT_EXERCISED" if not group else ("VIOLATED" if counts["VIOLATED"] else ("INCONCLUSIVE" if counts["INCONCLUSIVE"] or missing else "PASS"))
        summaries[oracle_id] = {"status": status, "witness_count": len(group),
                                "expected_witness_count": expected_count,
                                "missing_witness_count": missing, "counts": counts}
    run_status = "SEMANTIC_ANOMALY" if any(x["status"] == "VIOLATED" for x in summaries.values()) else (
        "INCONCLUSIVE" if any(x["status"] != "PASS" for x in summaries.values()) else "PASS")
    return {"profile": "verified-resource-lifecycles",
            "evaluation_basis": "external HTTP trace plus generated oracle manifest",
            "run_status": run_status, "confirmed_product_bug": False,
            "oracle_summary": summaries, "witnesses": witnesses}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--expected-tasks", type=int, required=True)
    parser.add_argument("--expected-projects", type=int, default=1)
    parser.add_argument("--expected-labels", type=int, required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    result = evaluate(load_trace(args.trace), json.loads(Path(args.manifest).read_text(encoding="utf-8-sig")),
                      {"task": args.expected_tasks, "project": args.expected_projects, "label": args.expected_labels})
    text = json.dumps(result, indent=2, sort_keys=True)
    Path(args.output).write_text(text + "\n", encoding="utf-8")
    print(text)
    raise SystemExit(0 if result["run_status"] == "PASS" else 2)


if __name__ == "__main__":
    main()
