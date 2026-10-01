#!/usr/bin/env python3
"""Infer the high-confidence Task lifecycle verifier contracts from OpenAPI."""

import argparse
import hashlib
import json
from pathlib import Path


def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def operation(spec, path, method):
    value = spec.get("paths", {}).get(path, {}).get(method.lower())
    if not isinstance(value, dict):
        raise ValueError(f"Required OpenAPI operation is missing: {method.upper()} {path}")
    return value


def response_codes(op):
    return sorted(int(code) for code in op.get("responses", {}) if str(code).isdigit())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--openapi", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    source = Path(args.openapi)
    spec = load_json(source)
    create = operation(spec, "/projects/{project}/tasks", "post")
    read = operation(spec, "/tasks/{task}", "get")
    update = operation(spec, "/tasks/{task}", "put")
    delete = operation(spec, "/tasks/{task}", "delete")

    manifest = {
        "schema_version": 1,
        "profile": "verified-task-lifecycle",
        "source": {
            "kind": "openapi-inferred",
            "openapi_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        },
        "policy": {
            "evidence_basis": "external HTTP trace only",
            "violation_is": "semantic anomaly candidate, not a confirmed product bug",
            "stable_update_fields": ["title", "done"],
        },
        "oracles": [
            {
                "oracle_id": "task-create-visibility",
                "confidence": "high",
                "trigger": {
                    "method": "POST",
                    "path_template": "/projects/{project}/tasks",
                    "operation_id": create.get("operationId"),
                    "success_statuses": [x for x in response_codes(create) if 200 <= x < 300],
                },
                "binding": {"task": "$trigger.response.id"},
                "observation": {
                    "method": "GET",
                    "path_template": "/tasks/{task}",
                    "operation_id": read.get("operationId"),
                    "success_statuses": [x for x in response_codes(read) if 200 <= x < 300],
                },
                "assertions": [
                    {"type": "same_resource_id"},
                    {"type": "written_fields_persist", "fields": ["title"]},
                ],
            },
            {
                "oracle_id": "task-update-persistence",
                "confidence": "high",
                "trigger": {
                    "method": "PUT",
                    "path_template": "/tasks/{task}",
                    "operation_id": update.get("operationId"),
                    "success_statuses": [x for x in response_codes(update) if 200 <= x < 300],
                },
                "binding": {"task": "$trigger.path.task"},
                "observation": {
                    "method": "GET",
                    "path_template": "/tasks/{task}",
                    "operation_id": read.get("operationId"),
                    "success_statuses": [x for x in response_codes(read) if 200 <= x < 300],
                },
                "assertions": [
                    {"type": "written_fields_persist", "fields": ["title", "done"]},
                ],
            },
            {
                "oracle_id": "task-delete-absence",
                "confidence": "high",
                "trigger": {
                    "method": "DELETE",
                    "path_template": "/tasks/{task}",
                    "operation_id": delete.get("operationId"),
                    "success_statuses": [x for x in response_codes(delete) if 200 <= x < 300],
                },
                "binding": {"task": "$trigger.path.task"},
                "observation": {
                    "method": "GET",
                    "path_template": "/tasks/{task}",
                    "operation_id": read.get("operationId"),
                    "absence_statuses": [404],
                },
                "assertions": [{"type": "resource_absent"}],
            },
        ],
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "oracle_count": 3, "profile": manifest["profile"]}, indent=2))


if __name__ == "__main__":
    main()
