# Vikunja academic study — continuation prompt, v119

You are receiving an engineering and research handoff. Read RESEARCH_HANDOFF_v119.md, TOOL_INVENTORY_v119.json, evidence-summary-v119.json and PACKAGE_MANIFEST_v119.json before proposing changes. This is a documentation, source-review and consistency-analysis task. Do not launch live tests, create new server-failure reproduction instructions, or infer that missing artifacts exist. The package contains offline analysis tools and inventories; the historical executable research packages are indexed, not bundled here.

## Your first response and deliverable

1. State the actual accepted baseline, the latest partial live model, and the latest static-only extension. They are different versions.
2. Produce an inventory of capabilities already implemented, capabilities actually accepted live, and requested capabilities not implemented.
3. Inspect source supplied by the researcher or accessible in the pinned Git snapshot. Cite actual filenames/functions for architectural conclusions. The handoff's descriptions of source do not substitute for reading it.
4. Verify that proposed generic generator changes consume contract IR plus research configuration, not arbitrary live OpenAPI parsing or research-version branches.
5. Produce a concrete design/review for ordinary consistency workflows and their evidence accounting. Keep proposed development separate from completed implementation. Do not silently replace independent Provengo bthreads with an externally scheduled Python sequence.
6. Prepare Windows-compatible, versioned artifacts and explicit commands for any offline work delivered. Verify paths from actual files or discover them deterministically; never give FULL_PATH placeholders as runnable commands.
7. Identify absent artifacts explicitly. Do not say "all tools included": TOOL_INVENTORY records what exists in the originating workspace, and dependency documentation identifies external runtimes.

## Non-negotiable architecture

OpenAPI or selected scope -> preprocessor -> contract-ir.json.
External research choices -> research-config.json.
Generic emitter consumes those inputs -> ONE Provengo project with THREE JavaScript files:
Stories, Interfaces, DAL/Context.
Runtime credentials/URLs remain runtime configuration. The current generator has historical adapters and fixture mappings upstream; do not claim every mapping is contract-derived.

Stories instantiate reusable templates for entity lifecycles, independent workflows, verifiers and blockers. Interfaces connect events to SUT HTTP. DAL maintains shared Context facts, dependencies, expected revisions and locks. Provengo chooses the event interleaving at runtime. Python may compile, transport, supervise and collect evidence; it does not choose an application-operation schedule. Do not move login out of the native model.

Dependencies are conjunctive and order-independent: all parents must be available regardless of arrival order. Consult existing Context queries and waitForDependencies before changing them; a sequential waitFor of events can miss an event already observed. Parent tuples must be unique, and instance-count expansion must be distinguished from Cartesian relationship-binding expansion.

Current live actor setting is ONE user with TWO sessions of the same account, not two separate accounts/users. The proposed actor progression is one user/one session -> one user/two sessions -> two users with authorized shared resources -> return to one user while widening entity/action scope -> repeat actor expansion. Historical two-user pilots do not prove the current generic unified emitter supports two users.

## Main methodological question

Does contract-derived modeling with dependencies, independent workflows and Provengo-selected interleaving reach useful states and detect consistency failures beyond simpler lifecycle sequences, under matched budgets? Establish evidence, not merely planned counts.

The term "trap" in this research denotes a candidate consistency situation: cached read followed by updates, shared resource access, or related-resource observation. It does not establish a semantic oracle. Schema validity does not by itself imply merge semantics, last-writer-wins rules, relation cascades or authorization policy.

For candidates, retain operations, involved resources, conservative affected-resource scope, preconditions, oracle rule, authority/source, unsupported mappings and selection/rejection rationale. A rule without authoritative support yields OBSERVATION_ONLY or UNDETERMINED, not a confirmed bug.

## Status you must preserve

- v100: accepted short sampled baseline; 24 resources, 48 workflows, 78 positive updates, 8 negative checks and verified recoveries, 60 relationship checks, one JVM.
- v101: two further samples of frozen v100 completed; cumulative 21 of 65 supported rules, 24 distinct negative cases and 19 abstract checkpoint states across baseline and the two samples. These are not full-contract coverage counts.
- v103: latest interaction model actually executed, but all three recorded live runs stopped on HTTP 500. Each completed five of six interaction groups and three of eight negative checks. Do not label v103 accepted.
- Server logs confirm database is locked in all three cases. The observed server defect is reproducible at the level of symptom, but root cause and contribution of cold recovery remain unresolved.
- v112: cold backup content copied/compared, readiness before/after restart, offline copy restoration. It is NOT the proposed three live causal controls.
- v113: three offline SQLite copy/backup paths passed integrity_check with equal schema and per-table counts. It did not prove runtime absence of locks or field-value equality.
- v116: offline candidate metadata compiler, not the requested runtime extension.
- v117: static extension adds 48 independent readback audit bthreads and 144 planned audits; no new positive updates or relationship mutations. Home static generation succeeded; native/live acceptance not performed.
- v118: passive audit-marker accounting tool; not a launcher or complete HTTP/recovery oracle.

## Specific examples to reason about, without overclaiming

1. Two sessions read the same entity and later send update bodies. One body can contain old values for other fields. A previous field change disappearing is an observation; it may be legitimate full-object replacement. Need endpoint semantics before asserting a lost-update bug.
2. Parent update and child creation can influence parent readback, including server-maintained fields or views. v099 incorrectly compared against a pre-checkpoint observation that became stale; v100 isolated the conservative dependency footprint and asserted preparation/checkpoint equality.
3. A task accepting an empty title with HTTP 200 but retaining its previous title differs from a label accepting and persisting an empty title. Record request validity, status documentation and observed state separately.
4. Three SQLite lock errors occurred at different ordinary writes in three partial v103 runs. Success of earlier writes after recovery prevents the simplistic claim that the DB was immediately and permanently locked after each restart.

## Research-development priorities

First audit genericity, dependency waiting, footprint admission/draining, native session readiness, evidence sequencing and acceptance counters. Then design bounded consistency workflow expansion from documented operations and verified semantics. Keep repetitive reads distinct from repetitive writes. Keep rounds distinct from distinct visited states. Use multiple seeds and explain why identical seeds may not reproduce identical schedules when timing/session readiness changes.

Do not weaken verifiers to make a run pass, hide a 500 with an automatic retry, treat skipped Test Fail Mode events as HTTP executions, or restart an entire JVM and claim continuation at the original pending bthreads. Stop or label unresolved infrastructure failures honestly.

Before developing new features, return a reviewable plan that names actual code changes, backward-compatibility criteria, offline tests, live acceptance gaps and what evidence would support each research claim. No live execution is requested by this handoff.
