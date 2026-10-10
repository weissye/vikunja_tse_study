# Research Method Specification v001

**Project:** From Stories to Bugs  
**Freeze date:** 2026-10-09, Asia/Jerusalem  
**Status:** Frozen design and evaluation protocol; implementation is incomplete.  
**Scope:** Contract-derived positive stateful consistency testing of REST APIs, with dependency-aware prefixes and sequential behavioral interleavings.  
**Version rule:** Never edit this frozen delivery in place. A substantive change produces v002 and a change record.

## 1. Research questions, thesis and current evidence

**Working thesis.** Resource identities and structural dependencies in an API contract can support generated executable contexts. Generic consistency policies can then check those contexts. Dependency-aware prefixes and behavioral interleavings may increase context coverage and detection of stateful consistency failures under a fixed budget. The final clause is a hypothesis, not an established result.

- **RQ1 — Feasibility and transfer:** How much of the contract-derived pipeline can execute on a system without system-specific scenario authoring? Measure inventory, eligible operations, resolved identities, generated packages, executed and checked operations, blocked candidates, and human intervention.
- **RQ2 — Prefix contribution:** Does dependency-aware context construction and increased prefix depth improve context coverage and confirmed finding yield compared with a minimal valid setup, under equal request budgets?
- **RQ3 — Interleaving contribution:** Does varying dependency-constrained sequential orders improve context coverage and finding yield compared with a fixed serial order for the same plans?
- **RQ4 — Cost and evidence quality:** What are the generation time, execution time, request cost, intervention cost, and rate of inconclusive or unconfirmed candidates?

Vikunja v007 provides an audited engineering feasibility example: live contract/version match, native Provengo 0.7.5-SNAPSHOT, 60 valid callback receipts, 30 scalar readbacks, dependency order and prefix barrier verified. It covers two instances each of projects, tasks and labels. One manual, documented HTTP-method override was necessary. It does not establish RQ2 or RQ3, full API coverage, automatic prioritization, many-to-many verification, true concurrency, or generalization to an unseen system.

Mealie and Vikunja are development systems because their outcomes have informed the implementation. Historical results must retain their original provenance and claims. This specification does not retroactively recategorize discoveries as outputs of v001.

## 2. Method development versus method execution

The iterative work in development systems is method construction. The frozen algorithm below is the proposed method. The evaluation uses a frozen implementation of that algorithm. A design freeze is not an implementation freeze; record both independently.

A run may adaptively expand only through the predetermined queue and bounds below. An analyst cannot choose the next scenario from a failed outcome inside a scored campaign. Post-campaign investigation is allowed and separately labeled.

Before evaluation starts, freeze source hashes, runtime hashes, settings, system list and versions, account scope, budgets, exclusions and the scoring rules. No evaluation data has been collected under this protocol yet.

## 3. Inputs and permitted human involvement

| Input | Origin | Rule |
|---|---|---|
| API contract and source bytes | System documentation | Preserve raw bytes and canonical structural hash separately |
| Local API address and credentials | Operator | Configuration; credentials never enter exported evidence |
| Existing research account/workspace | Operator | All generated operations use this account's own created resources |
| Generic oracle policy | Method authors | Frozen policy shared across systems |
| Seeds, budget and bounds | Protocol | Frozen before scored execution |
| Family restrictions | Operator if needed | Full eligible scope is default; restricted runs must disclose their scope |
| Identity or operation adapter | Analyst when blocked | Not automatic inference; separately recorded and evaluated |
| Business-specific expected behavior | Analyst | Outside the automatic core; report in a separate assisted track |

Forbidden within a scored automatic campaign: hand-authoring a failure-specific plan, editing generated JS, changing the scalar priority to fit a known finding, changing ranking after seeing results, or silently repairing a contract.

Record intervention timestamp, reason, changed file, before/after hashes, time spent and affected operations. Infrastructure repairs, such as storage permissions, are separate from semantic adapters but remain in the setup record.

