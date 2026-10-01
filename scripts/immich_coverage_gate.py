"""Classify *observed* concurrency by generated oracle, not by HTTP volume.

No application-specific operation IDs or endpoint names are embedded here.
"""
from collections import Counter
from collections import defaultdict
from datetime import datetime
import json


def classify(plan, epochs, *, excluded=(), proxy_overlap_ids=None):
    ready = {o['oracle_id']: o['operation_id'] for o in plan['oracles']
             if o.get('runtime', {}).get('ready')}
    excluded = set(excluded)
    eligible = {name: op for name, op in ready.items() if op not in excluded}
    observed = [e.get('scenario') for e in epochs
                if e.get('overlap_observed') is True and e.get('scenario') in eligible
                and (proxy_overlap_ids is None or e.get('epoch_id') in proxy_overlap_ids)]
    operations = sorted({eligible[name] for name in observed})
    missing = sorted(set(eligible.values()) - set(operations))
    return {'ready_operations': sorted(set(eligible.values())),
            'excluded_operations': sorted(excluded),
            'observed_operations': operations,
            'missing_operations': missing,
            'overlapping_oracle_ids': sorted(set(observed)),
            'overlap_count': len(observed),
            'overlaps_by_operation': dict(sorted(Counter(eligible[name] for name in observed).items())),
            'new_target_overlap': bool(operations)}


def from_files(plan_path, epochs_path, *, trace_path=None, excluded=()):
    plan = json.loads(plan_path.read_text(encoding='utf-8'))
    epochs = [json.loads(row) for row in epochs_path.read_text(encoding='utf-8').splitlines()
              if row.strip()] if epochs_path.exists() else []
    proxy_overlap_ids = None
    if trace_path is not None:
        proxy_overlap_ids = set()
        grouped = defaultdict(list)
        if trace_path.exists():
            for row in trace_path.read_text(encoding='utf-8').splitlines():
                if row.strip():
                    event = json.loads(row)
                    if event.get('epoch_id') and event.get('method') in ('POST', 'PUT', 'PATCH', 'DELETE'):
                        grouped[event['epoch_id']].append(event)
        for epoch_id, group in grouped.items():
            try:
                starts = [datetime.fromisoformat(e['upstream_started_utc']) for e in group]
                ends = [datetime.fromisoformat(e['upstream_completed_utc']) for e in group]
                if len(group) >= 2 and max(starts) < min(ends):
                    proxy_overlap_ids.add(epoch_id)
            except (KeyError, TypeError, ValueError):
                pass
    return classify(plan, epochs, excluded=excluded, proxy_overlap_ids=proxy_overlap_ids)
