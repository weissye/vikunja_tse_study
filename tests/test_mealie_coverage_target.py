"""Replay real preserved evidence through the new coverage gate."""
import copy
import json
import sys
import unittest
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE / 'generator_baseline'))
sys.path.insert(0, str(HERE / 'scripts'))
from mealie_coverage_target import classify


class TargetCoverageReplay(unittest.TestCase):
    def setUp(self):
        root = HERE
        candidates = [p for p in (
            root / 'upload/research-fit-mealie-stage4-20260927_124625_208-review.zip',
            root / 'evidence/research-fit-mealie-stage4-20260927_124625_208-review.zip',
            root.parents[1] / 'upload/research-fit-mealie-stage4-20260927_124625_208-review.zip')
            if p.exists()]
        if not candidates:
            self.skipTest('Reference live evidence ZIP not present in offline test workspace')
        with zipfile.ZipFile(candidates[0]) as archive:
            prefix = 'seed-20261843/'
            self.plan = json.loads(archive.read(prefix + 'generated/concurrency-plan.mealie.json'))
            self.evaluation = json.loads(archive.read(prefix + 'generated-verifier-evaluation.json'))
            self.epochs = [json.loads(line) for line in archive.read(
                prefix + 'concurrent-epochs.jsonl').decode('utf-8').splitlines() if line.strip()]
        self.oracle = 'concurrency::disjoint-put::update_one_api_households_mealplans_rules__item_id__put'

    def test_preserved_fresh_witness_qualifies(self):
        report = classify(self.plan, self.evaluation, self.epochs, self.oracle, 8)
        self.assertEqual(report['state'], 'VERIFIED_PREFIX_AND_ORACLE_COVERAGE')
        self.assertEqual(report['verdicts']['VIOLATED'], 1)

    def test_nonoverlapping_or_unverified_prefix_cannot_qualify(self):
        epochs = copy.deepcopy(self.epochs)
        selected = next(e for e in epochs if e.get('epoch_id') == 'generated-epoch-0')
        selected['operations'][1]['started_utc'] = selected['operations'][0]['ended_utc']
        self.assertEqual(classify(self.plan, self.evaluation, epochs, self.oracle, 8)['state'],
                         'NO_REAL_OVERLAP')
        evaluation = copy.deepcopy(self.evaluation)
        for witness in evaluation['witnesses']:
            if witness.get('oracle_id') == self.oracle:
                witness['prefix_evidence'] = {}
        self.assertEqual(classify(self.plan, evaluation, self.epochs, self.oracle, 8)['state'],
                         'PREFIX_OR_ORACLE_INCONCLUSIVE')


if __name__ == '__main__':
    unittest.main()
