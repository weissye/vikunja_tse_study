#!/usr/bin/env python3
import importlib.util
import json
import os
import socket
import subprocess
import sys
import tempfile
import threading
import time
import unittest
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


validator = module("concurrent_validator", ROOT / "scripts" / "validate_concurrent_epoch_verifiers.py")
adapter = module("epoch_adapter", ROOT / "scripts" / "vikunja_concurrent_epoch_adapter.py")


def trace_event(method, path, status, operation_id=None, request=None, response=None, start="2026-09-22T00:00:00+00:00", end="2026-09-22T00:00:01+00:00"):
    value = {"method": method, "model_path": path, "status": status, "upstream_started_utc": start, "upstream_completed_utc": end}
    if operation_id:
        value.update({"epoch_id": "increment8-task-0", "operation_id": operation_id})
    if request is not None: value["request"] = request
    if response is not None: value["response"] = response
    return value


class Increment8Tests(unittest.TestCase):
    def manifest(self):
        return {"prefix": "increment8_", "oracle": {"expected_witness_count": 1}}

    def epoch(self, overlap=True):
        return {"epoch_id": "increment8-task-0", "all_workers_ready_before_release": True, "overlap_observed": overlap, "release_skew_ns": 10, "operations": [
            {"operation_id": "increment8-task-0-title", "status": 200, "error": None},
            {"operation_id": "increment8-task-0-description", "status": 200, "error": None},
        ]}

    def good_trace(self, description="increment8_task_0_description"):
        return [
            trace_event("PATCH", "/tasks/7", 200, "increment8-task-0-title", {"title": "increment8_task_0_title"}),
            trace_event("PATCH", "/tasks/7", 200, "increment8-task-0-description", {"description": "increment8_task_0_description"}),
            trace_event("GET", "/tasks/7", 200, response={"title": "increment8_task_0_title", "description": description}, start="2026-09-22T00:00:02+00:00", end="2026-09-22T00:00:03+00:00"),
        ]

    def test_valid_overlapping_epoch_passes(self):
        result = validator.evaluate(self.good_trace(), [self.epoch()], self.manifest())
        self.assertEqual("PASS", result["run_status"])

    def test_non_overlapping_epoch_is_inconclusive(self):
        result = validator.evaluate(self.good_trace(), [self.epoch(False)], self.manifest())
        self.assertEqual("INCONCLUSIVE", result["run_status"])

    def test_lost_successful_patch_is_candidate(self):
        result = validator.evaluate(self.good_trace("old"), [self.epoch()], self.manifest())
        self.assertEqual("SEMANTIC_ANOMALY", result["run_status"])
        self.assertTrue(result["bug_candidate"])

    def test_adapter_rejects_non_modelled_or_unsafe_operations(self):
        with self.assertRaises(ValueError):
            adapter.validate_epoch({"epoch_id": "x", "operations": []}, 16)
        with self.assertRaises(ValueError):
            adapter.validate_epoch({"epoch_id": "increment8-x", "operations": [
                {"operation_id": "increment8-x-a", "method": "DELETE", "path": "/tasks/1", "body": {"title": "increment8_a"}},
                {"operation_id": "increment8-x-b", "method": "PATCH", "path": "/tasks/1", "body": {"description": "increment8_b"}},
            ]}, 16)

    def test_real_adapter_releases_two_independent_requests_together(self):
        arrivals = []
        arrival_lock = threading.Lock()
        upstream_barrier = threading.Barrier(2, timeout=5)

        class Upstream(BaseHTTPRequestHandler):
            def log_message(self, *_args): pass
            def do_PATCH(self):
                raw = self.rfile.read(int(self.headers.get("Content-Length", "0")))
                with arrival_lock:
                    arrivals.append((self.headers.get("X-Provengo-Operation-Id"), time.perf_counter_ns()))
                upstream_barrier.wait()
                response = json.dumps({"ok": True, "request": json.loads(raw)}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(response)))
                self.end_headers()
                self.wfile.write(response)

        upstream = ThreadingHTTPServer(("127.0.0.1", 0), Upstream)
        upstream.daemon_threads = True
        upstream_thread = threading.Thread(target=upstream.serve_forever, daemon=True)
        upstream_thread.start()
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            adapter_port = probe.getsockname()[1]
        with tempfile.TemporaryDirectory() as directory:
            log = Path(directory) / "epochs.jsonl"
            process = subprocess.Popen([
                sys.executable, str(ROOT / "scripts" / "vikunja_concurrent_epoch_adapter.py"),
                "--listen-port", str(adapter_port),
                "--upstream", f"http://127.0.0.1:{upstream.server_port}",
                "--epoch-log", str(log),
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                for _ in range(50):
                    try:
                        urllib.request.urlopen(f"http://127.0.0.1:{adapter_port}/health", timeout=1).read()
                        break
                    except Exception:
                        time.sleep(0.05)
                else:
                    self.fail("adapter did not become ready")
                epoch = {
                    "epoch_id": "increment8-task-0",
                    "operations": [
                        {"operation_id": "increment8-task-0-title", "method": "PATCH", "path": "/tasks/7", "body": {"title": "increment8_title"}},
                        {"operation_id": "increment8-task-0-description", "method": "PATCH", "path": "/tasks/7", "body": {"description": "increment8_description"}},
                    ],
                }
                request = urllib.request.Request(f"http://127.0.0.1:{adapter_port}/epochs", data=json.dumps(epoch).encode(), headers={"Content-Type": "application/json"}, method="POST")
                result = json.loads(urllib.request.urlopen(request, timeout=10).read())
                self.assertTrue(result["overlap_observed"])
                self.assertTrue(result["all_workers_ready_before_release"])
                self.assertEqual([200, 200], sorted(op["status"] for op in result["operations"]))
                self.assertEqual(2, len(arrivals))
                self.assertTrue(log.exists())
            finally:
                process.terminate()
                process.wait(timeout=5)
                upstream.shutdown()
                upstream.server_close()

    def test_full_adapter_proxy_chain_records_overlap_without_token(self):
        upstream_barrier = threading.Barrier(2, timeout=5)

        class VikunjaStub(BaseHTTPRequestHandler):
            def log_message(self, *_args): pass
            def do_GET(self):
                body = b'{"version":"test"}'
                self.send_response(200); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
            def do_PATCH(self):
                self.rfile.read(int(self.headers.get("Content-Length", "0")))
                upstream_barrier.wait()
                body = b'{"title":"ok","description":"ok"}'
                self.send_response(200); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)

        upstream = ThreadingHTTPServer(("127.0.0.1", 0), VikunjaStub)
        upstream.daemon_threads = True
        threading.Thread(target=upstream.serve_forever, daemon=True).start()

        def free_port():
            with socket.socket() as value:
                value.bind(("127.0.0.1", 0))
                return value.getsockname()[1]

        proxy_port, adapter_port = free_port(), free_port()
        with tempfile.TemporaryDirectory() as directory:
            trace = Path(directory) / "trace.jsonl"
            epochs = Path(directory) / "epochs.jsonl"
            environment = dict(os.environ, VIKUNJA_API_TOKEN="secret-that-must-not-be-recorded")
            proxy = subprocess.Popen([
                sys.executable, str(ROOT / "scripts" / "vikunja_research_proxy.py"),
                "--listen-port", str(proxy_port), "--target", f"http://127.0.0.1:{upstream.server_port}", "--trace", str(trace),
            ], env=environment, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            concurrent = subprocess.Popen([
                sys.executable, str(ROOT / "scripts" / "vikunja_concurrent_epoch_adapter.py"),
                "--listen-port", str(adapter_port), "--upstream", f"http://127.0.0.1:{proxy_port}", "--epoch-log", str(epochs),
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                for _ in range(50):
                    try:
                        urllib.request.urlopen(f"http://127.0.0.1:{adapter_port}/health", timeout=1).read()
                        urllib.request.urlopen(f"http://127.0.0.1:{proxy_port}/info", timeout=1).read()
                        break
                    except Exception:
                        time.sleep(0.05)
                else:
                    self.fail("adapter/proxy chain did not become ready")
                epoch = {"epoch_id": "increment8-task-0", "operations": [
                    {"operation_id": "increment8-task-0-title", "method": "PATCH", "path": "/tasks/7", "body": {"title": "increment8_title"}},
                    {"operation_id": "increment8-task-0-description", "method": "PATCH", "path": "/tasks/7", "body": {"description": "increment8_description"}},
                ]}
                request = urllib.request.Request(f"http://127.0.0.1:{adapter_port}/epochs", data=json.dumps(epoch).encode(), headers={"Content-Type": "application/json"}, method="POST")
                result = json.loads(urllib.request.urlopen(request, timeout=10).read())
                self.assertTrue(result["overlap_observed"])
            finally:
                concurrent.terminate(); proxy.terminate()
                concurrent.wait(timeout=5); proxy.wait(timeout=5)
                upstream.shutdown(); upstream.server_close()
            raw = trace.read_bytes()
            self.assertNotIn(b"secret-that-must-not-be-recorded", raw)
            events = validator.load_jsonl(trace)
            patches = [e for e in events if e.get("epoch_id") == "increment8-task-0"]
            self.assertEqual(2, len(patches))
            self.assertTrue(validator.proxy_overlap(patches))

    def test_generated_story_contract_and_syntax(self):
        openapi = Path(__file__).resolve().parents[2] / "inc6_evidence" / "model" / "vikunja-multi-resource-openapi.json"
        with tempfile.TemporaryDirectory() as directory:
            story = Path(directory) / "concurrent.vikunja.js"
            manifest = Path(directory) / "manifest.json"
            subprocess.run([sys.executable, str(ROOT / "scripts" / "generate_concurrent_epoch_bp_stories.py"), "--openapi", str(openapi), "--output", str(story), "--manifest", str(manifest), "--tasks", "6"], check=True)
            data = json.loads(manifest.read_text())
            text = story.read_text()
            self.assertEqual(6, data["expected"]["epochs"])
            self.assertEqual(12, data["expected"]["patches"])
            self.assertEqual("Provengo BP model", data["protocol"]["decision_owner"])
            self.assertIn("ConcurrentEpochRelease", text)
            self.assertIn("Milestone:AllDisjointPatchVerifiersClosed", text)
            if subprocess.run(["node", "--version"], capture_output=True).returncode == 0:
                subprocess.run(["node", "--check", str(story)], check=True)


if __name__ == "__main__":
    unittest.main()
