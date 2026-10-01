#!/usr/bin/env python3
"""Audit a sampled Keycloak trace before any SUT execution."""
import collections
import json
import re
import sys

from audit_selected_associations_v29 import audit as audit_associations


def main(path):
    with open(path, encoding='utf-8') as source:
        traces = json.load(source)
    if len(traces) != 1:
        raise ValueError('Exactly one sampled trace is required')
    events = traces[0]
    ready = {}
    finished = {}
    races = set()
    verified = set()
    dispatch = 0
    bindings = 0
    parents = 0
    entities = collections.Counter()
    processes = collections.Counter()
    for event in events:
        data = event.get('data') or {}
        name = event.get('name')
        if name == 'SBT:InstanceReady':
            owner = data['owner']
            ready[owner] = data
            entities[data['entity']] += 1
            processes[str(data['process'])] += 1
        elif name == 'SBT:WorkerFinished':
            finished[data['owner']] = data.get('reason')
        elif name == 'SBT:CrudStep' and data.get('stage') == 'race':
            races.add(data['owner'])
        elif name == 'SBT:CrudVerified' and data.get('stage') == 'race':
            verified.add(data['owner'])
        elif name == 'POST' and '/__sbt_race?' in str(data.get('url', '')):
            dispatch += 1
        elif name == 'SBT:BindParent':
            bindings += 1
        elif name == 'SBT:ParentsBound':
            parents += 1
    association = audit_associations(events)
    prefixes = tuple('sbt_' + re.sub(r'[^A-Za-z0-9_]', '_', owner + '_')
                     for owner in ready)
    unknown_references = set()
    for event in events:
        data = event.get('data') or {}
        for value in (data.get('url'), data.get('body')):
            if not isinstance(value, str):
                continue
            for reference in re.findall(r'@\{(sbt_[A-Za-z0-9_]+)\}', value):
                if not reference.startswith(prefixes):
                    unknown_references.add(reference)
    report = {
        'event_count': len(events), 'workers_ready': len(ready),
        'workers_finished_complete': sum(x == 'complete' for x in finished.values()),
        'entity_types': len(entities), 'entity_counts': sorted(entities.values()),
        'process_counts': dict(processes), 'race_owners': len(races),
        'race_verified': len(verified), 'relay_dispatches': dispatch,
        'parent_choices': bindings, 'parent_bindings': parents,
        'associations': association,
        'unproduced_owner_references': sorted(unknown_references)[:20],
    }
    report['result'] = 'PASS_STATIC' if (
        len(ready) == len(finished) == 400 and
        all(reason == 'complete' for reason in finished.values()) and
        len(entities) == 25 and set(entities.values()) == {16} and
        processes == {'1': 200, '2': 200} and
        len(races) == len(verified) == dispatch == 224 and
        association['posts_while_pair_active'] == 0 and not unknown_references
    ) else 'FAIL_STATIC'
    print(json.dumps(report, indent=2))
    return 0 if report['result'] == 'PASS_STATIC' else 1


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1]))
