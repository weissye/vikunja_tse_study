"""Extract only a meal-plan create request shape and structured validation errors.

Run this against a *local, unfrozen* Stage 4 HTTP trace. No network requests are made.
The output deliberately excludes request values, identifiers and free-form error text.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ENDPOINT = "/api/households/mealplans"
DATE = re.compile(r"\d{4}-\d{2}-\d{2}\Z")
IDENT = re.compile(r"[A-Za-z][A-Za-z0-9_]{0,48}\Z")
VALID_TYPE = re.compile(r"[a-z]{1,24}\Z")
FIELDS = ("date", "entryType", "recipeId", "text", "title")


def request_shape(body):
    if not isinstance(body, dict):
        return {"body_type": type(body).__name__}
    result = {"body_type": "object", "keys": sorted(key for key in body if key in FIELDS)}
    result["unknown_key_count"] = sum(key not in FIELDS for key in body)
    result["date_format_ok"] = bool(DATE.fullmatch(body.get("date", ""))) if isinstance(body.get("date"), str) else False
    if "recipeId" in body:
        result["recipeId_kind"] = "null" if body["recipeId"] is None else type(body["recipeId"]).__name__
    if "entryType" in body:
        value = body["entryType"]
        result["entryType"] = value if isinstance(value, str) and VALID_TYPE.fullmatch(value) else "[omitted]"
    for key in ("title", "text"):
        if key in body:
            result[key + "_nonempty"] = bool(body[key])
    return result


def validation_shape(body):
    if not isinstance(body, dict):
        return {"body_type": type(body).__name__}
    result = {"body_type": "object", "top_level_keys": sorted(key for key in body if IDENT.fullmatch(key))}
    details = body.get("detail")
    if isinstance(details, list):
        errors = []
        for item in details:
            if not isinstance(item, dict):
                continue
            loc = item.get("loc", [])
            typ = item.get("type", "")
            errors.append({
                "loc": [x if isinstance(x, str) and IDENT.fullmatch(x) else "[omitted]" for x in loc]
                       if isinstance(loc, list) else [],
                "type": typ if isinstance(typ, str) and IDENT.fullmatch(typ) else "[omitted]",
                "message_kind": "field-required" if item.get("msg") == "Field required" else "other",
            })
        result["errors"] = errors
    elif isinstance(details, str):
        result["detail_kind"] = "string"
    return result


def diagnose(trace):
    events = []
    with Path(trace).open(encoding="utf-8") as stream:
        for line in stream:
            row = json.loads(line)
            if row.get("method") != "POST" or row.get("model_path", "").split("?", 1)[0] != ENDPOINT:
                continue
            if "request" not in row or "response" not in row:
                raise ValueError("The trace has no request/response bodies; use the local run trace, not the frozen evidence ZIP")
            events.append({"trace_sequence": row.get("trace_sequence"),
                           "status": row.get("status"),
                           "request_shape": request_shape(row["request"]),
                           "response_shape": validation_shape(row["response"]) if row.get("status") == 422 else
                           {"body_type": type(row["response"]).__name__}})
    if not events:
        raise ValueError("No POST /api/households/mealplans events in trace")
    return {"schema_version": 1, "classification": "LOCAL_MEALPLAN_CREATE_DIAGNOSTIC", "events": events}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--trace", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    out = diagnose(args.trace)
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(json.dumps(out, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print("MEALIE_MEALPLAN_DIAGNOSTIC_READY events=%s report=%s" % (len(out["events"]), args.output))


if __name__ == "__main__":
    main()
