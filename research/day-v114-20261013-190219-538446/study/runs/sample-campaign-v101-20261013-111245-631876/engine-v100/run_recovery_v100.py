import argparse,getpass,hashlib,json,re,os,subprocess,sys,threading,time,zipfile,shutil
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'runtime'))
from checkpoint_backend import DockerVolumeBackend,json_request,request,native_markers
from bind_backend import BindBackend
from native_session_gateway import NativeSessionGateway
from native_log_capture import NativeLogCapture,valid_prefix
JAR_SHA='dda4be276ff517faa06b942d587cad2d342c66d83c9959f7eb3c6c77a8b2fc2b'
CONTRACT_SHA='171e238314089ca9b1c5c6fa3f87cf7f80a7c2a55934d1d6c228b39d48b65843'
def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1048576),b''):h.update(b)
    return h.hexdigest()
def pack(run,result):
    (run/'result_v100.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    files=[p for p in run.rglob('*') if p.is_file() and not any(x in p.relative_to(run).parts for x in ('.private-snapshots','products','__pycache__')) and p.name not in ('review_v100.zip','manifest_v100.json')]
    manifest={p.relative_to(run).as_posix():sha(p) for p in sorted(files)}
    (run/'manifest_v100.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    with zipfile.ZipFile(run/'review_v100.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in files+[run/'manifest_v100.json']:z.write(p,p.relative_to(run).as_posix())
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
    p.add_argument('--research-config',type=Path,default=ROOT/'input-source/research-config-v100.json');p.add_argument('--sample-seed',type=int);p.add_argument('--seed',type=int,default=3);p.add_argument('--run-config',type=Path,default=ROOT/'run-config.local.json');p.add_argument('--username',default='SBT-tester');p.add_argument('--run-live',action='store_true');a=p.parse_args()
    subprocess.run([sys.executable,str(ROOT/'Verify-v100.py')],check=True)
    launch_config=json.loads(a.run_config.read_text(encoding='utf-8-sig'));a.seed=launch_config.get('seed',a.seed)
    run=a.study_root/'runs'/('recovery-v100-'+datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S-%f'));run.mkdir(parents=True)
    launch_research=json.loads(a.research_config.read_text());launch_research['fixtures']['namespace']=run.name
    history_path=a.study_root/'sampling-history-v096.json'
    if history_path.exists():
        history=json.loads(history_path.read_text())
        if history.get('contract_sha256')!=CONTRACT_SHA:raise RuntimeError('Sampling history contract differs')
        launch_research['sampling']['completed_case_ids']=sorted(set(launch_research['sampling']['completed_case_ids'])|set(history['completed_case_ids']))
    if a.sample_seed is not None:launch_research['sampling']['seed']=a.sample_seed
    research_config_path=run/'research-launch.json';research_config_path.write_text(json.dumps(launch_research,indent=2))
    gateway=None;server=None;process=None;reader=None;token='';result={'version':'v100','status':'NOT_ACCEPTED','native_execution':False,'live_execution':False,'run_seed':a.seed,'fixture_seed':1}
    try:
        if not a.run_live:
            subprocess.run([sys.executable,str(ROOT/'Build-Model-v100.py'),'--output',str(run/'generated'),'--config',str(research_config_path)],check=True)
            result['status']='V100_STATIC_READY'
        else:
            short_profile=launch_research['sampling']['negative_limit']<=8 and launch_research['instances']['default']<=3 and all(n<=3 for n in launch_research['instances']['per_entity'].values())
            minimum_gb=1 if short_profile else 2
            if shutil.disk_usage(a.study_root).free<minimum_gb*1024**3:raise RuntimeError('Insufficient disk space: requires '+str(minimum_gb)+' GB for selected profile')
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
            auth=json.loads((ROOT/'input-source/authentication-v100.json').read_text())
            gateway=NativeSessionGateway(target,'',backend,run,[],login_plan=auth,login_interval=run_cfg.get('login_interval_seconds',7))
            gateway.secrets.append(password);server=gateway.server()
            proxy='http://127.0.0.1:'+str(server.server_port)
            subprocess.run([sys.executable,str(ROOT/'Build-Model-v100.py'),'--output',str(run/'generated'),'--proxy-url',proxy,'--config',str(research_config_path)],check=True)
            ir=json.loads((run/'generated/contract-ir.json').read_text());gateway.entities={e['name']:e for e in ir['entities']};gateway.sensitive_fields=ir.get('sensitive_response_fields',{})
            planned_generation=json.loads((run/'generated/project/GENERATION_v071.json').read_text());planned_negatives=planned_generation['negative_checks']
            result['planned']={'resources':sum(len(v) for v in planned_generation['instance_bindings'].values()),'session_workflows':len(planned_generation['shared_session_workflows']),'positive_updates':sum(len(w['fields']) for w in planned_generation['shared_session_workflows']),'negative_checks':planned_negatives}
            threading.Thread(target=server.serve_forever,daemon=True).start()
            env=dict(os.environ,SBT_USERNAME=run_cfg['username'],SBT_PASSWORD=password)
            lines=[];fatal=threading.Event();reader=NativeLogCapture(run,gateway,lines,fatal)
            process=subprocess.Popen(['java','-jar',str(a.jar.resolve()),'run','--random-seed',str(a.seed),str((run/'generated/project').resolve())],env=env,stdout=reader.raw_writer,stderr=subprocess.STDOUT)
            result.update(native_execution=True,live_execution=True,native_pid=process.pid,native_launches=1)
            started=time.monotonic();heartbeat=started
            hard_limit=launch_research['budgets']['soft_seconds']+launch_research['budgets']['drain_seconds']
            print('V100_ONE_NATIVE_PROCESS_STARTED',process.pid,'planned_negative_checks='+str(planned_negatives),flush=True)
            while process.poll() is None:
                reader.pump()
                if gateway.error or fatal.is_set() or time.monotonic()-started>hard_limit:
                    process.terminate();process.wait(timeout=30)
                    raise RuntimeError(gateway.error or next((x.strip() for x in lines if 'ERROR:' in x or 'FAIL:' in x),'Native failure/timeout; continuation blocked'))
                if time.monotonic()-heartbeat>30:
                    print('V100_NATIVE_RUNNING recovered_windows='+str(len(gateway.recoveries))+'/'+str(planned_negatives),flush=True);heartbeat=time.monotonic()
                time.sleep(.25)
            reader.join(timeout=30)
            if reader.is_alive():raise RuntimeError('Native log writer did not close; cannot seal evidence')
            log=''.join(lines)
            if fatal.is_set():raise RuntimeError(next((x.strip() for x in lines if 'ERROR:' in x or 'FAIL:' in x),'Native failure; inspect log'))
            if process.returncode!=0 or 'Test Result: ERROR' in log:
                detail=next((line.strip() for line in log.splitlines() if ' ERR ' in line or 'FAIL:' in line),'native exit '+str(process.returncode))
                raise RuntimeError('Native execution error: '+detail[:1000])
            negatives=native_markers(log,'NEGATIVE_CHECK');checks=native_markers(log,'RECOVERY_CHECK')
            findings=[x for x in negatives if x.get('pass') is False]
            ids=[x.get('caseId') for x in negatives]
            generation=json.loads((run/'generated/project/GENERATION_v071.json').read_text())
            config=json.loads((run/'generated/research-config.json').read_text())
            selection=json.loads((run/'generated/project/negative-selection.json').read_text())
            expected_ids={x['case_id'] for x in selection['selected']}
            expected_resources=sum(len(x) for x in generation['instance_bindings'].values())
            expected_updates=sum(len(generation['instance_bindings'][e['entity']]) for e in generation['entity_reports'] if e['update_field'])
            expected_checks=len(expected_ids)
            shared=native_markers(log,'SESSION_WORKFLOW_COMPLETE');expected_shared=generation['shared_session_workflows'];expected_updates=sum(len(x['fields']) for x in expected_shared)
            all_workflows={x['caseId'] for x in shared}=={x['case_id'] for x in expected_shared} and len(shared)==len(expected_shared)
            used={r.get('session') for r in gateway.records if r.get('category')=='research' and r.get('action')=='update'}
            result['writer_sessions_observed']=sorted(used)
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
            boundary=native_markers(log,'SHORT_RUN_BOUNDARY')
            stable=bool(boundary) and all(boundary[-1].get(k)==0 for k in ('active_operations','pending_creations','pending_verifications','write_locks')) and not gateway.pending
            completed_ids=set(ids)
            recovery_ids={x.get('caseId') for x in checks}
            valid_completed=completed_ids<=expected_ids and len(ids)==len(completed_ids) and recovery_ids==completed_ids and len(checks)==len(ids) and len(gateway.recoveries)==len(ids) and all(x.get('recovery_verified') is True for x in checks)
            complete=all_workflows and completed_ids==expected_ids and len(gateway.registry)==expected_resources and result['positive_updates']==expected_updates and relationship_audit['pass']
            cutoff=time.monotonic()-started>=launch_research['budgets']['soft_seconds']
            coverage={'planned_resources':expected_resources,'created_resources':len(gateway.registry),'planned_workflows':len(expected_shared),'completed_workflows':len(shared),'planned_updates':expected_updates,'completed_updates':result['positive_updates'],'negative_candidates':selection['candidate_count'],'selected_negative_cases':selection['selected'],'completed_negative_case_ids':sorted(completed_ids),'selected_not_completed':sorted(expected_ids-completed_ids),'omitted_from_sample':len(selection['omitted']),'stable_boundary':stable,'elapsed_seconds':round(time.monotonic()-started,2),'budget_cutoff':cutoff,'complete_selected_model':complete,'full_contract_coverage':False}
            result['coverage']=coverage
            (run/'coverage-v100.json').write_text(json.dumps(coverage,indent=2))
            if process.returncode!=0 or 'Test Result: SUCCESS' not in log or not valid_completed or not stable:raise RuntimeError('Native termination or stable-boundary/recovery evidence not accepted')
            if not complete and not cutoff:raise RuntimeError('Model ended early before budget; coverage incomplete')
            result['status']='V100_SAMPLE_COMPLETED' if complete else 'V100_TIME_BUDGET_STABLE_PARTIAL'
    except Exception as e: result.update(status='NOT_ACCEPTED',error=str(e))
    finally:
        try:finish_native(process,reader)
        except Exception as closing_error:
            result.setdefault('cleanup_errors',[]).append(str(closing_error))
            if not result.get('error'):result.update(status='NOT_ACCEPTED',error='Native shutdown incomplete')
        if server:
            try:server.shutdown();server.server_close()
            except Exception as closing_error:result.setdefault('cleanup_errors',[]).append(str(closing_error))
        if gateway:(run/'recovery-ledger.json').write_text(json.dumps(gateway.public_evidence(gateway.recoveries),indent=2),encoding='utf-8')
        if gateway:
            result.update(created_resources=len(gateway.registry),recorded_http_requests=sum(x.get('category')=='research' for x in gateway.records),native_login_requests=sum(x.get('action')=='authenticate' for x in gateway.records),completed_recoveries=len(gateway.recoveries))
        if process:result['native_exit']=process.returncode
        if reader and not reader.is_alive() and (run/'native.log').exists():
            full_evidence=(run/'native.log').read_text(encoding='utf-8')
            evidence=valid_prefix(full_evidence)
            result['post_failure_markers_excluded']=len(native_markers(full_evidence,'SESSION_WORKFLOW_COMPLETE'))-len(native_markers(evidence,'SESSION_WORKFLOW_COMPLETE'))
            actual_negatives=native_markers(evidence,'NEGATIVE_CHECK')
            actual_recoveries=native_markers(evidence,'RECOVERY_CHECK')
            actual_workflows=native_markers(evidence,'SESSION_WORKFLOW_COMPLETE')
            result['negative_checks']=actual_negatives;result['recovery_checks']=actual_recoveries
            result['findings']=[x for x in actual_negatives if x.get('pass') is False]
            result['completed_workflows']=len(actual_workflows)
            result['positive_updates']=sum(x.get('action')=='update' and 200<=x.get('status',0)<300 for x in gateway.records) if gateway else 0
            selection_file=run/'generated/project/negative-selection.json'
            if selection_file.exists():
                selection=json.loads(selection_file.read_text())
                result['sampling']={'candidate_count':selection['candidate_count'],'selected':selection['selected'],'completed_case_ids':[x['caseId'] for x in actual_negatives],'selected_not_completed':sorted({x['case_id'] for x in selection['selected']}-{x['caseId'] for x in actual_negatives}),'omitted_count':len(selection['omitted'])}
            done={x['caseId'] for x in actual_recoveries if x.get('recovery_verified') is True}
            if done:
                previous=json.loads(history_path.read_text())['completed_case_ids'] if history_path.exists() else []
                temp=history_path.with_suffix('.tmp')
                temp.write_text(json.dumps({'contract_sha256':CONTRACT_SHA,'completed_case_ids':sorted(set(previous)|done)},indent=2));temp.replace(history_path)
        pack(run,result)
    print('Status:',result['status']);print('Review ZIP:',run/'review_v100.zip')
    if result.get('error'):print('Error:',result['error'])
    return 0 if result['status'] in ('V100_STATIC_READY','V100_SAMPLE_COMPLETED','V100_TIME_BUDGET_STABLE_PARTIAL') else 1
if __name__=='__main__':raise SystemExit(main())
