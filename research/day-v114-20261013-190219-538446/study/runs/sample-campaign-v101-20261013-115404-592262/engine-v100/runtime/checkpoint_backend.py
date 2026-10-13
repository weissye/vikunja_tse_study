"""Two-rule native acceptance campaign; original generator and quiescent checkpoints."""
import argparse, copy, getpass, hashlib, json, os, re, subprocess, threading, time, urllib.error, urllib.request, zipfile, tarfile, shlex, uuid, shutil
from datetime import datetime, timezone
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer

ROOT=Path(__file__).resolve().parent
def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(path,value):path.write_text(json.dumps(value,indent=2),encoding='utf-8')
def request(url,method='GET',body=None,token=None):
 headers={'Content-Type':'application/json'}
 if token:headers['Authorization']='Bearer '+token
 r=urllib.request.Request(url,data=json.dumps(body).encode() if body is not None else None,headers=headers,method=method)
 try:
  with urllib.request.urlopen(r,timeout=30) as response:return response.status,response.read()
 except urllib.error.HTTPError as response:return response.code,response.read()
def json_request(url,**kwargs):
 status,body=request(url,**kwargs)
 if not 200<=status<300:raise RuntimeError('HTTP '+str(status)+' at '+url)
 return json.loads(body)
def native_markers(log,marker):return [json.loads(line.split(marker+' ',1)[1]) for line in log.splitlines() if marker+' ' in line]
def pack_review(run,result,records):
 write(run/'http-evidence.json',records);write(run/'result_v010.json',result)
 files=sorted(p for p in run.rglob('*') if p.is_file() and not any(part in ('.private-snapshots','products','__pycache__') for part in p.relative_to(run).parts) and p.name not in ('review_v010.zip','manifest_v010.json'))
 manifest={str(p.relative_to(run)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files};write(run/'manifest_v010.json',manifest)
 with zipfile.ZipFile(run/'review_v010.zip','w',zipfile.ZIP_DEFLATED) as archive:
  for p in files+[run/'manifest_v010.json']:archive.write(p,str(p.relative_to(run)))

class DockerVolumeBackend:
 """Cold backup/rollback of exclusive SQLite/files volumes; snapshots stay private."""
 def __init__(self,container,helper_container,url,token,run):
  if not re.fullmatch(r'[A-Za-z0-9_.-]+',container):raise ValueError('Invalid container name')
  self.container=container;self.url=url;self.token=token;self.run=run
  self.helper=self.command(['inspect','--format','{{.Image}}',helper_container]).strip()
  c=json.loads(self.command(['inspect',container]))[0]
  env=dict(item.split('=',1) for item in c['Config'].get('Env',[]) if '=' in item)
  if env.get('VIKUNJA_DATABASE_TYPE','sqlite')!='sqlite':raise ValueError('Only SQLite checkpoint adapter is implemented')
  if not env.get('VIKUNJA_DATABASE_PATH','').startswith('/db/'):raise ValueError('Database path must be explicitly configured under /db')
  self.mounts=[m for m in c['Mounts'] if m['Destination'] in ('/db','/app/vikunja/files')]
  if len(self.mounts)!=2 or any(m['Type']!='volume' or not m.get('Name') or not m['RW'] for m in self.mounts):raise ValueError('Requires exactly two writable named volumes at /db and /app/vikunja/files')
  ids=self.command(['ps','-aq']).split()
  if ids:
   others=json.loads(self.command(['inspect',*ids]))
   names={m['Name'] for m in self.mounts}
   if any(o['Id']!=c['Id'] and any(m.get('Name') in names for m in o['Mounts']) for o in others):raise ValueError('Checkpoint volumes are shared with another container')
  ports=c['HostConfig'].get('PortBindings',{}).get('3456/tcp',[])
  if not any(p.get('HostIp')=='127.0.0.1' and p.get('HostPort')=='3456' for p in ports):raise ValueError('Expected isolated local Vikunja at port 3456')
  write(run/'snapshot-adapter.json',{'kind':'COLD_NAMED_VOLUME_SNAPSHOT','container':container,'image':c['Image'],'helper_image':self.helper,'destinations':[m['Destination'] for m in self.mounts],'scope':'SQLite and files persistent volumes only; process clocks, queues and external services excluded'})
 def command(self,args):
  if len(args)==2 and args[0]=='start':
   from docker_start_retry import start_container
   def record(value):
    if hasattr(self,'run'):
     with (self.run/'docker-start-journal.jsonl').open('a',encoding='utf-8') as f:f.write(json.dumps(value)+'\n')
   return start_container(args[1],record=record)
  try:return subprocess.run(['docker',*args],check=True,capture_output=True,text=True,timeout=120).stdout
  except subprocess.CalledProcessError as error:raise RuntimeError('Docker '+args[0]+' failed: '+error.stderr.strip()[:1500]) from error
 def helper_command(self,directory,script):
  self.command(['run','--rm','--pull=never','--network','none','--user','0:0','--volumes-from',self.container,'--mount','type=bind,src='+str(directory.resolve())+',dst=/snapshot','--entrypoint','/bin/sh',self.helper,'-c',script])
 def ready(self):
  for _ in range(30):
   try:
    if json_request(self.url+'/info').get('version')=='v2.6.0':
     if hasattr(self,'refresh_token'):self.token=self.refresh_token()
     return
   except Exception:pass
   time.sleep(1)
  raise RuntimeError('Vikunja did not recover after checkpoint operation')
 def save(self,label):
  folder=self.run/'.private-snapshots'/label;folder.mkdir(parents=True,exist_ok=False)
  self.command(['stop',self.container])
  try:self.helper_command(folder,'set -eu; tar -C /db -cpf /snapshot/db.tar .; tar -C /app/vikunja/files -cpf /snapshot/files.tar .')
  finally:self.command(['start',self.container])
  self.ready()
  return {'folder':str(folder),'hashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in folder.glob('*.tar')}}
 def restore(self,snapshot):
  folder=Path(snapshot['folder'])
  if set(snapshot['hashes'])!={'db.tar','files.tar'}:raise ValueError('Incomplete snapshot')
  for name,h in snapshot['hashes'].items():
   if hashlib.sha256((folder/name).read_bytes()).hexdigest()!=h:raise ValueError('Snapshot integrity mismatch')
  self.command(['stop',self.container])
  # Removal is confined to the two exclusive study volumes being rolled back.
  self.helper_command(folder,'set -eu; find /db -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +; tar -C /db -xpf /snapshot/db.tar; find /app/vikunja/files -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +; tar -C /app/vikunja/files -xpf /snapshot/files.tar')
  # tar implementations can leave the root directory mtime changed by extraction.
  # Restore every archived directory's metadata, children before parents.
  commands=['set -eu']
  for name,destination in (('db.tar','/db'),('files.tar','/app/vikunja/files')):
   with tarfile.open(folder/name) as archive:
    directories=sorted((e for e in archive if e.isdir()),key=lambda e:e.name.count('/'),reverse=True)
    for entry in directories:
     relative=Path(entry.name)
     if relative.is_absolute() or '..' in relative.parts:raise ValueError('Unsafe archive directory')
     if int(entry.mtime)!=entry.mtime:raise ValueError('Subsecond directory timestamps are unsupported')
     path=destination+'/'+relative.as_posix() if relative.as_posix()!='.' else destination
     timestamp=datetime.fromtimestamp(entry.mtime,timezone.utc).strftime('%Y%m%d%H%M.%S')
     quoted=shlex.quote(path)
     commands.extend(['chown '+str(entry.uid)+':'+str(entry.gid)+' '+quoted,
                      'chmod '+format(entry.mode,'o')+' '+quoted,
                      'TZ=UTC touch -t '+shlex.quote(timestamp)+' '+quoted])
  self.helper_command(folder,'; '.join(commands))
  # Keep strict equality, including directory mtime. Never start on mismatch.
  check=folder/('restored-check-v010-'+uuid.uuid4().hex);check.mkdir(exist_ok=False)
  self.helper_command(check,'set -eu; tar -C /db -cpf /snapshot/db.tar .; tar -C /app/vikunja/files -cpf /snapshot/files.tar .')
  differences=[]
  for name in snapshot['hashes']:
   before,after=archive_tree(folder/name),archive_tree(check/name)
   differences.extend({'archive':name,'entry':key,'before':before.get(key),'after':after.get(key)} for key in sorted(set(before)|set(after)) if before.get(key)!=after.get(key))
  write(self.run/'restore-verification-v010.json',{'strict_equality':not differences,'includes_directory_mtime':True,'differences':differences})
  if differences:raise RuntimeError('Restored persistent volume tree differs from checkpoint; server remains stopped')
  self.command(['start',self.container]);self.ready()

def archive_tree(path):
 entries={}
 with tarfile.open(path) as archive:
  for entry in archive:
   stream=archive.extractfile(entry) if entry.isfile() else None
   content=None
   if stream:
    h=hashlib.sha256()
    for block in iter(lambda:stream.read(1024*1024),b''):h.update(block)
    content=h.hexdigest()
   if entry.name in entries:raise ValueError('Duplicate archive entry')
   entries[entry.name]={'type':entry.type.decode(),'mode':entry.mode,'uid':entry.uid,'gid':entry.gid,'mtime':entry.mtime,'link':entry.linkname,'sha256':content}
 return entries

