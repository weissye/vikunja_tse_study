#!/usr/bin/env python3
"""Independent external evaluator for Increment 9 search campaigns."""
from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import datetime
from pathlib import Path


def load_jsonl(path: Path) -> list[dict]:
    rows = []
    decoder = json.JSONDecoder()
    for line_no, line in enumerate(path.read_text(encoding="utf-8-sig").replace("\x00", "").splitlines(), 1):
        remaining = line.strip().lstrip("\ufeff")
        while remaining:
            try:
                value, end = decoder.raw_decode(remaining)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Malformed JSONL at line {line_no}, column {exc.colno}") from exc
            if not isinstance(value, dict):
                raise ValueError(f"Non-object JSONL value at line {line_no}")
            value.setdefault("_index", len(rows))
            rows.append(value)
            remaining = remaining[end:].strip()
    return rows


def parse_time(value: str) -> datetime:
    return datetime.fromisoformat(str(value).replace("Z", "+00:00"))


def proxy_overlap(events: list[dict]) -> bool:
    try:
        return max(parse_time(e["upstream_started_utc"]) for e in events) < min(parse_time(e["upstream_completed_utc"]) for e in events)
    except (KeyError, TypeError, ValueError):
        return False


def expected_after_sequential(scenario: dict) -> tuple[int, dict]:
    state = {"title": None, "description": "increment9_baseline_description", "priority": 1}
    deleted = False
    for operation in scenario["operations"]:
        if operation["method"] == "DELETE":
            deleted = True
        elif not deleted:
            state[operation["field"]] = operation["value"]
    return (404, {}) if deleted else (200, state)


def observation_for(trace: list[dict], epoch_id: str) -> dict | None:
    candidates = [e for e in trace if e.get("epoch_id") == epoch_id and str(e.get("operation_id", "")).endswith("-observe")]
    return candidates[-1] if candidates else None


