#!/usr/bin/env python3
"""Audit actual REST requests in a Provengo sample; never infer server outcomes."""
import argparse
from collections import Counter
import json
from pathlib import Path


def audit(document, *, required_prefix=8):
    scenarios = document if isinstance(document, list) else next(
        (document[k] for k in ("scenarios", "runs", "samples")
         if isinstance(document.get(k), list)), None)
    if not isinstance(scenarios, list):
        raise ValueError("unrecognized Provengo sample container")
    report = {"schema_version": 1, "scenarios": len(scenarios),
              "complete_rest_schedules": 0, "families": Counter(),
              "instances": Counter(), "missing": Counter(),
              "prefix_rounds_requested": required_prefix,
              "http_executed": False, "actual_overlap": "NOT_MEASURED",
              "oracle_verdicts": "NOT_EVALUATED"}
    for scenario in scenarios:
        events = scenario if isinstance(scenario, list) else scenario.get("events")
        if not isinstance(events, list):
            raise ValueError("unrecognized scenario events")
        if any(not isinstance(e, dict) for e in events):
            raise ValueError("unrecognized event")
        chosen = next((e["data"] for e in events if e.get("name") == "SBT:ScheduleChosen"
                       and isinstance(e.get("data"), dict)), None)
        if chosen is None:
            report["missing"]["selection"] += 1
            continue
        report["families"][str(chosen.get("kind"))] += 1
        report["instances"][str(chosen.get("instance"))] += 1
        rest = [(e["data"].get("method"), e["data"].get("url"))
                for e in events if isinstance(e.get("data"), dict)
                and e["data"].get("lib") == "REST"]
        markers = [e.get("name") for e in events]
        rounds = {e["data"].get("round") for e in events
                  if e.get("name") == "SBT:PrefixRoundScheduled"
                  and isinstance(e.get("data"), dict)}
        orders = {e["data"].get("order") for e in events
                  if e.get("name") == "SBT:SerialOrderScheduled"
                  and isinstance(e.get("data"), dict)}
        writes = {e["data"].get("operation") for e in events
                  if e.get("name") == "SBT:ConcurrentWriteScheduled"
                  and isinstance(e.get("data"), dict)}
        conditions = {
            "real_rest_events": bool(rest),
            "create_user": any(method == "POST" and "/users" in str(url)
                               for method, url in rest),
            "prefix": rounds == set(range(1, required_prefix + 1)),
            "both_serial_orders": orders == {"AB", "BA"},
            "two_concurrent_write_intents": writes == {"A", "B"},
            "post_join_read": bool(rest) and rest[-1][0] == "GET",
        }
        missing = [name for name, ok in conditions.items() if not ok]
        if missing:
            report["missing"].update(missing)
        else:
            report["complete_rest_schedules"] += 1
    report["families"] = dict(sorted(report["families"].items()))
    report["instances"] = dict(sorted(report["instances"].items()))
    report["missing"] = dict(sorted(report["missing"].items()))
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--prefix-rounds", type=int, default=8)
    args = parser.parse_args()
    report = audit(json.loads(args.input.read_text(encoding="utf-8")),
                   required_prefix=args.prefix_rounds)
    args.out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("SBT_RUNTIME_SAMPLE_AUDIT", json.dumps(report, sort_keys=True))
    if report["scenarios"] == 0 or report["complete_rest_schedules"] != report["scenarios"]:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
