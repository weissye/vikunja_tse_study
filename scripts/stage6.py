#!/usr/bin/env python3
"""OpenAPI-derived, stateful Gitea experiment. No named fault predicates."""
import argparse
import base64
import concurrent.futures
import copy
import hashlib
import json
import os
import random
import re
import shutil
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

METHODS = ('get', 'post', 'put', 'patch', 'delete')
ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SPEC = ROOT / 'model/gitea/gitea-1.27.3-swagger.json'


def load(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def parameters(item, path_item):
    return path_item.get('parameters', []) + item.get('parameters', [])


def catalog(spec):
    """Infer dependencies from URI templates and documented response schemas."""
    ops = []
    for path, methods in spec['paths'].items():
        if path.startswith('/admin/'):
            continue
        for method, value in methods.items():
            if method not in METHODS or value.get('deprecated'):
                continue
            params = parameters(value, methods)
            body = next((p.get('schema') for p in params if p.get('in') == 'body'), None)
            successes = sorted(int(x) for x in value.get('responses', {}) if x.isdigit() and 200 <= int(x) < 300)
            if not successes:
                continue
            ops.append(dict(id=value.get('operationId', method + path), path=path, method=method.upper(),
                            path_vars=re.findall(r'\{([^}]+)\}', path), body=body,
                            responses=successes, tags=value.get('tags', [])))
    by_path = {}
    for o in ops:
        by_path.setdefault(o['path'], []).append(o)
    families = []
    for path, entries in by_path.items():
        creators = [x for x in entries if x['method'] == 'POST']
        readers = [x for x in entries if x['method'] == 'GET']
        if not creators or not readers or path.count('/') < 2:
            continue
        descendants = [o for o in ops if o['path'].startswith(path.rstrip('/') + '/{')]
        mutations = [o for o in descendants if o['method'] in ('POST', 'PUT', 'PATCH', 'DELETE')]
        related_reads = [o for o in descendants if o['method'] == 'GET']
        # Sibling operations sharing a parent resource and OpenAPI tag can
        # depend on the same state even without a nested URI.
        if not mutations and not related_reads:
            ancestor = path.rsplit('/', 1)[0]
            tags = set(creators[0]['tags'])
            siblings = [o for o in ops if o['path'].rsplit('/', 1)[0] == ancestor
                        and o['path'] != path and tags.intersection(o['tags'])]
            mutations = [o for o in siblings if o['method'] in ('POST', 'PUT', 'PATCH', 'DELETE')]
            related_reads = [o for o in siblings if o['method'] == 'GET']
        if not mutations and not related_reads:
            continue
        # Template depth and path-variable equality are generic signals of state dependence.
        score = len(mutations) * 3 + len(related_reads) * 2 + len(path.split('/'))
        families.append(dict(path=path, create=creators[0]['id'], list=readers[0]['id'],
                             mutations=[x['id'] for x in mutations], reads=[x['id'] for x in related_reads],
                             score=score))
    # Record methods on deep, stateful paths even when their create operation is
    # PUT or an account fixture is unavailable. Such paths remain candidates.
    deep_mutations = [dict(path=o['path'], operation_id=o['id'], method=o['method'],
                           path_vars=o['path_vars']) for o in ops
                      if o['method'] in ('POST', 'PUT', 'PATCH', 'DELETE')
                      and len(o['path_vars']) >= 2]
    return {'spec_sha256': hashlib.sha256(json.dumps(spec, sort_keys=True).encode()).hexdigest(),
            'operations': ops, 'families': sorted(families, key=lambda x: (-x['score'], x['path'])),
            'stateful_mutations': deep_mutations}


def runnable_families(cat):
    """Use the verified account and created repository as the initial bindings."""
    result = []
    for family in cat['families']:
        names = set(re.findall(r'\{([^}]+)\}', family['path']))
        if names == {'owner', 'repo'} and family['mutations']:
            result.append(family)
    return result


def deref(schema, spec):
    for _ in range(5):
        if not isinstance(schema, dict) or '$ref' not in schema:
            break
        schema = spec.get('definitions', {}).get(schema['$ref'].rsplit('/', 1)[-1], {})
    return schema or {}


def generated(schema, spec, rng, prefix, depth=0):
    schema = deref(schema, spec)
    if depth > 4:
        return None
    if 'enum' in schema:
        return rng.choice(schema['enum'])
    kind = schema.get('type', 'object')
    if kind == 'object':
        required = set(schema.get('required', []))
        result = {}
        for key, prop in schema.get('properties', {}).items():
            if key in required or (rng.random() < .22 and not prop.get('readOnly')):
                result[key] = generated(prop, spec, rng, prefix + '-' + key, depth + 1)
        return result
    if kind == 'array':
        return [generated(schema.get('items', {}), spec, rng, prefix, depth + 1)] if schema.get('minItems') else []
    if kind == 'boolean':
        return False
    if kind in ('integer', 'number'):
        return max(1, schema.get('minimum', 1))
    if schema.get('format') == 'email':
        return prefix[:30] + '@example.test'
    if schema.get('format') == 'date-time':
        return '2030-01-01T00:00:00Z'
    if schema.get('format') == 'byte':
        return base64.b64encode(prefix.encode()).decode()
    return prefix[:40]


class Client:
    def __init__(self, base, token, timeout=15):
        self.base, self.token, self.timeout = base.rstrip('/'), token, timeout

    def call(self, method, path, body=None):
        url = self.base + path
        data = json.dumps(body).encode() if body is not None else None
        headers = {'Authorization': 'token ' + self.token, 'Accept': 'application/json'}
        if data is not None:
            headers['Content-Type'] = 'application/json'
        request = urllib.request.Request(url, data=data, method=method, headers=headers)
        start = time.time_ns()
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                code, raw = response.status, response.read(131072)
        except urllib.error.HTTPError as exc:
            code, raw = exc.code, exc.read(131072)
        except Exception as exc:
            return dict(method=method, path=path, status=None, error=str(exc), start_ns=start, end_ns=time.time_ns())
        try:
            parsed = json.loads(raw)
        except (ValueError, UnicodeError):
            parsed = raw.decode('utf-8', 'replace')[:2048]
        return dict(method=method, path=path, status=code, body=parsed,
                    start_ns=start, end_ns=time.time_ns())


def bindings(body, bag):
    """Map OpenAPI parameter names to observed response keys, never to a static domain dictionary."""
    out = {}
    for key in bag:
        if key.startswith('_'):
            continue
        out[key] = bag[key]
    for field in ('name', 'username', 'owner', 'repo', 'index', 'id', 'number', 'sha'):
        if isinstance(body, dict) and field in body:
            out[field] = body[field]
    return out


def resolve(op, state, spec, rng, unique):
    vals = {}
    for key in op['path_vars']:
        if key in state:
            vals[key] = str(state[key])
        elif key == 'repo' and 'name' in state:
            vals[key] = str(state['name'])
        elif key == 'owner' and 'username' in state:
            vals[key] = str(state['username'])
        elif key == 'index' and 'number' in state:
            vals[key] = str(state['number'])
        else:
            return None
    path = op['path']
    for key, val in vals.items():
        path = path.replace('{' + key + '}', urllib.parse.quote(val, safe=''))
    body = generated(op['body'], spec, rng, unique) if op['body'] else None
    if isinstance(body, dict):
        for k in body:
            if k in state and k not in ('name', 'title'):
                body[k] = state[k]
    return path, body


def emit_provengo(cat, target, length):
    """Provengo selects a family and a serialized or concurrent schedule at runtime."""
    families = runnable_families(cat)
    choices = [dict(path=x['path'], create=x['create'], mutations=x['mutations'][:8]) for x in families]
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text('''// Generated exclusively from OpenAPI dependency analysis.
var stage6Families = ''' + json.dumps(choices) + ''';
bthread("stage6:derive-schedule", function () {
  var options = stage6Families.map(function(f, i) { return Event("S6:Family:" + i); });
  var familyEvent = sync({ request: options });
  var family = stage6Families[Number(familyEvent.name.split(":").pop())];
  var schedule = sync({ request: [Event("S6:Serial"), Event("S6:Concurrent")] });
  var operations = [];
  for (var i = 0; i < ''' + str(length) + '''; i++) {
    if (family.mutations.length === 0) break;
    var actions = family.mutations.map(function(op, j) { return Event("S6:Action:" + j); });
    var action = sync({ request: actions });
    operations.push(family.mutations[Number(action.name.split(":").pop())]);
  }
  bp.log.info("STAGE6_PLAN:" + JSON.stringify({ family:family.path, parallel:schedule.name === "S6:Concurrent", operations:operations }));
});
''', encoding='utf-8')


def provengo_plan(project, seed, executable='provengo'):
    resolved = shutil.which(executable)
    if not resolved and Path(executable).is_file():
        resolved = str(Path(executable).resolve())
    if not resolved:
        raise RuntimeError('Provengo executable was not found: ' + executable +
                           '. Run Get-Command provengo -All in PowerShell, or pass --provengo '
                           '"C:\\path\\to\\provengo.cmd". For a Python-only diagnostic use --engine python.')
    proc = subprocess.run([resolved, 'run', '--random-seed', str(seed), str(project)],
                          capture_output=True, text=True, timeout=90)
    output = proc.stdout + '\n' + proc.stderr
    plans = re.findall(r'STAGE6_PLAN:(\{[^\r\n]+\})', output)
    if proc.returncode != 0 or not plans:
        raise RuntimeError('Provengo did not produce a schedule; exit=' + str(proc.returncode) +
                           '; last output: ' + output[-1200:])
    return json.loads(plans[-1])


def trial(cat, spec, client, seed, length, parallel, outdir, family=None, operations=None):
    rng = random.Random(seed)
    available = runnable_families(cat)
    group = next((x for x in available if x['path'] == family), None) if family else rng.choice(available)
    if group is None:
        raise ValueError('Unknown family: ' + str(family))
    ops = {x['id']: x for x in cat['operations']}
    uid = 's6-' + uuid.uuid4().hex[:12]
    events, candidates, state = [], [], {}
    executed, successful_mutations, valid_observation_pairs = 0, 0, 0

    def finish(status, reason=None):
        result = dict(seed=seed, family=group['path'], status=status, reason=reason,
                      unique=uid, parallel=parallel, events=events, candidates=candidates,
                      actions_executed=executed, successful_mutations=successful_mutations,
                      valid_observation_pairs=valid_observation_pairs)
        outdir.mkdir(parents=True, exist_ok=True)
        (outdir / ('trial-' + str(seed) + '.json')).write_text(json.dumps(result, indent=2), encoding='utf-8')
        return result

    def call(op, state):
        resolved = resolve(op, state, spec, rng, uid)
        if resolved is None:
            return None
        path, body = resolved
        response = client.call(op['method'], path, body)
        response.update(operation_id=op['id'], documented_success=response['status'] in op['responses'], request_body=body)
        events.append(response)
        return response

    identity = client.call('GET', '/user')
    events.append(identity)
    if identity['status'] != 200 or not isinstance(identity.get('body'), dict):
        return finish('BLOCKED_AUTH', 'GET /user did not return an authenticated identity')
    state.update(bindings(identity['body'], state))
    # Generate the ancestor resource when the chosen path requires owner/repo.
    if '{owner}' in group['path'] and '{repo}' in group['path']:
        parent = next((x for x in cat['operations'] if x['path'] == '/user/repos' and x['method'] == 'POST'), None)
        if parent is None:
            return finish('BLOCKED_ANCESTOR', 'No documented ancestor creation operation')
        created = call(parent, state)
        if not created or not created['documented_success'] or not isinstance(created.get('body'), dict):
            return finish('BLOCKED_ANCESTOR', 'Ancestor creation did not return a documented success and identity')
        state.update(bindings(created['body'], state))
        state['repo'] = created['body'].get('name')
        state['owner'] = (created['body'].get('owner') or {}).get('login', state.get('username'))
    creator = ops[group['create']]
    made = call(creator, state)
    if not made or not made['documented_success']:
        return finish('BLOCKED_CREATE', 'Family creation did not return a documented success')
    state.update(bindings(made.get('body'), state))
    candidates_ops = [ops[x] for x in group['mutations'] if x in ops]
    readable = [ops[x] for x in group['reads'] if x in ops]
    for step in range(length):
        usable = [x for x in candidates_ops if resolve(x, state, spec, rng, uid) is not None]
        if not usable:
            break
        planned = operations[step] if operations and step < len(operations) else None
        action = next((x for x in usable if x['id'] == planned), None) if planned else rng.choice(usable)
        if action is None:
            continue
        probes = [r for r in readable if resolve(r, state, spec, rng, uid) is not None]
        probe = rng.choice(probes) if probes else ops[group['list']]
        before = call(probe, state)
        if parallel and step % 3 == 2:
            resolved = resolve(action, state, spec, rng, uid)
            if resolved is None:
                continue
            path, body = resolved
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
                futures = [pool.submit(client.call, action['method'], path, copy.deepcopy(body)) for _ in range(2)]
                pair = [f.result() for f in futures]
            for response in pair:
                response.update(operation_id=action['id'], documented_success=response['status'] in action['responses'], request_body=body)
                events.append(response)
            overlap = max(x['start_ns'] for x in pair) < min(x['end_ns'] for x in pair)
            acted = pair[-1]
        else:
            acted = call(action, state)
            pair, overlap = [acted], False
        after = call(probe, state)
        executed += 1
        successful_mutations += sum(bool(x and x['documented_success']) for x in pair)
        if before and after and before['documented_success'] and after['documented_success']:
            valid_observation_pairs += 1
        if acted and acted['documented_success']:
            state.update(bindings(acted.get('body'), state))
        # Observations are candidates; no write->read change is presumed mandatory.
        valid_prefix = bool(before and before['documented_success'] and made['documented_success'])
        for x in pair:
            if x and x['status'] is not None and x['status'] >= 500 and valid_prefix:
                candidates.append(dict(kind='5xx', step=step, operation_id=action['id'], status=x['status'],
                                       before=before['status'], after=after['status'] if after else None,
                                       concurrent=parallel and step % 3 == 2, overlap=overlap))
        if pair[0] and after and valid_prefix and pair[0]['documented_success'] and after['documented_success']:
            if isinstance(before.get('body'), dict) and isinstance(after.get('body'), dict):
                # Stable identity fields must survive a successful non-delete modification.
                if action['method'] != 'DELETE':
                    changed = [k for k in ('id', 'full_name', 'number') if k in before['body'] and k in after['body'] and before['body'][k] != after['body'][k]]
                    if changed:
                        candidates.append(dict(kind='identity_change', step=step, operation_id=action['id'], fields=changed, concurrent=parallel and step % 3 == 2, overlap=overlap))
    return finish('COMPLETE' if successful_mutations and valid_observation_pairs else 'NO_VALID_EXERCISE',
                  None if successful_mutations and valid_observation_pairs else 'No successful mutation with valid before/after observations')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('mode', choices=['catalog', 'run', 'replay'])
    p.add_argument('--spec', type=Path, default=DEFAULT_SPEC)
    p.add_argument('--out', type=Path, default=ROOT / 'runs/stage6')
    p.add_argument('--base', default='http://127.0.0.1:3477/api/v1')
    p.add_argument('--seed', type=int, default=1)
    p.add_argument('--seeds', type=int, default=3)
    p.add_argument('--length', type=int, default=20)
    p.add_argument('--parallel', action='store_true')
    p.add_argument('--family')
    p.add_argument('--engine', choices=['provengo', 'python'], default='provengo')
    p.add_argument('--provengo', default='provengo', help='Full path to Provengo executable when it is not in PATH')
    a = p.parse_args()
    spec = load(a.spec)
    cat = catalog(spec)
    if not runnable_families(cat):
        p.error('No OpenAPI dependency families can be bootstrapped from the research account')
    a.out.mkdir(parents=True, exist_ok=True)
    (a.out / 'catalog.json').write_text(json.dumps(cat, indent=2), encoding='utf-8')
    project = ROOT / 'stage6_provengo_project'
    emit_provengo(cat, project / 'spec/js/stage6.generated.js', a.length)
    if a.mode == 'catalog':
        print(json.dumps(dict(operations=len(cat['operations']), families=len(cat['families']),
                              runnable_families=len(runnable_families(cat)),
                              top=[x['path'] for x in cat['families'][:12]])))
        return
    token = os.getenv('GITEA_API_TOKEN', '')
    if not token or token.strip() == '<your existing research-user token>':
        p.error('Set GITEA_API_TOKEN to the real research-user token; the angle-bracket example is a placeholder')
    client = Client(a.base, token)
    results = []
    for i in range(a.seeds):
        seed = a.seed + i
        plan = provengo_plan(project, seed, a.provengo) if a.engine == 'provengo' else None
        if plan:
            (a.out / ('provengo-plan-' + str(seed) + '.json')).write_text(json.dumps(plan, indent=2), encoding='utf-8')
        results.append(trial(cat, spec, client, seed, a.length,
                             plan['parallel'] if plan else a.parallel, a.out,
                             a.family or (plan['family'] if plan else None),
                             plan['operations'] if plan else None))
    signatures = {}
    outcomes = {}
    for result in results:
        for event in result['events']:
            if event.get('operation_id'):
                key = (result.get('family'), event['operation_id'])
                outcomes.setdefault(key, {}).setdefault(str(event.get('status')), set()).add(result['seed'])
        for cand in result['candidates']:
            key = (result.get('family'), cand['operation_id'], cand['kind'], cand.get('status'), cand.get('concurrent'))
            signatures.setdefault(key, set()).add(result['seed'])
    confirmed = [dict(family=k[0], operation_id=k[1], kind=k[2], status=k[3], concurrent=k[4], seeds=sorted(v))
                 for k, v in signatures.items() if len(v) >= min(3, a.seeds)]
    # A repeated 5xx is still a candidate if its preconditions or semantic oracle are inconclusive.
    for entry in confirmed:
        entry['classification'] = 'REPRODUCED_CANDIDATE_REQUIRES_VALIDITY_REVIEW' if entry['kind'] == '5xx' else 'REPRODUCED_OBSERVATION_REQUIRES_REVIEW'
    variation = [dict(family=k[0], operation_id=k[1], outcomes={s: sorted(seeds) for s, seeds in v.items()},
                      classification='STATUS_VARIATION_REQUIRES_EQUIVALENT_PRECONDITIONS')
                 for k, v in outcomes.items() if len(v) > 1]
    summary = dict(schema_version=1, scheduler=a.engine, spec_sha256=cat['spec_sha256'], seeds=[x['seed'] for x in results],
                   completed=sum(x['status'] == 'COMPLETE' for x in results),
                   trials=[dict(seed=x['seed'], status=x['status'], family=x['family'],
                                reason=x['reason'], events=len(x['events']),
                                actions_executed=x['actions_executed'], successful_mutations=x['successful_mutations'],
                                valid_observation_pairs=x['valid_observation_pairs']) for x in results],
                   candidate_count=sum(len(x['candidates']) for x in results), repeated=confirmed,
                   outcome_variation=variation,
                   confirmed_bugs=0, note='No automatic promotion to confirmed bug without valid preconditions, independent before/after oracle and replay review.')
    (a.out / 'summary.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
    print(json.dumps({k: summary[k] for k in ('completed', 'trials', 'candidate_count', 'repeated', 'confirmed_bugs')}))


if __name__ == '__main__':
    main()
