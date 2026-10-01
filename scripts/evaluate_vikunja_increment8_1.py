#!/usr/bin/env python3
"""Independent evaluator for raw Increment 8.1 direct witnesses."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_no, line in enumerate(handle, 1):
            if line.strip():
                value = json.loads(line)
                if not isinstance(value, dict):
                    raise ValueError(f"line {line_no} is not an object")
                rows.append(value)
    return rows


def classify(witness: dict[str, Any]) -> dict[str, Any]:
    concurrent = witness.get("concurrent") or {}
    operations = concurrent.get("operations") or []
    observation = witness.get("post_join_observation") or {}
    observed = observation.get("response") if isinstance(observation.get("response"), dict) else {}
    expected = witness.get("concurrent_expected") or {}
    statuses = [item.get("status") for item in operations]
    errors = [item.get("error") for item in operations if item.get("error")]
    sequential_pass = witness.get("sequential_control_pass") is True
    reset_pass = witness.get("reset_pass") is True
    overlap = concurrent.get("overlap_observed") is True and int(concurrent.get("overlap_ns") or 0) > 0
    distinct = concurrent.get("distinct_connections") is True
    observation_ok = observation.get("status") == 200 and isinstance(observed, dict)
    title_visible = observation_ok and observed.get("title") == expected.get("title")
    description_visible = observation_ok and observed.get("description") == expected.get("description")

    if not sequential_pass:
        result, reason = "INCONCLUSIVE", "sequential-control-failed"
    elif not reset_pass:
        result, reason = "INCONCLUSIVE", "baseline-reset-failed"
    elif errors or len(operations) != 2:
        result, reason = "INCONCLUSIVE", "transport-or-worker-failure"
    elif not overlap or not distinct:
        result, reason = "INCONCLUSIVE", "true-overlap-or-connection-independence-not-proven"
    elif not observation_ok:
        result, reason = "INCONCLUSIVE", "post-join-observation-failed"
    elif any(isinstance(status, int) and status >= 500 for status in statuses):
        result, reason = "SERVER_FAILURE", "legal-concurrent-patch-returned-5xx"
    elif statuses == [200, 200] and not (title_visible and description_visible):
        result, reason = "LOST_UPDATE", "both-patches-succeeded-but-disjoint-update-was-not-visible"
    elif statuses == [200, 200] and title_visible and description_visible:
        result, reason = "PASS", "both-disjoint-updates-visible"
    else:
        result, reason = "CONTRACT_REJECTION", "legal-concurrent-patch-returned-non-200"

    return {
        "trial_id": witness.get("trial_id"),
        "task_id": witness.get("task_id"),
        "result": result,
        "reason": reason,
        "statuses": statuses,
        "sequential_control_pass": sequential_pass,
        "reset_pass": reset_pass,
        "overlap_observed": overlap,
        "overlap_ns": concurrent.get("overlap_ns"),
        "release_skew_ns": concurrent.get("release_skew_ns"),
        "distinct_connections": distinct,
        "observed": {
            "status": observation.get("status"),
            "title": observed.get("title") if isinstance(observed, dict) else None,
            "description": observed.get("description") if isinstance(observed, dict) else None,
        },
        "expected": expected,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("witnesses")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    witnesses = load_jsonl(Path(args.witnesses))
    evaluated = [classify(item) for item in witnesses]
    counts = Counter(item["result"] for item in evaluated)
    complete = len(witnesses) > 0 and counts["INCONCLUSIVE"] == 0
    direct_defect = counts["LOST_UPDATE"] > 0 or counts["SERVER_FAILURE"] > 0 or counts["CONTRACT_REJECTION"] > 0
    if not complete:
        run_status = "INCONCLUSIVE"
    elif direct_defect:
        run_status = "DIRECT_DEFECT_REPRODUCED"
    else:
        run_status = "PASS"

    result = {
        "schema_version": 1,
        "experiment": "vikunja-increment8.1-direct-confirmation",
        "evaluation_basis": "raw direct-client intervals, responses, sequential control, reset, and independent post-join GET",
        "provengo_used": False,
        "research_proxy_used": False,
        "increment8_adapter_used": False,
        "run_status": run_status,
        "direct_defect_reproduced": direct_defect and complete,
        "counts": {key: counts.get(key, 0) for key in ["PASS", "LOST_UPDATE", "SERVER_FAILURE", "CONTRACT_REJECTION", "INCONCLUSIVE"]},
        "trial_count": len(evaluated),
        "trials": evaluated,
        "interpretation": {
            "LOST_UPDATE": "Both legal PATCH requests returned 200, true overlap was proven, but one disjoint update was absent after join.",
            "SERVER_FAILURE": "At least one legal PATCH returned 5xx under proven true overlap.",
            "CONTRACT_REJECTION": "At least one legal PATCH returned a non-200 non-5xx response under proven true overlap.",
            "PASS": "Both legal PATCH requests returned 200 and both disjoint updates were visible after join.",
            "INCONCLUSIVE": "The control, reset, transport, overlap, connection-independence, or observation evidence was insufficient.",
        },
    }
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(result["counts"], sort_keys=True))
    print(f"INCREMENT8_1_{run_status}")
    return 2 if run_status == "DIRECT_DEFECT_REPRODUCED" else (3 if run_status == "INCONCLUSIVE" else 0)


if __name__ == "__main__":
    raise SystemExit(main())
