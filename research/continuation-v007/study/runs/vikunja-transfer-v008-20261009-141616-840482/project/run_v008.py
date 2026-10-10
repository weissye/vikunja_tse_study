"""Versioned positive native acceptance runner; compiler-owned package template."""
import argparse,datetime,getpass,hashlib,json,os,pathlib,re,subprocess,urllib.request,urllib.parse,uuid,zipfile
from generator_v56.transfer_stage5_v008 import write_full_package
from generator_v56.transfer_prefix_v008 import compile_prefix
from analyze_v008 import analyze
from derive_v008 import build
VERSION='v008'
def sha(b):return hashlib.sha256(b).hexdigest()
def http(base,path,method='GET',body=None,token=None):
    headers={'Content-Type':'application/json'}
    if token:headers['Authorization']='Bearer '+token
    req=urllib.request.Request(base.rstrip('/')+path,data=json.dumps(body).encode() if body is not None else None,headers=headers,method=method)
    with urllib.request.urlopen(req,timeout=15) as h:return json.loads(h.read())
def local_url(url):
    u=urllib.parse.urlparse(url)
    if u.scheme not in ('http','https') or u.hostname not in ('127.0.0.1','localhost','::1') or u.username or u.password or u.query or u.fragment:raise ValueError('Expected a loopback URL without credentials/query/fragment')
    return url.rstrip('/')
def discover(contract):
    prefix=contract.get('basePath') or next((s['url'].rstrip('/') for s in contract.get('servers',[]) if s.get('url','').startswith('/')),None)
    if prefix is None:raise ValueError('Supply --base-url including the local API prefix')
    ps=subprocess.run(['docker','ps','--format','{{json .}}'],capture_output=True,text=True,timeout=15,check=True)
    candidates=[]
    for line in ps.stdout.splitlines():
        item=json.loads(line)
        if 'vikunja' not in (item.get('Names','')+' '+item.get('Image','')).lower():continue
        ports=subprocess.run(['docker','inspect','--format','{{json .NetworkSettings.Ports}}',item['Names']],capture_output=True,text=True,timeout=15,check=True)
        for mappings in (json.loads(ports.stdout) or {}).values():
            for binding in mappings or []:
                base='http://127.0.0.1:'+binding['HostPort']+prefix
                try:
                    info=http(base,'/info')
                    if info.get('version')==contract['info']['version']:candidates.append((base,item['Names']))
                except Exception:pass
    candidates=list(dict.fromkeys(candidates))
    if len(candidates)!=1:raise ValueError('No unique version-matching local Vikunja API. Supply --base-url explicitly; check Docker/server version.')
    print('Matched local container:',candidates[0][1]);return candidates[0][0]
