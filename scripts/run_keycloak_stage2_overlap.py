#!/usr/bin/env python3
"""Focused, evidence-preserving Keycloak user-update overlap decision."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path
import sys
import threading
import time
import urllib.error
import urllib.parse
import uuid

from run_keycloak_stage2_live_gate import request, check, read_json, extract_id, save, GateFailure

SPEC_SHA = "ba68e1c3842c11701ec64c5f3ba23387cf53963f8d16dd7c3d45da103b9421db"
USER_TEMPLATE = "/admin/realms/{realm}/users/{user-id}"
ORACLE_ID = "concurrency::same-field-domain::put:" + USER_TEMPLATE
FIELDS = ("firstName", "lastName")
UPDATES = ({"firstName": "ConcurrentFirst"}, {"lastName": "ConcurrentLast"})


def projection(body):
    return {field: body.get(field) for field in FIELDS}


def decide(control_ab, control_ba, racing, reads):
    """A bounded observed-state serializability check; never infer overlap from a barrier."""
    if any(c.get("initial") != racing.get("initial") for c in (control_ab, control_ba)):
        return "INCONCLUSIVE", "initial-states-differ"
    if any(c.get("statuses") != [204, 204] or c.get("read_statuses") != [200, 200]
           for c in (control_ab, control_ba)):
        return "INCONCLUSIVE", "serial-control-failed"
    if racing.get("errors") or racing.get("statuses") != [204, 204]:
        return "INCONCLUSIVE", "concurrent-update-failed"
    intervals = racing.get("intervals", [])
    if len(intervals) != 2 or not all(isinstance(i, list) and len(i) == 2 and i[0] < i[1] for i in intervals):
        return "INCONCLUSIVE", "timing-unavailable"
    if max(i[0] for i in intervals) >= min(i[1] for i in intervals):
        return "INCONCLUSIVE", "no-client-interval-overlap"
    if len(reads) != 2 or any(r.get("status") != 200 for r in reads):
        return "INCONCLUSIVE", "post-join-read-failed"
    if reads[0].get("fields") != reads[1].get("fields"):
        return "INCONCLUSIVE", "post-join-state-unstable"
    allowed = (control_ab.get("final"), control_ba.get("final"))
    if reads[0]["fields"] in allowed:
        return "PASS", "matches-observed-serial-control"
    return "SEMANTIC_CANDIDATE", "stable-result-outside-both-observed-serial-orders"


def validate_inputs(args):
    if args.out.exists():
        raise GateFailure("output already exists; preserve old evidence")
    if args.base_url.rstrip("/") != "http://127.0.0.1:9928":
        raise GateFailure("only the isolated Keycloak loopback endpoint is allowed")
    if not 1 <= args.prefix_rounds <= 20:
        raise GateFailure("prefix-rounds must be 1..20")
    if hashlib.sha256(args.spec.read_bytes()).hexdigest() != SPEC_SHA:
        raise GateFailure("pinned Keycloak OpenAPI hash mismatch")
    spec = json.loads(args.spec.read_text(encoding="utf-8"))
    paths = spec.get("paths", {})
    if any(m not in paths.get(p, {}) for p, m in (("/admin/realms", "post"),
                                                  ("/admin/realms/{realm}", "get"),
                                                  ("/admin/realms/{realm}/users", "post"),
                                                  (USER_TEMPLATE, "get"), (USER_TEMPLATE, "put"))):
        raise GateFailure("required endpoints absent from pinned OpenAPI")
    props = spec["components"]["schemas"]["UserRepresentation"]["properties"]
    for field in FIELDS:
        if props.get(field, {}).get("type") != "string" or props[field].get("readOnly"):
            raise GateFailure("field is not writable string according to OpenAPI: " + field)
    summary = json.loads(args.inventory.read_text(encoding="utf-8"))
    if summary.get("openapi_sha256") != SPEC_SHA or summary.get("generator_version") != "0.26.17":
        raise GateFailure("inventory does not match pinned generated contract")
    if summary.get("user_update_ready") != 0:
        raise GateFailure("inventory readiness changed; re-evaluate this adapter")
    gate = json.loads(args.gate.read_text(encoding="utf-8"))
    if (gate.get("runtime_status"), gate.get("runtime_verified_edges"), gate.get("openapi_sha256")) != (
            "LIVE_PREREQUISITES_VERIFIED", 1, SPEC_SHA):
        raise GateFailure("verified realm-to-user prerequisite gate is required")


def run_trial(args, pwd, result):
    base = args.base_url.rstrip("/")
    status, _, body = request(base, "/realms/master/.well-known/openid-configuration")
    check(status, {200}, "discovery")
    if read_json(body, "discovery").get("issuer") != base + "/realms/master":
        raise GateFailure("unexpected issuer")
    status, _, body = request(base, "/realms/master/protocol/openid-connect/token", "POST",
                              form={"client_id": "admin-cli", "grant_type": "password",
                                    "username": "admin", "password": pwd})
    check(status, {200}, "admin login")
    token = read_json(body, "admin login").get("access_token")
    if not token:
        raise GateFailure("admin login had no token")
    realm = "fse-overlap-" + uuid.uuid4().hex[:12]
    realm_path = "/admin/realms/" + urllib.parse.quote(realm, safe="")
    status, _, _ = request(base, "/admin/realms", "POST", token, {"realm": realm, "enabled": True})
    check(status, {201}, "create realm")
    result["realm_path"] = realm_path
    status, _, body = request(base, realm_path, token=token)
    check(status, {200}, "read realm")
    if read_json(body, "read realm").get("realm") != realm:
        raise GateFailure("realm identity mismatch")
    user_paths = []
    for label in ("ab", "ba", "overlap"):
        username = "fse-" + label + "-" + uuid.uuid4().hex[:12]
        status, headers, _ = request(base, realm_path + "/users", "POST", token,
                                     {"username": username, "enabled": True,
                                      "firstName": "Initial", "lastName": "Pilot"})
        check(status, {201}, "create " + label)
        identifier = extract_id(headers, label)
        path = realm_path + "/users/" + urllib.parse.quote(identifier, safe="")
        status, _, body = request(base, path, token=token)
        check(status, {200}, "read created " + label)
        observed = read_json(body, label)
        if observed.get("id") != identifier or observed.get("username") != username:
            raise GateFailure(label + ": POST Location did not resolve to this user")
        result["instances"][label] = {"path": path, "create_status": 201, "location_id_bound": True,
                                       "prefix": []}
        for index in range(args.prefix_rounds):
            value = "Stage2Round" + str(index + 1)
            update, _, _ = request(base, path, "PUT", token, {"firstName": value})
            check(update, {204}, "prefix PUT")
            read_status, _, data = request(base, path, token=token)
            check(read_status, {200}, "prefix GET")
            fields = projection(read_json(data, "prefix GET"))
            if fields["firstName"] != value:
                raise GateFailure(label + ": prefix read did not match update")
            result["instances"][label]["prefix"].append({"round": index + 1,
                "put_status": update, "get_status": read_status, "fields": fields})
        user_paths.append(path)

    def read_fields(path):
        status, _, body = request(base, path, token=token)
        return {"status": status, "fields": projection(read_json(body, "user read")) if status == 200 else None}

    baselines = [read_fields(p) for p in user_paths]
    if any(x["status"] != 200 for x in baselines):
        raise GateFailure("baseline user read failed")
    for label, path, order, baseline in zip(("ab", "ba"), user_paths[:2], ((0, 1), (1, 0)), baselines[:2]):
        control = {"initial": baseline["fields"], "order": [FIELDS[i] for i in order],
                   "statuses": [], "read_statuses": [], "after_each": []}
        for i in order:
            status, _, _ = request(base, path, "PUT", token, UPDATES[i])
            control["statuses"].append(status)
            read = read_fields(path)
            control["read_statuses"].append(read["status"])
            control["after_each"].append(read["fields"])
        control["final"] = control["after_each"][-1]
        result["controls"][label] = control

    barrier = threading.Barrier(3, timeout=10)
    def worker(i):
        try:
            barrier.wait()
            start = time.perf_counter_ns()
            status, _, _ = request(base, user_paths[2], "PUT", token, UPDATES[i])
            end = time.perf_counter_ns()
            return {"status": status, "interval_ns": [start, end]}
        except (threading.BrokenBarrierError, urllib.error.URLError, TimeoutError, OSError) as exc:
            return {"error_type": type(exc).__name__}

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(worker, i) for i in range(2)]
        try:
            barrier.wait(timeout=10)
        except threading.BrokenBarrierError:
            pass
        attempts = [f.result(timeout=20) for f in futures]
    racing = {"initial": baselines[2]["fields"], "statuses": [a.get("status") for a in attempts],
              "intervals": [a.get("interval_ns") for a in attempts],
              "errors": [a["error_type"] for a in attempts if "error_type" in a]}
    result["race"] = racing
    result["final_reads"].append(read_fields(user_paths[2]))
    time.sleep(0.2)
    result["final_reads"].append(read_fields(user_paths[2]))
    result["verdict"], result["reason"] = decide(result["controls"]["ab"],
        result["controls"]["ba"], racing, result["final_reads"])


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--spec", required=True, type=Path)
    ap.add_argument("--inventory", required=True, type=Path, help="generated readiness-summary.json")
    ap.add_argument("--gate", required=True, type=Path, help="successful live-gate.json")
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--prefix-rounds", type=int, default=8)
    ap.add_argument("--base-url", default="http://127.0.0.1:9928")
    args = ap.parse_args()
    try:
        validate_inputs(args)
    except (GateFailure, OSError, ValueError, KeyError) as exc:
        ap.error(str(exc))
    pwd = os.environ.get("KC_STAGE2_ADMIN_PASSWORD")
    if not pwd:
        ap.error("KC_STAGE2_ADMIN_PASSWORD must be set in this PowerShell session")
    result = {"schema_version": 1, "experiment": "keycloak-user-disjoint-field-put-overlap",
              "openapi_sha256": SPEC_SHA, "generator_version": "0.26.17",
              "generated_oracle_reference": ORACLE_ID, "generated_oracle_runtime_ready": False,
              "scope": "focused empirical diagnostic; not a generated Provengo campaign verdict",
              "fixture_binding": "verified POST Location ID followed by item GET",
              "fields": list(FIELDS), "prefix_rounds_requested": args.prefix_rounds,
              "realm_path": None, "instances": {}, "controls": {}, "race": {}, "final_reads": [],
              "verdict": "INCONCLUSIVE", "reason": "setup-incomplete"}
    try:
        run_trial(args, pwd, result)
    except (GateFailure, urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
        result["failure_type"] = type(exc).__name__
        result["reason"] = "experiment-failed; see failure_type"
    finally:
        result["completed_utc"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        save(args.out, result)
    print("KEYCLOAK_OVERLAP_DECISION", result["verdict"], result["reason"], "report=", args.out)
    return 1 if result["reason"] == "experiment-failed; see failure_type" else 0


if __name__ == "__main__":
    raise SystemExit(main())
