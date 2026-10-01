import contextlib
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

FILE = Path(__file__).resolve().parents[1] / "scripts" / "run_keycloak_stage2_live_gate.py"
SPEC = importlib.util.spec_from_file_location("live_gate", FILE)
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)


class LiveGateTest(unittest.TestCase):
    def fixture(self, directory):
        spec = Path(directory) / "spec.json"
        paths = {name: {method: {} for method in methods} for name, methods in {
            "/admin/realms": ("post",), "/admin/realms/{realm}": ("get",),
            "/admin/realms/{realm}/users": ("post",),
            "/admin/realms/{realm}/users/{user-id}": ("get", "put"),
        }.items()}
        spec.write_text(json.dumps({"paths": paths}))
        digest = hashlib.sha256(spec.read_bytes()).hexdigest()
        generated = Path(directory) / "generated"
        generated.mkdir()
        (generated / "generation_report.json").write_text(json.dumps({
            "meta": {"cli_args": {"generator_version": "0.26.17", "source_openapi_sha256": digest}},
            "entities": [{"key": "admin/realms"}, {"key": "admin/realms/{realm}/users"}]}))
        (generated / "dependency_graph.json").write_text(json.dumps({"edges": [
            {"source": "admin/realms/{realm}/users", "target": "admin/realms"}]}))
        return spec, generated, digest

    def test_create_read_and_prefix_with_no_token_in_evidence(self):
        with tempfile.TemporaryDirectory() as temporary:
            spec, generated, digest = self.fixture(temporary)
            out = Path(temporary) / "result.json"
            state = {"realm": "", "user": "", "first": "Initial"}

            def fake_request(base, path, method="GET", token=None, payload=None, form=None):
                if path.endswith("openid-configuration"):
                    return 200, {}, json.dumps({"issuer": base + "/realms/master"}).encode()
                if path.endswith("/token"):
                    return 200, {}, b'{"access_token":"secret-token-not-for-evidence"}'
                if path == "/admin/realms" and method == "POST":
                    state["realm"] = payload["realm"]
                    return 201, {}, b""
                if path == "/admin/realms/" + state["realm"]:
                    return 200, {}, json.dumps({"realm": state["realm"]}).encode()
                if path.endswith("/users") and method == "POST":
                    state["user"] = payload["username"]
                    return 201, {"Location": base + path + "/test-user-id"}, b""
                if path.endswith("/test-user-id") and method == "PUT":
                    state["first"] = payload["firstName"]
                    return 204, {}, b""
                if path.endswith("/test-user-id") and method == "GET":
                    return 200, {}, json.dumps({"username": state["user"], "id": "test-user-id",
                                                "firstName": state["first"]}).encode()
                raise AssertionError((method, path))

            with (patch.object(GATE, "EXPECTED_SPEC", digest),
                  patch.object(GATE, "request", side_effect=fake_request),
                  patch.dict(os.environ, {"KC_STAGE2_ADMIN_PASSWORD": "do-not-log"}),
                  patch.object(sys, "argv", [str(FILE), "--spec", str(spec), "--generated",
                                            str(generated), "--out", str(out), "--prefix-rounds", "3"]),
                  contextlib.redirect_stdout(io.StringIO())):
                self.assertEqual(GATE.main(), 0)
            saved = out.read_text()
            self.assertNotIn("secret-token-not-for-evidence", saved)
            self.assertNotIn("do-not-log", saved)
            report = json.loads(saved)
            self.assertEqual((report["runtime_verified_entities"], report["runtime_verified_edges"],
                              report["prefix_verified_rounds"]), (2, 1, 3))

    def test_bad_admin_credentials_keep_evidence_incomplete(self):
        with tempfile.TemporaryDirectory() as temporary:
            spec, generated, digest = self.fixture(temporary)
            out = Path(temporary) / "result.json"
            def fake_request(base, path, method="GET", token=None, payload=None, form=None):
                if path.endswith("openid-configuration"):
                    return 200, {}, json.dumps({"issuer": base + "/realms/master"}).encode()
                self.assertTrue(path.endswith("/token"))
                return 401, {}, b'not logged'
            with (patch.object(GATE, "EXPECTED_SPEC", digest),
                  patch.object(GATE, "request", side_effect=fake_request),
                  patch.dict(os.environ, {"KC_STAGE2_ADMIN_PASSWORD": "bad"}),
                  patch.object(sys, "argv", [str(FILE), "--spec", str(spec), "--generated",
                                            str(generated), "--out", str(out)]),
                  contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO())):
                self.assertEqual(GATE.main(), 1)
            self.assertEqual(json.loads(out.read_text())["runtime_status"], "INCOMPLETE")


if __name__ == "__main__":
    unittest.main()
