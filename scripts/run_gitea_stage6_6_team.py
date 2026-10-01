#!/usr/bin/env python3
"""Directed Team update/delete confirmation using existing Stage 6 proxy/barrier.

This is a targeted diagnostic, separate from the OpenAPI-only generated
campaign. Paths and documented response statuses are checked against the
frozen OpenAPI; the selected schedule is disclosed in the evidence.
"""
import argparse
import csv
import hashlib
import json
import os
import random
import socket
import threading
import time
import urllib.error
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

from openapi_to_sbt.concurrency_adapter import build_server as build_adapter
from openapi_to_sbt.trace_proxy import build_server as build_proxy

SPEC_SHA = "a0baa9a766c22492bd8c45744157c611d3e95cfc0dc73d6f5d14f294cdddce38"


def utc():
    return datetime.now(timezone.utc).isoformat()


def reserve_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def call(base, method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    request = urllib.request.Request(base + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            status, content = response.status, response.read()
    except urllib.error.HTTPError as exc:
        status, content = exc.code, exc.read()
    try:
        decoded = json.loads(content) if content else None
    except (ValueError, UnicodeError):
        decoded = content.decode("utf-8", errors="replace")[:4096]
    return {"status": status, "body": decoded}


def assert_api_contract(spec):
    expected = {
        ("/orgs", "post"): "orgCreate",
        ("/orgs/{org}", "get"): "orgGet",
        ("/orgs/{org}/teams", "post"): "orgCreateTeam",
        ("/teams/{id}", "get"): "orgGetTeam",
        ("/teams/{id}", "patch"): "orgEditTeam",
        ("/teams/{id}", "delete"): "orgDeleteTeam",
    }
    for (path, method), operation_id in expected.items():
        found = spec["paths"].get(path, {}).get(method, {}).get("operationId")
        if found != operation_id:
            raise ValueError(f"Frozen OpenAPI mismatch: {method.upper()} {path}: {found}")
    return {
        "team_create": [int(x) for x in spec["paths"]["/orgs/{org}/teams"]["post"]["responses"] if x.isdigit()],
        "team_get": [int(x) for x in spec["paths"]["/teams/{id}"]["get"]["responses"] if x.isdigit()],
        "team_patch": [int(x) for x in spec["paths"]["/teams/{id}"]["patch"]["responses"] if x.isdigit()],
        "team_delete": [int(x) for x in spec["paths"]["/teams/{id}"]["delete"]["responses"] if x.isdigit()],
    }


def make_team(base, org, name, label, prefix_rounds):
    created = call(base, "POST", f"/orgs/{org}/teams", {
        "name": name, "permission": "read", "units": ["repo.code"],
        "description": f"{label}-initial",
    })
    if created["status"] != 201 or not isinstance(created["body"], dict) or not created["body"].get("id"):
        raise ValueError(f"Team creation failed: HTTP {created['status']}")
    path = f"/teams/{created['body']['id']}"
    state = call(base, "GET", path)
    if state["status"] != 200 or state["body"].get("name") != name:
        raise ValueError("Created Team was not independently readable")
    for index in range(prefix_rounds):
        description = f"{label}-prefix-{index}"
        changed = call(base, "PATCH", path, {"name": name, "description": description})
        state = call(base, "GET", path)
        if (changed["status"] != 200 or state["status"] != 200 or
                state["body"].get("description") != description):
            raise ValueError(f"Prefix round {index} did not persist")
    return path, state["body"].get("description")


def one_trial(base, adapter_url, trial, prefix_rounds, stamp, known, rng):
    label = f"s66-{stamp}-{trial}"
    org = label + "-org"
    created = call(base, "POST", "/orgs", {"username": org})
    if created["status"] != 201:
        raise ValueError(f"Org creation failed: HTTP {created['status']}")
    read_org = call(base, "GET", f"/orgs/{org}")
    if read_org["status"] != 200:
        raise ValueError("Organization was not independently readable")

    control_name = label + "-control"
    control_path, _ = make_team(base, org, control_name, label + "-control", prefix_rounds)
    control_description = label + "-control-final"
    control_update = call(base, "PATCH", control_path, {
        "name": control_name, "description": control_description})
    control_observed = call(base, "GET", control_path)
    control_delete = call(base, "DELETE", control_path)
    control_absent = call(base, "GET", control_path)
    controls = {
        "update": control_update["status"], "read_after_update": control_observed["status"],
        "delete": control_delete["status"], "read_after_delete": control_absent["status"],
        "update_value_observed": control_observed["status"] == 200 and
        isinstance(control_observed["body"], dict) and
        control_observed["body"].get("description") == control_description,
    }
    passed = (controls["update"] == 200 and controls["update_value_observed"] and
              controls["delete"] == 204 and controls["read_after_delete"] == 404)
    if not passed:
        return {"trial": trial, "verdict": "INCONCLUSIVE", "reason": "sequential-controls-failed",
                "controls": controls}

    concurrent_name = label + "-epoch"
    path, before = make_team(base, org, concurrent_name, label + "-epoch", prefix_rounds)
    epoch_id = f"sbt-stage6-6-epoch-{trial}"
    body = {"name": concurrent_name, "description": label + "-epoch-update"}
    plan = {"epoch_id": epoch_id, "scenario": "orgEditTeam-vs-orgDeleteTeam",
            "operations": [
                {"operation_id": epoch_id + "-update", "method": "PATCH", "path": path,
                 "body": body, "delay_ms": 0, "headers": {"Content-Type": "application/json"}},
                {"operation_id": epoch_id + "-delete", "method": "DELETE", "path": path,
                 "body": None, "delay_ms": 0, "headers": {"Content-Type": "application/json"}},
            ]}
    # Vary submission order reproducibly; workers still start from one barrier.
    rng.shuffle(plan["operations"])
    epoch_response = call(adapter_url, "POST", "/epochs", plan)
    if epoch_response["status"] != 200 or not isinstance(epoch_response["body"], dict):
        return {"trial": trial, "verdict": "INCONCLUSIVE", "reason": "adapter-failed",
                "controls": controls, "adapter_status": epoch_response["status"]}
    epoch = epoch_response["body"]
    after = call(base, "GET", path)
    results = {x["method"]: x for x in epoch["operations"]}
    patch, deleted = results.get("PATCH", {}), results.get("DELETE", {})
    overlap = epoch.get("overlap_observed") is True
    verdict, reason = "INCONCLUSIVE", "overlap-or-response-precondition-missing"
    if overlap and deleted.get("status") == 204 and patch.get("status") in (200, 404):
        if after["status"] == 404:
            verdict, reason = "PASS", "successful-delete-remained-absent-after-quiescence"
        elif after["status"] == 200:
            verdict, reason = "SEMANTIC_CANDIDATE", "successful-delete-followed-by-visible-team"
    elif not overlap:
        reason = "no-real-overlap"
    return {"trial": trial, "verdict": verdict, "reason": reason,
            "controls": controls, "before_description": before,
            "epoch_id": epoch_id, "overlap": overlap,
            "patch_status": patch.get("status"), "delete_status": deleted.get("status"),
            "final_get_status": after["status"], "expected_statuses": known}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--target", default="http://127.0.0.1:3477")
    parser.add_argument("--trials", type=int, default=8)
    parser.add_argument("--prefix-rounds", type=int, default=4)
    parser.add_argument("--quiescence-ms", type=int, default=150)
    parser.add_argument("--seed", type=int, default=20261004)
    parser.add_argument("--freeze-evidence", action="store_true")
    args = parser.parse_args()
    if not os.environ.get("GITEA_API_TOKEN", "").strip():
        parser.error("GITEA_API_TOKEN is required in this process")
    if not 1 <= args.trials <= 50 or not 1 <= args.prefix_rounds <= 10:
        parser.error("trials and prefix-rounds must be positive and bounded")
    root = Path(args.root).resolve()
    spec_path = root / "model/gitea/gitea-1.27.3-swagger.json"
    source = spec_path.read_bytes()
    if hashlib.sha256(source).hexdigest() != SPEC_SHA:
        parser.error("Frozen Gitea OpenAPI SHA256 mismatch")
    known = assert_api_contract(json.loads(source))
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")[:-3]
    run_name = f"gitea-stage6-6-team-update-delete-{stamp}"
    run_dir = root / "runs" / run_name
    run_dir.mkdir(parents=True, exist_ok=False)
    proxy_port, adapter_port = reserve_port(), reserve_port()
    while proxy_port == adapter_port:
        adapter_port = reserve_port()
    proxy = build_proxy(SimpleNamespace(listen_host="127.0.0.1", listen_port=proxy_port,
        target=args.target, api_prefix="/api/v1", trace=str(run_dir / "http-trace.jsonl"),
        bearer_token_env="GITEA_API_TOKEN", require_bearer_token=True,
        authorization_scheme="token", timeout=60.0))
    adapter = build_adapter(SimpleNamespace(listen_host="127.0.0.1", listen_port=adapter_port,
        upstream=f"http://127.0.0.1:{proxy_port}", epoch_log=str(run_dir / "concurrent-epochs.jsonl"),
        max_width=8, timeout=60.0, quiescence_ms=args.quiescence_ms))
    for server in (proxy, adapter):
        threading.Thread(target=server.serve_forever, daemon=True).start()
    base, adapter_url = f"http://127.0.0.1:{proxy_port}", f"http://127.0.0.1:{adapter_port}"
    results = []
    rng = random.Random(args.seed)
    try:
        user = call(base, "GET", "/user")
        if user["status"] != 200:
            raise ValueError("Research user authentication failed")
        for trial in range(1, args.trials + 1):
            try:
                results.append(one_trial(base, adapter_url, trial, args.prefix_rounds, stamp, known, rng))
            except (ValueError, urllib.error.URLError, TimeoutError) as exc:
                results.append({"trial": trial, "verdict": "INCONCLUSIVE", "reason": str(exc)})
    finally:
        for server in (adapter, proxy):
            server.shutdown()
            server.server_close()
    summary = {"schema_version": 1, "stage": "Gitea Stage 6.6 directed diagnostic",
               "source_spec_sha256": SPEC_SHA, "created_utc": utc(),
               "policy": "Targeted update/delete histories, separate from OpenAPI-only generated campaign.",
               "parameters": {"trials": args.trials, "prefix_rounds": args.prefix_rounds,
                              "quiescence_ms": args.quiescence_ms, "seed": args.seed},
               "counts": {k: sum(r["verdict"] == k for r in results)
                          for k in ("PASS", "SEMANTIC_CANDIDATE", "INCONCLUSIVE")},
               "results": results}
    (run_dir / "stage6_6-summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    with (run_dir / "stage6_6-trials.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=("trial", "verdict", "reason", "overlap",
            "patch_status", "delete_status", "final_get_status", "epoch_id"), extrasaction="ignore")
        writer.writeheader()
        writer.writerows(results)
    (run_dir / "run-metadata.json").write_text(json.dumps({"script": "run_gitea_stage6_6_team.py",
        "source_spec": str(spec_path.relative_to(root)), "target": args.target,
        "created_utc": utc()}, indent=2), encoding="utf-8")
    (run_dir / "run_gitea_stage6_6_team.py").write_bytes(Path(__file__).read_bytes())
    checksums = [{"file": p.name, "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
                 for p in sorted(run_dir.iterdir()) if p.is_file() and p.name != "checksums.csv"]
    with (run_dir / "checksums.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=("file", "sha256"))
        writer.writeheader()
        writer.writerows(checksums)
    print("Run directory:", run_dir)
    if args.freeze_evidence:
        evidence_dir = root / "evidence"
        evidence_dir.mkdir(exist_ok=True)
        evidence = evidence_dir / (run_name + "-review.zip")
        with zipfile.ZipFile(evidence, "x", zipfile.ZIP_DEFLATED) as archive:
            for p in sorted(run_dir.iterdir()):
                if p.is_file():
                    archive.write(p, p.name)
        print("GITEA_STAGE6_6_EVIDENCE_READY")
        print("Evidence ZIP:", evidence)
        print("ZIP SHA256:", hashlib.sha256(evidence.read_bytes()).hexdigest())
    print("Trials:", args.trials, "Counts:", json.dumps(summary["counts"]))
    print("GITEA_STAGE6_6_COMPLETE")


if __name__ == "__main__":
    main()
