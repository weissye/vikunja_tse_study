"""Isolated Mealie meal-plan PUT control and sanitized local trace diagnosis."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from confirm_mealie_mealplan_create import call, ENDPOINT  # noqa: E402
from run_mealie_stage4 import BASE, get_token, verified_identity  # noqa: E402
from diagnose_mealie_mealplan import validation_shape  # noqa: E402

SPEC_HASH = "a08fcb5e176e20c395cf14ef14d7f54277b062b04179ca5ec1b23462703ec3b8"
SPEC = ROOT / "model/mealie/openapi-stage4-v3.27.0.json"
ALLOWED = {"date", "entryType", "groupId", "id", "recipeId", "text", "title", "userId"}


def spec_required():
    if hashlib.sha256(SPEC.read_bytes()).hexdigest() != SPEC_HASH:
        raise RuntimeError("Pinned Mealie OpenAPI hash mismatch")
    schemas = json.loads(SPEC.read_text(encoding="utf-8"))["components"]["schemas"]
    required = set(schemas["UpdatePlanEntry"]["required"])
    if required != {"date", "id", "groupId", "userId"}:
        raise RuntimeError("Pinned UpdatePlanEntry required fields changed")
    return sorted(required)


def shape(body, required):
    if not isinstance(body, dict):
        return {"body_type": type(body).__name__, "missing_required": required}
    return {"body_type": "object", "keys": sorted(k for k in body if k in ALLOWED),
            "missing_required": sorted(set(required) - body.keys()),
            "unknown_key_count": sum(k not in ALLOWED for k in body)}


def diagnose_trace(trace, required):
    found = []
    with Path(trace).open(encoding="utf-8") as stream:
        for line in stream:
            row = json.loads(line)
            if row.get("method") != "PUT" or not re.fullmatch(r"/api/households/mealplans/\d+", row.get("model_path", "")):
                continue
            entry = {"trace_sequence": row.get("trace_sequence"), "status": row.get("status")}
            if isinstance(row.get("request"), dict):
                entry["request_shape"] = shape(row["request"], required)
            else:
                entry["request_shape"] = "BODY_NOT_PRESERVED"
            if row.get("status") == 422 and isinstance(row.get("response"), dict):
                entry["validation"] = validation_shape(row["response"])
            found.append(entry)
    return found


def checked_call(token, method, path, body=None):
    status, response = call(token, method, path, body)
    return status, response


def trial(token, required):
    stamp = uuid4().hex[:10]
    created = {"date": (date.today() + timedelta(days=90)).isoformat(),
               "title": "Research plan " + stamp, "text": "Research plan " + stamp}
    create_status, create_result = checked_call(token, "POST", ENDPOINT, created)
    report = {"create_status": create_status, "create_keys": sorted(created)}
    if create_status != 201 or not isinstance(create_result, dict) or not isinstance(create_result.get("id"), int):
        report["classification"] = "CREATE_NOT_VERIFIED"
        return report
    path = ENDPOINT + "/" + str(create_result["id"])
    read_status, current = checked_call(token, "GET", path)
    report["read_status"] = read_status
    if read_status != 200 or not isinstance(current, dict) or any(k not in current for k in required):
        report["classification"] = "READ_NOT_VERIFIED"
        return report
    report["read_shape"] = shape(current, required)
    # Each case has a distinct value. The first failing case must not alter the plan.
    sparse = {"date": current["date"], "title": "Sparse " + stamp,
              "text": "Sparse " + stamp}
    sparse_status, sparse_result = checked_call(token, "PUT", path, sparse)
    report["sparse"] = {"status": sparse_status, "request_shape": shape(sparse, required)}
    if sparse_status == 422:
        report["sparse"]["validation"] = validation_shape(sparse_result)
    if sparse_status != 422:
        report["classification"] = "SPARSE_CONTROL_DID_NOT_REJECT"
        return report
    reread_status, latest = checked_call(token, "GET", path)
    report["after_sparse_read_status"] = reread_status
    if reread_status != 200 or not isinstance(latest, dict) or any(k not in latest for k in required):
        report["classification"] = "READ_AFTER_SPARSE_UNVERIFIED"
        return report
    complete = {k: latest[k] for k in ALLOWED if k in latest}
    complete["title"] = "Complete " + stamp
    complete["text"] = "Complete " + stamp
    report["complete"] = {"request_shape": shape(complete, required)}
    if any(complete[k] is None for k in required) or complete["id"] != create_result["id"]:
        report["classification"] = "REQUIRED_READ_VALUES_UNUSABLE"
        return report
    full_status, full_result = checked_call(token, "PUT", path, complete)
    report["complete"]["status"] = full_status
    if full_status == 422:
        report["complete"]["validation"] = validation_shape(full_result)
    final_status, final = checked_call(token, "GET", path)
    report["final_read_status"] = final_status
    report["final_value_visible"] = (final_status == 200 and isinstance(final, dict)
                                      and final.get("title") == complete["title"]
                                      and final.get("text") == complete["text"])
    report["classification"] = ("FULL_READ_DERIVED_PUT_VALID" if full_status == 200 and report["final_value_visible"]
                                else "FULL_PUT_NOT_VERIFIED")
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--trace", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if BASE != "http://127.0.0.1:9927":
        raise RuntimeError("Only the isolated loopback Mealie Stage 4 instance is permitted")
    required = spec_required()
    token = get_token()
    verified_identity(token)
    result = {"schema_version": 1, "spec_sha256": SPEC_HASH, "required": required,
              "previous_puts": diagnose_trace(args.trace, required), "serial_control": trial(token, required)}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print("MEALIE_PUT_DECISION " + result["serial_control"]["classification"]
          + " prior_puts=" + str(len(result["previous_puts"])))


if __name__ == "__main__":
    main()
