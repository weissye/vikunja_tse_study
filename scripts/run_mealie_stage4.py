#!/usr/bin/env python3
"""Pinned Mealie experiment using the existing OpenAPI generator and Provengo runtime."""
import argparse
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
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

VERSION = 'v3.27.0'
BASE = 'http://127.0.0.1:9927'
ROOTS = ('/api/recipes', '/api/organizers', '/api/households/shopping',
         '/api/households/mealplans')
EXCLUDED_PATH_PARTS = ('/exports', '/create/url', '/create/ai', '/create/zip',
                       '/scrape', '/bulk', '/images', '/assets', '/import')
SENSITIVE = re.compile(r'password|token|secret|authorization|cookie|api.?key|credential|pin.?code', re.I)
METHODS = {'get', 'post', 'patch', 'put', 'delete', 'head', 'options'}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, sort_keys=True, indent=2) + '\n', encoding='utf-8')


def project(spec):
    """Explicit experiment boundary; leave components untouched and record exclusions."""
    result = json.loads(json.dumps(spec))
    kept = {}
    excluded = []
    for path, item in result['paths'].items():
        # Prefix must finish at a path boundary (not /recipes-troubleshooting).
        eligible = any(path == root or path.startswith(root + '/') for root in ROOTS)
        eligible = eligible and not any(part in path.lower() for part in EXCLUDED_PATH_PARTS)
        if eligible:
            kept[path] = item
        else:
            excluded.extend({'path': path, 'method': m, 'operation_id': op.get('operationId')}
                            for m, op in item.items() if m.lower() in METHODS)
    result['paths'] = kept
    return result, excluded


def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


def capture(command, cwd, log):
    with log.open('w', encoding='utf-8') as stream:
        result = subprocess.run([str(x) for x in command], cwd=cwd,
                                stdout=stream, stderr=subprocess.STDOUT, check=False)
    if result.returncode:
        raise RuntimeError('%s exited %s; see %s' % (command[0], result.returncode, log))


def get_token():
    supplied = os.environ.get('MEALIE_RESEARCH_TOKEN')
    if supplied:
        return supplied
    # This login is only for the isolated, loopback-bound, newly created research instance.
    data = urllib.parse.urlencode({'username': 'changeme@example.com',
                                   'password': 'MyPassword'}).encode('utf-8')
    request = urllib.request.Request(BASE + '/api/auth/token', data=data, method='POST',
                                     headers={'Content-Type': 'application/x-www-form-urlencoded'})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            token = json.load(response)['access_token']
    except (urllib.error.HTTPError, urllib.error.URLError, KeyError) as exc:
        raise RuntimeError('Isolated Mealie login failed; set MEALIE_RESEARCH_TOKEN to an API token '
                           'created in the local user profile') from exc
    return token


def verified_identity(token):
    request = urllib.request.Request(BASE + '/api/users/self',
                                     headers={'Authorization': 'Bearer ' + token})
    with urllib.request.urlopen(request, timeout=10) as response:
        if response.status != 200 or not isinstance(json.load(response), dict):
            raise RuntimeError('Research identity was not readable')


def scrub(value):
    if isinstance(value, dict):
        return {key: ('[REDACTED]' if SENSITIVE.search(key) else scrub(item))
                for key, item in value.items()}
    if isinstance(value, list):
        return [scrub(item) for item in value]
    return value


def safe_trace(row):
    """Export HTTP outcomes and timings, no request or response bodies."""
    return {key: row.get(key) for key in ('method', 'model_path', 'status', 'epoch_id',
            'operation_id', 'upstream_started_utc', 'upstream_completed_utc',
            'transport_error', 'trace_sequence', 'timestamp_utc') if key in row}


