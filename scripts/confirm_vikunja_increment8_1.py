#!/usr/bin/env python3
"""Direct Increment 8.1 confirmation harness for Vikunja.

This deliberately bypasses Provengo, the research proxy, and the Increment 8
adapter.  Each trial uses one fresh task, proves the same two PATCH operations
work sequentially, resets the task, then releases the operations concurrently
over two already-connected HTTP connections.  A third connection performs the
post-join observation.

Only Python's standard library is required.  The bearer token is read from an
environment variable and is never written to evidence.
"""

from __future__ import annotations

import argparse
import hashlib
import http.client
import json
import os
import platform
import socket
import sys
import threading
import time
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit


SCHEMA_VERSION = 1


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def json_safe(value: Any) -> Any:
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return value


def parse_body(raw: bytes) -> Any:
    if not raw:
        return None
    text = raw.decode("utf-8", errors="replace")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return text


def redact_url(raw_url: str) -> str:
    parsed = urlsplit(raw_url)
    host = parsed.hostname or ""
    if parsed.port:
        host = f"{host}:{parsed.port}"
    return f"{parsed.scheme}://{host}{parsed.path.rstrip('/')}"


class ApiError(RuntimeError):
    def __init__(self, message: str, status: int | None = None, body: Any = None):
        super().__init__(message)
        self.status = status
        self.body = body


class DirectClient:
    def __init__(self, base_url: str, token: str, timeout: float = 30.0):
        parsed = urlsplit(base_url.rstrip("/"))
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            raise ValueError("base URL must be an absolute http(s) URL")
        self.scheme = parsed.scheme
        self.host = parsed.hostname
        self.port = parsed.port or (443 if parsed.scheme == "https" else 80)
        self.base_path = parsed.path.rstrip("/")
        self.timeout = timeout
        self.auth = token if token.lower().startswith("bearer ") else f"Bearer {token}"

    def connection(self) -> http.client.HTTPConnection:
        cls = http.client.HTTPSConnection if self.scheme == "https" else http.client.HTTPConnection
        return cls(self.host, self.port, timeout=self.timeout)

    def path(self, suffix: str) -> str:
        return f"{self.base_path}/{suffix.lstrip('/')}"

    def headers(self, content_type: str = "application/json", request_id: str | None = None) -> dict[str, str]:
        result = {
            "Authorization": self.auth,
            "Accept": "application/json",
            "Content-Type": content_type,
            "Connection": "close",
            "User-Agent": "vikunja-increment8.1-direct/1",
        }
        if request_id:
            result["X-Request-ID"] = request_id
        return result

    def request(self, method: str, suffix: str, body: Any = None, *, content_type: str = "application/json") -> dict[str, Any]:
        request_id = str(uuid.uuid4())
        payload = None if body is None else json.dumps(body, separators=(",", ":")).encode("utf-8")
        conn = self.connection()
        started_ns = time.monotonic_ns()
        started_utc = utc_now()
        try:
            conn.request(method, self.path(suffix), body=payload, headers=self.headers(content_type, request_id))
            response = conn.getresponse()
            raw = response.read()
            ended_ns = time.monotonic_ns()
            return {
                "request_id": request_id,
                "method": method,
                "path": suffix,
                "status": response.status,
                "response": parse_body(raw),
                "started_ns": started_ns,
                "ended_ns": ended_ns,
                "duration_ns": ended_ns - started_ns,
                "started_utc": started_utc,
                "ended_utc": utc_now(),
                "error": None,
            }
        except Exception as exc:  # evidence must preserve transport failures
            ended_ns = time.monotonic_ns()
            return {
                "request_id": request_id,
                "method": method,
                "path": suffix,
                "status": None,
                "response": None,
                "started_ns": started_ns,
                "ended_ns": ended_ns,
                "duration_ns": ended_ns - started_ns,
                "started_utc": started_utc,
                "ended_utc": utc_now(),
                "error": f"{type(exc).__name__}: {exc}",
            }
        finally:
            conn.close()