def main():
    p=argparse.ArgumentParser();p.add_argument('--study-root',required=True,type=pathlib.Path);p.add_argument('--contract',required=True,type=pathlib.Path);p.add_argument('--base-url');p.add_argument('--provengo-jar',type=pathlib.Path);p.add_argument('--username');p.add_argument('--seed',type=int,default=1);p.add_argument('--preflight-only',action='store_true');a=p.parse_args()
    run=a.study_root/'runs'/('vikunja-transfer-v008-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));run.mkdir(parents=True,exist_ok=False)
    compiler_path=pathlib.Path(__file__).parent/'generator_v56/transfer_stage5_v008.py'
    template_path=compiler_path.with_name('package_templates_v008.json')
    result={'version':VERSION,'status':'NOT_ACCEPTED','live_vikunja':False,'live_execution_started':False,'live_acceptance_passed':False,'seed':a.seed,'compiler_sha256':sha(compiler_path.read_bytes()),'templates_sha256':sha(template_path.read_bytes())};token='';password='';report=None
    try:
        raw=a.contract.read_bytes();contract=json.loads(raw.decode('utf-8-sig'));source_hash=sha(raw)
        cat=analyze(contract,source_hash);rules=build(cat)
        graph=compile_prefix(rules,2,3,(1,2,3),{o['key']:o['pointer'] for o in cat['operations']})
        graph['contract_sha256']=source_hash
        for name,obj in [('catalog_v008.json',cat),('rules_v008.json',rules),('graph_v008.json',graph)]:
            (run/name).write_text(json.dumps(obj,indent=2),encoding='utf-8')
        result['contract_sha256']=source_hash
        base=local_url(a.base_url) if a.base_url else discover(contract);base=local_url(base)
        info=http(base,'/info');result['server_version']=info.get('version');result['base_url']=base
        if info.get('version')!=contract['info']['version']:raise ValueError('Installed version does not match the declared contract version')
        result['contract_authority']='LOCAL_FILE_HASH_AND_SERVER_VERSION_MATCH; LIVE_CONTRACT_BYTES_NOT_FETCHED'
        live_url=base.rstrip('/')+'/docs.json'
        with urllib.request.urlopen(live_url,timeout=15) as h:live_raw=h.read()
        live_contract=json.loads(live_raw.decode('utf-8-sig'))
        canonical=lambda d:json.dumps(d,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode('utf-8')
        if canonical(live_contract)!=canonical(contract):raise ValueError('Live contract differs structurally from supplied contract')
        result['live_contract_raw_sha256']=sha(live_raw)
        result['live_contract_canonical_sha256']=sha(canonical(live_contract))
        result['contract_authority']='LIVE_DOCUMENT_CANONICAL_EQUALITY_AND_SERVER_VERSION_MATCH'
        # Read-only gate for the narrowly scoped, documented method override.
        probe=urllib.request.Request(base.rstrip('/')+'/labels/118',method='OPTIONS')
        with urllib.request.urlopen(probe,timeout=15) as h:
            allowed=[x.strip().upper() for x in h.headers.get('Allow','').split(',') if x.strip()]
            result['label_options_status']=h.status;result['label_allowed_methods']=allowed
        if 'POST' not in allowed or 'PUT' in allowed:raise ValueError('Live method evidence does not match the approved label override')
        result['contract_override']='PUT /labels/{id} -> POST /labels/{id}; CONTRACT_UNCHANGED'
        jar=a.provengo_jar
        if jar is None:
            candidates=[]
            for search_root in (a.study_root,a.study_root.parent,pathlib.Path.home()/'Downloads'):
                for folder,dirs,files in os.walk(search_root):
                    depth=len(pathlib.Path(folder).relative_to(search_root).parts)
                    dirs[:]=[d for d in dirs if d not in ('.git','node_modules','.venv','venv','evidence','runs') and depth<5]
                    candidates.extend(pathlib.Path(folder)/f for f in files if 'provengo' in f.lower() and f.lower().endswith('.jar'))
            candidates=sorted(set(candidates))
            if len(candidates)==1:jar=candidates[0]
            else:
                for i,c in enumerate(candidates):print('['+str(i+1)+'] Runtime:',c)
                choice=input('Select runtime number, or enter its full JAR path: ').strip().strip('"')
                jar=candidates[int(choice)-1] if choice.isdigit() and 1<=int(choice)<=len(candidates) else pathlib.Path(choice)
        if not jar.is_file():raise ValueError('Provengo JAR not found')
        result['provengo_jar_sha256']=sha(jar.read_bytes())
        version=subprocess.run(['java','-jar',str(jar.resolve()),'--version'],capture_output=True,text=True,timeout=30,check=True)
        result['provengo_version']=version.stdout.strip();(run/'provengo-version.txt').write_text(version.stdout+version.stderr)
        report=write_full_package(graph,rules,contract,base,run/'project',uuid.uuid4().hex[:10]);result['generated_steps']=report['step_count'];result['expected_parent_checks']=report['parent_readback_obligations']
        if a.preflight_only:result['status']='V008_PREFLIGHT_PASS';return 0
        # Authenticated own-resource run only. No accounts or permission topology are created.
        token=os.environ.get('SBT_VIKUNJA_TOKEN','')
        if not token:
            username=a.username or input('Existing Vikunja research username: ').strip()
            password=getpass.getpass('Vikunja password: ')
            auth=http(base,'/login','POST',{'username':username,'password':password});token=auth.get('token','')
        if not token:raise ValueError('Login did not return a token')
        actor=http(base,'/user',token=token)
        if not actor.get('id'):raise ValueError('Authenticated identity not verified')
        result['actor_id']=actor['id'];env=os.environ.copy();env['SBT_VIKUNJA_TOKEN']=token
        result['live_execution_started']=True
        print('V008 native Provengo run started',flush=True)
        native=subprocess.run(['java','-jar',str(jar.resolve()),'run','--random-seed',str(a.seed),str((run/'project').resolve())],env=env,capture_output=True,text=True,errors='replace',timeout=600)
        log=native.stdout+'\n'+native.stderr
        for secret in (token,password):
            if secret:log=log.replace(secret,'<redacted>')
        (run/'provengo-run.log').write_text(log,encoding='utf-8');result['native_exit']=native.returncode
        passed=set(re.findall(r'V008_STEP_PASS ([^\r\n]+)',log));callbacks=[]
        for line in log.splitlines():
            if 'V008_CALLBACK ' in line:callbacks.append(json.loads(line.split('V008_CALLBACK ',1)[1]))
        result['passed_steps']=len(passed);result['callbacks']=len(callbacks);result['live_vikunja']=bool(callbacks);result['successful_live_callbacks']=len(callbacks)
        (run/'callbacks_v008.json').write_text(json.dumps(callbacks,indent=2),encoding='utf-8')
        observed_parent_checks=[p for c in callbacks for p in c.get('parent_checks',[])]
        result['observed_parent_checks']=len(observed_parent_checks)
        result['passed_parent_checks']=sum(p['verdict']=='PASS' for p in observed_parent_checks)
        if len(observed_parent_checks)!=report['parent_readback_obligations'] or any(p['verdict']!='PASS' for p in observed_parent_checks):raise ValueError('Parent membership acceptance failed')
        expected={s['id'] for s in report['steps']}
        if native.returncode!=0 or passed!=expected or len(callbacks)!=len(expected) or {c['step'] for c in callbacks}!=expected or not all(c['valid'] for c in callbacks):raise ValueError('Native execution or callback acceptance failed')
        ix={c['step']:i for i,c in enumerate(callbacks)}
        for n in graph['nodes']:
            if any(ix[d]>=ix[n['id']] for d in n['depends_on']):raise ValueError('Executed dependency order mismatch')
        if max(ix[n['id']] for n in graph['nodes'] if n['phase']=='prefix')>=min(ix[n['id']] for n in graph['nodes'] if n['phase']=='suffix'):raise ValueError('Prefix barrier mismatch')
        if 'Test Result: SUCCESS' not in log or not re.search(r'Selected:.*V008_COMPLETE',log):raise ValueError('Native completion receipt absent')
        result.update(status='V008_LIVE_POSITIVE_ACCEPTED',live_acceptance_passed=True,live_vikunja=True,scope='OWN_CREATED_RESOURCES; NO_CLEAN_DATABASE_RESET')
    except Exception as e:
        result['error']=type(e).__name__+': '+str(e)
        for secret in (token,password):
            if secret:result['error']=result['error'].replace(secret,'<redacted>')
    finally:
        (run/'result_v008.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
        # Native products may contain auth headers. Export only whitelisted sanitized evidence.
        files=[f for f in run.iterdir() if f.is_file() and f.suffix in ('.json','.txt','.log')]
        if report:
            files += [run/'project/generation_report_v008.json',run/'project/spec/js/model.v008.js',run/'project/config/provengo.yml']
        forbidden=False
        for f in files:
            data=f.read_text(encoding='utf-8');
            if token and token in data:forbidden=True
            if re.search(r'eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',data):forbidden=True
        if forbidden:
            print('SECRET_SCAN_REJECTED: review ZIP not exported.');return 1
        manifest={f.relative_to(run).as_posix():sha(f.read_bytes()) for f in files}
        mp=run/'manifest_v008.json';mp.write_text(json.dumps(manifest,indent=2),encoding='utf-8')
        with zipfile.ZipFile(run/'review_v008.zip','w',zipfile.ZIP_DEFLATED) as z:
            for f in files+[mp]:z.write(f,f.relative_to(run))
        print(result['status']);print('Review ZIP:',run/'review_v008.zip')
    return 0 if result['status'] in ('V008_LIVE_POSITIVE_ACCEPTED','V008_PREFLIGHT_PASS') else 1
if __name__=='__main__':raise SystemExit(main())
