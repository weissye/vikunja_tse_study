#!/usr/bin/env python3
"""Sample an existing generated Provengo model and audit observable model events.

This tool never runs ``provengo run``. It makes no assertion about server overlap.
"""
import argparse
from collections import Counter
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys


def scenarios_from(document):
    """Return scenarios only for explicitly recognized run-source structures."""
    if isinstance(document, list):
        items = document
    elif isinstance(document, dict):
        for key in ('scenarios', 'runs', 'samples'):
            if isinstance(document.get(key), list):
                items = document[key]
                break
        else:
            raise ValueError('unknown run-source structure: ' + ', '.join(document))
    else:
        raise ValueError('run-source must be an object or array')
    result = []
    for index, item in enumerate(items):
        if isinstance(item, list):
            events = item
        elif isinstance(item, dict):
            events = next((item[k] for k in ('events', 'scenario', 'trace')
                           if isinstance(item.get(k), list)), None)
        else:
            events = None
        if events is None:
            raise ValueError(f'unknown scenario structure at index {index}')
        result.append(events)
    return result


def scenario_list_key(document):
    if isinstance(document, list):
        return None
    if isinstance(document, dict):
        keys = [key for key in ('scenarios', 'runs', 'samples')
                if isinstance(document.get(key), list)]
        if len(keys) == 1:
            return keys[0]
    raise ValueError('ambiguous or unknown run-source structure')


def merge_batches(batch_paths, destination, expected_size):
    """Build one run source from complete independent batches, failing closed."""
    combined = None
    key = None
    counts = []
    for path in batch_paths:
        document = json.loads(path.read_text(encoding='utf-8'))
        scenarios = scenarios_from(document)
        this_key = scenario_list_key(document)
        if combined is None:
            combined = document
            key = this_key
        else:
            if key != this_key or (key is not None and
                                   {k: v for k, v in combined.items() if k != key} !=
                                   {k: v for k, v in document.items() if k != key}):
                raise ValueError('incompatible batch run-source structures')
            (combined if key is None else combined[key]).extend(
                document if key is None else document[key])
        counts.append(len(scenarios))
    if sum(counts) != expected_size:
        raise ValueError(f'merged {sum(counts)} scenarios, requested {expected_size}')
    destination.write_text(json.dumps(combined, ensure_ascii=False) + '\n', encoding='utf-8')
    return counts


def event_name(event):
    if isinstance(event, str):
        return event
    if isinstance(event, dict):
        for key in ('name', 'eventName', 'event'):
            if isinstance(event.get(key), str):
                return event[key]
    raise ValueError('unrecognized event; cannot audit model coverage')


def event_data(event):
    if isinstance(event, dict):
        for key in ('data', 'payload'):
            if isinstance(event.get(key), dict):
                return event[key]
    return {}


def classify(events, oracle_ids):
    names = [event_name(e) for e in events]
    data = [event_data(e) for e in events]
    joined = '\n'.join(names)
    oracle_hits = [oid for oid in oracle_ids if oid in joined or any(oid in json.dumps(x) for x in data)]
    starts = [n for n in names if 'EpochStart' in n or 'EpochStarted' in n]
    ends = [n for n in names if 'EpochFinished' in n or 'EpochClosed' in n]
    ready = [n for n in names if 'ConcurrencyReady' in n]
    prefix = [n for n in names if 'PrefixVerified' in n]
    return {'events': len(events), 'prefix_events': len(prefix), 'epoch_start_events': len(starts),
            'epoch_end_events': len(ends), 'concurrency_ready_events': len(ready),
            'oracle_ids': oracle_hits, 'has_complete_epoch_markers': bool(starts and ends),
            'event_names': dict(Counter(names).most_common(20))}


