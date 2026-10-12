"""Loopback recovery transport. It never chooses or reorders model events."""
import json, hashlib, re, urllib.request, urllib.error
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

def fingerprint(v):
    return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()

class RecoveryGateway:
    def __init__(self,target,token,backend,run,entities):
        self.session_tokens={'A':token}; self.active_session='A'
        self.target=target.rstrip('/'); self.token=token; self.backend=backend; self.run=Path(run)
        self.entities={e['name']:e for e in entities}; self.registry={}; self.prepared={}; self.outcomes={}
        self.records=[]; self.recoveries=[]; self.error=None; self.refresh_token=None; self.secrets=[token]; self.sensitive_fields={}
    def public_evidence(self,value):
        if isinstance(value,str):
            for secret in list(self.secrets):
                if secret:value=value.replace(secret,'[REDACTED]')
            return value
        if isinstance(value,list):return [self.public_evidence(x) for x in value]
        if isinstance(value,dict):
            result={k:self.public_evidence(v) for k,v in value.items()}
            if 'prefix_before' in result and 'prefix_restored' in result:
                result['unredacted_prefix_before_sha256']=value['prefix_before_sha256']
                result['unredacted_prefix_restored_sha256']=value['prefix_restored_sha256']
                result['prefix_before_sha256']=fingerprint(result['prefix_before'])
                result['prefix_restored_sha256']=fingerprint(result['prefix_restored'])
                result['export_fingerprint_scope']='redacted API projection; raw comparison performed internally'
            return result
        return value
    def record(self,record):
        record=self.public_evidence(dict(record,index=len(self.records),session=self.active_session)); self.records.append(record)
        with (self.run/'gateway-journal.jsonl').open('a',encoding='utf-8') as f:
            f.write(json.dumps(record,sort_keys=True)+'\n'); f.flush()
    def request(self,path,method='GET',body=None):
        if not path.startswith('/') or path.startswith('//') or '..' in path.split('/'):
            raise ValueError('Unsafe target path')
        headers={'Content-Type':'application/json','Authorization':'Bearer '+self.session_tokens[self.active_session]}
        req=urllib.request.Request(self.target+path,data=body,headers=headers,method=method)
        try:
            with urllib.request.urlopen(req,timeout=45) as r: return r.status,r.read()
        except urllib.error.HTTPError as r: return r.code,r.read()
    def ensure_auth(self,phase):
        saved=self.active_session
        try:
            identities=[]
            for session in sorted(self.session_tokens):
                self.active_session=session
                status,raw=self.request('/user')
                self.record({'category':'authentication','phase':phase,'session':session,'status':status})
                if status in (401,403):
                    if not self.refresh_token:raise RuntimeError('No session renewal configured')
                    value=self.refresh_token();self.session_tokens[session]=value;self.secrets.append(value)
                    if session=='A':self.token=value;self.backend.token=value
                    status,raw=self.request('/user')
                    self.record({'category':'authentication','phase':phase,'session':session,'status':status,'renewed':True})
                if status!=200:raise RuntimeError('Session authentication failed '+session)
                identities.append(json.loads(raw)['id'])
            if len(set(identities))!=1:raise RuntimeError('Sessions do not authenticate the same user')
            self.token=self.session_tokens['A'];self.backend.token=self.token
        finally:self.active_session=saved
    def observe(self):
        saved=self.active_session;views={}
        try:
            for session in sorted(self.session_tokens):
                self.active_session=session;result={}
                for logical,path in sorted(self.registry.items()):
                    status,raw=self.request(path)
                    if status!=200:raise RuntimeError('Recovery probe rejected: '+logical)
                    result[logical]=json.loads(raw)
                views[session]=result
            if any(v!=views['A'] for v in views.values()):raise RuntimeError('Session API projections disagree')
            return views['A']
        finally:self.active_session=saved
    def dispatch(self,path,method,body,headers):
        session=headers.get('X-SBT-Session','A')
        if session not in self.session_tokens:raise ValueError('Unknown session')
        self.active_session=session
        try:return self._dispatch(path,method,body,headers)
        finally:self.active_session='A'
    def _dispatch(self,path,method,body,headers):
        if self.error: raise RuntimeError('Recovery transport already stopped')
        action=headers.get('X-SBT-Action',''); logical=headers.get('X-SBT-LogicalId','')
        case=headers.get('X-SBT-CaseId','')
        if path.startswith('/__sbt/outcome/'):
            key=path.split('/')[-1]
            if method!='GET' or key!=case or key not in self.outcomes: raise ValueError('Unknown recovery outcome')
            self.record({'category':'recovery-control','case_id':case,'action':'outcome'})
            return 200,json.dumps(self.outcomes[key]).encode()
        if action=='negative_attempt':
            if not re.fullmatch(r'[A-Za-z0-9_.:-]+',case) or case in self.outcomes:
                raise ValueError('Invalid or repeated case identifier')
            if self.prepared.get(case)!=(logical,path) or self.registry.get(logical)!=path:
                raise ValueError('Negative attempt lacks matching preparation/registered resource')
            prefix=self.observe(); self.record({'category':'recovery-phase','case_id':case,'phase':'checkpoint-start'})
            snapshot=self.backend.save('before-'+case)
            self.record({'category':'recovery-phase','case_id':case,'phase':'checkpoint-saved','hashes':snapshot['hashes']})
            status=None;raw=b'';observed_status=None;observed=None;observation_error=None;operation_error=None;failed_snapshot=None
            try:
                self.ensure_auth('after-before-snapshot')
                try:
                    status,raw=self.request(path,method,body)
                    self.record({'category':'research','case_id':case,'action':action,'logical_id':logical,
                                 'path':path,'method':method,'input':json.loads(body),'status':status,
                                 'response':raw.decode('utf-8',errors='replace'),'before':prefix[logical]})
                except Exception as e:
                    operation_error=str(e)
                    self.record({'category':'operation-error','case_id':case,'error':operation_error})
                try:
                    observed_status,observed_raw=self.request(path)
                    self.record({'category':'post-write-observation','case_id':case,'path':path,
                                 'status':observed_status,'response':observed_raw.decode('utf-8',errors='replace')})
                    if observed_status==200: observed=json.loads(observed_raw)
                    else: observation_error='Original post-write GET returned HTTP '+str(observed_status)
                except Exception as e:
                    observation_error=str(e)
                    self.record({'category':'observation-error','case_id':case,'error':observation_error})
                if operation_error or observation_error or not 400<=status<500 or observed!=prefix[logical]:
                    failed_snapshot=self.backend.save('finding-'+case)
            finally:
                # Even failed authentication/observation must attempt verified rollback.
                self.record({'category':'recovery-phase','case_id':case,'phase':'restore-start'})
                self.backend.restore(snapshot)
                self.record({'category':'recovery-phase','case_id':case,'phase':'storage-restored'})
                self.ensure_auth('after-restore')
            verification=json.loads((self.run/'restore-verification-v010.json').read_text())
            restored=self.observe(); equal=prefix==restored
            if not verification.get('strict_equality') or not equal:
                raise RuntimeError('Restored storage/API prefix differs; continuation blocked')
            outcome={'case_id':case,'observed_after':observed,'observed_status':observed_status,
                     'observation_error':observation_error,'operation_error':operation_error,
                     'observation_available':observed is not None and observed_status==200,
                     'verified_after':restored[logical],'actual_status':status,
                     'snapshot_restored':True,'api_prefix_equal':equal,'safe_to_continue':True,
                     'prefix_before':prefix,'prefix_restored':restored,
                     'prefix_before_sha256':fingerprint(prefix),'prefix_restored_sha256':fingerprint(restored),
                     'snapshot_hashes':snapshot['hashes'],'finding_snapshot_hashes':failed_snapshot['hashes'] if failed_snapshot else None,
                     'storage_verification':verification}
            self.outcomes[case]=outcome; self.recoveries.append(outcome)
            self.record({'category':'recovery','case_id':case,'outcome':outcome})
            if operation_error: raise RuntimeError('Mutation transport failed; rollback verified; no automatic write retry')
            return status,raw
        status,raw=self.request(path,method,body)
        if action=='create' and 200<=status<300:
            if logical in self.registry: raise ValueError('Repeated logical resource creation')
            entity=self.entities[headers.get('X-SBT-Type','')]; value=json.loads(raw)
            for field in self.sensitive_fields.get(entity['name'],[]):
                secret=value.get(field)
                if isinstance(secret,str) and secret and secret not in self.secrets:self.secrets.append(secret)
            route=value[entity.get('route_field','id')]
            names=re.findall(r'\{([^}]+)\}',entity['path'])
            pattern=re.escape(entity['path'])
            for name in names:pattern=pattern.replace(re.escape('{'+name+'}'),r'([^/]+)')
            match=re.fullmatch(pattern,path)
            if not match:raise ValueError('Creation path does not match IR collection')
            values=dict(zip(names,match.groups()));values[entity['parameter']]=str(route)
            detail=entity['detail']
            for name,value in values.items():detail=detail.replace('{'+name+'}',value)
            if '{' in detail or '}' in detail:raise ValueError('Unbound nested detail route')
            self.registry[logical]=detail
        if action=='negative_prepare' and status==200:
            self.prepared[case]=(logical,path)
        self.record({'category':'research','action':action,'logical_id':logical,'case_id':case,
                     'path':path,'method':method,'status':status,
                     'input':json.loads(body) if body else None,'response':raw.decode('utf-8',errors='replace')})
        return status,raw
    def server(self):
        gateway=self
        class Handler(BaseHTTPRequestHandler):
            def log_message(self,*args): pass
            def do_GET(self): self.handle_request()
            def do_POST(self): self.handle_request()
            def do_PUT(self): self.handle_request()
            def do_DELETE(self): self.handle_request()
            def handle_request(self):
                try:
                    body=self.rfile.read(int(self.headers.get('Content-Length','0'))) or None
                    status,raw=gateway.dispatch(self.path,self.command,body,self.headers)
                except Exception as e:
                    gateway.error=str(e)
                    try: gateway.record({'category':'infrastructure-error','error':str(e)})
                    except OSError: pass
                    status,raw=503,json.dumps({'error':'Recovery blocked; inspect local journal'}).encode()
                self.send_response(status); self.send_header('Content-Type','application/json')
                self.send_header('Content-Length',str(len(raw))); self.end_headers(); self.wfile.write(raw)
        return HTTPServer(('127.0.0.1',0),Handler)
