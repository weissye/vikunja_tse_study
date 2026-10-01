#!/usr/bin/env python3
"""Prepare fresh-SUT sequence traces for Garage/Pharmacy V35_b4 baselines."""
from __future__ import annotations

import argparse
import http.client
import importlib.util
import json
import shutil
import sys
import tempfile
from pathlib import Path


def load_common(path: Path):
    spec = importlib.util.spec_from_file_location("sequence_replay_common", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load replay engine: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def normalized_path(item):
    return ("/" + str(item.get("path") or "").split("?", 1)[0].strip("/")).rstrip("/") or "/"


def is_candidate(system, requests):
    operations = [(str(x.get("method") or "").upper(), normalized_path(x)) for x in requests]
    if system == "garage":
        # A fresh Garage SUT contains one seeded active repair order.
        return any(method == "POST" and path == "/repair-orders" for method, path in operations)

    prescription_posts = sum(1 for method, path in operations if method == "POST" and path == "/prescriptions")
    dispense_posts = sum(1 for method, path in operations if method == "POST" and path == "/dispense")
    store_posts = sum(1 for method, path in operations if method == "POST" and path == "/stores")
    process_posts = sum(1 for method, path in operations if method == "POST" and path == "/process-rx")
    p1_possible = prescription_posts >= 1 and dispense_posts >= 1
    p2_possible = prescription_posts >= 1 and store_posts >= 2 and process_posts >= 2
    return p1_possible or p2_possible


def prepare_restler(args, common, output_dir):
    logs, parsed = common.parse_restler_native_sequences(Path(args.run_dir))
    candidates = [item for item in parsed if is_candidate(args.system, item["requests"])]
    parse_errors = sum(int(item["unmatched"]) for item in parsed)
    sequences, replay_log, replay_errors = [], [], 0

    for index, candidate in enumerate(candidates, 1):
        with tempfile.TemporaryDirectory(
            prefix=f"{args.system}_v35b4_restler_", ignore_cleanup_errors=True
        ) as temp:
            work = Path(temp)
            try:
                sut, proxy, port, trace, handles = common.start_stack(args, work)
                try:
                    if args.system == "garage":
                        capture_garage_initial_state(port)
                    common.replay_http_requests(port, candidate["requests"], args.replay_timeout)
                finally:
                    common.stop_stack(sut, proxy, handles)
                events = common.read_events(trace)
                filename = f"sequence_{index:06d}.jsonl"
                common.write_events(output_dir / filename, events)
                sequences.append({
                    "file": filename,
                    "source_sequence": candidate["id"],
                    "request_count": len(candidate["requests"]),
                    "event_count": len(events),
                    "fresh_sut": True,
                })
                replay_log.append({"source_sequence": candidate["id"], "events": len(events), "status": "replayed"})
            except Exception as exc:
                replay_errors += 1
                replay_log.append({"source_sequence": candidate["id"], "error": repr(exc)})

    total_errors = parse_errors + replay_errors
    complete = bool(logs) and bool(parsed) and total_errors == 0
    (output_dir / "restler_replay_log.json").write_text(json.dumps(replay_log, indent=2) + "\n", encoding="utf-8")
    return sequences, {
        "boundary_source": "RESTler_native_Rendering_Sequence_boundaries",
        "boundary_verified": bool(logs) and bool(parsed),
        "native_network_log_count": len(logs),
        "parsed_sequence_count": len(parsed),
        "candidate_sequence_count": len(candidates),
        "replayed_sequence_count": len(sequences),
        "parse_error_count": parse_errors,
        "replay_error_count": total_errors,
        "official_evaluation_complete": complete,
        "official_status": "complete" if complete else "undetermined_missing_boundaries_or_replay_errors",
    }


def capture_garage_initial_state(port):
    """Record the frozen Garage seed through the same external HTTP proxy."""
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=30)
    try:
        connection.request("GET", "/repair-orders")
        response = connection.getresponse()
        response.read()
        if not 200 <= response.status < 300:
            raise RuntimeError(f"Garage initial-state snapshot failed: HTTP {response.status}")
    finally:
        connection.close()


