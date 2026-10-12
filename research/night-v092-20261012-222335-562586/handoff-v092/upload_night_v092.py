"""Isolated non-forced MAIN upload, sanitized continuation snapshot."""
import argparse,hashlib,json,os,re,shutil,subprocess,tempfile,zipfile
from pathlib import Path
from datetime import datetime
REMOTE='https://github.com/weissye/vikunja_tse_study.git'
ALLOWED={'.json','.jsonl','.js','.py','.ps1','.md','.txt','.log','.yaml','.yml','.zip'}
EXCLUDE={'.private-snapshots','products','__pycache__','.git'}
JWT=re.compile(rb'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+')
MAX=90*1024*1024

def sha(data):return hashlib.sha256(data).hexdigest()
def excluded(name):
 p=Path(name)
 return any(part in EXCLUDE for part in p.parts) or (p.name.endswith('.local.json') and p.name!='run-config.local.json') or p.name=='.env' or p.suffix.lower() not in ALLOWED and p.name not in ('.gitignore','.gitattributes')
def credential_values(raw):
 try:
  value=json.loads(raw)
  return [value['password'].encode()] if isinstance(value,dict) and isinstance(value.get('password'),str) and value['password'] and not value['password'].startswith('FILL_') else []
 except (ValueError,UnicodeError):return []

def clean_text(raw,secrets):
 # v088's empty-string masking inserted REDACTED between characters. Decode only
 # that recognizable failure shape, then scrub tokens; derivative is labelled.
 if raw.count(b'[REDACTED]')>100 and b'[REDACTED][REDACTED]' in raw:
  raw=raw.replace(b'[REDACTED]',b'')
 raw=JWT.sub(b'[REDACTED_TOKEN]',raw)
 for secret in secrets:
  if secret and secret in raw:raw=raw.replace(secret,b'[REDACTED_SECRET]')
 return raw

def rebuild_manifest(entries):
 manifests=[n for n in entries if re.fullmatch(r'(?:MANIFEST|manifest)_v\d+\.json',n)]
 if not manifests:return
 latest=max(manifests,key=lambda n:int(re.search(r'v(\d+)',n)[1]))
 entries[latest]=json.dumps({n:sha(data) for n,data in sorted(entries.items()) if n!=latest},indent=2).encode()

def clean_archive(raw,secrets,depth=0):
 if depth>3:raise RuntimeError('Archive nesting exceeds audit bound')
 import io
 with zipfile.ZipFile(io.BytesIO(raw)) as z:
  for n in z.namelist():
   if n.endswith('.local.json'):secrets.update(credential_values(z.read(n)))
  entries={};changed=[]
  for item in z.infolist():
   if item.is_dir():continue
   name=item.filename.replace('\\','/')
   if name.startswith('/') or '..' in Path(name).parts:raise RuntimeError('Unsafe archive member')
   if item.file_size>=MAX:raise RuntimeError('Archive member exceeds transfer size bound')
   data=z.read(item)
   if excluded(name):changed.append(name+':excluded');continue
   cleaned=data if Path(name).name=='run-config.local.json' else clean_archive(data,secrets,depth+1) if name.lower().endswith('.zip') else clean_text(data,secrets)
   if cleaned!=data:changed.append(name+':sanitized')
   entries[name]=cleaned
 if not changed:return raw
 entries['SANITIZED_TRANSFER_v092.json']=json.dumps({'version':'v092','source_archive_sha256':sha(raw),'changes':changed,'authority':'SANITIZED_CONTINUATION_COPY; not byte-identical original delivery/evidence'},indent=2).encode()
 rebuild_manifest(entries)
 output=io.BytesIO()
 with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
  for n,data in sorted(entries.items()):z.writestr(n,data)
 return output.getvalue()

def git(repo,*args):
 cmd=['git',*(['-C',str(repo)] if repo else []),*args]
 result=subprocess.run(cmd,capture_output=True,text=True,encoding='utf-8',errors='replace',env=dict(os.environ,GIT_LFS_SKIP_SMUDGE='1'))
 if result.returncode:raise RuntimeError('Git failed: '+result.stderr[-2500:])
 return result.stdout.strip()

