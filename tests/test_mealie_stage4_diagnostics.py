import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from collect_mealie_stage4_diagnostics import collect


class DiagnosticsTests(unittest.TestCase):
    def test_preserved_log_samples_and_redacts(self):
        with tempfile.TemporaryDirectory() as temp:
            run = Path(temp) / 'research-fit-mealie-stage4-test'
            seed = run / 'seed-1'
            seed.mkdir(parents=True)
            (run / 'campaign.json').write_text(json.dumps({'state': 'INCOMPLETE', 'error': 'Provengo failed'}))
            (seed / 'summary.json').write_text(json.dumps({'provengo_exit': 2}))
            (seed / 'provengo-run.log').write_text('start\nSyntaxError: bad script\nBearer abc.def.ghi\nemail person@example.org\n')
            result = collect(run)
            s = json.dumps(result)
            self.assertIn('SyntaxError: bad script', s)
            self.assertNotIn('abc.def.ghi', s)
            self.assertNotIn('person@example.org', s)
            self.assertEqual(result['summaries'][0]['provengo_exit'], 2)


if __name__ == '__main__':
    unittest.main()
