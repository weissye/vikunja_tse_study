#!/usr/bin/env python3
"""Sequence-local external-HTTP evaluator for NetBox B1.

B1 is the first incremental hardening checkpoint after B0.  Only A_LOGIC is
changed: it uses the V35 five-operation relation-reassignment witness.  The
other four historical B0 witnesses remain unchanged.  The evaluator consumes
one class-local HTTP proxy trace and never stitches evidence across runs.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

PREFIX = "MODEL_EVENT "
TARGETS = ("A_LOGIC", "B_LIFECYCLE", "C_UNIQUENESS", "D_INTEGRITY", "E_WORKFLOW")
EXPECTED_MIN_STEPS = {
    "A_LOGIC": 5,
    "B_LIFECYCLE": 3,
    "C_UNIQUENESS": 2,
    "D_INTEGRITY": 3,
    "E_WORKFLOW": 2,
}


def load_trace(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    if not path.exists():
        return records
    for line_no, raw in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
        text = raw.strip()
        if PREFIX in text:
            text = text.split(PREFIX, 1)[1].strip()
        try:
            event = json.loads(text)
        except Exception:
            continue
        if not isinstance(event, dict):
            continue
        if event.get("method") and event.get("path") and event.get("status") is not None:
            event = dict(event)
            event["trace_line"] = line_no
            records.append(event)
    return records


def body(r: dict[str, Any]) -> dict[str, Any]:
    value = r.get("body")
    return value if isinstance(value, dict) else {}


def response(r: dict[str, Any]) -> dict[str, Any]:
    value = r.get("response")
    return value if isinstance(value, dict) else {}


def ref_id(v: Any) -> str | None:
    if isinstance(v, dict):
        v = v.get("id")
    return None if v is None else str(v)


def same_item_path(collection: str, item_id: Any) -> str:
    return f"{collection.rstrip('/')}/{item_id}"


def evaluate(target: str, recs: list[dict[str, Any]]) -> tuple[bool, list[int], str]:
    # B1 A: Site P1 -> Site P2 -> Device@P1 -> PATCH Device@P2 -> GET still P1.
    if target == "A_LOGIC":
        sites: dict[str, int] = {}
        for i, e in enumerate(recs):
            if e.get("method") == "POST" and e.get("path") == "/api/dcim/sites" and e.get("status") == 201:
                sid = ref_id(response(e).get("id")) or ref_id(body(e).get("id"))
                if sid:
                    sites[sid] = i

            if not (e.get("method") == "POST" and e.get("path") == "/api/dcim/devices" and e.get("status") == 201):
                continue
            did = ref_id(response(e).get("id")) or ref_id(body(e).get("id"))
            old_parent = ref_id(response(e).get("site")) or ref_id(body(e).get("site"))
            if not did or old_parent not in sites:
                continue
            item_path = same_item_path("/api/dcim/devices", did)
            for j in range(i + 1, len(recs)):
                p = recs[j]
                requested = ref_id(body(p).get("site"))
                if not (p.get("method") == "PATCH" and p.get("path") == item_path and p.get("status") == 200 and
                        requested in sites and requested != old_parent):
                    continue
                for k in range(j + 1, len(recs)):
                    g = recs[k]
                    got_parent = ref_id(response(g).get("site"))
                    if (g.get("method") == "GET" and g.get("path") == item_path and g.get("status") == 200 and
                            got_parent == old_parent and got_parent != requested and (k + 1) >= EXPECTED_MIN_STEPS[target]):
                        return True, [recs[sites[old_parent]]["trace_line"], recs[sites[requested]]["trace_line"],
                                      e["trace_line"], p["trace_line"], g["trace_line"]], \
                               "valid Device reassignment acknowledged but old Site relation remains"
        return False, [], "missing ordered two-Site/create/reassign/GET witness"

    # B--E below are intentionally unchanged from B0.
    if target == "B_LIFECYCLE":
        for i, create in enumerate(recs):
            cb = body(create)
            if not (create.get("method") == "POST" and create.get("path") == "/api/dcim/sites" and
                    create.get("status") == 201 and cb.get("id")):
                continue
            item_path = same_item_path("/api/dcim/sites", cb["id"])
            for j in range(i + 1, len(recs)):
                delete = recs[j]
                if not (delete.get("method") == "DELETE" and delete.get("path") == item_path and delete.get("status") == 404):
                    continue
                for k in range(j + 1, len(recs)):
                    get = recs[k]
                    if get.get("method") == "GET" and get.get("path") == item_path and get.get("status") == 200:
                        return True, [create["trace_line"], delete["trace_line"], get["trace_line"]], "delete reports 404 but object remains retrievable"
        return False, [], "missing ordered create/delete/get lifecycle witness"

    if target == "C_UNIQUENESS":
        for i, first in enumerate(recs):
            fb = body(first)
            if not (first.get("method") == "POST" and first.get("path") == "/api/dcim/sites" and first.get("status") == 201 and fb.get("slug")):
                continue
            for j in range(i + 1, len(recs)):
                second = recs[j]
                sb = body(second)
                if (second.get("method") == "POST" and second.get("path") == "/api/dcim/sites" and second.get("status") == 201 and
                        sb.get("slug") == fb.get("slug") and sb.get("id") != fb.get("id")):
                    return True, [first["trace_line"], second["trace_line"]], "duplicate Site slug accepted"
        return False, [], "missing duplicate-slug witness"

    if target == "D_INTEGRITY":
        for i, create in enumerate(recs):
            cb = body(create)
            if not (create.get("method") == "POST" and create.get("path") == "/api/circuits/circuits" and
                    create.get("status") == 201 and cb.get("id")):
                continue
            item_path = same_item_path("/api/circuits/circuits", cb["id"])
            for j in range(i + 1, len(recs)):
                patch = recs[j]
                requested = body(patch).get("status")
                if not (patch.get("method") == "PATCH" and patch.get("path") == item_path and patch.get("status") == 200 and requested):
                    continue
                pr = response(patch)
                for k in range(j + 1, len(recs)):
                    get = recs[k]
                    gr = response(get)
                    if (get.get("method") == "GET" and get.get("path") == item_path and get.get("status") == 200 and
                            pr.get("status") != requested and gr.get("status") != requested):
                        return True, [create["trace_line"], patch["trace_line"], get["trace_line"]], "Circuit status update acknowledged but discarded"
        return False, [], "missing ordered lost-update witness"

    if target == "E_WORKFLOW":
        for i, create in enumerate(recs):
            cb = body(create)
            if not (create.get("method") == "POST" and create.get("path") == "/api/dcim/devices" and
                    create.get("status") == 201 and cb.get("status") == "draft" and cb.get("id")):
                continue
            item_path = same_item_path("/api/dcim/devices", cb["id"])
            for j in range(i + 1, len(recs)):
                patch = recs[j]
                pb = body(patch)
                pr = response(patch)
                if (patch.get("method") == "PATCH" and patch.get("path") == item_path and patch.get("status") == 200 and
                        pb.get("status") == "archived" and pr.get("status") == "archived"):
                    return True, [create["trace_line"], patch["trace_line"]], "direct draft -> archived transition accepted"
        return False, [], "missing direct workflow-bypass witness"

    raise ValueError(target)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--target", required=True, choices=TARGETS)
    ap.add_argument("--trace", required=True)
    ap.add_argument("--output", required=True)
    args = ap.parse_args()

    trace = Path(args.trace)
    recs = load_trace(trace)
    confirmed, lines, note = evaluate(args.target, recs)
    result = {
        "schema_version": 1,
        "checkpoint": "B1",
        "purpose": "first incremental hardening checkpoint; A_LOGIC only",
        "changed_from_b0": {"A_LOGIC": {"b0_http_steps": 2, "b1_http_steps": 5}},
        "unchanged_from_b0": ["B_LIFECYCLE", "C_UNIQUENESS", "D_INTEGRITY", "E_WORKFLOW"],
        "oracle": "single class-local Provengo run; external HTTP trace only",
        "sequence_local": True,
        "cross_run_stitching": False,
        "target": args.target,
        "expected_min_http_steps": EXPECTED_MIN_STEPS[args.target],
        "confirmed": confirmed,
        "http_record_count": len(recs),
        "witness_trace_lines": lines,
        "witness_note": note,
        "trace": str(trace),
    }
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True), encoding="utf-8")
    print(f"B1 {args.target}: {'CONFIRMED' if confirmed else 'NOT CONFIRMED'} ({len(recs)} HTTP records) -- {note}")
    return 0 if confirmed else 2


if __name__ == "__main__":
    raise SystemExit(main())