def audit(data, plan=None):
    scenarios = scenarios_from(data)
    oracles = plan.get('oracles', []) if isinstance(plan, dict) else []
    oracle_ids = [x['oracle_id'] for x in oracles if isinstance(x, dict) and isinstance(x.get('oracle_id'), str)]
    analyzed = [classify(events, oracle_ids) for events in scenarios]
    by_kind = Counter(x.get('kind', 'unknown') for x in oracles if x.get('oracle_id') in
                      {oid for s in analyzed for oid in s['oracle_ids']})
    return {'schema_version': 1, 'basis': 'Provengo sample model events; no HTTP execution',
            'sampled_scenarios': len(scenarios), 'sampled_events': sum(s['events'] for s in analyzed),
            'scenarios_with_prefix_event': sum(s['prefix_events'] > 0 for s in analyzed),
            'scenarios_with_ready_event': sum(s['concurrency_ready_events'] > 0 for s in analyzed),
            'scenarios_with_complete_epoch_markers': sum(s['has_complete_epoch_markers'] for s in analyzed),
            'planned_oracles': len(oracles), 'sampled_oracle_ids': sorted({oid for s in analyzed for oid in s['oracle_ids']}),
            'sampled_oracle_kinds': dict(sorted(by_kind.items())),
            'missing_oracle_ids': sorted(set(oracle_ids) - {oid for s in analyzed for oid in s['oracle_ids']}),
            'actual_http_overlap': 'NOT_MEASURED', 'oracle_verdicts': 'NOT_EVALUATED',
            'model_coverage': 'OBSERVED' if scenarios else 'EMPTY', 'scenarios': analyzed}


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--project', type=Path, required=True, help='existing generated Provengo project')
    p.add_argument('--plan', type=Path, help='optional generated concurrency-plan.*.json')
    p.add_argument('--out', type=Path, required=True, help='fresh evidence directory')
    p.add_argument('--size', type=int, default=1000)
    p.add_argument('--max-depth', type=int, default=2000)
    p.add_argument('--not-growing-threshold', type=int, default=500)
    p.add_argument('--timeout-seconds', type=int, default=900)
    p.add_argument('--batch-size', type=int, default=50,
                   help='start a fresh Provengo JVM for each batch; default 50')
    p.add_argument('--java-heap-mb', type=int, default=4096,
                   help='heap requested through JAVA_TOOL_OPTIONS, default 4096 MB')
    p.add_argument('--analyze-only', type=Path, help='parse a prior samples.json without invoking Provengo')
    p.add_argument('--ensemble-size', type=int, default=0, help='run Provengo ensemble using bundled research ranking')
    p.add_argument('--ensemble-iterations', type=int, default=1000)
    args = p.parse_args(argv)
    if args.out.exists():
        p.error('output directory already exists; choose a fresh directory')
    if min(args.size, args.max_depth, args.timeout_seconds,
           args.not_growing_threshold, args.batch_size, args.java_heap_mb) < 1:
        p.error('size, max depth, threshold and timeout must be positive')
    if args.ensemble_size < 0 or args.ensemble_iterations < 1:
        p.error('ensemble size must be nonnegative and iterations positive')
    if args.ensemble_size and args.analyze_only:
        p.error('ensemble requires the original project, not --analyze-only')
    if args.plan and not args.plan.is_file():
        p.error('plan not found')
    if not args.analyze_only and not (args.project/'config/provengo.yml').is_file():
        p.error('not a Provengo project (config/provengo.yml missing)')
    exe = shutil.which('provengo') if not args.analyze_only else None
    if not args.analyze_only and not exe:
        p.error('provengo executable not on PATH')
    args.out.mkdir(parents=True)
    source = args.analyze_only or args.out/'samples.json'
    metadata = {'commands': [], 'project': str(args.project.resolve()), 'size_requested': args.size,
                'max_depth': args.max_depth, 'batch_size': args.batch_size,
                'java_heap_mb': args.java_heap_mb,
                'plan_sha256': hashlib.sha256(args.plan.read_bytes()).hexdigest() if args.plan else None}
    if not args.analyze_only:
        # Credentials are unnecessary for model sampling and never passed down.
        child_env = {k: v for k, v in os.environ.items()
                     if not re.search(r'PASSWORD|TOKEN|SECRET|API_KEY|CREDENTIAL', k, re.I)}
        existing_options = child_env.get('JAVA_TOOL_OPTIONS', '')
        child_env['JAVA_TOOL_OPTIONS'] = (existing_options+' -Xmx'+str(args.java_heap_mb)+'m').strip()
        remaining = args.size
        batch = 0
        batch_paths = []
        while remaining:
            requested = min(remaining, args.batch_size)
            batch_path = args.out/f'sample-batch-{batch+1:03}.json'
            command = [exe, '--batch-mode', 'sample']
            command.append('--overwrite')
            command += ['--size', str(requested), '--not-growing-threshold',
                        str(args.not_growing_threshold), '-m', str(args.max_depth),
                        '-o', str(batch_path.resolve()), str(args.project.resolve())]
            metadata['commands'].append(command)
            metadata['batch_attempted'] = batch + 1
            (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
            with (args.out/f'provengo-sample-batch-{batch+1:03}.log').open('w', encoding='utf-8') as log:
                try:
                    result = subprocess.run(command, stdout=log, stderr=subprocess.STDOUT,
                                            timeout=args.timeout_seconds, env=child_env)
                except subprocess.TimeoutExpired:
                    metadata['status'] = 'SAMPLE_BATCH_TIMEOUT'
                    (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
                    return 2
            metadata['last_sample_exit_code'] = result.returncode
            if result.returncode != 0:
                metadata['status'] = 'SAMPLE_BATCH_FAILED'
                (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
                return 2
            if not batch_path.is_file():
                metadata['status'] = 'SAMPLE_BATCH_FILE_MISSING'
                (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
                return 2
            try:
                # Detect incompatible Provengo formats after batch one, before
                # spending time and memory on the rest of the requested sample.
                observed = len(scenarios_from(json.loads(batch_path.read_text(encoding='utf-8'))))
            except (ValueError, TypeError) as exc:
                metadata['status'] = 'UNKNOWN_SAMPLE_FORMAT'
                metadata['parser_error'] = str(exc)
                (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
                return 2
            if observed != requested:
                metadata['status'] = 'SAMPLE_BATCH_COUNT_MISMATCH'
                metadata['batch_requested'] = requested
                metadata['batch_observed'] = observed
                (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
                return 2
            batch_paths.append(batch_path)
            remaining -= requested
            batch += 1
        metadata['successful_batches'] = batch
        try:
            metadata['merged_batch_counts'] = merge_batches(batch_paths, source, args.size)
        except (ValueError, TypeError) as exc:
            metadata['status'] = 'SAMPLE_MERGE_FAILED'
            metadata['merge_error'] = str(exc)
            (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
            return 2
        metadata['merged_scenarios'] = sum(metadata['merged_batch_counts'])
    if not source.is_file():
        metadata['status'] = 'SAMPLE_FILE_MISSING'
        (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
        return 2
    metadata['sample_sha256'] = hashlib.sha256(source.read_bytes()).hexdigest()
    try:
        report = audit(json.loads(source.read_text(encoding='utf-8')),
                       json.loads(args.plan.read_text(encoding='utf-8')) if args.plan else None)
    except (ValueError, KeyError, TypeError) as exc:
        metadata['status'] = 'UNKNOWN_SAMPLE_FORMAT'
        metadata['parser_error'] = str(exc)
        (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
        print('SAMPLE_FORMAT_UNRECOGNIZED; raw samples preserved:', source, file=sys.stderr)
        return 2
    metadata['status'] = 'AUDITED'
    (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    (args.out/'sample-audit.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    if args.ensemble_size:
        meta = args.project/'meta-spec'
        meta.mkdir(exist_ok=True)
        ranking_path = meta/'zz-sbt-research-ranking.js'
        if ranking_path.exists():
            metadata['status'] = 'RANKING_FILE_ALREADY_EXISTS'
            (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
            return 2
        ranking_source = Path(__file__).with_name('sbt-research-ranking.js')
        shutil.copy2(ranking_source, args.out/'sbt-research-ranking.js')
        shutil.copy2(ranking_source, ranking_path)
        ensemble_path = args.out/'ensemble.json'
        cmd = [exe, '--batch-mode', 'ensemble', '--algorithm', 'genetic',
               '--size', str(args.ensemble_size), '--iterations', str(args.ensemble_iterations),
               '--ranking-function', 'sbtResearchRanking', '--run-source', str(source.resolve()),
               '--output-file', str(ensemble_path.resolve()), str(args.project.resolve())]
        metadata['ensemble_command'] = cmd
        try:
            with (args.out/'provengo-ensemble.log').open('w', encoding='utf-8') as log:
                try:
                    run = subprocess.run(cmd, stdout=log, stderr=subprocess.STDOUT,
                                         timeout=args.timeout_seconds, env=child_env)
                    metadata['ensemble_exit_code'] = run.returncode
                except subprocess.TimeoutExpired:
                    metadata['ensemble_status'] = 'TIMEOUT'
        finally:
            ranking_path.unlink(missing_ok=True)
        if metadata.get('ensemble_exit_code') != 0 or not ensemble_path.is_file():
            metadata['status'] = 'ENSEMBLE_FAILED'
            (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
            return 2
        try:
            selection = audit(json.loads(ensemble_path.read_text(encoding='utf-8')),
                              json.loads(args.plan.read_text(encoding='utf-8')) if args.plan else None)
        except (ValueError, KeyError, TypeError) as exc:
            metadata['status'] = 'UNKNOWN_ENSEMBLE_FORMAT'
            metadata['parser_error'] = str(exc)
            (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n')
            return 2
        (args.out/'ensemble-audit.json').write_text(json.dumps(selection, indent=2) + '\n', encoding='utf-8')
        metadata['ensemble_sha256'] = hashlib.sha256(ensemble_path.read_bytes()).hexdigest()
        print('PROVENGO_ENSEMBLE_AUDIT scenarios=', selection['sampled_scenarios'],
              'families=', selection['sampled_oracle_kinds'])
    (args.out/'invocation.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    print('PROVENGO_SAMPLE_AUDIT scenarios={sampled_scenarios} prefix={scenarios_with_prefix_event} '
          'ready={scenarios_with_ready_event} epoch={scenarios_with_complete_epoch_markers} '
          'oracles={hit}/{total} http_overlap=NOT_MEASURED'.format(
              **report, hit=len(report['sampled_oracle_ids']), total=report['planned_oracles']))
    print('SAMPLE_AUDIT_REPORT', args.out/'sample-audit.json')
    return 0


if __name__ == '__main__':
    sys.exit(main())
