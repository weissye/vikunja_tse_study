"""Fresh work acceptance using unchanged v010 generator and host bind snapshots."""
import argparse, getpass, hashlib, json, os, shutil, stat, sys, uuid
from pathlib import Path
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'engine-v010'))
import checkpoint_backend as engine

def sha(path):
 h=hashlib.sha256()
 with open(path,'rb') as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return h.hexdigest()

def tree(root):
 result={}
 for p in [root,*sorted(root.rglob('*'))]:
  if p.is_symlink() or (getattr(p.lstat(),'st_file_attributes',0)&1024):raise ValueError('Links/reparse points are unsupported')
  s=p.stat();key=p.relative_to(root).as_posix()
  result[key]={'directory':p.is_dir(),'mtime_ns':s.st_mtime_ns,'mode':stat.S_IMODE(s.st_mode),'sha256':None if p.is_dir() else sha(p)}
 return result

def restore_metadata(root,manifest):
 for key,meta in sorted(manifest.items(),key=lambda x:len(Path(x[0]).parts),reverse=True):
  p=root/key
  os.chmod(p,meta['mode'])
  os.utime(p,ns=(p.stat().st_atime_ns,meta['mtime_ns']))

class BindBackend(engine.DockerVolumeBackend):
 def __init__(self,container,url,run,study_root=None):
  self.container=container;self.url=url;self.run=run;self.token=''
  c=json.loads(self.command(['inspect',container]))[0]
  env=dict(v.split('=',1) for v in c['Config'].get('Env',[]) if '=' in v)
  if env.get('VIKUNJA_DATABASE_TYPE')!='sqlite' or env.get('VIKUNJA_DATABASE_PATH')!='/db/vikunja.db':raise ValueError('Requires configured SQLite /db/vikunja.db')
  base=Path(study_root) if study_root is not None else Path(r'C:\work\temp\vikunja_tse_study')
  required={'/db':base/'deployment/state/db','/app/vikunja/files':base/'deployment/state/files'}
  self.mounts=[m for m in c['Mounts'] if m['Destination'] in required]
  if len(self.mounts)!=2:raise ValueError('Expected two bind mounts')
  for m in self.mounts:
   if m['Type']!='bind' or not m['RW'] or Path(m['Source']).resolve()!=required[m['Destination']].resolve():raise ValueError('Bind identity differs from diagnosed work paths')
   tree(required[m['Destination']])
  ids=self.command(['ps','-aq']).split()
  for other in json.loads(self.command(['inspect',*ids])) if ids else []:
   if other['Id']==c['Id']:continue
   for m in other['Mounts']:
    if m.get('Type')!='bind':continue
    p=Path(m['Source']).resolve()
    for r in required.values():
     r=r.resolve()
     if p==r or p in r.parents or r in p.parents:raise ValueError('Storage overlaps another container')
  ports=c['HostConfig'].get('PortBindings',{}).get('3456/tcp',[])
  if not any(p.get('HostIp')=='127.0.0.1' and p.get('HostPort')=='3456' for p in ports):raise ValueError('Expected localhost port 3456')
  if not c['State']['Running']:raise ValueError('Start the existing server first')
  self.roots={'db':required['/db'],'files':required['/app/vikunja/files']}
  engine.write(run/'snapshot-adapter.json',{'kind':'WINDOWS_BIND_COLD_COPY_V023','container':container,'image':c['Image'],'sources':{k:str(v) for k,v in self.roots.items()},'scope':'Content, relative paths, Windows mode and exact mtime_ns including root directories. ACLs, creation times, Linux ownership, process memory and external services are not covered.'})
 def save(self,label):
  folder=self.run/'.private-snapshots'/label;folder.mkdir(parents=True,exist_ok=False)
  self.command(['stop',self.container])
  try:
   metadata={}
   for key,root in self.roots.items():
    before=tree(root);shutil.copytree(root,folder/key,copy_function=shutil.copy2)
    restore_metadata(folder/key,before)
    if tree(folder/key)!=before:raise ValueError('Snapshot copy metadata/content mismatch')
    metadata[key]=before
   engine.write(folder/'trees.json',metadata)
   hashes={p.relative_to(folder).as_posix():sha(p) for p in folder.rglob('*') if p.is_file()}
  finally:self.command(['start',self.container])
  self.ready()
  return {'folder':str(folder),'hashes':hashes}
 def restore(self,snapshot):
  folder=Path(snapshot['folder'])
  actual={p.relative_to(folder).as_posix():sha(p) for p in folder.rglob('*') if p.is_file()}
  if actual!=snapshot['hashes']:raise ValueError('Private snapshot hash mismatch')
  metadata=json.loads((folder/'trees.json').read_text())
  for key in self.roots:
   if tree(folder/key)!=metadata[key]:raise ValueError('Private snapshot tree mismatch')
   tree(self.roots[key])
  self.command(['stop',self.container])
  for key,root in self.roots.items():
   for p in root.iterdir():
    if p.is_dir():shutil.rmtree(p)
    else:p.unlink()
   shutil.copytree(folder/key,root,dirs_exist_ok=True,copy_function=shutil.copy2)
   restore_metadata(root,metadata[key])
  differences={k:tree(r)!=metadata[k] for k,r in self.roots.items()}
  engine.write(self.run/'restore-verification-v010.json',{'strict_equality':not any(differences.values()),'includes_directory_mtime':True,'host_mtime_precision':'nanoseconds','differences':differences,'adapter_version':'v023'})
  if any(differences.values()):raise RuntimeError('Host bind restoration mismatch; server remains stopped')
  self.command(['start',self.container]);self.ready()
