#!/usr/bin/env python3
"""Transport-only executor for Provengo-declared Increment 9 epochs."""
from __future__ import annotations

import argparse
import http.client
import json
import re
import socket
import threading
import time
import urllib.parse
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

TASK_PATH = re.compile(r"^/tasks/[1-9][0-9]*$")
PATCH_FIELDS = {"title", "description", "priority"}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def decode(raw: bytes):
    if not raw:
        return None
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return raw.decode("utf-8", errors="replace")


def endpoint(sock: socket.socket | None, peer: bool) -> str | None:
    if sock is None:
        return None
    try:
        value = sock.getpeername() if peer else sock.getsockname()
        return ":".join(str(part) for part in value[:2])
    except OSError:
        return None


def validate_epoch(value: object, max_width: int = 3) -> dict:
    if not isinstance(value, dict):
        raise ValueError("epoch body must be an object")
    epoch_id = value.get("epoch_id")
    operations = value.get("operations")
    if not isinstance(epoch_id, str) or not epoch_id.startswith("increment9-"):
        raise ValueError("epoch_id must start with increment9-")
    if not isinstance(operations, list) or not 2 <= len(operations) <= max_width:
        raise ValueError(f"operations must contain 2..{max_width} entries")
    seen = set()
    for operation in operations:
        if not isinstance(operation, dict):
            raise ValueError("each operation must be an object")
        operation_id = operation.get("operation_id")
        if not isinstance(operation_id, str) or not operation_id.startswith(epoch_id + "-") or operation_id in seen:
            raise ValueError("operation ids must be unique and scoped to the epoch")
        seen.add(operation_id)
        method = str(operation.get("method", "")).upper()
        if method not in {"PATCH", "DELETE"}:
            raise ValueError("Increment 9 permits PATCH and DELETE only")
        path = operation.get("path")
        if not isinstance(path, str) or not TASK_PATH.fullmatch(path):
            raise ValueError("operation path must be a local /tasks/{positive-id} path")
        delay_ms = operation.get("delay_ms", 0)
        if not isinstance(delay_ms, (int, float)) or delay_ms < 0 or delay_ms > 100:
            raise ValueError("delay_ms must be in the range 0..100")
        body = operation.get("body")
        if method == "DELETE":
            if body not in (None, {}):
                raise ValueError("DELETE must not contain a request body")
            continue
        if not isinstance(body, dict) or len(body) != 1:
            raise ValueError("PATCH body must contain exactly one field")
        field, field_value = next(iter(body.items()))
        if field not in PATCH_FIELDS:
            raise ValueError("PATCH field is outside the Increment 9 contract")
        if field in {"title", "description"} and (not isinstance(field_value, str) or not field_value.startswith("increment9_")):
            raise ValueError("text values must start with increment9_")
        if field == "priority" and (not isinstance(field_value, int) or not 0 <= field_value <= 5):
            raise ValueError("priority must be an integer in the range 0..5")
    return {"epoch_id": epoch_id, "operations": operations, "scenario": value.get("scenario")}


