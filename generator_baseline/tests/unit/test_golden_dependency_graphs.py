import json
import unittest
from pathlib import Path

from openapi_to_sbt.pipeline import run_pipeline

ROOT = Path(__file__).resolve().parents[2]
SYSTEMS = {
    "library": ROOT / "resources/development_kit/examples/library/openapi.json",
    "garage": ROOT / "resources/development_kit/examples/garage/openapi.json",
    "pharmacy": ROOT / "resources/development_kit/examples/pharmacy/openapi.json",
    "netbox": ROOT / "resources/development_kit/examples/netbox/openapi.json",
    "todoist": ROOT / "holdout/todoist_rest_v2_openapi.yaml",
}


class GoldenDependencyGraphTests(unittest.TestCase):
    """Contract-level regression oracle for entity/dependency inference.

    The fixture is intentionally independent of generated output directories:
    every test reruns parser -> inference -> plan from the source OpenAPI and
    compares the semantically relevant graph projection against a reviewed
    golden snapshot.
    """

    def test_all_five_dependency_graphs_match_reviewed_goldens(self):
        for system, openapi in SYSTEMS.items():
            with self.subTest(system=system):
                expected = json.loads(
                    (ROOT / "tests/golden_dependency_graphs" / f"{system}.json").read_text(encoding="utf-8")
                )
                result = run_pipeline(str(openapi), system, "http://127.0.0.1:5000", seed=1)
                actual_nodes = sorted(result.dependency_graph_report["nodes"])
                actual_edges = sorted(
                    ({"source": e["source"], "target": e["target"], "field_name": e["field_name"]}
                     for e in result.dependency_graph_report["edges"]),
                    key=lambda x: (x["source"], x["target"], x["field_name"]),
                )
                self.assertEqual(expected["nodes"], actual_nodes)
                self.assertEqual(expected["edges"], actual_edges)

                if "operation_dependencies" in expected:
                    actual_op_deps = {
                        op.op.path: [{"field": f, "target": t} for f, t in op.story_dependencies]
                        for op in result.plan.standalone_ops if op.story_dependencies
                    }
                    self.assertEqual(expected["operation_dependencies"], actual_op_deps)

    def test_netbox_weak_cross_namespace_id_aliases_are_not_dependencies(self):
        result = run_pipeline(str(SYSTEMS["netbox"]), "netbox", "http://127.0.0.1:5000", seed=1)
        triples = {(e["source"], e["target"], e["field_name"])
                   for e in result.dependency_graph_report["edges"]}
        self.assertNotIn(("api/circuits/provider-networks", "api/ipam/services", "service_id"), triples)
        self.assertNotIn(("api/ipam/fhrp-group-assignments", "api/dcim/interfaces", "interface_id"), triples)
        self.assertNotIn(("api/ipam/fhrp-groups", "api/users/groups", "group_id"), triples)

    def test_pharmacy_standalone_dependencies_remain_wired(self):
        result = run_pipeline(str(SYSTEMS["pharmacy"]), "pharmacy", "http://127.0.0.1:5000", seed=1)
        deps = {op.op.path: set(op.story_dependencies) for op in result.plan.standalone_ops}
        self.assertEqual({("rxId", "prescriptions")}, deps["/dispense"])
        self.assertEqual({("rxId", "prescriptions"), ("storeId", "stores")}, deps["/process-rx"])


if __name__ == "__main__":
    unittest.main()
