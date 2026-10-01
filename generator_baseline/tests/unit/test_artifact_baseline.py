import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]

def load_script(name):
    p=ROOT/'scripts'/name
    spec=importlib.util.spec_from_file_location(name.replace('.','_'),p)
    mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod

class TestArtifactBaseline(unittest.TestCase):
    def test_netbox_a2a_source_inventory_is_five(self):
        audit=load_script('audit_netbox_fault_inventory.py')
        r=audit.audit(ROOT/'resources/development_kit/validation_only/suts/netbox/netbox_sut_buggy.py')
        self.assertTrue(r['ok']); self.assertEqual(r['fault_count'],5)
        self.assertEqual(r['source_fault_mechanism_count'],5)
        self.assertEqual(r['semantic_fault_class_count'],5)
        self.assertEqual(set(r['checks']),{'A_LOGIC','B_LIFECYCLE','C_UNIQUENESS','D_INTEGRITY','E_REFERENTIAL_INTEGRITY'})

    def test_netbox_evaluator_confirms_only_class_specific_evidence(self):
        ev=load_script('evaluate_netbox_trace.py')
        events=[
          {'method':'POST','path':'/api/extras/config-templates/','status':201,'body':{},'response':{'id':'id_1','status':'draft'}},
          {'method':'DELETE','path':'/api/extras/config-templates/id_1','status':404,'body':None,'response':{'detail':'Deletion recorded.'}},
          {'method':'GET','path':'/api/extras/config-templates/id_1','status':200,'body':None,'response':{'id':'id_1','status':'draft'}},
          {'method':'POST','path':'/api/circuits/circuits/','status':201,'body':{'status':'planned'},'response':{'id':'id_2','status':'planned'}},
          {'method':'PATCH','path':'/api/circuits/circuits/id_2','status':200,'body':{'status':'active'},'response':{'id':'id_2','status':'planned'}},
        ]
        r=ev.evaluate(events)
        self.assertEqual(r['fault_inventory_count'],2)
        self.assertEqual(r['confirmed_fault_count'],2)
        self.assertTrue(r['all_seeded_faults_confirmed'])

    def test_netbox_evaluator_does_not_count_generic_404(self):
        ev=load_script('evaluate_netbox_trace.py')
        r=ev.evaluate([{'method':'DELETE','path':'/x/id_1','status':404,'response':{'detail':'Not found.'}}])
        self.assertEqual(r['confirmed_fault_count'],0)

    def test_manifest_matches_five_a2a_faults(self):
        data=json.loads((ROOT/'sut_identity_manifest.json').read_text(encoding='utf-8'))
        inv=data['fault_inventory']['netbox/netbox_sut_buggy.py']
        self.assertEqual(inv['source_fault_mechanism_count'],5)
        self.assertEqual(inv['semantic_fault_class_count'],5)
        expected=['A_LOGIC','B_LIFECYCLE','C_UNIQUENESS','D_INTEGRITY','E_REFERENTIAL_INTEGRITY']
        self.assertEqual([x['id'] for x in inv['faults']],expected)
        self.assertEqual([x['id'] for x in inv['semantic_classes']],expected)

    def test_runner_uses_isolated_ports_and_unique_run_id(self):
        text=(ROOT/'scripts/Invoke-GeneratedModel-Provengo.ps1').read_text(encoding='utf-8')
        self.assertIn('run_flask_sut.py',text)
        self.assertIn('"--listen-port", "0"',text)
        self.assertIn('[Guid]::NewGuid()',text)
        self.assertNotIn('$proxyPort = [int]$cfg.port + 10000',text)

    def test_a2a_runner_uses_shared_http_proxy_and_shared_evaluator(self):
        text=(ROOT/'experiments/netbox_a2a/Invoke-NetBox-A2A.ps1').read_text(encoding='utf-8')
        for needle in ['http_trace_proxy.py','evaluate_netbox_a2a_trace.py','ProvengoComplex','ProvengoBasic','RESTler','EvoMaster']:
            self.assertIn(needle,text)
        protocol=(ROOT/'experiments/netbox_a2a/A2A_PROTOCOL.md').read_text(encoding='utf-8')
        self.assertIn('measurement parity',protocol.lower())
        self.assertIn('same openapi information boundary',protocol.lower())
        self.assertIn('no fault trigger',protocol.lower())

    def test_garage_multi_instance_is_stable_across_python_hash_seeds(self):
        import os, subprocess, sys
        with tempfile.TemporaryDirectory() as td:
            td=Path(td)
            spec=ROOT/'resources/development_kit/examples/garage/openapi.json'
            outputs=[]
            for hs in ('1','987654'):
                out=td/f'out_{hs}'
                env=os.environ.copy(); env['PYTHONHASHSEED']=hs; env['PYTHONPATH']=str(ROOT)
                cmd=[sys.executable,'-m','openapi_to_sbt','generate','--openapi',str(spec),
                     '--output',str(out),'--name','garage','--base-url','http://127.0.0.1:5000',
                     '--seed','1','--instances-per-entity','5','--instances-per-action','7','--force']
                cp=subprocess.run(cmd,cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
                self.assertEqual(cp.returncode,0,cp.stdout)
                outputs.append((out/'stories.garage.js').read_bytes())
            self.assertEqual(outputs[0],outputs[1])

if __name__=='__main__': unittest.main()
