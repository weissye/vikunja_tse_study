# Gitea Stage 6.7: OAuth2 producer coverage in the generated campaign

## Scope and provenance

Replace only `generator_baseline/openapi_to_sbt/render/stories_js.py` with the
file at the same path from this ZIP. This copy **includes** the earlier Stage
6.5C `units` change; it is a replacement of that version, not an independent
patch for older versions. No generated output or existing evidence is replaced.

This generator change applies only to the opt-in `long-interleaving` profile.
It detects a create request DTO containing both an optional `name` described
as a name and an array described as redirect URIs, then seeds both fields.
The URI format is inferred from that field's description. In the frozen Gitea
1.27.3 OpenAPI (SHA256 `a0baa9a766c22492bd8c45744157c611d3e95cfc0dc73d6f5d14f294cdddce38`),
this selects `CreateOAuth2ApplicationOptions.name` and `redirect_uris`. The
names and URI values vary deterministically with the campaign seed and entity
index. Stage 6.5D independently observed successful creation with those two
fields; that observation motivates this generic OpenAPI-based exploration
rule but supplies no constant or domain-specific value to the generator.

The Hook producer remains unmodified. Its config description calls `url` and
`content_type` required, but the schema specifies neither concrete property
nor allowed value for `content_type`. The value `json` used in Stage 6.5D came
from a directed control and cannot be presented as a pure OpenAPI inference.
Admin-only and runner dependencies also remain outside this change.

## Run

Extract the ZIP at the existing project root, then in the PowerShell process
with the research token and running isolated Gitea instance:

```powershell
cd C:\work\temp\vikunja_tse_study
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
    -Runs 1 `
    -BaseSeed 20261005 `
    -MaxLength 120000 `
    -InstancesPerEntity 2 `
    -InstancesPerAction 1
```

If preparing a fresh isolated instance first, run
`& .\scripts\Prepare-Gitea-Stage1.ps1 -ResetState` in that **same** process;
this resets its containers and data. Use seed `20261005` to avoid reusing
OAuth application names from the previous seed against an unreset instance.

Review Stage 6's generated-story coverage, OAuth create HTTP status and
whether the OAuth dependent stories complete their rounds. A 201 plus an
independent readable OAuth application is evidence the producer was restored;
skips, other status codes or a new contract mismatch require inspection of
the preserved evidence ZIP. Do not attribute a new semantic finding to this
generator change without an externally observed state witness.

Offline generation smoke check against the frozen spec produced exactly four
changed lines in `stories.gitea.js`: `name` and `redirectUris` for each of two
OAuth producers. The Gitea live run is the required next validation.