def evaluate(trace: list[dict], epochs: list[dict], manifest: dict) -> dict:
    epoch_map = {e.get("epoch_id"): e for e in epochs if isinstance(e.get("epoch_id"), str)}
    witnesses = []
    for scenario in manifest["scenarios"]:
        index = scenario["index"]
        scenario_id = scenario["scenario_id"]
        control_id = f"increment9-control-{index}"
        epoch_id = f"increment9-epoch-{index}"
        expected_status, expected_state = expected_after_sequential(scenario)
        control_ops = [e for e in trace if e.get("epoch_id") == control_id and not str(e.get("operation_id", "")).endswith("-observe")]
        control_observation = observation_for(trace, control_id)
        epoch = epoch_map.get(epoch_id)
        adapter_ops = (epoch or {}).get("operations") if isinstance((epoch or {}).get("operations"), list) else []
        proxy_ops = [e for e in trace if e.get("epoch_id") == epoch_id and not str(e.get("operation_id", "")).endswith("-observe")]
        observation = observation_for(trace, epoch_id)
        reason = None
        result = "PASS"

        control_codes = [200 if op["method"] == "PATCH" else 204 for op in scenario["operations"]]
        if len(control_ops) != len(scenario["operations"]) or [e.get("status") for e in control_ops] != control_codes:
            result, reason = "INCONCLUSIVE", "sequential-control-operations-failed-or-missing"
        elif control_observation is None or control_observation.get("status") != expected_status:
            result, reason = "INCONCLUSIVE", "sequential-control-observation-failed"
        elif expected_status == 200 and any(control_observation.get("response", {}).get(k) != v for k, v in expected_state.items() if v is not None):
            result, reason = "INCONCLUSIVE", "sequential-control-semantics-failed"
        elif epoch is None:
            result, reason = "INCONCLUSIVE", "adapter-epoch-missing"
        elif len(adapter_ops) != scenario["width"] or len(proxy_ops) != scenario["width"]:
            result, reason = "INCONCLUSIVE", "operation-count-mismatch"
        elif {e.get("operation_id") for e in adapter_ops} != {e.get("operation_id") for e in proxy_ops}:
            result, reason = "INCONCLUSIVE", "adapter-proxy-correlation-mismatch"
        elif not epoch.get("all_workers_ready_before_release"):
            result, reason = "INCONCLUSIVE", "barrier-readiness-not-proven"
        elif len({e.get("connection_id") for e in adapter_ops}) != scenario["width"]:
            result, reason = "INCONCLUSIVE", "connection-independence-not-proven"
        elif not epoch.get("overlap_observed") or not proxy_overlap(proxy_ops):
            result, reason = "INCONCLUSIVE", "true-overlap-not-proven"
        elif any(e.get("error") for e in adapter_ops):
            result, reason = "INCONCLUSIVE", "transport-error"
        elif observation is None or observation.get("status") not in {200, 404}:
            result, reason = "INCONCLUSIVE", "post-join-observation-missing-or-failed"
        else:
            statuses = {e.get("method"): [] for e in adapter_ops}
            for event in adapter_ops:
                statuses.setdefault(event.get("method"), []).append(event.get("status"))
            observed = observation.get("response") if isinstance(observation.get("response"), dict) else {}
            if any(isinstance(e.get("status"), int) and e["status"] >= 500 for e in adapter_ops):
                result, reason = "CANDIDATE", "overlapping-legal-operation-returned-5xx"
            elif scenario["kind"] == "commutative":
                expected = {o["field"]: o["value"] for o in scenario["operations"] if o["method"] == "PATCH"}
                if any(e.get("status") != 200 for e in adapter_ops):
                    result, reason = "CANDIDATE", "legal-commutative-patch-rejected"
                elif observation.get("status") != 200 or any(observed.get(k) != v for k, v in expected.items()):
                    result, reason = "CANDIDATE", "successful-commutative-update-lost"
            elif scenario["kind"] == "same-field":
                legal = {o["value"] for o in scenario["operations"]}
                if any(e.get("status") != 200 for e in adapter_ops):
                    result, reason = "CANDIDATE", "legal-same-field-patch-rejected"
                elif observation.get("status") != 200 or observed.get("title") not in legal:
                    result, reason = "CANDIDATE", "same-field-final-state-not-linearizable"
            elif scenario["kind"] == "update-delete":
                patch_status = next((e.get("status") for e in adapter_ops if e.get("method") == "PATCH"), None)
                delete_status = next((e.get("status") for e in adapter_ops if e.get("method") == "DELETE"), None)
                if delete_status != 204 or patch_status not in {200, 404} or observation.get("status") != 404:
                    result, reason = "CANDIDATE", "update-delete-outcome-not-linearizable"

        witnesses.append({
            "scenario_id": scenario_id, "kind": scenario["kind"], "epoch_id": epoch_id,
            "result": result, "reason": reason, "width": scenario["width"],
            "adapter_overlap": bool((epoch or {}).get("overlap_observed")),
            "proxy_overlap": proxy_overlap(proxy_ops) if proxy_ops else False,
            "release_skew_ns": (epoch or {}).get("release_skew_ns"),
            "adapter_statuses": [e.get("status") for e in adapter_ops],
            "observation_status": observation.get("status") if observation else None,
            "observed": observation.get("response") if observation else None,
        })

    counts = Counter(w["result"] for w in witnesses)
    if counts["CANDIDATE"]:
        status = "CANDIDATES_FOUND"
    elif counts["INCONCLUSIVE"]:
        status = "INCONCLUSIVE"
    else:
        status = "PASS"
    return {
        "schema_version": 1,
        "experiment": "vikunja-increment9-provengo-concurrency-search",
        "profile": manifest["profile"],
        "run_status": status,
        "confirmed_product_bug": False,
        "candidate_count": counts["CANDIDATE"],
        "counts": {name: counts[name] for name in ("PASS", "CANDIDATE", "INCONCLUSIVE")},
        "confirmation_policy": "Every candidate requires Increment 9.1 direct reproduction without Provengo, proxy, or adapter.",
        "witnesses": witnesses,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--epochs", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    result = evaluate(load_jsonl(Path(args.trace)), load_jsonl(Path(args.epochs)), json.loads(Path(args.manifest).read_text(encoding="utf-8-sig")))
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"run_status": result["run_status"], "counts": result["counts"]}, sort_keys=True))
    print("INCREMENT9_" + result["run_status"])
    return 0 if result["run_status"] == "PASS" else (2 if result["run_status"] == "CANDIDATES_FOUND" else 3)


if __name__ == "__main__":
    raise SystemExit(main())
