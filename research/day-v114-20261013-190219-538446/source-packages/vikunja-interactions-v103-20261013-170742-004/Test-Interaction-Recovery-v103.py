import sys,json,tempfile,copy
from pathlib import Path
root=Path(__file__).resolve().parent;sys.path.insert(0,str(root/'runtime'))
from interaction_gateway import InteractionSessionGateway
with tempfile.TemporaryDirectory() as temp:
 run=Path(temp);state={'/r/1':{'id':1,'x':'initial-x','y':'initial-y'}};valid=set();calls=[]
 class Backend:
  token=''
  def save(self,label):valid.clear();return {'state':copy.deepcopy(state),'hashes':{'db':'fake'}}
  def restore(self,s):state.clear();state.update(copy.deepcopy(s['state']));valid.clear();(run/'restore-verification-v010.json').write_text(json.dumps({'strict_equality':True}))
 g=InteractionSessionGateway('http://127.0.0.1:3456/api/v1','',Backend(),run,[],login_plan={'path':'/login','method':'POST','status':200,'token_field':'token'},login_interval=0)
 g.registry={'r':'/r/1'};g.interaction_groups={'G':{'logical_id':'r','profile':'shared_read_disjoint_fields','write_method':'POST','session_fields':{'A':{'field':'x'},'B':{'field':'y'}}}}
 def fake(path,method='GET',body=None):
  if path=='/login':token='t'+str(len(calls));calls.append(path);valid.add(token);return 200,json.dumps({'token':token}).encode()
  if g.session_tokens[g.active_session] not in valid:return 401,b'{}'
  if path=='/user':return 200,b'{"id":1}'
  if method=='POST':state[path].update(json.loads(body))
  return 200,json.dumps(state[path]).encode()
 g.request=fake
 def login():
  for sid in ('A','B'):g.dispatch('/login','POST',b'{}',{'X-SBT-Session':sid,'X-SBT-Action':'authenticate'})
 def dispatch(action,sid='A',body=None):
  path='/r/1' if action in ('interaction_read','interaction_write','interaction_probe') else '/__sbt/interaction/'+action.removeprefix('interaction_')+'/G'
  method='POST' if action in ('interaction_checkpoint','interaction_write','interaction_restore') else 'GET'
  return g.dispatch(path,method,json.dumps(body).encode() if body is not None else None,{'X-SBT-Action':action,'X-SBT-GroupId':'G','X-SBT-LogicalId':'r','X-SBT-Session':sid})
 login();dispatch('interaction_checkpoint');assert len(calls)==2;login()
 dispatch('interaction_read','B');dispatch('interaction_read','A')
 dispatch('interaction_write','A',{'id':1,'x':'A','y':'initial-y'})
 dispatch('interaction_write','B',{'id':1,'x':'initial-x','y':'B'})
 dispatch('interaction_probe','A');dispatch('interaction_probe','B');dispatch('interaction_restore');assert len(calls)==4
 login();status,raw=dispatch('interaction_outcome');value=json.loads(raw)
 assert status==200 and value['safe_to_continue'] and value['group_protocol_valid'] and value['storage_equal'] and value['api_prefix_equal']
 assert value['shared_read_baseline_equal'] and value['probe_sessions_equal'] and value['observations'][0]['field']=='x' and not value['confirmed_semantic_bug']
 assert state['/r/1']=={'id':1,'x':'initial-x','y':'initial-y'} and len(calls)==6 and g.group_current is None
 print('V103_GROUP_PROTOCOL_AND_COLD_RESTORE_LOCAL_PASS: native-only reauth / B-first reads / observed stale replacement / verified baseline')
