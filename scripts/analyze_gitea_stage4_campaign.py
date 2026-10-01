#!/usr/bin/env python3
"""Aggregate Stage 4 executions without application-specific assumptions."""
from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from pathlib import Path


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def jsonl(path: Path):
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines()
            if line.strip()]


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", action="append", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--csv", required=True, type=Path)
    parser.add_argument("--minimum-unique-oracles", type=int, default=7)
    parser.add_argument("--minimum-producer-families", type=int, default=2)
    args = parser.parse_args(argv)

    rows, run_rows = [], []
    unique_oracles, producer_families = set(), set()
    outcomes = Counter()
    for run_number, run in enumerate(args.run, 1):
        plans = list(run.glob("concurrency-plan.*.json"))
        metadata_path = run / "run-metadata.json"
        evaluation_path = run / "generated-verifier-evaluation.json"
        if not plans or not metadata_path.exists():
            raise SystemExit(f"incomplete Stage 3 run: {run}")
        plan = load(plans[0])
        metadata = load(metadata_path)
        evaluation = load(evaluation_path) if evaluation_path.exists() else {}
        producer_by_oracle = {
            item["oracle_id"]: item.get("runtime", {}).get("create_operation_id", "")
            for item in plan.get("oracles", [])
        }
        epochs = jsonl(run / "concurrent-epochs.jsonl")
        before = len(unique_oracles)
        for epoch in epochs:
            oracle_id = epoch.get("scenario", "")
            producer = producer_by_oracle.get(oracle_id, "")
            if oracle_id:
                unique_oracles.add(oracle_id)
            if producer:
                producer_families.add(producer)
            rows.append({
                "run": run_number,
                "seed": metadata.get("seed"),
                "oracle_id": oracle_id,
                "producer_operation_id": producer,
                "epoch_id": epoch.get("epoch_id"),
                "width": epoch.get("width"),
                "overlap_observed": epoch.get("overlap_observed"),
                "release_skew_ns": epoch.get("release_skew_ns"),
            })
        status = evaluation.get("run_status", "INCONCLUSIVE")
        outcomes[status] += 1
        run_rows.append({
            "run": run_number,
            "seed": metadata.get("seed"),
            "directory": str(run),
            "epochs": len(epochs),
            "new_unique_oracles": len(unique_oracles) - before,
            "cumulative_unique_oracles": len(unique_oracles),
            "run_status": status,
        })

    passed = (len(unique_oracles) >= args.minimum_unique_oracles and
              len(producer_families) >= args.minimum_producer_families)
    result = {
        "schema_version": 1,
        "stage": "gitea-stage4-reachability-aware-multiseed-campaign",
        "status": "PASS" if passed else "INCOMPLETE",
        "method": "OpenAPI-derived resource bridge plus cumulative multi-seed coverage",
        "manual_application_assumptions": 0,
        "acceptance": {
            "minimum_unique_oracles": args.minimum_unique_oracles,
            "minimum_producer_families": args.minimum_producer_families,
        },
        "runs": run_rows,
        "totals": {
            "runs": len(run_rows),
            "epochs": len(rows),
            "unique_oracles": len(unique_oracles),
            "producer_families": len(producer_families),
            "outcomes": dict(sorted(outcomes.items())),
        },
        "unique_oracle_ids": sorted(unique_oracles),
        "producer_operation_ids": sorted(producer_families),
    }
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with args.csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]) if rows else [
            "run", "seed", "oracle_id", "producer_operation_id", "epoch_id",
            "width", "overlap_observed", "release_skew_ns"])
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps({"status": result["status"], **result["totals"]}, sort_keys=True))
    return 0 if passed else 3


if __name__ == "__main__":
    raise SystemExit(main())
