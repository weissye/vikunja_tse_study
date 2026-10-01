#!/usr/bin/env python3
"""Authenticated Vikunja proxy with redacted interval evidence.

Backward compatible with the earlier trace schema. Increment 8 adds invocation
and completion timestamps plus non-secret Provengo epoch/operation ids.
"""
from __future__ import annotations

import argparse
import http.client
import json
import os
import threading
import time
import urllib.parse
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HOP_BY_HOP = {"connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailers", "transfer-encoding", "upgrade"}


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def decode(raw: bytes):
    if not raw:
        return None
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return raw.decode("utf-8", errors="replace")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--listen-host", default="127.0.0.1")
    parser.add_argument("--listen-port", type=int, default=3457)
    parser.add_argument("--target", default="http://127.0.0.1:3456")
    parser.add_argument("--api-prefix", default="/api/v2")
    parser.add_argument("--trace", required=True)
    args = parser.parse_args()
    token = os.environ.get("VIKUNJA_API_TOKEN", "").strip()
    if not token:
        raise SystemExit("VIKUNJA_API_TOKEN is required")
    target = urllib.parse.urlsplit(args.target)
    if target.scheme not in {"http", "https"} or not target.hostname:
        raise SystemExit("--target must be an http(s) URL")
    target_port = target.port or (443 if target.scheme == "https" else 80)
    prefix = "/" + args.api_prefix.strip("/")
    trace_path = Path(args.trace)
    trace_path.parent.mkdir(parents=True, exist_ok=True)
    lock = threading.Lock()
    sequence = 0

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self): self.forward()
        def do_POST(self): self.forward()
        def do_PUT(self): self.forward()
        def do_PATCH(self): self.forward()
        def do_DELETE(self): self.forward()
        def do_HEAD(self): self.forward()
        def do_OPTIONS(self): self.forward()
        def log_message(self, *_args): return

        def forward(self):
            nonlocal sequence
            received_utc = now()
            received_ns = time.perf_counter_ns()
            length = int(self.headers.get("Content-Length", "0") or 0)
            request_body = self.rfile.read(length) if length else b""
            headers = {k: v for k, v in self.headers.items() if k.lower() not in HOP_BY_HOP and k.lower() not in {"host", "authorization"}}
            headers["Authorization"] = f"Bearer {token}"
            upstream_path = prefix + (self.path if self.path.startswith("/") else "/" + self.path)
            connection_cls = http.client.HTTPSConnection if target.scheme == "https" else http.client.HTTPConnection
            connection = connection_cls(target.hostname, target_port, timeout=60)
            status, response_body = 502, b""
            upstream_started_utc = now()
            upstream_started_ns = time.perf_counter_ns()
            try:
                connection.request(self.command, upstream_path, body=request_body, headers=headers)
                response = connection.getresponse()
                status, response_body = response.status, response.read()
                self.send_response(status)
                for key, value in response.getheaders():
                    if key.lower() not in HOP_BY_HOP and key.lower() != "content-length":
                        self.send_header(key, value)
                self.send_header("Content-Length", str(len(response_body)))
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(response_body)
            finally:
                upstream_completed_ns = time.perf_counter_ns()
                upstream_completed_utc = now()
                connection.close()
                event = {
                    "timestamp_utc": upstream_completed_utc,
                    "request_received_utc": received_utc,
                    "upstream_started_utc": upstream_started_utc,
                    "upstream_completed_utc": upstream_completed_utc,
                    "proxy_queue_ns": upstream_started_ns - received_ns,
                    "upstream_duration_ns": upstream_completed_ns - upstream_started_ns,
                    "method": self.command,
                    "model_path": self.path,
                    "sut_path": upstream_path,
                    "request": decode(request_body),
                    "status": status,
                    "response": decode(response_body),
                    "epoch_id": self.headers.get("X-Provengo-Epoch-Id"),
                    "operation_id": self.headers.get("X-Provengo-Operation-Id"),
                    "proxy_worker": threading.current_thread().name,
                }
                with lock, trace_path.open("a", encoding="utf-8") as handle:
                    event["trace_sequence"] = sequence
                    sequence += 1
                    handle.write(json.dumps(event, sort_keys=True) + "\n")

    server = ThreadingHTTPServer((args.listen_host, args.listen_port), Handler)
    server.daemon_threads = True
    print(f"VIKUNJA_RESEARCH_PROXY_READY http://{args.listen_host}:{args.listen_port} -> {args.target}{prefix}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
