#!/usr/bin/env python3
"""Build the fixed Vikunja core research boundary from the full OpenAPI file.

This script only selects operations. It does not add schemas, dependencies,
stories, bindings, examples, or implementation knowledge.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path


CORE_PATHS = {
    "/projects": {"get", "post"},
    "/projects/{id}": {"delete", "get", "patch", "put"},
    "/projects/{project}/tasks": {"get", "post"},
    "/tasks/{task}": {"delete", "get", "patch", "put"},
    "/labels": {"get", "post"},
    "/labels/{id}": {"delete", "get", "patch", "put"},
    "/tasks/{task}/labels": {"get", "post"},
    "/tasks/{task}/labels/{label}": {"delete"},
}

COMMENT_PATHS = {
    **CORE_PATHS,
    "/tasks/{task}/comments": {"get", "post"},
    "/tasks/{task}/comments/{commentid}": {"delete", "get", "patch", "put"},
}

RELATION_PATHS = {
    **CORE_PATHS,
    "/tasks/{task}/relations": {"post"},
    "/tasks/{task}/relations/{relationKind}/{otherTask}": {"delete"},
}

MULTI_RESOURCE_PATHS = {
    **COMMENT_PATHS,
    "/tasks/{task}/relations": {"post"},
    "/tasks/{task}/relations/{relationKind}/{otherTask}": {"delete"},
}

BOUNDARIES = {
    "core": CORE_PATHS,
    "comments": COMMENT_PATHS,
    "relations": RELATION_PATHS,
    "multi-resource": MULTI_RESOURCE_PATHS,
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--boundary", choices=tuple(BOUNDARIES), default="core")
    args = parser.parse_args()

    source_path = Path(args.input)
    output_path = Path(args.output)
    manifest_path = Path(args.manifest)
    source = json.loads(source_path.read_text(encoding="utf-8"))
    projected = copy.deepcopy(source)
    projected["paths"] = {}
    selected = []

    selected_paths = BOUNDARIES[args.boundary]
    for path, methods in selected_paths.items():
        if path not in source.get("paths", {}):
            raise SystemExit(f"Required path missing from source contract: {path}")
        source_item = source["paths"][path]
        target_item = {}
        for key, value in source_item.items():
            if key.lower() in methods or key.lower() == "parameters":
                target_item[key] = copy.deepcopy(value)
                if key.lower() in methods:
                    selected.append({"method": key.upper(), "path": path})
        missing = methods - {key.lower() for key in source_item}
        if missing:
            raise SystemExit(f"Required operation(s) missing for {path}: {sorted(missing)}")
        projected["paths"][path] = target_item

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(projected, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    manifest = {
        "policy": "fixed operation boundary; no schema/story/binding injection",
        "boundary": args.boundary,
        "source": str(source_path),
        "source_sha256": sha256(source_path),
        "projection": str(output_path),
        "projection_sha256": sha256(output_path),
        "operation_count": len(selected),
        "operations": selected,
    }
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
