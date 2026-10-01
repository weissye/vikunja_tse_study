#!/usr/bin/env python3
"""Stream six verified 50-scenario Provengo samples into one 300-scenario ZIP."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import shutil
import zipfile


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def copy_array_items(source, target):
    """Copy the contents of a JSON array, omitting only its outer brackets."""
    first = source.read(1)
    if first != b"[":
        raise ValueError("a batch sample must begin with '['")
    pending = b""
    while True:
        block = source.read(1 << 20)
        if not block:
            break
        if pending:
            target.write(pending)
        pending = block
    pending = pending.rstrip()
    if not pending.endswith(b"]"):
        raise ValueError("a batch sample must end with ']'")
    target.write(pending[:-1])


def merge(batch_zips, output, model, manifest):
    if len(batch_zips) != 6:
        raise ValueError("expected exactly six batch ZIPs")
    if len(set(map(str, batch_zips))) != 6:
        raise ValueError("duplicate batch ZIP path")
    if output.exists():
        raise FileExistsError(output)
    if shutil.disk_usage(output.parent).free < 2 * 1024 ** 3:
        raise OSError("less than 2 GiB free: preserve batches and free space first")
    audits = []
    for path in batch_zips:
        with zipfile.ZipFile(path) as archive:
            if set(archive.namelist()) != {"samples-50.json", "audit-50.json"}:
                raise ValueError(f"unexpected batch entries in {path}")
            audit = json.loads(archive.read("audit-50.json"))
            if audit["scenarios"] != 50 or audit["complete_rest_schedules"] != 50:
                raise ValueError(f"incomplete sample audit: {path}")
            if audit["http_executed"] or audit["actual_overlap"] != "NOT_MEASURED":
                raise ValueError(f"unexpected runtime evidence in sample: {path}")
            audits.append(audit)
    totals = {key: dict(sum((Counter(a[key]) for a in audits), Counter()))
              for key in ("families", "instances", "missing")}
    summary = {
        "schema_version": 1,
        "basis": "six offline Provengo REST samples; no SUT HTTP execution",
        "scenarios": sum(a["scenarios"] for a in audits),
        "complete_rest_schedules": sum(a["complete_rest_schedules"] for a in audits),
        "families": totals["families"], "instances": totals["instances"],
        "missing": totals["missing"],
        "prefix_rounds_requested": audits[0]["prefix_rounds_requested"],
        "http_executed": False, "actual_overlap": "NOT_MEASURED",
        "oracle_verdicts": "NOT_EVALUATED",
        "uniqueness_of_scenarios": "NOT_MEASURED",
    }
    if summary["scenarios"] != 300 or len({a["prefix_rounds_requested"] for a in audits}) != 1:
        raise ValueError("sample count or prefix configuration mismatch")
    sources = [{"archive": p.name, "sha256": digest(p), "audit": a}
               for p, a in zip(batch_zips, audits)]
    try:
        with zipfile.ZipFile(output, "x", compression=zipfile.ZIP_DEFLATED,
                             compresslevel=6, allowZip64=True) as combined:
            with combined.open("samples-300.json", "w", force_zip64=True) as dest:
                dest.write(b"[")
                for index, path in enumerate(batch_zips):
                    if index:
                        dest.write(b",")
                    with zipfile.ZipFile(path) as batch:
                        with batch.open("samples-50.json") as source:
                            copy_array_items(source, dest)
                dest.write(b"]")
            combined.writestr("aggregate-audit.json", json.dumps(summary, indent=2) + "\n")
            combined.writestr("source-manifest.json", json.dumps(sources, indent=2) + "\n")
            combined.write(model, "runtime-bound.generated.js")
            combined.write(manifest, "runtime-bound-manifest.json")
            combined.writestr("README.md", "# Keycloak offline sample: 300 schedules\n\n"
                             "`samples-300.json` is one Provengo sample array, streamed from six "
                             "50-scenario batches. `source-manifest.json` gives each source ZIP SHA256 "
                             "and audit. `aggregate-audit.json` counts symbolic schedules. "
                             "No HTTP requests were executed and actual overlap was not measured. "
                             "To restore for ensemble selection, extract `samples-300.json` to a "
                             "filesystem with at least 9 GiB free; rank only after extraction.\n")
        with zipfile.ZipFile(output) as archive:
            if archive.testzip() is not None:
                raise ValueError("combined ZIP failed CRC validation")
        return summary
    except Exception:
        output.unlink(missing_ok=True)
        raise


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--batch-zip", action="append", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--model", type=Path, required=True)
    p.add_argument("--manifest", type=Path, required=True)
    args = p.parse_args()
    result = merge(args.batch_zip, args.out, args.model, args.manifest)
    print("KEYCLOAK_SAMPLE_300_READY", json.dumps(result, sort_keys=True), args.out,
          "sha256=" + digest(args.out))


if __name__ == "__main__":
    main()
