#!/usr/bin/env python3
"""Probe deleted relation-lifecycle resources through the external proxy."""
import argparse
import json
import urllib.error
import urllib.request
from pathlib import Path


def status(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, method="GET"), timeout=10) as response:
            return response.status
    except urllib.error.HTTPError as error:
        return error.code


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", required=True)
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    events = [json.loads(line) for line in Path(args.trace).read_text(encoding="utf-8-sig").splitlines() if line.strip()]
    project = next((e["response"]["id"] for e in events if e.get("method") == "POST"
                    and e.get("model_path") == "/projects" and isinstance(e.get("response"), dict)), None)
    tasks = [e["response"]["id"] for e in events if e.get("method") == "POST"
             and str(e.get("model_path", "")).startswith("/projects/")
             and str(e.get("model_path", "")).endswith("/tasks")
             and isinstance(e.get("response"), dict) and isinstance(e["response"].get("id"), int)]
    if project is None or len(tasks) < 2:
        raise SystemExit("Could not recover project and two task IDs")
    statuses = {
        "task_a": status(f"{args.base_url}/tasks/{tasks[0]}"),
        "task_b": status(f"{args.base_url}/tasks/{tasks[1]}"),
        "project": status(f"{args.base_url}/projects/{project}"),
    }
    passed = all(value == 404 for value in statuses.values())
    result = {"ids": {"project": project, "task_a": tasks[0], "task_b": tasks[1]},
              "statuses": statuses, "all_deletions_observable": passed}
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2, sort_keys=True))
    raise SystemExit(0 if passed else 2)


if __name__ == "__main__":
    main()
