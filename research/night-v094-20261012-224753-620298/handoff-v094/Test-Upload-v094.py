import io,json,tempfile,zipfile,hashlib,sys,subprocess
from pathlib import Path
from upload_night_v094 import clean_archive,clean_text,git,rebuild_manifest
secret=b'test-local-password'
with tempfile.TemporaryDirectory() as tmp:
 raw=io.BytesIO()
 with zipfile.ZipFile(raw,'w',zipfile.ZIP_DEFLATED) as z:
  z.writestr('run-config.local.json',json.dumps({'password':secret.decode()}));z.writestr('unrelated.local.json',json.dumps({'password':'excluded'}));z.writestr('source.py','print("ready")')
  z.writestr('manifest_v093.json',json.dumps({'run-config.local.json':'old','source.py':'old'}))
 clean=clean_archive(raw.getvalue(),set())
 with zipfile.ZipFile(io.BytesIO(clean)) as z:
  assert json.loads(z.read('run-config.local.json'))['password']==secret.decode();m=json.loads(z.read('manifest_v093.json'))
  assert all(hashlib.sha256(z.read(n)).hexdigest()==h for n,h in m.items())
  assert 'unrelated.local.json' not in z.namelist()
  assert z.read('source.py')==b'print("ready")'
 token=b'eyJhbGciOiJIUzI1NiJ9'+b'.'+b'eyJpZCI6MX0'+b'.'+b'signatureABC'
 # Reproduce the actual empty-string replacement bug's bytes.
 corrupt=(b'prefix '+token+b'\n').replace(b'',b'[REDACTED]')
 assert token not in clean_text(corrupt,{secret})
 assert secret not in clean_text(b'password '+secret,{secret})
 # Real Git plumbing: preserve existing MAIN entries without a checkout.
 root=Path(tmp);remote=root/'remote.git';subprocess.run(['git','init','--bare',str(remote)],check=True,capture_output=True)
 seed=root/'seed';subprocess.run(['git','init',str(seed)],check=True,capture_output=True)
 git(seed,'config','user.name','Transfer Test');git(seed,'config','user.email','test@example.invalid')
 (seed/'original.txt').write_text('preserve');git(seed,'add','.');git(seed,'commit','-m','baseline');git(seed,'branch','-M','main');git(seed,'remote','add','origin',str(remote));git(seed,'push','origin','main')
 dest=root/'clone';git(None,'clone','--no-checkout','--single-branch','--branch','main',str(remote),str(dest));git(dest,'config','user.name','Transfer Test');git(dest,'config','user.email','test@example.invalid');git(dest,'read-tree','HEAD')
 (dest/'research').mkdir();(dest/'research/snapshot.txt').write_text('new');git(dest,'add','-f','--','research');git(dest,'commit','-m','snapshot');commit=git(dest,'rev-parse','HEAD');git(dest,'push','origin','HEAD:refs/heads/main')
 assert git(None,'ls-remote',str(remote),'refs/heads/main').split()[0]==commit
 assert git(dest,'show','HEAD:original.txt')=='preserve'
print('V094_AUTHORIZED_RESEARCH_CONFIG_TOKEN_SANITIZATION_MANIFEST_AND_REAL_GIT_WORKFLOW_PASS')
