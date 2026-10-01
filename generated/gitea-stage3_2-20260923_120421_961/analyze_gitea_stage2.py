#!/usr/bin/env python3
"""Audit an OpenAPI-only Gitea Stage 2 generation without contacting the SUT."""
from __future__ import annotations

import argparse
import collections
import hashlib
import json
import sys
from pathlib import Path


HTTP_METHODS = {"get", "put", "post", "delete", "patch", "head", "options", "trace"}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def raw_operations(spec):
    return [
        (method.lower(), path, operation)
        for path, path_item in (spec.get("paths", {}) or {}).items()
        if isinstance(path_item, dict)
        for method, operation in path_item.items()
        if method.lower() in HTTP_METHODS and isinstance(operation, dict)
    ]


def has_raw_request_body(operation):
    if isinstance(operation.get("requestBody"), dict):
        return True
    return any(
        isinstance(parameter, dict) and parameter.get("in") in {"body", "formData"}
        for parameter in operation.get("parameters", []) or []
    )


def has_raw_response_schema(operation):
    for response in (operation.get("responses", {}) or {}).values():
        if not isinstance(response, dict):
            continue
        if isinstance(response.get("schema"), dict):
            return True
        if any(isinstance(value, dict) and isinstance(value.get("schema"), dict)
               for value in (response.get("content", {}) or {}).values()):
            return True
    return False


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--openapi", required=True, type=Path)
    parser.add_argument("--generated", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--expected-sha256", required=True)
    parser.add_argument("--expected-generator-version", default="0.25.9")
    args = parser.parse_args(argv)

    generator_root = Path(__file__).resolve().parents[1] / "generator_baseline"
    sys.path.insert(0, str(generator_root))
    from openapi_to_sbt.parsing.loader import load_and_resolve
    from openapi_to_sbt.parsing.normalize import normalize

    source_bytes = args.openapi.read_bytes()
    source_sha = hashlib.sha256(source_bytes).hexdigest()
    spec = read_json(args.openapi)
    operations = raw_operations(spec)
    active_raw = [item for item in operations if not item[2].get("deprecated", False)]
    deprecated = [
        {"method": method.upper(), "path": path, "operation_id": operation.get("operationId")}
        for method, path, operation in operations if operation.get("deprecated", False)
    ]

    resolved, unresolved_refs = load_and_resolve(str(args.openapi))
    resolved_operations = raw_operations(resolved)
    active_resolved = [item for item in resolved_operations
                       if not item[2].get("deprecated", False)]
    document = normalize(resolved, spec)
    active_normalized = [operation for operation in document.operations if not operation.deprecated]

    report = read_json(args.generated / "generation_report.json")
    coverage = read_json(args.generated / "verifier-coverage.gitea.json")
    manifest = read_json(args.generated / "verification-manifest.gitea.json")
    graph = read_json(args.generated / "dependency_graph.json")

    raw_request_bodies = sum(has_raw_request_body(operation)
                             for _, _, operation in active_resolved)
    normalized_request_bodies = sum(operation.request_body is not None for operation in active_normalized)
    raw_response_schemas = sum(has_raw_response_schema(operation)
                               for _, _, operation in active_resolved)
    normalized_response_schemas = sum(
        any(response.media_types for response in operation.responses)
        for operation in active_normalized
    )
    counts = coverage["counts"]
    runtime_ready = sum(
        bool(oracle.get("runtime", {}).get("ready"))
        for oracle in manifest.get("concurrency_oracles", [])
    )
    checks = {
        "source_sha256_matches_stage1": source_sha.lower() == args.expected_sha256.lower(),
        "generator_version_matches": report["meta"]["cli_args"]["generator_version"] == args.expected_generator_version,
        "raw_equals_active_plus_deprecated": len(operations) == len(active_raw) + len(deprecated),
        "all_active_operations_have_contract_verifiers": counts["contract_verifiers"] == len(active_raw),
        "verifier_coverage_complete": bool(coverage.get("coverage_complete")),
        "manual_assumptions_zero": len(coverage.get("manual_assumptions", [])) == 0,
        "swagger_request_bodies_preserved": raw_request_bodies == normalized_request_bodies,
        "swagger_response_schemas_preserved": raw_response_schemas == normalized_response_schemas,
        "generation_warnings_zero": len(report.get("warnings", [])) == 0,
        "remote_refs_zero": len(unresolved_refs) == 0,
        "runtime_ready_concurrency_exists": runtime_ready > 0,
    }

    result = {
        "schema_version": 1,
        "stage": "gitea-stage2-openapi-generation-preflight",
        "preflight_status": "PASS" if all(checks.values()) else "FAIL",
        "network_requests_to_sut": 0,
        "source": {
            "title": spec.get("info", {}).get("title"),
            "version": spec.get("info", {}).get("version"),
            "swagger": spec.get("swagger"),
            "openapi": spec.get("openapi"),
            "sha256": source_sha,
            "paths": len(spec.get("paths", {})),
            "raw_operations": len(operations),
            "active_operations": len(active_raw),
            "deprecated_operations": deprecated,
        },
        "generator": {
            "version": report["meta"]["cli_args"]["generator_version"],
            "entities": len(report.get("entities", [])),
            "standalone_operations": len(report.get("standalone_operations", [])),
            "dependency_nodes": len(graph.get("nodes", [])),
            "dependency_edges": len(graph.get("edges", [])),
            "dependency_cycle": bool(graph.get("had_cycle")),
            "ambiguities": len(report.get("unsupported_constructs", {}).get("ambiguities", [])),
            "warnings": len(report.get("warnings", [])),
            "unresolved_remote_refs": len(unresolved_refs),
        },
        "normalization": {
            "raw_active_request_body_operations": raw_request_bodies,
            "normalized_active_request_body_operations": normalized_request_bodies,
            "raw_active_response_schema_operations": raw_response_schemas,
            "normalized_active_response_schema_operations": normalized_response_schemas,
        },
        "verification": {
            **counts,
            "manual_assumptions": len(coverage.get("manual_assumptions", [])),
            "coverage_complete": bool(coverage.get("coverage_complete")),
            "state_oracle_kinds": dict(collections.Counter(
                oracle["kind"] for oracle in manifest.get("state_oracles", []))),
            "concurrency_oracle_kinds": dict(collections.Counter(
                oracle["kind"] for oracle in manifest.get("concurrency_oracles", []))),
            "concurrency_runtime_ready": runtime_ready,
            "concurrency_runtime_not_ready": counts["concurrency_oracles"] - runtime_ready,
            "runtime_limitations": dict(collections.Counter(
                oracle.get("runtime", {}).get("limitation", "unspecified")
                for oracle in manifest.get("concurrency_oracles", [])
                if not oracle.get("runtime", {}).get("ready"))),
        },
        "checks": checks,
        "methodology": {
            "external_application_knowledge": False,
            "manual_assumptions": 0,
            "input_basis": "instance-served Swagger/OpenAPI only",
            "sut_execution": "none",
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({
        "preflight_status": result["preflight_status"],
        "raw_operations": len(operations),
        "active_operations": len(active_raw),
        "deprecated_operations": len(deprecated),
        "contract_verifiers": counts["contract_verifiers"],
        "state_verified_mutations": counts["state_verified_mutations"],
        "concurrency_oracles": counts["concurrency_oracles"],
        "concurrency_runtime_ready": runtime_ready,
        "manual_assumptions": 0,
    }, sort_keys=True))
    print("GITEA_STAGE2_PREFLIGHT_PASS" if result["preflight_status"] == "PASS"
          else "GITEA_STAGE2_PREFLIGHT_FAIL")
    return 0 if result["preflight_status"] == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
