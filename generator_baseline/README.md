# V36 current release

The current artifact release is **V36**. NetBox keeps the V35 sequence-local witnesses 5/5/2/4/4 and hidden diagnostics, while correcting OpenAPI-derived nested-reference binding and per-story runtime-ID propagation under real Provengo scheduling. The 12-operation OpenAPI and benchmark SUT remain unchanged. See `V36_RELEASE_NOTES.md` and `RUN_V36_NETBOX_HE.md`.

# openapi-to-sbt -- paper baseline v31

V31 is the direct successor of the frozen V29 artifact. It preserves the V29 NetBox A2A OpenAPI byte-for-byte while correcting the two scientific issues that motivated this release: shallow fault activation and campaign-wide cross-test stitching.

Start with `README_V31_HE.md` (Hebrew), `V31_RELEASE_NOTES.md`, and `experiments/netbox_a2a/A2A_PROTOCOL.md`.

The generator still translates OpenAPI 3.0/3.1 contracts into executable Provengo material. The four-system material outside the NetBox A2A experiment is inherited from V29 unless explicitly listed in `V31_CHANGE_MANIFEST.json`.

For NetBox A2A, all conditions receive the same metadata-stripped 12-operation OpenAPI. `ProvengoComplex` derives deep structural scenarios from that OpenAPI only. The official semantic score is `sequence_confirmed_semantic_classes`; `campaign_reachability_classes` is diagnostic only, and `native_tool_faults` remains separate.

Validate from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_a2a\Invoke-NetBox-A2A.ps1 -Mode Validate
```

The canonical NetBox A2A OpenAPI SHA-256 is:

`dae055dc0eac76045389286820719f4a8b1fbd3be7d7897c50ba87cdd01d2060`
