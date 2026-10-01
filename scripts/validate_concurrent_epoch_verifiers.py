#!/usr/bin/env python3
"""Independent external oracle for Increment 8 true concurrent epochs."""
import argparse
import json
from datetime import datetime
from pathlib import Path


def load_jsonl(path):
    events = []
    decoder = json.JSONDecoder()
    text = Path(path).read_text(encoding="utf-8-sig").replace("\x00", "")
    for line_number, line in enumerate(text.splitlines(), 1):
        remaining = line.strip().lstrip("\ufeff")
        while remaining:
            try:
                value, end = decoder.raw_decode(remaining)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Malformed JSONL line {line_number}, column {exc.colno}") from exc
            if not isinstance(value, dict):
                raise ValueError(f"Invalid object at line {line_number}")
            value.setdefault("_index", len(events))
            events.append(value)
            remaining = remaining[end:].strip()
    return events


def parse_time(value):
    return datetime.fromisoformat(str(value).replace("Z", "+00:00"))


def proxy_overlap(events):
    try:
        latest_start = max(parse_time(e["upstream_started_utc"]) for e in events)
        earliest_end = min(parse_time(e["upstream_completed_utc"]) for e in events)
        return latest_start < earliest_end
    except (KeyError, TypeError, ValueError):
        return False


def evaluate(trace, epochs, manifest):
    for event_index, event in enumerate(trace):
        event.setdefault("_index", event_index)
    expected = int(manifest["oracle"]["expected_witness_count"])
    prefix = manifest.get("prefix", "increment8_")
    by_epoch = {e.get("epoch_id"): e for e in epochs if isinstance(e.get("epoch_id"), str)}
    witnesses = []
    for index in range(expected):
        epoch_id = f"increment8-task-{index}"
        epoch = by_epoch.get(epoch_id)
        reason = None
        result = "PASS"
        adapter_ops = (epoch or {}).get("operations") if epoch else None
        adapter_ops = adapter_ops if isinstance(adapter_ops, list) else []
        proxy_ops = [e for e in trace if e.get("epoch_id") == epoch_id and e.get("operation_id")]
        op_ids = {op.get("operation_id") for op in adapter_ops}
        proxy_ids = {op.get("operation_id") for op in proxy_ops}
        fields = {}
        path = None
        if epoch is None:
            result, reason = "INCONCLUSIVE", "epoch-evidence-missing"
        elif len(adapter_ops) != 2 or len(proxy_ops) != 2 or op_ids != proxy_ids:
            result, reason = "INCONCLUSIVE", "adapter-proxy-operation-mismatch"
        else:
            for event in proxy_ops:
                body = event.get("request") if isinstance(event.get("request"), dict) else {}
                if len(body) == 1:
                    field, value = next(iter(body.items()))
                    if field in {"title", "description"} and isinstance(value, str) and value.startswith(prefix):
                        fields[field] = value
                path = path or event.get("model_path")
                if event.get("model_path") != path:
                    result, reason = "INCONCLUSIVE", "epoch-targets-differ"
            if set(fields) != {"title", "description"}:
                result, reason = "INCONCLUSIVE", "disjoint-fields-not-proven"
            elif not epoch.get("all_workers_ready_before_release"):
                result, reason = "INCONCLUSIVE", "barrier-readiness-not-proven"
            elif not epoch.get("overlap_observed") or not proxy_overlap(proxy_ops):
                result, reason = "INCONCLUSIVE", "physical-overlap-not-proven"
            elif any(op.get("error") for op in adapter_ops):
                result, reason = "INCONCLUSIVE", "transport-error"
            elif any(op.get("status") != 200 for op in adapter_ops) or any(op.get("status") != 200 for op in proxy_ops):
                result, reason = "VIOLATED", "legal-concurrent-patch-failed"

        last_trigger = max((e["_index"] for e in proxy_ops), default=-1)
        observation = next((e for e in trace[last_trigger + 1:] if e.get("method") == "GET" and e.get("model_path") == path), None) if path else None
        observed = observation.get("response") if observation and isinstance(observation.get("response"), dict) else {}
        if result == "PASS" and observation is None:
            result, reason = "INCONCLUSIVE", "post-join-observation-missing"
        elif result == "PASS" and observation.get("status") != 200:
            result, reason = "VIOLATED", "post-join-observation-failed"
        elif result == "PASS" and (observed.get("title") != fields.get("title") or observed.get("description") != fields.get("description")):
            result, reason = "VIOLATED", "successful-concurrent-patch-lost"
        witness = {
            "oracle_id": "concurrent-disjoint-patches-both-visible",
            "epoch_id": epoch_id,
            "resource_path": path,
            "adapter_overlap": bool((epoch or {}).get("overlap_observed")),
            "proxy_overlap": proxy_overlap(proxy_ops) if len(proxy_ops) == 2 else False,
            "release_skew_ns": (epoch or {}).get("release_skew_ns"),
            "trigger_events": sorted(e["_index"] for e in proxy_ops),
            "observation_event": observation.get("_index") if observation else None,
            "expected": {"title": fields.get("title"), "description": fields.get("description")},
            "observed": {"status": observation.get("status") if observation else None, "title": observed.get("title"), "description": observed.get("description")},
            "result": result,
        }
        if reason:
            witness["reason"] = reason
        witnesses.append(witness)

    counts = {state: sum(w["result"] == state for w in witnesses) for state in ("PASS", "VIOLATED", "INCONCLUSIVE")}
    if counts["VIOLATED"]:
        run_status = "SEMANTIC_ANOMALY"
    elif counts["INCONCLUSIVE"] or len(by_epoch) != expected:
        run_status = "INCONCLUSIVE"
    else:
        run_status = "PASS"
    return {
        "profile": "provengo-native-true-concurrent-disjoint-patches",
        "evaluation_basis": "Provengo-declared epochs plus adapter and proxy interval evidence plus post-join HTTP observation",
        "run_status": run_status,
        "bug_candidate": run_status == "SEMANTIC_ANOMALY",
        "confirmed_product_bug": False,
        "confirmation_policy": "Reproduce twice, minimize the BP epoch, pass the sequential control, and exclude adapter, proxy, timing, contract and observation causes.",
        "oracle_summary": {"concurrent-disjoint-patches-both-visible": {"status": run_status, "witness_count": len(witnesses), "expected_witness_count": expected, "counts": counts}},
        "witness_count": len(witnesses),
        "witnesses": witnesses,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--epochs", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    result = evaluate(load_jsonl(args.trace), load_jsonl(args.epochs), json.loads(Path(args.manifest).read_text(encoding="utf-8-sig")))
    text = json.dumps(result, indent=2, sort_keys=True)
    Path(args.output).write_text(text + "\n", encoding="utf-8")
    print(text)
    raise SystemExit(0 if result["run_status"] == "PASS" else 2)


if __name__ == "__main__":
    main()
