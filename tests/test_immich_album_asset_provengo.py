"""Focused checks for the generated-interface / Provengo handoff."""
import random
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for directory in (ROOT / "generator_baseline", ROOT / "scripts"):
    if not directory.is_dir():
        raise RuntimeError("Required project directory missing: " + str(directory))
    sys.path.insert(0, str(directory))

from run_immich_album_asset_provengo import generated_album_call, provengo_story, selected_marker


class ProvengoHandoffTests(unittest.TestCase):
    def test_generated_id_position_and_epoch_operations(self):
        interface = "function getAlbumInfo(albumName, id, slug) { return {code:200}; }"
        story = provengo_story(interface, "epoch-7", "/albums/album-7/assets",
                               "asset-A", "asset-B", 5981, random.Random(7))
        self.assertIn('getAlbumInfo(undefined, "album-7", undefined)', story)
        self.assertIn('SBT:AlbumAssetEpochClosed', story)
        self.assertIn("'X-Provengo-Operation-Id':\"epoch-7-observe\"", story)
        self.assertIn('"method": "DELETE"', story)
        self.assertIn('"method": "PUT"', story)
        self.assertIn('"ids": ["asset-A"]', story)
        self.assertIn('"ids": ["asset-B"]', story)
        with self.assertRaises(ValueError):
            generated_album_call("function getAlbumInfo(name) {}", "album-7")

    def test_selection_log_only_accepts_actual_selected_event_and_id(self):
        marker = "SBT:AlbumAssetEpochClosed"
        self.assertFalse(selected_marker('Request: [SBT:AlbumAssetEpochClosed {epoch_id:"epoch-7"}]', marker, 'epoch-7'))
        self.assertFalse(selected_marker('Selected: [SBT:AlbumAssetEpochClosed {epoch_id:"other"}]', marker, 'epoch-7'))
        self.assertTrue(selected_marker('10:02 INFO [RUN>random] Selected: [SBT:AlbumAssetEpochClosed {epoch_id:"epoch-7"}]', marker, 'epoch-7'))


if __name__ == "__main__":
    unittest.main()
