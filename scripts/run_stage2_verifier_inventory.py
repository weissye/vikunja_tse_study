#!/usr/bin/env python3
"""Generate generic OpenAPI verifiers and report runtime readiness honestly."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--spec", type=Path, required=True)
    ap.add_argument("--generated", type=Path, required=True)
    ap.add_argument("--gate", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--prefix-rounds", type=int, default=8)
    args = ap.parse_args()
    if args.out.exists() and any(args.out.iterdir()):
        ap.error("Output directory is nonempty; preserve previous evidence")
    if not 1 <= args.prefix_rounds <= 16:
        ap.error("prefix-rounds must be 1..16")
    spec_hash = hashlib.sha256(args.spec.read_bytes()).hexdigest()
    gate = json.loads(args.gate.read_text(encoding="utf-8"))
    report_path = args.generated / "generation_report.json"
    report = json.loads(report_path.read_text(encoding="utf-8"))
    cli = report.get("meta", {}).get("cli_args", {})
    if cli.get("generator_version") != "0.26.17" or cli.get("source_openapi_sha256") != spec_hash:
        ap.error("Generated model must be the 0.26.17 output for the selected spec")
    if (gate.get("openapi_sha256") != spec_hash or
            gate.get("runtime_status") != "LIVE_PREREQUISITES_VERIFIED" or
            gate.get("runtime_verified_edges", 0) < 1 or
            gate.get("prefix_verified_rounds", 0) < args.prefix_rounds):
        ap.error("Runtime gate is incomplete or belongs to a different specification")
    args.out.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ)
    env["PYTHONPATH"] = str(Path(__file__).resolve().parent.parent / "generator_baseline") + os.pathsep + env.get("PYTHONPATH", "")
    command = [sys.executable, "-m", "openapi_to_sbt.verification_cli",
               "--openapi", str(args.spec.resolve()), "--output", str(args.out.resolve()),
               "--name", "keycloak_stage2", "--max-field-pairs", "4",
               "--max-concurrency-width", "2", "--combined-campaign",
               "--prefix-before-concurrency", str(args.prefix_rounds),
               "--post-join-observation", "--require-serial-controls",
               "--generation-report", str(report_path.resolve())]
    run = subprocess.run(command, env=env, capture_output=True, text=True)
    (args.out / "generator-verifiers.log").write_text(run.stdout + run.stderr, encoding="utf-8")
    if run.returncode:
        print("VERIFIER_GENERATION_FAILED", run.returncode, "log=", args.out / "generator-verifiers.log")
        return run.returncode
    plan = json.loads((args.out / "concurrency-plan.keycloak_stage2.json").read_text(encoding="utf-8"))
    oracles = plan.get("oracles", [])
    item = "/admin/realms/{realm}/users/{user-id}"
    target = [o for o in oracles if o.get("path_template") == item or item in o.get("oracle_id", "")]
    summary = {
        "schema_version": 1, "basis": "OpenAPI-derived verifier preflight plus separate live prerequisite gate",
        "generator_version": "0.26.17", "openapi_sha256": spec_hash,
        "live_gate_status": gate["runtime_status"], "live_gate_verified_edges": gate["runtime_verified_edges"],
        "live_gate_prefix_rounds": gate["prefix_verified_rounds"],
        "generated_oracles": len(oracles),
        "runtime_ready_oracles": sum(o.get("runtime", {}).get("ready") is True for o in oracles),
        "user_update_candidates": len(target),
        "user_update_ready": sum(o.get("runtime", {}).get("ready") is True for o in target),
        "user_limitations": sorted({o.get("runtime", {}).get("limitation") for o in target
                                    if o.get("runtime", {}).get("limitation")}),
        "client_interval_overlap": "NOT_RUN", "oracle_verdicts": "NOT_RUN",
        "note": "Live Location binding must not silently promote an OpenAPI-only candidate to runtime ready",
    }
    (args.out / "readiness-summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print("KEYCLOAK_STAGE2_VERIFIER_INVENTORY", json.dumps(summary, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
