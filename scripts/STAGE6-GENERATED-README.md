# Stage 6.2: generic long stories, dependency closure, evidence

Apply this incremental ZIP at the existing project root. It changes only the generic generator renderer and the Stage 6 campaign runner/analyzer; it does not change the default `full` profile, Stage 1–5 settings, Gitea-specific operation rules, or the external verifier.

The opt-in `long-interleaving` profile now generates at most six independent update stories per eligible OpenAPI update operation. Each field must be writable in the request, observable with the corresponding item GET, and support a schema-derived runtime distinct value. Each story reads, updates, and reads again for 3–6 rounds. The seed rotates eligible choices, while preserving a bounded set of reversible boolean fields. Multiple stories use the same created resource and Provengo decides their legal interleaving subject to generated dependencies. The existing HTTP concurrency adapter performs the simultaneous requests.

Resource events are scoped to the full inferred entity key, avoiding collisions between equally named resources at different API paths. Failed creations publish `SBT:InstanceUnavailable`; dependent creation and action stories emit `SBT:StorySkipped`, publish their phase completion, and stop instead of waiting forever or inventing an ID. An update rejected by the SUT also records a reason and completes its phase. A SKIPPED story is **not** evidence that the underlying API operation was exercised. `block` protects cleanup intent until dependent long stories finish. Contract-required dependencies still use `waitFor`.

The campaign now reports generated, completed, skipped, unfinished, and fully witnessed long stories separately. `Status: COMPLETE` still means the evidence archive was preserved; `Exploration: FULL_WITNESS_COVERAGE` requires all generated long stories to finish every round. A real server can reject undocumented requirements, permissions, or schema-derived values; no generic generator can truthfully guarantee every HTTP story succeeds against such a server. Check `stage6-campaign-summary.json` and the Stage 3 run ZIP under `evidence/` for the individual outcomes.

## One-seed pilot on the existing Gitea container

```powershell
cd C:\work\temp\vikunja_tse_study
$patch = Join-Path $env:USERPROFILE 'Downloads\gitea-stage6-generic-story-closure-patch.zip'
if (-not (Test-Path -LiteralPath $patch -PathType Leaf)) { throw "ZIP not found: $patch" }
Expand-Archive -LiteralPath $patch -DestinationPath . -Force
Set-ExecutionPolicy -Scope Process Bypass -Force
Unblock-File .\scripts\Invoke-Gitea-Stage6-Generated.ps1
if ([string]::IsNullOrWhiteSpace($env:GITEA_API_TOKEN)) { throw 'GITEA_API_TOKEN is empty' }
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 -Runs 1 -BaseSeed 20261001 -MaxLength 120000 -InstancesPerEntity 2 -InstancesPerAction 1
```

Verify the ZIP is actually downloaded to the stated path. The existing Stage 1 Docker server, frozen Swagger, Stage 2/3 scripts, token, and Provengo must be available. Upload both resulting ZIPs from `evidence/` for an independent check. Do not interpret the number of earlier HTTP requests as proof that an oracle used the same resource as an earlier long story.

## Compatibility performed on the six other contracts

The `scripts/check_stage6_generator_compatibility.py` script generated both `full` and `long-interleaving` profiles on the saved OpenAPI contracts for Library, Garage, Pharmacy, NetBox, Todoist, and Vikunja, plus six synthetic request/response shapes. For every real and synthetic input, `full` interfaces and stories matched the frozen baseline byte for byte; `long-interleaving` emitted syntactically valid JavaScript (Node syntax check). The frozen Gitea 1.27.3 contract (SHA256 a0baa9a766c22492bd8c45744157c611d3e95cfc0dc73d6f5d14f294cdddce38) generated 29 independent long update variants including six `repoEdit` variants, and passed the JavaScript syntax check. **No live run on the six other SUTs was available in this environment.** Regression provenance and input hashes are in `scripts/STAGE6-GENERIC-COMPATIBILITY.txt`.
