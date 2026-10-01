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
    p = HERE / "evaluate_netbox_b3.py"
    spec = importlib.util.spec_from_file_location("b3_eval", p)
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
        "E_WORKFLOW": [
            e("POST", "/api/dcim/devices", 201, {"id":"e","status":"draft"}, {"id":"e","status":"draft"}, 1),
            e("PATCH", "/api/dcim/devices/e", 200, {"status":"archived"}, {"id":"e","status":"archived"}, 2),
        ],
    }


def evaluator_gate() -> None:
    ev = load_eval()
    fx = fixtures()
    expected = {"A_LOGIC":5,"B_LIFECYCLE":5,"C_UNIQUENESS":2,"D_INTEGRITY":4,"E_WORKFLOW":2}
    if ev.EXPECTED_MIN_STEPS != expected:
        raise SystemExit(f"B3 minimum-step map mismatch: {ev.EXPECTED_MIN_STEPS}")
    for target, recs in fx.items():
        if not ev.evaluate(target, recs)[0]:
            raise SystemExit(f"B3 evaluator positive fixture failed: {target}")

    d = fx["D_INTEGRITY"]
    if ev.evaluate("D_INTEGRITY", d[:3])[0]:
        raise SystemExit("B3 evaluator incorrectly confirms D_INTEGRITY before 4 operations")

    no_verify = [d[0], d[1], d[3]]
    for n, x in enumerate(no_verify, 1):
        x = dict(x); x["trace_line"] = n; no_verify[n-1] = x
    if ev.evaluate("D_INTEGRITY", no_verify)[0]:
        raise SystemExit("B3 evaluator incorrectly confirms D_INTEGRITY without external GET verification")

    same_second = list(d)
    same_second[-1] = e("PATCH", "/api/circuits/circuits/x", 200, {"description":"verified"}, {"id":"x","description":"verified"}, 4)
    if ev.evaluate("D_INTEGRITY", same_second)[0]:
        raise SystemExit("B3 evaluator incorrectly confirms a non-distinct second update")

    applied_second = list(d)
    applied_second[-1] = e("PATCH", "/api/circuits/circuits/x", 200, {"description":"lost"}, {"id":"x","description":"lost"}, 4)
    if ev.evaluate("D_INTEGRITY", applied_second)[0]:
        raise SystemExit("B3 evaluator incorrectly confirms when second update is actually applied")


def checksum_gate() -> None:
    manifests = [
        HERE / "SHA256SUMS.txt",
        ROOT / "experiments" / "netbox_b0" / "SHA256SUMS.txt",
        ROOT / "experiments" / "netbox_b1" / "SHA256SUMS.txt",
        ROOT / "experiments" / "netbox_b2" / "SHA256SUMS.txt",
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
    target = (HERE / "netbox_b3_target.js").read_text(encoding="utf-8")
    sut = (HERE / "netbox_b3_sut.py").read_text(encoding="utf-8")
    required_target = [
        'patch("/api/dcim/devices/b3_dev_A", { site: { id: "b3_site_A2" } });',
        'id: "b3_dev_B1"', 'id: "b3_dev_B2"',
        'del("/api/dcim/sites/b3_site_B", 204);',
        'patch("/api/circuits/circuits/b3_circuit_D", { description: "verified" });',
        'get("/api/circuits/circuits/b3_circuit_D", 200);',
        'patch("/api/circuits/circuits/b3_circuit_D", { description: "lost-second-update" });',
    ]
    if any(x not in target for x in required_target):
        raise SystemExit("B3 target materialization is incomplete")
    required_sut = [
        'if len(kids) >= 2:',
        'key == "api/dcim/devices" and "site" in updates',
        'key == "api/circuits/circuits" and "description" in updates',
        'meta["patches"] >= 1 and meta["verified_after_first"]',
        'if meta["patches"] >= 1:',
    ]
    if any(x not in sut for x in required_sut):
        raise SystemExit("B3 SUT hardening mechanisms are incomplete")


def main() -> int:
    checksum_gate()
    source_gate()
    evaluator_gate()
    try:
        subprocess.run(["node", "--check", str(HERE / "netbox_b3_target.js")], check=True, capture_output=True, text=True)
        node_status = "PASS"
    except FileNotFoundError:
        node_status = "SKIPPED (node unavailable)"
    print("B3 RELEASE SELF-TEST: PASS")
    print(" - B3 file checksums: PASS")
    print(" - frozen B0/B1/B2 file checksums: PASS")
    print(" - A_LOGIC retained 5-step fixture: PASS")
    print(" - B_LIFECYCLE retained 5-step fixture: PASS")
    print(" - C_UNIQUENESS retained/already-V35 2-step fixture: PASS")
    print(" - D_INTEGRITY 4-step positive fixture: PASS")
    print(" - D_INTEGRITY early-prefix rejection: PASS")
    print(" - D_INTEGRITY missing-verification rejection: PASS")
    print(" - D_INTEGRITY same-value second-update rejection: PASS")
    print(" - D_INTEGRITY applied-second-update rejection: PASS")
    print(" - E_WORKFLOW retained 2-step fixture: PASS")
    print(f" - target JavaScript syntax: {node_status}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
