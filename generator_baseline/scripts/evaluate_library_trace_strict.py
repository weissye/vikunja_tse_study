#!/usr/bin/env python3
"""
Strict external-HTTP semantic evaluator for the V38 Library benchmark.

This evaluator intentionally uses only preserved MODEL_EVENT HTTP records from
http_trace.jsonl. It does NOT use hidden SUT state or tool-internal bug reports.

Confirmed classes:
  HOLD_OWNERSHIP:
    A successful POST /loans occurs while a successful, not-yet-deleted hold
    exists on the same book for a different user.

  LOAN_LIMIT:
    A user has successful active loans for at least three DISTINCT books at the
    same time. Successful DELETE /loans/{userId}/{bookId} removes that active
    relation.

The implementation normalizes identifier types (e.g., JSON integer vs path
string) and processes hold deletions, avoiding two false-positive modes in the
older evaluator.
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

PREFIX_RE = re.compile(r"MODEL_EVENT\s+(\{.*\})")


def norm_id(v):
    if v is None:
        return None
    return str(v)


def load_events(path: Path):
    events = []
    parse_errors = 0
    with path.open("r", encoding="utf-8", errors="replace") as f:
        for line_no, line in enumerate(f, 1):
            m = PREFIX_RE.search(line)
            if not m:
                continue
            try:
                e = json.loads(m.group(1))
            except Exception:
                parse_errors += 1
                continue
            e["_trace_line"] = line_no
            e["_event_index"] = len(events)
            events.append(e)
    return events, parse_errors


def success(e):
    try:
        return int(e.get("status", 999)) < 400
    except Exception:
        return False


def path_only(e):
    return str(e.get("path") or "").split("?", 1)[0]


def body_dict(e):
    b = e.get("body")
    return b if isinstance(b, dict) else {}


def slim(e):
    if e is None:
        return None
    return {
        "event_index": e.get("_event_index"),
        "trace_line": e.get("_trace_line"),
        "method": e.get("method"),
        "path": e.get("path"),
        "status": e.get("status"),
        "body": e.get("body"),
        "response": e.get("response"),
    }


def main():
    if len(sys.argv) != 2:
        print("Usage: python evaluate_library_trace_strict.py <http_trace.jsonl>", file=sys.stderr)
        return 2

    trace = Path(sys.argv[1])
    if not trace.is_file():
        print(f"Trace not found: {trace}", file=sys.stderr)
        return 2

    events, parse_errors = load_events(trace)

    # hold_id -> {owner, book, create_event}
    active_holds = {}

    # (user, book) -> multiplicity.  We count distinct active books for the
    # loan-limit oracle, which is conservative against repeated duplicate loans.
    active_loans = Counter()

    hold_witness = None
    limit_witness = None

    for e in events:
        if not success(e):
            continue

        method = str(e.get("method") or "").upper()
        path = path_only(e)
        body = body_dict(e)

        if method == "POST" and path == "/holds":
            hid = norm_id(body.get("id"))
            owner = norm_id(body.get("userId"))
            book = norm_id(body.get("bookId"))
            if hid is not None and owner is not None and book is not None:
                active_holds[hid] = {
                    "owner": owner,
                    "book": book,
                    "create_event": e,
                }
            continue

        if method == "DELETE" and path.startswith("/holds/"):
            parts = path.strip("/").split("/")
            if len(parts) >= 2:
                active_holds.pop(norm_id(parts[1]), None)
            continue

        if method == "POST" and path == "/loans":
            user = norm_id(body.get("userId"))
            book = norm_id(body.get("bookId"))
            if user is None or book is None:
                continue

            # HOLD_OWNERSHIP: active hold on same book by a different user.
            conflicts = [
                (hid, h)
                for hid, h in active_holds.items()
                if h["book"] == book and h["owner"] != user
            ]
            if conflicts and hold_witness is None:
                hid, h = conflicts[0]
                hold_witness = {
                    "hold_id": hid,
                    "hold_owner": h["owner"],
                    "borrower": user,
                    "book_id": book,
                    "hold_create": slim(h["create_event"]),
                    "violating_loan": slim(e),
                }

            active_loans[(user, book)] += 1

            # LOAN_LIMIT: at least 3 DISTINCT active books for same user.
            distinct_books = sorted(
                b for (u, b), count in active_loans.items()
                if u == user and count > 0
            )
            if len(distinct_books) >= 3 and limit_witness is None:
                limit_witness = {
                    "user": user,
                    "distinct_active_books": distinct_books,
                    "third_active_loan": slim(e),
                }
            continue

        if method == "DELETE" and path.startswith("/loans/"):
            parts = path.strip("/").split("/")
            if len(parts) >= 3:
                key = (norm_id(parts[1]), norm_id(parts[2]))
                if active_loans[key] > 0:
                    active_loans[key] -= 1
                    if active_loans[key] <= 0:
                        del active_loans[key]
            continue

    confirmed = []
    if hold_witness is not None:
        confirmed.append("HOLD_OWNERSHIP")
    if limit_witness is not None:
        confirmed.append("LOAN_LIMIT")

    result = {
        "schema_version": 2,
        "rule_basis": "preserved external HTTP trace only; active-state reconstruction with deletion handling",
        "confirmed_classes": confirmed,
        "semantic_class_count": len(confirmed),
        "semantic_score": f"{len(confirmed)}/2",
        "hold_ownership_confirmed": hold_witness is not None,
        "loan_limit_confirmed": limit_witness is not None,
        "event_count": len(events),
        "parse_error_count": parse_errors,
        "hold_ownership_witness": hold_witness,
        "loan_limit_witness": limit_witness,
        "notes": [
            "Hold deletion is applied before later loan evaluation.",
            "Loan/user/book identifiers are normalized across JSON bodies and URL path parameters.",
            "Loan-limit confirmation requires three distinct simultaneously active books for one user.",
            "No hidden SUT marker or native tool fault bucket is used for semantic confirmation.",
        ],
    }

    print(json.dumps(result, indent=2, sort_keys=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
