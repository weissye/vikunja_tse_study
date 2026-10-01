"""Check generated cross-method evidence and conservative readiness."""
import sys
import json
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'generator_baseline'))
from openapi_to_sbt.parsing.loader import load_and_resolve, load_raw
from openapi_to_sbt.parsing.normalize import normalize
from openapi_to_sbt.cross_method import discover, empirical_update_delete
from openapi_to_sbt.render.verification_js import _empirical_update_delete, render_verification_js
from openapi_to_sbt.verification_cli import order_empirical_oracles_by_dependencies


class CrossMethodDiscoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        path = ROOT / 'model/immich/immich-v3.2.0-openapi.json'
        resolved, _ = load_and_resolve(str(path))
        cls.doc = normalize(resolved, load_raw(str(path)))

    def test_relation_candidates_do_not_claim_unproved_membership(self):
        candidates = discover(self.doc)
        relation = next(x for x in candidates if x['operation_ids'] ==
                        ['addAssetsToAlbum', 'removeAssetFromAlbum'])
        self.assertEqual(relation['body_array_key'], 'ids')
        self.assertFalse(relation['runtime_ready'])
        self.assertIn('membership-read', relation['limitation'])

    def test_executable_families_require_three_created_items(self):
        ready = empirical_update_delete(self.doc)
        self.assertEqual({x['operation_id'] for x in ready},
                         {'updateAlbumInfo', 'updateSharedLink'})
        self.assertTrue(all(x['runtime']['required_isolated_created_resources'] == 3
                            for x in ready))

    def test_generated_history_waits_for_verified_instances(self):
        oracle = next(x for x in empirical_update_delete(self.doc)
                      if x['operation_id'] == 'updateAlbumInfo')
        oracle['runtime']['instance_ready_label'] = 'AlbumResponseDtos'
        rendered = '\n'.join(_empirical_update_delete(oracle, 0))
        self.assertIn('EventSet("Cross-method verified instance"', rendered)
        self.assertIn('!__readyByName[e.name]', rendered)
        self.assertIn('__sbtReadPath(__ready,"id")', rendered)
        self.assertNotIn('__sbtCreateEvent(', rendered)

    def test_delete_controls_run_before_admission_and_are_not_blocked(self):
        oracle = next(x for x in empirical_update_delete(self.doc)
                      if x['operation_id'] == 'updateAlbumInfo')
        oracle['runtime']['instance_ready_label'] = 'AlbumResponseDtos'
        derived = {'counts': {}, 'concurrency_oracles': [oracle],
                   'contract_oracles': [{'operation_id': 'createAlbum', 'success_statuses': [201]}]}
        rendered = render_verification_js(derived, 'immich')
        self.assertLess(rendered.index('svc.delete(__cp'),
                        rendered.index('sync({request:Event("SBT:ConcurrencyReady:0"'))
        self.assertIn('var __readyEvent=sync({waitFor:__sbtAnyConcurrencyReady()});', rendered)
        self.assertIn('return __sbtAnyConcurrencyReady();', rendered)
        self.assertNotIn('block:__sbtAnyHttpDelete()', rendered)

    def test_openapi_dependency_orders_child_before_parent_deletion(self):
        ready = empirical_update_delete(self.doc)
        by_operation = {item['operation_id']: item for item in ready}
        graph = {'edges': [{'source': 'shared-links', 'target': 'albums', 'confidence': .9}]}
        order_empirical_oracles_by_dependencies(ready, graph)
        album = by_operation['updateAlbumInfo']
        shared = by_operation['updateSharedLink']
        album['runtime']['instance_ready_label'] = 'AlbumResponseDtos'
        child_index = ready.index(shared)
        self.assertEqual(album['runtime']['wait_for_closed_oracles'], [child_index])
        self.assertNotIn('wait_for_closed_oracles', shared['runtime'])
        js = '\n'.join(_empirical_update_delete(album, ready.index(album)))
        self.assertIn('"SBT:ConcurrencyClosed:"+__children[__k]', js)
        self.assertIn('"SBT:EmpiricalDependencyReady:0"', js)
        self.assertLess(js.index('Cross-method verified instance'),
                        js.index('sync({request:Event("SBT:EmpiricalDependencyReady:0")'))
        self.assertLess(js.index('sync({waitFor:Event("SBT:EmpiricalDependencyPermit:0")'),
                        js.index('cross-baseline-0-'))

    @unittest.skipUnless(shutil.which('node'), 'Node is needed for both gate event orders')
    def test_dependency_gate_remembers_early_child_close_and_early_parent_ready(self):
        ready = empirical_update_delete(self.doc)
        album = next(x for x in ready if x['operation_id'] == 'updateAlbumInfo')
        album['runtime']['instance_ready_label'] = 'AlbumResponseDtos'
        album['runtime']['wait_for_closed_oracles'] = [1]
        gate = '\n'.join(_empirical_update_delete(album, 0)).split('bthread("sbt:cross-method:', 1)[0]
        for outcome in ('SBT:ConcurrencyClosed:1', 'SBT:ConcurrencySkipped:1'):
          for signals in ([outcome, 'SBT:EmpiricalDependencyReady:0'],
                          ['SBT:EmpiricalDependencyReady:0', outcome]):
            prefix = '''
const sent=[]; const queue=%s.map(name=>({name}));
const Event=name=>({name}); const EventSet=(label,test)=>({test});
function sync(arg){
  if(arg.request){sent.push(arg.request.name);return arg.request;}
  let i=queue.findIndex(e=>arg.waitFor.test(e));
  if(i<0){throw Error('No matching prerequisite');}
  return queue.splice(i,1)[0];
}
function bthread(name,fn){fn();}
''' % json.dumps(signals)
            proc = subprocess.run(['node', '-e', prefix + gate +
                                   'process.stdout.write(JSON.stringify(sent));'],
                                  text=True, capture_output=True)
            self.assertEqual(proc.returncode, 0, proc.stderr)
            self.assertEqual(json.loads(proc.stdout), ['SBT:EmpiricalDependencyPermit:0'])

    @unittest.skipUnless(shutil.which('node'), 'Node is needed for producer exhaustion')
    def test_three_completed_creators_with_one_failure_skip_without_http(self):
        oracle = next(x for x in empirical_update_delete(self.doc)
                      if x['operation_id'] == 'updateSharedLink')
        oracle['runtime']['instance_ready_label'] = 'SharedLinkResponseDtos'
        rendered = '\n'.join(_empirical_update_delete(oracle, 1))
        prelude = '''
const emitted=[];
const Event=(name,data)=>({name,data});
const EventSet=(name,test)=>({test});
const queue=[
 Event('InstanceReady:SharedLinkResponseDtos:2',{id:'second'}),
 Event('StoryPhaseComplete:crud:SharedLinkResponseDtos:2'),
 Event('StoryPhaseComplete:crud:SharedLinkResponseDtos:1'),
 Event('InstanceReady:SharedLinkResponseDtos:3',{id:'third'}),
 Event('StoryPhaseComplete:crud:SharedLinkResponseDtos:3')];
function sync(arg){
  if(arg.request){emitted.push(arg.request);return arg.request;}
  const i=queue.findIndex(e=>arg.waitFor.test ? arg.waitFor.test(e) : e.name===arg.waitFor.name);
  if(i<0){throw Error('Unexpected wait '+JSON.stringify(arg.waitFor));}
  return queue.splice(i,1)[0];
}
function bthread(name,fn){fn();}
function __sbtReadPath(v,p){return p.split('.').reduce((x,k)=>x[k],v);}
const svc={get:()=>{throw Error('No HTTP allowed after failed creator');}};
'''
        proc = subprocess.run(['node', '-e', prelude + rendered +
                               'process.stdout.write(JSON.stringify(emitted));'],
                              text=True, capture_output=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        events = json.loads(proc.stdout)
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]['name'], 'SBT:ConcurrencySkipped:1')
        self.assertEqual(events[0]['data']['observed'], 2)

    @unittest.skipUnless(shutil.which('node'), 'Node is needed for the generated JS scheduling check')
    def test_out_of_order_instances_reach_adapter_with_distinct_paths(self):
        oracle = next(x for x in empirical_update_delete(self.doc)
                      if x['operation_id'] == 'updateAlbumInfo')
        oracle['runtime']['instance_ready_label'] = 'AlbumResponseDtos'
        rendered = '\n'.join(_empirical_update_delete(oracle, 0))
        prelude = '''
const seen=[];
const Event=(name,data)=>({name,data});
const EventSet=(name,test)=>({test});
let queued=[2,1,3].map(n=>Event('InstanceReady:AlbumResponseDtos:'+n,{id:'id-'+n}));
queued.push(Event('SBT:ConcurrencyPermit:0'));
function sync(arg){
  if(arg.request){seen.push({event:arg.request.name});return arg.request;}
  let idx=queued.findIndex(e=>arg.waitFor.test ? arg.waitFor.test(e) : e.name===arg.waitFor.name);
  if(idx<0){throw Error('Missing event '+JSON.stringify(arg.waitFor));}
  return queued.splice(idx,1)[0];
}
function bthread(name,fn){fn();}
function __sbtReadPath(v,p){return p.split('.').reduce((x,k)=>x[k],v);}
const svc={get:(path)=>seen.push({method:'GET',path}),patch:(path)=>seen.push({method:'PATCH',path}),
 delete:(path)=>seen.push({method:'DELETE',path})};
const __sbtAdapter={post:(path,options)=>seen.push({epoch:JSON.parse(options.body)})};
'''
        script = prelude + rendered + '\nprocess.stdout.write(JSON.stringify(seen));'
        process = subprocess.run(['node', '-e', script], text=True, capture_output=True)
        self.assertEqual(process.returncode, 0, process.stderr)
        seen = json.loads(process.stdout)
        baselines = [x['path'] for x in seen if x.get('method') == 'GET'][:3]
        self.assertEqual(baselines, ['/albums/id-1', '/albums/id-2', '/albums/id-3'])
        self.assertEqual([x for x in seen if x.get('epoch')][0]['epoch']['epoch_id'],
                         'generated-epoch-0')


if __name__ == '__main__':
    unittest.main()
