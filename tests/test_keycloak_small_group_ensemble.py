import io
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from split_keycloak_sample_groups import split
from merge_keycloak_group_selections import merge


class SmallGroupTest(unittest.TestCase):
    def test_split_preserves_original_scenarios(self):
        originals = [[{'name': 'REST', 'data': {'url': 'a\\\\"},b', 'n': i}},
                      {'name': 'SBT:RaceStart', 'data': {'instance': i % 3}}]
                     for i in range(50)]
        raw = json.dumps(originals, separators=(',', ':')).encode('utf-8')
        with tempfile.TemporaryDirectory() as tmp:
            files = split(io.BytesIO(raw), Path(tmp), 'batch-1')
            self.assertEqual(len(files), 5)
            self.assertEqual([e for p in files for e in json.loads(p.read_text())], originals)

    def test_merge_five_pairs(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            paths = []
            for i in range(5):
                path = root / f'selected-{i}.json'
                path.write_text(json.dumps([[{'name': i}], [{'name': -i}]]))
                paths.append(path)
            output = root / 'batch-selected-10.json'
            merge(paths, output)
            self.assertEqual(len(json.loads(output.read_text())), 10)


if __name__ == '__main__':
    unittest.main()
