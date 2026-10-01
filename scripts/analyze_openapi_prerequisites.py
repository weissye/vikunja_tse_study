"""Redacted prerequisite triage from a local HTTP trace and OpenAPI contract.

No request/response values, authentication, raw URLs or server prose are exported.
This is a diagnostic gate: status codes alone cannot justify a new dependency.
"""
import argparse
import collections
import json
import re
from pathlib import Path


def _template(path, paths):
    path = path.split('?', 1)[0]
    # A literal route such as /tags/merge must win over /tags/{item_id}.
    if path in paths:
        return path
    for template in sorted(paths, key=lambda p: (-len(p), p)):
        regex = '^' + re.sub(r'\\\{[^{}]+\\\}', '[^/]+', re.escape(template)) + '$'
        if re.fullmatch(regex, path):
            return template
    return '<unmatched-path>'


def _loc(response):
    """Only emit field names from structured validation locations."""
    if not isinstance(response, dict):
        return []
    detail = response.get('detail')
    if not isinstance(detail, list):
        return []
    fields = set()
    for issue in detail:
        parts = issue.get('loc') if isinstance(issue, dict) else None
        if isinstance(parts, list):
            for part in parts:
                if isinstance(part, str) and re.fullmatch(r'[A-Za-z_][A-Za-z_0-9]{0,80}', part):
                    if part.lower() not in {'body', 'query', 'path', 'header'}:
                        fields.add(part)
    return sorted(fields)


def _schema_fields(schema, spec, visited=None):
    """Read shallow field names through local schema refs and composition."""
    if not isinstance(schema, dict):
        return set(), set()
    visited = set() if visited is None else visited
    ref = schema.get('$ref')
    if isinstance(ref, str) and ref.startswith('#/components/schemas/'):
        if ref in visited:
            return set(), set()
        component = ref.rsplit('/', 1)[-1].replace('~1', '/').replace('~0', '~')
        return _schema_fields(spec.get('components', {}).get('schemas', {}).get(component, {}),
                              spec, visited | {ref})
    props = set(schema.get('properties', {}))
    required = set(schema.get('required', []))
    for member in schema.get('allOf', []):
        extra_props, extra_required = _schema_fields(member, spec, visited)
        props.update(extra_props)
        required.update(extra_required)
    return props, required


def analyze(spec, trace):
    paths = spec.get('paths', {})
    grouped = collections.defaultdict(lambda: {'statuses': collections.Counter(), 'validation_fields': set()})
    for line in trace:
        try:
            item = json.loads(line)
        except (ValueError, TypeError):
            continue
        if item.get('method') not in ('POST', 'PUT', 'PATCH'):
            continue
        path = item.get('model_path')
        code = item.get('status')
        if not isinstance(path, str) or not isinstance(code, int):
            continue
        template = _template(path, paths)
        key = (item['method'], template)
        result = grouped[key]
        result['statuses'][str(code)] += 1
        if code == 422:
            # Keep only structured validation field names; never raw messages.
            result['validation_fields'].update(_loc(item.get('response')))
    rows = []
    for (method, template), result in sorted(grouped.items()):
        codes = result['statuses']
        if not any(int(c) >= 400 for c in codes):
            continue
        operation = paths.get(template, {}).get(method.lower(), {})
        body = operation.get('requestBody', {}).get('content', {})
        request_fields = set()
        required_fields = set()
        for content in body.values():
            schema = content.get('schema', {})
            fields, required = _schema_fields(schema, spec)
            request_fields.update(fields)
            required_fields.update(required)
        rows.append({'method': method, 'path_template': template,
                     'operation_id': operation.get('operationId'),
                     'statuses': dict(sorted(codes.items())),
                     'required_fields': sorted(required_fields),
                     'request_fields': sorted(request_fields),
                     'validation_fields': sorted(result['validation_fields']),
                     'diagnosis': 'requires-contract-and-serial-control'})
    return {'schema_version': 1, 'classification': 'PREREQUISITE_DIAGNOSTICS_ONLY',
            'operations': rows}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--spec', type=Path, required=True)
    parser.add_argument('--trace', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    result = analyze(json.loads(args.spec.read_text(encoding='utf-8')),
                     args.trace.open(encoding='utf-8'))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print('PREREQUISITE_DIAGNOSTICS_READY operations=%d' % len(result['operations']))


if __name__ == '__main__':
    main()
