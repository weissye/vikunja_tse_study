"""Offline selection; never dispatches requests or assumes authorization."""
from collections import Counter
from derive_v012 import build, response_fields
from generator_v56.transfer_prefix_v012 import compile_prefix

def select(catalog, protocol):
    derived = build(catalog)
    ops = {o['key']: o for o in catalog['operations']}
    schemas = {s['schema']: s for s in catalog['resource_schema_catalog']}
    counts = Counter(r['resource'] for r in derived['resources'])
    rulemap = {(r['resource'], r['kind']): r for r in derived['rules']}
    unresolved = {r['operation']: r['reason'] for r in derived['unresolved']}
    resources = {}
    blocked = {}
    for r in derived['resources']:
        name = r['resource']
        reasons = []
        if counts[name] != 1:
            reasons.append('RESOURCE_ALIAS_COLLISION')
        update = rulemap.get((name, 'UPDATE_READBACK'))
        if not update:
            reasons.append('AMBIGUOUS_OR_MISSING_UPDATE')
        for key in [r['create'], r['read']] + ([update['operations'][1]] if update else []):
            op = ops[key]
            for param in [p for p in op['parameters'] if p.get('in') == 'path']:
                if key != r['create'] and param.get('type', param.get('schema', {}).get('type')) != r['identity']['type']:
                    reasons.append('PATH_IDENTITY_TYPE_MISMATCH: ' + key)
            if any(p.get('required') and p.get('in') not in ('body', 'path') for p in op['parameters']):
                reasons.append('REQUIRED_NON_PATH_PARAMETER_UNBOUND: ' + key)
            if key != r['read']:
                if len(op['request_schemas']) != 1:
                    reasons.append('AMBIGUOUS_OR_MISSING_BODY: ' + key)
                if any(f.get('media_type') not in (None, 'application/json') for f in op['request_fields']):
                    reasons.append('UNSUPPORTED_BODY_MEDIA: ' + key)
                if any(f['required'] and f['name'] != r['scalar']['field'] and not f['read_only'] for f in op['request_fields']):
                    reasons.append('REQUIRED_BODY_VALUE_UNBOUND: ' + key)
        if reasons:
            blocked[r['create']] = sorted(set(reasons))
        else:
            resources[name] = r
    relations = [r for r in derived['relationship_candidates'] if r['kind'] == 'CREATE_PARENT_IDENTITY_CANDIDATE']
    # Propagate unresolved dependencies; cycles are checked below.
    changed = True
    while changed:
        changed = False
        for name, resource in list(resources.items()):
            reasons = []
            for rel in [x for x in relations if x['child'] == name]:
                parents = rel['producer_resources']
                if len(parents) != 1 or parents[0] not in resources:
                    reasons.append('UNRESOLVED_PARENT: ' + rel['path_slot'])
                    continue
                field = response_fields(ops[resource['read']], schemas).get(parents[0] + '_id')
                if not field or field['type'] != resources[parents[0]]['identity']['type']:
                    reasons.append('NO_COMPATIBLE_PARENT_READBACK: ' + rel['path_slot'])
            if reasons:
                blocked[resource['create']] = reasons
                del resources[name]
                changed = True
    def closure(name, active=()):
        if name in active:
            raise ValueError('DEPENDENCY_CYCLE')
        result = {name}
        for rel in relations:
            if rel['child'] == name:
                result |= closure(rel['producer_resources'][0], active + (name,))
        return result
    candidates, plans = [], []
    for name, resource in sorted(resources.items()):
        try:
            names = closure(name)
        except ValueError:
            blocked[resource['create']] = ['DEPENDENCY_CYCLE']
            continue
        tiers = ['RESOURCE'] + (['PARENT_CHILD'] if len(names) > 1 else [])
        for tier in tiers:
            candidate = tier + ':' + name
            candidates.append({'key': candidate, 'tier': tier, 'target': name, 'closure': sorted(names), 'status': 'STATIC_ELIGIBLE_RUNTIME_REVIEW_REQUIRED', 'basis': 'DECLARED_POLICY_AND_PATH_SCHEMA_HEURISTICS'})
            subset = {**derived, 'resources': [resources[n] for n in sorted(names)], 'rules': [r for r in derived['rules'] if r['resource'] in names], 'relationship_candidates': [r for r in relations if r['child'] in names]}
            for instances in protocol['instances']:
                for depth in protocol['prefix_update_depths']:
                    graph = compile_prefix(subset, instances, depth, protocol['seeds'], {k: o['pointer'] for k, o in ops.items()})
                    plans.append({'key': candidate + ':i' + str(instances) + ':d' + str(depth), 'candidate': candidate, 'structural_request_estimate': graph['node_count'], 'graph': graph})
    tierorder = {t: i for i, t in enumerate(protocol['tiers'])}
    plans.sort(key=lambda p: (tierorder[p['candidate'].split(':')[0]], p['candidate'], p['graph']['instances_per_resource'], p['graph']['prefix_update_rounds']))
    queue = [{'trial': i + 1, 'seed': seed, 'plan': p['key'], 'structural_request_estimate': p['structural_request_estimate']} for i, (seed, p) in enumerate((seed, p) for seed in protocol['seeds'] for p in plans)]
    selectedops = {n['operation'] for p in plans for n in p['graph']['nodes']}
    inventory = []
    for key, op in sorted(ops.items()):
        creation = op['method'] in ('POST', 'PUT') and not op['path'].endswith('}') and any(r['code'] == '201' for r in op['success_responses'])
        reason = blocked.get(key)
        if key in selectedops:
            status, reasons = 'SELECTED_STATIC', ['MEMBER_OF_ELIGIBLE_PLAN']
        elif creation:
            status, reasons = 'BLOCKED', reason or [unresolved.get(key, 'UNSUPPORTED_RESOURCE_OR_RELATION_PATTERN')]
        else:
            status, reasons = 'EXCLUDED_FROM_CURRENT_PLAN_POLICY', ['NOT_REQUIRED_BY_ELIGIBLE_CREATE_READ_UPDATE_PLAN']
        account = any(t in op['path'].lower().split('/') for t in ('users', 'user', 'login', 'register', 'tokens', 'teams', 'members', 'shares'))
        inventory.append({'operation': key, 'pointer': op['pointer'], 'status': status, 'reasons': reasons, 'declared_security': op['security'], 'account_or_access_path_candidate': account, 'authorization_verified': False})
    return {'version': 'v012', 'contract_sha256': catalog['contract_sha256'], 'operation_inventory': inventory, 'candidates': candidates, 'plans': plans, 'trial_queue': queue, 'relationship_inventory': derived['relationship_candidates'], 'account_model': {'execution_actor': 'RESEARCH_OWNER', 'credentials_required_now': False, 'multi_user_scenarios': 'NOT_GENERATED; ROLE_AND_OWNERSHIP_POLICY_INPUT_REQUIRED', 'accounts_and_teams': 'INVENTORIED; AUTHORIZATION_NOT_INFERRED_FROM_PATH_OR_SECURITY_SCHEME', 'owned_resource_scope': 'RUNTIME_PRECONDITION_NOT_STATIC_PROOF'}, 'limitations': ['Root-reference id and title/name policy only', 'Singularization and parent binding are heuristics requiring review', 'Inline response schemas and multiple-reader aliases may be blocked', 'Shared relations and account transitions are inventory only', 'Tier A child closure and Tier B parent-child plans can overlap; no coverage gain is claimed', 'No request bodies, JS, HTTP, native Provengo, cleanup or budget dispatcher generated', 'Request estimates exclude login, additional membership verifiers and cleanup', 'Arms A-D and evaluation budgets remain unimplemented'], 'live_execution': False}
