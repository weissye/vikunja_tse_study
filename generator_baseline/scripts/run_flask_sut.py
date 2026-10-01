#!/usr/bin/env python3
"""Run one bundled Flask SUT on an isolated OS-assigned port.

Importing the SUT instead of executing its ``__main__`` block avoids the
hard-coded development ports in the reference fixtures.  This is essential
for concurrent/multi-instance experiment runs.
"""
from __future__ import annotations

import argparse
import importlib.util
import os
import signal
import sys
from pathlib import Path

from werkzeug.serving import make_server


def load_app(script: Path):
    spec = importlib.util.spec_from_file_location(f"sbt_sut_{os.getpid()}", script)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot import SUT: {script}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    if callable(getattr(module, "create_app", None)):
        return module.create_app()
    app = getattr(module, "app", None)
    if app is None:
        raise RuntimeError(f"SUT exposes neither create_app() nor app: {script}")
    return app


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", required=True)
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=0, help="0 asks the OS for a free port")
    ap.add_argument("--port-file", required=True)
    args = ap.parse_args()

    script = Path(args.script).resolve()
    app = load_app(script)
    server = make_server(args.host, args.port, app, threaded=True)
    actual_port = int(server.server_port)
    port_file = Path(args.port_file)
    port_file.parent.mkdir(parents=True, exist_ok=True)
    port_file.write_text(str(actual_port) + "\n", encoding="utf-8")
    print(f"SUT_READY http://{args.host}:{actual_port} script={script}", flush=True)

    def stop(*_):
        # shutdown() must not run in the serving thread itself on some Werkzeug versions.
        import threading
        threading.Thread(target=server.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    try:
        server.serve_forever()
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
