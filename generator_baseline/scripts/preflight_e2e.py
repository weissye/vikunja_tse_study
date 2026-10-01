#!/usr/bin/env python3
"""Fast environment preflight for shim and real-Provengo E2E paths.

Returns before any SUT startup/wait loop. Output is stable JSON so artifact
reviewers can preserve it as evidence.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def command_version(name: str, args=("--version",)):
    exe = shutil.which(name)
    if not exe:
        return {"ok": False, "path": None, "version": None, "detail": f"{name} not found on PATH"}
    try:
        p = subprocess.run([exe, *args], capture_output=True, text=True, timeout=8)
        text = ((p.stdout or "") + (p.stderr or "")).strip().splitlines()
        return {"ok": p.returncode == 0, "path": exe, "version": text[0] if text else "", "detail": "" if p.returncode == 0 else f"exit={p.returncode}"}
    except Exception as exc:
        return {"ok": False, "path": exe, "version": None, "detail": str(exc)}


def module_check(name: str):
    ok = importlib.util.find_spec(name) is not None
    return {"ok": ok, "detail": "installed" if ok else "missing"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=("shim", "provengo"), default="provengo")
    ap.add_argument("--development-kit", default=str(ROOT / "resources/development_kit"))
    ap.add_argument("--system", choices=("library", "garage", "pharmacy", "netbox", "todoist"))
    args = ap.parse_args()

    checks = {}
    checks["python"] = {
        "ok": sys.version_info >= (3, 9),
        "version": sys.version.split()[0],
        "path": sys.executable,
        "detail": "requires Python >=3.9",
    }
    for mod in ("yaml", "flask", "flask_cors", "werkzeug"):
        checks[f"python_module:{mod}"] = module_check(mod)

    checks["node"] = command_version("node")
    if args.mode == "provengo":
        checks["java"] = command_version("java", ("-version",))
        checks["provengo"] = command_version("provengo")

    dk = Path(args.development_kit)
    checks["development_kit"] = {"ok": dk.is_dir(), "path": str(dk), "detail": "" if dk.is_dir() else "directory missing"}
    if args.system and args.system != "todoist":
        required = [
            dk / "examples" / args.system / "openapi.json",
            dk / "validation_only" / "suts" / args.system,
        ]
        checks[f"system_resources:{args.system}"] = {
            "ok": all(p.exists() for p in required),
            "paths": [str(p) for p in required],
            "detail": "" if all(p.exists() for p in required) else "required OpenAPI/SUT resource missing",
        }
    elif args.system == "todoist":
        required = [
            ROOT / "holdout" / "todoist_rest_v2_openapi.yaml",
            ROOT / "holdout" / "sut" / "todoist_sut.py",
            ROOT / "holdout" / "sut" / "todoist_sut_buggy.py",
        ]
        checks["system_resources:todoist"] = {
            "ok": all(p.is_file() for p in required),
            "paths": [str(p) for p in required],
            "detail": "" if all(p.is_file() for p in required) else "Todoist OpenAPI/SUT resource missing",
        }

    failed = sorted(k for k, v in checks.items() if not v.get("ok"))
    report = {"mode": args.mode, "ok": not failed, "failed_checks": failed, "checks": checks}
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["ok"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
