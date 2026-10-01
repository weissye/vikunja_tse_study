"""Schema-only regression checks for the generator corrections."""
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "generator_baseline"))

from openapi_to_sbt.inference.values import generate_value
from openapi_to_sbt.render.stories_js import _requires_unavailable_binary_transport
from openapi_to_sbt.parsing.model import RequestBody, RequestBodyVariant


class ContractFixTests(unittest.TestCase):
    def test_uuid_pattern_v4_and_unconstrained_backwards_compatibility(self):
        schema = {"type": "string", "format": "uuid", "pattern":
                  r"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$"}
        for seed in (1, 20261401, 20261402):
            value = generate_value(schema, seed, "action.ids[0]")
            self.assertRegex(value, re.compile(schema["pattern"]))
            self.assertEqual(value, generate_value(schema, seed, "action.ids[0]"))
        import hashlib
        h = hashlib.sha256(b"1:action.ids[0]").hexdigest()
        self.assertEqual(generate_value({"type": "string", "format": "uuid"}, 1, "action.ids[0]"),
                         f"{h[:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:32]}")

    def test_binary_transport_gap_does_not_spread_to_json(self):
        from types import SimpleNamespace
        binary = SimpleNamespace(op=SimpleNamespace(
            request_body=RequestBody(variants=[RequestBodyVariant(
                media_type="multipart/form-data", schema={"type": "object", "properties": {
                    "data": {"type": "string", "format": "binary"}}})]), method="POST"))
        self.assertTrue(_requires_unavailable_binary_transport(binary))
        ordinary = SimpleNamespace(op=SimpleNamespace(
            request_body=RequestBody(variants=[RequestBodyVariant(
                media_type="application/json", schema={"type": "object", "properties": {
                    "data": {"type": "string"}}})]), method="POST"))
        self.assertFalse(_requires_unavailable_binary_transport(ordinary))


if __name__ == "__main__":
    unittest.main()
