#!/usr/bin/env python3
"""Compare canonical SQLite and PostgreSQL Increment 8.x evaluations."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


RESULT_KEYS = ("PASS", "LOST_UPDATE", "SERVER_FAILURE", "CONTRACT_REJECTION", "INCONCLUSIVE")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalized_counts(evaluation: dict[str, Any]) -> dict[str, int]:
    counts = evaluation.get("counts") or {}
    return {key: int(counts.get(key, 0)) for key in RESULT_KEYS}


def classify(sqlite: dict[str, int], postgres: dict[str, int], postgres_trials: int) -> str:
    if postgres["INCONCLUSIVE"] or postgres_trials == 0:
        return "INCONCLUSIVE"
    if postgres["PASS"] == postgres_trials:
        return "DEFECTS_NOT_REPRODUCED_ON_POSTGRES"
    has_lost = postgres["LOST_UPDATE"] > 0
    has_server = postgres["SERVER_FAILURE"] > 0
    if has_lost and has_server:
        return "BOTH_DEFECT_FAMILIES_REPRODUCED_ON_POSTGRES"
    if has_lost:
        return "SQLITE_LOCK_FAILURE_NOT_REPRODUCED_BUT_LOST_UPDATE_IS_CROSS_BACKEND"
    if has_server:
        return "SERVER_FAILURE_REPRODUCED_ON_POSTGRES"
    if postgres["CONTRACT_REJECTION"]:
        return "POSTGRES_CONTRACT_REJECTION"
    return "MIXED_OR_UNCLASSIFIED"


def build_comparison(sqlite_path: Path, postgres_path: Path) -> dict[str, Any]:
    sqlite_eval = json.loads(sqlite_path.read_text(encoding="utf-8-sig"))
    postgres_eval = json.loads(postgres_path.read_text(encoding="utf-8-sig"))
    sqlite_counts = normalized_counts(sqlite_eval)
    postgres_counts = normalized_counts(postgres_eval)
    sqlite_trials = int(sqlite_eval.get("trial_count", sum(sqlite_counts.values())))
    postgres_trials = int(postgres_eval.get("trial_count", sum(postgres_counts.values())))
    status = classify(sqlite_counts, postgres_counts, postgres_trials)
    return {
        "schema_version": 1,
        "experiment": "vikunja-increment8.2-postgresql-differential",
        "comparison_status": status,
        "controlled_variable": "database backend",
        "held_constant": [
            "Vikunja image digest",
            "direct confirmation harness",
            "two disjoint PATCH operations",
            "two pre-connected independent HTTP connections",
            "barrier release",
            "100 ms quiescence",
            "independent post-join GET",
            "20 fresh-task trials",
        ],
        "sqlite": {
            "evaluation_sha256": sha256(sqlite_path),
            "trial_count": sqlite_trials,
            "counts": sqlite_counts,
        },
        "postgres": {
            "evaluation_sha256": sha256(postgres_path),
            "trial_count": postgres_trials,
            "counts": postgres_counts,
        },
        "rate_difference_postgres_minus_sqlite": {
            key: (postgres_counts[key] / postgres_trials if postgres_trials else None)
            - (sqlite_counts[key] / sqlite_trials if sqlite_trials else 0)
            if postgres_trials else None
            for key in RESULT_KEYS
        },
        "claim_scope": "Vikunja v2.6.0 in the two locally captured single-instance Docker configurations",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sqlite", required=True)
    parser.add_argument("--postgres", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    result = build_comparison(Path(args.sqlite), Path(args.postgres))
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"comparison_status": result["comparison_status"], "sqlite": result["sqlite"]["counts"], "postgres": result["postgres"]["counts"]}, sort_keys=True))
    print(f"INCREMENT8_2_{result['comparison_status']}")
    return 3 if result["comparison_status"] == "INCONCLUSIVE" else 0


if __name__ == "__main__":
    raise SystemExit(main())
