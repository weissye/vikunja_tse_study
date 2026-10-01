#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
EXPECTED_OPENAPI = "dae055dc0eac76045389286820719f4a8b1fbd3be7d7897c50ba87cdd01d2060"
REQUIRED = {
    "relation_second_reassignment": 8,
    "parent_delete_multiple_children": 6,
    "duplicate_required_string": 2,
    "scalar_second_update": 5,
    "deleted_parent_reference_reuse": 5,
}
FORBIDDEN_GENERATOR_LITERALS = [
    "Site", "Device", "Circuit", "slug", "description",
    "A_LOGIC", "B_LIFECYCLE", "C_UNIQUENESS", "D_INTEGRITY", "E_REFERENTIAL_INTEGRITY",
]


def sha(path: Path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for b in iter(lambda: f.read(1024 * 1024), b""):
            h.update(b)
    return h.hexdigest()


def run(*cmd, cwd=ROOT):
    r = subprocess.run([str(x) for x in cmd], cwd=cwd, text=True, capture_output=True)
    if r.returncode:
        print(r.stdout)
        print(r.stderr, file=sys.stderr)
        raise SystemExit(r.returncode)
    return r


def file_hashes(root: Path):
    return {p.relative_to(root).as_posix(): sha(p) for p in sorted(root.rglob("*")) if p.is_file()}


def main():
    spec = HERE / "spec" / "netbox_uc2_runtime_openapi.json"
    ref = HERE / "generated_reference" / "netbox_a2a_openapi.json"
    for p in (spec, ref):
        actual = sha(p)
        if actual != EXPECTED_OPENAPI:
            raise SystemExit(f"OpenAPI hash guard failed: {p} => {actual}")

    generator = HERE / "derive_complex_stories.py"
    gtext = generator.read_text(encoding="utf-8")
    hits = [x for x in FORBIDDEN_GENERATOR_LITERALS if x in gtext]
    if hits:
        raise SystemExit(f"Generic-generator isolation failed; forbidden literals found: {hits}")

    run(sys.executable, "-m", "unittest", "discover", "-s", HERE / "tests", "-v")

    with tempfile.TemporaryDirectory(prefix="v31_release_") as td:
        t = Path(td)
        a, b = t / "build_a", t / "build_b"
        env_cmd = [sys.executable, HERE / "build_netbox_a2a.py"]
        run(*env_cmd, "--output", a, "--seed", "1", "--instances-per-entity", "5", "--instances-per-action", "7")
        run(*env_cmd, "--output", b, "--seed", "1", "--instances-per-entity", "5", "--instances-per-action", "7")
        ha, hb = file_hashes(a), file_hashes(b)
        if ha != hb:
            diff = sorted(set(ha) | set(hb))
            changed = [x for x in diff if ha.get(x) != hb.get(x)]
            raise SystemExit(f"Deterministic rebuild failed: {changed}")
        story = (a / "complex_stories.netbox_a2a.js").read_text(encoding="utf-8")
        found = {}
        for fam, steps in re.findall(r"V31_FAMILY family=([a-z_]+) steps=(\d+)", story):
            found[fam] = max(found.get(fam, 0), int(steps))
        missing = {k: v for k, v in REQUIRED.items() if found.get(k, 0) < v}
        if missing:
            raise SystemExit(f"Deep-prefix materialization failed: {missing}; found={found}")
        if sha(a / "netbox_a2a_openapi.json") != EXPECTED_OPENAPI:
            raise SystemExit("Generated model OpenAPI preservation failed")

    print("V31 RELEASE SELF-TEST: PASS")
    print(" - V29 OpenAPI byte preservation: PASS")
    print(" - generic generator isolation (no domain/fault literals): PASS")
    print(" - deep families materialized at 8/6/2/5/5 HTTP steps: PASS")
    print(" - evaluator sequence-local / no cross-test stitching unit tests: PASS")
    print(" - deep-prefix SUT activation unit tests: PASS")
    print(" - deterministic model rebuild: PASS")
    print(" - generated reference OpenAPI hash: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
