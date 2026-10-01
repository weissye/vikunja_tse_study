"""Reproduce Stage 6 HTTP anomalies and map skipped stories to their dependencies.

The replay is a Gitea study script. It does not change the generic generator.
Python 3.9+ standard library only. Authentication tokens are never recorded.
"""
from __future__ import annotations

import argparse
import base64
import collections
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import zipfile


def read_json(z, name):
    return json.loads(z.read(name).decode("utf-8-sig"))


def summarize(stage3: Path, stage6: Path):
    with zipfile.ZipFile(stage3) as z3, zipfile.ZipFile(stage6) as z6:
        trace = [json.loads(line) for line in z3.read("http-trace.jsonl").splitlines()]
        evaluation = read_json(z3, "generated-verifier-evaluation.json")
        stories = z3.read("provengo_project/spec/js/stories.gitea.js").decode("utf-8")
        campaign = read_json(z6, "stage6-campaign-summary.json")
    selected = {}
    for w in evaluation["witnesses"]:
        if w.get("result") != "VIOLATED" or w.get("oracle_id") not in (
                "contract::repoMergeUpstream", "contract::repoListTeams"):
            continue
        event = next((e for e in trace if e.get("trace_sequence") == w.get("trigger_event")), {})
        selected[w["oracle_id"]] = {
            "trace_sequence": w.get("trigger_event"), "method": event.get("method"),
            "path": event.get("model_path"), "request": event.get("request"),
            "status": event.get("status"), "response": event.get("response"),
            "documented_statuses": w.get("expected", {}).get("status_in"),
        }
    skipped = campaign["runs"][0]["skipped_long_stories"]
    blockers = []
    for family in sorted({label.split(":")[1] for label in skipped}):
        labels = [label for label in skipped if label.split(":")[1] == family]
        sample = labels[0]
        match = re.search(r'bthread\("' + re.escape(sample) +
                          r'", function\(\) \{(.*?)\n\}\);', stories, re.DOTALL)
        dependencies = sorted(set(re.findall(r'wait:SBT:InstanceReady:([^" ]+)',
                                               match.group(1)))) if match else []
        blockers.append({"family": family, "count": len(labels),
                         "reasons": dict(collections.Counter(skipped[label] for label in labels)),
                         "direct_dependencies": dependencies})
    return {"source_stage3_sha256": hashlib.sha256(stage3.read_bytes()).hexdigest(),
            "source_stage6_sha256": hashlib.sha256(stage6.read_bytes()).hexdigest(),
            "coverage": {k: campaign[k] for k in (
                "generated_long_stories", "successful_long_stories", "skipped_long_stories",
                "long_story_steps_selected", "observed_overlapping_epochs")},
            "priority_witnesses": selected, "blocked_story_families": blockers}


