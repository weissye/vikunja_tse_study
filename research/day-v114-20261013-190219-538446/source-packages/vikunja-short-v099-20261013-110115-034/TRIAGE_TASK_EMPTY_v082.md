# Separate triage: task title empty update

The v076 raw evidence shows three POST updates with `title: ""`, HTTP 200, then independent GETs retaining the previous nonempty title. Only `updated` changed in the checked projection. This differs from label updates, where empty title actually persisted.

The frozen schema has `minLength: 1`, but the supplied operation description does not explain whether an empty update field is ignored. Therefore the current oracle flags a contract/state expectation mismatch, not a proven persisted invalid task or a proven semantic corruption bug. Exact-version source review and clarification of partial-update semantics remain pending. No oracle was weakened, no response rewritten, and no case removed to make the run pass.

v082 retains these task checks and original failed verdicts. It treats research classification separately from recovery acceptance. It does not claim that an interleaving-specific bug was demonstrated by this finding.
