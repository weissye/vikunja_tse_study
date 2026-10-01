#!/usr/bin/env python3
"""Stage 6.12 directed isolated same-field experiment; existing proxy/barrier."""
import argparse
import csv
import hashlib
import json
import os
import random
import socket
import subprocess
import sys
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
CASES = ("org.full_name", "oauth.name", "oauth.confidential_client",
         "oauth.skip_secondary_authorization")


def reserve_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def call(base, method, path, body=None, operation_id=None, epoch_id=None):
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if epoch_id:
        headers["X-Provengo-Epoch-Id"] = epoch_id
        headers["X-Provengo-Operation-Id"] = operation_id
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(base + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            status, content = response.status, response.read()
    except urllib.error.HTTPError as exc:
        status, content = exc.code, exc.read()
    try:
        decoded = json.loads(content) if content else None
    except (ValueError, UnicodeError):
        decoded = None
    return {"status": status, "body": decoded}


def validate_spec(spec):
    operations = {
        ("/orgs", "post"): "orgCreate",
        ("/orgs/{org}", "get"): "orgGet",
        ("/orgs/{org}", "patch"): "orgEdit",
        ("/user/applications/oauth2", "post"): "userCreateOAuth2Application",
        ("/user/applications/oauth2/{id}", "get"): "userGetOAuth2Application",
        ("/user/applications/oauth2/{id}", "patch"): "userUpdateOAuth2Application",
    }
    for (path, method), expected in operations.items():
        op = spec["paths"].get(path, {}).get(method, {})
        if op.get("operationId") != expected:
            raise ValueError(f"Frozen OpenAPI mismatch: {method.upper()} {path}")
        if not ({"200"} if method != "post" else {"201"}) <= set(op.get("responses", {})):
            raise ValueError(f"Documented success missing: {method.upper()} {path}")
    schemas = spec["definitions"]
    for schema, fields in (("EditOrgOption", ("full_name",)),
                           ("CreateOAuth2ApplicationOptions", ("name", "redirect_uris",
                                                                "confidential_client", "skip_secondary_authorization")),
                           ("OAuth2Application", ("name", "redirect_uris",
                                                  "confidential_client", "skip_secondary_authorization"))):
        if not set(fields) <= set(schemas[schema]["properties"]):
            raise ValueError("Frozen OpenAPI field mismatch: " + schema)


def require_read(base, path, field, expected):
    result = call(base, "GET", path)
    if result["status"] != 200 or not isinstance(result["body"], dict):
        raise ValueError(f"GET failed at {path}: HTTP {result['status']}")
    if expected is not None and result["body"].get(field) != expected:
        raise ValueError(f"Field did not persist at {path}: {field}")
    return result["body"]


def body_for(family, field, state, value):
    if family == "org":
        return {field: value}
    return {"name": state["name"], "redirect_uris": state["redirect_uris"], field: value}


def new_resource(base, family, label):
    if family == "org":
        name = (label + "-org").lower()
        created = call(base, "POST", "/orgs", {"username": name})
        path = f"/orgs/{name}"
    else:
        name = label.lower()
        created = call(base, "POST", "/user/applications/oauth2",
                       {"name": name, "redirect_uris": ["https://example.test/" + name]})
        if created["status"] != 201 or not isinstance(created["body"], dict) or not created["body"].get("id"):
            raise ValueError(f"OAuth creation failed: HTTP {created['status']}")
        path = "/user/applications/oauth2/" + str(created["body"]["id"])
    if created["status"] != 201:
        raise ValueError(f"Creation failed: HTTP {created['status']}")
    return path


def prepare(base, family, field, path, label, rounds):
    state = require_read(base, path, field, None)
    for number in range(rounds):
        # A documented positive update and independent read form each prefix round.
        value = (label + f"-prefix-{number}") if field in ("full_name", "name") else number % 2 == 0
        patch = call(base, "PATCH", path, body_for(family, field, state, value))
        if patch["status"] != 200:
            raise ValueError(f"Prefix PATCH returned HTTP {patch['status']}")
        state = require_read(base, path, field, value)
    return state


def checks_for_epoch(trace, epoch_id, path):
    # The proxy replies before its finally-block appends the trace event.
    # Wait briefly for the independent GET and both adapter requests to land.
    deadline = time.monotonic() + 3.0
    while True:
        rows = [json.loads(line) for line in trace.read_text(encoding="utf-8").splitlines() if line.strip()]
        ops = [row for row in rows if row.get("epoch_id") == epoch_id and row.get("method") == "PATCH"]
        reads = [row for row in rows if row.get("epoch_id") == epoch_id and row.get("method") == "GET"
                 and row.get("operation_id") == epoch_id + "-observe"]
        if (len(ops) == 2 and len(reads) == 1) or time.monotonic() >= deadline:
            break
        time.sleep(0.01)
    if len(ops) != 2 or len(reads) != 1:
        return False, "epoch-http-witness-missing", []
    observation = reads[0]
    start = min(datetime.fromisoformat(row["request_received_utc"]) for row in ops)
    end = datetime.fromisoformat(observation["upstream_completed_utc"])
    interference = [row["trace_sequence"] for row in rows
                    if row.get("model_path") == path
                    and row.get("method") in ("POST", "PUT", "PATCH", "DELETE")
                    and row.get("epoch_id") != epoch_id
                    and datetime.fromisoformat(row["request_received_utc"]) < end
                    and datetime.fromisoformat(row["upstream_completed_utc"]) > start]
    return not interference, "" if not interference else "intervening-resource-write", interference


def one_case(base, adapter_url, trace, trial, case, stamp, rounds, rng):
    family, field = case.split(".", 1)
    label = f"s612-{stamp}-{trial}-{case.replace('.', '-')}"
    path = new_resource(base, family, label)
    state = prepare(base, family, field, path, label, rounds)
    baseline = state.get(field)
    values = ((label + "-a", label + "-b") if field in ("full_name", "name") else (True, False))
    controls = []
    for value in values:
        response = call(base, "PATCH", path, body_for(family, field, state, value))
        observed = require_read(base, path, field, value) if response["status"] == 200 else None
        controls.append({"status": response["status"], "persisted": observed is not None})
    reset = call(base, "PATCH", path, body_for(family, field, state, baseline))
    reset_observed = require_read(base, path, field, baseline) if reset["status"] == 200 else None
    if reset_observed is None or any(row["status"] != 200 or not row["persisted"] for row in controls):
        return {"trial": trial, "case": case, "path": path, "verdict": "INCONCLUSIVE",
                "reason": "serial-control-or-reset-failed", "controls": controls, "reset_status": reset["status"]}
    epoch_id = f"stage6-12-{trial}-{case.replace('.', '-')}"
    ops = [{"operation_id": epoch_id + f"-op-{idx}", "method": "PATCH", "path": path,
            "body": body_for(family, field, reset_observed, value), "delay_ms": 0,
            "headers": {"Content-Type": "application/json"}} for idx, value in enumerate(values)]
    rng.shuffle(ops)
    epoch_result = call(adapter_url, "POST", "/epochs",
                        {"epoch_id": epoch_id, "scenario": case, "operations": ops})
    # No other request to the resource is allowed before this independent read.
    final = call(base, "GET", path, operation_id=epoch_id + "-observe", epoch_id=epoch_id)
    epoch = epoch_result["body"] if isinstance(epoch_result["body"], dict) else {}
    actual_ops = epoch.get("operations", [])
    witnessed, witness_reason, interfering = checks_for_epoch(trace, epoch_id, path)
    overlap = epoch.get("overlap_observed") is True and epoch.get("all_workers_ready_before_release") is True
    statuses = [item.get("status") for item in actual_ops]
    final_field = final["body"].get(field) if isinstance(final["body"], dict) else None
    if (epoch_result["status"] != 200 or not witnessed or not overlap or len(statuses) != 2 or
            statuses != [200, 200] or final["status"] != 200):
        verdict, reason = "INCONCLUSIVE", witness_reason or "overlap-or-success-precondition-missing"
    elif final_field not in values:
        verdict, reason = "SEMANTIC_CANDIDATE", "final-value-not-from-either-successful-write"
    else:
        verdict, reason = "PASS", "one-successful-value-visible"
    return {"trial": trial, "case": case, "path": path, "verdict": verdict,
            "reason": reason, "epoch_id": epoch_id, "controls": controls,
            "reset_status": reset["status"], "overlap": overlap, "statuses": statuses,
            "final_status": final["status"], "final_value": final_field,
            "legal_values": list(values), "intervening_events": interfering,
            "release_skew_ns": epoch.get("release_skew_ns")}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--target", default="http://127.0.0.1:3477")
    parser.add_argument("--trials", type=int, default=5)
    parser.add_argument("--prefix-rounds", type=int, default=4)
    parser.add_argument("--quiescence-ms", type=int, default=150)
    parser.add_argument("--seed", type=int, default=20261005)
    parser.add_argument("--freeze-evidence", action="store_true")
    args = parser.parse_args()
    if not os.environ.get("GITEA_API_TOKEN", "").strip():
        parser.error("GITEA_API_TOKEN must be set by Stage 1 in this process")
    if not 1 <= args.trials <= 50 or not 0 <= args.prefix_rounds <= 10:
        parser.error("Trials or PrefixRounds out of bounds")
    root = Path(args.root).resolve()
    spec_path = root / "model/gitea/gitea-1.27.3-swagger.json"
    source = spec_path.read_bytes()
    if hashlib.sha256(source).hexdigest() != SPEC_SHA:
        parser.error("Frozen Gitea OpenAPI SHA256 mismatch")
    validate_spec(json.loads(source))
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")[:-3]
    run_name = "gitea-stage6_12-isolated-" + stamp
    run_dir = root / "runs" / run_name
    run_dir.mkdir(parents=True, exist_ok=False)
    trace = run_dir / "http-trace.jsonl"
    proxy_port, adapter_port = reserve_port(), reserve_port()
    while adapter_port == proxy_port:
        adapter_port = reserve_port()
    proxy = build_proxy(SimpleNamespace(listen_host="127.0.0.1", listen_port=proxy_port,
        target=args.target, api_prefix="/api/v1", trace=str(trace), bearer_token_env="GITEA_API_TOKEN",
        require_bearer_token=True, authorization_scheme="token", timeout=60.0))
    adapter = build_adapter(SimpleNamespace(listen_host="127.0.0.1", listen_port=adapter_port,
        upstream=f"http://127.0.0.1:{proxy_port}", epoch_log=str(run_dir / "concurrent-epochs.jsonl"),
        max_width=8, timeout=60.0, quiescence_ms=args.quiescence_ms))
    for server in (proxy, adapter):
        threading.Thread(target=server.serve_forever, daemon=True).start()
    base, adapter_url = f"http://127.0.0.1:{proxy_port}", f"http://127.0.0.1:{adapter_port}"
    rng = random.Random(args.seed)
    results = []
    try:
        if call(base, "GET", "/user")["status"] != 200:
            raise ValueError("Research user authentication failed")
        for trial in range(1, args.trials + 1):
            for case in CASES:
                try:
                    results.append(one_case(base, adapter_url, trace, trial, case, stamp,
                                            args.prefix_rounds, rng))
                except (ValueError, KeyError, TypeError, urllib.error.URLError, TimeoutError) as exc:
                    results.append({"trial": trial, "case": case, "verdict": "INCONCLUSIVE",
                                    "reason": f"{type(exc).__name__}: {exc}"})
    finally:
        for server in (adapter, proxy):
            server.shutdown()
            server.server_close()
    summary = {"schema_version": 1, "stage": "Gitea Stage 6.12 isolated directed diagnostic",
               "source_spec_sha256": SPEC_SHA, "created_utc": datetime.now(timezone.utc).isoformat(),
               "scope": "disclosed selected operations; independent of the OpenAPI-only generated campaign",
               "parameters": {"trials": args.trials, "prefix_rounds": args.prefix_rounds,
                              "quiescence_ms": args.quiescence_ms, "seed": args.seed},
               "counts": {k: sum(row["verdict"] == k for row in results)
                          for k in ("PASS", "SEMANTIC_CANDIDATE", "INCONCLUSIVE")},
               "results": results}
    (run_dir / "stage6_12-summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    (run_dir / "run-metadata.json").write_text(json.dumps({"source_spec": str(spec_path.relative_to(root)),
        "target": args.target, "case_order": list(CASES)}, indent=2), encoding="utf-8")
    (run_dir / "run_gitea_stage6_12_isolated.py").write_bytes(Path(__file__).read_bytes())
    # Redact OAuth response credentials in *all* evidence files, including adapter log.
    sanitizer = root / "scripts" / "redact_gitea_stage3_evidence.py"
    if not sanitizer.is_file():
        raise ValueError("Required Stage 3 evidence sanitizer is missing")
    subprocess.run([sys.executable, str(sanitizer), str(run_dir)], check=True)
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
        print("GITEA_STAGE6_12_EVIDENCE_READY")
        print("Evidence ZIP:", evidence)
        print("ZIP SHA256:", hashlib.sha256(evidence.read_bytes()).hexdigest())
    print("Trials:", args.trials, "Counts:", json.dumps(summary["counts"]))
    for row in results:
        print("GITEA_STAGE6_12_RESULT trial={trial} case={case} verdict={verdict} reason={reason}".format(**row))
    print("GITEA_STAGE6_12_COMPLETE")


if __name__ == "__main__":
    main()
