#!/usr/bin/env python3
from __future__ import annotations
import hashlib
import importlib.util
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_eval():
    p = HERE / "evaluate_netbox_b4.py"
    spec = importlib.util.spec_from_file_location("b4_eval", p)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


def e(method, path, status, body=None, response=None, line=0):
    return {"method": method, "path": path, "status": status, "body": body or {}, "response": response or {}, "trace_line": line}


def fixtures():
    return {
        "A_LOGIC": [
            e("POST", "/api/dcim/sites", 201, {"id":"s1"}, {"id":"s1"}, 1),
            e("POST", "/api/dcim/sites", 201, {"id":"s2"}, {"id":"s2"}, 2),
            e("POST", "/api/dcim/devices", 201, {"id":"d","site":{"id":"s1"}}, {"id":"d","site":{"id":"s1"}}, 3),
            e("PATCH", "/api/dcim/devices/d", 200, {"site":{"id":"s2"}}, {"id":"d","site":{"id":"s1"}}, 4),
            e("GET", "/api/dcim/devices/d", 200, {}, {"id":"d","site":{"id":"s1"}}, 5),
        ],
        "B_LIFECYCLE": [
            e("POST", "/api/dcim/sites", 201, {"id":"b"}, {"id":"b"}, 1),
            e("POST", "/api/dcim/devices", 201, {"id":"d1","site":{"id":"b"}}, {"id":"d1","site":{"id":"b"}}, 2),
            e("POST", "/api/dcim/devices", 201, {"id":"d2","site":{"id":"b"}}, {"id":"d2","site":{"id":"b"}}, 3),
            e("DELETE", "/api/dcim/sites/b", 204, {}, {}, 4),
            e("GET", "/api/dcim/devices/d1", 200, {}, {"id":"d1","site":{"id":"b"}}, 5),
        ],
        "C_UNIQUENESS": [
            e("POST", "/api/dcim/sites", 201, {"id":"c1","slug":"dup"}, {"id":"c1","slug":"dup"}, 1),
            e("POST", "/api/dcim/sites", 201, {"id":"c2","slug":"dup"}, {"id":"c2","slug":"dup"}, 2),
        ],
        "D_INTEGRITY": [
            e("POST", "/api/circuits/circuits", 201, {"id":"x","description":"initial"}, {"id":"x","description":"initial"}, 1),
            e("PATCH", "/api/circuits/circuits/x", 200, {"description":"verified"}, {"id":"x","description":"verified"}, 2),
            e("GET", "/api/circuits/circuits/x", 200, {}, {"id":"x","description":"verified"}, 3),
            e("PATCH", "/api/circuits/circuits/x", 200, {"description":"lost"}, {"id":"x","description":"verified"}, 4),
        ],
        "E_REFERENTIAL_INTEGRITY": [
            e("POST", "/api/dcim/sites", 201, {"id":"e"}, {"id":"e"}, 1),
            e("POST", "/api/dcim/devices", 201, {"id":"e1","site":{"id":"e"}}, {"id":"e1","site":{"id":"e"}}, 2),
            e("DELETE", "/api/dcim/sites/e", 204, {}, {}, 3),
            e("POST", "/api/dcim/devices", 201, {"id":"e2","site":{"id":"e"}}, {"id":"e2","site":{"id":"e"}}, 4),
        ],
    }


def evaluator_gate() -> None:
    ev = load_eval()
    fx = fixtures()
    expected = {"A_LOGIC":5,"B_LIFECYCLE":5,"C_UNIQUENESS":2,"D_INTEGRITY":4,"E_REFERENTIAL_INTEGRITY":4}
    if ev.EXPECTED_MIN_STEPS != expected:
        raise SystemExit(f"B4 minimum-step map mismatch: {ev.EXPECTED_MIN_STEPS}")
    for target, recs in fx.items():
        if not ev.evaluate(target, recs)[0]:
            raise SystemExit(f"B4 evaluator positive fixture failed: {target}")

    e4 = fx["E_REFERENTIAL_INTEGRITY"]
    if ev.evaluate("E_REFERENTIAL_INTEGRITY", e4[:3])[0]:
        raise SystemExit("B4 evaluator incorrectly confirms E before 4 operations")

    no_history = [
        e("POST", "/api/dcim/sites", 201, {"id":"e"}, {"id":"e"}, 1),
        e("DELETE", "/api/dcim/sites/e", 204, {}, {}, 2),
        e("POST", "/api/dcim/devices", 201, {"id":"e2","site":{"id":"e"}}, {"id":"e2","site":{"id":"e"}}, 3),
        e("GET", "/api/dcim/devices/e2", 200, {}, {"id":"e2","site":{"id":"e"}}, 4),
    ]
    if ev.evaluate("E_REFERENTIAL_INTEGRITY", no_history)[0]:
        raise SystemExit("B4 evaluator incorrectly confirms E without valid parent-child history")

    bad_delete = list(e4)
    bad_delete[2] = e("DELETE", "/api/dcim/sites/e", 404, {}, {"detail":"Not found."}, 3)
    if ev.evaluate("E_REFERENTIAL_INTEGRITY", bad_delete)[0]:
        raise SystemExit("B4 evaluator incorrectly confirms E without successful parent deletion")

    rejected_reuse = list(e4)
    rejected_reuse[3] = e("POST", "/api/dcim/devices", 400, {"id":"e2","site":{"id":"e"}}, {"detail":"unknown parent"}, 4)
    if ev.evaluate("E_REFERENTIAL_INTEGRITY", rejected_reuse)[0]:
        raise SystemExit("B4 evaluator incorrectly confirms E when reuse is rejected")

    wrong_response = list(e4)
    wrong_response[3] = e("POST", "/api/dcim/devices", 201, {"id":"e2","site":{"id":"e"}}, {"id":"e2","site":{"id":"other"}}, 4)
    if ev.evaluate("E_REFERENTIAL_INTEGRITY", wrong_response)[0]:
        raise SystemExit("B4 evaluator incorrectly confirms E when successful response does not preserve deleted parent ref")


