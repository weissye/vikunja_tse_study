#!/usr/bin/env python3
"""Extract and compare semantic BP schedules from preserved Provengo logs."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

SELECTED = re.compile(r"Selected:\s*\[([^\]]+)\]")
SEMANTIC_PREFIXES = ("Permit:", "Intent:", "State:", "Milestone:",
                     "InterleavedRelationalLifecycleComplete",
                     "InterleavedRelationalExplorationComplete")


def read_powershell_log(path: Path) -> str:
    """Decode logs written by either PowerShell 5.1 or modern PowerShell.

    Windows PowerShell's Tee-Object commonly writes UTF-16LE, sometimes
    without a BOM.  Decoding that as UTF-8 leaves NUL bytes between every
    character, causing the Selected-event regex to silently match nothing.
    """
    raw = path.read_bytes()
    if raw.startswith((b"\xff\xfe", b"\xfe\xff")):
        return raw.decode("utf-16")
    sample = raw[: min(len(raw), 4096)]
    if sample and sample.count(b"\x00") > len(sample) // 8:
        return raw.decode("utf-16-le")
    return raw.decode("utf-8-sig", errors="replace")


def extract(path: Path) -> list[str]:
    result = []
    for line in read_powershell_log(path).splitlines():
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
        permit_events = [event for event in events if event.startswith("Permit:")]
        if not intent_events:
            raise RuntimeError(
                f"No Intent events parsed from {run / 'provengo-run.log'}; "
                "check the log encoding and format."
            )
        canonical = "\n".join(intent_events)
        schedules.append({
            "run_directory": run.name,
            "seed": metadata["seed"],
            "semantic_event_count": len(events),
            "intent_event_count": len(intent_events),
            "permit_event_count": len(permit_events),
            "permit_schedule_sha256": hashlib.sha256("\n".join(permit_events).encode()).hexdigest(),
            "permit_schedule": permit_events,
            "intent_schedule_sha256": hashlib.sha256(canonical.encode()).hexdigest(),
            "intent_schedule": intent_events,
        })
    distinct = len({item["intent_schedule_sha256"] for item in schedules})
    distinct_permits = len({item["permit_schedule_sha256"] for item in schedules})
    result = {
        "analysis": "Provengo semantic-intent schedule comparison",
        "run_count": len(schedules),
        "distinct_intent_schedules": distinct,
        "distinct_permit_schedules": distinct_permits,
        "schedule_variation_observed": distinct >= 2,
        "permit_schedule_variation_observed": distinct_permits >= 2,
        "all_schedules_distinct": distinct == len(schedules),
        "schedules": schedules,
    }
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in result.items() if key != "schedules"}, indent=2))
    raise SystemExit(2 if args.require_variation and not result["schedule_variation_observed"] else 0)


if __name__ == "__main__":
    main()
