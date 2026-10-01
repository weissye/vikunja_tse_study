#!/usr/bin/env python3
"""Execute 15 separate Provengo traces against a local Keycloak with clean fixtures."""
import argparse,getpass,json,os,pathlib,re,shutil,socket,subprocess,sys,time
import urllib.error,urllib.parse,urllib.request
import zstandard as zstd
import hashlib

HERE=pathlib.Path(__file__).resolve().parent

def token(base,user,password):
    form=urllib.parse.urlencode({'grant_type':'password','client_id':'admin-cli',
        'username':user,'password':password}).encode()
    request=urllib.request.Request(base+'/realms/master/protocol/openid-connect/token',form,
        {'Content-Type':'application/x-www-form-urlencoded'},method='POST')
    with urllib.request.urlopen(request,timeout=20) as response:return json.load(response)['access_token']

def realm_status(base,realm,bearer,method='GET'):
    url=base+'/admin/realms/'+urllib.parse.quote(realm,safe='')
    request=urllib.request.Request(url,headers={'Authorization':'Bearer '+bearer},method=method)
    try:
        with urllib.request.urlopen(request,timeout=20) as response:
            response.read();return response.status
    except urllib.error.HTTPError as error:
        code=error.code;error.close();return code

def wait_relay(process):
    for _ in range(60):
        if process.poll() is not None:raise RuntimeError('relay exited before Provengo run')
        try:
            with socket.create_connection(('127.0.0.1',9938),timeout=.3):return
        except OSError:time.sleep(.1)
    raise RuntimeError('relay did not open localhost:9938')

