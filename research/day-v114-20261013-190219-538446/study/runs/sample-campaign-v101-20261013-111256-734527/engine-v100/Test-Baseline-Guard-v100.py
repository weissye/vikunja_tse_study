from pathlib import Path
import tempfile,sys,json
root=Path(__file__).resolve().parent;sys.path.insert(0,str(root/'runtime'))
from native_session_gateway import NativeSessionGateway
with tempfile.TemporaryDirectory() as tmp:
 run=Path(tmp);saved=[]
 class Backend:
  token=''
  def save(self,label):saved.append(label);return {'hashes':{'fake':'fake'}}
 g=NativeSessionGateway('http://127.0.0.1:3456/api/v1','',Backend(),run,[],login_plan={'path':'/login','method':'POST','status':200,'token_field':'token'})
 g.registry={'parent':'/projects/1'};g.prepared={'case':('parent','/projects/1')}
 g.preparation_baselines={'case':{'title':'valid','updated':'before','views':[{'title':'A'}]}}
 g.ensure_auth=lambda phase:None
 g.observe=lambda:{'parent':{'title':'valid','updated':'later','views':[{'title':'B'}]}}
 headers={'X-SBT-Action':'checkpoint','X-SBT-CaseId':'case','X-SBT-LogicalId':'parent'}
 try:g.dispatch('/__sbt/checkpoint/case','POST',None,headers)
 except RuntimeError as e:assert 'baseline drift' in str(e)
 else:raise AssertionError('Stale preparation must be rejected')
 assert not saved and 'case' not in g.checkpoints
 assert g.records[-1]['phase']=='BASELINE_DRIFT_BEFORE_CHECKPOINT'
 g.observe=lambda:{'parent':g.preparation_baselines['case']}
 assert g.dispatch('/__sbt/checkpoint/case','POST',None,headers)[0]==200
 assert len(saved)==1 and g.checkpoints['case'][1]['parent']==g.preparation_baselines['case']
print('V100_BASELINE_GUARD_PASS: stale baseline stopped before mutation/snapshot; valid baseline retained')
