"""Check witness gating and the upload payload, without requiring a live server."""
import importlib.util
import struct
import sys
import unittest
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT
while PROJECT != PROJECT.parent and not (PROJECT / "work/immich_live_patch/scripts/run_immich_album_serial.py").exists() and not (PROJECT / "scripts/run_immich_album_serial.py").exists():
    PROJECT = PROJECT.parent
sys.path.insert(0, str(PROJECT / "work/immich_live_patch/scripts"))
sys.path.insert(0, str(PROJECT / "freeze_smoke/generator_baseline"))
sys.path.insert(0, str(PROJECT / "scripts"))
sys.path.insert(0, str(PROJECT / "generator_baseline"))
spec = importlib.util.spec_from_file_location("album_asset_pilot", ROOT / "scripts/run_immich_album_asset.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class PilotTests(unittest.TestCase):
    def test_png_is_decodable_and_distinct(self):
        a, b = mod.png_bytes((10, 20, 30)), mod.png_bytes((30, 20, 10))
        self.assertNotEqual(a, b)
        self.assertTrue(a.startswith(b"\x89PNG\r\n\x1a\n"))
        size = struct.unpack(">I", a[8:12])[0]
        self.assertEqual(a[12:16], b"IHDR")
        self.assertEqual(a[16:24], struct.pack(">II", 16, 16))
        self.assertEqual(zlib.crc32(a[12:16] + a[16:16+size]) & 0xffffffff,
                         struct.unpack(">I", a[16+size:20+size])[0])

    def test_oracle_only_flags_stable_disjoint_loss(self):
        a, b = "a", "b"
        def ack(x):
            return {"status": 200, "body": [{"id": x, "success": True}]}
        operations = [{"method": "DELETE", "result": ack(a)}, {"method": "PUT", "result": ack(b)}]
        trace = [{"method": x["method"], "status": 200, "response": x["result"]["body"]}
                 for x in operations]
        epoch = {"all_workers_ready_before_release": True, "operations": operations}
        correct = {"members": {b}, "asset_count": 1}
        lost = {"members": set(), "asset_count": 0}
        self.assertEqual(mod.classify(epoch, True, trace, correct, correct, a, b)[0], "PASS")
        self.assertEqual(mod.classify(epoch, True, trace, lost, lost, a, b)[0], "SEMANTIC_CANDIDATE")
        self.assertEqual(mod.classify(epoch, True, trace, lost, correct, a, b)[0], "INCONCLUSIVE")
        self.assertEqual(mod.classify(epoch, True, trace, {"members": {b}, "asset_count": 0},
                                      {"members": {b}, "asset_count": 0}, a, b)[0], "INCONCLUSIVE")
        self.assertEqual(mod.classify(epoch, False, trace, lost, lost, a, b)[0], "INCONCLUSIVE")


if __name__ == "__main__":
    unittest.main()
