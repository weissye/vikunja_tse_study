import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/archive_sample_batch.py'
spec = importlib.util.spec_from_file_location('sample_archive', SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ArchiveTest(unittest.TestCase):
    def test_raw_sample_removed_only_after_audited_archive(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            samples, audit, result = (root / 'samples.json', root / 'audit.json', root / 'batch.zip')
            samples.write_text(json.dumps([['test'] for _ in range(50)]))
            audit.write_text(json.dumps({'scenarios': 50, 'complete_rest_schedules': 50}))
            module.archive(samples, audit, result)
            self.assertFalse(samples.exists())
            with zipfile.ZipFile(result) as z:
                self.assertEqual(len(json.loads(z.read('samples-50.json'))), 50)


if __name__ == '__main__':
    unittest.main()
