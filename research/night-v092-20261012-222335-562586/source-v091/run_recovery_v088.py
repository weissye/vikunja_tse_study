import argparse,getpass,hashlib,json,re,os,subprocess,sys,threading,time,zipfile,shutil
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'runtime'))
from checkpoint_backend import DockerVolumeBackend,json_request,request,native_markers
from bind_backend import BindBackend
from native_session_gateway import NativeSessionGateway
JAR_SHA='dda4be276ff517faa06b942d587cad2d342c66d83c9959f7eb3c6c77a8b2fc2b'
CONTRACT_SHA='171e238314089ca9b1c5c6fa3f87cf7f80a7c2a55934d1d6c228b39d48b65843'
def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1048576),b''):h.update(b)
    return h.hexdigest()
def pack(run,result):
    (run/'result_v088.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    files=[p for p in run.rglob('*') if p.is_file() and not any(x in p.relative_to(run).parts for x in ('.private-snapshots','products','__pycache__')) and p.name not in ('review_v088.zip','manifest_v088.json')]
    manifest={p.relative_to(run).as_posix():sha(p) for p in sorted(files)}
    (run/'manifest_v088.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    with zipfile.ZipFile(run/'review_v088.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in files+[run/'manifest_v088.json']:z.write(p,p.relative_to(run).as_posix())
def audit_relationships(ir,records,bindings):
    checks=[];issues=[]
    entities={e['name']:e for e in ir['entities']}
    created={r['logical_id']:r for r in records if r.get('action')=='create' and 200<=r.get('status',0)<300}
    for mapping in ir.get('acceptance_observations',[]):
        child=mapping['child'];parent=mapping['parent'];field=mapping['response_field'];parameter=mapping['creation_parameter']
        if field is not None and field not in entities[child]['create_schema'].get('properties',{}):
            issues.append('Observation field missing from schema: '+field);continue
        for binding in bindings[child]:
            logical=binding['id'];parent_logical=binding['bindings'][parent]
            if logical not in created or parent_logical not in created:issues.append('Creation missing: '+logical);continue
            parent_id=json.loads(created[parent_logical]['response'])[entities[parent]['id_field']]
            template=entities[child]['path'].replace('{'+parameter+'}',str(parent_id))
            route_equal=created[logical]['path']==template
            reads=[r for r in records if r.get('action')=='read' and r.get('logical_id')==logical]
            for read in reads:
                payload=json.loads(read['response']);child_id=json.loads(created[logical]['response'])[entities[child]['id_field']]
                expected_detail=entities[child]['detail'].replace('{'+parameter+'}',str(parent_id)).replace('{'+entities[child]['parameter']+'}',str(child_id))
                relation_ok=payload.get(field)==parent_id if field is not None else read.get('path')==expected_detail and payload.get(entities[child]['id_field'])==child_id
                passed=read['status']==200 and relation_ok and route_equal
                checks.append({'logical_id':logical,'parent_logical_id':parent_logical,'parent_id':parent_id,'observed_parent_id':payload.get(field) if field is not None else (parent_id if relation_ok else None),'response_field':field,'journal_index':read['index'],'pass':passed})
            if len(reads)<1:issues.append('Lifecycle GET coverage incomplete: '+logical)
    return {'pass':bool(checks) and all(x['pass'] for x in checks) and not issues,'checks':checks,'issues':issues,'scope':'Independent lifecycle GETs after create and update; recovery prefix checks recorded separately'}

def finish_native(process,reader):
    if process and process.poll() is None:
        process.terminate()
        try:process.wait(timeout=30)
        except subprocess.TimeoutExpired:process.kill();process.wait(timeout=30)
    if reader:
        reader.join(timeout=30)
        if reader.is_alive():raise RuntimeError('Log writer still active; review intentionally not sealed')
def main():
    p=argparse.ArgumentParser();p.add_argument('--study-root',type=Path,required=True);p.add_argument('--jar',type=Path,required=True)
    p.add_argument('--seed',type=int,default=3);p.add_argument('--run-config',type=Path,default=ROOT/'run-config.local.json');p.add_argument('--username',default='SBT-tester');p.add_argument('--run-live',action='store_true');a=p.parse_args()
    subprocess.run([sys.executable,str(ROOT/'Verify-v088.py')],check=True)
    launch_config=json.loads(a.run_config.read_text(encoding='utf-8-sig'));a.seed=launch_config.get('seed',a.seed)
    run=a.study_root/'runs'/('recovery-v088-'+datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S-%f'));run.mkdir(parents=True)
    gateway=None;server=None;process=None;reader=None;token='';result={'version':'v088','status':'NOT_ACCEPTED','native_execution':False,'live_execution':False,'run_seed':a.seed,'fixture_seed':1}
    try:
        if not a.run_live:
            subprocess.run([sys.executable,str(ROOT/'Build-Model-v088.py'),'--output',str(run/'generated')],check=True)
            result['status']='V088_STATIC_READY'
        else:
            if shutil.disk_usage(a.study_root).free<2*1024**3:raise RuntimeError('At least 2 GB free space is required')
            if sha(a.jar)!=JAR_SHA:raise RuntimeError('Frozen Provengo JAR SHA256 mismatch')
            run_cfg=json.loads(a.run_config.read_text(encoding='utf-8-sig'));target=run_cfg['base_url'].rstrip('/')
            if target!='http://127.0.0.1:3456/api/v1':raise RuntimeError('This acceptance is restricted to the local frozen study server')
            if json_request(target+'/info').get('version')!='v2.6.0':raise RuntimeError('Server version mismatch')
            status,raw=request(target+'/docs.json')
            if status!=200 or hashlib.sha256(raw).hexdigest()!=CONTRACT_SHA:raise RuntimeError('Frozen live contract SHA256 mismatch')
            mounts=json.loads(subprocess.run(['docker','inspect','vikunja-research-sut'],check=True,capture_output=True,text=True).stdout)[0]['Mounts']
            types={m['Type'] for m in mounts if m['Destination'] in ('/db','/app/vikunja/files')}
            if types=={'bind'}:backend=BindBackend('vikunja-research-sut',target,run,a.study_root)
            elif types=={'volume'}:backend=DockerVolumeBackend('vikunja-research-sut','vikunja-increment8-2-files-init',target,'',run)
            else:raise RuntimeError('Unsupported storage layout')
            run_cfg=json.loads(a.run_config.read_text(encoding='utf-8-sig'))
            password=run_cfg['password']
            auth=json.loads((ROOT/'input-source/authentication-v088.json').read_text())
            gateway=NativeSessionGateway(target,'',backend,run,[],login_plan=auth,login_interval=run_cfg.get('login_interval_seconds',7))
            gateway.secrets.append(password);server=gateway.server()
            proxy='http://127.0.0.1:'+str(server.server_port)
            subprocess.run([sys.executable,str(ROOT/'Build-Model-v088.py'),'--output',str(run/'generated'),'--proxy-url',proxy],check=True)
            ir=json.loads((run/'generated/contract-ir.json').read_text());gateway.entities={e['name']:e for e in ir['entities']};gateway.sensitive_fields=ir.get('sensitive_response_fields',{})
            threading.Thread(target=server.serve_forever,daemon=True).start()
            env=dict(os.environ,SBT_USERNAME=run_cfg['username'],SBT_PASSWORD=password)
            process=subprocess.Popen(['java','-jar',str(a.jar.resolve()),'run','--random-seed',str(a.seed),str((run/'generated/project').resolve())],env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding='utf-8',errors='replace')
            result.update(native_execution=True,live_execution=True,native_pid=process.pid,native_launches=1)
            lines=[]; fatal=threading.Event()
            def read_log():
                with (run/'native.log').open('w',encoding='utf-8') as f:
                    for line in process.stdout:
                        clean=line
                        for secret in list(gateway.secrets):clean=clean.replace(secret,'[REDACTED]')
                        lines.append(clean);f.write(clean);f.flush()
                        if 'FAIL:' in clean or 'Test Result: FAIL' in clean or 'Switching to test fail mode' in clean: fatal.set()
            reader=threading.Thread(target=read_log,daemon=True);reader.start();started=time.monotonic();heartbeat=started
            print('V088_ONE_NATIVE_PROCESS_STARTED',process.pid,flush=True)
            while process.poll() is None:
                if gateway.error or fatal.is_set() or time.monotonic()-started>run_cfg.get('timeout_seconds',86400):
                    process.terminate();process.wait(timeout=30)
                    raise RuntimeError(gateway.error or 'Native failure/timeout; continuation blocked')
                if time.monotonic()-heartbeat>30:
                    print('V088_NATIVE_RUNNING recovered_windows='+str(len(gateway.recoveries)),flush=True);heartbeat=time.monotonic()
                time.sleep(.25)
            reader.join(timeout=30)
            if reader.is_alive():raise RuntimeError('Native log writer did not close; cannot seal evidence')
            log=''.join(lines)
            negatives=native_markers(log,'NEGATIVE_CHECK');checks=native_markers(log,'RECOVERY_CHECK')
            findings=[x for x in negatives if x.get('pass') is False]
            ids=[x.get('caseId') for x in negatives]
            generation=json.loads((run/'generated/project/GENERATION_v071.json').read_text())
            config=json.loads((run/'generated/research-config.json').read_text())
            selected=set(config['recovery']['negative_rule_ids']);expected_ids=set()
            for entity,bindings in generation['instance_bindings'].items():
                rules=[x for x in ir['negative_catalog']['cases'] if x['resource']==entity and x['id'] in selected]
                actual_catalog=json.loads((run/'generated/project/spec/js/negative_catalog.json').read_text())
                rules=[x for x in actual_catalog['cases'] if x['resource']==entity]
                expected_ids.update('NEG_'+sid+'_'+item['id']+'_'+str(j) for sid in ('A','B') for item in bindings for j in range(len(rules)))
            expected_resources=sum(len(x) for x in generation['instance_bindings'].values())
            expected_updates=sum(len(generation['instance_bindings'][e['entity']]) for e in generation['entity_reports'] if e['update_field'])
            expected_checks=len(expected_ids)
            shared=native_markers(log,'SESSION_WORKFLOW_COMPLETE');expected_shared=generation['shared_session_workflows'];expected_updates=sum(len(x['fields']) for x in expected_shared)
            if {x['caseId'] for x in shared}!={x['case_id'] for x in expected_shared} or len(shared)!=len(expected_shared):raise RuntimeError('Shared session workflows incomplete')
            used={r.get('session') for r in gateway.records if r.get('category')=='research' and r.get('action')=='update'}
            if used!={'A','B'}:raise RuntimeError('Both writer sessions must appear in actual HTTP evidence')
            result['shared_session_checks']=shared;result['sessions']=2;result['users']=1
            result['native_login_requests']=sum(x.get('action')=='authenticate' for x in gateway.records)
            result['python_login_requests']=0
            result['planned_workflows']=len(expected_shared);result['completed_workflows']=len(shared)
            result['planned_positive_updates']=expected_updates;result['planned_negative_checks']=expected_checks
            relationship_audit=audit_relationships(ir,gateway.records,generation['instance_bindings'])
            (run/'relationship-audit.json').write_text(json.dumps(relationship_audit,indent=2),encoding='utf-8')
            safe={x.get('caseId') for x in checks}==expected_ids and len(checks)==expected_checks and all(x.get('recovery_verified') is True for x in checks)
            continued=bool(findings and ids.index(findings[0]['caseId'])<len(ids)-1)
            result.update(native_exit=process.returncode,created_resources=len(gateway.registry),positive_updates=sum(r.get('action')=='update' and 200<=r.get('status',0)<300 for r in gateway.records),negative_checks=negatives,recovery_checks=checks,findings=findings,inconclusive_checks=[x for x in negatives if x.get('pass') is None],completed_after_first_finding=continued,context_policy='Negative writes do not commit expected state; same JVM and pending bthreads retained',relationship_audit=relationship_audit,scope={'entity_types':len(ir['entities']),'instances_per_type':config['instances']['default'],'negative_checks':expected_checks})
            if process.returncode!=0 or 'Test Result: SUCCESS' not in log or set(ids)!=expected_ids or len(ids)!=expected_checks or not safe or len(gateway.registry)!=expected_resources or len(gateway.recoveries)!=expected_checks or result['positive_updates']!=expected_updates or not relationship_audit['pass']:raise RuntimeError('Native recovery acceptance checks incomplete')
            result['status']='V088_RECOVERY_ACCEPTANCE_COMPLETED_WITH_FINDINGS' if continued else 'V088_COMPLETE_NO_FINDING_CONTINUATION_NOT_PROVEN'
    except Exception as e: result.update(status='NOT_ACCEPTED',error=str(e))
    finally:
        finish_native(process,reader)
        if server:server.shutdown();server.server_close()
        if gateway:(run/'recovery-ledger.json').write_text(json.dumps(gateway.public_evidence(gateway.recoveries),indent=2),encoding='utf-8')
        pack(run,result)
    print('Status:',result['status']);print('Review ZIP:',run/'review_v088.zip')
    if result.get('error'):print('Error:',result['error'])
    return 0 if result['status'] in ('V088_STATIC_READY','V088_RECOVERY_ACCEPTANCE_COMPLETED_WITH_FINDINGS') else 1
if __name__=='__main__':raise SystemExit(main())
