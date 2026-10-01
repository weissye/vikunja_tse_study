# Stage 6.3: generic story dependency and create-key repair

This incremental ZIP changes **only** `generator_baseline/openapi_to_sbt/render/stories_js.py`. Extract on top of the already installed Stage 6.2 bridge repair. The generated `full` profile remains byte-for-byte equal to the frozen baseline; the change is confined to opt-in `long-interleaving`.

A weak exact-name D2 match from a top-level resource's create field to a namespaced unrelated resource is no longer treated as a prerequisite in the long profile. Explicit nested item paths, named ID fields, and component-schema references remain wired. When a successful POST response documents an item key absent from request completion data, the story now copies that key from the observed response. For a distinct string path key, a unique required string present in both create request and success response may supply the path binding. Neither rule contains Gitea names or paths.

Offline Gitea contract check: the generated organization story no longer waits for an administrative user based solely on the same field name; its path key comes from the documented POST response. The team story still waits for the organization via its nested URL and reads the server-assigned team ID from the documented response. This is **offline generation**, not a claim that all 30 stories run live: real permission failures, unavailable endpoints and runtime validation may still skip stories.

Regression: six actual archived contracts (Library, Garage, Pharmacy, NetBox, Todoist, Vikunja) plus six synthetic shapes generated successfully; default story/interface/verifier outputs match frozen baseline byte for byte; opt-in JavaScript syntax passed. No live executions of these systems were performed.

Run once from the Windows project root after extracting the ZIP:

```powershell
if (-not $env:GITEA_API_TOKEN) { throw 'GITEA_API_TOKEN is not set' }
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
  -Runs 1 -BaseSeed 20261003 -MaxLength 120000 `
  -InstancesPerEntity 2 -InstancesPerAction 1
```

Inspect `successful_long_stories`, `long_story_steps_selected`, `skipped_long_stories`, `observed_overlapping_epochs` and the per-run skip reasons in the new campaign review ZIP. Compare against the seed 20261002 reference: 4/30 complete long stories, 19 steps, 26 skipped, 21 overlapping epochs. An increase in complete stories must be established by this live run, not inferred from the generated source.
