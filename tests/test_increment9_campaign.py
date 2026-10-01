import importlib.util
import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


adapter = load("i9_adapter", ROOT / "scripts" / "vikunja_increment9_concurrency_adapter.py")
evaluator = load("i9_evaluator", ROOT / "scripts" / "evaluate_vikunja_increment9_campaign.py")


def manifest(kind="commutative", operations=None):
    operations = operations or [
        {"method": "PATCH", "field": "title", "value": "increment9_title", "delay_ms": 0},
        {"method": "PATCH", "field": "description", "value": "increment9_description", "delay_ms": 0},
    ]
    return {"profile": "test", "scenarios": [{"index": 0, "scenario_id": "test", "kind": kind, "width": len(operations), "operations": operations}]}


def event(epoch, op, method, status, response=None, start="2026-09-22T00:00:00+00:00", end="2026-09-22T00:00:01+00:00"):
    return {"epoch_id": epoch, "operation_id": op, "method": method, "status": status,
            "response": response, "upstream_started_utc": start, "upstream_completed_utc": end}


def good_evidence(final=None):
    final = final or {"title": "increment9_title", "description": "increment9_description", "priority": 1}
    trace = [
        event("increment9-control-0", "increment9-control-0-op-0", "PATCH", 200),
        event("increment9-control-0", "increment9-control-0-op-1", "PATCH", 200),
        event("increment9-control-0", "increment9-control-0-observe", "GET", 200, copy.deepcopy(final), "2026-09-22T00:00:02+00:00", "2026-09-22T00:00:03+00:00"),
        event("increment9-epoch-0", "increment9-epoch-0-op-0", "PATCH", 200),
        event("increment9-epoch-0", "increment9-epoch-0-op-1", "PATCH", 200),
        event("increment9-epoch-0", "increment9-epoch-0-observe", "GET", 200, copy.deepcopy(final), "2026-09-22T00:00:02+00:00", "2026-09-22T00:00:03+00:00"),
    ]
    epochs = [{"epoch_id": "increment9-epoch-0", "all_workers_ready_before_release": True,
               "overlap_observed": True, "release_skew_ns": 10, "operations": [
                   {"operation_id": "increment9-epoch-0-op-0", "method": "PATCH", "status": 200, "connection_id": "a", "error": None},
                   {"operation_id": "increment9-epoch-0-op-1", "method": "PATCH", "status": 200, "connection_id": "b", "error": None},
               ]}]
    return trace, epochs


class Increment9Tests(unittest.TestCase):
    def test_adapter_accepts_scoped_patch_and_delete(self):
        value = {"epoch_id": "increment9-x", "operations": [
            {"operation_id": "increment9-x-a", "method": "PATCH", "path": "/tasks/1", "body": {"title": "increment9_a"}},
            {"operation_id": "increment9-x-b", "method": "DELETE", "path": "/tasks/1", "body": None, "delay_ms": 5},
        ]}
        self.assertEqual("increment9-x", adapter.validate_epoch(value)["epoch_id"])

    def test_adapter_rejects_unsafe_path_and_method(self):
        with self.assertRaises(ValueError):
            adapter.validate_epoch({"epoch_id": "increment9-x", "operations": [
                {"operation_id": "increment9-x-a", "method": "POST", "path": "/admin", "body": {}},
                {"operation_id": "increment9-x-b", "method": "DELETE", "path": "/tasks/1"},
            ]})

    def test_commutative_success_passes(self):
        trace, epochs = good_evidence()
        result = evaluator.evaluate(trace, epochs, manifest())
        self.assertEqual("PASS", result["run_status"])

    def test_lost_commutative_field_is_candidate(self):
        trace, epochs = good_evidence()
        trace[-1]["response"]["description"] = "increment9_baseline_description"
        result = evaluator.evaluate(trace, epochs, manifest())
        self.assertEqual("CANDIDATES_FOUND", result["run_status"])

    def test_missing_overlap_is_inconclusive(self):
        trace, epochs = good_evidence()
        epochs[0]["overlap_observed"] = False
        result = evaluator.evaluate(trace, epochs, manifest())
        self.assertEqual("INCONCLUSIVE", result["run_status"])

    def test_generator_emits_six_scenarios_and_valid_javascript(self):
        openapi = Path(__file__).resolve().parents[2] / "inc6_evidence" / "model" / "vikunja-multi-resource-openapi.json"
        with tempfile.TemporaryDirectory() as directory:
            story = Path(directory) / "increment9.vikunja.js"
            output_manifest = Path(directory) / "manifest.json"
            subprocess.run([sys.executable, str(ROOT / "scripts" / "generate_vikunja_increment9_campaign.py"),
                            "--openapi", str(openapi), "--output", str(story), "--manifest", str(output_manifest)], check=True)
            data = json.loads(output_manifest.read_text())
            self.assertEqual(6, len(data["scenarios"]))
            self.assertEqual("Provengo BP model", data["decision_owner"])
            self.assertIn("Increment9:EpochDeclared", story.read_text())
            if subprocess.run(["node", "--version"], capture_output=True).returncode == 0:
                subprocess.run(["node", "--check", str(story)], check=True)


if __name__ == "__main__":
    unittest.main()