## 4. Contract inventory and provenance

Support OpenAPI 3 and Swagger 2 through a common internal representation without changing documented HTTP methods or schema semantics. Preserve original JSON pointers. Resolve local references with cycle guards; external references and unsupported composition are explicit unresolved cases, never silently dropped.

Inventory all operations and schema definitions. Do not equate schema count with business entity count, or reference count with business relationship count. Separate request, response, wrapper and error schemas.

Every inferred element carries: source pointers, inference rule, confidence class, unresolved alternatives and runtime validation status. Distinguish explicit contract structure, inferred resource role, declared generic policy and analyst override.

If live documentation is available, compare canonical parsed documents and record raw hashes. Otherwise label the contract as not live-attested. Version equality alone is not contract equality. Documentation defects are reportable outcomes, not excuses to mutate the baseline contract.

## 5. Resource and identity inference

A resource candidate requires a root response identity and a compatible single-resource GET. Use path-family structure, identity type and compatible response fields; do not rely on parameter name alone. Ambiguous matches remain blocked.

Current supported identity policy: root scalar `id` with compatible type. Other keys, composite identities, aliases and array lookups are future extensions until separately implemented and tested.

Creation candidates require POST or PUT, a collection-ending path, a declared JSON body and documented 201 response. This is a deliberate limited policy; valid 200-returning creations are recorded as unsupported, not counted as absent resources.

Update candidates are JSON-body POST, PUT or PATCH operations on the matched single-resource GET path. Exactly one eligible update is required. PATCH requires supported declared media semantics. Unsupported required body fields, schema constraints or ambiguous mutations block a candidate.

Capture identifiers from actual creation responses and bind them at runtime. Never invent identifiers or treat a logged selected event as a response receipt.

## 6. Relationship eligibility

Classify candidates separately:

1. **Parent identity in a creation path:** infer the producer from the preceding resource path segment and compatible identity type. Validate the resulting membership through an independent read when the response supports it.
2. **Foreign-key body reference:** accept only a resolved schema/path producer and a readable membership projection. Otherwise it remains unresolved.
3. **Many-to-many association:** require distinct association creation/removal operations, identities for both endpoints, and a collection or resource read that exposes membership.
4. **Hierarchies, multiple parents and cycles:** inventory them. Execution is blocked until the required creation/update sequence has a supported, deterministic binding policy. Never claim operational coverage from schema cycles alone.

Removing an association is different from deleting either endpoint resource. Pagination must be traversed within bounds; incomplete enumeration is inconclusive. Unsupported relationship families remain visible in the coverage denominator.

Only the first relationship class has partial implementation in the current Vikunja path. The other classes and independent membership checks are planned work.

## 7. Generic consistency policies

The scalar policy selects the first supported writable string in priority order `title`, then `name`, also present in the single-resource GET response. Formatted, read-only, write-only or constraint-incompatible values are excluded. This is a declared metamorphic policy, not a business rule inferred from OpenAPI.

The core checks are:

- Successful creation is followed by GET: identity and supplied scalar are equal.
- Successful update is followed by GET: identity stays stable and the supplied scalar persists.
- Parent membership, when supported, agrees with the bound parent and remains stable under unrelated scalar updates.
- Association creation/removal, when supported, changes only the relevant membership; endpoint resources remain readable.

Delete checks are out of the v001 executable core until soft-delete, asynchronous completion and collection semantics have an explicit supported policy. A mismatch may reflect normalization or an inadequate oracle; it is a candidate pending investigation, not automatically a confirmed defect.

Every selected core mutation has a verification obligation. Missing GET evidence, missing fields, unsupported pagination or an unresolved binding produce INCONCLUSIVE.

## 8. Candidate selection and bounded expansion

The domain-independent target is all eligible resources and relationships. A literal project/task/label filter is only a development-pilot restriction and must not be presented as the general selector.

Construct a deterministic candidate queue with three tiers:

