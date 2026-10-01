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
EXPECTED_SUT = "2032cdddd5f52ca929ae669c3826278bbb29af08ef169e1febdc24216b9fae44"
EXPECTED_GENERATOR_HASHES = {
    HERE / "derive_complex_stories.py": "7339ef4dd94bc4ee9a64bd403a5cc266a16ccdc4ea272629baa77c6380beeece",
    ROOT / "openapi_to_sbt" / "inference" / "dependencies.py": "988ff9e0b7e1a8ce2581045d1d02aa4aba10f67f4a891a54156ca09dfdc4c715",
    ROOT / "openapi_to_sbt" / "render" / "plan.py": "ca0c8416519f536e10552d1beca69a91f8464291701ad097abe80895a0372b26",
    ROOT / "openapi_to_sbt" / "render" / "stories_js.py": "91912d0631161f3e6ad5e6486ed8116006e71a6fbfb1cf11f9ed9e04285a4785",
    ROOT / "openapi_to_sbt" / "render" / "interfaces_js.py": "759a0badc0603a6771dc516a2f9782efe54359c8d72462d546abd851bac9e123",
}
EXPECTED_WITNESS_DEPTHS = {
    "A_LOGIC": 5,
    "B_LIFECYCLE": 5,
    "C_UNIQUENESS": 2,
    "D_INTEGRITY": 4,
    "E_REFERENTIAL_INTEGRITY": 4,
}
REQUIRED_COMPLEX_FAMILIES = {
    "relation_second_reassignment": 8,
    "parent_delete_multiple_children": 6,
    "duplicate_required_string": 2,
    "scalar_second_update": 5,
    "deleted_parent_reference_reuse": 5,
}
FORBIDDEN_GENERATOR_LITERALS = [
    "A_LOGIC", "B_LIFECYCLE", "C_UNIQUENESS", "D_INTEGRITY", "E_REFERENTIAL_INTEGRITY",
]


