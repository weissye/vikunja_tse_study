#!/usr/bin/env python3
"""Redact credential values in a completed Stage 3 run before hashing/zipping.

This runs after the external verifier has read the original HTTP trace. It
does not change the live response or the already computed verdict.
"""
import argparse
import json
import re
from pathlib import Path

SENSITIVE = {"client_secret", "access_token", "refresh_token", "password",
             "authorization_header", "api_token"}
TOKEN_PATTERN = re.compile(rb"gto_[A-Za-z0-9]{12,}")
TEXT_SUFFIXES = {".json", ".jsonl", ".log", ".txt", ".csv"}


def collect(value, found):
    if isinstance(value, dict):
        for key, child in value.items():
            if str(key).lower() in SENSITIVE and isinstance(child, str) and child:
                found.add(child.encode("utf-8"))
            collect(child, found)
    elif isinstance(value, list):
        for child in value:
            collect(child, found)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("run_dir", type=Path)
    args = parser.parse_args()
    root = args.run_dir.resolve()
    if not (root / "http-trace.jsonl").is_file():
        parser.error("HTTP trace missing; refusing to freeze evidence")
    files = sorted(p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES)
    found = set()
    for path in files:
        if path.suffix.lower() not in {".json", ".jsonl"}:
            continue
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            try:
                collect(json.loads(line), found)
            except json.JSONDecodeError:
                continue  # multiline JSON can still be covered by token-pattern masking
    found = {token for token in found if len(token) >= 8}
    changed = 0
    for path in files:
        raw = path.read_bytes()
        redacted = raw
        for token in sorted(found, key=len, reverse=True):
            redacted = redacted.replace(token, b"[REDACTED]")
        redacted = TOKEN_PATTERN.sub(b"[REDACTED]", redacted)
        if redacted != raw:
            path.write_bytes(redacted)
            changed += 1
    for path in files:
        raw = path.read_bytes()
        if TOKEN_PATTERN.search(raw) or any(token in raw for token in found):
            raise ValueError("Credential masking incomplete; evidence freeze aborted")
    print("GITEA_STAGE3_EVIDENCE_REDACTED files=" + str(changed))


if __name__ == "__main__":
    main()