def freeze(root, run):
    archive_dir = root / 'evidence'
    archive_dir.mkdir(exist_ok=True)
    archive = archive_dir / (run.name + '-review.zip')
    files = {}
    for item in ('campaign.json', 'scope.json', 'openapi-comparison.json',
                 'verified-create-values.json', 'mealplan-serial-control.json',
                 'coverage-matrix.json', 'combined-review.json', 'target-decision.json',
                 'coverage-target.json'):
        if (run / item).exists():
            files[item] = ((json.dumps(scrub(json.loads((run / item).read_text(encoding='utf-8'))),
                                        sort_keys=True) + '\n').encode('utf-8')
                           if item in ('combined-review.json', 'target-decision.json') else (run / item).read_bytes())
    for seed in sorted(run.glob('seed-*')):
        for item in ('summary.json', 'target-decision.json', 'coverage-target.json',
                     'prefix-feasibility.json', 'generated/generation_report.json',
                     'generated/dependency_graph.json', 'generated/verifier-coverage.mealie.json',
                     'generated/concurrency-plan.mealie.json',
                     'generated/verification-manifest.mealie.json', 'generated-verifier-evaluation.json'):
            path = seed / item
            if path.exists():
                files[seed.name + '/' + item] = (json.dumps(scrub(json.loads(path.read_text(encoding='utf-8'))),
                            sort_keys=True) + '\n').encode('utf-8')
        for item in ('http-trace.jsonl', 'concurrent-epochs.jsonl'):
            path = seed / item
            if path.exists():
                lines = []
                for line in path.read_text(encoding='utf-8').splitlines():
                    if line.strip():
                        row = json.loads(line)
                        lines.append(json.dumps(safe_trace(row) if item.startswith('http') else scrub(row),
                                                sort_keys=True))
                files[seed.name + '/' + item] = ('\n'.join(lines) + '\n').encode('utf-8')
    checks = [['path', 'sha256']] + [[key, hashlib.sha256(files[key]).hexdigest()] for key in sorted(files)]
    import io
    output = io.StringIO()
    csv.writer(output).writerows(checks)
    files['checksums.csv'] = output.getvalue().encode('utf-8')
    with zipfile.ZipFile(archive, 'x', compression=zipfile.ZIP_DEFLATED) as z:
        for key in sorted(files):
            z.writestr(key, files[key])
    print('MEALIE_STAGE4_EVIDENCE_READY', archive)
    print('ZIP SHA256:', digest(archive))


def summarize(seed):
    trace = seed / 'http-trace.jsonl'
    epochs = seed / 'concurrent-epochs.jsonl'
    rows = [json.loads(line) for line in trace.read_text(encoding='utf-8').splitlines() if line.strip()] if trace.exists() else []
    epoch_rows = [json.loads(line) for line in epochs.read_text(encoding='utf-8').splitlines() if line.strip()] if epochs.exists() else []
    evidence = {}
    for row in rows:
        if row.get('epoch_id') and row.get('method') in ('POST', 'PUT', 'PATCH', 'DELETE'):
            evidence.setdefault(row['epoch_id'], []).append(row)
    overlap = 0
    for group in evidence.values():
        if len(group) >= 2 and all(row.get('upstream_started_utc') and row.get('upstream_completed_utc') for row in group):
            if max(row['upstream_started_utc'] for row in group) < min(row['upstream_completed_utc'] for row in group):
                overlap += 1
    evaluation = seed / 'generated-verifier-evaluation.json'
    oracle = json.loads(evaluation.read_text(encoding='utf-8')) if evaluation.exists() else {}
    return {'http_events': len(rows), 'epoch_count': len(epoch_rows), 'real_overlap_epochs': overlap,
            'http_statuses': dict(Counter(str(row.get('status')) for row in rows)),
            'oracle_status': oracle.get('run_status', 'NOT_EVALUATED'), 'oracle_counts': oracle.get('counts', {}),
            'transport_errors': sum(bool(row.get('transport_error')) for row in rows)}


def prefix_story_operations(story_source):
    """Operations for which generated JS can emit a verified prefix event."""
    result = set()
    for line in story_source.splitlines():
        if 'SBT:PrefixVerified' not in line:
            continue
        match = re.search(r'operation_id:("(?:\\.|[^"\\])*")', line)
        if match:
            result.add(json.loads(match.group(1)))
    return result