- Tier A: each eligible resource with minimal valid ancestor setup and scalar readbacks.
- Tier B: each supported parent-child relationship, with independent membership verification.
- Tier C: each supported shared-resource or many-to-many relationship, with membership and endpoint-preservation checks.

Within a tier, sort canonical resource/operation keys lexicographically. For each candidate, enumerate instances per resource 1 then 2, and prefix update depth 0, 1, 3, then 6. Allocate one seed trial to each candidate before giving it a second trial: round-robin scheduling avoids exhausting the budget on the first family.

If the next expansion exceeds an instance, dependency or request bound, record the reason and skip it. A failure does not raise priority. Seed trials follow seeds 1 through 10. At budget exhaustion, record queued and unexecuted candidates.

No claim of exhaustive state-space exploration is made. The queue policy is frozen but not yet implemented in full. A future ranking policy would be a separate version/ablation, not a silent substitution.

## 9. Prefix, suffix and bthread construction

For a candidate plan:

1. Compute the supported ancestor closure and create the required resources.
2. Independently read creations and capture runtime identities.
3. Perform the selected number of state-building update/readback rounds.
4. Enforce a barrier after all prefix obligations complete.
5. Execute suffix mutations/readbacks in the constructed context.

Depth counts completed mutation/readback rounds, not HTTP calls or dependency-chain depth. Record those other lengths separately. Repeated updates are historical depth; they do not by themselves increase relationship richness.

Current rendering is one bthread per HTTP operation plus a completion bthread. Each operation awaits prerequisite completion events. The renderer must preserve verification obligations; it cannot allow a suffix action before the prefix barrier. Runtime scheduling uses Provengo over enabled actions. Static sampled topological orders are diagnostics only.

A completion event after native fail mode is not evidence of execution. Only valid callbacks and corresponding HTTP response receipts count.

## 10. Sequential interleavings and experimental arms

v001 evaluates sequential HTTP. True concurrency, overlap barriers and linearizability are a separate protocol and cannot be inferred from many bthreads.

Use the same eligible operation scope, initial setup conditions, seeds and request budget in all arms:

- **A — Minimal setup, fixed order:** depth 0; canonical serial order.
- **B — Expanded prefix, fixed order:** queue depths 0/1/3/6; canonical serial order.
- **C — Minimal setup, varied order:** depth 0; native dependency-constrained sequential interleaving.
- **D — Expanded prefix, varied order:** queue depths 0/1/3/6; native dependency-constrained sequential interleaving.

B versus A estimates prefix contribution without varied scheduling. C versus A estimates scheduling contribution at minimal depth. D versus B and D versus C test contribution in the combined setting. Different plan sizes mean a budgeted comparison is not also an equal-trial comparison; report both request consumption and completed trials.

Dependency removal is not a default ablation because it can destroy setup validity. If added later, classify invalid-precondition behavior separately from oracle-confirmed semantic findings.

RESTler/EvoMaster comparisons require their own frozen compatibility and evaluation protocol. No comparator results are assumed here.

## 11. Evaluation budget and system split

Proposed scored budget per system and arm: 2,000 dispatched research HTTP requests, 30 minutes, seeds 1–10, at most 2 instances per resource and 6 update rounds. Stop when either time or request budget is reached. Count setup, mutations and verifier requests. Record login/documentation/health requests separately as infrastructure overhead. Retries are disabled in the scored core; eventual-consistency checking is unsupported until a shared retry policy is frozen.

These limits are proposed protocol parameters, not empirically justified optimal values. A budget-enforcing dispatcher is a prerequisite; current v007 does not implement it.

Require at least two evaluation systems not used to tune the rules. Select them from a pre-recorded eligible pool using published inclusion criteria before scored runs: local reproducible deployment, usable contract, supported positive resource operations and ability to preserve/isolate data. Record every exclusion and failure. Use the same account permission level and settings across arms.

Prefer matched reproducible initial snapshots for each arm/trial. Fresh names alone are not proof of clean-state equivalence. If snapshots cannot be used, disclose accumulating state and randomize arm order under a recorded seed. Report this as a limitation.

