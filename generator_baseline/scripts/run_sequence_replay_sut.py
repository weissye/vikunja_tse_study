#!/usr/bin/env python3
"""Launch a frozen Flask SUT on an OS-assigned port with its normal initial state."""
from __future__ import annotations

import argparse
import importlib.util
import os
import signal
import sys
from pathlib import Path

from werkzeug.serving import make_server


def load_app(script):
    spec = importlib.util.spec_from_file_location(f"sequence_replay_sut_{os.getpid()}", script)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot import SUT: {script}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)

    factory = getattr(module, "create_app", None)
    if callable(factory):
        return factory()

    seed = getattr(module, "seed", None)
    if callable(seed):
        seed()
    app = getattr(module, "app", None)
    if app is None:
        raise RuntimeError(f"SUT exposes neither create_app() nor app: {script}")
    return app


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--script", required=True)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--port-file", required=True)
    args = parser.parse_args()

    script = Path(args.script).resolve()
    app = load_app(script)
    server = make_server(args.host, args.port, app, threaded=True)
    Path(args.port_file).write_text(str(server.server_port) + "\n", encoding="utf-8")
    print(f"SUT_READY http://{args.host}:{server.server_port} script={script}", flush=True)

    def stop(*_):
        import threading
        threading.Thread(target=server.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
