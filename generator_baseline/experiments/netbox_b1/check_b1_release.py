#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def load_eval():
    p = HERE / "evaluate_netbox_b1.py"
    spec = importlib.util.spec_from_file_location("b1_eval", p)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


def e(method, path, status, body=None, response=None, line=0):
    return {
        "method": method, "path": path, "status": status,
        "body": body or {}, "response": response or {}, "trace_line": line,
    }


def evaluator_gate() -> None:
    ev = load_eval()
    fixtures = {
        "A_LOGIC": [
            e("POST", "/api/dcim/sites", 201, {"id": "s1"}, {"id": "s1"}, 1),
            e("POST", "/api/dcim/sites", 201, {"id": "s2"}, {"id": "s2"}, 2),
            e("POST", "/api/dcim/devices", 201, {"id": "d", "site": {"id": "s1"}}, {"id": "d", "site": {"id": "s1"}}, 3),
            e("PATCH", "/api/dcim/devices/d", 200, {"site": {"id": "s2"}}, {"id": "d", "site": {"id": "s1"}}, 4),
            e("GET", "/api/dcim/devices/d", 200, {}, {"id": "d", "site": {"id": "s1"}}, 5),
        ],
        "B_LIFECYCLE": [
            e("POST", "/api/dcim/sites", 201, {"id": "b"}, {"id": "b"}, 1),
            e("DELETE", "/api/dcim/sites/b", 404, {}, {"detail": "Deletion recorded."}, 2),
            e("GET", "/api/dcim/sites/b", 200, {}, {"id": "b"}, 3),
        ],
        "C_UNIQUENESS": [
            e("POST", "/api/dcim/sites", 201, {"id": "c1", "slug": "dup"}, {"id": "c1", "slug": "dup"}, 1),
            e("POST", "/api/dcim/sites", 201, {"id": "c2", "slug": "dup"}, {"id": "c2", "slug": "dup"}, 2),
        ],
        "D_INTEGRITY": [
            e("POST", "/api/circuits/circuits", 201, {"id": "x", "status": "planned"}, {"id": "x", "status": "planned"}, 1),
            e("PATCH", "/api/circuits/circuits/x", 200, {"status": "active"}, {"id": "x", "status": "planned"}, 2),
            e("GET", "/api/circuits/circuits/x", 200, {}, {"id": "x", "status": "planned"}, 3),
        ],
        "E_WORKFLOW": [
            e("POST", "/api/dcim/devices", 201, {"id": "e", "status": "draft"}, {"id": "e", "status": "draft"}, 1),
            e("PATCH", "/api/dcim/devices/e", 200, {"status": "archived"}, {"id": "e", "status": "archived"}, 2),
        ],
    }
    for target, recs in fixtures.items():
        ok, _, _ = ev.evaluate(target, recs)
        if not ok:
            raise SystemExit(f"B1 evaluator fixture failed: {target}")
    if ev.evaluate("A_LOGIC", fixtures["A_LOGIC"][:4])[0]:
        raise SystemExit("B1 evaluator incorrectly confirms A_LOGIC before 5 operations")
    correct = list(fixtures["A_LOGIC"])
    correct[-1] = e("GET", "/api/dcim/devices/d", 200, {}, {"id": "d", "site": {"id": "s2"}}, 5)
    if ev.evaluate("A_LOGIC", correct)[0]:
        raise SystemExit("B1 evaluator incorrectly confirms a persisted reassignment")


def checksum_gate() -> None:
    for manifest in (HERE / "SHA256SUMS.txt", ROOT / "experiments" / "netbox_b0" / "SHA256SUMS.txt"):
        base = manifest.parent
        for line in manifest.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            expected, name = line.split(None, 1)
            name = name.lstrip("* ")
            path = base / name
            if not path.exists() or sha256(path) != expected:
                raise SystemExit(f"Checksum mismatch: {path}")


def source_gate() -> None:
    target = (HERE / "netbox_b1_target.js").read_text(encoding="utf-8")
    sut = (HERE / "netbox_b1_sut.py").read_text(encoding="utf-8")
    required_target = [
        'post("/api/dcim/sites",',
        'post("/api/dcim/devices",',
        'patch("/api/dcim/devices/b1_dev_A", { site: { id: "b1_site_A2" } });',
        'get("/api/dcim/devices/b1_dev_A", 200);',
    ]
    if any(x not in target for x in required_target):
        raise SystemExit("B1 A_LOGIC target materialization is incomplete")
    if 'key == "api/dcim/devices" and "site" in updates' not in sut:
        raise SystemExit("B1 A_LOGIC SUT mechanism missing")
    if 'key == "api/circuits/circuits" and "status" in updates' not in sut:
        raise SystemExit("B0 D_INTEGRITY preservation missing")


def main() -> int:
    checksum_gate()
    source_gate()
    evaluator_gate()
    # JS syntax can be checked when Node is present; Provengo globals need not resolve for --check.
    try:
        subprocess.run(["node", "--check", str(HERE / "netbox_b1_target.js")], check=True, capture_output=True, text=True)
        node_status = "PASS"
    except FileNotFoundError:
        node_status = "SKIPPED (node unavailable)"
    print("B1 RELEASE SELF-TEST: PASS")
    print(" - B1 file checksums: PASS")
    print(" - frozen B0 file checksums: PASS")
    print(" - A_LOGIC 5-step positive fixture: PASS")
    print(" - A_LOGIC early-prefix rejection: PASS")
    print(" - correct reassignment rejection: PASS")
    print(" - B-E retained positive fixtures: PASS")
    print(f" - target JavaScript syntax: {node_status}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