def checksum_gate() -> None:
    manifests = [
        HERE / "SHA256SUMS.txt",
        ROOT / "experiments" / "netbox_b0" / "SHA256SUMS.txt",
        ROOT / "experiments" / "netbox_b1" / "SHA256SUMS.txt",
        ROOT / "experiments" / "netbox_b2" / "SHA256SUMS.txt",
        ROOT / "experiments" / "netbox_b3" / "SHA256SUMS.txt",
    ]
    for manifest in manifests:
        base = manifest.parent
        for line in manifest.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            expected, name = line.split(None, 1)
            path = base / name.lstrip("* ")
            if not path.exists() or sha256(path) != expected:
                raise SystemExit(f"Checksum mismatch: {path}")


def source_gate() -> None:
    target = (HERE / "netbox_b4_target.js").read_text(encoding="utf-8")
    sut = (HERE / "netbox_b4_sut.py").read_text(encoding="utf-8")
    required_target = [
        'patch("/api/dcim/devices/b4_dev_A", { site: { id: "b4_site_A2" } });',
        'id: "b4_dev_B1"', 'id: "b4_dev_B2"',
        'del("/api/dcim/sites/b4_site_B", 204);',
        'patch("/api/circuits/circuits/b4_circuit_D", { description: "verified" });',
        'get("/api/circuits/circuits/b4_circuit_D", 200);',
        'patch("/api/circuits/circuits/b4_circuit_D", { description: "lost-second-update" });',
        'id: "b4_site_E"', 'id: "b4_dev_E1"',
        'del("/api/dcim/sites/b4_site_E", 204);',
        'id: "b4_dev_E2"',
    ]
    if any(x not in target for x in required_target):
        raise SystemExit("B4 target materialization is incomplete")
    required_sut = [
        'if len(kids) >= 2:',
        'key == "api/dcim/devices" and "site" in updates',
        'key == "api/circuits/circuits" and "description" in updates',
        'meta["patches"] >= 1 and meta["verified_after_first"]',
        'deleted_site_meta[str(item_id)]',
        'reuse_after_valid_history = bool(history and history.get("had_child_before_delete"))',
        'if not parent_exists and not reuse_after_valid_history:',
    ]
    if any(x not in sut for x in required_sut):
        raise SystemExit("B4 SUT hardening mechanisms are incomplete")


def main() -> int:
    checksum_gate()
    source_gate()
    evaluator_gate()
    try:
        subprocess.run(["node", "--check", str(HERE / "netbox_b4_target.js")], check=True, capture_output=True, text=True)
        node_status = "PASS"
    except FileNotFoundError:
        node_status = "SKIPPED (node unavailable)"
    print("B4 RELEASE SELF-TEST: PASS")
    print(" - B4 file checksums: PASS")
    print(" - frozen B0/B1/B2/B3 file checksums: PASS")
    print(" - A_LOGIC retained 5-step fixture: PASS")
    print(" - B_LIFECYCLE retained 5-step fixture: PASS")
    print(" - C_UNIQUENESS retained/already-V35 2-step fixture: PASS")
    print(" - D_INTEGRITY retained 4-step fixture: PASS")
    print(" - E_REFERENTIAL_INTEGRITY 4-step positive fixture: PASS")
    print(" - E early-prefix rejection: PASS")
    print(" - E missing-history rejection: PASS")
    print(" - E unsuccessful-delete rejection: PASS")
    print(" - E rejected-reuse rejection: PASS")
    print(" - E wrong-response-reference rejection: PASS")
    print(f" - target JavaScript syntax: {node_status}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
