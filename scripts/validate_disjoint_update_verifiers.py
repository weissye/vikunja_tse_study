#!/usr/bin/env python3
"""External trace oracle for Increment 7 disjoint-field task updates."""
import argparse
import json
import re
from pathlib import Path

TASK = re.compile(r"^/tasks/(\d+)$")


def load(path):
    events = []
    decoder = json.JSONDecoder()
    text = Path(path).read_text(encoding="utf-8-sig").replace("\x00", "")
    for line_number, line in enumerate(text.splitlines(), 1):
        remaining = line.strip().lstrip("\ufeff")
        while remaining:
            try:
                event, end = decoder.raw_decode(remaining)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Malformed trace line {line_number}, column {exc.colno}") from exc
            if not isinstance(event, dict) or not {"method", "model_path", "status"}.issubset(event):
                raise ValueError(f"Invalid trace event at line {line_number}")
            event["_index"] = len(events)
            events.append(event)
            remaining = remaining[end:].strip()
    return events


def request(event):
    for key in ("request", "request_body"):
        if isinstance(event.get(key), dict):
            return event[key]
    return {}


def response(event):
    return event.get("response") if event and isinstance(event.get("response"), dict) else {}


def evaluate(events, manifest):
    for index, event in enumerate(events):
        event.setdefault("_index", index)
    prefix = manifest.get("prefix", "increment7_")
    expected = int(manifest["oracle"]["expected_witness_count"])
    grouped = {}
    for event in events:
        if str(event.get("method", "")).upper() != "PUT" or not TASK.fullmatch(str(event.get("model_path", ""))):
            continue
        body = request(event)
        title = body.get("title")
        description = body.get("description")
        kind = None
        value = None
        if isinstance(title, str) and title.startswith(prefix) and title.endswith("_title"):
            kind, value = "title", title
        if isinstance(description, str) and description.startswith(prefix) and description.endswith("_description"):
            if kind:
                raise ValueError("Increment 7 update must write exactly one oracle field")
            kind, value = "description", description
        if kind:
            grouped.setdefault(event["model_path"], {})[kind] = (event, value)
    witnesses = []
    for path, writes in sorted(grouped.items(), key=lambda item: int(item[0].rsplit("/", 1)[1])):
        title_pair, description_pair = writes.get("title"), writes.get("description")
        last_index = max((pair[0]["_index"] for pair in writes.values()), default=-1)
        observation = next((event for event in events[last_index + 1:]
                            if event.get("model_path") == path and str(event.get("method", "")).upper() == "GET"), None)
        if not title_pair or not description_pair:
            result, reason = "INCONCLUSIVE", "paired-disjoint-write-missing"
        elif title_pair[0].get("status") != 200 or description_pair[0].get("status") != 200:
            result, reason = "VIOLATED", "legal-disjoint-write-failed"
        elif observation is None:
            result, reason = "INCONCLUSIVE", "verifier-read-missing"
        elif observation.get("status") != 200:
            result, reason = "VIOLATED", "verifier-read-failed"
        elif response(observation).get("title") != title_pair[1] or response(observation).get("description") != description_pair[1]:
            result, reason = "VIOLATED", "successful-disjoint-update-lost"
        else:
            result, reason = "PASS", None
        witness = {
            "oracle_id": "task-disjoint-updates-both-visible",
            "resource_path": path,
            "trigger_events": {
                "title": title_pair[0]["_index"] if title_pair else None,
                "description": description_pair[0]["_index"] if description_pair else None,
            },
            "observation_event": observation.get("_index") if observation else None,
            "expected": {
                "title": title_pair[1] if title_pair else None,
                "description": description_pair[1] if description_pair else None,
            },
            "observed": {
                "title_status": title_pair[0].get("status") if title_pair else None,
                "description_status": description_pair[0].get("status") if description_pair else None,
                "read_status": observation.get("status") if observation else None,
                "title": response(observation).get("title"),
                "description": response(observation).get("description"),
            },
            "result": result,
        }
        if reason:
            witness["reason"] = reason
        witnesses.append(witness)
    counts = {state: sum(w["result"] == state for w in witnesses) for state in ("PASS", "VIOLATED", "INCONCLUSIVE")}
    missing = max(0, expected - len(witnesses))
    if counts["VIOLATED"]:
        run_status = "SEMANTIC_ANOMALY"
    elif counts["INCONCLUSIVE"] or missing or len(witnesses) != expected:
        run_status = "INCONCLUSIVE"
    else:
        run_status = "PASS"
    return {
        "profile": "disjoint-field-update-commutativity",
        "evaluation_basis": "external HTTP trace ordered state-machine oracle",
        "run_status": run_status,
        "bug_candidate": run_status == "SEMANTIC_ANOMALY",
        "confirmed_product_bug": False,
        "confirmation_policy": "Reproduce twice, minimize the BP schedule, and exclude harness, API-contract, and omitted-field semantics before confirmation.",
        "oracle_summary": {
            "task-disjoint-updates-both-visible": {
                "status": run_status,
                "witness_count": len(witnesses),
                "expected_witness_count": expected,
                "missing_witness_count": missing,
                "counts": counts,
            }
        },
        "witness_count": len(witnesses),
        "witnesses": witnesses,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    result = evaluate(load(args.trace), json.loads(Path(args.manifest).read_text(encoding="utf-8-sig")))
    text = json.dumps(result, indent=2, sort_keys=True)
    Path(args.output).write_text(text + "\n", encoding="utf-8")
    print(text)
    raise SystemExit(0 if result["run_status"] == "PASS" else 2)


if __name__ == "__main__":
    main()
