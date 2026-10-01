#!/usr/bin/env python3
"""Aggregate high-signal contract candidates across independent generated runs.

The policy is application agnostic.  It consumes only generated evaluator
witnesses and their corresponding HTTP trace events.  Undocumented 2xx and
5xx responses are retained; routine 4xx responses are left in the original
evidence but excluded from confirmation ranking.
"""
from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, Iterable, List


def _json(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def _jsonl(path: Path) -> List[Dict[str, Any]]:
    rows = []
    for index, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines()):
        if line.strip():
            row = json.loads(line)
            row.setdefault("_index", index)
            rows.append(row)
    return rows


def analyze(run_directories: Iterable[Path], minimum_independent_runs: int) -> Dict[str, Any]:
    groups: Dict[tuple[str, int], List[Dict[str, Any]]] = defaultdict(list)
    runs = []
    for run_number, directory in enumerate(run_directories, 1):
        evaluation = _json(directory / "generated-verifier-evaluation.json")
        metadata = _json(directory / "run-metadata.json")
        trace = _jsonl(directory / "http-trace.jsonl")
        by_index = {row["_index"]: row for row in trace}
        retained = 0
        for witness in evaluation.get("witnesses", []):
            if witness.get("result") != "VIOLATED":
                continue
            if witness.get("reason") != "undocumented-response-status":
                continue
            oracle_id = str(witness.get("oracle_id", ""))
            if not oracle_id.startswith("contract::"):
                continue
            status = witness.get("observed", {}).get("status")
            if not isinstance(status, int) or not (200 <= status < 300 or status >= 500):
                continue
            event = by_index.get(witness.get("trigger_event"), {})
            operation_id = oracle_id.split("::", 1)[1]
            groups[(operation_id, status)].append({
                "run_number": run_number,
                "seed": metadata.get("seed"),
                "trigger_event": witness.get("trigger_event"),
                "method": event.get("method"),
                "model_path": event.get("model_path"),
                "request": event.get("request", event.get("request_body")),
                "response": event.get("response"),
            })
            retained += 1
        runs.append({
            "run_number": run_number,
            "seed": metadata.get("seed"),
            "directory": str(directory),
            "run_status": evaluation.get("run_status"),
            "high_signal_observations": retained,
        })

    candidates = []
    for (operation_id, status), observations in sorted(groups.items()):
        independent_runs = sorted({item["run_number"] for item in observations})
        reproduced = len(independent_runs) >= minimum_independent_runs
        category = "UNDOCUMENTED_SUCCESS" if 200 <= status < 300 else "SERVER_FAILURE"
        if reproduced and category == "UNDOCUMENTED_SUCCESS":
            confirmation = "CONFIRMED_CONTRACT_DEVIATION"
        elif reproduced:
            confirmation = "REPRODUCIBLE_SERVER_FAILURE_CANDIDATE"
        else:
            confirmation = "NOT_YET_REPRODUCED"
        candidates.append({
            "operation_id": operation_id,
            "status": status,
            "category": category,
            "confirmation": confirmation,
            "independent_run_count": len(independent_runs),
            "observation_count": len(observations),
            "schema_validity_basis": "evaluator-VIOLATED-not-invalid-test-input",
            "observations": observations,
        })

    confirmed_contract = sum(c["confirmation"] == "CONFIRMED_CONTRACT_DEVIATION"
                             for c in candidates)
    reproduced_failures = sum(c["confirmation"] == "REPRODUCIBLE_SERVER_FAILURE_CANDIDATE"
                              for c in candidates)
    if reproduced_failures:
        status = "REPRODUCIBLE_SERVER_FAILURE_CANDIDATES"
    elif confirmed_contract:
        status = "CONFIRMED_CONTRACT_DEVIATIONS"
    elif candidates:
        status = "CANDIDATES_NOT_YET_REPRODUCED"
    else:
        status = "NO_HIGH_SIGNAL_CANDIDATES"
    return {
        "schema_version": 1,
        "stage": "generic-independent-prefix-confirmation",
        "status": status,
        "policy": {
            "included_status_classes": ["undocumented-2xx", "undocumented-5xx"],
            "minimum_independent_runs": minimum_independent_runs,
            "manual_application_assumptions": 0,
            "claim_boundary": "5xx is a reproducible candidate, not a confirmed product bug, until semantic preconditions are established",
        },
        "totals": {
            "runs": len(runs),
            "candidate_groups": len(candidates),
            "confirmed_contract_deviations": confirmed_contract,
            "reproducible_server_failure_candidates": reproduced_failures,
        },
        "runs": runs,
        "candidates": candidates,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", action="append", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--csv", required=True)
    parser.add_argument("--minimum-independent-runs", type=int, default=3)
    args = parser.parse_args()
    if args.minimum_independent_runs < 2:
        parser.error("--minimum-independent-runs must be at least 2")
    result = analyze([Path(item) for item in args.run], args.minimum_independent_runs)
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True), encoding="utf-8")
    with Path(args.csv).open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=[
            "operation_id", "status", "category", "confirmation",
            "independent_run_count", "observation_count"])
        writer.writeheader()
        for candidate in result["candidates"]:
            writer.writerow({key: candidate[key] for key in writer.fieldnames})
    print(json.dumps({"status": result["status"], **result["totals"]}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
