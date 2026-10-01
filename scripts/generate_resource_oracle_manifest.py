#!/usr/bin/env python3
"""Generate high-confidence Task, Project and Label lifecycle contracts."""

import argparse
import hashlib
import json
from pathlib import Path


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def operation(spec, path, method):
    value = spec.get("paths", {}).get(path, {}).get(method.lower())
    if not isinstance(value, dict):
        raise ValueError(f"Required operation missing: {method.upper()} {path}")
    return value


def statuses(op, success=True):
    values = sorted(int(x) for x in op.get("responses", {}) if str(x).isdigit())
    return [x for x in values if (200 <= x < 300) == success]


def oracle(resource, phase, trigger, observation, fields=(), absence=(404,)):
    resource_lower = resource.lower()
    value = {
        "oracle_id": f"{resource_lower}-{phase}",
        "resource": resource_lower,
        "phase": phase,
        "confidence": "high",
        "trigger": trigger,
        "observation": observation,
    }
    if phase == "create-visibility":
        value["binding"] = {resource_lower: "$trigger.response.id"}
        value["assertions"] = ([{"type": "same_resource_id"}] +
                               ([{"type": "written_fields_persist", "fields": list(fields)}] if fields else []))
    elif phase == "update-persistence":
        value["binding"] = {resource_lower: f"$trigger.path.{resource_lower}"}
        value["assertions"] = [{"type": "written_fields_persist", "fields": list(fields)}]
    else:
        value["binding"] = {resource_lower: f"$trigger.path.{resource_lower}"}
        value["observation"]["absence_statuses"] = list(absence)
        value["assertions"] = [{"type": "resource_absent"}]
    return value


def endpoint(spec, resource, create_path, item_path, path_key, absence=(404,)):
    create = operation(spec, create_path, "post")
    read = operation(spec, item_path, "get")
    update = operation(spec, item_path, "put")
    delete = operation(spec, item_path, "delete")
    create_trigger = {"method": "POST", "path_template": create_path,
                      "operation_id": create.get("operationId"), "success_statuses": statuses(create)}
    update_trigger = {"method": "PUT", "path_template": item_path,
                      "operation_id": update.get("operationId"), "success_statuses": statuses(update)}
    delete_trigger = {"method": "DELETE", "path_template": item_path,
                      "operation_id": delete.get("operationId"), "success_statuses": statuses(delete)}
    read_observation = {"method": "GET", "path_template": item_path,
                        "operation_id": read.get("operationId"), "success_statuses": statuses(read)}
    absent_observation = {"method": "GET", "path_template": item_path,
                          "operation_id": read.get("operationId")}
    # The generated model intentionally uses title as its stable descriptive witness.
    return [
        oracle(resource, "create-visibility", create_trigger, dict(read_observation), ("title",)),
        oracle(resource, "update-persistence", update_trigger, dict(read_observation), ("title",)),
        oracle(resource, "delete-absence", delete_trigger, absent_observation, absence=absence),
    ]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--openapi", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    source = Path(args.openapi)
    spec = load(source)
    oracles = []
    oracles += endpoint(spec, "project", "/projects", "/projects/{id}", "id")
    oracles += endpoint(spec, "task", "/projects/{project}/tasks", "/tasks/{task}", "task")
    oracles += endpoint(spec, "label", "/labels", "/labels/{id}", "id", absence=(403, 404))
    manifest = {
        "schema_version": 2,
        "profile": "verified-resource-lifecycles",
        "source": {"kind": "openapi-inferred", "openapi_sha256": hashlib.sha256(source.read_bytes()).hexdigest()},
        "policy": {
            "evidence_basis": "external HTTP trace only",
            "violation_is": "semantic anomaly candidate, not a confirmed product bug",
            "stable_update_fields": {"project": ["title"], "task": ["title", "done"], "label": ["title"]},
            "label_delete_absence_statuses": [403, 404],
            "label_403_requires_predelete_visibility": True,
        },
        "oracles": oracles,
    }
    # Task updates additionally assert the stable done flag selected by the model.
    next(x for x in oracles if x["oracle_id"] == "task-update-persistence")["assertions"][0]["fields"] = ["title", "done"]
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "oracle_count": len(oracles), "profile": manifest["profile"]}, indent=2))


if __name__ == "__main__":
    main()