@dataclass
class WorkerSpec:
    worker: str
    operation_id: str
    body: dict[str, str]


def endpoint_of(sock: socket.socket | None, peer: bool) -> str | None:
    if sock is None:
        return None
    try:
        value = sock.getpeername() if peer else sock.getsockname()
        return ":".join(str(part) for part in value[:2])
    except OSError:
        return None


def concurrent_patch_pair(client: DirectClient, task_id: int, trial_id: str, specs: list[WorkerSpec]) -> dict[str, Any]:
    barrier = threading.Barrier(len(specs) + 1, timeout=30)
    results: list[dict[str, Any] | None] = [None] * len(specs)
    threads: list[threading.Thread] = []

    def worker(index: int, spec: WorkerSpec) -> None:
        connection_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        conn = client.connection()
        connected_utc = None
        ready_ns = None
        try:
            conn.connect()
            connected_utc = utc_now()
            sock = conn.sock
            connection_info = {
                "connection_id": connection_id,
                "socket_fileno": sock.fileno() if sock else None,
                "local_endpoint": endpoint_of(sock, False),
                "peer_endpoint": endpoint_of(sock, True),
            }
            ready_ns = time.monotonic_ns()
            barrier.wait()
            started_ns = time.monotonic_ns()
            started_utc = utc_now()
            payload = json.dumps(spec.body, separators=(",", ":")).encode("utf-8")
            conn.request(
                "PATCH",
                client.path(f"/tasks/{task_id}"),
                body=payload,
                headers=client.headers("application/merge-patch+json", request_id),
            )
            response = conn.getresponse()
            raw = response.read()
            ended_ns = time.monotonic_ns()
            results[index] = {
                "trial_id": trial_id,
                "worker": spec.worker,
                "operation_id": spec.operation_id,
                "request_id": request_id,
                **connection_info,
                "connected_utc": connected_utc,
                "ready_ns": ready_ns,
                "started_ns": started_ns,
                "ended_ns": ended_ns,
                "started_utc": started_utc,
                "ended_utc": utc_now(),
                "duration_ns": ended_ns - started_ns,
                "method": "PATCH",
                "path": f"/tasks/{task_id}",
                "request_body": spec.body,
                "status": response.status,
                "response": parse_body(raw),
                "error": None,
            }
        except Exception as exc:
            ended_ns = time.monotonic_ns()
            results[index] = {
                "trial_id": trial_id,
                "worker": spec.worker,
                "operation_id": spec.operation_id,
                "request_id": request_id,
                "connection_id": connection_id,
                "connected_utc": connected_utc,
                "ready_ns": ready_ns,
                "started_ns": None,
                "ended_ns": ended_ns,
                "method": "PATCH",
                "path": f"/tasks/{task_id}",
                "request_body": spec.body,
                "status": None,
                "response": None,
                "error": f"{type(exc).__name__}: {exc}",
            }
            try:
                barrier.abort()
            except Exception:
                pass
        finally:
            conn.close()

    for index, spec in enumerate(specs):
        thread = threading.Thread(target=worker, args=(index, spec), name=spec.worker, daemon=True)
        threads.append(thread)
        thread.start()

    release_utc = utc_now()
    release_ns = time.monotonic_ns()
    barrier_error = None
    try:
        barrier.wait()
        release_utc = utc_now()
        release_ns = time.monotonic_ns()
    except threading.BrokenBarrierError as exc:
        barrier_error = f"BrokenBarrierError: {exc}"

    for thread in threads:
        thread.join(timeout=35)

    completed = [item for item in results if item is not None]
    started = [int(item["started_ns"]) for item in completed if item.get("started_ns") is not None]
    ended = [int(item["ended_ns"]) for item in completed if item.get("started_ns") is not None]
    overlap_ns = max(0, min(ended) - max(started)) if len(started) == len(specs) else 0
    release_skew_ns = max(started) - min(started) if len(started) == len(specs) else None
    distinct_connections = len({item.get("connection_id") for item in completed}) == len(specs)

    return {
        "release_utc": release_utc,
        "release_ns": release_ns,
        "release_skew_ns": release_skew_ns,
        "overlap_ns": overlap_ns,
        "overlap_observed": overlap_ns > 0,
        "distinct_connections": distinct_connections,
        "barrier_error": barrier_error,
        "operations": completed,
    }


