import argparse,hashlib,json,subprocess,sys,zipfile,shutil
from pathlib import Path
from datetime import datetime,timezone
from analyze_samples_v101 import inspect_review,compare
ROOT=Path(__file__).resolve().parent

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def write(path,value):path.write_text(json.dumps(value,indent=2),encoding='utf-8')
def main():
 p=argparse.ArgumentParser();p.add_argument('--study-root',type=Path,required=True);p.add_argument('--jar',type=Path,required=True);p.add_argument('--campaign-config',type=Path,default=ROOT/'campaign-config-v101.json');p.add_argument('--run-live',action='store_true');a=p.parse_args()
 subprocess.run([sys.executable,str(ROOT/'Verify-Campaign-v101.py')],check=True)
 freeze=json.loads((ROOT/'FREEZE_v100.json').read_text());engine_zip=ROOT/'Vikunja_Generic_Isolation_v100.zip';baseline_zip=ROOT/'baseline-review-v100.zip'
 if sha(engine_zip)!=freeze['engine_zip_sha256'] or sha(baseline_zip)!=freeze['baseline_review_sha256']:raise ValueError('Frozen baseline differs')
 baseline=inspect_review(baseline_zip)
 if baseline['status']!='V100_SAMPLE_COMPLETED':raise ValueError('Baseline acceptance missing')
 config=json.loads(a.campaign_config.read_text())
 if set(config)!={'runs'} or not 1<=len(config['runs'])<=4:raise ValueError('Campaign requires one to four configured runs')
 for row in config['runs']:
  if set(row)!={'run_seed','sample_seed'} or any(type(v) is not int or v<1 for v in row.values()):raise ValueError('Invalid campaign seed configuration')
 if shutil.disk_usage(a.study_root).free<1024**3:raise RuntimeError('At least 1 GB free space required')
 campaign=a.study_root/'runs'/('sample-campaign-v101-'+datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S-%f'));campaign.mkdir(parents=True)
 engine=campaign/'engine-v100';engine.mkdir()
 with zipfile.ZipFile(engine_zip) as z:
  for name in z.namelist():
   if not (engine/name).resolve().is_relative_to(engine.resolve()):raise ValueError('Invalid engine archive path')
  z.extractall(engine)
 subprocess.run([sys.executable,str(engine/'Verify-v100.py')],check=True)
 reports=[baseline];receipts=[];private=campaign/'.private-config';private.mkdir();accepted=True;error=None
 try:
  for index,seeds in enumerate(config['runs'],1):
   print('V101_SAMPLE_START',index,'run_seed='+str(seeds['run_seed']),'sample_seed='+str(seeds['sample_seed']),flush=True)
   if not a.run_live:
    research=json.loads((engine/'input-source/research-config-v100.json').read_text());research['sampling']['seed']=seeds['sample_seed']
    research_path=campaign/('research-'+str(index)+'.json');write(research_path,research)
    subprocess.run([sys.executable,str(engine/'Build-Model-v100.py'),'--output',str(campaign/('static-'+str(index))),'--config',str(research_path)],check=True)
    continue
   runtime=json.loads((engine/'run-config.local.json').read_text());runtime['seed']=seeds['run_seed'];runtime_path=private/('runtime-'+str(index)+'.json');write(runtime_path,runtime)
   before={x.name for x in (a.study_root/'runs').glob('recovery-v100-*')}
   code=subprocess.run([sys.executable,str(engine/'run_recovery_v100.py'),'--study-root',str(a.study_root),'--jar',str(a.jar),'--run-config',str(runtime_path),'--sample-seed',str(seeds['sample_seed']),'--run-live']).returncode
   new=[x for x in (a.study_root/'runs').glob('recovery-v100-*') if x.name not in before]
   if len(new)!=1:raise RuntimeError('Cannot identify unique child run; preserve campaign folder')
   review=new[0]/'review_v100.zip'
   if not review.exists():raise RuntimeError('Child review absent; run='+str(new[0]))
   copied=campaign/('sample-'+str(index)+'-review_v100.zip');shutil.copy2(review,copied)
   analysis=inspect_review(copied);reports.append(analysis)
   receipts.append(dict(seeds,run_directory=str(new[0]),review_sha256=sha(copied),exit_code=code,status=analysis['status']))
   write(campaign/'comparison_v101.json',compare(reports));write(campaign/'child-runs-v101.json',receipts)
   if code!=0 or analysis['status'] not in ('V100_SAMPLE_COMPLETED','V100_TIME_BUDGET_STABLE_PARTIAL'):
    accepted=False;error='Child run not accepted; later samples not started';break
 except Exception as exc:accepted=False;error=str(exc)
 summary=compare(reports);summary.update(status=('V101_CAMPAIGN_COMPLETED' if a.run_live else 'V101_STATIC_READY') if accepted else 'NOT_ACCEPTED',live_execution=a.run_live,engine_modified=False,error=error,configured_samples=len(config['runs']),completed_child_runs=len(receipts),child_runs=receipts)
 write(campaign/'comparison_v101.json',summary);write(campaign/'campaign-launch-v101.json',config);write(campaign/'freeze-v100.json',freeze)
 # Exclude engine runtime config and snapshots; immutable evidence copies carry no JWTs.
 public=[x for x in campaign.iterdir() if x.is_file()]
 manifest={x.name:sha(x) for x in public};write(campaign/'manifest_v101.json',manifest)
 review=campaign/'review_v101.zip'
 with zipfile.ZipFile(review,'w',zipfile.ZIP_DEFLATED) as z:
  for x in public+[campaign/'manifest_v101.json']:z.write(x,x.name)
 print('Status:',summary['status']);print('Review ZIP:',review)
 if error:print('Error:',error)
 for row in summary['runs_in_order'][1:]:print('V101_SAMPLE_NOVELTY',row['run_seed'],'new_rules='+str(len(row['new_checked_rules'])),'new_abstract_states='+str(row['new_abstract_state_count']))
 return 0 if accepted else 1
if __name__=='__main__':raise SystemExit(main())
