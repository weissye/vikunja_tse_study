# v102 automatic interaction generation (static delivery)

Based on frozen v100; its original archive/live evidence remain unchanged. This package
extends the generic emitter, enabled through optional research-config interactions.
No application/resource-name-specific scenario branches are added to the renderer.
Contract preprocessing still retains historical external mappings from v100; this
extension does not claim the complete baseline is purely contract-only.

Default: 117 candidate groups inferred from supported writable observable fields,
resource instance bindings and three generic profiles. Six groups selected, twelve
independent session workers, six native coordinators and six independent verifiers.
A single unified project contains Stories, Interfaces and DAL, alongside existing
24 resource lifecycle instances, 48 control workflows and eight sampled negatives.
No per-family projects are emitted. Factories are defined once, instantiated from data.

Profiles: shared reads/same field; shared reads/disjoint fields; free stale reads/
disjoint fields. Both workers bind the same logical/physical resource. Their caches
are group+session specific. Coordinators collect A/B readiness without imposing an
arrival order; free-read profiles do not use the two-read barrier. Provengo chooses
which read/write is selected. No Python scheduler orders worker events.

The extension emits actual GET/update route expressions from IR, including parent
RTVs. The write body is built from that worker's earlier cached response. This is
intended to expose stale-read interactions; legal full-replacement behavior is NOT
automatically classified as lost-update bugs. Oracles are OBSERVATION_ONLY until
operation semantics support stronger expectations.

IMPORTANT: THIS IS NOT A LIVE-RUN PACKAGE. InteractionAcquire is explicitly blocked
by a generated acceptance guard. Coordinator release additionally requires validated
InteractionReconciled; no silent overwrite of the expected Context is performed.
The missing gates/ref-state reconciliation and positive-group rollback need native
acceptance before enabling the interaction extension. Do not run historical live
launchers in this package and interpret their baseline result as interaction coverage.
Use ONLY Run-Interactions-Static-v102.ps1 for the current delivery.

Prior source/reference launchers remain for provenance; their manifests are historical.
Current integrity entrypoint: Verify-v102.py.

Inputs: input-source/research-config-v102.json controls profiles, maximum group count,
sampling seed, resource instances and the existing run budgets. Generic emitter reads
only contract IR + research config. Catalog lists selected groups, source operation
pointers, blocked resource types, oracle authority and explicit live blockers.

Native/live execution performed here: NONE.
Local tests: emitted JS syntax; generic candidate coverage; same/disjoint field pairs;
B-first readiness; duplicate readiness; free/shared barrier distinction; optional
extension disabled reproduces v100 JS byte-for-byte (three files).

This delivery implements field-level interaction templates. Association/move/delete
interaction templates discussed in the method specification are not implemented here.
Next acceptance must integrate footprint reservations, reference outcome checking,
Context reconciliation and group snapshot/recovery, without removing v100 safeguards.
