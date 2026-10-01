#!/usr/bin/env python3
"""Clean only generated Keycloak realms after an incomplete run, preserving evidence."""
import argparse
import getpass
import json
import os
import pathlib
import re
import shutil
from datetime import datetime

from run_15 import HERE, realm_status, token


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ordinal', type=int, default=1)
    parser.add_argument('--base-url', default='http://127.0.0.1:9928')
    parser.add_argument('--username', default='admin')
    args = parser.parse_args()
    campaign = HERE / 'runs' / 'keycloak-15'
    run_dir = campaign / f'run-{args.ordinal:02d}'
    summary_file = campaign / 'campaign-summary.json'
    summary = json.loads(summary_file.read_text())
    records = summary['runs']
    if len(records) != args.ordinal or records[-1]['ordinal'] != args.ordinal:
        raise RuntimeError('campaign summary does not end with the requested failed run')
    record = records[-1]
    if record['provengo_exit'] == 0 or record['cleanup'] != 'NOT_ATTEMPTED':
        raise RuntimeError('expected an incomplete run with cleanup NOT_ATTEMPTED')
    audit = json.loads((run_dir / 'interval-audit.json').read_text())
    if audit['race_dispatches'] or audit['http_puts']:
        raise RuntimeError('race operations already started; recovery requires manual review')
    story = (HERE / 'provengo_project/spec/js/stories.keycloak_stage2.js').read_text()
    realms = sorted(set(re.findall(r'__args\.realm="(realm_[0-9]+)"', story)))
    if not realms:
        raise RuntimeError('no generated realm names found')
    password = os.environ.get('KC_STAGE2_ADMIN_PASSWORD') or getpass.getpass('Keycloak admin password: ')
    base = args.base_url.rstrip('/')
    bearer = token(base, args.username, password)
    statuses = {realm: realm_status(base, realm, bearer) for realm in realms}
    if any(status not in (200, 404) for status in statuses.values()):
        raise RuntimeError(f'unexpected pre-cleanup realm status: {statuses}')
    found = [realm for realm, status in statuses.items() if status == 200]
    deleted = {realm: realm_status(base, realm, bearer, 'DELETE') for realm in found}
    report = {'ordinal': args.ordinal, 'generated_realm_count': len(realms),
              'existing_generated_realms': found, 'delete_statuses': deleted}
    (run_dir / 'recovery.json').write_text(json.dumps(report, indent=2) + '\n')
    if any(status != 204 for status in deleted.values()):
        raise RuntimeError('cleanup failed; report is preserved in recovery.json')
    bearer = token(base, args.username, password)
    remaining = {realm: realm_status(base, realm, bearer) for realm in realms}
    if any(status != 404 for status in remaining.values()):
        raise RuntimeError(f'generated fixture remains: {remaining}')
    archive = campaign / ('failed-run-' + f'{args.ordinal:02d}-' +
                          datetime.now().strftime('%Y%m%d-%H%M%S'))
    archive.mkdir()
    shutil.move(str(run_dir), str(archive / run_dir.name))
    shutil.move(str(summary_file), str(archive / summary_file.name))
    print(f'RECOVERED {len(found)} generated realms; prior evidence: {archive}', flush=True)


if __name__ == '__main__':
    main()
