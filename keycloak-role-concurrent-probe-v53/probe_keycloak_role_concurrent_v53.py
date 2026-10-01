#!/usr/bin/env python3
"""Isolated concurrent role PUT probe with independent connections and field readback."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import getpass
import json
import os
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url',default='http://127.0.0.1:9928')
    parser.add_argument('--username',default='admin')
    parser.add_argument('--trials',type=int,default=16)
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    if not 1<=args.trials<=32: raise ValueError('trials must be 1..32')
    base=args.base_url.rstrip('/')
    password=os.environ.get('KC_STAGE2_ADMIN_PASSWORD') or getpass.getpass('Keycloak admin password: ')
    form=urllib.parse.urlencode({'grant_type':'password','client_id':'admin-cli',
                                 'username':args.username,'password':password}).encode()
    request=urllib.request.Request(base+'/realms/master/protocol/openid-connect/token',form,
                    {'Content-Type':'application/x-www-form-urlencoded'},method='POST')
    with urllib.request.urlopen(request,timeout=20) as response:token=json.load(response)['access_token']
    realm='sbt_role_concurrent_'+uuid.uuid4().hex[:12]
    output={'realm':realm,'trials':[]}

    def call(method,path,obj=None):
        body=json.dumps(obj).encode() if obj is not None else None
        req=urllib.request.Request(base+path,body,{'Authorization':'Bearer '+token,
                   'Content-Type':'application/json'},method=method)
        start=time.perf_counter_ns()
        try: response=urllib.request.urlopen(req,timeout=30)
        except urllib.error.HTTPError as exc:response=exc
        with response:
            raw=response.read();end=time.perf_counter_ns()
            try:value=json.loads(raw)
            except (ValueError,UnicodeDecodeError):value=None
            return {'status':response.status,'value':value,'start_ns':start,'end_ns':end}

    try:
        output['create_realm']=call('POST','/admin/realms',{'realm':realm,'enabled':True})['status']
        if output['create_realm']!=201:return
        collection='/admin/realms/'+realm+'/roles'
        for i in range(args.trials):
            name='sbt-v53-'+str(i);path=collection+'/'+name;trial={'trial':i}
            output['trials'].append(trial)
            trial['create']=call('POST',collection,{'name':name})['status']
            if trial['create']!=201:continue
            initial=call('GET',path)
            if initial['status']!=200 or not isinstance(initial['value'],dict):
                trial['read_initial']=initial['status'];continue
            first=dict(initial['value'],description='sbt-serial-v53')
            trial['serial_put']=call('PUT',path,first)['status']
            state=call('GET',path)
            if state['status']!=200 or not isinstance(state['value'],dict):
                trial['read_base']=state['status'];continue
            baseline=state['value'];a=dict(baseline,description='sbt-race-A-v53')
            b=dict(baseline,attributes={'sbt_race':['sbtrace_v53']})
            gate=threading.Barrier(3)
            def worker(side,payload):
                gate.wait(timeout=10)
                response=call('PUT',path,payload)
                return side,response
            with ThreadPoolExecutor(max_workers=2) as pool:
                fa=pool.submit(worker,'A',a);fb=pool.submit(worker,'B',b)
                gate.wait(timeout=10)
                results=dict((side,response) for side,response in (fa.result(),fb.result()))
            after=call('GET',path)
            overlap=max(0,min(results['A']['end_ns'],results['B']['end_ns'])-
                        max(results['A']['start_ns'],results['B']['start_ns']))
            observed=after['value'] if isinstance(after['value'],dict) else {}
            actual={'description':observed.get('description'),'attributes':observed.get('attributes')}
            expected_a={'description':a.get('description'),'attributes':a.get('attributes')}
            expected_b={'description':b.get('description'),'attributes':b.get('attributes')}
            trial.update(A=results['A']['status'],B=results['B']['status'],
                         read=after['status'],client_interval_overlap_ns=overlap,
                         observed=actual,expected_A=expected_a,expected_B=expected_b,
                         matches_A=actual==expected_a,matches_B=actual==expected_b)
        output['unexpected_trials']=[t['trial'] for t in output['trials'] if
            t.get('read')==200 and t.get('A')==204 and t.get('B')==204 and
            not t.get('matches_A') and not t.get('matches_B')]
    finally:
        if output.get('create_realm')==201:
            output['cleanup']=call('DELETE','/admin/realms/'+realm)['status']
        rendered=json.dumps(output,indent=2)+'\n'
        if args.output:
            args.output.write_text(rendered,encoding='utf-8')
            print(json.dumps({'trials':len(output['trials']),
                              'unexpected_trials':output.get('unexpected_trials',[]),
                              'cleanup':output.get('cleanup'),
                              'report':str(args.output)},indent=2))
        else:
            print(rendered)


if __name__=='__main__':main()
