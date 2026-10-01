"""Regression: old epochs unchanged; documented JSON DELETE uses actual HTTP body."""
import importlib.util
import json
import sys
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT
while PROJECT != PROJECT.parent and not (PROJECT / "model/immich/immich-v3.2.0-openapi.json").exists() and not (PROJECT / "freeze_smoke/model/immich/immich-v3.2.0-openapi.json").exists():
    PROJECT = PROJECT.parent
MODEL = PROJECT / "model/immich/immich-v3.2.0-openapi.json"
if not MODEL.exists():
    MODEL = PROJECT / "freeze_smoke/model/immich/immich-v3.2.0-openapi.json"
sys.path.insert(0, str(ROOT / "generator_baseline"))
spec = importlib.util.spec_from_file_location("adapter_candidate", ROOT / "generator_baseline/openapi_to_sbt/concurrency_adapter.py")
adapter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(adapter)


class Handler(BaseHTTPRequestHandler):
    received = []
    lock = threading.Lock()
    def do_DELETE(self): self.record()
    def do_PUT(self): self.record()
    def record(self):
        body = self.rfile.read(int(self.headers.get("Content-Length", "0") or 0))
        with self.lock:
            self.received.append((self.command, self.path, body, self.headers.get("Content-Type")))
        time.sleep(0.15)
        ids = json.loads(body or b"{}").get("ids", [])
        raw = json.dumps([{"id": x, "success": True} for x in ids]).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)
    def log_message(self, *_args): return


class AdapterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.api = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        threading.Thread(target=cls.api.serve_forever, daemon=True).start()
        cls.temp = tempfile.TemporaryDirectory()
        cls.barrier = adapter.build_server(SimpleNamespace(listen_host="127.0.0.1", listen_port=0,
            upstream="http://127.0.0.1:%d" % cls.api.server_port, epoch_log=str(Path(cls.temp.name)/"epochs.jsonl"),
            openapi_path=str(MODEL), max_width=8, timeout=5, quiescence_ms=10))
        threading.Thread(target=cls.barrier.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        for server in (cls.barrier, cls.api):
            server.shutdown()
            server.server_close()
        cls.temp.cleanup()

    def test_real_http_body_and_separate_connections(self):
        Handler.received.clear()
        body = {"epoch_id": "fixture", "operations": [
            {"operation_id": "fixture-delete", "method": "DELETE",
             "path": "/albums/8eeb700d-91e3-4bf1-8d9b-aa12bb17584c/assets", "body": {"ids": ["a"]}},
            {"operation_id": "fixture-add", "method": "PUT",
             "path": "/albums/8eeb700d-91e3-4bf1-8d9b-aa12bb17584c/assets", "body": {"ids": ["b"]}}]}
        req = urllib.request.Request("http://127.0.0.1:%d/epochs" % self.barrier.server_port,
            data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.load(response)
        self.assertTrue(result["all_workers_ready_before_release"])
        self.assertTrue(result["overlap_observed"])
        self.assertEqual(len({o["connection_id"] for o in result["operations"]}), 2)
        self.assertEqual({(m, tuple(json.loads(b)["ids"])) for m, _, b, _ in Handler.received},
                         {("DELETE", ("a",)), ("PUT", ("b",))})
        self.assertEqual(next(ct for m, _, _, ct in Handler.received if m == "DELETE"), "application/json")

    def test_default_and_undocumented_delete_rejected(self):
        plain = {"epoch_id": "x", "operations": [
            {"operation_id": "x-a", "method": "DELETE", "path": "/albums/id/assets", "body": {"ids": ["a"]}},
            {"operation_id": "x-b", "method": "PUT", "path": "/albums/id/assets", "body": {"ids": ["b"]}}]}
        with self.assertRaises(ValueError):
            adapter.validate_epoch(plain)
        paths = adapter.documented_json_delete_paths(json.loads(MODEL.read_text(encoding="utf-8")))
        adapter.validate_epoch(plain, json_delete_paths=paths)
        plain["operations"][0]["path"] = "/albums/id/unknown"
        with self.assertRaises(ValueError):
            adapter.validate_epoch(plain, json_delete_paths=paths)
        plain["operations"][0]["path"] = "/albums/id/assets"
        plain["operations"][0]["headers"] = {"Content-Type": "text/plain"}
        with self.assertRaises(ValueError):
            adapter.validate_epoch(plain, json_delete_paths=paths)
        plain["operations"][0]["body"] = None
        adapter.validate_epoch(plain)


if __name__ == "__main__":
    unittest.main()
