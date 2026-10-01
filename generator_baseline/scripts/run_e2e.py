#!/usr/bin/env python3
"""End-to-end runner: OpenAPI contract -> generated interfaces/stories ->
real HTTP execution against a running SUT (normal or buggy), start to
finish, with total wall-clock timing and an enforced time budget.

Phases (each separately timed, same spirit as scripts/run_validation_suite.py):
  1. generate   (python3 -m openapi_to_sbt generate ...)
  2. validate   (python3 -m openapi_to_sbt validate ...)
  3. start SUT  (spawn the chosen Flask SUT as a subprocess, wait for it
                 to accept connections)
  4. smoke run  (node scripts/bpjs_direct_shim.js -- real, synchronous
                 HTTP calls against the running SUT; runs the full
                 generated CRUD + reverse-deletion lifecycle, and
                 optionally the hand-authored attack probes)

The SUT is always stopped in a `finally` block, and the wall-clock budget
(--budget-seconds) is enforced across the *whole* run: once exceeded, no
further phase is started, the SUT is stopped, and the report records
which phase was in progress when the budget ran out.

Usage:
    python3 scripts/run_e2e.py \\
        --openapi holdout/todoist_rest_v2_openapi.yaml --name todoist \\
        --sut normal --port 5099 \\
        --output build/e2e_todoist_normal --budget-seconds 1800

    python3 scripts/run_e2e.py \\
        --openapi holdout/todoist_rest_v2_openapi.yaml --name todoist \\
        --sut buggy --port 5098 --attack holdout/sut/attack_probes.todoist.js \\
        --output build/e2e_todoist_buggy --budget-seconds 1800
"""
from __future__ import annotations

import argparse
import json
import shutil
import socket
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Budget:
    def __init__(self, seconds):
        self.deadline = time.monotonic() + seconds if seconds else None

    def remaining(self) -> float:
        if self.deadline is None:
            return float("inf")
        return self.deadline - time.monotonic()

    def exceeded(self) -> bool:
        return self.remaining() <= 0

    def remaining_ms(self) -> int:
        r = self.remaining()
        return 2**31 - 1 if r == float("inf") else max(0, int(r * 1000))


def wait_for_port(host: str, port: int, budget: Budget, poll_interval: float = 0.2) -> bool:
    while not budget.exceeded():
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except OSError:
            time.sleep(poll_interval)
    return False


