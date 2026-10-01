#!/usr/bin/env python3
"""Prepare sequence-local HTTP evidence for V31 official scoring.

Provengo: one `provengo run` execution is treated as the tool-generated test path.
EvoMaster: saved generated Python tests are replayed one test method at a time on
fresh SUT instances, producing one trace per saved test.
RESTler: native network-testing logs are parsed only when explicit sequence
boundaries are present. If boundaries cannot be verified, no official sequence
is fabricated; the campaign trace remains diagnostic-only.
"""
from __future__ import annotations

import argparse
import ast
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path


def read_events(path: Path):
    out = []
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        s = line.strip()
        if "MODEL_EVENT " in s:
            s = s.split("MODEL_EVENT ", 1)[1].strip()
        try:
            v = json.loads(s)
        except Exception:
            continue
        if isinstance(v, dict):
            out.append(v)
    return out


def write_events(path: Path, events):
    path.write_text("".join("MODEL_EVENT " + json.dumps(e, sort_keys=True) + "\n" for e in events), encoding="utf-8")


def wait_text(path: Path, proc: subprocess.Popen, timeout=30):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if proc.poll() is not None:
            raise RuntimeError(f"process exited during startup: {proc.args}")
        if path.exists():
            value = path.read_text(encoding="utf-8", errors="replace").strip()
            if value:
                return value
        time.sleep(0.1)
    raise RuntimeError(f"readiness timeout: {path}")


def start_stack(python_cmd: str, sut: Path, sut_launcher: Path, proxy: Path, work: Path):
    sut_port_file = work / "sut.port"
    proxy_port_file = work / "proxy.port"
    trace = work / "trace.jsonl"
    sout = (work / "sut.out").open("w", encoding="utf-8")
    serr = (work / "sut.err").open("w", encoding="utf-8")
    pout = (work / "proxy.out").open("w", encoding="utf-8")
    perr = (work / "proxy.err").open("w", encoding="utf-8")
    sutp = subprocess.Popen([python_cmd, str(sut_launcher), "--script", str(sut), "--port", "0", "--port-file", str(sut_port_file)], stdout=sout, stderr=serr)
    sut_port = int(wait_text(sut_port_file, sutp))
    proxyp = subprocess.Popen([python_cmd, str(proxy), "--listen-port", "0", "--target-port", str(sut_port), "--trace", str(trace), "--port-file", str(proxy_port_file)], stdout=pout, stderr=perr)
    proxy_port = int(wait_text(proxy_port_file, proxyp, 20))
    return sutp, proxyp, proxy_port, trace, [sout, serr, pout, perr]


def stop_stack(sutp, proxyp, handles):
    for p in (proxyp, sutp):
        if p and p.poll() is None:
            p.terminate()
            try:
                p.wait(timeout=3)
            except Exception:
                p.kill()
    for h in handles:
        try:
            h.close()
        except Exception:
            pass


def discover_python_tests(path: Path):
    try:
        tree = ast.parse(path.read_text(encoding="utf-8", errors="replace"))
    except SyntaxError:
        return []
    out = []
    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            for item in node.body:
                if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)) and item.name.startswith("test"):
                    out.append((node.name, item.name))
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name.startswith("test"):
            out.append((None, node.name))
    return out


def patch_base_urls(text: str, port: int):
    target = f"http://127.0.0.1:{port}"
    text = re.sub(r"http://127\.0\.0\.1:\d+", target, text)
    text = re.sub(r"http://localhost:\d+", target, text)
    return text


def run_one_python_test(python_cmd: str, source: Path, cls: str | None, test: str, port: int, work: Path):
    patched = work / source.name
    patched.write_text(patch_base_urls(source.read_text(encoding="utf-8", errors="replace"), port), encoding="utf-8")
    wrapper = work / "run_one.py"
    wrapper.write_text(
        "import importlib.util,sys,unittest,inspect\n"
        f"p={str(patched)!r}\n"
        "spec=importlib.util.spec_from_file_location('em_saved_test',p)\n"
        "m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)\n"
        f"clsname={cls!r}; testname={test!r}\n"
        "ok=True\n"
        "try:\n"
        "  if clsname is None:\n"
        "    getattr(m,testname)()\n"
        "  else:\n"
        "    C=getattr(m,clsname)\n"
        "    if inspect.isclass(C) and issubclass(C,unittest.TestCase):\n"
        "      r=unittest.TextTestRunner(stream=sys.stdout,verbosity=0).run(unittest.TestSuite([C(testname)]));ok=r.wasSuccessful()\n"
        "    else:\n"
        "      getattr(C(),testname)()\n"
        "except BaseException as e:\n"
        "  print('V31_REPLAY_EXCEPTION',repr(e));ok=False\n"
        "sys.exit(0 if ok else 7)\n",
        encoding="utf-8",
    )
    return subprocess.run([python_cmd, str(wrapper)], cwd=work, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=120)


