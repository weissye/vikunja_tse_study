# v101 additional short samples over frozen v100

The v100 engine archive and accepted live baseline review are embedded byte-for-byte.
FREEZE_v100.json records both SHA256 values. No generator/model/recovery code in v100
is changed. v101 is a campaign wrapper and evidence comparison tool only.

Default campaign-config-v101.json has two sequential fresh native runs:
(run_seed=2, sample_seed=2), then (3,3). Run seed controls Provengo; sample seed controls
negative selection. Existing StudyRoot/sampling-history-v096.json also rotates completed
cases, so sample seed alone does not define the selection. Both factors change; this
is exploration, not a controlled causal comparison of scheduler seeds alone.
Each child keeps the v100 600s admission + 300s drain budget and eight negatives.
The campaign itself can take up to two such runs plus setup/packaging, not 15 minutes
for both. Baseline child duration was ~4m45s; no duration guarantee is inferred.

Model interleavings are chosen inside one Provengo JVM per child. The wrapper orders
separate runs only. It does not order bthreads/events within a model. Credentials
are copied into excluded .private-config runtime files. Native log raw files/private
snapshots stay excluded. If a child is not accepted, no later sample starts.
Accepted negative findings with verified recovery may continue as in frozen v100.

Comparison measures:
- selected versus completed cases, distinct executed rule IDs, new rules versus prior
  baseline/children and cumulative supported-rule coverage (65 supported rules in v100).
- checkpoint state abstraction: logical resource presence, logical parent bindings,
  and whether each supported field holds its fixture/A/B/other value. Unknown values
  retain a digest. Physical IDs/timestamps do not create novelty by themselves.
- native selected-event log entry count before each negative attempt, separately from
  successful create/update request count and concrete API snapshot fingerprint.
- findings/status mismatches/recovery counts remain separate.

State abstraction intentionally omits most raw field values and server metadata.
It is not full semantic-state equivalence, full contract coverage, or a proof of bug
absence. Full raw checkpoint evidence remains available in each child review.
Only checkpoint states for executed negative windows are counted; not all visited
intermediate states. The baseline has eight checked rules and five distinct abstract
checkpoint states. Static previews are not live observations and advance no history.

Use Run-Samples-v101.ps1 without -RunLive for static readiness. Then -RunLive starts
both children. Existing server/JAR/storage checks are performed by frozen v100.
Fresh fixtures are created; existing research resources/evidence are preserved.

The final review_v101.zip embeds child review ZIPs and a comparison report. Native
/private storage state is not included. Preserve original child run directories.
Do not start another campaign on the same SUT concurrently.

Local validation: baseline hashes/manifests; repeated evidence has zero novelty;
synthetic physical-ID/time changes have zero abstract novelty; value-provenance
formatter checked against JavaScript; two static children generated from unchanged
v100. No new live runs were executed in this build environment.