def run_phase(name: str, cmd, budget: Budget, cwd=None):
    t0 = now_iso()
    start = time.monotonic()
    timeout = None if budget.remaining() == float("inf") else max(0.1, budget.remaining())
    try:
        proc = subprocess.run(cmd, cwd=cwd or REPO_ROOT, capture_output=True, text=True, timeout=timeout)
        result = {
            "phase": name, "command": " ".join(str(c) for c in cmd),
            "started": t0, "finished": now_iso(), "elapsed_s": round(time.monotonic() - start, 3),
            "exit_code": proc.returncode, "timed_out": False,
            "stdout_tail": proc.stdout[-3000:], "stderr_tail": proc.stderr[-3000:],
        }
    except subprocess.TimeoutExpired as e:
        result = {
            "phase": name, "command": " ".join(str(c) for c in cmd),
            "started": t0, "finished": now_iso(), "elapsed_s": round(time.monotonic() - start, 3),
            "exit_code": None, "timed_out": True,
            "stdout_tail": (e.stdout or "")[-3000:], "stderr_tail": (e.stderr or "")[-3000:],
        }
    return result


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--openapi", required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--output", required=True, help="Where generated files + the e2e report are written")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--sut", choices=["normal", "buggy"], default="normal")
    ap.add_argument("--sut-script", help="Path to the SUT .py script (default: holdout/sut/todoist_sut[_buggy].py)")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=5099)
    ap.add_argument("--attack", help="Path to a hand-authored attack-probe .js file to run alongside stories.js")
    ap.add_argument("--budget-seconds", type=float, default=None,
                     help="Hard wall-clock budget for the ENTIRE run (e.g. 1800 for 30 minutes, 3600 for 1 hour). "
                          "Omit for no limit.")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    # Fail fast on missing E2E dependencies instead of spending the startup
    # timeout waiting for a SUT that could never import/run.
    preflight = subprocess.run(
        [sys.executable, str(REPO_ROOT / "scripts" / "preflight_e2e.py"), "--mode", "shim"],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )
    if preflight.returncode != 0:
        print(preflight.stdout)
        print(preflight.stderr, file=sys.stderr)
        return 2

    overall_start = time.monotonic()
    overall_start_iso = now_iso()
    budget = Budget(args.budget_seconds)

    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)
    phases = []
    sut_proc = None

    sut_script = args.sut_script or str(
        REPO_ROOT / "holdout" / "sut" / f"todoist_sut{'_buggy' if args.sut == 'buggy' else ''}.py"
    )

    def finalize(status: str):
        nonlocal sut_proc
        if sut_proc is not None:
            sut_proc.terminate()
            try:
                sut_proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                sut_proc.kill()
        total_elapsed = time.monotonic() - overall_start
        report = {
            "status": status,
            "started": overall_start_iso,
            "finished": now_iso(),
            "total_elapsed_seconds": round(total_elapsed, 3),
            "budget_seconds": args.budget_seconds,
            "budget_exceeded": budget.exceeded(),
            "config": {
                "openapi": args.openapi, "name": args.name, "sut": args.sut,
                "sut_script": sut_script, "port": args.port, "attack": args.attack,
            },
            "phases": phases,
        }
        (out_dir / "e2e_report.json").write_text(json.dumps(report, indent=2, sort_keys=True), encoding="utf-8")
        _write_markdown(report, out_dir / "E2E_REPORT.md")
        print(f"\n=== E2E run {status} in {total_elapsed:.2f}s (budget={args.budget_seconds}s) ===")
        print(f"Report: {out_dir / 'E2E_REPORT.md'}")
        return 0 if status == "PASSED" else 1

    # ---- Phase 1: generate ----
    gen_dir = out_dir / "generated"
    cmd = [sys.executable, "-m", "openapi_to_sbt", "generate", "--openapi", args.openapi,
           "--output", str(gen_dir), "--name", args.name,
           "--base-url", f"http://{args.host}:{args.port}", "--seed", str(args.seed)]
    if args.force:
        cmd.append("--force")
    r = run_phase("1_generate", cmd, budget)
    phases.append(r)
    if r["timed_out"] or r["exit_code"] != 0:
        return finalize("FAILED_AT_GENERATE" if not r["timed_out"] else "TIMED_OUT_AT_GENERATE")

    # ---- Phase 2: validate ----
    r = run_phase("2_validate", [sys.executable, "-m", "openapi_to_sbt", "validate",
                                  "--openapi", args.openapi, "--generated", str(gen_dir)], budget)
    phases.append(r)
    if r["timed_out"]:
        return finalize("TIMED_OUT_AT_VALIDATE")
    # validate failing (exit 1) is recorded but does not abort the smoke run --
    # a coverage/syntax issue is useful to see alongside the execution result.

    if budget.exceeded():
        return finalize("TIMED_OUT_BEFORE_SUT_START")

    # ---- Phase 3: start SUT ----
    t0 = now_iso()
    start = time.monotonic()
    sut_proc = subprocess.Popen([sys.executable, sut_script, str(args.port)],
                                 stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, cwd=REPO_ROOT)
    ready = wait_for_port(args.host, args.port, budget)
    phases.append({
        "phase": "3_start_sut", "command": f"{sut_script} {args.port}",
        "started": t0, "finished": now_iso(), "elapsed_s": round(time.monotonic() - start, 3),
        "exit_code": None, "timed_out": not ready, "ready": ready,
    })
    if not ready:
        return finalize("TIMED_OUT_STARTING_SUT")

    # ---- Phase 4: smoke run (real HTTP via the direct-execution shim) ----
    interfaces_js = gen_dir / f"interfaces.{args.name}.js"
    stories_js = gen_dir / f"stories.{args.name}.js"
    node = shutil.which("node")
    if not node:
        phases.append({"phase": "4_smoke_run", "skipped": "node not installed"})
        return finalize("SKIPPED_NO_NODE")

    shim_cmd = [node, str(REPO_ROOT / "scripts" / "bpjs_direct_shim.js"),
                "--interfaces", str(interfaces_js), "--stories", str(stories_js),
                "--base-url", f"http://{args.host}:{args.port}",
                "--budget-ms", str(budget.remaining_ms())]
    if args.attack:
        shim_cmd += ["--attack", args.attack]

    t0 = now_iso()
    start = time.monotonic()
    timeout = None if budget.remaining() == float("inf") else max(0.1, budget.remaining())
    smoke_summary = None
    try:
        proc = subprocess.run(shim_cmd, capture_output=True, text=True, timeout=timeout, cwd=REPO_ROOT)
        try:
            smoke_summary = json.loads(proc.stdout.strip().splitlines()[-1]) if proc.stdout.strip() else None
        except (json.JSONDecodeError, IndexError):
            smoke_summary = None
        phases.append({
            "phase": "4_smoke_run", "command": " ".join(shim_cmd),
            "started": t0, "finished": now_iso(), "elapsed_s": round(time.monotonic() - start, 3),
            "exit_code": proc.returncode, "timed_out": False,
            "stderr_tail": proc.stderr[-4000:], "summary": smoke_summary,
        })
    except subprocess.TimeoutExpired as e:
        phases.append({
            "phase": "4_smoke_run", "command": " ".join(shim_cmd),
            "started": t0, "finished": now_iso(), "elapsed_s": round(time.monotonic() - start, 3),
            "exit_code": None, "timed_out": True, "stderr_tail": (e.stderr or "")[-4000:],
        })
        return finalize("TIMED_OUT_DURING_SMOKE_RUN")

    if smoke_summary is None:
        return finalize("SMOKE_RUN_PRODUCED_NO_SUMMARY")
    if not smoke_summary.get("ok"):
        return finalize("SMOKE_RUN_ERROR")
    unexpected_violations = [v for v in smoke_summary.get("protocol_violations", []) if "bthread" not in v or "meta:Inject" not in str(v.get("bthread", ""))]
    if unexpected_violations:
        return finalize("SMOKE_RUN_UNEXPECTED_PROTOCOL_VIOLATIONS")

    return finalize("PASSED")


def _write_markdown(report, path: Path):
    lines = [
        "# E2E_REPORT.md", "",
        f"Status: **{report['status']}**",
        f"Started: {report['started']}  Finished: {report['finished']}",
        f"Total elapsed: **{report['total_elapsed_seconds']}s** "
        f"(budget: {report['budget_seconds']}s, exceeded: {report['budget_exceeded']})",
        f"Config: `{json.dumps(report['config'])}`", "",
        "## Phases", "",
    ]
    for p in report["phases"]:
        lines.append(f"### {p.get('phase')}")
        for k in ("command", "started", "finished", "elapsed_s", "exit_code", "timed_out", "ready"):
            if k in p:
                lines.append(f"- {k}: `{p[k]}`")
        if p.get("summary"):
            s = p["summary"]
            lines.append(f"- http_calls: {s.get('http_calls')}")
            lines.append(f"- protocol_violations: {len(s.get('protocol_violations', []))}")
            lines.append(f"- probe_results: {json.dumps(s.get('probe_results', []))}")
            lines.append(f"- created (Done: events): {json.dumps(s.get('created_counts', {}))}")
            lines.append(f"- deleted (Done: events): {json.dumps(s.get('deleted_counts', {}))}")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
