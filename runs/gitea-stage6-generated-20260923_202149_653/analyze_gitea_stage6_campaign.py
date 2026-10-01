"""Index existing Stage 3 evidence for the Stage 6 generated search campaign.

This script never reclassifies the generated verifier or infers a product bug from
the occurrence of an HTTP status. Counts describe executed, preserved witnesses.
"""
import argparse
import csv
import hashlib
import json
import re
from collections import Counter
from pathlib import Path


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def read_jsonl(path):
    if not path.exists():
        return []
    with path.open(encoding='utf-8-sig') as stream:
        return [json.loads(line) for line in stream if line.strip()]


def inspect_run(entry, root):
    if not entry.get('run_directory'):
        return {'seed': entry['seed'], 'evidence_status': 'INCOMPLETE',
                'phase': entry.get('phase'), 'reason': entry.get('error', 'Stage 3 run absent')}, []
    path = Path(entry['run_directory'])
    trace_path = path / 'http-trace.jsonl'
    epoch_path = path / 'concurrent-epochs.jsonl'
    evaluation_path = path / 'generated-verifier-evaluation.json'
    metadata_path = path / 'run-metadata.json'
    result = {'seed': entry['seed'], 'run_directory': str(path),
              'generated_directory': entry['generated_directory'],
              'stage3_exit': entry['stage3_exit'], 'phase': entry['phase']}
    if not all(x.is_file() for x in (trace_path, epoch_path, evaluation_path, metadata_path)):
        result.update(evidence_status='INCOMPLETE', missing_files=[x.name for x in
                      (trace_path, epoch_path, evaluation_path, metadata_path) if not x.is_file()])
        return result, []
    trace = read_jsonl(trace_path)
    epochs = read_jsonl(epoch_path)
    metadata = read_json(metadata_path)
    evaluation = read_json(evaluation_path)
    selected_steps = []
    log_path = path / 'provengo-run.log'
    if log_path.is_file():
        pattern = re.compile(r'Selected: \[SBT:LongStoryStep \{[^\r\n]*?story:"([^"]+)", round:(\d+), total:(\d+)')
        for line in log_path.read_text(encoding='utf-8-sig', errors='replace').splitlines():
            match = pattern.search(line)
            if match:
                selected_steps.append((match.group(1), int(match.group(2)), int(match.group(3))))
    observed_rounds = {}
    for story, round_number, total in selected_steps:
        observed_rounds.setdefault(story, set()).add(round_number)
    first_sequence = {}
    for event in trace:
        epoch_id = event.get('epoch_id')
        if epoch_id and epoch_id not in first_sequence:
            first_sequence[epoch_id] = event.get('trace_sequence')
    records = []
    for epoch in epochs:
        epoch_id = epoch.get('epoch_id')
        records.append({'seed': entry['seed'], 'epoch_id': epoch_id,
                        'scenario': epoch.get('scenario'), 'width': epoch.get('width'),
                        'overlap_observed': epoch.get('overlap_observed') is True,
                        # A count of earlier HTTP events, NOT a causal prefix proof.
                        'prior_http_events': first_sequence.get(epoch_id),
                        'release_skew_ns': epoch.get('release_skew_ns')})
    archive = root / 'evidence' / (path.name + '-review.zip')
    result.update(evidence_status='PRESERVED' if archive.is_file() else 'MISSING_ZIP',
                  http_events=len(trace), concurrency_epochs=len(epochs),
                  overlapping_epochs=sum(r['overlap_observed'] for r in records),
                  observed_max_prior_http_events=max((r['prior_http_events'] for r in records
                                                      if isinstance(r['prior_http_events'], int)), default=None),
                  long_story_steps_selected=len(selected_steps),
                  distinct_long_stories_selected=len(observed_rounds),
                  longest_observed_story_rounds=max((len(x) for x in observed_rounds.values()), default=0),
                  evaluator_run_status=evaluation.get('run_status'),
                  verifier_layer_counts=evaluation.get('layer_counts'),
                  provengo_exit_code=metadata.get('provengo_exit_code'),
                  evaluator_exit_code=metadata.get('evaluator_exit_code'),
                  evidence_zip=str(archive) if archive.is_file() else None,
                  evidence_sha256=hashlib.sha256(archive.read_bytes()).hexdigest() if archive.is_file() else None)
    return result, records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', required=True)
    parser.add_argument('--campaign', required=True)
    parser.add_argument('--min-prior-http-events', type=int, default=12)
    args = parser.parse_args()
    root, campaign = Path(args.root), Path(args.campaign)
    index = read_json(campaign / 'stage6-run-index.json')
    runs, epochs = [], []
    for entry in index['runs']:
        result, records = inspect_run(entry, root)
        runs.append(result)
        epochs.extend(records)
    status = 'INCOMPLETE' if len(runs) != index['requested_runs'] or any(
        r['evidence_status'] != 'PRESERVED' for r in runs) else 'COMPLETE'
    overlapping = [e for e in epochs if e['overlap_observed']]
    summary = {
        'schema_version': 1, 'stage': 'Gitea Stage 6 generated exploration',
        'status': status, 'input_basis': 'frozen Gitea OpenAPI and opt-in long-interleaving generator profile',
        'run_count': len(runs), 'total_http_events': sum(r.get('http_events', 0) for r in runs),
        'long_story_steps_selected': sum(r.get('long_story_steps_selected', 0) for r in runs),
        'distinct_long_stories_selected': sum(r.get('distinct_long_stories_selected', 0) for r in runs),
        'longest_observed_story_rounds': max((r.get('longest_observed_story_rounds', 0) for r in runs), default=0),
        'total_epochs': len(epochs), 'observed_overlapping_epochs': len(overlapping),
        'overlapping_epochs_after_prior_http_threshold': sum(
            isinstance(e['prior_http_events'], int) and
            e['prior_http_events'] >= args.min_prior_http_events for e in overlapping),
        'minimum_prior_http_events': args.min_prior_http_events,
        'unique_generated_scenarios': sorted({str(e['scenario']) for e in epochs if e['scenario']}),
        'evaluator_status_counts': dict(Counter(str(r.get('evaluator_run_status')) for r in runs)),
        'runs': runs,
        'interpretation': ('Selected long story steps establish within-story execution order; '
                           'they do not establish that a later concurrency epoch used the same resource. '
                           'Prior HTTP events measure sequence position, not causal dependency. '
                           'An overlap is only a transport fact. Generated verifier results '
                           'and independent semantic confirmation determine product claims. '
                           'The earlier direct-HTTP pilot is separate evidence, not a generated finding.'),
    }
    (campaign / 'stage6-campaign-summary.json').write_text(
        json.dumps(summary, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    with (campaign / 'stage6-epochs.csv').open('w', newline='', encoding='utf-8') as stream:
        writer = csv.DictWriter(stream, fieldnames=['seed', 'epoch_id', 'scenario', 'width',
                                                     'overlap_observed', 'prior_http_events', 'release_skew_ns'])
        writer.writeheader()
        writer.writerows(epochs)
    print('STAGE6_GENERATED_ANALYSIS %s runs=%d epochs=%d overlap=%d' %
          (status, len(runs), len(epochs), len(overlapping)))


if __name__ == '__main__':
    main()
