#!/usr/bin/env python3
"""Issue post-delete reads through the research proxy so they enter the trace."""

from __future__ import annotations

import argparse
import json
import urllib.error
import urllib.request
from pathlib import Path


def events(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def created_id(items, method, path_prefix):
    for item in items:
        if (item.get("method") == method and str(item.get("model_path", "")).startswith(path_prefix)
                and item.get("status") in {200, 201} and isinstance(item.get("response"), dict)):
            value = item["response"].get("id")
            if isinstance(value, int):
                return value
    return None


def get_status(url: str) -> int:
    request = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return response.status
    except urllib.error.HTTPError as exc:
        return exc.code


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    items = events(Path(args.trace))
    project = created_id(items, "POST", "/projects")
    task = created_id(items, "POST", "/projects/")
    label = created_id(items, "POST", "/labels")
    if None in (project, task, label):
        raise SystemExit("Could not recover all lifecycle IDs from the trace")
    statuses = {
        "task": get_status(f"{args.base_url}/tasks/{task}"),
        "label": get_status(f"{args.base_url}/labels/{label}"),
        "project": get_status(f"{args.base_url}/projects/{project}"),
    }
    observable = (statuses["task"] == 404 and statuses["project"] == 404
                  and statuses["label"] in {403, 404})
    result = {
        "ids": {"project": project, "task": task, "label": label},
        "statuses": statuses,
        "accepted_statuses": {"task": [404], "project": [404], "label": [403, 404]},
        "all_deletions_observable": observable,
    }
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2, sort_keys=True))
    raise SystemExit(0 if result["all_deletions_observable"] else 2)


if __name__ == "__main__":
    main()
