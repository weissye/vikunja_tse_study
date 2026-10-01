#!/usr/bin/env python3
"""Append externally observed post-cleanup GET results to the campaign trace."""
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
    parser.add_argument("--expected-tasks", type=int, default=8)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    events = [json.loads(line) for line in Path(args.trace).read_text(encoding="utf-8-sig").splitlines() if line.strip()]
    project = next((e["response"]["id"] for e in events if e.get("method") == "POST"
                    and e.get("model_path") == "/projects" and isinstance(e.get("response"), dict)), None)
    tasks = [e["response"]["id"] for e in events if e.get("method") == "POST"
             and str(e.get("model_path", "")).startswith("/projects/")
             and str(e.get("model_path", "")).endswith("/tasks")
             and isinstance(e.get("response"), dict) and isinstance(e["response"].get("id"), int)]
    if project is None or len(tasks) != args.expected_tasks:
        raise SystemExit(f"Expected one project and {args.expected_tasks} tasks; got project={project}, tasks={len(tasks)}")
    statuses = {f"task_{task}": status(f"{args.base_url}/tasks/{task}") for task in tasks}
    statuses["project"] = status(f"{args.base_url}/projects/{project}")
    passed = all(value == 404 for value in statuses.values())
    result = {"ids": {"project": project, "tasks": tasks}, "statuses": statuses,
              "all_deletions_observable": passed}
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2, sort_keys=True))
    raise SystemExit(0 if passed else 2)


if __name__ == "__main__":
    main()
