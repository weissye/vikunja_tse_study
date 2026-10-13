import json,tempfile,threading,sys,re,time,subprocess
from pathlib import Path
root=Path(__file__).resolve().parent;sys.path.insert(0,str(root/'runtime'));sys.path.insert(0,str(root/'source'))
from native_log_capture import NativeLogCapture,valid_prefix
from generator_v56.render.route_expression import detail_route_expression
# Generic two-parent route, child + parent dependencies, unknown placeholder blocked.
e={'detail':'/books/{book}/readers/{reader}/loans/{loan}','parameter':'loan','path_dependencies':[{'parameter':'book'},{'parameter':'reader'}]}
expr=detail_route_expression(e)
assert 'PARENT_' in expr and '_book' in expr and '_reader' in expr
try:detail_route_expression(dict(e,path_dependencies=[]))
except ValueError:pass
else:raise AssertionError('Unbound parent must be rejected')
with tempfile.TemporaryDirectory() as temp:
 temp=Path(temp);subprocess.run([sys.executable,str(root/'Build-Model-v100.py'),'--output',str(temp/'generated')],check=True)
 text=(temp/'generated/project/spec/js/interfaces.vikunja.js').read_text()
 fn=text.split('function attemptNegativeModelsProjectView(',1)[1].split('function ',1)[0]
 assert '.replace("{project}","@{PARENT_"+key+"_project}")' in fn
 # Execute the actual emitted route expression with concrete independent IDs.
 actual=re.search(r'var url=(.*?);',fn).group(1)
 result=subprocess.check_output(['node','-e','var key="ModelsProjectView_3";console.log('+actual+')'],text=True).strip()
 result=result.replace('@{ROUTE_ModelsProjectView_3}','554').replace('@{PARENT_ModelsProjectView_3_project}','110')
 assert result=='/projects/110/views/554' and '{' not in result
 lines=[];fatal=threading.Event();g=type('G',(),{'secrets':['private-token']})()
 capture=NativeLogCapture(temp,g,lines,fatal)
 capture.raw_writer.write(b'INFO RECOVERY_CHECK {"caseId":"before","recovery_verified":true}\nWARN ERROR: invalid route private-token\nINFO SESSION_WORKFLOW_COMPLETE {"caseId":"after"}\n')
 capture.pump();capture.join()
 log=(temp/'native.log').read_text();assert fatal.is_set() and 'private-token' not in log and '[REDACTED]' in log
 assert 'RECOVERY_CHECK' in valid_prefix(log) and 'SESSION_WORKFLOW_COMPLETE' not in valid_prefix(log)
 # A descendant inheriting stdout does not keep a pipe reader or join alive.
 childdir=temp/'child';childdir.mkdir();cap=NativeLogCapture(childdir,g,[],threading.Event())
 script="import subprocess,sys;subprocess.Popen([sys.executable,'-c','import time;time.sleep(.3)']);print('ERROR: original cause',flush=True)"
 proc=subprocess.Popen([sys.executable,'-c',script],stdout=cap.raw_writer,stderr=subprocess.STDOUT);proc.wait(timeout=5)
 started=time.monotonic();cap.join();assert time.monotonic()-started<.2
 assert 'original cause' in (childdir/'native.log').read_text()
print('V100_ACTUAL_ROUTE_AND_FILE_CAPTURE_PASS; native/live acceptance pending')
