#!/usr/bin/env python3
"""Serial Immich v3.2.0 control for created tags and notifications."""
import argparse
import csv
import hashlib
import json
import sys
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

# Use the authenticated client and version-pinned spec shipped by the earlier pilot.
from run_immich_album_serial import authenticate, call, validate_spec

OPERATIONS = {('post', '/tags'): 'createTag',
              ('get', '/tags/{id}'): 'getTagById',
              ('post', '/admin/notifications'): 'createNotification',
              ('get', '/notifications/{id}'): 'getNotification',
              ('get', '/users/me'): 'getMyUser',
              ('get', '/server/version'): 'getServerVersion'}


def record(steps, phase, response, entity=None):
    row = {'phase': phase, 'status': response['status']}
    body = response.get('body')
    if isinstance(body, dict):
        row['observed'] = {k: body[k] for k in ('id', 'name', 'title', 'userId') if k in body}
        message = body.get('message')
        if isinstance(message, str):
            row['message_class'] = ('absence-or-access-ambiguous'
                                    if 'not found or no ' in message.lower() and ' access' in message.lower()
                                    else 'other-error')
    if entity:
        row['entity'] = entity
    steps.append(row)
    return response


def one_case(base, token, family, trial_no, rounds):
    steps = []
    me = record(steps, 'identity-before', call(base, 'GET', '/users/me', token=token))
    identity = (me.get('body') or {}).get('id') if isinstance(me.get('body'), dict) else None
    if me['status'] != 200 or not isinstance(identity, str):
        return {'case': family, 'trial': trial_no, 'verdict': 'INCONCLUSIVE',
                'reason': 'identity-unavailable', 'steps': steps}
    name = 'fse-visibility-%s-%d-%s' % (family, trial_no, uuid.uuid4().hex[:12])
    if family == 'tag':
        path, payload, field = '/tags', {'name': name}, 'name'
    else:
        path, payload, field = '/admin/notifications', {'title': name, 'userId': identity}, 'title'
    created = record(steps, 'create', call(base, 'POST', path, payload, token), family)
    data = created.get('body')
    entity_id = data.get('id') if isinstance(data, dict) else None
    if created['status'] != 201 or not isinstance(entity_id, str) or data.get(field) != name:
        return {'case': family, 'trial': trial_no, 'verdict': 'INCONCLUSIVE',
                'reason': 'create-not-acknowledged', 'steps': steps}
    read_path = ('/tags/' if family == 'tag' else '/notifications/') + quote(entity_id, safe='')
    initial = record(steps, 'read-immediate', call(base, 'GET', read_path, token=token), family)
    for r in range(rounds):
        record(steps, 'unchanging-prefix-%d' % (r + 1),
               call(base, 'GET', '/server/version', token=token))
    after = record(steps, 'identity-after', call(base, 'GET', '/users/me', token=token))
    delayed = record(steps, 'read-after-prefix', call(base, 'GET', read_path, token=token), family)
    current_id = (after.get('body') or {}).get('id') if isinstance(after.get('body'), dict) else None
    if after['status'] != 200 or current_id != identity:
        verdict, reason = 'INCONCLUSIVE', 'research-identity-changed'
    elif initial['status'] == 200 and isinstance(initial.get('body'), dict) and initial['body'].get(field) == name:
        if delayed['status'] == 200 and isinstance(delayed.get('body'), dict) and delayed['body'].get(field) == name:
            verdict, reason = 'PASS', 'value-visible-before-and-after-prefix'
        elif delayed['status'] == 400 and steps[-1].get('message_class') == 'absence-or-access-ambiguous':
            verdict, reason = 'SEMANTIC_CANDIDATE', 'previously-readable-resource-lost-with-stable-identity'
        else:
            verdict, reason = 'INCONCLUSIVE', 'delayed-observation-unresolved'
    else:
        verdict, reason = 'INCONCLUSIVE', 'creation-acknowledged-but-immediate-read-unresolved'
    return {'case': family, 'trial': trial_no, 'verdict': verdict, 'reason': reason, 'steps': steps}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--root', required=True, type=Path)
    p.add_argument('--base-url', default='http://127.0.0.1:9926')
    p.add_argument('--trials', type=int, default=3)
    p.add_argument('--prefix-rounds', type=int, default=4)
    p.add_argument('--freeze-evidence', action='store_true')
    args = p.parse_args()
    if args.trials < 1 or args.prefix_rounds < 1:
        p.error('trials and prefix-rounds must be positive')
    if args.base_url not in ('http://127.0.0.1:9926', 'http://localhost:9926'):
        p.error('only the isolated localhost:9926 server is supported')
    root = args.root.resolve()
    spec_path = root / 'model/immich/immich-v3.2.0-openapi.json'
    digest = validate_spec(spec_path)
    spec = json.loads(spec_path.read_text(encoding='utf-8'))
    for (method, path), operation_id in OPERATIONS.items():
        if spec['paths'][path][method].get('operationId') != operation_id:
            raise RuntimeError('OpenAPI operation mismatch: ' + operation_id)
    run = root / 'runs' / ('research-fit-immich-visibility-' + datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f'))
    run.mkdir(parents=True, exist_ok=False)
    results = []
    state = 'COMPLETE'
    try:
        version = call(args.base_url, 'GET', '/server/version')
        if version['status'] != 200 or not isinstance(version['body'], dict) or any(
                version['body'].get(key) != val for key, val in (('major', 3), ('minor', 2), ('patch', 0))):
            raise RuntimeError('isolated server is not Immich v3.2.0')
        token = authenticate(args.base_url, root / 'deployment/immich_album_pilot/local-admin-credentials.json')
        for n in range(1, args.trials + 1):
            for family in ('tag', 'notification'):
                try:
                    results.append(one_case(args.base_url, token, family, n, args.prefix_rounds))
                except Exception as exc:
                    results.append({'trial': n, 'case': family, 'verdict': 'INCONCLUSIVE',
                                    'reason': type(exc).__name__, 'steps': []})
    except Exception as exc:
        state = 'INCOMPLETE'
        results.append({'trial': 0, 'case': 'setup', 'verdict': 'INCONCLUSIVE',
                        'reason': type(exc).__name__ + ': ' + str(exc)[:120], 'steps': []})
    result_path = run / 'visibility_results.json'
    result_path.write_text(json.dumps({'status': state, 'openapi_sha256': digest,
        'trials': args.trials, 'prefix_rounds': args.prefix_rounds,
        'identity_scope': 'authenticated-current-user', 'results': results}, indent=2) + '\n', encoding='utf-8')
    with (run / 'checksums.csv').open('w', newline='', encoding='utf-8') as out:
        writer = csv.writer(out)
        writer.writerow(('path', 'size_bytes', 'sha256'))
        writer.writerow((result_path.name, result_path.stat().st_size,
                         hashlib.sha256(result_path.read_bytes()).hexdigest()))
    if args.freeze_evidence:
        archive = root / 'evidence' / (run.name + '-review.zip')
        archive.parent.mkdir(exist_ok=True)
        with zipfile.ZipFile(archive, 'x', compression=zipfile.ZIP_DEFLATED) as z:
            for filename in ('visibility_results.json', 'checksums.csv'):
                z.write(run / filename, filename)
        print('IMMICH_VISIBILITY_EVIDENCE_READY', archive)
        print('ZIP SHA256:', hashlib.sha256(archive.read_bytes()).hexdigest())
    for item in results:
        print('IMMICH_VISIBILITY_RESULT trial=%s case=%s verdict=%s reason=%s' % (
            item['trial'], item['case'], item['verdict'], item['reason']))
    print('IMMICH_VISIBILITY_' + state, 'run=' + str(run))
    return 0 if state == 'COMPLETE' else 2


if __name__ == '__main__':
    sys.exit(main())
