#!/usr/bin/env python3
"""OpenAPI-only Immich/Provengo pilot; reuse the existing generator, proxy and evaluator."""
import argparse
import collections
import csv
import hashlib
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

SPEC_SHA = '51719f0b6573ca75eb51834b01a7fdb9e963c9d60fcce813f10c1463a987b866'
# Explicit Immich experiment boundary, not a generic inference rule.
# These operations can invalidate the research identity or change server mode.
# The generator receives the projected OpenAPI, so excluded operations are
# outside this experiment's generated coverage.
EXCLUDED_SESSION_OPERATIONS = frozenset({
    'logout', 'changePassword', 'lockAuthSession', 'unlockAuthSession',
    'deleteAllSessions', 'deleteSession', 'lockSession', 'updateMyUser',
    'setMaintenanceMode', 'startDatabaseRestoreFlow',
})
SENSITIVE = re.compile(r'password|token|secret|authorization|cookie|api.?key|credential|pin.?code|assetData|sidecarData', re.I)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


def write_json(path, obj):
    path.write_text(json.dumps(obj, indent=2, sort_keys=True) + '\n', encoding='utf-8')


def clean(value):
    if isinstance(value, dict):
        return {k: ('[REDACTED]' if SENSITIVE.search(k) else clean(v)) for k, v in value.items()}
    if isinstance(value, list):
        return [clean(v) for v in value]
    return value