def build_server(args):
    upstream = urllib.parse.urlsplit(args.upstream)
    if upstream.scheme not in {"http", "https"} or not upstream.hostname:
        raise ValueError("--upstream must be an absolute HTTP(S) URL")
    upstream_port = upstream.port or (443 if upstream.scheme == "https" else 80)
    upstream_prefix = upstream.path.rstrip("/")
    epoch_log = Path(args.epoch_log)
    epoch_log.parent.mkdir(parents=True, exist_ok=True)
    log_lock = threading.Lock()

    def execute_epoch(epoch_value: dict) -> dict:
        operations = epoch_value["operations"]
        barrier = threading.Barrier(len(operations) + 1, timeout=args.timeout)
        release = {}

        def invoke(operation: dict) -> dict:
            connection_id = str(uuid.uuid4())
            request_id = str(uuid.uuid4())
            cls = http.client.HTTPSConnection if upstream.scheme == "https" else http.client.HTTPConnection
            connection = cls(upstream.hostname, upstream_port, timeout=args.timeout)
            connected_utc = None
            try:
                connection.connect()
                connected_utc = utc_now()
                sock = connection.sock
                local_endpoint = endpoint(sock, False)
                peer_endpoint = endpoint(sock, True)
                barrier.wait()
                delay_ms = float(operation.get("delay_ms", 0))
                if delay_ms:
                    time.sleep(delay_ms / 1000.0)
                started_ns = time.perf_counter_ns()
                started_utc = utc_now()
                method = str(operation["method"]).upper()
                body = operation.get("body")
                payload = None if method == "DELETE" else json.dumps(body, separators=(",", ":")).encode("utf-8")
                headers = {str(k): str(v) for k, v in (operation.get("headers") or {}).items()}
                headers.setdefault("Content-Type", "application/merge-patch+json")
                headers["X-Provengo-Epoch-Id"] = epoch_value["epoch_id"]
                headers["X-Provengo-Operation-Id"] = operation["operation_id"]
                headers["X-Request-ID"] = request_id
                connection.request(method, upstream_prefix + operation["path"], body=payload, headers=headers)
                response = connection.getresponse()
                raw = response.read()
                ended_ns = time.perf_counter_ns()
                return {
                    "operation_id": operation["operation_id"], "request_id": request_id,
                    "connection_id": connection_id, "local_endpoint": local_endpoint, "peer_endpoint": peer_endpoint,
                    "connected_utc": connected_utc, "started_utc": started_utc, "ended_utc": utc_now(),
                    "invocation_offset_ns": started_ns - release["ns"], "duration_ns": ended_ns - started_ns,
                    "method": method, "path": operation["path"], "request_body": body,
                    "delay_ms": delay_ms, "status": response.status, "response": decode(raw), "error": None,
                }
            except Exception as exc:
                return {"operation_id": operation.get("operation_id"), "request_id": request_id,
                        "connection_id": connection_id, "connected_utc": connected_utc,
                        "method": operation.get("method"), "path": operation.get("path"),
                        "status": None, "response": None, "error": f"{type(exc).__name__}: {exc}"}
            finally:
                connection.close()

        with ThreadPoolExecutor(max_workers=len(operations), thread_name_prefix="increment9-epoch") as pool:
            futures = [pool.submit(invoke, operation) for operation in operations]
            deadline = time.monotonic() + args.timeout
            while barrier.n_waiting < len(operations):
                if time.monotonic() >= deadline:
                    barrier.abort()
                    raise TimeoutError("workers did not reach the barrier")
                time.sleep(0.0001)
            release["utc"] = utc_now()
            release["ns"] = time.perf_counter_ns()
            barrier.wait()
            results = [future.result(timeout=args.timeout) for future in futures]
        intervals = [(r.get("invocation_offset_ns"), r.get("invocation_offset_ns", 0) + r.get("duration_ns", 0))
                     for r in results if r.get("status") is not None]
        overlap = len(intervals) == len(results) and max(v[0] for v in intervals) < min(v[1] for v in intervals)
        starts = [r["invocation_offset_ns"] for r in results if r.get("invocation_offset_ns") is not None]
        record = {
            "schema_version": 1, "epoch_id": epoch_value["epoch_id"], "scenario": epoch_value.get("scenario"),
            "width": len(results), "release_utc": release["utc"], "all_workers_ready_before_release": True,
            "release_skew_ns": max(starts) - min(starts), "overlap_observed": overlap, "operations": results,
        }
        with log_lock, epoch_log.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, sort_keys=True) + "\n")
        return record

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_args):
            return

        def send_json(self, status: int, value: object):
            raw = json.dumps(value, separators=(",", ":")).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)

        def do_GET(self):
            self.send_json(200, {"status": "ready", "component": "vikunja-increment9-adapter"}) if self.path == "/health" else self.send_json(404, {"error": "not found"})

        def do_POST(self):
            if self.path != "/epochs":
                self.send_json(404, {"error": "not found"})
                return
            try:
                raw = self.rfile.read(int(self.headers.get("Content-Length", "0") or 0))
                self.send_json(200, execute_epoch(validate_epoch(json.loads(raw.decode("utf-8")), args.max_width)))
            except (ValueError, json.JSONDecodeError) as exc:
                self.send_json(400, {"error": str(exc)})
            except Exception as exc:
                self.send_json(500, {"error": f"{type(exc).__name__}: {exc}"})

    return ThreadingHTTPServer((args.listen_host, args.listen_port), Handler)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--listen-host", default="127.0.0.1")
    parser.add_argument("--listen-port", type=int, default=3459)
    parser.add_argument("--upstream", default="http://127.0.0.1:3457")
    parser.add_argument("--epoch-log", required=True)
    parser.add_argument("--max-width", type=int, default=3)
    parser.add_argument("--timeout", type=float, default=60.0)
    args = parser.parse_args()
    server = build_server(args)
    server.daemon_threads = True
    print(f"VIKUNJA_INCREMENT9_ADAPTER_READY http://{args.listen_host}:{args.listen_port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