def require_status(record: dict[str, Any], expected: int, label: str) -> Any:
    if record.get("status") != expected:
        raise ApiError(f"{label} returned {record.get('status')}: {record.get('response')}", record.get("status"), record.get("response"))
    return record.get("response")


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")


def append_jsonl(path: Path, value: Any) -> None:
    with path.open("a", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, sort_keys=True, ensure_ascii=False) + "\n")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Direct Vikunja Increment 8.1 confirmation")
    parser.add_argument("--base-url", default="http://127.0.0.1:3456/api/v2")
    parser.add_argument("--token-env", default="VIKUNJA_API_TOKEN")
    parser.add_argument("--trials", type=int, default=20)
    parser.add_argument("--quiescence-ms", type=int, default=100)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--keep-resources", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.trials < 1:
        raise SystemExit("--trials must be at least 1")
    if args.quiescence_ms < 0:
        raise SystemExit("--quiescence-ms must be non-negative")

    token = os.environ.get(args.token_env, "").strip()
    if not token:
        raise SystemExit(f"Required token environment variable is empty: {args.token_env}")

    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    witness_path = output_dir / "direct-witnesses.jsonl"
    if witness_path.exists():
        raise SystemExit(f"Refusing to append to existing evidence: {witness_path}")

    client = DirectClient(args.base_url, token)
    run_id = f"increment8.1-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}-{uuid.uuid4().hex[:8]}"
    started_utc = utc_now()
    metadata: dict[str, Any] = {
        "schema_version": SCHEMA_VERSION,
        "experiment": "vikunja-increment8.1-direct-confirmation",
        "run_id": run_id,
        "started_utc": started_utc,
        "base_url": redact_url(args.base_url),
        "token_source": args.token_env,
        "token_recorded": False,
        "trials_requested": args.trials,
        "quiescence_ms": args.quiescence_ms,
        "python": sys.version,
        "platform": platform.platform(),
        "provengo_used": False,
        "research_proxy_used": False,
        "increment8_adapter_used": False,
        "connection_policy": "two pre-connected independent HTTP connections plus an independent observation connection",
    }
    write_json(output_dir / "run-metadata.partial.json", metadata)

    project_id: int | None = None
    harness_error: str | None = None
    completed_trials = 0
    try:
        project = require_status(
            client.request("POST", "/projects", {"title": f"increment8.1 direct confirmation {run_id}"}),
            201,
            "create project",
        )
        project_id = int(project["id"])
        metadata["project_id"] = project_id

        for trial_index in range(args.trials):
            trial_id = f"trial-{trial_index:03d}"
            base_title = f"i8_1_{run_id}_{trial_index}_base_title"
            base_description = f"i8_1_{run_id}_{trial_index}_base_description"
            seq_title = f"i8_1_{run_id}_{trial_index}_seq_title"
            seq_description = f"i8_1_{run_id}_{trial_index}_seq_description"
            concurrent_title = f"i8_1_{run_id}_{trial_index}_concurrent_title"
            concurrent_description = f"i8_1_{run_id}_{trial_index}_concurrent_description"

            task = require_status(
                client.request(
                    "POST",
                    f"/projects/{project_id}/tasks",
                    {"title": base_title, "description": base_description},
                ),
                201,
                f"{trial_id} create task",
            )
            task_id = int(task["id"])

            sequential = [
                client.request("PATCH", f"/tasks/{task_id}", {"title": seq_title}, content_type="application/merge-patch+json"),
                client.request("PATCH", f"/tasks/{task_id}", {"description": seq_description}, content_type="application/merge-patch+json"),
            ]
            sequential_observation = client.request("GET", f"/tasks/{task_id}")
            sequential_pass = (
                all(item.get("status") == 200 for item in sequential)
                and sequential_observation.get("status") == 200
                and isinstance(sequential_observation.get("response"), dict)
                and sequential_observation["response"].get("title") == seq_title
                and sequential_observation["response"].get("description") == seq_description
            )

            reset = [
                client.request("PATCH", f"/tasks/{task_id}", {"title": base_title}, content_type="application/merge-patch+json"),
                client.request("PATCH", f"/tasks/{task_id}", {"description": base_description}, content_type="application/merge-patch+json"),
            ]
            reset_observation = client.request("GET", f"/tasks/{task_id}")
            reset_pass = (
                all(item.get("status") == 200 for item in reset)
                and reset_observation.get("status") == 200
                and isinstance(reset_observation.get("response"), dict)
                and reset_observation["response"].get("title") == base_title
                and reset_observation["response"].get("description") == base_description
            )

            concurrent = concurrent_patch_pair(
                client,
                task_id,
                trial_id,
                [
                    WorkerSpec("direct-worker-title", f"{trial_id}-title", {"title": concurrent_title}),
                    WorkerSpec("direct-worker-description", f"{trial_id}-description", {"description": concurrent_description}),
                ],
            )
            time.sleep(args.quiescence_ms / 1000.0)
            observation = client.request("GET", f"/tasks/{task_id}")

            witness = {
                "schema_version": SCHEMA_VERSION,
                "run_id": run_id,
                "trial_id": trial_id,
                "task_id": task_id,
                "resource_path": f"/tasks/{task_id}",
                "baseline": {"title": base_title, "description": base_description},
                "sequential_expected": {"title": seq_title, "description": seq_description},
                "sequential_operations": sequential,
                "sequential_observation": sequential_observation,
                "sequential_control_pass": sequential_pass,
                "reset_operations": reset,
                "reset_observation": reset_observation,
                "reset_pass": reset_pass,
                "concurrent_expected": {"title": concurrent_title, "description": concurrent_description},
                "concurrent": concurrent,
                "quiescence_ms": args.quiescence_ms,
                "observation_client": "independent-direct-client",
                "post_join_observation": observation,
            }
            append_jsonl(witness_path, witness)
            completed_trials += 1
            statuses = "/".join(str(item.get("status")) for item in concurrent["operations"])
            observed = observation.get("response") if isinstance(observation.get("response"), dict) else {}
            both_visible = observed.get("title") == concurrent_title and observed.get("description") == concurrent_description
            print(
                f"{trial_id}: sequential={sequential_pass} reset={reset_pass} "
                f"overlap_ns={concurrent['overlap_ns']} skew_ns={concurrent['release_skew_ns']} "
                f"statuses={statuses} both_visible={both_visible}",
                flush=True,
            )

    except Exception as exc:
        harness_error = f"{type(exc).__name__}: {exc}"
        print(f"HARNESS_ERROR {harness_error}", file=sys.stderr, flush=True)
    finally:
        cleanup = None
        if project_id is not None and not args.keep_resources:
            cleanup = client.request("DELETE", f"/projects/{project_id}")
        metadata.update(
            {
                "completed_utc": utc_now(),
                "trials_completed": completed_trials,
                "harness_error": harness_error,
                "cleanup": cleanup,
            }
        )
        write_json(output_dir / "run-metadata.json", metadata)
        partial = output_dir / "run-metadata.partial.json"
        if partial.exists():
            partial.unlink()

    return 0 if harness_error is None and completed_trials == args.trials else 3


if __name__ == "__main__":
    raise SystemExit(main())
