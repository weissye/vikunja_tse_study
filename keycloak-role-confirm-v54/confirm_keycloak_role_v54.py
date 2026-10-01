#!/usr/bin/env python3
"""Confirm isolated mixed role outcomes with relay-measured overlapping PUTs."""
import argparse
import getpass
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import zipfile


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--study-root',type=Path,required=True)
    parser.add_argument('--base-url',default='http://127.0.0.1:9928')
    parser.add_argument('--trials',type=int,default=16)
    args=parser.parse_args()
    if not 1<=args.trials<=32:raise ValueError('trials must be 1..32')
    base=args.base_url.rstrip('/')
    password=os.environ.get('KC_STAGE2_ADMIN_PASSWORD') or getpass.getpass('Keycloak admin password: ')
    user='admin'

    def token():
        form=urllib.parse.urlencode({'grant_type':'password','client_id':'admin-cli',
                                     'username':user,'password':password}).encode()
        req=urllib.request.Request(base+'/realms/master/protocol/openid-connect/token',form,
                  {'Content-Type':'application/x-www-form-urlencoded'},method='POST')
        with urllib.request.urlopen(req,timeout=20) as response:return json.load(response)['access_token']
    access=token()
    def call(method,url,obj=None):
        data=json.dumps(obj).encode() if obj is not None else None
        req=urllib.request.Request(url,data,{'Authorization':'Bearer '+access,
              'Content-Type':'application/json'},method=method)
        try:response=urllib.request.urlopen(req,timeout=30)
        except urllib.error.HTTPError as exc:response=exc
        with response:
            raw=response.read()
            try:value=json.loads(raw)
            except (UnicodeDecodeError,ValueError):value=None
            return response.status,value

    relay_script=Path(__file__).with_name('measure_keycloak_http_v54.py')
    with socket.socket() as sock:
        if sock.connect_ex(('127.0.0.1',9938))==0:
            raise RuntimeError('Port 9938 is in use; stop the prior relay before this isolated probe')
    realm='sbt_role_confirm_'+uuid.uuid4().hex[:12]
    report={'realm':realm,'trials':[],'interval_basis':'relay perf_counter_ns, after HTTP headers and before dispatch'}
    with tempfile.TemporaryDirectory(prefix='sbt-role-v54-') as folder:
        log=Path(folder)/'intervals.jsonl'
        env=dict(os.environ,KC_STAGE2_BASE_URL=base,KC_STAGE2_ADMIN_USER=user,
                 KC_STAGE2_ADMIN_PASSWORD=password)
        relay=subprocess.Popen([sys.executable,'-u',str(relay_script),'--log',str(log)],
                               env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        created=False
        try:
            for _ in range(100):
                if relay.poll() is not None:raise RuntimeError('Relay exited during startup')
                try:
                    with socket.create_connection(('127.0.0.1',9938),timeout=.3):break
                except OSError:time.sleep(.05)
            else:raise RuntimeError('Relay startup timed out')
            report['create_realm']=call('POST',base+'/admin/realms',
                                        {'realm':realm,'enabled':True})[0]
            created=report['create_realm']==201
            if not created:raise RuntimeError('Could not create isolated realm')
            collection='/admin/realms/'+realm+'/roles'
            for i in range(args.trials):
                name='sbt-v54-'+str(i);path=collection+'/'+name
                item={'trial':i,'path':path};report['trials'].append(item)
                item['create']=call('POST',base+collection,{'name':name})[0]
                if item['create']!=201:continue
                status,initial=call('GET',base+path)
                if status!=200 or not isinstance(initial,dict):
                    item['read_initial']=status;continue
                item['serial_put']=call('PUT',base+path,dict(initial,description='sbt-serial-v54'))[0]
                status,baseline=call('GET',base+path)
                if status!=200 or not isinstance(baseline,dict):
                    item['read_base']=status;continue
                a=dict(baseline,description='sbt-race-A-v54')
                b=dict(baseline,attributes={'sbt_race':['sbtrace_v54']})
                query=urllib.parse.urlencode({'path':path})
                race_status,race=call('POST','http://127.0.0.1:9938/__sbt_race?'+query,
                                       {'method':'PUT','A':a,'B':b})
                item['race_response_status']=race_status
                item['race_response']=race
                status,observed=call('GET',base+path)
                actual={'description':observed.get('description'),
                        'attributes':observed.get('attributes')} if isinstance(observed,dict) else None
                fields=lambda value:{'description':value.get('description'),
                                     'attributes':value.get('attributes')}
                item.update(read=status,observed=actual,expected_A=fields(a),expected_B=fields(b),
                            matches_A=actual==fields(a),matches_B=actual==fields(b))
        finally:
            if created:
                try:report['cleanup']=call('DELETE',base+'/admin/realms/'+realm)[0]
                except Exception as exc:report['cleanup_error']=type(exc).__name__
            relay.terminate()
            try:relay.wait(timeout=10)
            except subprocess.TimeoutExpired:relay.kill();relay.wait()
            intervals=[json.loads(line) for line in log.read_text().splitlines() if line.strip()] if log.exists() else []
            pairs={x['path']:x for x in intervals if x.get('method')=='RACE_PAIR'}
            for item in report['trials']:
                pair=pairs.get(item['path'])
                if pair:
                    item['relay_pair']={k:pair[k] for k in
                        ('pair_id','attempt','overlap','overlap_ns','A','B') if k in pair}
            report['confirmed_mixed_trials']=[item['trial'] for item in report['trials']
                if item.get('read')==200 and item.get('race_response',{}).get('A')==204
                and item.get('race_response',{}).get('B')==204
                and item.get('relay_pair',{}).get('overlap') is True
                and not item.get('matches_A') and not item.get('matches_B')]
            target=args.study_root/'keycloak-role-confirm-v54-evidence.zip'
            with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as archive:
                archive.writestr('role-confirm-v54.json',json.dumps(report,indent=2)+'\n')
                archive.writestr('relay-intervals-v54.jsonl','\n'.join(json.dumps(x) for x in intervals)+'\n')
            print(json.dumps({'trials':len(report['trials']),
                'overlapping_pairs':sum(x.get('relay_pair',{}).get('overlap') is True for x in report['trials']),
                'confirmed_mixed_trials':report['confirmed_mixed_trials'],
                'cleanup':report.get('cleanup'),'evidence_zip':str(target)},indent=2))


if __name__=='__main__':main()
