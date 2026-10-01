#!/usr/bin/env python3
"""Check both serial orders of the exact role fields used by the race oracle."""
import argparse
import getpass
import json
import os
import urllib.error
import urllib.parse
import urllib.request
import uuid


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:9928')
    parser.add_argument('--username', default='admin')
    args = parser.parse_args()
    base = args.base_url.rstrip('/')
    password = os.environ.get('KC_STAGE2_ADMIN_PASSWORD') or getpass.getpass('Keycloak admin password: ')
    body = urllib.parse.urlencode({'grant_type':'password','client_id':'admin-cli',
                                   'username':args.username,'password':password}).encode()
    req = urllib.request.Request(base+'/realms/master/protocol/openid-connect/token',body,
        {'Content-Type':'application/x-www-form-urlencoded'},method='POST')
    with urllib.request.urlopen(req,timeout=20) as response:
        token=json.load(response)['access_token']
    realm='sbt_role_serial_'+uuid.uuid4().hex[:12]
    result={'realm':realm,'orders':{}}

    def call(method,path,obj=None):
        payload=json.dumps(obj).encode() if obj is not None else None
        req=urllib.request.Request(base+path,payload,{'Authorization':'Bearer '+token,
            'Content-Type':'application/json'},method=method)
        try: response=urllib.request.urlopen(req,timeout=30)
        except urllib.error.HTTPError as exc: response=exc
        with response:
            raw=response.read()
            try: value=json.loads(raw)
            except (ValueError,UnicodeDecodeError): value=None
            return response.status,value

    def fields(obj):
        return {'description':obj.get('description'),'attributes':obj.get('attributes')}

    try:
        result['create_realm']=call('POST','/admin/realms',{'realm':realm,'enabled':True})[0]
        if result['create_realm']!=201: return
        collection='/admin/realms/'+urllib.parse.quote(realm,safe='')+'/roles'
        for label,order in [('A_then_B','AB'),('B_then_A','BA')]:
            check={};result['orders'][label]=check
            name='sbt-'+label.lower();path=collection+'/'+name
            check['create']=call('POST',collection,{'name':name})[0]
            if check['create']!=201: continue
            check['base_status'],base_obj=call('GET',path)
            if check['base_status']!=200 or not isinstance(base_obj,dict): continue
            before=fields(base_obj)
            a=dict(base_obj,description='sbt-description-v52')
            b=dict(base_obj,attributes={'sbt_race':['sbtrace_v52']})
            check['base']=before
            check['expected_A']=fields(a)
            check['expected_B']=fields(b)
            for side in order:
                check['put_'+side]=call('PUT',path,a if side=='A' else b)[0]
                status,actual=call('GET',path)
                check['read_after_'+side]=status
                if status==200 and isinstance(actual,dict):
                    check['fields_after_'+side]=fields(actual)
            final=check.get('fields_after_'+order[-1])
            check['matches_A']=final==fields(a)
            check['matches_B']=final==fields(b)
            check['both_changes_present']=(bool(final) and
                final['description']==a['description'] and
                final['attributes']==b['attributes'])
    finally:
        if result.get('create_realm')==201:
            result['cleanup']=call('DELETE','/admin/realms/'+realm)[0]
        print(json.dumps(result,indent=2))


if __name__=='__main__': main()
