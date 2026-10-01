#!/usr/bin/env node
/**
 * bpjs_direct_shim.js
 *
 * A minimal, synchronous execution engine for the JS this generator
 * produces, used when the real Provengo CLI is not installed (this
 * sandbox has no network access to obtain it -- see FINAL_AUDIT.md for
 * what was actually tried). It is NOT a general BP (Behavioral
 * Programming) engine -- it exploits one specific, always-true property
 * of this generator's output to avoid needing real coroutines:
 *
 *   render/stories_js.py registers bthreads via top-level `bthread(name,
 *   fn)` calls in exactly `dependency_graph.json`'s topological
 *   `creation_order`. So if `bthread(name, fn)` runs `fn()` IMMEDIATELY
 *   and SYNCHRONOUSLY the moment it is registered, every `sync({waitFor:
 *   ...})` inside a dependent entity's bthread will find its prerequisite
 *   entity's "Done: ..." event already published, because that
 *   prerequisite's bthread necessarily executed earlier in file order.
 *
 * API surface matches the REAL, documented Provengo primitives, verified
 * against docs.provengo.tech/ProvengoCli/0.9.5/ (dsls/bp-base.html,
 * dsls/bp-object.html, libraries/REST.html) after an external audit
 * found this shim (and the generator's own output) had been using a
 * non-existent `bp.sync`/`bp.Event`/`bp.EventSet` API. Confirmed real:
 * bare global `sync`, `Event`, `EventSet`, `waitFor`, `block`, `bthread`;
 * `bp.log.*`, `bp.store.*`, `bp.fork()` (NOT `bp.sync` etc. -- those do
 * not exist); REST calls take a `callback` option and deliver the
 * response asynchronously, with `response.body` as a JSON *string* the
 * callback must parse itself; the `parameters` request option IS the
 * query-string mechanism.
 *
 * `svc` (RESTSession) performs REAL, synchronous HTTP calls (via `curl`,
 * so no extra npm dependency is needed) against a REAL running SUT; the
 * `callback` is invoked synchronously right after the response arrives,
 * which is a faithful simulation given this whole engine is
 * single-threaded and ordered.
 *
 * Usage:
 *   node bpjs_direct_shim.js --interfaces PATH --stories PATH \
 *        [--attack PATH] --base-url URL [--budget-ms N]
 *
 * Prints one JSON object to stdout on the last line: a machine-readable
 * summary (http calls made, protocol violations, entities created,
 * attack-probe results, elapsed ms). Everything else goes to stderr.
 */
'use strict';
const vm = require('vm');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { URL } = require('url');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.interfaces || !args.stories || !args['base-url']) {
  console.error('Usage: node bpjs_direct_shim.js --interfaces PATH --stories PATH [--attack PATH] --base-url URL [--budget-ms N]');
  process.exit(2);
}

const BUDGET_MS = args['budget-ms'] ? parseInt(args['budget-ms'], 10) : null;
const START = Date.now();

function remainingMs() {
  if (BUDGET_MS === null) return Infinity;
  return BUDGET_MS - (Date.now() - START);
}

function checkBudget() {
  if (remainingMs() <= 0) {
    throw new BudgetExceeded();
  }
}

class BudgetExceeded extends Error {}

const parsedBase = new URL(args['base-url']);

// ---------------------------------------------------------------- HTTP
let httpCallCount = 0;
let protocolViolations = [];