def sha(path: Path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for b in iter(lambda: f.read(1024 * 1024), b""):
            h.update(b)
    return h.hexdigest()


def run(*cmd, cwd=ROOT):
    print("[V36 CHECK]", " ".join(str(x) for x in cmd), flush=True)
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

    sut = ROOT / "resources" / "development_kit" / "validation_only" / "suts" / "netbox" / "netbox_sut_buggy.py"
    if sha(sut) != EXPECTED_SUT:
        raise SystemExit(f"V36 SUT byte-preservation guard failed: {sha(sut)}")

    for p, expected in EXPECTED_GENERATOR_HASHES.items():
        actual = sha(p)
        if actual != expected:
            raise SystemExit(f"V36 generator hash guard failed: {p} => {actual}, expected {expected}")

    generator = (HERE / "derive_complex_stories.py").read_text(encoding="utf-8")
    hits = [x for x in FORBIDDEN_GENERATOR_LITERALS if x in generator]
    if hits:
        raise SystemExit(f"Generic-generator isolation failed; fault literals found: {hits}")

    manifest = json.loads((HERE / "semantic_fault_manifest.json").read_text(encoding="utf-8"))
    observed_depths = {x["id"]: int(x["minimum_http_steps"]) for x in manifest["classes"]}
    if observed_depths != EXPECTED_WITNESS_DEPTHS:
        raise SystemExit(f"V36 witness-depth manifest mismatch: {observed_depths}")
    if manifest.get("artifact_version") != "v36":
        raise SystemExit("V36 semantic manifest version mismatch")

    # Run the regression suites that cover V36 inference/rendering plus the
    # artifact-level parity guards.  The full historical unit corpus includes
    # expensive whole-spec generation checks and is intentionally not repeated
    # here; those remain available to reviewers as ordinary unit tests.
    for suite in [
        "tests.unit.test_inference",
        "tests.unit.test_rendering",
        "tests.unit.test_nested_reference_dependencies",
    ]:
        run(sys.executable, "-m", "unittest", suite, "-v")
    run(sys.executable, "-m", "unittest", "discover", "-s", HERE / "tests", "-v")

    protocol = (HERE / "A2A_PROTOCOL.md").read_text(encoding="utf-8").lower()
    for phrase in ["measurement parity", "same openapi information boundary", "no fault trigger"]:
        if phrase not in protocol:
            raise SystemExit(f"V36 A2A protocol guard missing: {phrase}")

    with tempfile.TemporaryDirectory(prefix="v36_release_") as td:
        t = Path(td)
        a, b = t / "build_a", t / "build_b"
        cmd = [sys.executable, HERE / "build_netbox_a2a.py"]
        run(*cmd, "--output", a, "--seed", "1", "--instances-per-entity", "5", "--instances-per-action", "7")
        run(*cmd, "--output", b, "--seed", "1", "--instances-per-entity", "5", "--instances-per-action", "7")
        ha, hb = file_hashes(a), file_hashes(b)
        if ha != hb:
            changed = [x for x in sorted(set(ha) | set(hb)) if ha.get(x) != hb.get(x)]
            raise SystemExit(f"Deterministic rebuild failed: {changed}")

        graph = json.loads((a / "dependency_graph.json").read_text(encoding="utf-8"))
        edges = {(e["source"], e["target"], e["field_name"], e["provenance"][0]["rule"])
                 for e in graph["edges"]}
        expected_edge = ("api/dcim/devices", "api/dcim/sites", "site", "D4:reference_object_alias_key_match")
        if expected_edge not in edges:
            raise SystemExit(f"V36 nested-reference edge missing: {edges}")
        if graph["creation_order"].index("api/dcim/sites") > graph["creation_order"].index("api/dcim/devices"):
            raise SystemExit("V36 creation order invalid: Device precedes Site")

        story = (a / "stories.netbox_a2a.js").read_text(encoding="utf-8")
        for snippet in [
            'deps["site"] = EventSet("wait:InstanceReady:Sites:1"',
            'let site = {"id": captured["site"]};',
            'let __createResult = dcimSitesCreate(',
            'let __justCreated = (__createResult && __createResult.data) ? __createResult.data : {};',
        ]:
            if snippet not in story:
                raise SystemExit(f"V36 generated-story guard missing: {snippet}")
        if 'let __justCreated = sync({ waitFor: matchAnySitesAdded() });' in story:
            raise SystemExit("V36 per-story identity guard failed: post-return generic Done wait remains")

        iface = (a / "interfaces.netbox_a2a.js").read_text(encoding="utf-8")
        for snippet in [
            'var __completionData = {',
            'sync({ request: Event("Done: " + __description, __completionData) });',
            'data: __completionData',
        ]:
            if snippet not in iface:
                raise SystemExit(f"V36 completion-data interface guard missing: {snippet}")

        complex_story = (a / "complex_stories.netbox_a2a.js").read_text(encoding="utf-8")
        found = {}
        for fam, steps in re.findall(r"V34_FAMILY family=([a-z_]+) steps=(\d+)", complex_story):
            found[fam] = max(found.get(fam, 0), int(steps))
        missing = {k: v for k, v in REQUIRED_COMPLEX_FAMILIES.items() if found.get(k, 0) < v}
        if missing:
            raise SystemExit(f"Complex-family materialization changed: {missing}; found={found}")
        if "_site_ref" in complex_story or '"id":"v34_dup' in complex_story and "_ref" in complex_story:
            raise SystemExit("V36 complex-story guard failed: invented nested-reference id remains")
        if "v31Id(" in complex_story or "_fallback" in complex_story:
            raise SystemExit("V36 runtime-ID guard failed: generation-time ID fallback remains")
        if "//@provengo summon rtv" not in complex_story or "@{" not in complex_story:
            raise SystemExit("V36 runtime-ID guard failed: missing Runtime Variables consumer wiring")

        if sha(a / "netbox_a2a_openapi.json") != EXPECTED_OPENAPI:
            raise SystemExit("Generated model OpenAPI preservation failed")

        exposed_text = (a / "netbox_a2a_openapi.json").read_text(encoding="utf-8") + iface + story + complex_story
        leaked = [x for x in ["fault_ground_truth", "NETBOX_V35_GROUND_TRUTH_LOG", *EXPECTED_WITNESS_DEPTHS] if x in exposed_text]
        if leaked:
            raise SystemExit(f"Hidden-ground-truth leakage into tool-visible generated inputs: {leaked}")

    print("V36 RELEASE SELF-TEST: PASS")
    print(" - V29/V35 OpenAPI byte preservation: PASS")
    print(" - V35 SUT byte preservation and 5/5/2/4/4 witnesses: PASS")
    print(" - nested SiteRef dependency inference and object-shaped binding: PASS")
    print(" - update/action schema-aware reference binding: PASS")
    print(" - per-story post-callback completion identity propagation: PASS")
    print(" - generic complex scenarios avoid invented nested reference IDs: PASS")
    print(" - complex family coverage retained: PASS")
    print(" - evaluator sequence-local / hidden ground truth diagnostic-only tests: PASS")
    print(" - deterministic model rebuild: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