def evomaster_sequences(ns, outdir: Path):
    candidates = []
    for p in sorted(Path(ns.run_dir).rglob("*.py")):
        if "evomaster" in p.name.lower() or discover_python_tests(p):
            tests = discover_python_tests(p)
            if tests:
                candidates.append((p, tests))
    seqs = []
    replay_log = []
    index = 0
    for src, tests in candidates:
        for cls, test in tests:
            index += 1
            with tempfile.TemporaryDirectory(prefix="v31_em_replay_") as td:
                work = Path(td)
                try:
                    sutp, proxyp, port, trace, handles = start_stack(ns.python, Path(ns.sut), Path(ns.sut_launcher), Path(ns.proxy), work)
                    try:
                        r = run_one_python_test(ns.python, src, cls, test, port, work)
                    finally:
                        stop_stack(sutp, proxyp, handles)
                    events = read_events(trace)
                    name = f"sequence_{index:06d}.jsonl"
                    if events:
                        write_events(outdir / name, events)
                        seqs.append({"file": name, "source": str(src), "test_class": cls, "test_name": test, "replay_exit_code": r.returncode, "event_count": len(events)})
                    replay_log.append({"source": str(src), "class": cls, "test": test, "exit": r.returncode, "events": len(events), "output": r.stdout[-4000:]})
                except Exception as e:
                    replay_log.append({"source": str(src), "class": cls, "test": test, "error": repr(e)})
    (outdir / "evomaster_replay_log.json").write_text(json.dumps(replay_log, indent=2) + "\n", encoding="utf-8")
    return seqs, {"method": "replay_saved_generated_python_tests_on_fresh_sut", "candidate_test_count": index}


def parse_http_message(text: str):
    text = text.replace("\\r\\n", "\n").replace("\\n", "\n")
    lines = [x for x in text.splitlines() if x.strip()]
    if not lines:
        return None
    first = lines[0].strip(" '\"")
    m = re.match(r"(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)\s+HTTP/", first, flags=re.I)
    if not m:
        return None
    method, path = m.group(1).upper(), m.group(2)
    body = None
    if "\n\n" in text:
        raw = text.split("\n\n", 1)[1].strip(" '\"")
        try:
            body = json.loads(raw)
        except Exception:
            body = raw or None
    return method, path, body


def restler_sequences(ns, outdir: Path):
    logs = sorted(Path(ns.run_dir).rglob("network.testing*.txt"))
    if not logs:
        logs = sorted(Path(ns.run_dir).rglob("*network*.txt"))
    all_sequences = []
    seq_events = []
    current = None
    request_pending = None
    marker_re = re.compile(r"(?:Rendering\s+Sequence|Sequence(?:\s+ID)?)[^0-9A-Za-z_-]*([0-9A-Za-z_.-]+)", re.I)
    send_re = re.compile(r"(?:Sending|Request)\s*:\s*(.*)", re.I)
    recv_re = re.compile(r"(?:Received|Response)\s*:\s*(.*)", re.I)

    def flush():
        nonlocal seq_events, current
        if current is not None and seq_events:
            all_sequences.append((str(current), list(seq_events)))
        seq_events = []

    for log in logs:
        for line in log.read_text(encoding="utf-8", errors="replace").splitlines():
            mm = marker_re.search(line)
            if mm:
                flush()
                current = f"{log.name}:{mm.group(1)}"
                request_pending = None
                continue
            sm = send_re.search(line)
            if sm:
                request_pending = parse_http_message(sm.group(1))
                continue
            rm = recv_re.search(line)
            if rm and request_pending and current is not None:
                txt = rm.group(1).replace("\\r\\n", "\n")
                st = re.search(r"HTTP/\S+\s+(\d{3})", txt)
                status = int(st.group(1)) if st else None
                body = None
                if "\n\n" in txt:
                    raw = txt.split("\n\n", 1)[1].strip(" '\"")
                    try:
                        body = json.loads(raw)
                    except Exception:
                        body = raw or None
                method, path, reqbody = request_pending
                seq_events.append({"method": method, "path": path, "body": reqbody, "status": status, "response": body})
                request_pending = None
    flush()
    seqs = []
    for i, (sid, events) in enumerate(all_sequences, 1):
        if not events:
            continue
        name = f"sequence_{i:06d}.jsonl"
        write_events(outdir / name, events)
        seqs.append({"file": name, "source_sequence": sid, "event_count": len(events)})
    return seqs, {"method": "parse_restler_network_logs_with_explicit_sequence_boundaries", "network_log_count": len(logs)}


def provengo_sequences(ns, outdir: Path):
    events = read_events(Path(ns.campaign_trace))
    if not events:
        return [], {"method": "one_provengo_run_equals_one_generated_test_path"}
    name = "sequence_000001.jsonl"
    write_events(outdir / name, events)
    return [{"file": name, "source": str(ns.campaign_trace), "event_count": len(events)}], {"method": "one_provengo_run_equals_one_generated_test_path"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tool", required=True, choices=["provengo", "evomaster", "restler"])
    ap.add_argument("--run-dir", required=True)
    ap.add_argument("--campaign-trace", required=True)
    ap.add_argument("--output-dir", required=True)
    ap.add_argument("--python", default=sys.executable)
    ap.add_argument("--sut")
    ap.add_argument("--sut-launcher")
    ap.add_argument("--proxy")
    ns = ap.parse_args()
    outdir = Path(ns.output_dir)
    if outdir.exists():
        shutil.rmtree(outdir)
    outdir.mkdir(parents=True)

    if ns.tool == "provengo":
        seqs, meta = provengo_sequences(ns, outdir)
    elif ns.tool == "evomaster":
        missing = [x for x in (ns.sut, ns.sut_launcher, ns.proxy) if not x]
        if missing:
            raise SystemExit("EvoMaster replay requires --sut, --sut-launcher and --proxy")
        seqs, meta = evomaster_sequences(ns, outdir)
    else:
        seqs, meta = restler_sequences(ns, outdir)

    manifest = {
        "schema_version": 1,
        "artifact_version": "v36",
        "tool": ns.tool,
        "official_sequence_count": len(seqs),
        "sequences": seqs,
        "extraction": meta,
        "campaign_trace": str(ns.campaign_trace),
        "campaign_trace_is_diagnostic_only": True,
        "warning": None if seqs else "No verifiable tool-generated sequence traces were extracted; official semantic score must remain 0/5 rather than stitch the campaign trace.",
    }
    (outdir / "sequence_manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
