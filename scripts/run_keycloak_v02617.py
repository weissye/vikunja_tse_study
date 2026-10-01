#!/usr/bin/env python3
"""Reevaluate Keycloak's OpenAPI with the installed, independent 0.26.17 generator."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--spec", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    package = root / "generator_baseline"
    if not (package / "openapi_to_sbt" / "inference" / "entities.py").is_file():
        parser.error("Run from the extracted project containing generator_baseline")
    spec = args.spec.resolve()
    raw = json.loads(spec.read_text(encoding="utf-8-sig"))
    if not str(raw.get("openapi", "")).startswith("3.") or "Keycloak Admin REST API" not in raw.get("info", {}).get("title", ""):
        parser.error("Expected the Keycloak Admin REST API OpenAPI 3 specification")
    out = args.out.resolve()
    if out.exists() and any(out.iterdir()):
        parser.error("Output directory must be new/empty, to preserve previous evidence")
    out.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ)
    env["PYTHONPATH"] = str(package) + os.pathsep + env.get("PYTHONPATH", "")
    version = subprocess.run([sys.executable, "-m", "openapi_to_sbt", "--version"], env=env,
                             capture_output=True, text=True)
    if version.returncode or version.stdout.strip() != "0.26.17":
        parser.error("Installed generator must report version 0.26.17")
    command = [sys.executable, "-m", "openapi_to_sbt", "generate", "--openapi", str(spec),
               "--output", str(out / "generated"), "--name", "keycloak_stage2",
               "--base-url", "http://127.0.0.1:9928", "--seed", "20261901",
               "--instances-per-entity", "3", "--instances-per-action", "1",
               "--story-profile", "long-interleaving", "--long-story-min-rounds", "10",
               "--long-story-max-rounds", "10", "--emit-prefix-witnesses"]
    result = subprocess.run(command, env=env, capture_output=True, text=True)
    (out / "generator.log").write_text(result.stdout + result.stderr, encoding="utf-8")
    if result.returncode:
        print("GENERATOR_FAILED", result.returncode, "log=", out / "generator.log")
        return result.returncode
    report = json.loads((out / "generated" / "generation_report.json").read_text(encoding="utf-8"))
    graph = json.loads((out / "generated" / "dependency_graph.json").read_text(encoding="utf-8"))
    unsupported = report.get("unsupported_constructs", {})
    summary = {
        "basis": "OpenAPI-only; structural inference, not runtime feasibility or a bug finding",
        "generator_version": "0.26.17", "openapi_sha256": digest(spec),
        "covered_operations": report.get("coverage", {}).get("covered_operations"),
        "entities": len(report.get("entities", [])), "dependency_nodes": len(graph.get("nodes", [])),
        "dependency_edges": len(graph.get("edges", [])),
        "unsupported_constructs": sum(len(unsupported.get(k, [])) for k in ("document_level", "remote_refs")),
        "inference_ambiguities": len(unsupported.get("ambiguities", [])),
        "warnings": len(report.get("warnings", [])),
        "runtime_verified_entities": 0, "runtime_verified_edges": 0,
        "runtime_status": "NOT_RUN",
    }
    (out / "stage2-summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    with (out / "SHA256SUMS.txt").open("w", encoding="utf-8") as sums:
        for file in sorted(out.rglob("*")):
            if file.is_file() and file.name != "SHA256SUMS.txt":
                sums.write(f"{digest(file)}  {file.relative_to(out).as_posix()}\n")
    print("STAGE2_V02617_PREFLIGHT", json.dumps(summary, sort_keys=True))
    print("STAGE2_OUTPUT", out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
