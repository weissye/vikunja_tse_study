#!/usr/bin/env python3
"""Version-pinned serial controls for Immich tag upsert and notification visibility."""
import argparse
import csv
import hashlib
import json
import re
import sys
import time
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

from run_immich_album_serial import authenticate, call, validate_spec

OPS = {('post', '/tags'): 'createTag', ('get', '/tags/{id}'): 'getTagById',
       ('get', '/tags'): 'getAllTags', ('put', '/tags'): 'upsertTags',
       ('post', '/admin/notifications'): 'createNotification',
       ('get', '/notifications/{id}'): 'getNotification',
       ('get', '/notifications'): 'getNotifications',
       ('get', '/users/me'): 'getMyUser', ('get', '/server/version'): 'getServerVersion'}


def safe_message(body):
    msg = body.get('message') if isinstance(body, dict) else None
    if isinstance(msg, list):
        msg = ' | '.join(str(item) for item in msg[:3])
    if not isinstance(msg, str):
        return None
    # Preserve the useful error diagnostic without publishing credentials,
    # private e-mail addresses, or any server-echoed secret-bearing text.
    if msg == 'Invalid user token':
        return msg  # This is an error category, not the token value.
    if re.search(r'password|bearer|token|authorization|cookie|secret|credential|api.?key', msg, re.I):
        return '[sensitive error message redacted]'
    msg = re.sub(r'\b[\w.\-+]+@[\w.\-]+\.[A-Za-z]{2,}\b', '[email]', msg)
    return msg[:180]


def observe(log, stage, method, path, response, field=None):
    body = response.get('body')
    row = {'stage': stage, 'operation': method + ' ' + path, 'status': response['status']}
    if field and isinstance(body, dict):
        row['value'] = body.get(field)
        row['id'] = body.get('id')
    if response['status'] >= 400:
        row['error_message'] = safe_message(body)
    log.append(row)
    return response


def checked_identity(base, token, steps, stage):
    response = observe(steps, stage, 'GET', '/users/me',
                       call(base, 'GET', '/users/me', token=token), 'id')
    value = response.get('body')
    return value.get('id') if response['status'] == 200 and isinstance(value, dict) else None


def tags_case(base, token, trial, rounds):
    log = []
    owner = checked_identity(base, token, log, 'identity-before')
    if not owner:
        return {'family': 'tag-upsert', 'trial': trial, 'verdict': 'INCONCLUSIVE',
                'reason': 'identity-not-verified', 'steps': log}
    label = 'fse-confirm-tag-' + uuid.uuid4().hex[:12]
    ids, names = [], []
    for k in ('a', 'b'):
        name = label + '-' + k
        response = observe(log, 'create-'+k, 'POST', '/tags',
                           call(base, 'POST', '/tags', {'name': name}, token), 'name')
        body = response.get('body')
        if response['status'] != 201 or not isinstance(body, dict) or not isinstance(body.get('id'), str) or body.get('name') != name:
            return {'family': 'tag-upsert', 'trial': trial, 'verdict': 'INCONCLUSIVE',
                    'reason': 'create-not-acknowledged', 'steps': log}
        ids.append(body['id']); names.append(name)
    def read_pair(stage):
        out = []
        for k, entity_id in enumerate(ids):
            response = observe(log, stage+'-'+str(k), 'GET', '/tags/{id}',
                               call(base, 'GET', '/tags/'+quote(entity_id,safe=''), token=token), 'name')
            body = response.get('body')
            out.append(response['status'] == 200 and isinstance(body,dict) and
                       body.get('id') == entity_id and body.get('name') == names[k])
        return all(out)
    immediate = read_pair('read-before-upsert')
    for n in range(rounds):
        observe(log, 'read-only-prefix-'+str(n), 'GET', '/server/version',
                call(base, 'GET', '/server/version', token=token))
    control = read_pair('read-after-read-only-prefix')
    third = label + '-c'
    upsert = observe(log, 'upsert-third-tag', 'PUT', '/tags',
                     call(base, 'PUT', '/tags', {'tags':[third]}, token))
    upsert_items = upsert.get('body')
    upsert_ack = (upsert['status'] == 200 and isinstance(upsert_items,list) and
                  any(isinstance(x,dict) and x.get('name') == third for x in upsert_items))
    final = read_pair('read-after-upsert')
    listing = observe(log, 'list-after-upsert', 'GET', '/tags',
                      call(base, 'GET', '/tags', token=token))
    items = listing.get('body'); known = ({x.get('id') for x in items if isinstance(x,dict)}
                                     if listing['status'] == 200 and isinstance(items,list) else None)
    log[-1]['tracked_ids_present'] = ({x: x in known for x in ids} if known is not None else None)
    owner_after = checked_identity(base, token, log, 'identity-after')
    if owner_after != owner or not (immediate and control and upsert_ack):
        verdict, reason = 'INCONCLUSIVE', 'identity-or-prerequisite-not-established'
    elif final and known is not None and all(x in known for x in ids):
        verdict, reason = 'PASS', 'upsert-preserved-earlier-tags'
    elif known is not None and any(x not in known for x in ids):
        verdict, reason = 'SEMANTIC_CANDIDATE', 'previously-visible-tags-absent-after-unrelated-upsert'
    else:
        verdict, reason = 'INCONCLUSIVE', 'read-or-list-unresolved-after-upsert'
    return {'family':'tag-upsert', 'trial':trial, 'verdict':verdict,
            'reason':reason, 'steps':log}


