#!/usr/bin/env python3
"""Prove byte-stable generation for identical semantic inputs in ."""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from hashlib import sha256
from pathlib import Path


def digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def run(root: Path, openapi: Path, name: str, seed: int, entity_n: int, action_n: int) -> dict:
    tmp = Path(tempfile.mkdtemp(prefix="sbt--det-"))
    try:
        specs = []
        outs = []
        for i in (1, 2):
            spec = tmp / f"copy_{i}.json"
            shutil.copy2(openapi, spec)
            out = tmp / f"out_{i}"
            env = os.environ.copy()
            env["PYTHONPATH"] = str(root)
            cmd = [sys.executable, "-m", "openapi_to_sbt", "generate",
                   "--openapi", str(spec), "--output", str(out), "--name", name,
                   "--base-url", "http://127.0.0.1:5000", "--seed", str(seed),
                   "--instances-per-entity", str(entity_n),
                   "--instances-per-action", str(action_n), "--force"]
            cp = subprocess.run(cmd, cwd=root, env=env, text=True,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            if cp.returncode:
                raise SystemExit(f"generation {i} failed ({cp.returncode}):\n{cp.stdout}")
            specs.append(spec); outs.append(out)
        files = [f"interfaces.{name}.js", f"stories.{name}.js",
                 "dependency_graph.json", "generation_report.json"]
        mismatches = []
        hashes = {}
        for fn in files:
            a, b = outs[0]/fn, outs[1]/fn
            da, db = digest(a), digest(b)
            hashes[fn] = da
            if da != db or a.read_bytes() != b.read_bytes():
                mismatches.append(fn)
        report = json.loads((outs[0]/"generation_report.json").read_text(encoding="utf-8"))
        result = {
            "ok": not mismatches,
            "seed": seed,
            "instances_per_entity": entity_n,
            "instances_per_action": action_n,
            "byte_identical_files": [f for f in files if f not in mismatches],
            "mismatches": mismatches,
            "hashes": hashes,
            "content_fingerprint_sha256": report["reproducibility"]["content_fingerprint_sha256"],
        }
        print(json.dumps(result, indent=2, sort_keys=True))
        return result
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    ap = argparse.ArgumentParser()
    ap.add_argument("--openapi", default=str(root / "resources/development_kit/examples/library/openapi.json"))
    ap.add_argument("--name", default="library")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--instances-per-entity", type=int, default=5)
    ap.add_argument("--instances-per-action", type=int, default=7)
    a = ap.parse_args()
    result = run(root, Path(a.openapi), a.name, a.seed,
                 a.instances_per_entity, a.instances_per_action)
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