function httpRequest(method, url, opts) {
  checkBudget();
  httpCallCount++;
  opts = opts || {};
  let fullUrl = url.startsWith('http') ? url : args['base-url'].replace(/\/$/, '') + url;
  // `parameters` is the REAL Provengo query-string option (confirmed:
  // "Object containing request parameters. These parameters will be
  // appended to the URL, in the parameter part i.e. after the '?'").
  if (opts.parameters && typeof opts.parameters === 'object') {
    const qs = Object.entries(opts.parameters)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    if (qs.length > 0) fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs.join('&');
  }
  const curlArgs = ['-s', '-w', '\n%{http_code}', '--max-time', '10', '-X', method, fullUrl];
  const body = opts.body;
  if (body !== undefined && body !== 'undefined' && body !== null) {
    curlArgs.push('-H', 'Content-Type: application/json', '-d', typeof body === 'string' ? body : JSON.stringify(body));
  }
  if (opts.headers && typeof opts.headers === 'object') {
    for (const [k, v] of Object.entries(opts.headers)) {
      curlArgs.push('-H', `${k}: ${v}`);
    }
  }
  let out;
  let status = 0;
  let bodyText = '';
  try {
    out = execFileSync('curl', curlArgs, { encoding: 'utf8', timeout: 12000 });
    const idx = out.lastIndexOf('\n');
    status = parseInt(out.slice(idx + 1), 10);
    bodyText = out.slice(0, idx);
  } catch (e) {
    protocolViolations.push({ method, url: fullUrl, error: String(e.message || e) });
  }
  const expectedCodes = opts.expectedResponseCodes;
  let parsedForViolationReport = null;
  try { parsedForViolationReport = JSON.parse(bodyText); } catch (e) { /* fine */ }
  if (expectedCodes && expectedCodes.length && !expectedCodes.includes(status)) {
    protocolViolations.push({ method, url: fullUrl, expected: expectedCodes, actual: status, body: parsedForViolationReport });
  }
  // Real Provengo's documented response shape: {code, headers, body
  // (STRING), version}. `response.body` is intentionally a raw string
  // here, not pre-parsed -- callbacks are responsible for JSON.parse(),
  // exactly like the official REST library example does.
  const response = { code: status, headers: {}, body: bodyText, version: 'HTTP/1.1' };
  if (typeof opts.callback === 'function') {
    opts.callback(response);
  }
  return response;
}

// ------------------------------------------------------- BP primitives
const PUBLISHED = [];      // { name, data }
const doneEventLog = [];
let IN_MONITOR = false;
let monitorCursor = 0;
let monitorFn = null;
class StopMonitor extends Error {}

function drainMonitor() {
  if (!monitorFn) return;
  const wasInMonitor = IN_MONITOR;
  IN_MONITOR = true;
  try {
    monitorFn();
  } catch (e) {
    if (e instanceof BudgetExceeded) { IN_MONITOR = wasInMonitor; throw e; }
    if (!(e instanceof StopMonitor)) {
      console.error('[shim] monitor drain raised an unexpected error:', e && e.stack || e);
    }
  } finally {
    IN_MONITOR = wasInMonitor;
  }
}

function EventFn(name, data) {
  return { name, data: data || {} };
}

function EventSetFn(name, predicate) {
  const self = {
    name,
    contains: (e) => !!predicate(e),
    and: (other) => EventSetFn(`${name}&${other.name}`, (e) => self.contains(e) && other.contains(e)),
    or: (other) => EventSetFn(`${name}|${other.name}`, (e) => self.contains(e) || other.contains(e)),
    except: (other) => EventSetFn(`${name}-${other.name}`, (e) => self.contains(e) && !other.contains(e)),
    negate: () => EventSetFn(`!${name}`, (e) => !self.contains(e)),
  };
  return self;
}

