import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from provengo_sample_audit import audit, main, merge_batches, scenarios_from


class SampleAuditTests(unittest.TestCase):
    def test_audit_report_distinguishes_model_evidence_from_runtime(self):
        plan = {'oracles': [{'oracle_id':'same-field::firstName', 'kind':'same-field'},
                            {'oracle_id':'disjoint::firstName-lastName', 'kind':'disjoint'}]}
        sample = {'scenarios':[{'events':[
            {'name':'SBT:PrefixVerified'}, {'name':'SBT:ConcurrencyReady'},
            {'name':'SBT:EpochStarted', 'data':{'oracle_id':'same-field::firstName'}},
            {'name':'SBT:EpochFinished'}]}]}
        result = audit(sample, plan)
        self.assertEqual(result['sampled_oracle_kinds'], {'same-field':1})
        self.assertEqual(result['missing_oracle_ids'], ['disjoint::firstName-lastName'])
        self.assertEqual(result['actual_http_overlap'], 'NOT_MEASURED')
        self.assertEqual(result['oracle_verdicts'], 'NOT_EVALUATED')
        self.assertEqual(result['scenarios_with_complete_epoch_markers'], 1)

    def test_unknown_layout_fails_closed(self):
        with self.assertRaises(ValueError):
            scenarios_from({'unknown': []})

    def test_analyze_only_preserves_raw_file_and_creates_report(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            source=root/'samples.json'
            source.write_text(json.dumps([{'events':['SBT:PrefixVerified']}]))
            out=root/'out'
            self.assertEqual(main(['--project',str(root),'--out',str(out),
                                   '--analyze-only',str(source)]),0)
            self.assertEqual(json.loads((out/'sample-audit.json').read_text())['sampled_scenarios'],1)

    def test_batch_sample_merges_separate_files_and_sets_child_heap(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            (root/'project/config').mkdir(parents=True)
            (root/'project/config/provengo.yml').write_text('name: test')
            calls=[]
            def sample(command, **kwargs):
                calls.append((command,kwargs['env']))
                file=Path(command[command.index('-o')+1])
                file.write_text(json.dumps([{'events':[{'name':f'SBT:batch-{len(calls)}'}]}]))
                return type('Result',(),{'returncode':0})()
            with patch('provengo_sample_audit.shutil.which',return_value='provengo'),\
                 patch('provengo_sample_audit.subprocess.run',side_effect=sample):
                code=main(['--project',str(root/'project'),'--out',str(root/'out'),
                           '--size','2','--batch-size','1','--java-heap-mb','1024'])
            self.assertEqual(code,0)
            self.assertEqual(len(calls),2)
            self.assertIn('--overwrite',calls[0][0])
            self.assertIn('--overwrite',calls[1][0])
            self.assertNotEqual(calls[0][0][calls[0][0].index('-o')+1],
                                calls[1][0][calls[1][0].index('-o')+1])
            self.assertIn('-Xmx1024m',calls[1][1]['JAVA_TOOL_OPTIONS'])
            self.assertEqual(json.loads((root/'out/samples.json').read_text()),
                             [{'events':[{'name':'SBT:batch-1'}]},
                              {'events':[{'name':'SBT:batch-2'}]}])
            self.assertEqual(json.loads((root/'out/invocation.json').read_text())['merged_batch_counts'],[1,1])

    def test_merge_rejects_missing_scenarios_without_writing_ensemble_source(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            first=root/'first.json'
            first.write_text(json.dumps({'scenarios':[{'events':['one']}] }))
            with self.assertRaisesRegex(ValueError,'merged 1 scenarios, requested 2'):
                merge_batches([first], root/'samples.json', 2)
            self.assertFalse((root/'samples.json').exists())

    def test_merge_preserves_container_and_order(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            paths=[root/'a.json',root/'b.json']
            for i,path in enumerate(paths):
                path.write_text(json.dumps({'runs':[{'events':[f'round{i}']}], 'version':1}))
            self.assertEqual(merge_batches(paths,root/'samples.json',2),[1,1])
            self.assertEqual([x['events'][0] for x in json.loads((root/'samples.json').read_text())['runs']],
                             ['round0','round1'])

if __name__ == '__main__':
    unittest.main()
