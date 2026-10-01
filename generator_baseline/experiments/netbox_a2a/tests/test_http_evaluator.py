import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "evaluate_netbox_a2a_trace.py"
spec = importlib.util.spec_from_file_location("nb_eval_v35", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def ev(method, path, status, body=None, response=None):
    return {"method": method, "path": path, "status": status, "body": body, "response": response}


def seq_a():
    return [
        ev("POST", "/api/dcim/sites/", 201, {"slug": "a"}, {"id": "s1", "slug": "a"}),
        ev("POST", "/api/dcim/sites/", 201, {"slug": "b"}, {"id": "s2", "slug": "b"}),
        ev("POST", "/api/dcim/devices/", 201, {"site": {"id": "s1"}}, {"id": "d1", "site": {"id": "s1"}}),
        ev("PATCH", "/api/dcim/devices/d1/", 200, {"site": {"id": "s2"}}, {"id": "d1", "site": {"id": "s1"}}),
        ev("GET", "/api/dcim/devices/d1/", 200, None, {"id": "d1", "site": {"id": "s1"}}),
    ]


def seq_b():
    return [
        ev("POST", "/api/dcim/sites/", 201, {"slug": "p"}, {"id": "p", "slug": "p"}),
        ev("POST", "/api/dcim/devices/", 201, {"site": {"id": "p"}}, {"id": "d1", "site": {"id": "p"}}),
        ev("POST", "/api/dcim/devices/", 201, {"site": {"id": "p"}}, {"id": "d2", "site": {"id": "p"}}),
        ev("DELETE", "/api/dcim/sites/p/", 204),
        ev("GET", "/api/dcim/devices/d1/", 200, None, {"id": "d1", "site": {"id": "p"}}),
    ]


def seq_c():
    return [
        ev("POST", "/api/dcim/sites/", 201, {"slug": "dup"}, {"id": "s1", "slug": "dup"}),
        ev("POST", "/api/dcim/sites/", 201, {"slug": "dup"}, {"id": "s2", "slug": "dup"}),
    ]


def seq_d():
    return [
        ev("POST", "/api/circuits/circuits/", 201, {"description": "x"}, {"id": "c", "description": "x"}),
        ev("PATCH", "/api/circuits/circuits/c/", 200, {"description": "y"}, {"id": "c", "description": "y"}),
        ev("GET", "/api/circuits/circuits/c/", 200, None, {"id": "c", "description": "y"}),
        ev("PATCH", "/api/circuits/circuits/c/", 200, {"description": "z"}, {"id": "c", "description": "y"}),
    ]


def seq_e():
    return [
        ev("POST", "/api/dcim/sites/", 201, {"slug": "e"}, {"id": "p", "slug": "e"}),
        ev("POST", "/api/dcim/devices/", 201, {"site": {"id": "p"}}, {"id": "old", "site": {"id": "p"}}),
        ev("DELETE", "/api/dcim/sites/p/", 204),
        ev("POST", "/api/dcim/devices/", 201, {"site": {"id": "p"}}, {"id": "new", "site": {"id": "p"}}),
    ]


class TestNetboxV35Evaluator(unittest.TestCase):
    def test_all_five_intermediate_prefixes(self):
        seqs = [seq_a(), seq_b(), seq_c(), seq_d(), seq_e()]
        found = set()
        for s in seqs:
            found.update(mod.evaluate_sequence(s)["confirmed_classes"])
        self.assertEqual(found, set(mod.CLASSES))
        self.assertEqual(mod.MIN_HTTP_STEPS, {
            "A_LOGIC": 5,
            "B_LIFECYCLE": 5,
            "C_UNIQUENESS": 2,
            "D_INTEGRITY": 4,
            "E_REFERENTIAL_INTEGRITY": 4,
        })

    def test_prefixes_do_not_confirm_early(self):
        checks = [
            (seq_a()[:-1], "A_LOGIC"),
            (seq_b()[:-1], "B_LIFECYCLE"),
            (seq_c()[:-1], "C_UNIQUENESS"),
            (seq_d()[:-1], "D_INTEGRITY"),
            (seq_e()[:-1], "E_REFERENTIAL_INTEGRITY"),
        ]
        for events, cls in checks:
            with self.subTest(cls=cls):
                self.assertNotIn(cls, mod.evaluate_sequence(events)["confirmed_classes"])

    def test_a_requires_two_existing_distinct_parents_and_get_witness(self):
        bad = seq_a()
        bad[3] = ev("PATCH", "/api/dcim/devices/d1/", 200, {"site": {"id": "s1"}}, {"id": "d1", "site": {"id": "s1"}})
        self.assertNotIn("A_LOGIC", mod.evaluate_sequence(bad)["confirmed_classes"])

    def test_b_requires_multiple_children_before_delete(self):
        bad = [seq_b()[0], seq_b()[1], seq_b()[3], seq_b()[4]]
        self.assertNotIn("B_LIFECYCLE", mod.evaluate_sequence(bad)["confirmed_classes"])

    def test_d_accepts_stale_second_patch_as_witness(self):
        result = mod.evaluate_sequence(seq_d())
        self.assertIn("D_INTEGRITY", result["confirmed_classes"])
        self.assertEqual(result["witnesses"]["D_INTEGRITY"]["witness_source"], "stale_successful_patch_response")

    def test_e_successful_reuse_create_is_witness(self):
        result = mod.evaluate_sequence(seq_e())
        self.assertIn("E_REFERENTIAL_INTEGRITY", result["confirmed_classes"])
        self.assertEqual(result["witnesses"]["E_REFERENTIAL_INTEGRITY"]["witness_source"], "successful_create_response")

    def test_no_cross_sequence_stitching_in_official_union(self):
        a = seq_a()
        left, right = a[:4], a[4:]
        self.assertNotIn("A_LOGIC", mod.evaluate_sequence(left)["confirmed_classes"])
        self.assertNotIn("A_LOGIC", mod.evaluate_sequence(right)["confirmed_classes"])
        self.assertIn("A_LOGIC", mod.evaluate_sequence(left + right)["confirmed_classes"])

    def test_sequence_dir_union_is_class_union_not_event_stitch(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            for idx, events in enumerate([seq_a()[:4], seq_a()[4:], seq_c()], 1):
                p = root / f"s{idx}.jsonl"
                p.write_text("".join("MODEL_EVENT " + json.dumps(x) + "\n" for x in events), encoding="utf-8")
            per = [(n, mod.evaluate_sequence(e)) for n, e in mod.load_sequence_dir(root)]
            union = {c for _, r in per for c in r["confirmed_classes"]}
            self.assertNotIn("A_LOGIC", union)
            self.assertIn("C_UNIQUENESS", union)

    def test_hidden_ground_truth_is_parsed_but_not_an_http_witness(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "gt.jsonl"
            p.write_text(
                json.dumps({"kind": "fault_ground_truth", "class": "A_LOGIC"}) + "\n" +
                json.dumps({"kind": "fault_ground_truth", "class": "D_INTEGRITY"}) + "\n",
                encoding="utf-8",
            )
            gt = mod.summarize_ground_truth(mod.load_ground_truth(p))
            self.assertEqual(gt["triggered_classes"], ["A_LOGIC", "D_INTEGRITY"])
            self.assertEqual(mod.evaluate_sequence([])["confirmed_classes"], [])


if __name__ == "__main__":
    unittest.main()
