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
EXPECTED_GENERATOR_HASHES = {
    HERE / "derive_complex_stories.py": "35ff2abb75342d42eb88202f94734f94843032c59e40a2e7441bbcc29ad31538",
    ROOT / "openapi_to_sbt" / "render" / "stories_js.py": "47701f6461cac4a253a809e78b2d03754e7db5b253c4732466637698ab930e84",
    ROOT / "openapi_to_sbt" / "render" / "interfaces_js.py": "d449fd06aa169e21d9f8d6a9edd3595361747f25db15bba62e853484f05a845e",
}
EXPECTED_SUT = "2032cdddd5f52ca929ae669c3826278bbb29af08ef169e1febdc24216b9fae44"
EXPECTED_WITNESS_DEPTHS = {
    "A_LOGIC": 5,
    "B_LIFECYCLE": 5,
    "C_UNIQUENESS": 2,
    "D_INTEGRITY": 4,
    "E_REFERENTIAL_INTEGRITY": 4,
}
# V35 deliberately freezes the V34 complex-family generator.  These are generation
# lengths, not the V35 minimum HTTP witness lengths above.
FROZEN_COMPLEX_FAMILIES = {
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

    for p, expected in EXPECTED_GENERATOR_HASHES.items():
        actual = sha(p)
        if actual != expected:
            raise SystemExit(f"V35 generator freeze guard failed: {p} => {actual}, expected {expected}")

    generator = HERE / "derive_complex_stories.py"
    gtext = generator.read_text(encoding="utf-8")
    hits = [x for x in FORBIDDEN_GENERATOR_LITERALS if x in gtext]
    if hits:
        raise SystemExit(f"Generic-generator isolation failed; forbidden literals found: {hits}")

    manifest = json.loads((HERE / "semantic_fault_manifest.json").read_text(encoding="utf-8"))
    observed_depths = {x["id"]: int(x["minimum_http_steps"]) for x in manifest["classes"]}
    if observed_depths != EXPECTED_WITNESS_DEPTHS:
        raise SystemExit(f"V35 witness-depth manifest mismatch: {observed_depths}")
    if manifest.get("artifact_version") != "v35":
        raise SystemExit("V35 semantic manifest version mismatch")

    run(sys.executable, "-m", "unittest", "discover", "-s", HERE / "tests", "-v")

    with tempfile.TemporaryDirectory(prefix="v35_release_") as td:
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
        for fam, steps in re.findall(r"V34_FAMILY family=([a-z_]+) steps=(\d+)", story):
            found[fam] = max(found.get(fam, 0), int(steps))
        missing = {k: v for k, v in FROZEN_COMPLEX_FAMILIES.items() if found.get(k, 0) < v}
        if missing:
            raise SystemExit(f"Frozen V34 complex-family materialization changed: {missing}; found={found}")
        if "v31Id(" in story or "_fallback" in story:
            raise SystemExit("V35 runtime-ID guard failed: generation-time ID fallback remains in complex stories")
        if "//@provengo summon rtv" not in story or "@{" not in story:
            raise SystemExit("V35 runtime-ID guard failed: missing Runtime Variables consumer wiring in complex stories")

        iface = (a / "interfaces.netbox_a2a.js").read_text(encoding="utf-8")
        for snippet in ('indexOf("__PVG_RTV__:")', 'pvg.rtv.set(__rtv_id', 'substring(12)'):
            if snippet not in iface:
                raise SystemExit(f"V35 runtime-ID interface guard missing: {snippet}")
        if sha(a / "netbox_a2a_openapi.json") != EXPECTED_OPENAPI:
            raise SystemExit("Generated model OpenAPI preservation failed")

        # Hidden ground truth must not leak into generated inputs seen by tools.
        exposed_text = (a / "netbox_a2a_openapi.json").read_text(encoding="utf-8") + iface + story
        leaked = [x for x in ["fault_ground_truth", "NETBOX_V35_GROUND_TRUTH_LOG", *EXPECTED_WITNESS_DEPTHS] if x in exposed_text]
        if leaked:
            raise SystemExit(f"Hidden-ground-truth leakage into tool-visible generated inputs: {leaked}")

        sut = ROOT / "resources" / "development_kit" / "validation_only" / "suts" / "netbox" / "netbox_sut_buggy.py"
        if sha(sut) != EXPECTED_SUT:
            raise SystemExit(f"V35 SUT hash guard failed: {sha(sut)}")

    print("V35 RELEASE SELF-TEST: PASS")
    print(" - V29 OpenAPI byte preservation: PASS")
    print(" - V34 generator byte freeze: PASS")
    print(" - generic generator isolation (no domain/fault literals): PASS")
    print(" - V35 intermediate official witnesses 5/5/2/4/4: PASS")
    print(" - frozen complex-family generation retained at 8/6/2/5/5: PASS")
    print(" - evaluator sequence-local / no cross-test stitching tests: PASS")
    print(" - hidden SUT activation markers are diagnostic-only and HTTP-invisible: PASS")
    print(" - correct SUT variant repairs all five seeded faults: PASS")
    print(" - deterministic model rebuild: PASS")
    print(" - Provengo runtime-ID capture/interpolation wiring retained: PASS")
    print(" - no generation-time fallback IDs in deep scenarios: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
