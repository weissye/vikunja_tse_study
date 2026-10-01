#!/usr/bin/env python3
"""Extract and replay Library V38 tool tests as fresh-SUT sequence traces.

RESTler: parse only native network logs with explicit sequence boundaries,
pre-filter sequences that could contain either Library witness, and replay every
candidate on a fresh SUT.  Missing boundaries or replay errors yield an
undetermined result rather than a fabricated zero.

EvoMaster: replay every saved generated Python test method on a fresh SUT.
Provengo: one retained run trace is one generated path; the caller must provide
that single-run trace.
"""
from __future__ import annotations

import argparse
import ast
import http.client
import json
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


def read_events(path: Path) -> List[Dict[str, Any]]:
    events = []
    if not path.exists():
        return events
    for line in path.read_text(encoding="utf-8-sig", errors="replace").splitlines():
        text = line.strip()
        if "MODEL_EVENT " in text:
            text = text.split("MODEL_EVENT ", 1)[1].strip()
        try:
            value = json.loads(text)
        except Exception:
            continue
        if isinstance(value, dict):
            events.append(value)
    return events


def write_events(path: Path, events: List[Dict[str, Any]]) -> None:
    path.write_text(
        "".join("MODEL_EVENT " + json.dumps(event, sort_keys=True) + "\n" for event in events),
        encoding="utf-8",
    )


def wait_text(path: Path, process: subprocess.Popen, timeout: int = 30) -> str:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if process.poll() is not None:
            raise RuntimeError(f"process exited during startup: {process.args}")
        if path.exists() and (value := path.read_text(encoding="utf-8").strip()):
            return value
        time.sleep(0.1)
    raise RuntimeError(f"readiness timeout: {path}")


def start_stack(args: argparse.Namespace, work: Path):
    sut_port_file, proxy_port_file = work / "sut.port", work / "proxy.port"
    trace = work / "trace.jsonl"
    handles = [(work / name).open("w", encoding="utf-8") for name in ("sut.out", "sut.err", "proxy.out", "proxy.err")]
    sut_process = subprocess.Popen(
        [args.python, args.sut_launcher, "--script", args.sut, "--port", "0", "--port-file", str(sut_port_file)],
        stdout=handles[0], stderr=handles[1],
    )
    sut_port = int(wait_text(sut_port_file, sut_process))
    proxy_process = subprocess.Popen(
        [args.python, args.proxy, "--listen-port", "0", "--target-port", str(sut_port), "--trace", str(trace), "--port-file", str(proxy_port_file)],
        stdout=handles[2], stderr=handles[3],
    )
    proxy_port = int(wait_text(proxy_port_file, proxy_process, 20))
    return sut_process, proxy_process, proxy_port, trace, handles


def stop_stack(sut_process, proxy_process, handles) -> None:
    for process in (proxy_process, sut_process):
        if process and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill()
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    pass
    for handle in handles:
        try:
            handle.flush()
        except Exception:
            pass
        handle.close()


def discover_python_tests(path: Path):
    try:
        tree = ast.parse(path.read_text(encoding="utf-8-sig", errors="replace"))
    except SyntaxError:
        return []
    tests = []
    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            for item in node.body:
                if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)) and item.name.startswith("test"):
                    tests.append((node.name, item.name))
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name.startswith("test"):
            tests.append((None, node.name))
    return tests


def patch_base_urls(text: str, port: int) -> str:
    target = f"http://127.0.0.1:{port}"
    text = re.sub(r"http://127\.0\.0\.1:\d+", target, text)
    text = re.sub(r"http://localhost:\d+", target, text)
    return text


