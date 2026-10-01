# NetBox apples-to-apples (A-2-A) protocol -- V36

## Goal

V36 evaluates whether tools can construct semantic prefixes under the same public 12-operation OpenAPI boundary while preserving the V35 benchmark semantics and official sequence-local oracle. The NetBox OpenAPI is byte-identical to V29/V35 (`dae055dc0eac76045389286820719f4a8b1fbd3be7d7897c50ba87cdd01d2060`).

The shared OpenAPI contains structural operation and schema information only; there is no fault trigger supplied to any tool. It contains no seeded-fault selector, evaluator predicate, hidden activation marker, historical witness, or tool-specific hint.

## Conditions

1. `ProvengoBasic` -- ordinary generated interfaces and standard generated stories.
2. `ProvengoComplex` -- the same interfaces plus generic deep structural families derived automatically from the same OpenAPI.
3. `RESTler` -- the identical OpenAPI file.
4. `EvoMaster` -- the identical OpenAPI file.

All conditions run against the same V35 benchmark SUT through the same external HTTP trace proxy. V36 changes generator/runtime binding only; it does not change the benchmark fault mechanisms or official oracle.

## Measurement parity

Measurement parity is preserved across all four conditions under the same OpenAPI information boundary: the same 12-operation OpenAPI projection, the same SUT, the same external HTTP trace proxy, and the same sequence-local semantic evaluator are used for official A--E scoring. Tool-native findings remain separate from the common semantic score.

## V36 generator-correctness rule

V36 fixes two execution defects found by running the V35-generated model under real Provengo scheduling.

First, a nested reference field is now wired only when multiple contract-visible signals agree: the bare field name matches the target entity, the resolved field schema comes from a reference/presentation component for that entity, the nested object exposes the target key, and namespaced resources remain within the same namespace. In the frozen NetBox projection this produces `Device.site -> Site` from the public `site: SiteRef{id}` schema. The runtime value is rendered in the documented nested shape `{id: <captured-site-id>}` for both create and update operations.

Second, a create interface returns the same post-callback completion payload that it publishes in its `Done:` event. Its caller uses that return value directly to emit `InstanceReady:<Entity>:i`. This preserves each creator's identity when multiple same-entity stories run concurrently; the caller no longer waits for a generic `matchAny<Entity>Added()` event after its own completion event has already occurred.

For ProvengoComplex, generic deep scenarios that would have to invent a nested reference identifier are skipped. Relation-specific families still create the producer first and bind its captured runtime identifier. No business rule or seeded-fault information is used to make this decision.

## Five semantic classes and minimum external witnesses

The V35 witness definitions are unchanged:

- `A_LOGIC` -- create two existing parents and one child, request reassignment to the second parent, then GET the child and observe the original parent: **5 HTTP operations**.
- `B_LIFECYCLE` -- create a parent and two children, delete the parent, then GET one former child and observe the deleted reference: **5**.
- `C_UNIQUENESS` -- successfully create two distinct parents with the same benchmark unique required string: **2**.
- `D_INTEGRITY` -- create scalar X, PATCH to Y, GET and verify Y, then PATCH to distinct Z and observe a successful stale response that still reports Y: **4**.
- `E_REFERENTIAL_INTEGRITY` -- create parent and valid child, delete the parent, then successfully create a new child reusing the deleted parent and observe that dangling reference in the create response: **4**.

## Hidden ground-truth activation markers

Whenever the buggy SUT executes one of the five seeded fault branches it writes a server-side JSONL marker to `sut_ground_truth.jsonl`. The marker is never returned in HTTP status, body, or headers and is therefore not visible to Provengo, RESTler, or EvoMaster. It is also never used for official scoring.

The markers answer a separate diagnostic question: **was the seeded branch reached?** The external evaluator answers: **was there a complete externally observable semantic witness?** Therefore a class may be triggered without being officially confirmed. Conversely, a campaign HTTP confirmation without a corresponding hidden activation is treated as a validator-defect signal.

## Official scoring rule

The primary result is `sequence_confirmed_semantic_classes`.

A class is official only if its complete legal prefix and violating observation occur within **one tool-generated sequence/test**. The evaluator may union classes found by different complete sequences, but it never concatenates events from different sequences to create a witness.

A flat full-campaign trace is also evaluated for `campaign_reachability_classes`, but that result is explicitly diagnostic-only because it may contain cross-test continuity. Hidden activation markers are likewise diagnostic-only. Tool-native findings are stored separately in `native_tool_faults` and do not count as A--E confirmations.

## Sequence evidence by tool

- **Provengo:** one `provengo run` execution is preserved as one generated execution path.
- **EvoMaster:** saved generated Python tests are replayed one test method at a time against fresh SUT instances; each replay produces one sequence trace.
- **RESTler:** official traces are constructed only when native network logs expose explicit sequence boundaries. If boundaries cannot be verified, the official sequence score remains zero rather than using the flat campaign trace.

## V36 release gate

V36 is released only after: OpenAPI byte-hash verification; V35 SUT byte-hash verification; unchanged 5/5/2/4/4 witness checks; nested-reference graph/wiring regression checks; per-story completion-data checks; elimination of invented nested-reference placeholders from generic complex scenarios; hidden-marker HTTP-invisibility tests; sequence-local/no-stitch tests; deterministic model rebuilds; and Windows PowerShell syntax parsing on the execution machine.