def freeze(root, run):
    """Publish only explicit allow-listed outputs; generated payloads may contain credentials."""
    export = run / 'review'
    export.mkdir(exist_ok=True)
    allow = ('summary.json', 'coverage-gate.json', 'generation_report.json', 'dependency_graph.json',
             'verifier-coverage.immich.json', 'concurrency-plan.immich.json',
             'generated-verifier-evaluation.json', 'runtime-observation-policy.json',
             'asset-fixture-evidence.json', 'asset-add-witness.json',
             'concurrency-matrix.json', 'cross-method-plan.immich.json')
    for trial in sorted(run.glob('seed-*')):
        safe = export / trial.name
        safe.mkdir(exist_ok=True)
        for filename in allow:
            source = trial / filename
            if not source.exists():
                source = trial / 'generated' / filename
            if source.exists():
                write_json(safe / filename, clean(json.loads(source.read_text(encoding='utf-8-sig'))))
        for filename in ('http-trace.jsonl', 'concurrent-epochs.jsonl'):
            source = trial / filename
            if source.exists():
                with (safe / filename).open('w', encoding='utf-8') as out:
                    for line in source.read_text(encoding='utf-8').splitlines():
                        if line.strip():
                            out.write(json.dumps(clean(json.loads(line)), sort_keys=True) + '\n')
    for filename in ('campaign.json', 'scope.json', 'coverage-summary.json'):
        if (run / filename).exists():
            write_json(export / filename, json.loads((run / filename).read_text(encoding='utf-8')))
    rows = []
    for path in sorted(export.rglob('*')):
        if path.is_file() and path.name != 'checksums.csv':
            rows.append((path.relative_to(export).as_posix(), path.stat().st_size, sha(path)))
    with (export / 'checksums.csv').open('w', newline='', encoding='utf-8') as handle:
        writer = csv.writer(handle)
        writer.writerow(('path', 'size_bytes', 'sha256'))
        writer.writerows(rows)
    evidence = root / 'evidence'
    evidence.mkdir(exist_ok=True)
    zip_path = evidence / (run.name + '-review.zip')
    with zipfile.ZipFile(zip_path, 'x', compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(export.rglob('*')):
            if path.is_file():
                archive.write(path, path.relative_to(export).as_posix())
    shutil.rmtree(export)
    print('IMMICH_GENERATED_PILOT_EVIDENCE_READY', zip_path)
    print('ZIP SHA256:', sha(zip_path))


def capture(cmd, cwd, destination, env=None):
    with destination.open('w', encoding='utf-8') as log:
        completed = subprocess.run([str(x) for x in cmd], cwd=cwd, env=env,
                                   stdout=log, stderr=subprocess.STDOUT, check=False)
    if completed.returncode:
        raise RuntimeError('%s returned %s; see %s' % (cmd[:3], completed.returncode, destination))


def get_json(url):
    with urllib.request.urlopen(url, timeout=10) as response:
        return json.load(response)


def album_asset_add_witness(trace_path, asset_id):
    """Only claim a generated album/asset request when Immich confirms the ID."""
    rows = [json.loads(line) for line in trace_path.read_text(encoding='utf-8').splitlines()
            if line.strip()] if trace_path.exists() else []
    matched = []
    for row in rows:
        # Ordinary generated REST calls have no operation_id in the proxy;
        # epoch-adapter calls carry a generated-control/... identifier.
        if (row.get('method') != 'PUT' or row.get('epoch_id') is not None or
                not re.fullmatch(r'/albums/[^/]+/assets', row.get('model_path', ''))):
            continue
        request = row.get('request') or {}
        response = row.get('response') or []
        if (request.get('ids') == [asset_id] and row.get('status') == 200 and
                isinstance(response, list) and any(isinstance(item, dict) and
                item.get('id') == asset_id and item.get('success') is True for item in response)):
            matched.append({'model_path': row.get('model_path'), 'status': 200,
                            'asset_id': asset_id, 'response_success': True})
    return {'operation_id': 'addAssetsToAlbum', 'verified_asset_id': asset_id,
            'successful_generated_calls': len(matched), 'matches': matched}


def summarize(trial, spec_counts):
    gen = json.loads((trial / 'generated' / 'generation_report.json').read_text(encoding='utf-8'))
    coverage = json.loads((trial / 'generated' / 'verifier-coverage.immich.json').read_text(encoding='utf-8'))
    trace = trial / 'http-trace.jsonl'
    epochs = trial / 'concurrent-epochs.jsonl'
    events = [json.loads(s) for s in trace.read_text(encoding='utf-8').splitlines() if s.strip()] if trace.exists() else []
    epoch_rows = [json.loads(s) for s in epochs.read_text(encoding='utf-8').splitlines() if s.strip()] if epochs.exists() else []
    evaluation = trial / 'generated-verifier-evaluation.json'
    oracle = json.loads(evaluation.read_text(encoding='utf-8')) if evaluation.exists() else {}
    selected = trial / 'provengo-run.log'
    logs = selected.read_text(encoding='utf-8', errors='replace') if selected.exists() else ''
    plan_file = trial / 'generated' / 'concurrency-plan.immich.json'
    plan_oracles = json.loads(plan_file.read_text(encoding='utf-8')).get('oracles', []) if plan_file.exists() else []
    skipped_indices = sorted({int(i) for i in re.findall(
        r'Selected: \[SBT:ConcurrencySkipped:(\d+)(?=[\s\]])', logs)})
    methods = collections.Counter(e.get('method') for e in events)
    statuses = collections.Counter(str(e.get('status')) for e in events)
    invalid_token_events = sum(e.get('status') == 401 and
        isinstance(e.get('response'), dict) and
        e['response'].get('message') == 'Invalid user token' for e in events)
    transport_error_events = sum(bool(e.get('transport_error')) for e in events)
    paths = collections.Counter(e.get('model_path', '').split('?')[0] for e in events)
    epoch_http = collections.defaultdict(list)
    for event in events:
        if event.get('epoch_id') and event.get('method') in ('POST', 'PUT', 'PATCH', 'DELETE'):
            epoch_http[event['epoch_id']].append(event)
    proxy_overlap = set()
    for epoch_id, group in epoch_http.items():
        try:
            starts = [datetime.fromisoformat(e['upstream_started_utc']) for e in group]
            ends = [datetime.fromisoformat(e['upstream_completed_utc']) for e in group]
            if len(group) >= 2 and max(starts) < min(ends):
                proxy_overlap.add(epoch_id)
        except (KeyError, TypeError, ValueError):
            continue
    adapter_overlap = {e.get('epoch_id') for e in epoch_rows if e.get('overlap_observed') is True}
    summary = {'generated_operations': gen['coverage']['covered_operations'],
               'source_operations': gen['coverage']['total_operations'],
               'active_operations': spec_counts['active'],
               'deprecated_operations': spec_counts['deprecated'],
               'verifier_operations': coverage['counts']['operations'],
               'invalid_token_events': invalid_token_events,
               'transport_error_events': transport_error_events,
               'unverified_active_operations': spec_counts['active'] - coverage['counts']['operations'],
               'verifier_coverage_complete': coverage.get('coverage_complete'),
               'http_events': len(events), 'methods': dict(methods), 'statuses': dict(statuses),
               'distinct_paths_observed': len(paths), 'observed_path_counts': dict(paths),
               'epochs': len(epoch_rows),
               'adapter_overlap_epochs': len(adapter_overlap),
               'proxy_overlap_epochs': len(proxy_overlap),
               'real_overlap_epochs': len(adapter_overlap & proxy_overlap),
               'selected_events': logs.count('Selected: ['),
               'long_story_selected': len(re.findall(r'Selected: \[.*(?:Long|Round)', logs, re.I)),
               'oracle_status': oracle.get('run_status', 'NOT_EVALUATED'),
               'oracle_layers': oracle.get('layer_counts', {})}
    if skipped_indices:
        summary['skipped_runtime_oracles'] = [
            {'oracle_id': plan_oracles[i]['oracle_id'],
             'reason': 'insufficient-created-resources'}
            for i in skipped_indices if i < len(plan_oracles)]
    summary['status'] = ('UPSTREAM_TRANSPORT_FAILURE' if transport_error_events else
                         'AUTH_BOUNDARY_LOST' if invalid_token_events else
                         'NO_HTTP_WITNESS' if not events else
                         'NO_REAL_OVERLAP' if not summary['real_overlap_epochs'] else
                         'ORACLE_INCONCLUSIVE' if summary['oracle_status'] in ('INCONCLUSIVE', 'NOT_EVALUATED')
                         else summary['oracle_status'])
    write_json(trial / 'summary.json', summary)
    return summary


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--root', type=Path, required=True)
    p.add_argument('--runs', type=int, default=2)
    p.add_argument('--base-seed', type=int, default=20261007)
    p.add_argument('--max-length', type=int, default=20000)
    p.add_argument('--instances-per-entity', type=int, default=2)
    p.add_argument('--instances-per-action', type=int, default=1)
    p.add_argument('--max-field-pairs', type=int, default=4)
    p.add_argument('--max-concurrency-width', type=int, choices=(2, 3), default=3)
    p.add_argument('--json-disjoint', action='store_true')
    p.add_argument('--json-delete-bodies', action='store_true',
                   help='Generate documented JSON DELETE bodies and allow only those routes in the epoch adapter')
    p.add_argument('--optional-enum-dependency-branch', action='store_true',
                   help='Opt in to structural XId/type-X dependency hypothesis in create stories')
    p.add_argument('--verified-album-asset-fixture', action='store_true',
                   help='Upload and read a real asset before generating album membership actions')
    p.add_argument('--empirical-update-delete', action='store_true',
                   help='Generated cross-method PATCH/DELETE with separate serial controls')
    p.add_argument('--story-profile', choices=('long-interleaving', 'concurrency-breadth'),
                   default='long-interleaving', help='Opt in to an isolated producer/concurrency breadth campaign')
    p.add_argument('--exclude-concurrency-operation', action='append', default=[],
                   help='OpenAPI operationId previously exercised; remove its concurrency scenarios only')
    p.add_argument('--require-new-overlap', action='store_true',
                   help='Fail after preserving evidence unless a nonexcluded oracle genuinely overlaps')
    p.add_argument('--long-story-min-rounds', type=int, default=3)
    p.add_argument('--long-story-max-rounds', type=int, default=6)
    p.add_argument('--prefix-before-concurrency', type=int, default=0)
    p.add_argument('--preflight-only', action='store_true')
    p.add_argument('--freeze-evidence', action='store_true')
    args = p.parse_args()
    if not 1 <= args.runs <= 3 or not 3000 <= args.max_length <= 60000 or not 1 <= args.max_field_pairs <= 24:
        p.error('Runs 1..3; MaxLength 3000..60000; MaxFieldPairs 1..24')
    if not 1 <= args.long_story_min_rounds <= args.long_story_max_rounds <= 16:
        p.error('LongStoryMinRounds <= LongStoryMaxRounds; 1..16')
    if not 0 <= args.prefix_before_concurrency <= args.long_story_min_rounds:
        p.error('PrefixBeforeConcurrency must be 0..LongStoryMinRounds')
    if args.story_profile == 'concurrency-breadth' and args.prefix_before_concurrency:
        p.error('Concurrency breadth requires PrefixBeforeConcurrency 0; depth is a separate profile')
    if args.story_profile == 'concurrency-breadth' and args.verified_album_asset_fixture:
        p.error('Concurrency breadth does not generate album membership action stories')
    if args.empirical_update_delete and (args.story_profile != 'concurrency-breadth'
                                         or args.instances_per_entity < 3 or args.prefix_before_concurrency):
        p.error('Empirical update/delete requires concurrency-breadth, 3+ entity instances, and prefix 0')
    root = args.root.resolve()
    generator = root / 'generator_baseline'
    spec = root / 'model/immich/immich-v3.2.0-openapi.json'
    if sha(spec) != SPEC_SHA:
        p.error('Pinned Immich OpenAPI SHA256 mismatch')
    raw = json.loads(spec.read_text(encoding='utf-8'))
    excluded = []
    for path, entry in list(raw['paths'].items()):
        for method, operation in list(entry.items()):
            if method.lower() in ('get', 'post', 'put', 'patch', 'delete', 'head', 'options') and \
                    operation.get('operationId') in EXCLUDED_SESSION_OPERATIONS:
                excluded.append({'method': method.upper(), 'path': path,
                                 'operation_id': operation['operationId']})
                del entry[method]
        if not any(m.lower() in ('get', 'post', 'put', 'patch', 'delete', 'head', 'options') for m in entry):
            del raw['paths'][path]
    if {e['operation_id'] for e in excluded} != EXCLUDED_SESSION_OPERATIONS:
        p.error('Pinned session boundary changed in OpenAPI: %s' % excluded)
    operations = [op for entry in raw['paths'].values() for method, op in entry.items()
                  if method.lower() in ('get', 'post', 'put', 'patch', 'delete', 'head', 'options')]
    spec_counts = {'active': sum(not op.get('deprecated', False) for op in operations),
                   'deprecated': sum(bool(op.get('deprecated', False)) for op in operations)}
    scripts = root / 'scripts'
    sys.path.insert(0, str(scripts))
    sys.path.insert(0, str(generator))
    from openapi_to_sbt.trace_proxy import build_server as build_proxy
    from openapi_to_sbt.concurrency_adapter import build_server as build_adapter
    from openapi_to_sbt.runtime_observation import patch_runtime_file
    from run_immich_album_serial import authenticate, call
    from immich_asset_fixture import create_verified_asset
    from recover_immich_pilot_identity import recover_identity
    from immich_coverage_gate import from_files as classify_coverage
    from generated_concurrency_matrix import from_files as concurrency_matrix, aggregate as aggregate_matrix
    version = subprocess.check_output([sys.executable, '-m', 'openapi_to_sbt', '--version'],
                                      cwd=generator, text=True).strip()
    if version != '0.26.3':
        p.error('Expected generator 0.26.3; found ' + version)
    provengo = shutil.which('provengo') if not args.preflight_only else None
    if not args.preflight_only:
        if not provengo:
            p.error('provengo is not on PATH')
        info = get_json('http://127.0.0.1:9926/api/server/version')
        if tuple(info.get(k) for k in ('major', 'minor', 'patch')) != (3, 2, 0):
            p.error('Expected isolated Immich v3.2.0 on localhost:9926')
    token = None
    stamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f')[:-3]
    run = root / 'runs' / ('research-fit-immich-generated-' + stamp)
    run.mkdir(parents=True, exist_ok=False)
    projected = run / 'openapi-session-stable.json'
    projected.write_text(json.dumps(raw, sort_keys=True, separators=(',', ':')) + '\n', encoding='utf-8')
    write_json(run / 'scope.json', {'original_spec_sha256': SPEC_SHA,
        'projected_spec_sha256': sha(projected), 'excluded_operations': excluded,
        'selection_reason': 'explicit Immich-specific experiment boundary keeps '
                            'authentication and server mode stable; the generator receives '
                            'this projected OpenAPI',
        'full_source_operations': len(operations) + len(excluded),
        'projected_operations': len(operations)})
    results = []
    matrices = []
    try:
        for n in range(args.runs):
            trial = run / ('seed-' + str(args.base_seed + n))
            trial.mkdir()
            generated = trial / 'generated'
            generated.mkdir()
            # A seed must not inherit an invalidated session from its predecessor.
            if not args.preflight_only:
                credentials_path = root / 'deployment/immich_album_pilot/local-admin-credentials.json'
                try:
                    token = authenticate('http://127.0.0.1:9926', credentials_path)
                except RuntimeError as exc:
                    if str(exc) != 'Isolated server login failed: HTTP 401':
                        raise
                    if not recover_identity(root, credentials_path, 'http://127.0.0.1:9926'):
                        raise RuntimeError('Research identity login failed; automatic recovery '
                                           'from verified local evidence was not possible') from exc
                    print('IMMICH_RESEARCH_IDENTITY_RECOVERED_FROM_VERIFIED_LOCAL_TRACE')
                    token = authenticate('http://127.0.0.1:9926', credentials_path)
                from run_immich_album_serial import call
                if call('http://127.0.0.1:9926', 'GET', '/users/me', token=token)['status'] != 200:
                    raise RuntimeError('Isolated research identity is not authorized for this seed')
                maintenance = call('http://127.0.0.1:9926', 'GET', '/admin/maintenance/status', token=token)
                if (maintenance['status'] != 200 or not isinstance(maintenance['body'], dict) or
                        maintenance['body'].get('active') is not False):
                    raise RuntimeError('Isolated Immich maintenance status is not inactive; '
                                       'stop before generated requests and inspect local server status')
            base = [sys.executable, '-m', 'openapi_to_sbt']
            verified_asset = None
            if args.verified_album_asset_fixture:
                # Preflight does not contact the server. Its sentinel is for
                # static output inspection only and never used by a live run.
                verified_asset = ({'id': '00000000-0000-4000-8000-000000000001',
                                   'state': 'PREFLIGHT_UNVERIFIED'} if args.preflight_only else
                                  create_verified_asset('http://127.0.0.1:9926', token,
                                                        args.base_seed + n, call))
                write_json(trial / 'asset-fixture-evidence.json', verified_asset)
                print('IMMICH_ASSET_FIXTURE seed=%s state=%s' %
                      (args.base_seed + n, verified_asset.get('state', 'CREATED_AND_READ')))
            generate_args = base + ['generate', '--openapi', projected, '--output', generated,
                    '--name', 'immich', '--base-url', 'http://127.0.0.1:9926/api',
                    '--seed', str(args.base_seed + n), '--instances-per-entity', str(args.instances_per_entity),
                    '--instances-per-action', str(args.instances_per_action),
                    '--story-profile', args.story_profile,
                    '--long-story-min-rounds', str(args.long_story_min_rounds),
                    '--long-story-max-rounds', str(args.long_story_max_rounds),
                    '--force']
            if args.prefix_before_concurrency:
                generate_args.append('--emit-prefix-witnesses')
            if args.json_delete_bodies:
                generate_args.append('--json-delete-bodies')
            if args.optional_enum_dependency_branch or args.empirical_update_delete:
                generate_args.append('--optional-enum-dependency-branch')
            if verified_asset:
                values_path = trial / 'verified-values.json'
                write_json(values_path, {'addAssetsToAlbum': {'ids': [verified_asset['id']]}})
                generate_args.extend(('--verified-values', values_path))
            capture(generate_args, generator, trial / 'generate.log')
            verify_args = [sys.executable, '-m', 'openapi_to_sbt.verification_cli',
                           '--openapi', projected, '--output', generated, '--name', 'immich',
                           '--max-field-pairs', str(args.max_field_pairs)]
            if args.max_concurrency_width != 3:
                verify_args.extend(('--max-concurrency-width', str(args.max_concurrency_width)))
            if args.json_disjoint:
                verify_args.append('--json-disjoint')
            if args.empirical_update_delete:
                verify_args.extend(('--empirical-update-delete', '--cross-method-discovery',
                                    '--generation-report', generated / 'generation_report.json'))
            if args.prefix_before_concurrency:
                verify_args.extend(('--prefix-before-concurrency', str(args.prefix_before_concurrency)))
            for operation_id in args.exclude_concurrency_operation:
                verify_args.extend(('--exclude-concurrency-operation', operation_id))
            capture(verify_args, generator, trial / 'verify-generation.log')
            plan_path = generated / 'concurrency-plan.immich.json'
            plan = json.loads(plan_path.read_text(encoding='utf-8'))
            ready_targets = {o['operation_id'] for o in plan['oracles']
                             if o.get('runtime', {}).get('ready')}
            if args.story_profile == 'concurrency-breadth':
                print('IMMICH_CONCURRENCY_INVENTORY seed=%s candidates=%s ready=%s families=%s' %
                      (args.base_seed + n, len(plan['oracles']),
                       sum(bool(o.get('runtime', {}).get('ready')) for o in plan['oracles']),
                       ','.join(sorted(ready_targets))))
            if args.exclude_concurrency_operation:
                print('IMMICH_CONCURRENCY_TARGETS seed=%s ready=%s excluded=%s' %
                      (args.base_seed + n, ','.join(sorted(ready_targets)) or 'NONE',
                       ','.join(sorted(set(args.exclude_concurrency_operation)))))
            if args.require_new_overlap and not ready_targets:
                raise RuntimeError('No runtime-ready concurrency oracle remains after exclusion; '
                                   'stopped before executing generated requests')
            if args.preflight_only:
                if args.story_profile == 'concurrency-breadth':
                    matrix = concurrency_matrix(plan_path, trial / 'concurrent-epochs.jsonl',
                                                preflight=True)
                    write_json(trial / 'concurrency-matrix.json', matrix)
                    matrices.append(matrix)
                summary = summarize(trial, spec_counts)
                results.append({'seed': args.base_seed + n, **summary})
                print('IMMICH_GENERATED_PREFLIGHT seed=%s generated=%s verifiers=%s' %
                      (args.base_seed + n, summary['generated_operations'], summary['verifier_operations']))
                continue
            project = trial / 'provengo_project'
            capture([provengo, '--batch-mode', 'create', project], root, trial / 'provengo-create.log')
            js = project / 'spec/js'
            hello = js / 'hello-world.js'
            if hello.exists():
                hello.unlink()
            proxy_port, adapter_port = free_port(), free_port()
            while proxy_port == adapter_port:
                adapter_port = free_port()
            runtime = ['//@provengo summon rest', "var host = '127.0.0.1';",
                       'var port = %s;' % proxy_port, "var protocol = 'http';",
                       "var sbtConcurrencyAdapterUrl = 'http://127.0.0.1:%s';" % adapter_port,
                       'var __sbtObservedHttpStatuses = [];',
                       'for (var s=100;s<=599;s++) { __sbtObservedHttpStatuses.push(s); }']
            (js / '000-runtime-config.js').write_text('\n'.join(runtime) + '\n', encoding='utf-8')
            for part in ('interfaces', 'stories', 'verification'):
                shutil.copy2(generated / (part + '.immich.js'), js / (part + '.immich.js'))
            policies = [patch_runtime_file(js / (part + '.immich.js')) for part in ('interfaces', 'verification')]
            write_json(trial / 'runtime-observation-policy.json', {'files': policies,
                'scope': 'disposable runtime copies only; external evaluator authoritative'})
            trace = trial / 'http-trace.jsonl'
            epochs = trial / 'concurrent-epochs.jsonl'
            epochs.touch()
            os.environ['IMMICH_GENERATED_EPHEMERAL_TOKEN'] = token
            try:
                proxy = build_proxy(SimpleNamespace(listen_host='127.0.0.1', listen_port=proxy_port,
                    target='http://127.0.0.1:9926', api_prefix='/api', trace=str(trace),
                    bearer_token_env='IMMICH_GENERATED_EPHEMERAL_TOKEN', require_bearer_token=True,
                    authorization_scheme='Bearer', timeout=60.0))
            finally:
                os.environ.pop('IMMICH_GENERATED_EPHEMERAL_TOKEN', None)
            adapter = build_adapter(SimpleNamespace(listen_host='127.0.0.1', listen_port=adapter_port,
                upstream='http://127.0.0.1:%s' % proxy_port, epoch_log=str(epochs), max_width=8,
                openapi_path=str(projected) if args.json_delete_bodies else None,
                timeout=60.0, quiescence_ms=150))
            for server in (proxy, adapter):
                threading.Thread(target=server.serve_forever, daemon=True).start()
            try:
                with (trial / 'provengo-run.log').open('w', encoding='utf-8') as log:
                    completed = subprocess.run([provengo, '--no-color', 'run', '--run-source', ':random',
                        '--random-seed', str(args.base_seed + n), '--max-length', str(args.max_length),
                        str(project)], cwd=root, stdout=log, stderr=subprocess.STDOUT)
                provengo_exit = completed.returncode
            finally:
                for server in (adapter, proxy):
                    server.shutdown()
                    server.server_close()
            evaluation_exit = None
            if trace.exists():
                with (trial / 'evaluator.log').open('w', encoding='utf-8') as log:
                    evaluation_exit = subprocess.run([sys.executable, '-m', 'openapi_to_sbt.evaluate_verifiers',
                        '--trace', str(trace), '--manifest', str(generated / 'verification-manifest.immich.json'),
                        '--output', str(trial / 'generated-verifier-evaluation.json')], cwd=generator,
                        stdout=log, stderr=subprocess.STDOUT).returncode
            summary = summarize(trial, spec_counts)
            coverage_gate = classify_coverage(plan_path, epochs, trace_path=trace,
                                              excluded=args.exclude_concurrency_operation)
            if args.story_profile == 'concurrency-breadth':
                matrix = concurrency_matrix(plan_path, epochs, trace_path=trace,
                    evaluation_path=trial / 'generated-verifier-evaluation.json',
                    excluded=args.exclude_concurrency_operation)
                matrices.append(matrix)
                write_json(trial / 'concurrency-matrix.json', matrix)
                print('IMMICH_CONCURRENCY_MATRIX seed=%s ready=%s overlapped=%s verdicts=%s' %
                      (args.base_seed + n, matrix['runtime_ready_oracles'],
                       matrix['observed_overlap_oracles'], matrix['counts']))
            if verified_asset:
                witness = album_asset_add_witness(trace, verified_asset['id'])
                write_json(trial / 'asset-add-witness.json', witness)
                print('IMMICH_ASSET_ADD_WITNESS seed=%s successes=%s' %
                      (args.base_seed + n, witness['successful_generated_calls']))
            write_json(trial / 'coverage-gate.json', coverage_gate)
            summary['coverage_gate'] = {'observed_operations': coverage_gate['observed_operations'],
                                        'missing_operations': coverage_gate['missing_operations'],
                                        'new_target_overlap': coverage_gate['new_target_overlap']}
            summary.update({'provengo_exit': provengo_exit, 'evaluator_exit': evaluation_exit})
            write_json(trial / 'summary.json', summary)
            write_json(trial / 'summary.json', summary)
            results.append({'seed': args.base_seed + n, **summary})
            print('IMMICH_GENERATED_RESULT seed=%s http=%s epochs=%s overlap=%s oracle=%s status=%s' %
                  (args.base_seed + n, summary['http_events'], summary['epochs'],
                   summary['real_overlap_epochs'], summary['oracle_status'], summary['status']))
            print('IMMICH_COVERAGE_GATE seed=%s observed=%s missing=%s' %
                  (args.base_seed + n, ','.join(coverage_gate['observed_operations']) or 'NONE',
                   ','.join(coverage_gate['missing_operations']) or 'NONE'))
            if summary['invalid_token_events']:
                raise RuntimeError('Authenticated boundary lost: %s invalid-token events; '
                                   'see the preserved trace' % summary['invalid_token_events'])
            if summary['transport_error_events']:
                raise RuntimeError('Upstream transport failure: %s events; '
                                   'server response was not observed, inspect local server and trace' %
                                   summary['transport_error_events'])
            if provengo_exit != 0 or evaluation_exit not in (0, 2, 3):
                raise RuntimeError('Provengo/evaluator execution failure; see seed logs')
            if args.require_new_overlap and not coverage_gate['new_target_overlap']:
                raise RuntimeError('NO_NEW_TARGET_OVERLAP: no excluded-family-independent '
                                   'concurrency witness; evidence preserved')
            if verified_asset and not witness['successful_generated_calls']:
                raise RuntimeError('NO_GENERATED_ASSET_ADD_WITNESS: verified asset was never '
                                   'successfully added by a generated Provengo action')
    except Exception as exc:
        write_json(run / 'campaign.json', {'state': 'INCOMPLETE', 'error': str(exc),
                   'runs': results, 'preflight_only': args.preflight_only})
        if args.freeze_evidence:
            freeze(root, run)
        print('IMMICH_GENERATED_PILOT_INCOMPLETE', str(exc), 'run=', run, file=sys.stderr)
        return 1
    finally:
        if not args.preflight_only:
            token = None
    overall_coverage = aggregate_matrix(matrices) if matrices else None
    if overall_coverage:
        if args.preflight_only:
            overall_coverage['state'] = 'PREFLIGHT_NOT_RUN'
        write_json(run / 'coverage-summary.json', overall_coverage)
        print('IMMICH_COVERAGE_SUMMARY state=%s ready=%s overlapped=%s evaluated=%s missing=%s' %
              (overall_coverage['state'], overall_coverage['runtime_ready_oracles'],
               overall_coverage.get('observed_overlap_oracles', 0),
               overall_coverage.get('evaluated_oracles', 0),
               len(overall_coverage.get('missing_overlap_oracles', []))))
    campaign = {'state': ('PREFLIGHT' if args.preflight_only else
                          overall_coverage['state'] if overall_coverage else 'COMPLETE'),
                'source_sha256': SPEC_SHA, 'generator_version': version,
                'projected_spec_sha256': sha(projected), 'excluded_operations': excluded,
                'selection': 'Explicit Immich OpenAPI projection excludes ten session/identity '
                             'and maintenance/restore operations; generated '
                             + args.story_profile + '; no analyst-authored stories',
                'parameters': {'runs': args.runs, 'base_seed': args.base_seed,
                               'max_length': args.max_length,
                               'instances_per_entity': args.instances_per_entity,
                               'instances_per_action': args.instances_per_action,
                               'max_field_pairs': args.max_field_pairs,
                               **({'max_concurrency_width': args.max_concurrency_width}
                                  if args.max_concurrency_width != 3 else {}),
                               'json_disjoint': args.json_disjoint,
                               'optional_enum_dependency_branch': bool(
                                   args.optional_enum_dependency_branch or args.empirical_update_delete),
                               'empirical_update_delete': args.empirical_update_delete,
                               'story_profile': args.story_profile,
                               'verified_album_asset_fixture': args.verified_album_asset_fixture,
                               'excluded_concurrency_operations': args.exclude_concurrency_operation,
                               'require_new_overlap': args.require_new_overlap,
                               'long_story_min_rounds': args.long_story_min_rounds,
                               'long_story_max_rounds': args.long_story_max_rounds,
                               'prefix_before_concurrency': args.prefix_before_concurrency},
                'runs': results, 'preflight_only': args.preflight_only}
    write_json(run / 'campaign.json', campaign)
    if args.freeze_evidence:
        freeze(root, run)
    print('IMMICH_GENERATED_PILOT_COMPLETE run=' + str(run))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