def run_one_python_test(args, source: Path, class_name: Optional[str], test_name: str, port: int, work: Path):
    patched = work / source.name
    patched.write_text(patch_base_urls(source.read_text(encoding="utf-8-sig", errors="replace"), port), encoding="utf-8")
    wrapper = work / "run_one.py"
    wrapper.write_text(
        "import importlib.util,inspect,sys,unittest\n"
        f"p={str(patched)!r}\n"
        f"source_parent={str(source.parent)!r}\n"
        "sys.path.insert(0,source_parent)\n"
        "spec=importlib.util.spec_from_file_location('em_saved_test',p)\n"
        f"clsname={class_name!r};testname={test_name!r}\n"
        "ok=True\n"
        "try:\n"
        "  m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)\n"
        "  if clsname is None:getattr(m,testname)()\n"
        "  else:\n"
        "    C=getattr(m,clsname)\n"
        "    if inspect.isclass(C) and issubclass(C,unittest.TestCase):\n"
        "      r=unittest.TextTestRunner(stream=sys.stdout,verbosity=0).run(unittest.TestSuite([C(testname)]));ok=r.wasSuccessful()\n"
        "    else:getattr(C(),testname)()\n"
        "except BaseException as e:print('V38_REPLAY_EXCEPTION',repr(e));ok=False\n"
        "sys.exit(0 if ok else 7)\n",
        encoding="utf-8",
    )
    return subprocess.run(
        [args.python, str(wrapper)], cwd=work, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, timeout=args.replay_timeout,
    )


