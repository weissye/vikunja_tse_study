"""Recovery transport with login requests exclusively actuated by native model events."""
import json,time,re
from recovery_gateway import RecoveryGateway,fingerprint
class NativeSessionGateway(RecoveryGateway):
 def __init__(self,*args,login_plan,login_interval=7,**kwargs):
  super().__init__(*args,**kwargs);self.session_tokens={'A':'','B':''};self.login_plan=login_plan
  self.checkpoints={};self.pending={};self.last_login=0;self.login_interval=login_interval
 def ensure_auth(self,phase):
  # Validation only. There is deliberately NO external renewal function.
  saved=self.active_session;identities=[]
  try:
   for sid in ('A','B'):
    self.active_session=sid;status,raw=self.request('/user')
    if status!=200:raise RuntimeError('Native login required before '+phase+' for '+sid)
    identities.append(json.loads(raw)['id']);self.record({'category':'authentication-validation','phase':phase,'user_id':identities[-1],'status':status})
   if len(set(identities))!=1:raise RuntimeError('Sessions authenticate different users')
  finally:self.active_session=saved
 def _dispatch(self,path,method,body,headers):
  action=headers.get('X-SBT-Action','');case=headers.get('X-SBT-CaseId','');logical=headers.get('X-SBT-LogicalId','')
  if action=='authenticate':
   if method!=self.login_plan['method'] or path!=self.login_plan['path']:raise ValueError('Login must match contract operation')
   delay=max(0,self.login_interval-(time.monotonic()-self.last_login))
   if delay:time.sleep(delay)
   status,raw=self.request(path,method,body);self.last_login=time.monotonic()
   if status==self.login_plan['status']:
    token=json.loads(raw)[self.login_plan['token_field']];self.session_tokens[self.active_session]=token;self.secrets.append(token)
   self.record({'category':'research','action':'authenticate','path':path,'method':method,'status':status,'input':{'credentials':'[REDACTED]'},'response':raw.decode()})
   return status,raw
  if action=='checkpoint':
   if method!='POST' or path!='/__sbt/checkpoint/'+case or self.prepared.get(case)!=(logical,self.registry.get(logical)):raise ValueError('Checkpoint requires matching preparation')
   if case in self.checkpoints:raise ValueError('Duplicate checkpoint')
   self.ensure_auth('before-checkpoint');prefix=self.observe();snapshot=self.backend.save('before-'+case)
   self.checkpoints[case]=(logical,prefix,snapshot)
   self.record({'category':'recovery-phase','case_id':case,'phase':'checkpoint-saved','hashes':snapshot['hashes']})
   return 200,b'{}'
  if action=='negative_attempt':
   if case not in self.checkpoints:raise ValueError('Native checkpoint absent')
   item,prefix,snapshot=self.checkpoints[case]
   if logical!=item or path!=self.registry[logical]:raise ValueError('Checkpoint resource mismatch')
   self.ensure_auth('after-model-login');status=None;raw=b'';observed=None;obsstatus=None;obserror=None;operror=None;failed=None
   try:
    try:
     status,raw=self.request(path,method,body)
     self.record({'category':'research','action':action,'case_id':case,'logical_id':logical,'path':path,'method':method,'input':json.loads(body),'status':status,'response':raw.decode(),'before':prefix[logical]})
    except Exception as e:operror=str(e)
    try:
     obsstatus,obsraw=self.request(path)
     self.record({'category':'post-write-observation','case_id':case,'status':obsstatus,'response':obsraw.decode()})
     if obsstatus==200:observed=json.loads(obsraw)
     else:obserror='Post-write GET HTTP '+str(obsstatus)
    except Exception as e:obserror=str(e)
    if operror or obserror or not 400<=status<500 or observed!=prefix[logical]:failed=self.backend.save('finding-'+case)
   finally:self.backend.restore(snapshot)
   verification=json.loads((self.run/'restore-verification-v010.json').read_text())
   if not verification.get('strict_equality'):raise RuntimeError('Storage restore failed')
   self.pending[case]={'logical':logical,'prefix':prefix,'snapshot':snapshot,'status':status,'observed':observed,'obsstatus':obsstatus,'obserror':obserror,'operror':operror,'failed':failed,'verification':verification}
   if operror:raise RuntimeError('Mutation transport failed; storage restored; no write replay')
   return status,raw
  if path.startswith('/__sbt/outcome/'):
   if method!='GET' or path!='/__sbt/outcome/'+case or case not in self.pending:raise ValueError('Pending recovery outcome absent')
   item=self.pending.pop(case);self.ensure_auth('after-model-reauthentication');restored=self.observe();prefix=item['prefix']
   if restored!=prefix:raise RuntimeError('Whole observed prefix differs after restore')
   value={'case_id':case,'observed_after':item['observed'],'observed_status':item['obsstatus'],'observation_error':item['obserror'],'operation_error':item['operror'],'observation_available':item['observed'] is not None,'verified_after':restored[item['logical']],'actual_status':item['status'],'snapshot_restored':True,'api_prefix_equal':True,'safe_to_continue':True,'prefix_before':prefix,'prefix_restored':restored,'prefix_before_sha256':fingerprint(prefix),'prefix_restored_sha256':fingerprint(restored),'snapshot_hashes':item['snapshot']['hashes'],'finding_snapshot_hashes':item['failed']['hashes'] if item['failed'] else None,'storage_verification':item['verification'],'native_login_only':True}
   self.outcomes[case]=value;self.recoveries.append(value);self.record({'category':'recovery','case_id':case,'outcome':value})
   return 200,json.dumps(value).encode()
  return super()._dispatch(path,method,body,headers)
