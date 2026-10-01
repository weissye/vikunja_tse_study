#!/usr/bin/env python3
"""Keycloak stage-2 runtime prerequisite gate; deliberately not a concurrency oracle."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

EXPECTED_SPEC = "ba68e1c3842c11701ec64c5f3ba23387cf53963f8d16dd7c3d45da103b9421db"


class GateFailure(Exception):
    pass


def request(base, path, method="GET", token=None, payload=None, form=None):
    body = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(payload).encode("utf-8")
    if form is not None:
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        body = urllib.parse.urlencode(form).encode("utf-8")
    if token is not None:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(base + path, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            return resp.status, dict(resp.headers), resp.read()
    except urllib.error.HTTPError as exc:
        return exc.code, dict(exc.headers), exc.read(2048)


def check(status, expected, label):
    if status not in expected:
        raise GateFailure(f"{label}: HTTP {status}; expected {sorted(expected)}")


def read_json(body, label):
    try:
        return json.loads(body)
    except (ValueError, UnicodeDecodeError) as exc:
        raise GateFailure(label + ": response is not JSON") from exc


def extract_id(headers, resource):
    location = headers.get("Location") or headers.get("location")
    if not location:
        raise GateFailure(resource + ": successful create response did not include Location")
    identifier = urllib.parse.unquote(urllib.parse.urlsplit(location).path.rstrip("/").split("/")[-1])
    if not identifier or identifier in ("users", "realms") or "/" in identifier:
        raise GateFailure(resource + ": could not extract a resource ID from Location")
    return identifier


def save(path, result):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--spec", type=Path, required=True)
    ap.add_argument("--generated", type=Path, required=True, help="0.26.17 generated output directory")
    ap.add_argument("--out", type=Path, required=True, help="New JSON result path")
    ap.add_argument("--base-url", default="http://127.0.0.1:9928")
    ap.add_argument("--prefix-rounds", type=int, default=8)
    args = ap.parse_args()
    if not 1 <= args.prefix_rounds <= 20:
        ap.error("prefix-rounds must be 1..20")
    if args.out.exists():
        ap.error("Output already exists; preserve prior evidence")
    pwd = os.environ.get("KC_STAGE2_ADMIN_PASSWORD")
    if not pwd:
        ap.error("Set KC_STAGE2_ADMIN_PASSWORD in this PowerShell session before running")
    spec = args.spec.read_bytes()
    if hashlib.sha256(spec).hexdigest() != EXPECTED_SPEC:
        ap.error("Keycloak OpenAPI hash differs from the stage-2 preflight contract")
    raw = json.loads(spec)
    report = json.loads((args.generated / "generation_report.json").read_text(encoding="utf-8"))
    graph = json.loads((args.generated / "dependency_graph.json").read_text(encoding="utf-8"))
    parent = "admin/realms"
    child = "admin/realms/{realm}/users"
    if report.get("meta", {}).get("cli_args", {}).get("generator_version") != "0.26.17":
        ap.error("Expected artifacts generated with 0.26.17")
    if report.get("meta", {}).get("cli_args", {}).get("source_openapi_sha256") != EXPECTED_SPEC:
        ap.error("Generated artifacts do not correspond to the pinned OpenAPI")
    if not {parent, child}.issubset({e["key"] for e in report.get("entities", [])}):
        ap.error("Generated plan lacks the realm-to-user nested entity pair")
    if not any(e.get("source") == child and e.get("target") == parent for e in graph.get("edges", [])):
        ap.error("Generated graph lacks the realm-to-user dependency")
    required = {"/admin/realms": ("post",), "/admin/realms/{realm}": ("get",),
                "/admin/realms/{realm}/users": ("post",),
                "/admin/realms/{realm}/users/{user-id}": ("get", "put")}
    for path, methods in required.items():
        if any(method not in raw.get("paths", {}).get(path, {}) for method in methods):
            ap.error("Required operation missing in pinned contract: " + path)

    base = args.base_url.rstrip("/")
    if base != "http://127.0.0.1:9928":
        ap.error("Pilot only permits the isolated loopback Keycloak address")
    result = {"schema_version": 1, "generator_version": "0.26.17", "openapi_sha256": EXPECTED_SPEC,
              "basis": "live prerequisite gate for the generated realm-to-user relation",
              "runtime_status": "INCOMPLETE", "runtime_verified_entities": 0,
              "runtime_verified_edges": 0, "prefix_verified_rounds": 0,
              "concurrency_status": "NOT_RUN", "steps": [], "resource_paths": {}}
    realm = "fse-stage2-" + uuid.uuid4().hex[:12]
    user_name = "fse-user-" + uuid.uuid4().hex[:12]
    try:
        status, _, body = request(base, "/realms/master/.well-known/openid-configuration")
        check(status, {200}, "server ready")
        if read_json(body, "discovery").get("issuer") != base + "/realms/master":
            raise GateFailure("unexpected issuer; check the running container")
        result["steps"].append({"name": "discovery", "status": status})
        status, _, body = request(base, "/realms/master/protocol/openid-connect/token", method="POST",
                                  form={"client_id": "admin-cli", "grant_type": "password",
                                        "username": "admin", "password": pwd})
        check(status, {200}, "admin token")
        token = read_json(body, "admin token").get("access_token")
        if not token:
            raise GateFailure("admin token response lacked access_token")
        result["steps"].append({"name": "admin_token", "status": status})
        realm_path = "/admin/realms/" + urllib.parse.quote(realm, safe="")
        user_collection = realm_path + "/users"
        status, _, _ = request(base, "/admin/realms", "POST", token, {"realm": realm, "enabled": True})
        check(status, {201}, "create realm")
        result["resource_paths"]["realm"] = realm_path
        result["steps"].append({"name": "create_realm", "status": status})
        status, _, body = request(base, realm_path, token=token)
        check(status, {200}, "read realm")
        if read_json(body, "read realm").get("realm") != realm:
            raise GateFailure("realm read did not return created realm")
        result["runtime_verified_entities"] = 1
        result["steps"].append({"name": "read_realm", "status": status})
        status, headers, _ = request(base, user_collection, "POST", token,
                                     {"username": user_name, "enabled": True,
                                      "firstName": "Initial", "lastName": "Pilot"})
        check(status, {201}, "create user")
        user_id = extract_id(headers, "create user")
        user_path = user_collection + "/" + urllib.parse.quote(user_id, safe="")
        result["resource_paths"]["user"] = user_path
        result["steps"].append({"name": "create_user", "status": status, "location_id_bound": True})
        status, _, body = request(base, user_path, token=token)
        check(status, {200}, "read user")
        observed = read_json(body, "read user")
        if observed.get("id") != user_id or observed.get("username") != user_name:
            raise GateFailure("user read did not match POST Location and username")
        result["runtime_verified_entities"] = 2
        result["runtime_verified_edges"] = 1
        result["steps"].append({"name": "read_user", "status": status, "id_confirmed": True})
        for index in range(args.prefix_rounds):
            value = "Stage2Round" + str(index + 1)
            status, _, _ = request(base, user_path, "PUT", token, {"firstName": value})
            check(status, {204}, "prefix PUT round " + str(index + 1))
            status, _, body = request(base, user_path, token=token)
            check(status, {200}, "prefix GET round " + str(index + 1))
            if read_json(body, "prefix GET").get("firstName") != value:
                raise GateFailure("prefix GET disagrees with successful update at round " + str(index + 1))
            result["prefix_verified_rounds"] += 1
            result["steps"].append({"name": "verified_prefix_round", "round": index + 1,
                                    "update_status": 204, "read_status": status})
        result["runtime_status"] = "LIVE_PREREQUISITES_VERIFIED"
    except (GateFailure, urllib.error.URLError, TimeoutError) as exc:
        result["failure"] = str(exc)
    finally:
        result["completed_utc"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        save(args.out, result)
    print("KEYCLOAK_STAGE2_LIVE_GATE", result["runtime_status"],
          "entities=", result["runtime_verified_entities"], "edges=", result["runtime_verified_edges"],
          "prefix=", result["prefix_verified_rounds"], "report=", args.out)
    if result["runtime_status"] != "LIVE_PREREQUISITES_VERIFIED":
        print("KEYCLOAK_STAGE2_GATE_FAILURE", result.get("failure", "unknown"), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
