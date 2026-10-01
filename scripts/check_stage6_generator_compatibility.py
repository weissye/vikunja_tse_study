"""Six independent OpenAPI shapes: baseline parity and opt-in profile checks.

Supply --baseline with an untouched generator tree to test byte-for-byte
compatibility of the default `full` profile. This does not replace live SUT
regression against the actual six external specifications and servers.
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def contract(name, field_schema):
    key = 'id'
    response = {'type': 'object', 'properties': {
        key: {'type': 'integer'}, 'name': {'type': 'string'}, name: field_schema}}
    def body(schema):
        return {'content': {'application/json': {'schema': schema}}}
    record_path = {
        'parameters': [{'name': key, 'in': 'path', 'required': True,
                        'schema': {'type': 'integer'}}],
        'get': {'operationId': 'getRecord', 'responses': {
            '200': {'description': 'ok', **body(response)}}},
        'patch': {'operationId': 'editRecord',
                  'requestBody': body({'type': 'object', 'properties': {name: field_schema}}),
                  'responses': {'200': {'description': 'updated'}}},
        'delete': {'operationId': 'deleteRecord',
                   'responses': {'204': {'description': 'deleted'}}},
    }
    return {'openapi': '3.0.3', 'info': {'title': name, 'version': '1'},
            'paths': {'/records': {'post': {
                'operationId': 'createRecord',
                'requestBody': body({'type': 'object', 'required': ['name'],
                                     'properties': {'name': {'type': 'string'}}}),
                'responses': {'201': {'description': 'created', **body(response)}}}},
                '/records/{id}': record_path}}


def generate(generator, source, output, profile):
    command = [sys.executable, '-m', 'openapi_to_sbt', 'generate',
               '--openapi', str(source), '--output', str(output),
               '--name', 'compat', '--base-url', 'http://127.0.0.1:3477/api/v1',
               '--seed', '17', '--instances-per-entity', '2',
               '--story-profile', profile, '--force']
    process = subprocess.run(command, cwd=generator, capture_output=True, text=True)
    if process.returncode:
        raise RuntimeError(f'{profile} failed: {process.stdout}\n{process.stderr}')
    return output / 'stories.compat.js', output / 'interfaces.compat.js'


def verify(generator, source, output, profile):
    command = [sys.executable, '-m', 'openapi_to_sbt.verification_cli',
               '--openapi', str(source), '--output', str(output),
               '--name', 'compat']
    if profile != 'full':
        command += ['--story-profile', profile]
    process = subprocess.run(command, cwd=generator, capture_output=True, text=True)
    if process.returncode:
        raise RuntimeError(f'verifier {profile} failed: {process.stdout}\n{process.stderr}')
    return output / 'verification.compat.js'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--generator', type=Path, required=True)
    parser.add_argument('--baseline', type=Path)
    parser.add_argument('--real-spec', type=Path, action='append', default=[],
                        help='Repeat six times for six real system OpenAPI contracts.')
    args = parser.parse_args()
    generator = args.generator.resolve()
    baseline = args.baseline.resolve() if args.baseline else None
    if args.real_spec and len(args.real_spec) != 6:
        parser.error('Pass exactly six --real-spec paths, or omit them for synthetic checks.')
    cases = [
        ('boolean', 'active', {'type': 'boolean'}),
        ('enumeration', 'mode', {'type': 'string', 'enum': ['open', 'closed']}),
        ('integer', 'priority', {'type': 'integer', 'minimum': 1, 'maximum': 100}),
        ('unbounded_string', 'description', {'type': 'string'}),
        ('bounded_string', 'title', {'type': 'string', 'maxLength': 40}),
        ('number', 'amount', {'type': 'number', 'minimum': 0, 'maximum': 500}),
    ]
    node = shutil.which('node')
    with tempfile.TemporaryDirectory() as work:
        root = Path(work)
        for index, (label, field, schema) in enumerate(cases):
            source = root / f'{label}.json'
            specification = contract(field, schema)
            if label == 'boolean':
                second = {'type': 'boolean'}
                specification['paths']['/records/{id}']['patch']['requestBody']['content']['application/json']['schema']['properties']['enabled'] = second
                specification['paths']['/records/{id}']['get']['responses']['200']['content']['application/json']['schema']['properties']['enabled'] = second
            source.write_text(json.dumps(specification), encoding='utf-8')
            current_full = generate(generator, source, root / f'{index}-full', 'full')
            current_long = generate(generator, source, root / f'{index}-long', 'long-interleaving')
            if baseline:
                old_full = generate(baseline, source, root / f'{index}-old', 'full')
                for old, new in zip(old_full, current_full):
                    if old.read_bytes() != new.read_bytes():
                        raise AssertionError(f'{label}: default profile changed: {new.name}')
            for filename in (*current_full, *current_long):
                if node:
                    subprocess.run([node, '--check', str(filename)], check=True, capture_output=True)
            long_js = current_long[0].read_text(encoding='utf-8')
            assert 'resolveExplorationDependencies' in long_js
            assert 'SBT:InstanceUnavailable:records:1' in long_js
            assert 'SBT:StorySkipped' in long_js
            assert 'SBT:LongStoryStep' in long_js or schema.get('maxLength') is not None
            if label == 'boolean':
                assert 'update:editRecord:1:field:active' in long_js
                assert 'update:editRecord:1:field:enabled' in long_js
                assert long_js.count('constraint:cleanup:update:editRecord:1:field:') == 2
            print(f'PASS {label}: default parity={bool(baseline)} long-profile=yes js-syntax={bool(node)}')
        for index, given in enumerate(args.real_spec):
            spec = given.resolve()
            if not spec.is_file():
                raise FileNotFoundError(spec)
            current_full = generate(generator, spec, root / f'real-{index}-full', 'full')
            current_long = generate(generator, spec, root / f'real-{index}-long', 'long-interleaving')
            if baseline:
                old_full = generate(baseline, spec, root / f'real-{index}-old', 'full')
                for old, new in zip(old_full, current_full):
                    if old.read_bytes() != new.read_bytes():
                        raise AssertionError(f'{spec.name}: default profile changed: {new.name}')
            verifier_full = verify(generator, spec, root / f'real-{index}-verify-full', 'full')
            verifier_long = verify(generator, spec, root / f'real-{index}-verify-long', 'long-interleaving')
            if baseline:
                verifier_old = verify(baseline, spec, root / f'real-{index}-verify-old', 'full')
                if verifier_old.read_bytes() != verifier_full.read_bytes():
                    raise AssertionError(f'{spec.name}: default verifier changed')
            for filename in (*current_full, *current_long):
                if node:
                    subprocess.run([node, '--check', str(filename)], check=True, capture_output=True)
            if node:
                subprocess.run([node, '--check', str(verifier_long)], check=True, capture_output=True)
            long_verifier = verifier_long.read_text(encoding='utf-8')
            if 'sbt:resource-bridge:' in long_verifier:
                assert 'SBT:ResourceBridgeFinished:' in long_verifier
                assert 'SBT:InstanceReady:' in long_verifier
            print(f'PASS real-contract-{index+1}: default parity={bool(baseline)} long-profile=yes')
    print(f'COMPATIBILITY_CHECK_PASS synthetic_cases=6 real_contracts_checked={len(args.real_spec)} live_systems_checked=0')


if __name__ == '__main__':
    main()
