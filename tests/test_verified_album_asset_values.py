"""Real prerequisite values must enter generated Provengo actions deliberately."""
import sys
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'generator_baseline'))
sys.path.insert(0, str(ROOT / 'scripts'))
from openapi_to_sbt.pipeline import run_pipeline
from immich_asset_fixture import multipart_asset
from run_immich_generated_pilot import album_asset_add_witness


class VerifiedAlbumAssetValues(unittest.TestCase):
    def setUp(self):
        self.kwargs = dict(openapi_path=str(ROOT / 'model/immich/immich-v3.2.0-openapi.json'),
                           name='immich', base_url='http://127.0.0.1:9926/api',
                           seed=20261501, instances_per_entity=2, instances_per_action=2,
                           story_profile='long-interleaving', long_rounds=(7, 10))

    def test_only_selected_action_consumes_fixture_and_default_remains_distinct(self):
        reference = run_pipeline(**self.kwargs).stories_js
        value = 'b031141d-2ab9-457f-8356-a07e8b90a749'
        explored = run_pipeline(**self.kwargs,
            verified_values={'addAssetsToAlbum': {'ids': [value]}}).stories_js
        start = explored.index('bthread("action:addAssetsToAlbum:1:1"')
        end = explored.index('\n\n', start)
        self.assertIn('let ids = ["' + value + '"]', explored[start:end])
        self.assertNotIn(value, reference)
        self.assertEqual(explored.count(value), 2)

    def test_rejects_unknown_operations_and_wrong_field_shape(self):
        for values in ({'unknownAction': {'ids': ['x']}},
                       {'addAssetsToAlbum': {'id': ['x']}},
                       {'addAssetsToAlbum': {'ids': []}}):
            with self.subTest(values=values), self.assertRaises(ValueError):
                run_pipeline(**self.kwargs, verified_values=values)

    def test_fixture_is_multipart_with_real_png_bytes(self):
        data, media = multipart_asset((1, 2, 3), 'fixture.png')
        self.assertTrue(media.startswith('multipart/form-data; boundary='))
        self.assertIn(b'\x89PNG\r\n\x1a\n', data)
        self.assertIn(b'name="assetData"; filename="fixture.png"', data)

    def test_witness_ignores_adapter_calls_and_requires_successful_id(self):
        asset_id = 'b031141d-2ab9-457f-8356-a07e8b90a749'
        valid = {'method': 'PUT', 'model_path': '/albums/abc/assets',
                 'epoch_id': None, 'operation_id': None, 'request': {'ids': [asset_id]},
                 'response': [{'id': asset_id, 'success': True}], 'status': 200}
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'http-trace.jsonl'
            rows = [{**valid, 'epoch_id': 'unrelated-adapter'},
                    {**valid, 'response': [{'id': asset_id, 'success': False}]},
                    valid]
            path.write_text(''.join(json.dumps(row) + '\n' for row in rows), encoding='utf-8')
            witness = album_asset_add_witness(path, asset_id)
            self.assertEqual(witness['successful_generated_calls'], 1)


if __name__ == '__main__':
    unittest.main()