def prefix_coverage(generated, plan):
    available = prefix_story_operations((generated / 'stories.mealie.js').read_text(encoding='utf-8'))
    ready = [oracle for oracle in plan['oracles'] if oracle.get('runtime', {}).get('ready')]
    matched = [oracle['oracle_id'] for oracle in ready if oracle['operation_id'] in available]
    missing = [oracle['oracle_id'] for oracle in ready if oracle['operation_id'] not in available]
    return {'prefix_story_operations': sorted(available), 'ready_oracles': len(ready),
            'matched_oracles': matched, 'unmatched_oracles': missing}


def evaluated_complexity(evaluation):
    witnesses = [w for w in evaluation.get('witnesses', []) if w.get('epoch_id')]
    # A rejected prefix can include {"round": n} as diagnostic evidence.
    # Count only the evaluator's causally verified, complete prefix records.
    gated = [w for w in witnesses if w.get('prefix_evidence', {}).get('last_verified_utc')
             and w.get('prefix_evidence', {}).get('rounds', 0) > 0]
    return {'concurrency_evaluated': sum(w.get('result') in ('PASS', 'VIOLATED') for w in witnesses),
            'prefix_verified_epochs': len(gated),
            'max_prefix_rounds': max((w['prefix_evidence'].get('rounds', 0) for w in gated), default=0)}


def story_progress(log_path):
    """Summarize local Provengo progress without exporting payloads or secrets."""
    counters = Counter()
    reasons = Counter()
    with log_path.open(encoding='utf-8', errors='replace') as log:
        for line in log:
            if 'Selected: [SBT:' not in line:
                continue
            for event in ('PrefixVerified', 'LongStoryStep', 'ConcurrencyReady', 'ConcurrencySkipped',
                          'InstanceUnavailable', 'InstanceUnresolved'):
                if 'Selected: [SBT:' + event in line:
                    counters[event] += 1
            if 'Selected: [SBT:StorySkipped' in line:
                counters['StorySkipped'] += 1
                match = re.search(r'reason:"([a-z-]+)"', line)
                reasons[match.group(1) if match else 'unknown'] += 1
    return {'story_event_counts': dict(sorted(counters.items())),
            'story_skip_reasons': dict(sorted(reasons.items()))}


