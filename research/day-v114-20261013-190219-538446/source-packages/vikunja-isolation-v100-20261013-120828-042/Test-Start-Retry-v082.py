import sys,subprocess,json,tempfile,hashlib
from pathlib import Path
root=Path(__file__).resolve().parent;sys.path.insert(0,str(root/'runtime'))
from docker_start_retry import start_container,is_port_conflict
message='Ports are not available: exposing port TCP 127.0.0.1:3456: listen tcp 127.0.0.1:3456: bind: Only one usage of each socket address is normally permitted.'
class FakeDocker:
 def __init__(self,failures,reason=message,running=False):self.failures=failures;self.reason=reason;self.running=running;self.calls=[];self.starts=0
 def __call__(self,args,**kwargs):
  self.calls.append(args)
  if args[1]=='inspect':return subprocess.CompletedProcess(args,0,json.dumps({'Running':self.running,'Restarting':False}),'')
  assert args[1]=='start';self.starts+=1
  if self.starts<=self.failures:raise subprocess.CalledProcessError(1,args,stderr=self.reason)
  return subprocess.CompletedProcess(args,0,'test-container','')
logs=[];delays=[];fake=FakeDocker(2)
assert start_container('test-container',record=logs.append,run=fake,sleep=delays.append)=='test-container'
assert fake.starts==3 and delays==[2,4] and logs[-1]['status']=='START_COMMAND_SUCCEEDED'
assert all(x[1] in ('start','inspect') for x in fake.calls)
fake=FakeDocker(99);delays=[]
try:start_container('test-container',run=fake,sleep=delays.append)
except RuntimeError as e:assert '6 bounded' in str(e)
else:raise AssertionError('Bounded retry did not stop')
assert fake.starts==6 and delays==[2,4,8,10,10]
fake=FakeDocker(1,'No such container')
try:start_container('test-container',run=fake,sleep=lambda _:None)
except RuntimeError:pass
else:raise AssertionError('Unrelated failure swallowed')
assert fake.starts==1
fake=FakeDocker(9,running=True);logs=[]
assert start_container('test-container',run=fake,sleep=lambda _:None,record=logs.append)=='' and fake.starts==1
assert logs[-1]['status']=='ALREADY_RUNNING_REQUIRES_API_VERIFICATION'
assert not is_port_conflict('Other network failure')
# Exercise the actual backend command integration, used by both storage adapters.
from checkpoint_backend import DockerVolumeBackend
import docker_start_retry
with tempfile.TemporaryDirectory() as directory:
 backend=DockerVolumeBackend.__new__(DockerVolumeBackend);backend.run=Path(directory)
 original=docker_start_retry.start_container;fake=FakeDocker(1)
 docker_start_retry.start_container=lambda name,record:original(name,record=record,run=fake,sleep=lambda _:None)
 try:assert backend.command(['start','test-container'])=='test-container'
 finally:docker_start_retry.start_container=original
 journal=[json.loads(x) for x in (backend.run/'docker-start-journal.jsonl').read_text().splitlines()]
 assert journal[-1]['status']=='START_COMMAND_SUCCEEDED' and fake.starts==2
print('V082_BOUNDED_START_RETRY_TEST_PASS: transient recovery, bounded exhaustion, unrelated failure, already-running branch, no write replay')
