# Stage 6.5C — restore contract-derived Team producer

Copy the ZIP's tree into the existing `C:\work\temp\vikunja_tse_study`.
Changed project file: `generator_baseline/openapi_to_sbt/render/stories_js.py`.

The Gitea Stage 6.5 evidence showed twice that both `units: ["repo.code"]`
and a nonempty `units_map` produced a readable Team. Two requests omitting
unit permissions returned 500 in both trials, with the server log saying
`units permission should not be empty`. The Gitea OpenAPI declares only
`name` required in CreateTeamOption, but both the create request and success
response contain an example for its `units` array. The opt-in long-story
generator now selects a single shared example item for such an optional
array. It does not hardcode operation names or unit strings and does not
change the ordinary generation profile.

Reset the isolated Stage 1 state before repeating seed 20261004: the older
generated run created deterministic names that would otherwise collide.
Run both commands in the same PowerShell session so the new token is retained:

```powershell
& .\scripts\Prepare-Gitea-Stage1.ps1 -ResetState
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
    -Runs 1 `
    -BaseSeed 20261004 `
    -MaxLength 120000 `
    -InstancesPerEntity 2 `
    -InstancesPerAction 1
```

Compare the campaign's `skipped_long_stories`,
`successful_long_stories`, Team POST results, and
`stage6-epochs.csv` with the earlier 18 skipped and 11 completed-in-full.
The six Team-dependent stories are expected to become eligible; actual
schedule coverage must be verified from the new evidence ZIP. The other
12 skipped stories require separate dependencies or environment permissions.
Keep the existing repoCreateTag response-contract deviation separate from
semantic concurrency findings.