def prepare_evomaster(args, common, output_dir):
    discovered = []
    for source in sorted(Path(args.run_dir).rglob("*.py")):
        tests = common.discover_python_tests(source)
        if tests:
            discovered.append((source, tests))

    sequences, replay_log, errors, index = [], [], 0, 0
    for source, tests in discovered:
        for class_name, test_name in tests:
            index += 1
            with tempfile.TemporaryDirectory(
                prefix=f"{args.system}_v35b4_em_", ignore_cleanup_errors=True
            ) as temp:
                work = Path(temp)
                try:
                    sut, proxy, port, trace, handles = common.start_stack(args, work)
                    try:
                        if args.system == "garage":
                            capture_garage_initial_state(port)
                        completed = common.run_one_python_test(args, source, class_name, test_name, port, work)
                    finally:
                        common.stop_stack(sut, proxy, handles)
                    events = common.read_events(trace)
                    if not events:
                        errors += 1
                    else:
                        filename = f"sequence_{index:06d}.jsonl"
                        common.write_events(output_dir / filename, events)
                        sequences.append({
                            "file": filename,
                            "source": str(source),
                            "test_class": class_name,
                            "test_name": test_name,
                            "replay_exit_code": completed.returncode,
                            "event_count": len(events),
                            "fresh_sut": True,
                        })
                    replay_log.append({
                        "source": str(source), "class": class_name, "test": test_name,
                        "exit": completed.returncode, "events": len(events),
                        "output_tail": completed.stdout[-4000:],
                    })
                except Exception as exc:
                    errors += 1
                    replay_log.append({"source": str(source), "class": class_name, "test": test_name, "error": repr(exc)})

    (output_dir / "evomaster_replay_log.json").write_text(json.dumps(replay_log, indent=2) + "\n", encoding="utf-8")
    return sequences, {
        "boundary_source": "saved_generated_python_test_methods",
        "boundary_verified": bool(discovered),
        "candidate_sequence_count": index,
        "replayed_sequence_count": len(sequences),
        "replay_error_count": errors,
        "official_evaluation_complete": bool(discovered) and errors == 0,
        "official_status": "complete" if discovered and errors == 0 else "undetermined_missing_or_unreplayable_generated_tests",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--system", required=True, choices=["garage", "pharmacy"])
    parser.add_argument("--tool", required=True, choices=["restler", "evomaster"])
    parser.add_argument("--run-dir", required=True)
    parser.add_argument("--campaign-trace", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--common-engine", required=True)
    parser.add_argument("--artifact-version", default="v35_b4")
    parser.add_argument("--python", default=sys.executable)
    parser.add_argument("--sut", required=True)
    parser.add_argument("--sut-launcher", required=True)
    parser.add_argument("--proxy", required=True)
    parser.add_argument("--replay-timeout", type=int, default=120)
    args = parser.parse_args()
    args.python = str(Path(sys.executable).resolve())

    if args.tool == "evomaster":
        missing = []
        for name in ("requests", "rfc3986"):
            try:
                __import__(name)
            except ImportError:
                missing.append(name)
        if missing:
            raise SystemExit(f"Missing EvoMaster replay dependencies in {args.python}: {', '.join(missing)}")

    common = load_common(Path(args.common_engine))
    output_dir = Path(args.output_dir)
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)

    if args.tool == "restler":
        sequences, metadata = prepare_restler(args, common, output_dir)
    else:
        sequences, metadata = prepare_evomaster(args, common, output_dir)

    manifest = {
        "schema_version": 1,
        "artifact_version": args.artifact_version,
        "system": args.system,
        "tool": args.tool,
        "python_executable": args.python,
        "campaign_trace": str(Path(args.campaign_trace).resolve()),
        "campaign_trace_is_diagnostic_only": True,
        "sequences": sequences,
        **metadata,
    }
    manifest["warning"] = None if metadata["official_evaluation_complete"] else (
        "Exact official score is undetermined; do not convert incomplete evidence into zero."
    )
    (output_dir / "sequence_manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    print(json.dumps(manifest, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