def request(base: str, token: str, method: str, path: str, body=None):
    data = None if body is None else json.dumps(body).encode("utf-8")
    headers = {"Authorization": "token " + token, "Accept": "application/json"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(base.rstrip("/") + path, data=data,
                                 headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=40) as response:
            status, raw = response.status, response.read(1024 * 128)
    except urllib.error.HTTPError as exc:
        status, raw = exc.code, exc.read(1024 * 128)
    try:
        parsed = json.loads(raw.decode("utf-8"))
    except (ValueError, UnicodeError):
        parsed = raw.decode("utf-8", errors="replace")[:200]
    return status, parsed


def replay(base: str, token: str):
    events = []

    def call(label, method, path, body=None):
        status, payload = request(base, token, method, path, body)
        # Preserve only a small response message. Never preserve headers,
        # tokens, entire resource records, or response bodies from /user.
        event = {"label": label, "method": method, "path": path,
                 "request": body, "status": status,
                 "response_message": (str(payload.get("message", ""))[:240]
                                      if isinstance(payload, dict) else str(payload)[:240])}
        events.append(event)
        return status, payload

    status, identity = call("identity", "GET", "/user")
    if status != 200 or not isinstance(identity, dict) or not identity.get("login"):
        return {"status": "INCONCLUSIVE", "reason": "identity unavailable", "events": events}
    owner = str(identity["login"])
    repo = "s6-triage-" + uuid.uuid4().hex[:12]
    path = "/repos/" + urllib.parse.quote(owner, safe="") + "/" + repo
    created = False
    try:
        status, _ = call("create-isolated-repository", "POST", "/user/repos",
                         {"name": repo, "auto_init": True})
        if status not in (201, 202):
            return {"status": "INCONCLUSIVE", "reason": "repository creation failed", "events": events}
        created = True
        status, item = call("observe-repository", "GET", path)
        if status != 200 or not isinstance(item, dict) or not item.get("default_branch"):
            return {"status": "INCONCLUSIVE", "reason": "default branch unavailable", "events": events}
        branch = str(item["default_branch"])
        call("teams-personal-repository", "GET", path + "/teams")
        # Reproduce the preserved request, followed by the one-field control.
        call("merge-omitted-branch", "POST", path + "/merge-upstream", {"ff_only": False})
        call("merge-explicit-branch", "POST", path + "/merge-upstream",
             {"branch": branch, "ff_only": False})
        statuses = {event["label"]: event["status"] for event in events}
        return {"status": "COMPLETE", "repository_is_fork": bool(item.get("fork")),
                "omitted_branch_500_reproduced": statuses["merge-omitted-branch"] == 500,
                "personal_repository_405_reproduced": statuses["teams-personal-repository"] == 405,
                "events": events}
    finally:
        if created:
            try:
                call("cleanup-isolated-repository", "DELETE", path)
            except (urllib.error.URLError, TimeoutError) as exc:
                events.append({"label": "cleanup-failed", "error_type": type(exc).__name__})


def replay_valid_fork(base: str, token: str):
    """One valid-fork control for the exact ff_only=false request family."""
    events = []
    made = []

    def call(label, method, path, body=None):
        status, payload = request(base, token, method, path, body)
        events.append({"label": label, "method": method, "path": path,
                       "request_fields": sorted(body) if isinstance(body, dict) else [],
                       "status": status,
                       "response_message": (str(payload.get("message", ""))[:240]
                                            if isinstance(payload, dict) else str(payload)[:240])})
        return status, payload

    status, identity = call("identity", "GET", "/user")
    if status != 200 or not isinstance(identity, dict) or not identity.get("login"):
        return {"status": "INCONCLUSIVE", "reason": "identity unavailable", "events": events}
    owner = str(identity["login"])
    suffix = uuid.uuid4().hex[:12]
    upstream, organization, fork = ("s6-up-" + suffix, "s6-org-" + suffix,
                                     "s6-fork-" + suffix)
    upstream_path = "/repos/" + urllib.parse.quote(owner, safe="") + "/" + upstream
    fork_path = "/repos/" + organization + "/" + fork

    def sha(repo_path, branch, label):
        code, response = call(label, "GET", repo_path + "/branches/" +
                              urllib.parse.quote(branch, safe=""))
        if code != 200 or not isinstance(response, dict):
            return None
        commit = response.get("commit") or {}
        return commit.get("id") if isinstance(commit, dict) else None

    def wait_resource(label, path, seconds=45):
        deadline = time.monotonic() + seconds
        while True:
            code, response = call(label, "GET", path)
            if code == 200 or code != 404 or time.monotonic() >= deadline:
                return code, response
            time.sleep(0.5)

    result = {"status": "INCONCLUSIVE", "reason": "setup not completed", "events": events}
    try:
        code, _ = call("create-upstream", "POST", "/user/repos",
                       {"name": upstream, "auto_init": True, "default_branch": "main"})
        if code not in (201, 202):
            result["reason"] = "upstream creation failed"
            return result
        made.append(("upstream", upstream_path))
        code, upstream_data = wait_resource("observe-upstream", upstream_path)
        if code != 200 or not isinstance(upstream_data, dict):
            result["reason"] = "upstream not readable"
            return result
        branch = str(upstream_data.get("default_branch") or "")
        if not branch:
            result["reason"] = "upstream branch unavailable"
            return result
        code, _ = call("create-organization", "POST", "/orgs",
                       {"username": organization, "full_name": "Stage 6 fork control",
                        "visibility": "private"})
        if code not in (201, 202):
            result["reason"] = "organization creation failed"
            return result
        made.append(("organization", "/orgs/" + organization))
        code, _ = call("create-fork", "POST", upstream_path + "/forks",
                       {"organization": organization, "name": fork})
        if code not in (201, 202):
            result["reason"] = "fork creation failed"
            return result
        made.append(("fork", fork_path))
        code, fork_data = wait_resource("observe-fork", fork_path)
        parent = fork_data.get("parent") if isinstance(fork_data, dict) else None
        result["fork_preconditions_verified"] = bool(
            code == 200 and isinstance(fork_data, dict) and fork_data.get("fork") and
            isinstance(parent, dict) and parent.get("full_name") == owner + "/" + upstream)
        if not result["fork_preconditions_verified"]:
            result["reason"] = "fork identity not verified"
            return result
        fork_before = sha(fork_path, branch, "fork-head-before")
        upstream_before = sha(upstream_path, branch, "upstream-head-before")
        if not fork_before or not upstream_before:
            result["reason"] = "initial branch head missing"
            return result
        content = base64.b64encode(("stage6 valid fork " + suffix + "\n").encode()).decode()
        code, _ = call("advance-upstream", "POST",
                       upstream_path + "/contents/stage6_control.txt",
                       {"branch": branch, "content": content,
                        "message": "Stage 6 valid fork control"})
        if code not in (200, 201):
            result["reason"] = "upstream commit failed"
            return result
        upstream_after = sha(upstream_path, branch, "upstream-head-after")
        if not upstream_after or upstream_after == fork_before:
            result["reason"] = "upstream advancement not verified"
            return result
        result.update({"preconditions_verified": True, "upstream_sha": upstream_after,
                       "fork_before_sha": fork_before})
        code, _ = call("valid-fork-merge-ff-false", "POST", fork_path + "/merge-upstream",
                       {"branch": branch, "ff_only": False})
        after = sha(fork_path, branch, "fork-head-after")
        result.update({"status": "COMPLETE", "valid_fork_merge_status": code,
                       "fork_after_sha": after,
                       "final_head_matches_upstream": bool(after == upstream_after)})
        return result
    except (urllib.error.URLError, TimeoutError) as exc:
        result["reason"] = "transport failure: " + type(exc).__name__
        return result
    finally:
        # Only resources created in this invocation are touched. Record each
        # cleanup outcome; retained resources remain identifiable by suffix.
        for label, path in reversed(made):
            try:
                call("cleanup-" + label, "DELETE", path)
            except (urllib.error.URLError, TimeoutError) as exc:
                events.append({"label": "cleanup-" + label, "error_type": type(exc).__name__})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stage3", required=True, type=Path)
    parser.add_argument("--stage6", required=True, type=Path)
    parser.add_argument("--evidence", type=Path, default=Path("evidence"))
    parser.add_argument("--replay", action="store_true")
    parser.add_argument("--valid-fork", action="store_true",
                        help="Also test ff_only=false on an independently verified fork")
    parser.add_argument("--base-url", default="http://127.0.0.1:3477/api/v1")
    args = parser.parse_args()
    report = summarize(args.stage3, args.stage6)
    if args.replay or args.valid_fork:
        token = os.environ.get("GITEA_API_TOKEN", "")
        if not token:
            parser.error("GITEA_API_TOKEN is required for live replay")
        if args.replay:
            report["replay"] = replay(args.base_url, token)
        if args.valid_fork:
            report["valid_fork"] = replay_valid_fork(args.base_url, token)
    args.evidence.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d_%H%M%S")
    output = args.evidence / f"gitea-stage6-triage-{stamp}-review.zip"
    payload = (json.dumps(report, indent=2, ensure_ascii=False, sort_keys=True) + "\n").encode()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("triage.json", payload)
    print("STAGE6_TRIAGE", output)
    print("STAGE6_TRIAGE_SHA256", hashlib.sha256(output.read_bytes()).hexdigest())
    if args.replay:
        print("STAGE6_REPLAY_STATUS", report["replay"]["status"])
        for event in report["replay"]["events"]:
            print("STAGE6_REPLAY_EVENT", event["label"], event.get("status", "unknown"))
    if args.valid_fork:
        check = report["valid_fork"]
        print("STAGE6_VALID_FORK", check["status"], "preconditions=",
              check.get("preconditions_verified", False), "merge_status=",
              check.get("valid_fork_merge_status", "unknown"), "head_matches=",
              check.get("final_head_matches_upstream", False))
        for event in check["events"]:
            print("STAGE6_VALID_FORK_EVENT", event["label"], event.get("status", "unknown"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
