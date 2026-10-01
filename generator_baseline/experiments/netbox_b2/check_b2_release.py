#!/usr/bin/env python3
from __future__ import annotations
import hashlib, importlib.util, subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load_eval():
    p = HERE / "evaluate_netbox_b2.py"
    spec = importlib.util.spec_from_file_location("b2_eval", p)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod

def e(method, path, status, body=None, response=None, line=0):
    return {"method": method, "path": path, "status": status, "body": body or {}, "response": response or {}, "trace_line": line}

def evaluator_gate() -> None:
    ev = load_eval()
    fixtures = {
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
            e("POST", "/api/circuits/circuits", 201, {"id":"x","status":"planned"}, {"id":"x","status":"planned"}, 1),
            e("PATCH", "/api/circuits/circuits/x", 200, {"status":"active"}, {"id":"x","status":"planned"}, 2),
            e("GET", "/api/circuits/circuits/x", 200, {}, {"id":"x","status":"planned"}, 3),
        ],
        "E_WORKFLOW": [
            e("POST", "/api/dcim/devices", 201, {"id":"e","status":"draft"}, {"id":"e","status":"draft"}, 1),
            e("PATCH", "/api/dcim/devices/e", 200, {"status":"archived"}, {"id":"e","status":"archived"}, 2),
        ],
    }
    for target,recs in fixtures.items():
        if not ev.evaluate(target,recs)[0]:
            raise SystemExit(f"B2 evaluator fixture failed: {target}")
    if ev.evaluate("B_LIFECYCLE", fixtures["B_LIFECYCLE"][:4])[0]:
        raise SystemExit("B2 evaluator incorrectly confirms B_LIFECYCLE before 5 operations")
    one_child=[fixtures["B_LIFECYCLE"][0],fixtures["B_LIFECYCLE"][1],fixtures["B_LIFECYCLE"][3],fixtures["B_LIFECYCLE"][4]]
    for n,x in enumerate(one_child,1): x["trace_line"]=n
    if ev.evaluate("B_LIFECYCLE", one_child)[0]:
        raise SystemExit("B2 evaluator incorrectly confirms B_LIFECYCLE with only one child")
    wrong=list(fixtures["B_LIFECYCLE"]); wrong[-1]=e("GET","/api/dcim/devices/d1",200,{}, {"id":"d1","site":{"id":"other"}},5)
    if ev.evaluate("B_LIFECYCLE", wrong)[0]:
        raise SystemExit("B2 evaluator incorrectly confirms when surviving child does not reference deleted parent")

def checksum_gate() -> None:
    for manifest in (HERE/"SHA256SUMS.txt", ROOT/"experiments"/"netbox_b0"/"SHA256SUMS.txt", ROOT/"experiments"/"netbox_b1"/"SHA256SUMS.txt"):
        base=manifest.parent
        for line in manifest.read_text(encoding="utf-8").splitlines():
            if not line.strip(): continue
            expected,name=line.split(None,1); path=base/name.lstrip("* ")
            if not path.exists() or sha256(path)!=expected:
                raise SystemExit(f"Checksum mismatch: {path}")

def source_gate() -> None:
    target=(HERE/"netbox_b2_target.js").read_text(encoding="utf-8")
    sut=(HERE/"netbox_b2_sut.py").read_text(encoding="utf-8")
    required=[
        'patch("/api/dcim/devices/b2_dev_A", { site: { id: "b2_site_A2" } });',
        'id: "b2_dev_B1"', 'id: "b2_dev_B2"',
        'del("/api/dcim/sites/b2_site_B", 204);',
        'get("/api/dcim/devices/b2_dev_B1", 200);',
    ]
    if any(x not in target for x in required):
        raise SystemExit("B2 target materialization is incomplete")
    if 'if len(kids) >= 2:' not in sut or 'return ("", 204)' not in sut:
        raise SystemExit("B2 B_LIFECYCLE SUT mechanism missing")
    if 'key == "api/dcim/devices" and "site" in updates' not in sut:
        raise SystemExit("B1 A_LOGIC mechanism not preserved")

def main() -> int:
    checksum_gate(); source_gate(); evaluator_gate()
    try:
        subprocess.run(["node","--check",str(HERE/"netbox_b2_target.js")],check=True,capture_output=True,text=True)
        node_status="PASS"
    except FileNotFoundError:
        node_status="SKIPPED (node unavailable)"
    print("B2 RELEASE SELF-TEST: PASS")
    print(" - B2 file checksums: PASS")
    print(" - frozen B0/B1 file checksums: PASS")
    print(" - A_LOGIC retained 5-step positive fixture: PASS")
    print(" - B_LIFECYCLE 5-step positive fixture: PASS")
    print(" - B_LIFECYCLE early-prefix rejection: PASS")
    print(" - B_LIFECYCLE one-child rejection: PASS")
    print(" - B_LIFECYCLE wrong-reference rejection: PASS")
    print(" - C-E retained positive fixtures: PASS")
    print(f" - target JavaScript syntax: {node_status}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
