#!/usr/bin/env python3
"""Classify a scale/seed campaign without turning infrastructure failures into bugs."""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runs", required=True)
    parser.add_argument("--prefix", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    root = Path(args.runs)
    records = []
    # A campaign run tag records the generated scale before the seed, e.g.
    # phase6-bug-search-<stamp>-tasks-12-seed-20261401-<run stamp>.
    for metadata_path in sorted(root.glob(f"{args.prefix}-tasks-*-seed-*/run-metadata.json")):
        run = metadata_path.parent
        metadata = json.loads(metadata_path.read_text(encoding="utf-8-sig"))
        evaluation_path = run / "phase5-interleaved-bp-evaluation.json"
        evaluation = (json.loads(evaluation_path.read_text(encoding="utf-8-sig"))
                      if evaluation_path.exists() else None)
        anomalies = evaluation.get("anomalies", []) if evaluation else []
        execution_ok = (metadata.get("provengo_exit_code") == 0 and
                        metadata.get("deletion_probe_exit_code") == 0)
        if evaluation is None or not execution_ok:
            classification = "infrastructure_or_execution_failure"
        elif anomalies:
            classification = "semantic_bug_candidate"
        elif not evaluation.get("phase5_bp_passed", False):
            classification = "oracle_failure_requires_triage"
        else:
            classification = "pass"
        records.append({
            "run_directory": run.name,
            "seed": metadata.get("seed"),
            "expected_tasks": metadata.get("expected_tasks"),
            "classification": classification,
            "anomalies": anomalies,
            "evaluation": evaluation,
        })
    counts = Counter(record["classification"] for record in records)
    result = {
        "campaign": "Vikunja OpenAPI-derived SBT/BP interleaving bug search",
        "run_count": len(records),
        "classification_counts": dict(sorted(counts.items())),
        "bug_candidates": [r for r in records if r["classification"] == "semantic_bug_candidate"],
        "triage_required": [r for r in records if r["classification"] != "pass"],
        "runs": records,
        "interpretation": (
            "A non-pass is not automatically a product bug. Only a reproducible semantic "
            "oracle violation, after excluding harness and contract causes, is a bug candidate."
        ),
    }
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k not in {"runs", "triage_required"}},
                     indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