def evomaster_sequences(args, output_dir: Path):
    discovered = []
    for source in sorted(Path(args.run_dir).rglob("*.py")):
        tests = discover_python_tests(source)
        if tests:
            discovered.append((source, tests))
    sequences, replay_log, errors, index = [], [], 0, 0
    for source, tests in discovered:
        for class_name, test_name in tests:
            index += 1
            with tempfile.TemporaryDirectory(prefix="library_v38_em_") as temp:
                work = Path(temp)
                try:
                    sut, proxy, port, trace, handles = start_stack(args, work)
                    try:
                        completed = run_one_python_test(args, source, class_name, test_name, port, work)
                    finally:
                        stop_stack(sut, proxy, handles)
                    events = read_events(trace)
                    # A nonzero test exit can be a generated assertion failure; the
                    # retained HTTP prefix is still valid evidence.  No HTTP events
                    # indicates an unusable replay/import and makes the audit incomplete.
                    if not events:
                        errors += 1
                    else:
                        filename = f"sequence_{index:06d}.jsonl"
                        write_events(output_dir / filename, events)
                        sequences.append({
                            "file": filename, "source": str(source), "test_class": class_name,
                            "test_name": test_name, "replay_exit_code": completed.returncode,
                            "event_count": len(events), "fresh_sut": True,
                        })
                    replay_log.append({
                        "source": str(source), "class": class_name, "test": test_name,
                        "exit": completed.returncode, "events": len(events), "output_tail": completed.stdout[-4000:],
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


def parse_http_message(text: str):
    value = text.strip().strip("'\"").replace("\\r\\n", "\n").replace("\\n", "\n")
    # InvalidValueChecker deliberately emits malformed request targets that can
    # contain whitespace or escaped control characters.  Retain those requests
    # for exhaustive accounting; they will not match exact semantic endpoints.
    match = re.search(
        r"(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+?)\s+HTTP/\d(?:\.\d)?",
        value,
        re.I | re.S,
    )
    if not match:
        return None
    method, path = match.group(1).upper(), match.group(2)
    body = None
    if "\n\n" in value:
        raw = value.split("\n\n", 1)[1].strip().strip("'\"")
        try:
            body = json.loads(raw)
        except Exception:
            body = raw or None
    return {"method": method, "path": path, "body": body}


def is_http_status_message(text: str) -> bool:
    value = text.strip().strip("'\"").replace("\\r\\n", "\n").replace("\\n", "\n")
    return re.search(r"HTTP/\d(?:\.\d)?\s+\d{3}\b", value, re.I) is not None


def parse_restler_native_sequences(run_dir: Path):
    logs = sorted(run_dir.rglob("network.testing*.txt")) or sorted(run_dir.rglob("*network*.txt"))
    # Match only RESTler's native test-sequence boundary.  A broad search for
    # "Sequence ID" also matches the HTTP header x-restler-sequence-id inside
    # every rendered request and fabricates thousands of false boundaries.
    marker = re.compile(
        r"^\s*Generation-(\d+)\s*:\s*Rendering\s+Sequence-(\d+)\s*$",
        re.I,
    )
    # RESTler also emits descriptive lines such as
    # "Request: 1 (Remaining candidate combinations: ...)".  They are not
    # wire messages and must not be counted as parse failures.
    sending = re.compile(r"\bSending\s*:\s*(.*)", re.I)
    received = re.compile(r"\bReceived\s*:\s*(.*)", re.I)
    sequences: List[Dict[str, Any]] = []
    current_id, requests, pending, unmatched = None, [], None, 0

    def flush():
        nonlocal requests, unmatched
        if current_id is not None:
            sequences.append({"id": current_id, "requests": list(requests), "unmatched": unmatched})
        requests, unmatched = [], 0

    for log in logs:
        for line in log.read_text(encoding="utf-8-sig", errors="replace").splitlines():
            boundary = marker.search(line)
            if boundary:
                flush()
                current_id = (
                    f"{log.name}:generation-{boundary.group(1)}:"
                    f"sequence-{boundary.group(2)}"
                )
                pending = None
                continue
            sent = sending.search(line)
            if sent and current_id is not None:
                pending = parse_http_message(sent.group(1))
                if pending is None:
                    unmatched += 1
                continue
            response = received.search(line)
            if response and current_id is not None:
                # RESTler can log a response body in a second Received line.
                # Only the status-line message closes the pending request.
                if not is_http_status_message(response.group(1)):
                    continue
                if pending is not None:
                    requests.append(pending)
                    pending = None
                else:
                    unmatched += 1
    flush()
    return logs, sequences


def is_library_candidate(requests: List[Dict[str, Any]]) -> bool:
    paths = [(str(item.get("method") or "").upper(), "/" + str(item.get("path") or "").split("?", 1)[0].strip("/")) for item in requests]
    loan_posts = sum(1 for method, path in paths if method == "POST" and path.rstrip("/") == "/loans")
    has_hold = any(method == "POST" and path.rstrip("/") == "/holds" for method, path in paths)
    return loan_posts >= 3 or (has_hold and loan_posts >= 1)


def replay_http_requests(port: int, requests: List[Dict[str, Any]], timeout: int) -> None:
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=timeout)
    try:
        for item in requests:
            body = item.get("body")
            if isinstance(body, (dict, list)):
                payload = json.dumps(body).encode("utf-8")
                headers = {"Content-Type": "application/json"}
            elif body is None:
                payload, headers = None, {}
            else:
                payload = str(body).encode("utf-8")
                headers = {"Content-Type": "application/json"}
            connection.request(item["method"], item["path"], body=payload, headers=headers)
            response = connection.getresponse()
            response.read()
    finally:
        connection.close()


def restler_sequences(args, output_dir: Path):
    logs, parsed = parse_restler_native_sequences(Path(args.run_dir))
    boundaries_verified = bool(logs) and bool(parsed)
    candidates = [item for item in parsed if is_library_candidate(item["requests"])]
    # Exhaustive negative scoring also requires complete parsing of sequences
    # that were classified as non-candidates.  Otherwise an unmatched request
    # could hide the operation that would have made the sequence a candidate.
    parse_errors = sum(int(item["unmatched"]) for item in parsed)
    sequences, replay_log, replay_errors = [], [], 0

    for index, candidate in enumerate(candidates, 1):
        with tempfile.TemporaryDirectory(prefix="library_v38_restler_") as temp:
            work = Path(temp)
            try:
                sut, proxy, port, trace, handles = start_stack(args, work)
                try:
                    replay_http_requests(port, candidate["requests"], args.replay_timeout)
                finally:
                    stop_stack(sut, proxy, handles)
                events = read_events(trace)
                filename = f"sequence_{index:06d}.jsonl"
                write_events(output_dir / filename, events)
                sequences.append({
                    "file": filename, "source_sequence": candidate["id"],
                    "request_count": len(candidate["requests"]), "event_count": len(events),
                    "fresh_sut": True,
                })
                replay_log.append({"source_sequence": candidate["id"], "events": len(events), "status": "replayed"})
            except Exception as exc:
                replay_errors += 1
                replay_log.append({"source_sequence": candidate["id"], "error": repr(exc)})

    total_errors = parse_errors + replay_errors
    complete = boundaries_verified and total_errors == 0
    status = "complete" if complete else "undetermined_missing_boundaries_or_replay_errors"
    (output_dir / "restler_replay_log.json").write_text(json.dumps(replay_log, indent=2) + "\n", encoding="utf-8")
    return sequences, {
        "boundary_source": "RESTler_native_network_testing_logs",
        "boundary_verified": boundaries_verified,
        "native_network_log_count": len(logs),
        "parsed_sequence_count": len(parsed),
        "candidate_sequence_count": len(candidates),
        "replayed_sequence_count": len(sequences),
        "replay_error_count": total_errors,
        "official_evaluation_complete": complete,
        "official_status": status,
    }


def provengo_sequences(args, output_dir: Path):
    events = read_events(Path(args.campaign_trace))
    sequences = []
    if events:
        filename = "sequence_000001.jsonl"
        write_events(output_dir / filename, events)
        sequences.append({"file": filename, "source": args.campaign_trace, "event_count": len(events), "fresh_sut": "asserted_by_runner"})
    return sequences, {
        "boundary_source": "one_retained_provengo_run",
        "boundary_verified": bool(events),
        "candidate_sequence_count": 1 if events else 0,
        "replayed_sequence_count": 1 if events else 0,
        "replay_error_count": 0 if events else 1,
        "official_evaluation_complete": bool(events),
        "official_status": "complete" if events else "undetermined_missing_run_trace",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tool", required=True, choices=["restler", "evomaster", "provengo"])
    parser.add_argument("--run-dir", required=True)
    parser.add_argument("--campaign-trace", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--python", default=sys.executable)
    parser.add_argument("--sut")
    parser.add_argument("--sut-launcher")
    parser.add_argument("--proxy")
    parser.add_argument("--replay-timeout", type=int, default=120)
    args = parser.parse_args()

    # The preparer itself is launched by the caller-selected interpreter.
    # Pin every child process to that exact executable.  Re-resolving a generic
    # command such as "python" from a temporary working directory can select a
    # different installation on Windows and silently lose the active venv.
    args.python = str(Path(sys.executable).resolve())

    if args.tool == "evomaster":
        missing_modules = []
        for module_name in ("requests", "rfc3986"):
            try:
                __import__(module_name)
            except ImportError:
                missing_modules.append(module_name)
        if missing_modules:
            raise SystemExit(
                "EvoMaster replay dependencies are missing from "
                f"{args.python}: {', '.join(missing_modules)}. "
                "Install the artifact replay dependencies in the same Python environment."
            )

    output_dir = Path(args.output_dir)
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)

    if args.tool in {"restler", "evomaster"}:
        missing = [name for name in ("sut", "sut_launcher", "proxy") if not getattr(args, name)]
        if missing:
            raise SystemExit("Fresh-SUT replay requires: " + ", ".join("--" + name.replace("_", "-") for name in missing))

    if args.tool == "restler":
        sequences, metadata = restler_sequences(args, output_dir)
    elif args.tool == "evomaster":
        sequences, metadata = evomaster_sequences(args, output_dir)
    else:
        sequences, metadata = provengo_sequences(args, output_dir)

    manifest = {
        "schema_version": 1,
        "artifact_version": "v38",
        "system": "library",
        "tool": args.tool,
        "python_executable": args.python,
        "campaign_trace": str(Path(args.campaign_trace).resolve()),
        "campaign_trace_is_diagnostic_only": True,
        "sequences": sequences,
        **metadata,
        "warning": None if metadata["official_evaluation_complete"] else (
            "Exact official score is undetermined. Do not convert missing sequence evidence into 0/2 and do not use the campaign-global score."
        ),
    }
    (output_dir / "sequence_manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
