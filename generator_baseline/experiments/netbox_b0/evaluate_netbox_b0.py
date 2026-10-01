#!/usr/bin/env python3
"""Sequence-local external-HTTP evaluator for the NetBox B0 checkpoint.

B0 is an engineering regression checkpoint that reconstructs the retained short
A11 Provengo witnesses which previously yielded 5/5.  It is intentionally *not*
the final apples-to-apples experiment and it does not inspect SUT internals.

Input: one HTTP proxy trace from one class-local Provengo run.
No evidence is stitched across runs or targets.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

PREFIX = "MODEL_EVENT "
TARGETS = ("A_LOGIC", "B_LIFECYCLE", "C_UNIQUENESS", "D_INTEGRITY", "E_WORKFLOW")


def load_trace(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    if not path.exists():
        return records
    for line_no, raw in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
        text = raw.strip()
        if not text:
            continue
        if text.startswith(PREFIX):
            text = text[len(PREFIX):]
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


def same_item_path(collection: str, item_id: Any) -> str:
    return f"{collection.rstrip('/')}/{item_id}"


def evaluate(target: str, recs: list[dict[str, Any]]) -> tuple[bool, list[int], str]:
    # A: create a retired Site, then create a Device that references that Site.
    if target == "A_LOGIC":
        for i, site in enumerate(recs):
            sb = body(site)
            if not (site.get("method") == "POST" and site.get("path") == "/api/dcim/sites" and
                    site.get("status") == 201 and sb.get("status") == "retired" and sb.get("id")):
                continue
            sid = str(sb["id"])
            for j in range(i + 1, len(recs)):
                dev = recs[j]
                db = body(dev)
                site_ref = db.get("site")
                ref_id = site_ref.get("id") if isinstance(site_ref, dict) else site_ref
                if (dev.get("method") == "POST" and dev.get("path") == "/api/dcim/devices" and
                        dev.get("status") == 201 and str(ref_id) == sid):
                    return True, [site["trace_line"], dev["trace_line"]], "retired Site -> accepted Device"
        return False, [], "missing ordered retired-Site/device witness"

    # B: create Site -> DELETE returns 404 -> same Site is still GET 200.
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

    # C: two different Sites with the same slug are both accepted.
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

    # D: create Circuit -> PATCH status is acknowledged -> GET still exposes old status.
    if target == "D_INTEGRITY":
        for i, create in enumerate(recs):
            cb = body(create)
            if not (create.get("method") == "POST" and create.get("path") == "/api/circuits/circuits" and
                    create.get("status") == 201 and cb.get("id")):
                continue
            item_path = same_item_path("/api/circuits/circuits", cb["id"])
            for j in range(i + 1, len(recs)):
                patch = recs[j]
                pb = body(patch)
                requested = pb.get("status")
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

    # E: create Device in draft -> direct PATCH to archived is accepted.
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
        "schema_version": 2,
        "checkpoint": "B0",
        "purpose": "engineering regression checkpoint before incremental hardening; not final A2A evidence",
        "oracle": "single class-local Provengo run; external HTTP trace only",
        "sequence_local": True,
        "cross_run_stitching": False,
        "target": args.target,
        "confirmed": confirmed,
        "http_record_count": len(recs),
        "witness_trace_lines": lines,
        "witness_note": note,
        "trace": str(trace),
    }
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True), encoding="utf-8")
    print(f"B0 {args.target}: {'CONFIRMED' if confirmed else 'NOT CONFIRMED'} ({len(recs)} HTTP records) -- {note}")
    return 0 if confirmed else 2


if __name__ == "__main__":
    raise SystemExit(main())
