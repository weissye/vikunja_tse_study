"""Meaningful protocol tests, with fake storage/SUT. No claim of native acceptance."""
import copy,json,tempfile,sys,subprocess,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parent;sys.path.insert(0,str(ROOT/'runtime'));sys.path.insert(0,str(ROOT/'source'))
from recovery_gateway import RecoveryGateway
from input_pipeline import compile_ir,research_config
from generic_emitter import emit
class Backend:
    def __init__(self,run,state):self.run=run;self.state=state;self.saved={};self.calls=[];self.break_restore=False
    def save(self,label):
        self.saved[label]=copy.deepcopy(self.state);self.calls.append(('save',label));return {'folder':label,'hashes':{'fake':'test-only'}}
    def restore(self,snapshot):
        self.calls.append(('restore',snapshot['folder']))
        if not self.break_restore:self.state.clear();self.state.update(copy.deepcopy(self.saved[snapshot['folder']]))
        (self.run/'restore-verification-v010.json').write_text(json.dumps({'strict_equality':not self.break_restore,'includes_directory_mtime':True}))
with tempfile.TemporaryDirectory() as d:
    run=Path(d);state={'/labels/1':{'id':1,'title':'valid'},'/projects/2':{'id':2,'title':'prefix-latest'}}
    b=Backend(run,state);g=RecoveryGateway('http://127.0.0.1:3456/api/v1','not-a-real-token',b,run,[])
    g.registry={'ModelsLabel_1':'/labels/1','ModelsProject_1':'/projects/2'}
    def fake(path,method='GET',body=None):
        if path=='/user':return 200,b'{"id":1}'
        if method=='POST':
            value=json.loads(body)
            if isinstance(value.get('title'),list):return 412,b'{"message":"invalid type"}'
            state[path].update(value)
        return 200,json.dumps(state[path]).encode()
    g.request=fake
    def h(action,case):return {'X-SBT-Action':action,'X-SBT-CaseId':case,'X-SBT-LogicalId':'ModelsLabel_1'}
    g.dispatch('/labels/1','GET',None,h('negative_prepare','bug'))
    status,raw=g.dispatch('/labels/1','POST',b'{"title":""}',h('negative_attempt','bug'))
    assert status==200 and json.loads(raw)['title']=='' # Original successful bad write remains evidence.
    assert state['/labels/1']['title']=='valid' and state['/projects/2']['title']=='prefix-latest'
    assert g.outcomes['bug']['observed_after']['title']=='' and g.outcomes['bug']['verified_after']['title']=='valid'
    assert g.outcomes['bug']['prefix_before_sha256']==g.outcomes['bug']['prefix_restored_sha256']
    # A different workflow can advance after restoration; its current prefix is preserved by the next window.
    g.dispatch('/projects/2','POST',b'{"title":"prefix-next"}',{'X-SBT-Action':'update','X-SBT-LogicalId':'ModelsProject_1'})
    g.dispatch('/labels/1','GET',None,h('negative_prepare','later'))
    assert g.dispatch('/labels/1','POST',b'{"title":[]}',h('negative_attempt','later'))[0]==412
    assert state['/projects/2']['title']=='prefix-next' and len(g.recoveries)==2
    g.dispatch('/labels/1','GET',None,h('negative_prepare','unsafe'));b.break_restore=True
    try:g.dispatch('/labels/1','POST',b'{"title":""}',h('negative_attempt','unsafe'))
    except RuntimeError:pass
    else:raise AssertionError('Unsafe restoration was accepted')
    assert 'unsafe' not in g.outcomes
    # An expired token after a cold save must be validated and renewed before a write.
    authrun=run/'auth';authrun.mkdir();astate={'/labels/1':{'id':1,'title':'valid'}}
    ab=Backend(authrun,astate);ag=RecoveryGateway('http://127.0.0.1:3456/api/v1','old-token',ab,authrun,[])
    ag.registry={'ModelsLabel_1':'/labels/1'};renewals=[]
    def renew():renewals.append(1);return 'new-token'
    ag.refresh_token=renew
    def afake(path,method='GET',body=None):
        if path=='/user':return (401,b'{"message":"expired"}') if ag.token=='old-token' else (200,b'{"id":1}')
        if method=='POST':astate[path].update(json.loads(body))
        return 200,json.dumps(astate[path]).encode()
    ag.request=afake;ag.dispatch('/labels/1','GET',None,h('negative_prepare','renew'))
    assert ag.dispatch('/labels/1','POST',b'{"title":""}',h('negative_attempt','renew'))[0]==200
    assert len(renewals)==1 and ag.outcomes['renew']['safe_to_continue'] and astate['/labels/1']['title']=='valid'
    # Missing post-write observation remains INCONCLUSIVE; strict restoration still occurs.
    obsrun=run/'observation';obsrun.mkdir();ostate={'/labels/1':{'id':1,'title':'valid'}}
    ob=Backend(obsrun,ostate);og=RecoveryGateway('http://127.0.0.1:3456/api/v1','test-only',ob,obsrun,[])
    og.registry={'ModelsLabel_1':'/labels/1'};post=[False]
    def ofake(path,method='GET',body=None):
        if path=='/user':return 200,b'{"id":1}'
        if method=='POST':ostate[path].update(json.loads(body));post[0]=True;return 200,json.dumps(ostate[path]).encode()
        if post[0] and not any(x[0]=='restore' for x in ob.calls):return 403,b'{"message":"observation unavailable"}'
        return 200,json.dumps(ostate[path]).encode()
    og.request=ofake;og.dispatch('/labels/1','GET',None,h('negative_prepare','missing'))
    assert og.dispatch('/labels/1','POST',b'{"title":""}',h('negative_attempt','missing'))[0]==200
    assert og.outcomes['missing']['observed_status']==403 and og.outcomes['missing']['observed_after'] is None
    assert og.outcomes['missing']['safe_to_continue'] and ostate['/labels/1']['title']=='valid'
    recorded=og.records
    assert any(x.get('action')=='negative_attempt' and x.get('status')==200 for x in recorded)
    assert any(x.get('category')=='post-write-observation' and x['status']==403 for x in recorded)
    # Transport failure does not replay a possibly committed write; rollback is verified first.
    og.dispatch('/labels/1','GET',None,h('negative_prepare','transport'))
    def tfake(path,method='GET',body=None):
        if method=='POST':ostate[path]['title']='ambiguous';raise TimeoutError('test timeout after possible write')
        return ofake(path,method,body)
    og.request=tfake
    try:og.dispatch('/labels/1','POST',b'{"title":""}',h('negative_attempt','transport'))
    except RuntimeError as e:assert 'no automatic write retry' in str(e)
    else:raise AssertionError('Ambiguous write was accepted')
    assert ostate['/labels/1']['title']=='valid'
    share_run=run/'share';share_run.mkdir();share_backend=Backend(share_run,{})
    sg=RecoveryGateway('http://127.0.0.1:3456/api/v1','test-jwt',share_backend,share_run,[{'name':'GenericShare','path':'/parents/{parent}/shares','detail':'/parents/{parent}/shares/{share}','parameter':'share','route_field':'id'}])
    sg.sensitive_fields={'GenericShare':['hash']};capability='share-capability-test-only'
    sg.request=lambda *args:(201,json.dumps({'id':501,'hash':capability,'name':'valid','permission':0}).encode())
    status,raw=sg.dispatch('/parents/101/shares','PUT',b'{"name":"valid","permission":0}',{'X-SBT-Action':'create','X-SBT-LogicalId':'GenericShare_1','X-SBT-Type':'GenericShare'})
    assert json.loads(raw)['hash']==capability and sg.registry['GenericShare_1']=='/parents/101/shares/501'
    assert capability not in (share_run/'gateway-journal.jsonl').read_text()
    from recovery_gateway import fingerprint
    views={'GenericShare_1':{'id':501,'hash':capability}}
    exported=sg.public_evidence({'prefix_before':views,'prefix_restored':views,'prefix_before_sha256':fingerprint(views),'prefix_restored_sha256':fingerprint(views)})
    assert capability not in json.dumps(exported) and exported['prefix_before_sha256']==fingerprint(exported['prefix_before'])
    # Actual subprocess log writer must close before sealing the evidence, including stop paths.
    import threading,time,hashlib
    from run_recovery_v082 import finish_native,pack
    logrun=run/'log-close';logrun.mkdir()
    child=subprocess.Popen([sys.executable,'-c','import time;print("start",flush=True);time.sleep(5)'],stdout=subprocess.PIPE,text=True)
    def read_child():
        with (logrun/'native.log').open('w') as f:
            for line in child.stdout:time.sleep(.1);f.write(line)
    writer=threading.Thread(target=read_child);writer.start();time.sleep(.2);finish_native(child,writer)
    assert child.poll() is not None and not writer.is_alive();pack(logrun,{'status':'TEST_ONLY'})
    manifest=json.loads((logrun/'manifest_v082.json').read_text());assert hashlib.sha256((logrun/'native.log').read_bytes()).hexdigest()==manifest['native.log']
    # Disabled recovery output stays byte-identical to v073 for identical inputs.
    src=ROOT/'input-source';ir=compile_ir(src/'contract.json',src/'SCOPE_v069.json',src/'method_adapter.json',src/'request-mappings-v073.json')
    cfg=research_config(name='vikunja');ip=run/'ir.json';cp=run/'config.json';ip.write_text(json.dumps(ir));cp.write_text(json.dumps(cfg));emit(ip,cp,run/'off')
    for ref in (ROOT/'reference-v073').glob('*.js'):
        if ref.name=='dal.js':assert ref.read_bytes()==(run/'off/spec/js'/ref.name).read_bytes()
        if ref.name=='stories.vikunja.js':assert ref.read_text().split('// v069: resource-local')[0].rstrip()==(run/'off/spec/js'/ref.name).read_text().split('// Generic observation isolation')[0].rstrip()
    old=compile_ir(src/'contract.json',src/'SCOPE_v069.json',src/'method_adapter.json');ip.write_text(json.dumps(old));emit(ip,cp,run/'old')
    for ref in (ROOT/'reference-v069').glob('*.js'):
        if ref.name=='dal.js':assert ref.read_bytes()==(run/'old/spec/js'/ref.name).read_bytes()
        if ref.name=='stories.vikunja.js':assert ref.read_text().split('// v069: resource-local')[0].rstrip()==(run/'old/spec/js'/ref.name).read_text().split('// Generic observation isolation')[0].rstrip()
    subprocess.run([sys.executable,str(ROOT/'Build-Acceptance-v082.py'),'--output',str(run/'on')],check=True)
    js=run/'on/project/spec/js';stories=(js/'stories.vikunja.js').read_text()
    assert stories.count('bthread("lifecycle ')==24 and sum(line.startswith('bthread("negative ') for line in stories.splitlines())==18
    assert len(list(js.glob('*.js')))==3
    iface=(js/'interfaces.vikunja.js').read_text()
    for i in range(1,4):assert 'waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_'+str(i)+'"})' in stories
    assert 'expectedBody["project_id"]' in iface and 'function verifyNegativeModelsTask' in iface
    from run_recovery_v082 import audit_relationships
    source_ir=json.loads((run/'on/contract-ir.json').read_text());generation=json.loads((run/'on/project/GENERATION_v071.json').read_text())
    rows=[];identities={entity+'_'+str(i):100*(n+1)+i for n,entity in enumerate(generation['instance_bindings']) for i in range(1,4)}
    for entity in source_ir['entities']:
        for item in generation['instance_bindings'][entity['name']]:
            path=entity['path']
            for dep in entity['path_dependencies']:path=path.replace('{'+dep['parameter']+'}',str(identities[item['bindings'][dep['target']]]))
            rows.append({'action':'create','logical_id':item['id'],'status':201,'path':path,'response':json.dumps({'id':identities[item['id']]}),'index':len(rows)})
    for mapping in source_ir['acceptance_observations']:
        e=next(x for x in source_ir['entities'] if x['name']==mapping['child'])
        for item in generation['instance_bindings'][mapping['child']]:
            parent_id=identities[item['bindings'][mapping['parent']]];payload={'id':identities[item['id']]}
            if mapping['response_field']:payload[mapping['response_field']]=parent_id
            detail=e['detail'].replace('{'+mapping['creation_parameter']+'}',str(parent_id)).replace('{'+e['parameter']+'}',str(payload['id']))
            for _ in range(2 if e['change_field'] else 1):rows.append({'action':'read','logical_id':item['id'],'status':200,'path':detail,'response':json.dumps(payload),'index':len(rows)})
    assert audit_relationships(source_ir,rows,generation['instance_bindings'])['pass']
    rows[-1]['path']='/tasks/999/comments/999';assert not audit_relationships(source_ir,rows,generation['instance_bindings'])['pass']
    assert '"filters":{"filter":"done = false"}' in stories
    assert 'function attemptNegativeModelsTeam' in iface
    assert '"permission":0' in stories and '"created":"sbt-' not in stories
    share=next(e for e in source_ir['entities'] if e['name']=='ModelsLinkSharing')
    assert share['parameter']=='share' and share['route_field']=='id'
    if shutil.which('node'):
        for f in js.glob('*.js'):subprocess.run(['node','--check',str(f)],check=True)
        subprocess.run(['node',str(ROOT/'Test-Callback-v082.js'),str(js/'interfaces.vikunja.js')],check=True)
        subprocess.run(['node',str(ROOT/'Test-Nested-v082.js'),str(js/'interfaces.vikunja.js')],check=True)
        subprocess.run(['node',str(ROOT/'Test-Gate-v082.js'),str(js/'stories.vikunja.js')],check=True)
        subprocess.run(['node',str(ROOT/'Test-Filter-v082.js'),str(js/'interfaces.vikunja.js')],check=True)
        subprocess.run(['node',str(ROOT/'Test-Share-v082.js'),str(js/'interfaces.vikunja.js')],check=True)
print(json.dumps({'version':'v087','status':'STATIC_PROTOCOL_TEST_PASS','native_execution':False,'live_execution':False,'checks':['original finding retained','whole observed prefix restored','later workflow progresses','unsafe recovery blocked','v069/v073 DAL and lifecycle/verifier stories identity; gate and nested interfaces intentionally corrected','one unified project, twenty-four lifecycles and eighteen negative bthreads','generated JS syntax and verifier callback behavior','expired authentication renews once','failed observation retained with verified rollback','ambiguous mutation never retried','stopped subprocess log closes before manifest']},indent=2))
