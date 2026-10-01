#!/usr/bin/env python3
"""Generate a fifth-system feasibility report without starting an API server."""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

FREEZE_HASH = "9eab47aa38443d8f0a93987ec7059726658a7e21a7e5d4449cf31482c2db05ac"
HTTP = {"get", "post", "put", "patch", "delete", "options", "head", "trace"}
ITEM_SEGMENT = re.compile(r"\{[^{}]+\}\Z")


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", type=Path, required=True)
    ap.add_argument("--freeze", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()
    spec = json.loads(args.spec.read_text(encoding="utf-8-sig"))
    if not str(spec.get("openapi", "")).startswith("3.") or "Keycloak Admin REST API" not in spec.get("info", {}).get("title", ""):
        ap.error("Expected the official Keycloak Admin REST API OpenAPI 3 contract")
    if sha(args.freeze) != FREEZE_HASH:
        ap.error("Frozen generator hash changed; do not silently upgrade the baseline")
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    contract = out / "keycloak-admin-openapi.json"
    contract.write_bytes(args.spec.read_bytes())
    paths = spec.get("paths", {})
    operations = [(path, method, value) for path, item in paths.items()
                  if isinstance(item, dict) for method, value in item.items()
                  if method.lower() in HTTP and isinstance(value, dict)]
    structural_pairs = []
    for collection, definition in paths.items():
        if not isinstance(definition, dict) or "post" not in definition:
            continue
        for item, item_definition in paths.items():
            if (item.startswith(collection.rstrip("/") + "/")
                    and ITEM_SEGMENT.fullmatch(item.rsplit("/", 1)[-1])
                    and item.count("/") == collection.count("/") + 1
                    and isinstance(item_definition, dict) and "get" in item_definition):
                structural_pairs.append({"collection": collection, "item": item})
    raw = {"openapi_sha256": sha(contract), "freeze_sha256": sha(args.freeze),
           "paths": len(paths), "operations": len(operations),
           "methods": {m: sum(method == m for _, method, _ in operations)
                       for m in sorted({m for _, m, _ in operations})},
           "path_parameter_depth": {str(n): sum(path.count("{") == n for path in paths)
                                    for n in range(1, max((p.count("{") for p in paths), default=0)+1)},
           "security_schemes": list(spec.get("components", {}).get("securitySchemes", {})),
           "structural_post_get_pairs": len(structural_pairs),
           "structural_pairs": structural_pairs}
    (out / "raw-inventory.json").write_text(json.dumps(raw, indent=2) + "\n")
    with tempfile.TemporaryDirectory() as workspace:
        temp = Path(workspace)
        with zipfile.ZipFile(args.freeze) as z:
            for i in z.infolist():
                name = Path(i.filename)
                if name.is_absolute() or ".." in name.parts:
                    ap.error("Unsafe member in the frozen ZIP")
            z.extractall(temp)
        verified = subprocess.run([sys.executable, str(temp / "verify_freeze.py"), str(args.freeze)],
                                  capture_output=True, text=True)
        (out / "freeze-check.log").write_text(verified.stdout + verified.stderr)
        if verified.returncode:
            ap.error("Frozen generator integrity check failed; inspect freeze-check.log")
        env = dict(os.environ)
        env["PYTHONPATH"] = str(temp / "baseline" / "generator_baseline")
        version = subprocess.run([sys.executable, "-m", "openapi_to_sbt", "--version"],
                                 env=env, capture_output=True, text=True)
        if version.returncode or version.stdout.strip() != "0.26.16":
            ap.error("Generator source did not report 0.26.16")
        cmd = [sys.executable, "-m", "openapi_to_sbt", "generate", "--openapi", str(contract),
               "--output", str(out / "generated"), "--name", "keycloak_stage2",
               "--base-url", "http://127.0.0.1:9928", "--seed", "20261901",
               "--instances-per-entity", "3", "--instances-per-action", "1",
               "--story-profile", "long-interleaving", "--long-story-min-rounds", "10",
               "--long-story-max-rounds", "10", "--emit-prefix-witnesses"]
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        (out / "generator.log").write_text(result.stdout + "\n" + result.stderr)
    summary = {"basis": "offline OpenAPI preflight; no Keycloak server was executed", "input": raw,
               "generator_version": "0.26.16", "generator_exit_code": result.returncode}
    if result.returncode == 0:
        report = json.loads((out / "generated" / "generation_report.json").read_text())
        graph = json.loads((out / "generated" / "dependency_graph.json").read_text())
        summary["generated"] = {"covered_operations": report.get("coverage", {}).get("covered_operations"),
                                "entities": len(report.get("entities", [])),
                                "dependency_nodes": len(graph.get("nodes", [])),
                                "dependency_edges": len(graph.get("edges", [])),
                                "unsupported_constructs": sum(len(report.get("unsupported_constructs", {}).get(k, [])) for k in ("document_level", "remote_refs")),
                                "inference_ambiguities": len(report.get("unsupported_constructs", {}).get("ambiguities", [])),
                                "warnings": len(report.get("warnings", []))}
    (out / "stage2-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    with (out / "SHA256SUMS.txt").open("w") as f:
        for file in sorted(out.rglob("*")):
            if file.is_file() and file.name != "SHA256SUMS.txt":
                f.write(f"{sha(file)}  {file.relative_to(out).as_posix()}\n")
    print("STAGE2_PREFLIGHT", json.dumps(summary["generated"] if result.returncode == 0 else summary))
    print("STAGE2_OUTPUT", out)
    return 0 if result.returncode == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