Any method change prompted by evaluation data changes its status: the affected system becomes development evidence for the new version. Do not replace its earlier failures in the frozen evaluation table.

## 12. Metrics and finding classification

Report denominators at each level:

- Contract operations, schema definitions and supported resource candidates.
- Eligible operations/relationships, unresolved and explicitly excluded candidates.
- Generated, dispatched, response-observed and verified operations.
- Unique normalized step schedules, preserving logical step identities while excluding concrete ids and generated names.
- Context coverage: resource-family set, instances, parent/shared-link counts, supported relationship shapes, completed prefix depth.
- Oracle verdicts: PASS, CANDIDATE, INCONCLUSIVE, INFRASTRUCTURE_FAILURE.
- Finding classes: contract/implementation deviation, server error candidate, state consistency candidate and independently confirmed defect.
- Cost: generation time, campaign time, requests to first candidate, verification overhead and human intervention minutes.

A 500 alone is not a semantic finding. A 405 contradicting a documented method is a contract deviation candidate. Multiple occurrences are not multiple distinct defects. Deduplicate by affected behavior and confirmed cause when available; retain occurrence counts.

A candidate should be repeated in two additional independent fresh-context trials where feasible, with request/response and pre/post-state evidence. Failure to repeat remains unconfirmed. Tracebacks and code inspection support cause classification but are not required to count an observed contract deviation. Independent analyst review is preferred; if the generator authors also classify findings, disclose that limitation.

Report paired outcomes by system and seed, effect sizes and uncertainty where supported. Do not treat many schedules in one system as independent systems. Two evaluation systems support a bounded transfer claim, not universal generalization.

## 13. Evidence and acceptance

Each trial exports sanitized input hashes, source/compiler/template/runtime hashes, settings, catalog, inference provenance, plan, generated JS, normalized actual schedule, response callbacks, verification outcomes and native exit/result. Store raw/canonical contract hashes separately. Preserve failure evidence as rigorously as successful evidence.

Acceptance requires every expected unique operation receipt, valid checks, supported status codes, correct binding/order, prefix barrier and native success. Source manifests establish byte integrity, not experimental correctness. Exported credentials and authentication headers must be redacted.

Versioned adapters are an assisted track. Keep strict-contract outcomes separately. Vikunja's label PUT-to-POST adapter must not be counted as automatic correction or used to erase the strict-contract 405.

## 14. Implementation gap and next work

| Component | Current evidence | Required next work |
|---|---|---|
| Contract inventory | Live Swagger inventory audited | Common representation tested across formats/systems |
| Scalar rules and JS | Vikunja v007 60/60 | Integrate additive path into full generator without breaking prior systems |
| Parent bindings | Project id used for task creation | Independent membership verifier |
| General selection | Three families configured | All-eligible deterministic queue |
| Prefix depths | Fixed depth 3 | Configurable depths and bounded expansion |
| Scheduling | One native live seed | Multi-seed receipts and fixed-order arm |
| Associations | Candidate inventory only | Creation/removal and complete membership checks |
| Evaluation | No v001 campaign yet | Budget enforcement, initial-state control, system selection and scoring |

Immediate sequence: preserve v007 baseline; run seeds 2 and 3 without generator changes; implement independent parent membership checks; implement the deterministic selector/expansion and experimental arms; then freeze an implementation release against this specification. Only then start held-out evaluation.

## 15. Change control and claim boundaries

Maintain a change log with rationale, scope, affected hypotheses and whether evaluation data informed the change. For an implementation-only correction that conforms to v001, increment implementation version and retain v001. For a changed policy, budget, oracle or selection rule, produce a new specification version.

Permitted current statement: a positive, dependency-aware generated path executes on Vikunja with a documented adapter and complete callbacks. Pending statements: improvement due to prefix/interleaving, fully automatic broad selection, many-to-many consistency coverage, and held-out transfer.
