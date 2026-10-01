"""Stage 6: independently verified long-prefix and overlapping merge-upstream probes.

Uses only the research user's Gitea token and Python's standard library.
No analyst-authored result is interpreted as a product defect without HTTP evidence.
"""
import argparse
import base64
import concurrent.futures
import datetime as dt
import hashlib
import json
import os
import pathlib
import platform
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


class Client:
    def __init__(self, base, token):
        self.base = base.rstrip('/')
        self.token = token
        self.events = []
        self.lock = threading.Lock()

    def call(self, method, path, body=None, label=''):
        url = self.base + path
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method, headers={
            'Authorization': 'token ' + self.token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        })
        start = time.monotonic_ns()
        at = now()
        try:
            with urllib.request.urlopen(req, timeout=45) as res:
                status, raw = res.status, res.read(262144)
        except urllib.error.HTTPError as ex:
            status, raw = ex.code, ex.read(262144)
        except Exception as ex:
            status, raw = 0, str(ex).encode()
        end = time.monotonic_ns()
        try:
            response = json.loads(raw)
        except (ValueError, UnicodeDecodeError):
            response = raw.decode('utf-8', errors='replace')
        event = {'at_utc': at, 'label': label, 'method': method, 'path': path,
                 'request': body, 'status': status, 'response': response,
                 'start_ns': start, 'end_ns': end, 'duration_ms': round((end-start)/1e6, 3)}
        with self.lock:
            self.events.append(event)
        return event


def require(event, statuses, name):
    if event['status'] not in statuses:
        raise RuntimeError('%s: HTTP %s' % (name, event['status']))
    return event['response']


def resource(owner, repo):
    return '/repos/%s/%s' % (urllib.parse.quote(owner, safe=''), urllib.parse.quote(repo, safe=''))


def head(client, owner, repo, branch):
    response = require(client.call('GET', resource(owner, repo) + '/branches/' + urllib.parse.quote(branch, safe=''), label='observe-head'), [200], 'read branch')
    sha = response.get('commit', {}).get('id')
    if not sha:
        raise RuntimeError('branch SHA absent')
    return sha


def repository(client, owner, repo):
    path = resource(owner, repo)
    for _ in range(60):
        event = client.call('GET', path, label='verify-repository')
        if event['status'] == 200:
            return event['response']
        time.sleep(.5)
    raise RuntimeError('repository not readable: HTTP %s' % event['status'])


def commit(client, owner, repo, branch, trial, number):
    path = resource(owner, repo) + '/contents/' + 's6_%02d_%03d.txt' % (trial, number)
    body = {'branch': branch, 'content': base64.b64encode(('trial=%d step=%d\n' % (trial, number)).encode()).decode(),
            'message': 'Stage 6 upstream step %d' % number}
    require(client.call('POST', path, body, 'advance-upstream'), [200, 201], 'advance upstream')
    return head(client, owner, repo, branch)


