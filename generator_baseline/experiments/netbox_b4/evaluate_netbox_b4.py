#!/usr/bin/env python3
"""Sequence-local external-HTTP evaluator for NetBox B4.

B4 is the fourth incremental hardening checkpoint after B0. A_LOGIC remains
hardened from B1, B_LIFECYCLE from B2, C_UNIQUENESS already matches the V35
minimum, and D_INTEGRITY remains hardened from B3. B4 changes only the fifth
class: historical E_WORKFLOW is replaced by E_REFERENTIAL_INTEGRITY using the
V35 four-operation parent/valid-child/delete/reuse witness.

The evaluator consumes one class-local HTTP proxy trace and never stitches
evidence across runs.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

PREFIX = "MODEL_EVENT "
TARGETS = ("A_LOGIC", "B_LIFECYCLE", "C_UNIQUENESS", "D_INTEGRITY", "E_REFERENTIAL_INTEGRITY")
EXPECTED_MIN_STEPS = {
    "A_LOGIC": 5,
    "B_LIFECYCLE": 5,
    "C_UNIQUENESS": 2,
    "D_INTEGRITY": 4,
    "E_REFERENTIAL_INTEGRITY": 4,
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
            event["path"] = str(event["path"]).rstrip("/") or "/"
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
    # A: two existing Sites -> Device@old -> valid reassignment -> GET still old.
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

    # B: Site -> two Devices -> DELETE Site 204 -> child remains with deleted ref.
    if target == "B_LIFECYCLE":
        for i, create in enumerate(recs):
            if not (create.get("method") == "POST" and create.get("path") == "/api/dcim/sites" and create.get("status") == 201):
                continue
            sid = ref_id(response(create).get("id")) or ref_id(body(create).get("id"))
            if not sid:
                continue
            children: list[tuple[int, str]] = []
            for j in range(i + 1, len(recs)):
                e = recs[j]
                if e.get("method") == "POST" and e.get("path") == "/api/dcim/devices" and e.get("status") == 201:
                    parent = ref_id(response(e).get("site")) or ref_id(body(e).get("site"))
                    did = ref_id(response(e).get("id")) or ref_id(body(e).get("id"))
                    if parent == sid and did and all(existing != did for _, existing in children):
                        children.append((j, did))
                if len(children) < 2:
                    continue
                if not (e.get("method") == "DELETE" and e.get("path") == same_item_path("/api/dcim/sites", sid) and e.get("status") == 204):
                    continue
                for k in range(j + 1, len(recs)):
                    g = recs[k]
                    for child_index, did in children:
                        if (g.get("method") == "GET" and g.get("path") == same_item_path("/api/dcim/devices", did) and
                                g.get("status") == 200 and ref_id(response(g).get("site")) == sid and
                                (k + 1) >= EXPECTED_MIN_STEPS[target]):
                            return True, [create["trace_line"], recs[children[0][0]]["trace_line"],
                                          recs[children[1][0]]["trace_line"], e["trace_line"], g["trace_line"]], \
                                   "successful multi-child parent deletion leaves a child retrievable with the deleted reference"
        return False, [], "missing ordered parent/two-children/delete/child-GET lifecycle witness"

    # C already matches V35 and is retained unchanged.
    if target == "C_UNIQUENESS":
        owner: dict[str, tuple[str, int]] = {}
        for i, e in enumerate(recs):
            if not (e.get("method") == "POST" and e.get("path") == "/api/dcim/sites" and e.get("status") == 201):
                continue
            req, resp = body(e), response(e)
            slug = resp.get("slug") if resp.get("slug") not in (None, "") else req.get("slug")
            sid = ref_id(resp.get("id")) or ref_id(req.get("id"))
            if slug in (None, "") or not sid:
                continue
            slug = str(slug)
            if slug in owner and owner[slug][0] != sid and (i + 1) >= EXPECTED_MIN_STEPS[target]:
                return True, [recs[owner[slug][1]]["trace_line"], e["trace_line"]], "duplicate Site slug accepted"
            owner[slug] = (sid, i)
        return False, [], "missing duplicate-slug witness"

    # B3 D: POST initial -> PATCH value1 -> GET verifies value1 -> PATCH value2
    # returns 200 but stale value1. The stale second PATCH response is sufficient.
    if target == "D_INTEGRITY":
        items: dict[str, dict[str, Any]] = {}
        for i, e in enumerate(recs):
            m, p = str(e.get("method") or "").upper(), e.get("path")
            if e.get("status") is None or not (200 <= int(e.get("status")) < 300):
                continue
            req, resp = body(e), response(e)
            if m == "POST" and p == "/api/circuits/circuits":
                cid = ref_id(resp.get("id")) or ref_id(req.get("id"))
                if cid:
                    items[cid] = {
                        "create": i,
                        "initial": resp.get("description", req.get("description")),
                        "first_target": None,
                        "first_patch": None,
                        "first_verified": None,
                    }
                continue

            if m == "PATCH" and p and p.startswith("/api/circuits/circuits/"):
                cid = p[len("/api/circuits/circuits/"):].split("/", 1)[0]
                d = items.get(cid)
                if not d or "description" not in req:
                    continue
                requested = req.get("description")
                got = resp.get("description")
                if d["first_target"] is None:
                    if requested == d["initial"] or got != requested:
                        continue
                    d["first_target"] = requested
                    d["first_patch"] = i
                    continue
                if d["first_verified"] is None:
                    continue
                if requested in {d["initial"], d["first_target"]}:
                    continue
                if got == d["first_target"] and got != requested and (i + 1) >= EXPECTED_MIN_STEPS[target]:
                    return True, [recs[d["create"]]["trace_line"], recs[d["first_patch"]]["trace_line"],
                                  recs[d["first_verified"]]["trace_line"], e["trace_line"]], \
                           "first Circuit description update verified; second distinct update acknowledged but discarded"

            elif m == "GET" and p and p.startswith("/api/circuits/circuits/"):
                cid = p[len("/api/circuits/circuits/"):].split("/", 1)[0]
                d = items.get(cid)
                if not d or d["first_target"] is None or d["first_verified"] is not None:
                    continue
                if i > d["first_patch"] and resp.get("description") == d["first_target"]:
                    d["first_verified"] = i
        return False, [], "missing ordered create/first-update/GET-verification/lost-second-update witness"

    # B4 E: Site -> valid Device -> DELETE Site 204 -> new Device reuses
    # deleted Site id and the successful create response preserves that ref.
    if target == "E_REFERENTIAL_INTEGRITY":
        sites: set[str] = set()
        valid_children: dict[str, list[tuple[str, int]]] = {}
        deleted_sites: dict[str, int] = {}
        for i, e in enumerate(recs):
            m, p = str(e.get("method") or "").upper(), e.get("path")
            req, resp = body(e), response(e)
            status = e.get("status")
            is_2xx = status is not None and 200 <= int(status) < 300

            if m == "POST" and p == "/api/dcim/sites" and is_2xx:
                sid = ref_id(resp.get("id")) or ref_id(req.get("id"))
                if sid:
                    sites.add(sid)
                continue

            if m == "POST" and p == "/api/dcim/devices" and is_2xx:
                did = ref_id(resp.get("id")) or ref_id(req.get("id"))
                sid = ref_id(resp.get("site")) or ref_id(req.get("site"))
                if not did or not sid:
                    continue
                if sid in sites and sid not in deleted_sites:
                    valid_children.setdefault(sid, []).append((did, i))
                    continue
                if sid in deleted_sites and valid_children.get(sid):
                    observed_parent = ref_id(resp.get("site"))
                    if observed_parent == sid and (i + 1) >= EXPECTED_MIN_STEPS[target]:
                        first_child_i = valid_children[sid][0][1]
                        return True, [
                            recs[next(k for k, x in enumerate(recs[:first_child_i])
                                      if x.get("method") == "POST" and x.get("path") == "/api/dcim/sites" and
                                      (ref_id(response(x).get("id")) or ref_id(body(x).get("id"))) == sid)]["trace_line"],
                            recs[first_child_i]["trace_line"],
                            recs[deleted_sites[sid]]["trace_line"],
                            e["trace_line"],
                        ], "new Device accepted with a successfully deleted Site id after valid relationship history"
                continue

            if m == "DELETE" and p and p.startswith("/api/dcim/sites/") and is_2xx:
                sid = p[len("/api/dcim/sites/"):].split("/", 1)[0]
                if sid in sites and valid_children.get(sid):
                    deleted_sites[sid] = i

        return False, [], "missing ordered parent/valid-child/successful-delete/deleted-parent-reuse witness"

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
        "checkpoint": "B4",
        "purpose": "fourth incremental hardening checkpoint; E_REFERENTIAL_INTEGRITY only is newly hardened",
        "changed_from_b0": {
            "A_LOGIC": {"b0_http_steps": 2, "b1_http_steps": 5},
            "B_LIFECYCLE": {"b0_http_steps": 3, "b2_http_steps": 5},
            "D_INTEGRITY": {"b0_http_steps": 3, "b3_http_steps": 4},
            "E_REFERENTIAL_INTEGRITY": {"b0_historical_class": "E_WORKFLOW", "b0_http_steps": 2, "b4_http_steps": 4},
        },
        "changed_from_b3": {"E_REFERENTIAL_INTEGRITY": {"b3_class": "E_WORKFLOW", "b3_http_steps": 2, "b4_http_steps": 4}},
        "retained_hardened": {"A_LOGIC": 5, "B_LIFECYCLE": 5, "D_INTEGRITY": 4},
        "already_v35_compliant": {"C_UNIQUENESS": 2},
        "unchanged_from_b3": ["A_LOGIC", "B_LIFECYCLE", "C_UNIQUENESS", "D_INTEGRITY"],
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
    print(f"B4 {args.target}: {'CONFIRMED' if confirmed else 'NOT CONFIRMED'} ({len(recs)} HTTP records) -- {note}")
    return 0 if confirmed else 2


if __name__ == "__main__":
    raise SystemExit(main())
