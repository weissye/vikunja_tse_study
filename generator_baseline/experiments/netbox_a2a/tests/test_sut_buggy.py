import importlib.util
import json
import os
import sys
import tempfile
import types
import unittest
from pathlib import Path


class _Req:
    method = "GET"
    path = "/"
    _json = None
    @classmethod
    def get_json(cls, silent=True):
        return cls._json


class _Logger:
    def info(self, *args, **kwargs):
        pass


class _App:
    def __init__(self, *args, **kwargs):
        self.logger = _Logger()
    def route(self, *args, **kwargs):
        return lambda fn: fn
    def after_request(self, fn):
        return fn
    def run(self, *args, **kwargs):
        pass


fake_flask = types.ModuleType("flask")
fake_flask.Flask = _App
fake_flask.jsonify = lambda x=None, **kw: x if x is not None else kw
fake_flask.request = _Req
sys.modules.setdefault("flask", fake_flask)

MODULE_PATH = Path(__file__).resolve().parents[3] / "resources" / "development_kit" / "validation_only" / "suts" / "netbox" / "netbox_sut_buggy.py"
spec = importlib.util.spec_from_file_location("v35_sut", MODULE_PATH)
sut = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sut)


class TestV35IntermediateFaultSut(unittest.TestCase):
    def setUp(self):
        sut.reset_state("buggy")

    def call(self, method, path, body=None):
        sut.request.method = method
        sut.request.path = "/" + path.strip("/")
        sut.request._json = body
        result = sut.api(path.strip("/"))
        if isinstance(result, tuple):
            payload, status = result[0], result[1]
        else:
            payload, status = result, 200
        return status, payload

    def post(self, p, b):
        return self.call("POST", p, b)
    def patch(self, p, b):
        return self.call("PATCH", p, b)
    def get(self, p):
        return self.call("GET", p)
    def delete(self, p):
        return self.call("DELETE", p)

    def mk_site(self, n):
        status, body = self.post("/api/dcim/sites/", {"name": n, "slug": n})
        self.assertEqual(status, 201)
        return body["id"]

    def mk_device(self, n, sid):
        status, body = self.post("/api/dcim/devices/", {"name": n, "site": {"id": sid}})
        self.assertEqual(status, 201)
        return body["id"]

    def marker_classes(self):
        return [x["class"] for x in sut.state.fault_markers]

    def test_a_first_valid_reassignment_is_lost_and_marked(self):
        a, b = [self.mk_site(x) for x in ("a", "b")]
        d = self.mk_device("d", a)
        status, response = self.patch(f"/api/dcim/devices/{d}/", {"site": {"id": b}})
        self.assertEqual(status, 200)
        self.assertEqual(response["site"]["id"], a)
        self.assertEqual(self.get(f"/api/dcim/devices/{d}/")[1]["site"]["id"], a)
        self.assertIn("A_LOGIC", self.marker_classes())
        self.assertNotIn("fault_marker", response)

    def test_b_two_children_delete_leaves_child_and_is_marked(self):
        p = self.mk_site("p")
        d1 = self.mk_device("d1", p)
        self.mk_device("d2", p)
        self.assertEqual(self.delete(f"/api/dcim/sites/{p}/")[0], 204)
        self.assertEqual(self.get(f"/api/dcim/devices/{d1}/")[0], 200)
        self.assertIn("B_LIFECYCLE", self.marker_classes())

    def test_b_one_child_is_not_activated(self):
        p = self.mk_site("p")
        d1 = self.mk_device("d1", p)
        self.assertEqual(self.delete(f"/api/dcim/sites/{p}/")[0], 204)
        self.assertEqual(self.get(f"/api/dcim/devices/{d1}/")[0], 404)
        self.assertNotIn("B_LIFECYCLE", self.marker_classes())

    def test_c_duplicate_is_accepted_and_marked(self):
        self.assertEqual(self.post("/api/dcim/sites/", {"name": "x", "slug": "dup"})[0], 201)
        status, response = self.post("/api/dcim/sites/", {"name": "y", "slug": "dup"})
        self.assertEqual(status, 201)
        self.assertIn("C_UNIQUENESS", self.marker_classes())
        self.assertNotIn("fault_marker", response)

    def test_d_second_update_after_verification_is_lost_and_marked(self):
        _, r = self.post("/api/circuits/circuits/", {"cid": "c", "description": "x"})
        cid = r["id"]
        self.assertEqual(self.patch(f"/api/circuits/circuits/{cid}/", {"description": "y"})[1]["description"], "y")
        self.assertEqual(self.get(f"/api/circuits/circuits/{cid}/")[1]["description"], "y")
        status, response = self.patch(f"/api/circuits/circuits/{cid}/", {"description": "z"})
        self.assertEqual(status, 200)
        self.assertEqual(response["description"], "y")
        self.assertIn("D_INTEGRITY", self.marker_classes())

    def test_e_deleted_parent_reuse_is_accepted_and_marked(self):
        p = self.mk_site("p")
        self.mk_device("old", p)
        self.assertEqual(self.delete(f"/api/dcim/sites/{p}/")[0], 204)
        status, response = self.post("/api/dcim/devices/", {"name": "new", "site": {"id": p}})
        self.assertEqual(status, 201)
        self.assertEqual(response["site"]["id"], p)
        self.assertIn("E_REFERENTIAL_INTEGRITY", self.marker_classes())

    def test_hidden_marker_file_is_server_side_jsonl_only(self):
        with tempfile.TemporaryDirectory() as td:
            gt = Path(td) / "ground_truth.jsonl"
            old = os.environ.get("NETBOX_V35_GROUND_TRUTH_LOG")
            os.environ["NETBOX_V35_GROUND_TRUTH_LOG"] = str(gt)
            try:
                self.post("/api/dcim/sites/", {"name": "x", "slug": "dup"})
                status, response = self.post("/api/dcim/sites/", {"name": "y", "slug": "dup"})
            finally:
                if old is None:
                    os.environ.pop("NETBOX_V35_GROUND_TRUTH_LOG", None)
                else:
                    os.environ["NETBOX_V35_GROUND_TRUTH_LOG"] = old
            self.assertEqual(status, 201)
            self.assertNotIn("fault_ground_truth", json.dumps(response))
            self.assertTrue(gt.exists())
            marker = json.loads(gt.read_text(encoding="utf-8").strip().splitlines()[-1])
            self.assertEqual(marker["class"], "C_UNIQUENESS")
            self.assertEqual(marker["kind"], "fault_ground_truth")

    def test_correct_variant_repairs_all_five_and_emits_no_markers(self):
        sut.reset_state("correct")
        a, b = [self.mk_site(x) for x in ("a", "b")]
        d = self.mk_device("d", a)
        self.assertEqual(self.patch(f"/api/dcim/devices/{d}/", {"site": {"id": b}})[1]["site"]["id"], b)

        p = self.mk_site("p")
        d1 = self.mk_device("d1", p)
        self.mk_device("d2", p)
        self.assertEqual(self.delete(f"/api/dcim/sites/{p}/")[0], 204)
        self.assertEqual(self.get(f"/api/dcim/devices/{d1}/")[0], 404)

        self.assertEqual(self.post("/api/dcim/sites/", {"name": "u1", "slug": "dup"})[0], 201)
        self.assertEqual(self.post("/api/dcim/sites/", {"name": "u2", "slug": "dup"})[0], 409)

        _, r = self.post("/api/circuits/circuits/", {"cid": "c", "description": "x"})
        cid = r["id"]
        self.assertEqual(self.patch(f"/api/circuits/circuits/{cid}/", {"description": "y"})[1]["description"], "y")
        self.get(f"/api/circuits/circuits/{cid}/")
        self.assertEqual(self.patch(f"/api/circuits/circuits/{cid}/", {"description": "z"})[1]["description"], "z")

        q = self.mk_site("q")
        self.mk_device("old-q", q)
        self.delete(f"/api/dcim/sites/{q}/")
        self.assertEqual(self.post("/api/dcim/devices/", {"name": "bad", "site": {"id": q}})[0], 400)
        self.assertEqual(sut.state.fault_markers, [])


if __name__ == "__main__":
    unittest.main()