function syncFn(opts) {
  checkBudget();
  opts = opts || {};
  if (opts.request) {
    PUBLISHED.push(opts.request);
    if (opts.request.name.startsWith('Done: ')) doneEventLog.push(opts.request.name);
    return opts.request;
  }
  if (opts.waitFor) {
    const targets = Array.isArray(opts.waitFor) ? opts.waitFor : [opts.waitFor];
    const matches = (ev) => targets.some((t) =>
      (t && typeof t.contains === 'function' && t.contains(ev)) || (t && t.name && ev.name === t.name));

    if (IN_MONITOR) {
      // The real generated `monitor:StateTracker` bthread body executes
      // for real here (not reimplemented/guessed) -- we just feed its
      // `while(true) { let e = sync({waitFor: ...}) }` loop with
      // already-published events one at a time, then signal "no more for
      // now" so the infinite loop terminates instead of hanging.
      for (let i = monitorCursor; i < PUBLISHED.length; i++) {
        if (matches(PUBLISHED[i])) {
          monitorCursor = i + 1;
          return PUBLISHED[i];
        }
      }
      throw new StopMonitor();
    }

    for (const ev of PUBLISHED) {
      if (matches(ev)) return ev;
    }
    const deadline = Date.now() + Math.min(remainingMs(), 5000);
    while (Date.now() <= deadline) {
      checkBudget();
      for (const ev of PUBLISHED) {
        if (matches(ev)) return ev;
      }
    }
    console.error('[shim] WARNING: sync waitFor did not resolve within fallback window; returning null');
    return null;
  }
  return null;
}

function waitForFn(evtSet, fn) {
  if (fn) {
    return fn();
  }
  return syncFn({ waitFor: evtSet });
}

function blockFn(evtSet, fn) {
  if (fn) {
    return fn();
  }
  return syncFn({ block: evtSet });
}

function requestFn(evt, fn) {
  if (fn) {
    return fn();
  }
  return syncFn({ request: evt });
}

function bthreadFn(name, dataOrBody, maybeBody) {
  const body = typeof maybeBody === 'function' ? maybeBody : dataOrBody;
  if (name.startsWith('monitor:')) {
    // The monitor bthread is declared first in the generated file (so it
    // "starts listening" before any creation happens in a real
    // concurrent BP engine), but nothing has been published yet at this
    // point in our eager, sequential execution model. Store it and drain
    // it incrementally after every other bthread instead of running it
    // to completion here (where it would immediately throw StopMonitor
    // having processed zero events).
    console.error('[shim] deferring monitor bthread (will drain after each subsequent bthread):', name);
    monitorFn = body;
    return;
  }
  console.error('[shim] running bthread:', name);
  try {
    body();
  } catch (e) {
    if (e instanceof BudgetExceeded) throw e;
    console.error('[shim] bthread', name, 'raised:', e && e.stack || e);
    protocolViolations.push({ bthread: name, error: String(e && e.message || e) });
  }
  drainMonitor();
}

// A reasonably complete, documented-shape `pvg` global (docs.provengo.tech/
// .../libraries/PvgCallbackObject.html): success/fail/error/log/rtv.
const rtvStore = {};
const pvgShim = {
  success: (msg) => console.error('[PVG SUCCESS]', msg),
  fail: (msg) => { console.error('[PVG FAIL]', msg); },
  error: (msg) => { console.error('[PVG ERROR]', msg); },
  log: {
    info: (m) => console.error('[PVG LOG]', m),
    warn: (m) => console.error('[PVG WARN]', m),
  },
  rtv: {
    set: (k, v) => { rtvStore[k] = v; },
    get: (k) => rtvStore[k],
  },
};