def main():
 p=argparse.ArgumentParser();p.add_argument('--study-root',type=Path,required=True);p.add_argument('--work-base',type=Path,required=True);p.add_argument('--downloads',type=Path,required=True);p.add_argument('--package-root',type=Path,required=True);a=p.parse_args()
 for path in (a.study_root,a.package_root):
  if not path.is_dir():raise RuntimeError('Required source root missing')
 stamp=datetime.now().strftime('%Y%m%d-%H%M%S-%f');workspace=a.work_base/('vikunja-upload-v092-'+stamp);repo=workspace/'r';relative='research/night-v092-'+stamp;target=repo/relative
 workspace.mkdir();print('V092_PREPARING_ISOLATED_MAIN',flush=True)
 git(None,'-c','core.longpaths=true','-c','core.autocrlf=false','clone','--filter=blob:none','--depth','1','--single-branch','--branch','main','--no-checkout',REMOTE,str(repo))
 git(repo,'config','core.longpaths','true');git(repo,'config','core.autocrlf','false');git(repo,'read-tree','HEAD');git(repo,'var','GIT_AUTHOR_IDENT');base=git(repo,'rev-parse','HEAD');target.mkdir(parents=True)
 (target/'.gitattributes').write_text('* -filter -text\n')
 secrets=set();local=a.package_root/'run-config.local.json'
 if local.exists():secrets.update(credential_values(local.read_bytes()))
 inventory=[];seen=set();reviews=0;packages=0
 def save(source,destination,kind):
  nonlocal reviews,packages
  if source.stat().st_size>=MAX:raise RuntimeError('Artifact exceeds transfer bound: '+str(source))
  raw=source.read_bytes();origin=sha(raw)
  if kind in ('review','package') and origin in seen:return
  clean=raw if source.name=='run-config.local.json' else clean_archive(raw,secrets) if source.suffix.lower()=='.zip' else clean_text(raw,secrets)
  for secret in secrets:
   if source.name!='run-config.local.json' and source.suffix.lower()!='.zip' and secret and secret in clean:raise RuntimeError('Credential scan failed; no push')
  if JWT.search(clean) and source.suffix.lower()!='.zip':raise RuntimeError('Token scan failed; no push')
  output=target/destination;output.parent.mkdir(parents=True,exist_ok=True);output.write_bytes(clean)
  if sha(output.read_bytes())!=sha(clean):raise RuntimeError('Copy hash mismatch')
  inventory.append({'Path':destination.replace('\\','/'),'SHA256':sha(clean),'SourceSHA256':origin,'Kind':kind,'Bytes':len(clean),'Sanitized':clean!=raw,'OriginalPath':str(source)})
  if kind in ('review','package'):seen.add(origin)
  if kind=='review':reviews+=1
  if kind=='package':packages+=1
 # Latest complete source plus explicitly authorized research configuration.
 for source in sorted(a.package_root.rglob('*')):
  if source.is_file() and not excluded(source.relative_to(a.package_root).as_posix()):save(source,'source-v091/'+source.relative_to(a.package_root).as_posix(),'source')
 # Recompute latest manifest for the transferred source copy.
 source_entries={p.relative_to(target/'source-v091').as_posix():p.read_bytes() for p in (target/'source-v091').rglob('*') if p.is_file()}
 rebuild_manifest(source_entries)
 for name,data in source_entries.items():
  out=target/'source-v091'/name
  if out.read_bytes()!=data:
   out.write_bytes(data)
   for entry in inventory:
    if entry['Path']=='source-v091/'+name:entry.update(SHA256=sha(data),Bytes=len(data),Sanitized=True)
 for source in sorted(a.downloads.glob('Vikunja*.zip')):
  if re.search(r'v0(?:69|7\d|8\d|9[0-2])(?:\D|$)',source.name) and 'Review' not in source.name and 'review' not in source.name:save(source,'packages/'+source.name,'package')
 runroot=a.study_root/'runs';today=datetime(2026,10,12).timestamp()
 if runroot.exists():
  for folder in sorted(runroot.iterdir()):
   if not folder.is_dir() or folder.stat().st_mtime<today:continue
   for source in sorted(folder.rglob('*')):
    if not source.is_file() or excluded(source.relative_to(folder).as_posix()):continue
    suffix=source.relative_to(folder).as_posix();kind='review' if re.fullmatch(r'review_v\d+\.zip',source.name) else 'run-source-evidence'
    save(source,'runs/'+folder.name+'/'+suffix,kind)
 generated=a.study_root/'generated'
 if generated.exists():
  for folder in sorted(generated.iterdir()):
   if folder.is_dir() and folder.stat().st_mtime>=today:
    for source in sorted(folder.rglob('*')):
     if source.is_file() and not excluded(source.relative_to(folder).as_posix()):save(source,'generated/'+folder.name+'/'+source.relative_to(folder).as_posix(),'generated')
 for source in Path(__file__).parent.iterdir():
  if source.is_file() and not excluded(source.name):save(source,'handoff-v092/'+source.name,'handoff')
 if not any(x['Kind']=='review' and 'review_v089.zip' in x['Path'] for x in inventory):raise RuntimeError('v089 review missing; preserve sources; no push')
 (target/'SHA256_v092.json').write_text(json.dumps(inventory,indent=2))
 (target/'SUMMARY_v092.json').write_text(json.dumps({'Version':'v092','BaseCommit':base,'Snapshot':relative,'FileCount':len(inventory),'ReviewCount':reviews,'PackageCount':packages,'Transfer':'User explicitly authorized research run-config.local.json with its password; runtime tokens sanitized; source hashes retained','Excluded':'private snapshots, Docker databases/files, runtime products, JAR, unrelated local configs','Continuation':'Source/JS/evidence only; active JVM and private checkpoints not migrated'},indent=2))
 for entry in inventory:
  if sha((target/entry['Path']).read_bytes())!=entry['SHA256']:raise RuntimeError('Final inventory mismatch')
 print('V092_LOCAL_SNAPSHOT_VERIFIED files='+str(len(inventory))+' reviews='+str(reviews),flush=True)
 git(repo,'add','-f','--',relative);git(repo,'commit','-m','Preserve Vikunja source and evidence through v091 with authorized research runtime config')
 commit=git(repo,'rev-parse','HEAD');git(repo,'push','origin','HEAD:refs/heads/main')
 remote=git(None,'ls-remote','--exit-code',REMOTE,'refs/heads/main').split()[0]
 if remote!=commit:raise RuntimeError('Remote MAIN differs; preserve workspace')
 receipt=a.downloads/('Vikunja_UPLOAD_RECEIPT_v092-'+stamp+'.json');receipt.write_text(json.dumps({'Version':'v092','Repository':REMOTE,'Commit':commit,'Snapshot':relative,'Verified':True,'SourceRoot':str(a.study_root),'Workspace':str(workspace)},indent=2))
 print('V092_MAIN_UPLOAD_VERIFIED\nCommit: '+commit+'\nSnapshot: '+relative+'\nReceipt: '+str(receipt),flush=True)
if __name__=='__main__':main()
