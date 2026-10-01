#!/usr/bin/env python3
"""Stream six five-scenario Provengo ensembles into one 30-scenario run source."""
import argparse
import hashlib
import json
from pathlib import Path


def sha256(path):
    result = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            result.update(block)
    return result.hexdigest()


def copy_items(source, target):
    if source.read(1) != b"[":
        raise ValueError(f"not an array: {source.name}")
    pending = b""
    while True:
        chunk = source.read(1024 * 1024)
        if not chunk:
            break
        if pending:
            target.write(pending)
        pending = chunk
    tail = pending.rstrip()
    if not tail.endswith(b"]"):
        raise ValueError(f"unterminated array: {source.name}")
    target.write(tail[:-1])


def merge(paths, output):
    if len(paths) != 6 or len(set(map(str, paths))) != 6:
        raise ValueError("six distinct Provengo selections are required")
    if output.exists():
        raise FileExistsError(output)
    manifest = []
    for path in paths:
        # Only five scenarios are loaded at a time; this also verifies each
        # file is JSON and has the expected selection size before writing.
        with path.open("r", encoding="utf-8") as source:
            runs = json.load(source)
        if not isinstance(runs, list) or len(runs) != 5:
            raise ValueError(f"expected five scenarios in {path}")
        if not all(isinstance(run, (list, dict)) for run in runs):
            raise ValueError(f"invalid scenario in {path}")
        manifest.append({"source": str(path), "sha256": sha256(path), "scenarios": 5})
    try:
        with output.open("xb") as target:
            target.write(b"[")
            for index, path in enumerate(paths):
                if index:
                    target.write(b",")
                with path.open("rb") as source:
                    copy_items(source, target)
            target.write(b"]\n")
        # The first 30-scenario file is substantially smaller than 300 but
        # can still be hundreds of MB; do not deserialize it a second time.
        manifest_path = output.with_name(output.stem + "-sources.json")
        manifest_path.write_text(json.dumps({
            "schema_version": 1, "selection": "two-stage Provengo genetic",
            "candidates": 300, "intermediate_candidates": 30,
            "original_sample_coverage": "six batches of 50",
            "global_optimality": "NOT_CLAIMED",
            "output_sha256": sha256(output), "sources": manifest,
        }, indent=2) + "\n", encoding="utf-8")
        return manifest_path
    except Exception:
        output.unlink(missing_ok=True)
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--selected", type=Path, action="append", required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    manifest = merge(args.selected, args.out)
    print("KEYCLOAK_INTERMEDIATE_30_READY", args.out, "manifest=", manifest)


if __name__ == "__main__":
    main()
