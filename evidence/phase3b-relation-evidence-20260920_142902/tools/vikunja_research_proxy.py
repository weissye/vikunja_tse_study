#!/usr/bin/env python3
"""Authenticated, trace-preserving adapter for an authorized Vikunja SUT.

The generated SBT model calls this adapter without credentials and without the
API prefix. The adapter prepends /api/v2, injects the research account's Bearer
token, forwards the request to the controlled SUT, and records a redacted JSONL
trace. It never records the token.
"""

from __future__ import annotations

import argparse
import http.client
import json
import os
import threading
import urllib.parse
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HOP_BY_HOP = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade",
}


def decode_body(raw: bytes):
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

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self): self.forward()
        def do_POST(self): self.forward()
        def do_PUT(self): self.forward()
        def do_PATCH(self): self.forward()
        def do_DELETE(self): self.forward()
        def do_HEAD(self): self.forward()
        def do_OPTIONS(self): self.forward()

        def log_message(self, *_args):
            return

        def forward(self):
            length = int(self.headers.get("Content-Length", "0") or 0)
            request_body = self.rfile.read(length) if length else b""
            headers = {
                key: value for key, value in self.headers.items()
                if key.lower() not in HOP_BY_HOP
                and key.lower() not in {"host", "authorization"}
            }
            headers["Authorization"] = f"Bearer {token}"
            upstream_path = prefix + (self.path if self.path.startswith("/") else "/" + self.path)
            connection_cls = (
                http.client.HTTPSConnection if target.scheme == "https"
                else http.client.HTTPConnection
            )
            connection = connection_cls(target.hostname, target_port, timeout=60)
            status = 502
            response_body = b""
            try:
                connection.request(self.command, upstream_path, body=request_body, headers=headers)
                response = connection.getresponse()
                status = response.status
                response_body = response.read()
                self.send_response(status)
                for key, value in response.getheaders():
                    if key.lower() not in HOP_BY_HOP and key.lower() != "content-length":
                        self.send_header(key, value)
                self.send_header("Content-Length", str(len(response_body)))
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(response_body)
            finally:
                connection.close()
                event = {
                    "timestamp_utc": datetime.now(timezone.utc).isoformat(),
                    "method": self.command,
                    "model_path": self.path,
                    "sut_path": upstream_path,
                    "request": decode_body(request_body),
                    "status": status,
                    "response": decode_body(response_body),
                }
                with lock, trace_path.open("a", encoding="utf-8") as handle:
                    handle.write(json.dumps(event, sort_keys=True) + "\n")

    server = ThreadingHTTPServer((args.listen_host, args.listen_port), Handler)
    print(
        f"VIKUNJA_RESEARCH_PROXY_READY http://{args.listen_host}:{args.listen_port} "
        f"-> {args.target}{prefix}",
        flush=True,
    )
    server.serve_forever()


if __name__ == "__main__":
    main()

