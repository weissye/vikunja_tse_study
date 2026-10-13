import json,sys,tempfile,copy,subprocess,re
from pathlib import Path
ROOT=Path(__file__).resolve().parent;sys.path.insert(0,str(ROOT/'runtime'))
from native_session_gateway import NativeSessionGateway
with tempfile.TemporaryDirectory() as tmp:
 run=Path(tmp);state={'/labels/1':{'id':1,'title':'valid'}};valid=set();logins=[]
 class Backend:
  token=''
  def save(self,label):
   valid.clear();return {'folder':label,'hashes':{'db':'fake'},'state':copy.deepcopy(state)}
  def restore(self,snapshot):
   state.clear();state.update(copy.deepcopy(snapshot['state']));valid.clear()
   (run/'restore-verification-v010.json').write_text(json.dumps({'strict_equality':True}))
 plan={'method':'POST','path':'/login','status':200,'token_field':'token'}
 g=NativeSessionGateway('http://127.0.0.1:3456/api/v1','',Backend(),run,[],login_plan=plan,login_interval=0)
 g.registry={'item':'/labels/1'}
 def fake(path,method='GET',body=None):
  if path=='/login':
   value=g.active_session+str(len(logins));valid.add(value);logins.append(g.active_session);return 200,json.dumps({'token':value}).encode()
  if g.session_tokens[g.active_session] not in valid:return 401,b'{}'
  if path=='/user':return 200,b'{"id":1}'
  if method=='POST':state[path].update(json.loads(body))
  return 200,json.dumps(state[path]).encode()
 g.request=fake
 def authenticate():
  for sid in ('A','B'):g.dispatch('/login','POST',b'{"username":"test","password":"test"}',{'X-SBT-Session':sid,'X-SBT-Action':'authenticate'})
 def h(action):return {'X-SBT-Action':action,'X-SBT-Session':'B','X-SBT-LogicalId':'item','X-SBT-CaseId':'NEG_B_item_0'}
 authenticate();g.dispatch('/labels/1','GET',None,h('negative_prepare'))
 g.dispatch('/__sbt/checkpoint/NEG_B_item_0','POST',None,h('checkpoint'))
 assert logins==['A','B'] # Transport NEVER logs in on its own after restart.
 authenticate();assert g.dispatch('/labels/1','POST',b'{"title":""}',h('negative_attempt'))[0]==200
 assert state['/labels/1']['title']=='valid' and len(logins)==4
 authenticate();code,raw=g.dispatch('/__sbt/outcome/NEG_B_item_0','GET',None,h('negative_readback'))
 outcome=json.loads(raw);assert code==200 and outcome['observed_after']['title']=='' and outcome['verified_after']['title']=='valid' and outcome['native_login_only']
 assert len(logins)==6 and outcome['api_prefix_equal']
 subprocess.run([sys.executable,str(ROOT/'Build-Model-v090.py'),'--output',str(run/'generated')],check=True)
 project=run/'generated/project'
 for p in (project/'spec/js').glob('*.js'):subprocess.run(['node','--check',str(p)],check=True)
 subprocess.run(['node',str(ROOT/'Test-Template-Instances-v090.js'),str(project)],check=True)
 subprocess.run(['node',str(ROOT/'Test-Native-Gate-v088.js'),str(project/'spec/js/stories.vikunja.js')],check=True)
 subprocess.run(['node',str(ROOT/'Test-Session-Context-v089.js'),str(project/'spec/js/dal.js')],check=True)
 subprocess.run(['node',str(ROOT/'Test-Callback-v088.js'),str(project/'spec/js/interfaces.vikunja.js')],check=True)
print('V090_LOCAL_PROTOCOL_AND_GENERATED_TEMPLATE_TESTS_PASS; native/live acceptance pending')
