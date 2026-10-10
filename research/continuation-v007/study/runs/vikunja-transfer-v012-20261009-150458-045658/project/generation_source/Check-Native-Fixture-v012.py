"""Native positive/negative acceptance fixture. This is not a live Vikunja run."""
import argparse,json,pathlib,threading,subprocess,os,hashlib,re
from http.server import HTTPServer,BaseHTTPRequestHandler
from analyze_v012 import analyze
from derive_v012 import build
from prepare_v012 import prepare
from generator_v56.transfer_prefix_v012 import compile_prefix
from generator_v56.transfer_stage5_v012 import write_full_package

def main():
 p=argparse.ArgumentParser();p.add_argument('--jar',required=True);p.add_argument('--contract',required=True);p.add_argument('--output',required=True,type=pathlib.Path);p.add_argument('--corrupt',action='store_true');p.add_argument('--wrong-parent',action='store_true');a=p.parse_args()
 raw=pathlib.Path(a.contract).read_bytes();doc,cat,rules,selection,graph=prepare(raw,1,0,1,'all')
 state={};receipts=[];counter=[0]
 class H(BaseHTTPRequestHandler):
  def log_message(self,*args):pass
  def call(self):
   parts=self.path.strip('/').split('/');body={};code=200
   if self.command in ('POST','PUT'):body=json.loads(self.rfile.read(int(self.headers.get('Content-Length',0))))
   creating=self.command=='PUT' and parts[-1] in ('projects','tasks','labels','teams')
   if creating:
    resource=parts[-1];counter[0]+=1;record={'id':counter[0],**body};state[(resource,str(record['id']))]=record;code=201
    if resource=='tasks':
     if ('projects',parts[-2]) not in state:raise ValueError('Missing parent')
     record['project_id']=int(parts[-2])
   else:
    resource,key=parts[-2:];record=state[(resource,key)]
    if self.command in ('POST','PUT') and not a.corrupt:
     record.update(body)
     if resource=='tasks' and a.wrong_parent:record['project_id']=0
   receipts.append({'method':self.command,'path':self.path});self.send_response(code);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(json.dumps(record).encode())
  do_GET=call;do_POST=call;do_PUT=call
 server=HTTPServer(('127.0.0.1',0),H);threading.Thread(target=server.serve_forever,daemon=True).start();a.output.mkdir(parents=True,exist_ok=False)
 report=write_full_package(graph,rules,doc,'http://127.0.0.1:'+str(server.server_port)+'/api/v1',a.output/'project','fixture')
 env=os.environ.copy();env['SBT_VIKUNJA_TOKEN']='fixture-only'
 run=subprocess.run(['java','-jar',str(pathlib.Path(a.jar).resolve()),'run','--random-seed','1',str((a.output/'project').resolve())],env=env,capture_output=True,text=True,timeout=180)
 log=run.stdout+'\n'+run.stderr;(a.output/'native.log').write_text(log);passed=set(re.findall(r'V012_STEP_PASS ([^\r\n]+)',log))
 result={'version':'v012','fixture_only':True,'corrupt':a.corrupt,'wrong_parent':a.wrong_parent,'native_exit':run.returncode,'callbacks_passed':len(passed),'expected_callbacks':report['step_count'],'requests':len(receipts),'live_vikunja':False}
 (a.output/'validation.json').write_text(json.dumps(result,indent=2));print(json.dumps(result));server.shutdown()
 return 0 if (run.returncode!=0 and len(passed)<report['step_count'] if a.corrupt or a.wrong_parent else run.returncode==0 and len(passed)==report['step_count']) else 1
if __name__=='__main__':raise SystemExit(main())