const sandbox = {
  console,
  bp: {
    fork: () => 0,
    log: {
      info: (m) => console.error('[LOG]', m),
      warn: (m) => console.error('[WARN]', m),
      fine: () => {},
      setLevel: () => {},
    },
    store: {
      _data: {},
      get(k) { return this._data[k] !== undefined ? this._data[k] : null; },
      has(k) { return k in this._data; },
      keys() { return new Set(Object.keys(this._data)); },
      put(k, v) { this._data[k] = v; },
      remove(k) { delete this._data[k]; },
      reset() {},
      size() { return Object.keys(this._data).length; },
      values() { return Object.values(this._data); },
    },
  },
  pvg: pvgShim,
  sync: syncFn,
  Event: EventFn,
  EventSet: EventSetFn,
  waitFor: waitForFn,
  block: blockFn,
  request: requestFn,
  bthread: bthreadFn,
  RESTSession: function (baseUrl, sessionNameOrOpts, maybeOpts) {
    const defaultOpts = (typeof sessionNameOrOpts === 'object' ? sessionNameOrOpts : maybeOpts) || {};
    const merge = (opts) => ({
      ...defaultOpts,
      ...opts,
      headers: { ...(defaultOpts.headers || {}), ...((opts && opts.headers) || {}) },
      parameters: { ...(defaultOpts.parameters || {}), ...((opts && opts.parameters) || {}) },
    });
    return {
      get: (url, opts) => httpRequest('GET', url, merge(opts)),
      post: (url, opts) => httpRequest('POST', url, merge(opts)),
      put: (url, opts) => httpRequest('PUT', url, merge(opts)),
      patch: (url, opts) => httpRequest('PATCH', url, merge(opts)),
      delete: (url, opts) => httpRequest('DELETE', url, merge(opts)),
      head: (url, opts) => httpRequest('HEAD', url, merge(opts)),
      options: (url, opts) => httpRequest('OPTIONS', url, merge(opts)),
      trace: (url, opts) => httpRequest('TRACE', url, merge(opts)),
    };
  },
  // Validation-only helper (not part of generated code): returns the data
  // of the MOST RECENTLY published event matching an EventSet, so
  // hand-authored attack probes can read back a just-created entity's
  // real (possibly server-assigned) identifier the same way the
  // generator's own `resolveDependencies` does -- via the "Done: ..."
  // event log -- since generated interface functions never return a
  // value themselves (matching the supplied reference models' own
  // convention).
  LATEST: (eventSet) => {
    for (let i = PUBLISHED.length - 1; i >= 0; i--) {
      if (eventSet && typeof eventSet.contains === 'function' && eventSet.contains(PUBLISHED[i])) {
        return PUBLISHED[i];
      }
    }
    return null;
  },
  host: parsedBase.hostname,
  port: parsedBase.port ? parseInt(parsedBase.port, 10) : (parsedBase.protocol === 'https:' ? 443 : 80),
  protocol: parsedBase.protocol.replace(':', ''),
  PROBE_RESULTS: [],
};
vm.createContext(sandbox);

let phase = 'interfaces';
let errorOut = null;
try {
  vm.runInContext(fs.readFileSync(args.interfaces, 'utf8'), sandbox, { filename: args.interfaces });
  phase = 'stories';
  vm.runInContext(fs.readFileSync(args.stories, 'utf8'), sandbox, { filename: args.stories });
  if (args.attack) {
    phase = 'attack';
    vm.runInContext(fs.readFileSync(args.attack, 'utf8'), sandbox, { filename: args.attack });
  }
} catch (e) {
  if (e instanceof BudgetExceeded) {
    errorOut = 'TIMED_OUT_DURING_' + phase;
  } else {
    errorOut = phase + '_ERROR: ' + (e && e.stack || String(e));
  }
}

const elapsedMs = Date.now() - START;
const createdCount = {};
const deletedCount = {};
for (const name of doneEventLog) {
  const c = name.match(/^Done: Create /);
  const d = name.match(/^Done: Delete /);
  if (c) createdCount[name] = (createdCount[name] || 0) + 1;
  if (d) {
    const base = name.replace(/ [^ ]+$/, ''); // strip trailing id
    deletedCount[base] = (deletedCount[base] || 0) + 1;
  }
}
const summary = {
  ok: errorOut === null,
  error: errorOut,
  elapsed_ms: elapsedMs,
  http_calls: httpCallCount,
  protocol_violations: protocolViolations,
  done_events: doneEventLog,
  created_counts: createdCount,
  deleted_counts: deletedCount,
  probe_results: sandbox.PROBE_RESULTS,
};
console.log(JSON.stringify(summary));
process.exit(errorOut ? 1 : 0);
