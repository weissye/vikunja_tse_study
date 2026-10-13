import sys,json,tempfile,subprocess,hashlib,copy
from pathlib import Path
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'runtime'));sys.path.insert(0,str(ROOT/'source'))
from recovery_gateway import RecoveryGateway
from generic_emitter import emit
with tempfile.TemporaryDirectory() as tmp:
 out=Path(tmp)/'generated'
 subprocess.run([sys.executable,str(ROOT/'Build-Acceptance-v087.py'),'--output',str(out)],check=True)
 g=json.loads((out/'project/GENERATION_v071.json').read_text())
 assert len(g['shared_session_workflows'])==6
 assert sum(map(len,g['instance_bindings'].values()))==24
 assert g['negative_checks']==18
 js=out/'project/spec/js';assert len(list(js.glob('*.js')))==3
 for p in js.glob('*.js'):subprocess.run(['node','--check',str(p)],check=True)
 i=(js/'interfaces.vikunja.js').read_text();s=(js/'stories.vikunja.js').read_text()
 assert 'X-SBT-Session' in i and 'session:session||"A"' in i
 assert s.count('bthread("SESSION_')==6
 assert s.count('readers:["A","B"]')==6
 assert 'SharedAcquire' in s and 'SharedRelease' in s
 # Single-session rendering remains byte compatible at the same URL.
 cfg=json.loads((out/'research-config.json').read_text());cfg['actors']={'users':1,'sessions_per_user':1}
 (out/'single.json').write_text(json.dumps(cfg));emit(out/'contract-ir.json',out/'single.json',out/'single')
 subprocess.run([sys.executable,str(ROOT/'Build-Acceptance-v082.py'),'--output',str(Path(tmp)/'old')],check=True)
 for p in (out/'single/spec/js').glob('*.js'):
  assert p.read_bytes()==(Path(tmp)/'old/project/spec/js'/p.name).read_bytes(),p.name
 # Verify that transport uses each session's token, then renews BOTH sessions.
 import recovery_gateway as mod
 requests=[]
 class Reply:
  status=200
  def __enter__(self):return self
  def __exit__(self,*args):pass
  def read(self):return b'{"id":1}'
 original=mod.urllib.request.urlopen
 def fake(req,**kw):requests.append(req.get_header('Authorization'));return Reply()
 mod.urllib.request.urlopen=fake
 try:
  backend=type('Backend',(),{'token':'a'})()
  gate=RecoveryGateway('http://127.0.0.1:3456/api/v1','a',backend,Path(tmp),[])
  gate.session_tokens={'A':'a','B':'b'};gate.active_session='B'
  gate.request('/user');assert requests[-1]=='Bearer b'
  gate.ensure_auth('test');assert requests[-2:]==['Bearer a','Bearer b'];assert gate.active_session=='B'
  gate.registry={'item':'/items/1'};assert gate.observe()=={'item':{'id':1}}
  assert requests[-2:]==['Bearer a','Bearer b']
 finally:mod.urllib.request.urlopen=original
 # Authentication renewal after restart is independent for each session.
 replies={'A':0,'B':0};renew=[]
 def expired(path,method='GET',body=None):
  session=gate.active_session;replies[session]+=1
  return (401,b'{}') if replies[session]==1 else (200,b'{"id":1}')
 gate.request=expired;gate.refresh_token=lambda:renew.append(gate.active_session) or 'renew-'+gate.active_session
 gate.ensure_auth('restart');assert renew==['A','B'];assert gate.session_tokens=={'A':'renew-A','B':'renew-B'}
print('V087_STATIC_AND_TRANSPORT_TESTS_PASS; native/live execution not performed')
