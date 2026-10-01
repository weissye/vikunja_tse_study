#!/usr/bin/env python3
"""Extract and compare semantic BP schedules from preserved Provengo logs."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

SELECTED = re.compile(r"Selected:\s*\[([^\]]+)\]")
SEMANTIC_PREFIXES = ("Intent:", "State:", "Milestone:", "InterleavedRelationalLifecycleComplete")


def extract(path: Path) -> list[str]:
    result = []
    for line in path.read_text(encoding="utf-8-sig", errors="replace").splitlines():
        match = SELECTED.search(line)
        if not match:
            continue
        event = match.group(1).strip()
        if event.startswith(SEMANTIC_PREFIXES):
            # Keep event data: it is redacted semantic state, and distinguishes
            # choices that share a name but carry different runtime values.
            result.append(event)
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", action="append", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--require-variation", action="store_true")
    args = parser.parse_args()
    schedules = []
    for run_value in args.run:
        run = Path(run_value)
        metadata = json.loads((run / "run-metadata.json").read_text(encoding="utf-8-sig"))
        events = extract(run / "provengo-run.log")
        intent_events = [event for event in events if event.startswith("Intent:")]
        canonical = "\n".join(intent_events)
        schedules.append({
            "run_directory": run.name,
            "seed": metadata["seed"],
            "semantic_event_count": len(events),
            "intent_event_count": len(intent_events),
            "intent_schedule_sha256": hashlib.sha256(canonical.encode()).hexdigest(),
            "intent_schedule": intent_events,
        })
    distinct = len({item["intent_schedule_sha256"] for item in schedules})
    result = {
        "analysis": "Provengo semantic-intent schedule comparison",
        "run_count": len(schedules),
        "distinct_intent_schedules": distinct,
        "schedule_variation_observed": distinct >= 2,
        "all_schedules_distinct": distinct == len(schedules),
        "schedules": schedules,
    }
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in result.items() if key != "schedules"}, indent=2))
    raise SystemExit(2 if args.require_variation and not result["schedule_variation_observed"] else 0)


if __name__ == "__main__":
    main()
