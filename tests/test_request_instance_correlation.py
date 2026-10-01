"""Opt-in creator correlation and unchanged default generation."""
import argparse
import json
import sys
import tempfile
import threading
import time
import unittest
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "generator_baseline"))
from openapi_to_sbt.pipeline import run_pipeline
from openapi_to_sbt.trace_proxy import build_server


SPEC = {
    "openapi": "3.0.3", "info": {"title": "Correlation", "version": "1"},
    "paths": {
        "/widgets": {"post": {"operationId": "createWidget",
            "requestBody": {"content": {"application/json": {"schema": {
                "type": "object", "properties": {"name": {"type": "string"}},
                "required": ["name"]}}}},
            "responses": {"201": {"description": "created", "content": {
                "application/json": {"schema": {"type": "object", "properties": {
                    "id": {"type": "string"}, "name": {"type": "string"},
                    "color": {"type": "string"}}}}}}}}},
        "/widgets/{item_id}": {"parameters": [{"name": "item_id", "in": "path",
            "required": True, "schema": {"type": "string"}}],
            "get": {"operationId": "getWidget", "responses": {"200": {
                "description": "found", "content": {"application/json": {"schema": {
                    "type": "object", "properties": {"id": {"type": "string"},
                    "name": {"type": "string"}, "color": {"type": "string"}}}}}}}},
            "put": {"operationId": "updateWidget", "requestBody": {"content": {
                "application/json": {"schema": {"type": "object", "properties": {
                    "color": {"type": "string"}}, "required": ["color"]}}}},
                "responses": {"200": {"description": "updated"}}},
        },
    },
}


class CorrelationTests(unittest.TestCase):
    def test_generated_calls_are_instance_specific_only_in_long_profile(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "openapi.json"
            path.write_text(json.dumps(SPEC), encoding="utf-8")
            opts = dict(openapi_path=str(path), name="widgets",
                        base_url="http://127.0.0.1:1234", seed=19,
                        instances_per_entity=2, long_rounds=(8, 8),
                        emit_prefix_witnesses=True)
            normal = run_pipeline(**opts)
            long = run_pipeline(**opts, story_profile="long-interleaving")
            self.assertNotIn("X-Provengo-Invocation", normal.interfaces_js)
            self.assertNotIn("__sbtInvocationToken", normal.interfaces_js)
            self.assertIn("X-Provengo-Invocation", long.interfaces_js)
            self.assertIn("SBT:InstanceUnresolved", long.stories_js)
            self.assertIn('e.name === "SBT:InstanceUnresolved"', long.stories_js)
            self.assertIn(' + ":before:" + __round', long.stories_js)
            self.assertIn(' + ":mutation:" + __round', long.stories_js)
            self.assertRegex(long.stories_js, r'createWidget\([^\n]+"crud:[^\n]+:1"\)')
            self.assertRegex(long.stories_js, r'createWidget\([^\n]+"crud:[^\n]+:2"\)')

    def test_proxy_records_invocation_but_does_not_forward_it(self):
        received = []

        class Target(BaseHTTPRequestHandler):
            def do_GET(self):
                received.append(dict(self.headers))
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'{}')

            def log_message(self, *_):
                pass

        upstream = ThreadingHTTPServer(("127.0.0.1", 0), Target)
        upstream_thread = threading.Thread(target=upstream.serve_forever, daemon=True)
        upstream_thread.start()
        with tempfile.TemporaryDirectory() as tmp:
            trace = Path(tmp) / "trace.jsonl"
            args = argparse.Namespace(target=f"http://127.0.0.1:{upstream.server_port}",
                api_prefix="", trace=str(trace), bearer_token_env="",
                require_bearer_token=False, authorization_scheme="Bearer",
                listen_host="127.0.0.1", listen_port=0, timeout=5)
            proxy = build_server(args)
            worker = threading.Thread(target=proxy.serve_forever, daemon=True)
            worker.start()
            try:
                req = urllib.request.Request(f"http://127.0.0.1:{proxy.server_port}/widgets",
                    headers={"X-Provengo-Invocation": "creator:1"})
                with urllib.request.urlopen(req, timeout=5) as response:
                    self.assertEqual(response.status, 200)
                for _ in range(50):
                    if trace.exists() and trace.stat().st_size:
                        break
                    time.sleep(0.01)
                event = json.loads(trace.read_text(encoding="utf-8").splitlines()[0])
                self.assertEqual(event["invocation_id"], "creator:1")
                self.assertNotIn("x-provengo-invocation",
                                 {key.lower() for key in received[0]})
            finally:
                proxy.shutdown()
                proxy.server_close()
                upstream.shutdown()
                upstream.server_close()


if __name__ == "__main__":
    unittest.main()