def notification_case(base, token, trial, rounds):
    log=[]
    owner=checked_identity(base,token,log,'identity-before')
    if not owner:
        return {'family':'notification', 'trial':trial, 'verdict':'INCONCLUSIVE',
                'reason':'identity-not-verified', 'steps':log}
    title='fse-confirm-notification-'+uuid.uuid4().hex[:12]
    created=observe(log,'create-self','POST','/admin/notifications',
                    call(base,'POST','/admin/notifications',{'title':title,'userId':owner},token),'title')
    body=created.get('body'); ident=body.get('id') if isinstance(body,dict) else None
    if created['status'] != 201 or not isinstance(ident,str) or body.get('title') != title:
        return {'family':'notification','trial':trial,'verdict':'INCONCLUSIVE',
                'reason':'self-notification-not-acknowledged','steps':log}
    def read(stage):
        one=observe(log,stage+'-by-id','GET','/notifications/{id}',
                    call(base,'GET','/notifications/'+quote(ident,safe=''),token=token),'title')
        li=observe(log,stage+'-filtered-list','GET','/notifications?id={id}',
                   call(base,'GET','/notifications?id='+quote(ident,safe=''),token=token))
        items=li.get('body')
        found=({x.get('id'):x.get('title') for x in items if isinstance(x,dict)}
               if li['status']==200 and isinstance(items,list) else None)
        log[-1]['matches_created_id']=found is not None and found.get(ident)==title if found is not None else None
        return one,li,found
    first=read('immediate')
    for n in range(rounds):
        observe(log,'read-only-prefix-'+str(n),'GET','/server/version',
                call(base,'GET','/server/version',token=token))
    time.sleep(1.0)
    second=read('after-prefix')
    after=checked_identity(base,token,log,'identity-after')
    if after!=owner or any(x[1]['status']!=200 or x[2] is None for x in (first,second)):
        verdict, reason='INCONCLUSIVE','identity-or-filtered-list-not-verified'
    elif all(x[0]['status']==200 and isinstance(x[0].get('body'),dict) and
             x[0]['body'].get('id')==ident and x[2].get(ident)==title for x in (first,second)):
        verdict,reason='PASS','created-notification-visible-by-id-and-list'
    elif all(x[2].get(ident)==title and x[0]['status']==400 for x in (first,second)):
        verdict,reason='SEMANTIC_CANDIDATE','present-in-filtered-list-but-read-by-id-rejected'
    elif all(x[2].get(ident)!=title and x[0]['status']==400 for x in (first,second)):
        verdict,reason='SEMANTIC_CANDIDATE','acknowledged-self-notification-not-visible-by-either-read'
    else:
        verdict,reason='INCONCLUSIVE','notification-readings-conflict'
    return {'family':'notification','trial':trial,'verdict':verdict,'reason':reason,'steps':log}


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--root',required=True,type=Path)
    p.add_argument('--trials',type=int,default=3)
    p.add_argument('--prefix-rounds',type=int,default=4)
    p.add_argument('--freeze-evidence',action='store_true')
    a=p.parse_args()
    if a.trials<1 or a.prefix_rounds<1:p.error('trials and prefix-rounds must be positive')
    root=a.root.resolve();spec=root/'model/immich/immich-v3.2.0-openapi.json'
    digest=validate_spec(spec);contents=json.loads(spec.read_text(encoding='utf-8'))
    for (method,path),op in OPS.items():
        if contents['paths'][path][method].get('operationId')!=op:
            raise RuntimeError('Pinned OpenAPI operation mismatch: '+op)
    run=root/'runs'/('research-fit-immich-semantic-confirmation-'+datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f'))
    run.mkdir(parents=True,exist_ok=False)
    status='COMPLETE';results=[]
    base='http://127.0.0.1:9926'
    try:
        version=call(base,'GET','/server/version')
        if version['status']!=200 or not isinstance(version['body'],dict) or any(
            version['body'].get(k)!=v for k,v in (('major',3),('minor',2),('patch',0))):
            raise RuntimeError('isolated Immich v3.2.0 not available')
        token=authenticate(base,root/'deployment/immich_album_pilot/local-admin-credentials.json')
        for trial in range(1,a.trials+1):
            for family,fn in (('tag-upsert',tags_case),('notification',notification_case)):
                try:results.append(fn(base,token,trial,a.prefix_rounds))
                except Exception as exc:
                    results.append({'family':family,'trial':trial,'verdict':'INCONCLUSIVE',
                                    'reason':type(exc).__name__,'steps':[]})
    except Exception as exc:
        status='INCOMPLETE';results.append({'family':'setup','trial':0,'verdict':'INCONCLUSIVE',
                                           'reason':type(exc).__name__+': '+str(exc)[:140],'steps':[]})
    output=run/'semantic_confirmation.json'
    output.write_text(json.dumps({'status':status,'openapi_sha256':digest,'trials':a.trials,
        'prefix_rounds':a.prefix_rounds,'serial_only':True,'results':results},indent=2)+'\n',encoding='utf-8')
    checksum=hashlib.sha256(output.read_bytes()).hexdigest()
    with (run/'checksums.csv').open('w',newline='',encoding='utf-8') as fp:
        w=csv.writer(fp);w.writerow(('path','size_bytes','sha256'));w.writerow((output.name,output.stat().st_size,checksum))
    if a.freeze_evidence:
        destination=root/'evidence'/(run.name+'-review.zip');destination.parent.mkdir(exist_ok=True)
        with zipfile.ZipFile(destination,'x',compression=zipfile.ZIP_DEFLATED) as z:
            for path in (output,run/'checksums.csv'):z.write(path,path.name)
        print('IMMICH_SEMANTIC_CONFIRMATION_EVIDENCE_READY',destination)
        print('ZIP SHA256:',hashlib.sha256(destination.read_bytes()).hexdigest())
    for r in results:
        print('IMMICH_SEMANTIC_CONFIRMATION_RESULT trial=%s family=%s verdict=%s reason=%s'%(
            r['trial'],r['family'],r['verdict'],r['reason']))
    print('IMMICH_SEMANTIC_CONFIRMATION_'+status,'run='+str(run))
    return 0 if status=='COMPLETE' else 2


if __name__=='__main__':sys.exit(main())
