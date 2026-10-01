# Cross-method serial-control admission fix

Evidence from `research-fit-immich-generated-20260925_044541_632-review.zip`
shows three created and readable albums and three created and readable shared
links. The first oracle executed three tagged baseline GETs, then a tagged
PATCH and verification GET on the first control resource. It sent no DELETE
and no concurrent epoch. This narrows the stop to the serial-control DELETE:
the generated concurrency controller was globally blocking every Provengo
DELETE event while awaiting the epoch, including its own serial controls.

The opt-in cross-method renderer now runs both serial orders before publishing
`SBT:ConcurrencyReady`. When the ready oracles are exclusively empirical
update/delete oracles, its controller does not block DELETE events. It still
serializes admission by blocking other Ready events while an epoch is active.
Existing profiles use the original controller. The cross-method profile uses
the `concurrency-breadth` stories, which do not generate destructive cleanup
operations; external evaluation still requires three distinct baseline
resources, both completed serial controls, overlap, and a later observation.

Apply on top of `immich_cross_method_order_independent_delta.zip`:

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_cross_method_serial_control_delta.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_cross_method_discovery.py
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile cross_method -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile cross_method
```

This is a model scheduling correction, not evidence of an Immich defect. A
live epoch and its independent HTTP verdict have to be observed before making
any semantic claim.