def interval_audit(path):
    records=[json.loads(line) for line in path.read_text().splitlines() if line.strip()]
    pairs=[r for r in records if r.get('method')=='RACE_PAIR']
    puts=[r for r in records if r.get('method')=='PUT' and r.get('pair_id')]
    return {'race_dispatches':len(pairs),'http_puts':len(puts),
            'overlapping_pairs':sum(bool(r['overlap']) for r in pairs),
            'non_2xx_puts':sum(not 200<=r['status']<300 for r in puts),
            'all_pairs_measured':len(pairs)==224 and len(puts)==448}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--jar',type=pathlib.Path)
    p.add_argument('--base-url',default='http://127.0.0.1:9928')
    p.add_argument('--username',default='admin')
    p.add_argument('--start',type=int,default=1);p.add_argument('--end',type=int,default=15)
    p.add_argument('--out',type=pathlib.Path,default=HERE/'runs/keycloak-15')
    p.add_argument('--timeout-seconds',type=int,default=7200)
    args=p.parse_args()
    assert 1<=args.start<=args.end<=15
    if args.jar:
        jar=args.jar.resolve()
        if not jar.is_file():raise FileNotFoundError(f'Provengo JAR not found: {jar}')
        provengo=['java','-jar',str(jar)]
    else:
        executable=shutil.which('provengo')
        if not executable:raise FileNotFoundError('provengo command not found on PATH')
        provengo=[executable]
    base=args.base_url.rstrip('/')
    password=os.environ.get('KC_STAGE2_ADMIN_PASSWORD') or getpass.getpass('Keycloak admin password: ')
    project=HERE/'provengo_project'
    story=(project/'spec/js/stories.keycloak_stage2.js').read_text()
    realms=sorted(set(re.findall(r'__args\.realm="(realm_[0-9]+)"',story)))
    if not realms:raise RuntimeError('no generated fixture realms found; cannot verify clean runs')
    selection=json.loads((HERE/'selection.json').read_text())
    assert selection['candidate_count']==150 and len(selection['selected_numbers'])==15
    args.out.mkdir(parents=True,exist_ok=True)
    summary_file=args.out/'campaign-summary.json'
    if summary_file.exists():
        summary=json.loads(summary_file.read_text())
        if summary.get('selected_numbers')!=selection['selected_numbers']:
            raise RuntimeError('previous campaign belongs to a different selection')
    else:
        summary={'selected_numbers':selection['selected_numbers'],'runs':[]}
    completed=summary['runs']
    if [r['ordinal'] for r in completed]!=list(range(1,args.start)) or any(
        r['provengo_exit']!=0 or not r['interval_audit'].get('all_pairs_measured') or
        r['interval_audit'].get('overlapping_pairs')!=224 or
        r['interval_audit'].get('non_2xx_puts')!=0 or
        r['cleanup']=='NOT_ATTEMPTED' or any(status!=204 for status in r['cleanup'].values())
        for r in completed):
        raise RuntimeError('prior runs are missing or incomplete; inspect campaign-summary.json')
    for ordinal in range(args.start,args.end+1):
        compressed=HERE/f'scenarios/run-{ordinal:02d}.json.zst'
        if not compressed.is_file():raise FileNotFoundError(compressed)
        run_dir=args.out/f'run-{ordinal:02d}'
        if run_dir.exists():raise FileExistsError(f'refusing to overwrite previous run: {run_dir}')
        run_dir.mkdir()
        audit=json.loads((HERE/f'audits/run-{ordinal:02d}.json').read_text())
        if hashlib.sha256(compressed.read_bytes()).hexdigest()!=audit['compressed_sha256']:
            raise RuntimeError(f'run {ordinal}: compressed JSON digest mismatch')
        source=run_dir/'scenario.json'
        full_digest=hashlib.sha256()
        with compressed.open('rb') as raw, zstd.ZstdDecompressor().stream_reader(raw) as reader, source.open('wb') as out:
            while block:=reader.read(1<<20):full_digest.update(block);out.write(block)
        if full_digest.hexdigest()!=audit['full_sha256']:
            raise RuntimeError(f'run {ordinal}: expanded JSON digest mismatch')
        bearer=token(base,args.username,password)
        existing={realm:realm_status(base,realm,bearer) for realm in realms}
        if any(status!=404 for status in existing.values()):
            raise RuntimeError(f'run {ordinal}: fixture realm already present or preflight failed: {existing}')
        relay_log=run_dir/'http-intervals.jsonl'
        env=dict(os.environ,KC_STAGE2_ADMIN_USER=args.username,
            KC_STAGE2_ADMIN_PASSWORD=password,KC_STAGE2_BASE_URL=base,
            KC_STAGE2_ACCESS_TOKEN=bearer)
        with (run_dir/'relay.stdout.txt').open('w') as relay_out, \
             (run_dir/'relay.stderr.txt').open('w') as relay_err:
            relay=subprocess.Popen([sys.executable,'-u',str(HERE/'measure_keycloak_http.py'),
                '--log',str(relay_log)],env=env,stdout=relay_out,stderr=relay_err)
            try:
                wait_relay(relay)
                with (run_dir/'provengo.log').open('w') as log:
                    try:
                        run=subprocess.run(provengo+['--batch-mode','run',
                            '--run-source',str(source),'--run-id','1','--output-file',
                            str(run_dir/'provengo-result.json'),str(project)],
                            env=env,stdout=log,stderr=subprocess.STDOUT,timeout=args.timeout_seconds)
                        exit_code=run.returncode
                    except subprocess.TimeoutExpired:exit_code=124
            finally:
                relay.terminate()
                try:relay.wait(timeout=10)
                except subprocess.TimeoutExpired:relay.kill();relay.wait()
        audit=interval_audit(relay_log) if relay_log.is_file() else {'all_pairs_measured':False}
        (run_dir/'interval-audit.json').write_text(json.dumps(audit,indent=2)+'\n')
        record={'ordinal':ordinal,'candidate':selection['selected_numbers'][ordinal-1],
                'provengo_exit':exit_code,'interval_audit':audit,'cleanup':'NOT_ATTEMPTED'}
        summary['runs'].append(record);summary_file.write_text(json.dumps(summary,indent=2)+'\n')
        if exit_code or not audit['all_pairs_measured'] or audit['overlapping_pairs']!=224 or audit['non_2xx_puts']:
            raise RuntimeError(f'run {ordinal} incomplete; fixture state preserved for inspection')
        bearer=token(base,args.username,password)
        created=[realm for realm in realms if realm_status(base,realm,bearer)==200]
        cleanup={realm:realm_status(base,realm,bearer,'DELETE') for realm in created}
        record['cleanup']=cleanup;summary_file.write_text(json.dumps(summary,indent=2)+'\n')
        if any(status!=204 for status in cleanup.values()):
            raise RuntimeError(f'run {ordinal}: fixture cleanup failed; stop before next run')
        remaining={realm:realm_status(base,realm,bearer) for realm in realms}
        if any(status!=404 for status in remaining.values()):
            raise RuntimeError(f'run {ordinal}: fixture remains after cleanup: {remaining}')
        # Keep the compressed, checksum-verified scenario and run evidence.
        # A completed run no longer needs its expanded working copy.
        source.unlink()
        print('CLEAN_RUN',ordinal,'candidate',record['candidate'],'overlaps',audit['overlapping_pairs'],flush=True)
    print('COMPLETE',len(summary['runs']),'separate runs',summary_file,flush=True)

if __name__=='__main__':main()
