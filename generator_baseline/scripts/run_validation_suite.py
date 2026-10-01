#!/usr/bin/env python3
"""Runs the complete four-system validation suite end to end, preserving
each phase's separate command and timestamp (DEVELOPMENT_PROMPT.md: "For
each supplied example, execute these phases in order and preserve their
separate commands and timestamps: 1. generate ... 2. validate ... 3.
optional smoke ... 4. compare-reference").

This script is test/dev *infrastructure*, not part of the generator
package: it is the only place in the repository allowed to know the kit's
example/reference paths, because it orchestrates the independent
post-generation comparison. `openapi_to_sbt/` itself never imports this
file or receives these paths at generation time.

Usage:
    python3 scripts/run_validation_suite.py --kit-root /path/to/dev_kit \
        --output build/validation_suite
"""
from __future__ import annotations

import argparse
import datetime
import json
import subprocess
import sys
from pathlib import Path

SYSTEMS = ["library", "garage", "pharmacy", "netbox"]
BASE_URLS = {"library": "http://localhost:5001", "garage": "http://localhost:5000",
             "pharmacy": "http://localhost:5000", "netbox": "http://localhost:8000"}


def _run(cmd, cwd):
    t0 = datetime.datetime.utcnow().isoformat() + "Z"
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    t1 = datetime.datetime.utcnow().isoformat() + "Z"
    return {
        "command": " ".join(cmd), "started": t0, "finished": t1,
        "exit_code": proc.returncode, "stdout_tail": proc.stdout[-4000:], "stderr_tail": proc.stderr[-4000:],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kit-root", required=True, help="Path to the development kit (contains examples/, validation_only/)")
    ap.add_argument("--output", required=True, help="Directory to write build outputs + VALIDATION_REPORT.md into")
    ap.add_argument("--repo-root", default=str(Path(__file__).resolve().parents[1]))
    args = ap.parse_args()

    kit_root = Path(args.kit_root)
    repo_root = Path(args.repo_root)
    out_root = Path(args.output)
    out_root.mkdir(parents=True, exist_ok=True)

    py = sys.executable
    all_results = {}

    for name in SYSTEMS:
        openapi_path = kit_root / "examples" / name / "openapi.json"
        if not openapi_path.exists():
            all_results[name] = {"skipped": f"{openapi_path} not found"}
            continue
        build_dir = out_root / name
        compare_dir = out_root / f"{name}_compare"

        phases = {}
        phases["1_generate"] = _run(
            [py, "-m", "openapi_to_sbt", "generate", "--openapi", str(openapi_path),
             "--output", str(build_dir), "--name", name, "--base-url", BASE_URLS[name],
             "--seed", "1", "--force"],
            cwd=str(repo_root),
        )
        phases["2_validate"] = _run(
            [py, "-m", "openapi_to_sbt", "validate", "--openapi", str(openapi_path),
             "--generated", str(build_dir)],
            cwd=str(repo_root),
        )
        phases["3_smoke_execution"] = {"skipped": "optional; not run by this harness (see USAGE.md)"}
        ref_stories = kit_root / "examples" / name / "stories.reference.js"
        ref_interfaces = kit_root / "examples" / name / "interfaces.reference.js"
        if ref_stories.exists() and ref_interfaces.exists():
            phases["4_compare_reference"] = _run(
                [py, "-m", "openapi_to_sbt", "compare-reference", "--openapi", str(openapi_path),
                 "--generated", str(build_dir), "--reference-stories", str(ref_stories),
                 "--reference-interfaces", str(ref_interfaces), "--report", str(compare_dir)],
                cwd=str(repo_root),
            )
        else:
            phases["4_compare_reference"] = {"skipped": "reference files not found"}

        gen_report_path = build_dir / "generation_report.json"
        coverage = {}
        if gen_report_path.exists():
            coverage = json.loads(gen_report_path.read_text(encoding="utf-8")).get("coverage", {})

        compare_summary = {}
        compare_json = compare_dir / "reference_comparison.json"
        if compare_json.exists():
            compare_summary = json.loads(compare_json.read_text(encoding="utf-8")).get("summary", {})

        all_results[name] = {"phases": phases, "coverage": coverage, "compare_summary": compare_summary}

    (out_root / "validation_suite_evidence.json").write_text(
        json.dumps(all_results, indent=2, sort_keys=True), encoding="utf-8")

    _write_markdown(all_results, out_root / "VALIDATION_REPORT.md", kit_root)
    print(f"Validation suite complete. See {out_root / 'VALIDATION_REPORT.md'}")


def _write_markdown(results, path: Path, kit_root: Path):
    import platform
    lines = [
        "# VALIDATION_REPORT.md", "",
        f"Generated: {datetime.datetime.utcnow().isoformat()}Z",
        f"Python: {sys.version.split()[0]}  Platform: {platform.platform()}",
        f"Kit root: `{kit_root}`", "",
        "## Per-system results", "",
    ]
    for name, r in results.items():
        lines.append(f"### {name}")
        if "skipped" in r:
            lines.append(f"SKIPPED: {r['skipped']}")
            lines.append("")
            continue
        cov = r.get("coverage", {})
        lines.append(f"- Operation coverage: {cov.get('covered_operations', '?')}/{cov.get('total_operations', '?')}")
        cmp = r.get("compare_summary", {})
        if cmp:
            lines.append(f"- compare-reference summary: {cmp}")
        for phase_name, phase in r.get("phases", {}).items():
            if "skipped" in phase:
                lines.append(f"- {phase_name}: skipped ({phase['skipped']})")
            else:
                lines.append(f"- {phase_name}: exit={phase['exit_code']} "
                              f"started={phase['started']} finished={phase['finished']}")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
