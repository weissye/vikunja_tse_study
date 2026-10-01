import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(mod)
    return mod


class TodoistRuntimeContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ev = load_module(ROOT / "scripts" / "evaluate_todoist_trace.py", "todoist_eval")

    def test_real_http_contract_requires_server_assigned_id_reuse_update_delete(self):
        events = [
            {"method": "POST", "path": "/projects", "status": 201, "response": {"id": "srv-42"}},
            {"method": "POST", "path": "/projects/srv-42", "status": 200, "response": {"id": "srv-42"}},
            {"method": "DELETE", "path": "/projects/srv-42", "status": 204, "response": None},
        ]
        result = self.ev.evaluate(events)
        self.assertTrue(result["server_assigned_id_created"])
        self.assertTrue(result["server_assigned_id_reused"])
        self.assertTrue(result["update_seen"])
        self.assertTrue(result["delete_seen"])
        self.assertTrue(result["runtime_contract_confirmed"])

    def test_runtime_contract_rejects_create_only_trace(self):
        result = self.ev.evaluate([
            {"method": "POST", "path": "/projects", "status": 201, "response": {"id": "srv-42"}},
        ])
        self.assertFalse(result["runtime_contract_confirmed"])

    def test_loader_accepts_proxy_model_event_format(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "trace.jsonl"
            event = {"method": "POST", "path": "/projects", "status": 201, "response": {"id": "x"}}
            p.write_text("MODEL_EVENT " + json.dumps(event) + "\n", encoding="utf-8")
            self.assertEqual(self.ev.load(p), [event])

    def test_generated_interface_uses_documented_rest_response_fields(self):
        text = (ROOT / "openapi_to_sbt" / "render" / "interfaces_js.py").read_text(encoding="utf-8")
        self.assertIn("response.code", text)
        self.assertIn("JSON.parse(response.body)", text)


class RuntimeHarnessStaticTests(unittest.TestCase):
    def test_e2e_extra_declares_sut_dependencies(self):
        text = (ROOT / "pyproject.toml").read_text(encoding="utf-8")
        self.assertIn('Flask>=3.0,<4.0', text)
        self.assertIn('flask-cors>=4.0,<7.0', text)

    def test_real_provengo_runner_invokes_preflight_and_todoist_evaluator(self):
        text = (ROOT / "scripts" / "Invoke-GeneratedModel-Provengo.ps1").read_text(encoding="utf-8")
        self.assertIn("preflight_e2e.py", text)
        self.assertIn("--mode provengo", text)
        self.assertIn('"todoist"', text)
        self.assertIn("evaluate_todoist_trace.py", text)
        self.assertIn("runtime_contract_confirmed", text)


if __name__ == "__main__":
    unittest.main()
