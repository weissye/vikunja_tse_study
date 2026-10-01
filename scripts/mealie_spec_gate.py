#!/usr/bin/env python3
"""Compare two pinned-version OpenAPI documents at the contract level."""
import argparse
import hashlib
import json
from pathlib import Path

OLD_SHA = '0528428e023cd10431e2971dc1851c0d5d6e260fac263ba29ae7edab65890bf5'
METHODS = {'get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace'}
DOC_KEYS = {'description', 'summary', 'example', 'examples', 'externalDocs', 'tags'}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def structural(value, property_names=False):
    if isinstance(value, dict):
        return {k: structural(v, property_names=(k == 'properties')) for k, v in value.items()
                if property_names or k not in DOC_KEYS}
    if isinstance(value, list):
        return [structural(v) for v in value]
    return value


def contract(doc):
    return structural({'openapi': doc.get('openapi'), 'paths': doc.get('paths', {}),
                       'components': doc.get('components', {}),
                       'security': doc.get('security', [])})


def fingerprint(value):
    data = json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    return hashlib.sha256(data).hexdigest()


def signatures(doc):
    return {(path, method) for path, node in doc.get('paths', {}).items()
            for method in node if method.lower() in METHODS}


def comparison(old_path, new_path):
    result = {'schema_version': 1, 'old_path': str(old_path), 'new_path': str(new_path),
              'old_sha256': sha(old_path) if old_path.is_file() else None,
              'new_sha256': sha(new_path) if new_path.is_file() else None,
              'expected_old_sha256': OLD_SHA, 'state': 'BLOCKED'}
    if result['old_sha256'] != OLD_SHA or not new_path.is_file():
        result['reason'] = 'prior-approved-openapi-missing-or-changed'
        return result
    old = json.loads(old_path.read_text(encoding='utf-8-sig'))
    new = json.loads(new_path.read_text(encoding='utf-8-sig'))
    result['old_version'] = old.get('info', {}).get('version')
    result['new_version'] = new.get('info', {}).get('version')
    if result['old_version'] != 'v3.27.0' or result['new_version'] != 'v3.27.0':
        result['reason'] = 'mealie-version-changed'
        return result
    before, after = contract(old), contract(new)
    result['old_contract_sha256'] = fingerprint(before)
    result['new_contract_sha256'] = fingerprint(after)
    if before == after:
        result['state'] = 'ACCEPTED_EQUIVALENT_CONTRACT'
        result['reason'] = 'same-operations-components-and-security; document-metadata-may-differ'
    else:
        before_ops, after_ops = signatures(old), signatures(new)
        result['reason'] = 'operation-schema-or-security-drift'
        result['added_operations'] = sorted('%s %s' % (m.upper(), p) for p, m in after_ops - before_ops)[:30]
        result['removed_operations'] = sorted('%s %s' % (m.upper(), p) for p, m in before_ops - after_ops)[:30]
        result['changed_operations'] = sorted('%s %s' % (m.upper(), p) for p, m in before_ops & after_ops
            if before['paths'][p][m] != after['paths'][p][m])[:30]
        old_s = before['components'].get('schemas', {})
        new_s = after['components'].get('schemas', {})
        result['changed_schemas'] = sorted(k for k in old_s.keys() & new_s.keys()
                                           if old_s[k] != new_s[k])[:30]
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--old', type=Path, required=True)
    parser.add_argument('--new', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    result = comparison(args.old, args.new)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(result, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    print('MEALIE_STAGE4_SPEC_GATE state=%s old=%s new=%s report=%s' %
          (result['state'], result['old_sha256'], result['new_sha256'], args.report))
    return 0 if result['state'] == 'ACCEPTED_EQUIVALENT_CONTRACT' else 2


if __name__ == '__main__':
    raise SystemExit(main())
