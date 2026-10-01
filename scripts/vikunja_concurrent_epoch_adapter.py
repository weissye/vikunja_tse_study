#!/usr/bin/env python3
"""Execute a Provengo-declared HTTP epoch with a real release barrier.

This adapter contains no test-selection logic.  Provengo supplies the complete
epoch (operation ids, methods, paths, bodies and headers); the adapter only
prepares independent connections, releases them together, joins them and
records timing evidence.  Credentials remain in the research proxy.
"""
from __future__ import annotations

import argparse
import http.client
import json
import threading
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def decode(raw: bytes):
    if not raw:
        return None
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return raw.decode("utf-8", errors="replace")


def validate_epoch(value: object, max_width: int) -> dict:
    if not isinstance(value, dict):
        raise ValueError("epoch body must be an object")
    epoch_id = value.get("epoch_id")
    operations = value.get("operations")
    if not isinstance(epoch_id, str) or not epoch_id.startswith("increment8-"):
        raise ValueError("epoch_id must start with increment8-")
    if not isinstance(operations, list) or not 2 <= len(operations) <= max_width:
        raise ValueError(f"operations must contain 2..{max_width} entries")
    seen = set()
    for op in operations:
        if not isinstance(op, dict):
            raise ValueError("each operation must be an object")
        op_id = op.get("operation_id")
        if not isinstance(op_id, str) or not op_id.startswith(epoch_id + "-") or op_id in seen:
            raise ValueError("operation ids must be unique and scoped to the epoch")
        seen.add(op_id)
        if str(op.get("method", "")).upper() != "PATCH":
            raise ValueError("Increment 8 pilot permits PATCH only")
        path = op.get("path")
        if not isinstance(path, str) or not path.startswith("/tasks/") or "://" in path or ".." in path:
            raise ValueError("Increment 8 pilot permits local /tasks/{id} paths only")
        body = op.get("body")
        if not isinstance(body, dict) or len(body) != 1:
            raise ValueError("each pilot PATCH body must contain exactly one field")
        field, field_value = next(iter(body.items()))
        if field not in {"title", "description"} or not isinstance(field_value, str) or not field_value.startswith("increment8_"):
            raise ValueError("pilot PATCH must write an Increment 8 title or description")
    return {"epoch_id": epoch_id, "operations": operations}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--listen-host", default="127.0.0.1")
    parser.add_argument("--listen-port", type=int, default=3458)
    parser.add_argument("--upstream", default="http://127.0.0.1:3457")
    parser.add_argument("--epoch-log", required=True)
    parser.add_argument("--max-width", type=int, default=16)
    parser.add_argument("--timeout", type=float, default=60.0)
    args = parser.parse_args()

    upstream = urllib.parse.urlsplit(args.upstream)
    if upstream.scheme not in {"http", "https"} or not upstream.hostname:
        raise SystemExit("--upstream must be an http(s) URL")
    upstream_port = upstream.port or (443 if upstream.scheme == "https" else 80)
    upstream_prefix = upstream.path.rstrip("/")
    epoch_log = Path(args.epoch_log)
    epoch_log.parent.mkdir(parents=True, exist_ok=True)
    log_lock = threading.Lock()

    def execute_epoch(epoch: dict) -> dict:
        operations = epoch["operations"]
        barrier = threading.Barrier(len(operations) + 1, timeout=args.timeout)
        release_box = {}

        def invoke(op: dict) -> dict:
            method = str(op["method"]).upper()
            body = json.dumps(op["body"], separators=(",", ":")).encode("utf-8")
            headers = {str(k): str(v) for k, v in (op.get("headers") or {}).items()}
            headers.setdefault("Content-Type", "application/merge-patch+json")
            headers["X-Provengo-Epoch-Id"] = epoch["epoch_id"]
            headers["X-Provengo-Operation-Id"] = op["operation_id"]
            connection_cls = http.client.HTTPSConnection if upstream.scheme == "https" else http.client.HTTPConnection
            connection = connection_cls(upstream.hostname, upstream_port, timeout=args.timeout)
            ready_utc = utc_now()
            barrier.wait()
            invocation_utc = utc_now()
            invocation_ns = time.perf_counter_ns()
            status = None
            response_body = b""
            error = None
            try:
                connection.request(method, upstream_prefix + op["path"], body=body, headers=headers)
                response = connection.getresponse()
                status = response.status
                response_body = response.read()
            except Exception as exc:  # evidence, not a product-bug classification
                error = f"{type(exc).__name__}: {exc}"
            finally:
                response_ns = time.perf_counter_ns()
                response_utc = utc_now()
                connection.close()
            return {
                "operation_id": op["operation_id"],
                "method": method,
                "path": op["path"],
                "ready_utc": ready_utc,
                "invocation_utc": invocation_utc,
                "response_utc": response_utc,
                "invocation_offset_ns": invocation_ns - release_box["monotonic_ns"],
                "duration_ns": response_ns - invocation_ns,
                "status": status,
                "response": decode(response_body),
                "error": error,
                "worker": threading.current_thread().name,
            }

        started_utc = utc_now()
        with ThreadPoolExecutor(max_workers=len(operations), thread_name_prefix="provengo-epoch") as pool:
            futures = [pool.submit(invoke, op) for op in operations]
            while barrier.n_waiting < len(operations):
                time.sleep(0.0001)
            release_box["utc"] = utc_now()
            release_box["monotonic_ns"] = time.perf_counter_ns()
            barrier.wait()
            results = [future.result(timeout=args.timeout) for future in futures]
        completed_utc = utc_now()
        valid_intervals = [
            (r["invocation_offset_ns"], r["invocation_offset_ns"] + r["duration_ns"])
            for r in results if r["status"] is not None
        ]
        overlap = len(valid_intervals) == len(results) and max(x[0] for x in valid_intervals) < min(x[1] for x in valid_intervals)
        offsets = [r["invocation_offset_ns"] for r in results]
        record = {
            "schema_version": 1,
            "epoch_id": epoch["epoch_id"],
            "width": len(results),
            "started_utc": started_utc,
            "release_utc": release_box["utc"],
            "completed_utc": completed_utc,
            "all_workers_ready_before_release": True,
            "release_skew_ns": max(offsets) - min(offsets),
            "overlap_observed": overlap,
            "operations": results,
        }
        with log_lock, epoch_log.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, sort_keys=True) + "\n")
        return record

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_args):
            return

        def send_json(self, status: int, value: object) -> None:
            raw = json.dumps(value, separators=(",", ":")).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)

        def do_GET(self):
            if self.path == "/health":
                self.send_json(200, {"status": "ready", "component": "provengo-concurrent-rest"})
            else:
                self.send_json(404, {"error": "not found"})

        def do_POST(self):
            if self.path != "/epochs":
                self.send_json(404, {"error": "not found"})
                return
            try:
                length = int(self.headers.get("Content-Length", "0") or 0)
                value = json.loads(self.rfile.read(length).decode("utf-8"))
                epoch = validate_epoch(value, args.max_width)
                self.send_json(200, execute_epoch(epoch))
            except (ValueError, json.JSONDecodeError) as exc:
                self.send_json(400, {"error": str(exc)})
            except Exception as exc:
                self.send_json(500, {"error": f"{type(exc).__name__}: {exc}"})

    server = ThreadingHTTPServer((args.listen_host, args.listen_port), Handler)
    server.daemon_threads = True
    print(
        f"VIKUNJA_CONCURRENT_EPOCH_ADAPTER_READY http://{args.listen_host}:{args.listen_port} -> {args.upstream}",
        flush=True,
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