def run_trial(client, owner, trial, prefix):
    suffix = uuid.uuid4().hex[:10]
    upstream, org, fork = ('s6-up-%s' % suffix, 's6-org-%s' % suffix, 's6-fork-%s' % suffix)
    result = {'trial': trial, 'upstream': owner + '/' + upstream, 'fork': org + '/' + fork,
              'prefix_requested': prefix, 'prefix_completed': 0, 'preconditions_verified': False,
              'verdict': 'INCONCLUSIVE', 'reason': 'setup incomplete'}
    try:
        require(client.call('POST', '/user/repos', {'name': upstream, 'auto_init': True,
                 'default_branch': 'main', 'description': 'Stage 6 isolated research fixture'}, 'create-upstream'),
                [201, 202], 'create upstream')
        repo = repository(client, owner, upstream)
        branch = repo.get('default_branch') or 'main'
        result['branch'] = branch
        require(client.call('POST', '/orgs', {'username': org, 'full_name': 'Stage 6 research fixture',
                 'visibility': 'private'}, 'create-organization'), [201, 202], 'create organization')
        require(client.call('POST', resource(owner, upstream) + '/forks',
                 {'organization': org, 'name': fork}, 'create-fork'), [201, 202], 'create fork')
        fork_info = repository(client, org, fork)
        if fork_info.get('fork') is not True or (fork_info.get('parent') or {}).get('full_name', '').lower() != (owner+'/'+upstream).lower():
            raise RuntimeError('fork identity not verified')
        current = head(client, org, fork, branch)
        for step in range(1, prefix + 1):
            upstream_sha = commit(client, owner, upstream, branch, trial, step)
            if upstream_sha == current:
                raise RuntimeError('prefix divergence absent at step %d' % step)
            merged = client.call('POST', resource(org, fork) + '/merge-upstream',
                                 {'branch': branch, 'ff_only': True}, 'prefix-merge')
            current = head(client, org, fork, branch)
            if merged['status'] != 200 or current != upstream_sha:
                result.update(reason='prefix step %d: HTTP %d, head matches=%s' %
                              (step, merged['status'], current == upstream_sha),
                              verdict='PREFIX_CANDIDATE' if merged['status'] == 500 or merged['status'] == 200 else 'INCONCLUSIVE')
                return result
            result['prefix_completed'] = step
        target = commit(client, owner, upstream, branch, trial, prefix + 1)
        before = head(client, org, fork, branch)
        if target == before:
            raise RuntimeError('concurrency divergence absent')
        result.update(preconditions_verified=True, upstream_sha=target, fork_before_sha=before)
        gate = threading.Event()
        def one():
            gate.wait(timeout=10)
            return client.call('POST', resource(org, fork) + '/merge-upstream',
                               {'branch': branch, 'ff_only': True}, 'concurrent-merge')
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            futures = [pool.submit(one) for _ in range(2)]
            gate.set()
            attempts = [f.result(timeout=60) for f in futures]
        after = head(client, org, fork, branch)
        overlap_ns = min(e['end_ns'] for e in attempts) - max(e['start_ns'] for e in attempts)
        result.update(fork_after_sha=after, statuses=[e['status'] for e in attempts],
                      overlap_ms=round(max(0, overlap_ns)/1e6, 3), overlapping=(overlap_ns > 0))
        if after != target:
            result.update(verdict='STATE_CANDIDATE', reason='fork head did not reach observed upstream head')
        elif overlap_ns <= 0:
            result.update(verdict='INCONCLUSIVE', reason='request intervals did not overlap')
        elif any(e['status'] >= 500 for e in attempts):
            result.update(verdict='SERVER_FAILURE_CANDIDATE', reason='5xx during overlapping valid fork requests')
        elif (any(e['status'] == 200 for e in attempts) and
              any(e['status'] == 400 and isinstance(e['response'], dict) and
                  'branch has diverged' in str(e['response'].get('message', '')).lower()
                  for e in attempts)):
            result.update(verdict='CONCURRENT_DIVERGENCE_REJECTION_CANDIDATE',
                          reason='overlapping requests: one fast-forward succeeded; another claimed divergence; final head matches upstream; reproduce and inspect internal merge preconditions')
        elif any(e['status'] == 200 for e in attempts) and all(e['status'] in (200, 409, 422) for e in attempts):
            result.update(verdict='PASS', reason='fork reached upstream; responses compatible with concurrent update')
        else:
            result.update(verdict='INCONCLUSIVE', reason='unexpected concurrent response combination')
    except Exception as ex:
        result.update(verdict='INCONCLUSIVE', reason=str(ex))
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default='http://127.0.0.1:3477/api/v1')
    parser.add_argument('--trials', type=int, default=3)
    parser.add_argument('--prefix', type=int, default=12)
    parser.add_argument('--out', required=True)
    args = parser.parse_args()
    if not (1 <= args.trials <= 30 and 1 <= args.prefix <= 100):
        parser.error('trials 1..30; prefix 1..100')
    token = os.environ.get('GITEA_API_TOKEN')
    if not token:
        parser.error('GITEA_API_TOKEN is required')
    output = pathlib.Path(args.out)
    output.mkdir(parents=True, exist_ok=False)
    client = Client(args.base, token)
    identity = require(client.call('GET', '/user', label='authenticated-user'), [200], 'authenticate')
    owner = identity.get('login')
    if not owner:
        raise RuntimeError('authenticated username absent')
    results = [run_trial(client, owner, i, args.prefix) for i in range(1, args.trials+1)]
    summary = {'stage': 'Gitea Stage 6 long-prefix/concurrent-merge pilot', 'created_utc': now(),
               'user': owner, 'base_url': args.base, 'prefix': args.prefix,
               'results': results, 'counts': {v: sum(r['verdict'] == v for r in results)
                                             for v in sorted(set(r['verdict'] for r in results))},
               'claim_boundary': 'CANDIDATE is not a confirmed product defect; inspect trace and independently reproduce.',
               'stage5_2_baseline': '10/10 valid fork merges passed; non-fork HTTP 500 is a robustness control.'}
    metadata = {'runner_version': 'stage6-pilot-2', 'created_utc': now(),
                'python_version': platform.python_version(), 'trials': args.trials,
                'prefix_length': args.prefix, 'base_url': args.base,
                'runner_sha256': hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),
                'assessment': 'sequence-local external HTTP observations; no analyst scenario claim'}
    for name, value in [('http-trace.json', client.events), ('summary.json', summary),
                        ('run-metadata.json', metadata)]:
        (output/name).write_text(json.dumps(value, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    checksums = {name: hashlib.sha256((output/name).read_bytes()).hexdigest()
                 for name in ('http-trace.json', 'summary.json', 'run-metadata.json')}
    (output/'sha256.json').write_text(json.dumps(checksums, indent=2)+'\n', encoding='utf-8')
    print('STAGE6_COMPLETE ' + str(output/'summary.json'))


if __name__ == '__main__':
    main()
