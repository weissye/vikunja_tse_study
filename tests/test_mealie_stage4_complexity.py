import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from run_mealie_stage4 import evaluated_complexity, prefix_coverage


class ComplexityTests(unittest.TestCase):
    def test_prefix_gate_requires_matching_operation_not_just_long_story(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            (folder / 'stories.mealie.js').write_text(
                'sync({request:Event("SBT:PrefixVerified",'
                '{path:p,round:__round,operation_id:"updateRecipe"})});\n',
                encoding='utf-8')
            plan = {'oracles': [
                {'oracle_id': 'recipe', 'operation_id': 'updateRecipe',
                 'runtime': {'ready': True}},
                {'oracle_id': 'shopping', 'operation_id': 'updateShoppingList',
                 'runtime': {'ready': True}},
            ]}
            coverage = prefix_coverage(folder, plan)
            self.assertEqual(coverage['matched_oracles'], ['recipe'])
            self.assertEqual(coverage['unmatched_oracles'], ['shopping'])

    def test_complexity_count_requires_evaluated_witness(self):
        outcome = evaluated_complexity({'witnesses': [
            {'epoch_id': 'e1', 'result': 'PASS', 'prefix_evidence':
             {'rounds': 10, 'last_verified_utc': '2026-09-27T00:00:00+00:00'}},
            {'epoch_id': 'e2', 'result': 'INCONCLUSIVE', 'prefix_evidence': {'round': 4}},
            {'result': 'PASS'},
        ]})
        self.assertEqual(outcome, {'concurrency_evaluated': 1,
                                   'prefix_verified_epochs': 1,
                                   'max_prefix_rounds': 10})


if __name__ == '__main__':
    unittest.main()
