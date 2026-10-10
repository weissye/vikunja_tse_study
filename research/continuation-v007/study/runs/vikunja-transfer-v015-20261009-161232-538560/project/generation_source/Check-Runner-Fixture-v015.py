"""Full runner integration against a synthetic loopback API, never real Vikunja."""
import argparse,hashlib,json,os,pathlib,subprocess,sys,tempfile,threading,zipfile
from http.server import HTTPServer,BaseHTTPRequestHandler
ROOT=pathlib.Path(__file__).resolve().parent
def main():
    p=argparse.ArgumentParser();p.add_argument('--jar',required=True,type=pathlib.Path);p.add_argument('--output',required=True,type=pathlib.Path);p.add_argument('--accept-invalid',action='store_true');p.add_argument('--write-on-reject',action='store_true');a=p.parse_args()
    contract=(ROOT/'live-contract-v015.json').read_bytes();state={};counter=[0]
    class H(BaseHTTPRequestHandler):
        def log_message(self,*args):pass
        def send(self,body,code=200):
            self.send_response(code);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(json.dumps(body).encode())
        def do_OPTIONS(self):
            self.send_response(204);self.send_header('Allow','OPTIONS, DELETE, GET, POST');self.end_headers()
        def call(self):
            parts=self.path.strip('/').split('/')
            if self.path.endswith('/info'):return self.send({'version':'v2.6.0'})
            if self.path.endswith('/docs.json'):return self.send(json.loads(contract))
            if self.path.endswith('/user'):return self.send({'id':1,'username':'fixture'})
            body={}
            if self.command in ('POST','PUT'):body=json.loads(self.rfile.read(int(self.headers.get('Content-Length',0))))
            if self.command=='PUT' and parts[-1] in ('projects','tasks','labels','teams'):
                kind=parts[-1];counter[0]+=1;record={'id':counter[0],**body}
                if kind=='tasks':
                    if ('projects',parts[-2]) not in state:return self.send({'error':'parent missing'},400)
                    record['project_id']=int(parts[-2])
                state[(kind,str(counter[0]))]=record;return self.send(record,201)
            kind,key=parts[-2:]
            if (kind,key) not in state:return self.send({'error':'missing'},404)
            if self.command in ('POST','PUT'):
                field='name' if kind=='teams' else 'title'
                value=body.get(field)
                invalid=not isinstance(value,str) or len(value)<1 or (kind!='tasks' and len(value)>250)
                if invalid and not a.accept_invalid:
                    if a.write_on_reject:state[(kind,key)].update(body)
                    return self.send({'message':'invalid object'},400)
                state[(kind,key)].update(body)
            return self.send(state[(kind,key)])
        do_GET=call;do_POST=call;do_PUT=call
    server=HTTPServer(('127.0.0.1',0),H);threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with tempfile.TemporaryDirectory() as td:
            env=os.environ.copy();env['SBT_VIKUNJA_TOKEN']='synthetic-fixture-token-v015'
            run=subprocess.run([sys.executable,str(ROOT/'run_v015.py'),'--study-root',td,'--contract',str(ROOT/'live-contract-v015.json'),'--base-url','http://127.0.0.1:'+str(server.server_port)+'/api/v1','--provengo-jar',str(a.jar.resolve())],capture_output=True,text=True,timeout=180,env=env)
            reviews=list(pathlib.Path(td).rglob('review_v015.zip'))
            if len(reviews)!=1:raise ValueError('Missing runner review: '+run.stdout+run.stderr)
            with zipfile.ZipFile(reviews[0]) as z:
                manifest=json.loads(z.read('manifest_v015.json'))
                assert all(hashlib.sha256(z.read(n)).hexdigest()==h for n,h in manifest.items())
                assert all(env['SBT_VIKUNJA_TOKEN'].encode() not in z.read(n) for n in z.namelist())
                result=json.loads(z.read('result_v015.json'))
            a.output.mkdir(parents=True,exist_ok=False)
            (a.output/'validation.json').write_text(json.dumps({'fixture_only':True,'real_vikunja_contacted':False,'runner_exit':run.returncode,'runner_status':result['status'],'negative_control':a.accept_invalid or a.write_on_reject,'callbacks':result.get('callbacks'),'negative_checks':result.get('passed_negative_checks'),'parent_checks':result.get('passed_parent_checks'),'manifest_files_verified':len(manifest),'secret_excluded':True},indent=2))
            print((a.output/'validation.json').read_text())
            if a.accept_invalid or a.write_on_reject:
                if run.returncode==0 or result['status']!='NOT_ACCEPTED':raise ValueError('Defective synthetic server unexpectedly accepted')
                with zipfile.ZipFile(reviews[0]) as z:
                    callbacks=json.loads(z.read('callbacks_v015.json'))
                if not any(c.get('negative_check') and c['negative_check']['verdict']!='PASS' for c in callbacks):raise ValueError('Missing negative control evidence')
            elif run.returncode!=0 or result['status']!='V015_LIVE_SCHEMA_NEGATIVE_ACCEPTED':raise ValueError('Synthetic integration failed: '+str(result))
    finally:server.shutdown()
if __name__=='__main__':main()
