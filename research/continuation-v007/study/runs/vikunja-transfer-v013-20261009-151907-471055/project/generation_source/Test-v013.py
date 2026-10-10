import importlib.util,json,pathlib,tempfile,unittest
from prepare_v013 import prepare
from generator_v56.transfer_stage5_v013 import write_full_package
ROOT=pathlib.Path(__file__).resolve().parent
RAW=(ROOT/'live-contract-v013.json').read_bytes()
class Tests(unittest.TestCase):
    def test_dedup(self):
        _,_,_,s,g=prepare(RAW)
        self.assertEqual(len(s['plans']),32)
        self.assertEqual(len(s['duplicates_removed']),8)
        self.assertEqual(len(s['trial_queue']),320)
        self.assertEqual(g['node_count'],16)
        self.assertEqual(len({n['resource'] for n in g['nodes']}),4)
    def test_depths(self):
        for i in (1,2):
            for depth in (0,1,3,6):
                *_,g=prepare(RAW,i,depth)
                self.assertEqual(g['node_count'],4*i*(4+2*depth))
                pos={n:k for k,n in enumerate(g['schedules'][0]['order'])}
                for n in g['nodes']:self.assertTrue(all(pos[d]<pos[n['id']] for d in n['depends_on']))
    def test_subset_parent_closure(self):
        *_,g=prepare(RAW,candidate='RESOURCE:task')
        self.assertEqual(g['node_count'],8)
        self.assertEqual({n['resource'] for n in g['nodes']},{'project','task'})
    def test_invalid_config(self):
        for kwargs in ({'depth':2},{'instances':3},{'seed':0},{'candidate':'RESOURCE:unknown'}):
            with self.assertRaises(ValueError):prepare(RAW,**kwargs)
    def test_override_and_parent_checks(self):
        doc,cat,rules,s,g=prepare(RAW)
        with tempfile.TemporaryDirectory() as td:
            report=write_full_package(g,rules,doc,'http://127.0.0.1:3456/api/v1',pathlib.Path(td)/'project','test')
            labels=[x for x in report['steps'] if x['source_method']=='PUT' and 'labels/@' in x['path']]
            self.assertEqual(len(labels),1);self.assertEqual(labels[0]['method'],'POST')
            self.assertEqual(report['parent_readback_obligations'],2)
            self.assertEqual(len(report['steps']),16)
            self.assertTrue((pathlib.Path(td)/'project/generation_source/prepare_v013.py').is_file())
if __name__=='__main__':unittest.main()