def gated_coverage_state(summary):
    progress = summary.get('story_event_counts', {})
    if not summary.get('prefix_verified_epochs'):
        return ('PREREQUISITE_BLOCKED' if progress.get('StorySkipped') else
                'PREFIX_NOT_OBSERVED')
    if not summary.get('real_overlap_epochs'):
        return 'NO_REAL_OVERLAP'
    if not summary.get('concurrency_evaluated'):
        return 'ORACLE_INCONCLUSIVE'
    return 'VERIFIED_PREFIX_AND_ORACLE_COVERAGE'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--runs', type=int, default=2)
    parser.add_argument('--base-seed', type=int, default=20261801)
    parser.add_argument('--max-length', type=int, default=25000)
    parser.add_argument('--instances-per-entity', type=int, default=2)
    parser.add_argument('--instances-per-action', type=int, default=1)
    parser.add_argument('--max-field-pairs', type=int, default=3)
    parser.add_argument('--max-concurrency-width', type=int, default=2)
    parser.add_argument('--prefix-rounds', type=int, default=6)
    parser.add_argument('--story-profile', choices=('concurrency-breadth', 'long-interleaving'),
                        default='concurrency-breadth')
    parser.add_argument('--prefix-before-concurrency', type=int, default=0)
    parser.add_argument('--stage4-branch', choices=('baseline', 'tool-gap', 'mealplan-put-delete'),
                        default='baseline')
    parser.add_argument('--combined-campaign', action='store_true',
                        help='Opt in to combined same-record, NO-OP, disjoint PUT and cross-entity oracles')
    parser.add_argument('--target-oracle-id', help='Run one generated concurrency oracle on an isolated instance')
    parser.add_argument('--coverage-target-oracle-id',
                        help='Select one generated oracle for missing-family coverage without the rule-specific bug classifier')
    parser.add_argument('--preflight-only', action='store_true')
    parser.add_argument('--freeze-evidence', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve()
    generator = root / 'generator_baseline'
    spec = root / 'model/mealie/openapi-stage4-v3.27.0.json'
    if args.runs < 1 or args.max_length < 100 or not 1 <= args.prefix_rounds <= 16 or args.max_concurrency_width not in (2, 3):
        parser.error('runs >= 1, max-length >= 100, 1 <= prefix-rounds <= 16 and max-concurrency-width 2 or 3 are required')
    if not 0 <= args.prefix_before_concurrency <= 16:
        parser.error('prefix-before-concurrency must be 0..16')
    if args.prefix_before_concurrency and (args.story_profile != 'long-interleaving' or
                                           args.prefix_before_concurrency > args.prefix_rounds):
        parser.error('a gated prefix requires long-interleaving and at least that many prefix rounds')
    if args.stage4_branch != 'baseline' and args.prefix_before_concurrency:
        parser.error('targeted branches require independent serial controls; use prefix-before-concurrency 0')
    if args.target_oracle_id and args.coverage_target_oracle_id:
        parser.error('target-oracle-id and coverage-target-oracle-id are mutually exclusive')
    if (args.target_oracle_id or args.coverage_target_oracle_id) and (not args.combined_campaign or args.stage4_branch != 'baseline' or
                                 args.prefix_before_concurrency < 1):
        parser.error('target oracle requires combined campaign, baseline branch and verified prefix')
    if args.stage4_branch == 'mealplan-put-delete' and args.instances_per_entity < 3:
        parser.error('PUT/DELETE requires three independently created item instances')
    if not generator.exists() or not spec.exists():
        parser.error('Missing existing generator_baseline or Mealie OpenAPI; run Prepare-Mealie-Stage4 first')
    from mealie_spec_gate import comparison
    checked = comparison(root / 'model/mealie/openapi.json', spec)
    if checked['state'] != 'ACCEPTED_EQUIVALENT_CONTRACT':
        parser.error('Mealie OpenAPI contract changed; see model/mealie/stage4-spec-comparison.json')
    actual = checked['new_sha256']
    sys.path.insert(0, str(generator))
    from openapi_to_sbt.trace_proxy import build_server as build_proxy
    from openapi_to_sbt.concurrency_adapter import build_server as build_adapter
    from openapi_to_sbt.runtime_observation import patch_runtime_file
    generator_version = subprocess.check_output([sys.executable, '-m', 'openapi_to_sbt', '--version'],
                                                cwd=generator, text=True).strip()
    if generator_version != '0.26.16':
        parser.error('Expected generator version 0.26.16, got ' + generator_version)
    spec_data = json.loads(spec.read_text(encoding='utf-8'))
    if spec_data.get('info', {}).get('version') != VERSION:
        parser.error('Expected Mealie ' + VERSION)
    projected, excluded = project(spec_data)
    if not projected['paths']:
        parser.error('No paths left in experiment projection')
    binary = shutil.which('provengo') if not args.preflight_only else None
    if not args.preflight_only and not binary:
        parser.error('Provengo is required for the live campaign')
    stamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f')[:-3]
    run = root / 'runs' / ('research-fit-mealie-stage4-' + stamp)
    run.mkdir(parents=True, exist_ok=False)
    write_json(run / 'openapi-comparison.json', checked)
    chosen = run / 'openapi-projected.json'
    write_json(chosen, projected)
    write_json(run / 'scope.json', {'full_spec_sha256': actual, 'projection_sha256': digest(chosen),
        'generator_version': generator_version,
        'kept_operations': sum(m in METHODS for x in projected['paths'].values() for m in x),
        'excluded_operations': excluded, 'scope_roots': ROOTS,
        'external_inputs_excluded': EXCLUDED_PATH_PARTS})
    results = []
    # This is an explicit, reviewed fixture. The OpenAPI marks title/text
    # optional; it does not justify silently requiring them for all creates.
    fixture = root / 'config/mealie_verified_create_values.json'
    control = root / 'evidence/mealie-mealplan-create-serial-controls.json'
    if not fixture.is_file() or not control.is_file():
        raise RuntimeError('Verified meal-plan create fixture/control missing')
    observation = json.loads(control.read_text(encoding='utf-8'))
    cases = {case.get('case'): case for case in observation.get('cases', [])}
    if not (cases.get('date_only', {}).get('status') == 422 and
            cases.get('text_only', {}).get('status') == 422 and
            cases.get('title_and_text', {}).get('status') == 201 and
            cases['title_and_text'].get('field_names') == ['date', 'text', 'title']):
        raise RuntimeError('Serial create observation does not justify verified fixture')
    supplied = json.loads(fixture.read_text(encoding='utf-8'))
    values = supplied.get('create_one_api_households_mealplans_post', {})
    if (set(supplied) != {'create_one_api_households_mealplans_post'} or
            set(values) != {'title', 'text'} or not values['title'] or
            values['title'] != values['text']):
        raise RuntimeError('Verified create fixture must preserve the successful serial shape')
    write_json(run / 'verified-create-values.json', supplied)
    write_json(run / 'mealplan-serial-control.json', observation)
    update_control_path = root / 'evidence/mealie-mealplan-update-20261815-control.json'
    if not update_control_path.is_file():
        raise RuntimeError('Verified meal-plan update serial control missing')
    update_control = json.loads(update_control_path.read_text(encoding='utf-8'))
    serial = update_control.get('serial_control', {})
    earlier = update_control.get('previous_puts', [])
    if (update_control.get('spec_sha256') != actual or
            serial.get('classification') != 'FULL_READ_DERIVED_PUT_VALID' or
            serial.get('complete', {}).get('status') != 200 or
            not serial.get('final_value_visible') or
            len(earlier) != 4 or
            any(item.get('status') != 422 or
                not any(err.get('loc') == ['body', 'recipe_id'] and err.get('type') == 'value_error'
                        for err in item.get('validation', {}).get('errors', []))
                    for item in earlier)):
        raise RuntimeError('Serial control does not justify verified read-derived update')
    write_json(run / 'mealplan-update-control.json', update_control)
    try:
        for offset in range(args.runs):
            number = args.base_seed + offset
            seed = run / ('seed-' + str(number))
            seed.mkdir()
            generated = seed / 'generated'
            generated.mkdir()
            token = None if args.preflight_only else get_token()
            if token:
                verified_identity(token)
            gen = [sys.executable, '-m', 'openapi_to_sbt', 'generate', '--openapi', chosen,
                '--output', generated, '--name', 'mealie', '--base-url', BASE,
                '--seed', str(number), '--instances-per-entity', str(args.instances_per_entity),
                '--instances-per-action', str(args.instances_per_action),
                '--story-profile', args.story_profile,
                '--long-story-min-rounds', str(args.prefix_rounds),
                '--long-story-max-rounds', str(min(16, args.prefix_rounds + 2)),
                '--verified-values', fixture,
                '--verified-update-carry', 'update_one_api_households_mealplans__item_id__put',
                '--force']
            if args.prefix_before_concurrency:
                gen.append('--emit-prefix-witnesses')
            capture(gen, generator, seed / 'generate.log')
            capture([sys.executable, '-m', 'openapi_to_sbt.verification_cli',
                '--openapi', chosen, '--output', generated, '--name', 'mealie',
                '--max-field-pairs', str(args.max_field_pairs),
                '--max-concurrency-width', str(args.max_concurrency_width),
                '--post-join-observation', '--require-serial-controls'] +
                (['--combined-campaign'] if args.combined_campaign else []) +
                (['--include-concurrency-oracle', args.target_oracle_id or args.coverage_target_oracle_id]
                 if (args.target_oracle_id or args.coverage_target_oracle_id) else []) +
                (['--exclusive-control-lease'] if args.target_oracle_id else []) +
                (['--include-concurrency-operation', 'update_one_api_organizers_tools__item_id__put']
                 if args.stage4_branch == 'tool-gap' else []) +
                (['--empirical-update-delete-put', 'update_one_api_households_mealplans__item_id__put',
                  '--generation-report', generated / 'generation_report.json']
                 if args.stage4_branch == 'mealplan-put-delete' else []) +
                (['--prefix-before-concurrency', str(args.prefix_before_concurrency)]
                 if args.prefix_before_concurrency else []),
                generator, seed / 'verify-generation.log')
            plan = json.loads((generated / 'concurrency-plan.mealie.json').read_text(encoding='utf-8'))
            ready = sum(bool(item.get('runtime', {}).get('ready')) for item in plan['oracles'])
            if args.target_oracle_id or args.coverage_target_oracle_id:
                chosen_oracles = [o for o in plan['oracles'] if o.get('oracle_id') ==
                                  (args.target_oracle_id or args.coverage_target_oracle_id)]
                if len(plan['oracles']) != 1 or len(chosen_oracles) != 1 or ready != 1:
                    raise RuntimeError('Expected exactly one executable OpenAPI-derived target oracle')
                if (args.target_oracle_id ==
                        'concurrency::disjoint-put::update_one_api_households_mealplans_rules__item_id__put' and
                        (chosen_oracles[0].get('kind') != 'disjoint-put-serial-outcomes' or
                         {f['name'] for f in chosen_oracles[0].get('fields', [])} != {'day', 'entryType'} or
                         chosen_oracles[0].get('method') != 'PUT')):
                    raise RuntimeError('Pinned meal-plan rule fields or generated oracle changed')
            if args.stage4_branch != 'baseline' and ready != 1:
                raise RuntimeError('Target branch must have exactly one contract-derived executable oracle')
            if args.prefix_before_concurrency:
                coverage = prefix_coverage(generated, plan)
                graph = json.loads((generated / 'dependency_graph.json').read_text(encoding='utf-8'))
                coverage['dependency_edges'] = len(graph.get('edges', []))
                write_json(seed / 'prefix-feasibility.json', coverage)
                print('MEALIE_STAGE4_PREFIX_FEASIBILITY seed=%s ready=%s matched=%s unmatched=%s' %
                      (number, ready, len(coverage['matched_oracles']),
                       len(coverage['unmatched_oracles'])))
                print('MEALIE_STAGE4_DEPENDENCY_EDGES seed=%s edges=%s' %
                      (number, coverage['dependency_edges']))
                if not coverage['matched_oracles']:
                    raise RuntimeError('No generated story emits a matching verified prefix; see prefix-feasibility.json')
            if args.preflight_only:
                write_json(seed / 'summary.json', {'seed': number, 'state': 'PREFLIGHT_ONLY',
                    'oracles': len(plan['oracles']), 'runtime_ready_oracles': ready})
                results.append({'seed': number, 'state': 'PREFLIGHT_ONLY', 'ready': ready})
                print('MEALIE_STAGE4_PREFLIGHT seed=%s candidates=%s ready=%s' % (number, len(plan['oracles']), ready))
                continue
            project_path = seed / 'provengo_project'
            capture([binary, '--batch-mode', 'create', project_path], root, seed / 'provengo-create.log')
            js = project_path / 'spec/js'
            (js / 'hello-world.js').unlink(missing_ok=True)
            proxy_port, adapter_port = free_port(), free_port()
            while proxy_port == adapter_port:
                adapter_port = free_port()
            (js / '000-runtime-config.js').write_text('//@provengo summon rest\n'
                "var host = '127.0.0.1';\nvar port = %d;\nvar protocol = 'http';\n" % proxy_port +
                "var sbtConcurrencyAdapterUrl = 'http://127.0.0.1:%d';\n" % adapter_port +
                'var __sbtObservedHttpStatuses = [];\n'
                'for (var s=100;s<=599;s++) { __sbtObservedHttpStatuses.push(s); }\n', encoding='utf-8')
            for part in ('interfaces', 'stories', 'verification'):
                shutil.copy2(generated / (part + '.mealie.js'), js / (part + '.mealie.js'))
            for part in ('interfaces', 'verification'):
                patch_runtime_file(js / (part + '.mealie.js'))
            trace, epochs = seed / 'http-trace.jsonl', seed / 'concurrent-epochs.jsonl'
            epochs.touch()
            env_name = 'SBT_MEALIE_EPHEMERAL_TOKEN'
            os.environ[env_name] = token
            try:
                proxy = build_proxy(SimpleNamespace(listen_host='127.0.0.1', listen_port=proxy_port,
                    target=BASE, api_prefix='', trace=str(trace), bearer_token_env=env_name,
                    require_bearer_token=True, authorization_scheme='Bearer', timeout=60.0))
            finally:
                os.environ.pop(env_name, None)
            adapter = build_adapter(SimpleNamespace(listen_host='127.0.0.1', listen_port=adapter_port,
                upstream='http://127.0.0.1:%d' % proxy_port, epoch_log=str(epochs),
                max_width=8, openapi_path=None, timeout=60.0, quiescence_ms=150))
            threads = [threading.Thread(target=s.serve_forever, daemon=True) for s in (proxy, adapter)]
            for thread in threads:
                thread.start()
            try:
                with (seed / 'provengo-run.log').open('w', encoding='utf-8') as log:
                    code = subprocess.run([binary, '--no-color', 'run', '--run-source', ':random',
                        '--random-seed', str(number), '--max-length', str(args.max_length), str(project_path)],
                        cwd=root, stdout=log, stderr=subprocess.STDOUT).returncode
            finally:
                for server in (adapter, proxy):
                    server.shutdown()
                    server.server_close()
                for thread in threads:
                    thread.join(timeout=3)
            with (seed / 'evaluator.log').open('w', encoding='utf-8') as log:
                evaluation_code = subprocess.run([sys.executable, '-m', 'openapi_to_sbt.evaluate_verifiers',
                    '--trace', trace, '--manifest', generated / 'verification-manifest.mealie.json',
                    '--output', seed / 'generated-verifier-evaluation.json'], cwd=generator,
                    stdout=log, stderr=subprocess.STDOUT).returncode
            summary = {'seed': number, 'provengo_exit': code, 'evaluator_exit': evaluation_code,
                       'runtime_ready_oracles': ready, 'stage4_branch': args.stage4_branch,
                       **summarize(seed),
                       **story_progress(seed / 'provengo-run.log')}
            if args.stage4_branch != 'baseline':
                evaluation = json.loads((seed / 'generated-verifier-evaluation.json').read_text(encoding='utf-8'))
                targeted = [w for w in evaluation['witnesses'] if w.get('kind') in
                            ('empirical-update-delete', 'same-field-one-successful-value-visible') and w.get('epoch_id')]
                summary['target_verdicts'] = dict(Counter(w['result'] for w in targeted))
                summary['target_observed'] = len(targeted)
                print('MEALIE_STAGE4_TARGET seed=%s branch=%s witnessed=%d verdicts=%s skipped=%s' %
                      (number, args.stage4_branch, len(targeted), summary['target_verdicts'],
                       summary['story_event_counts'].get('ConcurrencySkipped', 0)))
            if args.prefix_before_concurrency and (seed / 'generated-verifier-evaluation.json').exists():
                summary.update(evaluated_complexity(json.loads(
                    (seed / 'generated-verifier-evaluation.json').read_text(encoding='utf-8'))))
                print('MEALIE_STAGE4_PREFIX_RESULT seed=%s verified_epochs=%s max_rounds=%s evaluated=%s' %
                      (number, summary['prefix_verified_epochs'], summary['max_prefix_rounds'],
                       summary['concurrency_evaluated']))
            if args.prefix_before_concurrency:
                summary['coverage_state'] = gated_coverage_state(summary)
                print('MEALIE_STAGE4_COVERAGE_GATE seed=%s state=%s events=%s skipped=%s' %
                      (number, summary['coverage_state'], summary['story_event_counts'],
                       summary['story_skip_reasons']))
            write_json(seed / 'summary.json', summary)
            target_report = None
            if args.coverage_target_oracle_id and evaluation_code in (0, 2, 3):
                from mealie_coverage_target import analyze_target
                target_report = analyze_target(seed, args.coverage_target_oracle_id,
                                               args.prefix_before_concurrency)
                write_json(seed / 'coverage-target.json', target_report)
                print('MEALIE_CLOSURE_TARGET seed=%s state=%s verdicts=%s' %
                      (number, target_report['state'], target_report['verdicts']))
            if args.target_oracle_id and evaluation_code in (0, 2, 3):
                from mealie_rule_decision import analyze_seed
                decision = analyze_seed(seed, args.target_oracle_id)
                write_json(seed / 'target-decision.json', decision)
                print('MEALIE_RULE_DECISION seed=%s classification=%s result=%s' %
                      (number, decision['classification'], decision.get('witness_result')))
                if decision['classification'] in ('NOT_OBSERVED', 'INCONCLUSIVE'):
                    raise RuntimeError('Focused oracle did not reach a conclusive verified epoch')
            results.append(summary)
            print('MEALIE_STAGE4_RESULT seed=%s http=%s epochs=%s overlap=%s ready=%s oracle=%s' %
                  (number, summary['http_events'], summary['epoch_count'],
                   summary['real_overlap_epochs'], ready, summary['oracle_status']))
            if code or evaluation_code not in (0, 2, 3) or summary['transport_errors']:
                raise RuntimeError('Provengo/evaluator/transport failure; inspect preserved seed logs')
            if args.prefix_before_concurrency and summary['coverage_state'] != 'VERIFIED_PREFIX_AND_ORACLE_COVERAGE':
                raise RuntimeError('Coverage gate: ' + summary['coverage_state'] + '; inspect preserved seed summary')
            if args.coverage_target_oracle_id and (target_report is None or
                    target_report['state'] != 'VERIFIED_PREFIX_AND_ORACLE_COVERAGE'):
                raise RuntimeError('Target coverage gate: ' +
                                   (target_report['state'] if target_report else 'NOT_EVALUATED') +
                                   '; inspect preserved seed report')
            if args.stage4_branch != 'baseline' and (
                    not summary['target_observed'] or not summary['real_overlap_epochs']):
                raise RuntimeError('Target branch did not reach a verifiable overlapping epoch')
        write_json(run / 'campaign.json', {'state': 'PREFLIGHT' if args.preflight_only else 'COMPLETE',
                   'generator_version': generator_version,
                   'results': results, 'parameters': vars(args) | {'root': str(root)}})
    except Exception as exc:
        write_json(run / 'campaign.json', {'state': 'INCOMPLETE', 'error': str(exc), 'results': results})
        print('MEALIE_STAGE4_INCOMPLETE', str(exc), 'run=', run, file=sys.stderr)
        return_code = 1
    else:
        return_code = 0
    if args.combined_campaign and any(run.glob('seed-*/generated/concurrency-plan.mealie.json')):
        from coverage_matrix import read_run, REQUESTED_FAMILIES
        coverage = read_run(run)
        write_json(run / 'coverage-matrix.json', {
            'schema_version': 1, 'requested_families': REQUESTED_FAMILIES,
            'seeds': coverage,
            'all_requested_families_proven': all(
                row[family]['prefix_and_evaluated'] > 0
                for row in coverage.values() for family in REQUESTED_FAMILIES)})
        if not args.preflight_only and return_code == 0:
            from mealie_combined_review import analyze_run
            write_json(run / 'combined-review.json', analyze_run(run))
    if args.target_oracle_id:
        write_json(run / 'target-decision.json', {
            'schema_version': 1, 'target_oracle_id': args.target_oracle_id,
            'seeds': {p.parent.name: json.loads(p.read_text(encoding='utf-8'))
                      for p in sorted(run.glob('seed-*/target-decision.json'))}})
    if args.coverage_target_oracle_id:
        write_json(run / 'coverage-target.json', {
            'schema_version': 1, 'target_oracle_id': args.coverage_target_oracle_id,
            'seeds': {p.parent.name: json.loads(p.read_text(encoding='utf-8'))
                      for p in sorted(run.glob('seed-*/coverage-target.json'))}})
    if args.freeze_evidence:
        freeze(root, run)
    print('MEALIE_STAGE4_RUN', run)
    return return_code


if __name__ == '__main__':
    sys.exit(main())
