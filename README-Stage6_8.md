# Stage 6.8: serial OAuth2 update control

Extract this two-file ZIP at `C:\work\temp\vikunja_tse_study`.
It adds `scripts/Invoke-Gitea-Stage6_8-OAuth-Serial.ps1` and this README;
it does not replace the generator or the Stage 6 scripts.

In the same PowerShell session with the isolated Gitea Stage 1 instance and
`GITEA_API_TOKEN` already set:

```powershell
cd C:\work\temp\vikunja_tse_study
& .\scripts\Invoke-Gitea-Stage6_8-OAuth-Serial.ps1 -Trials 2 -FreezeEvidence
```

The script checks the frozen Gitea 1.27.3 OpenAPI hash and creates a unique
OAuth2 application per trial using documented `name` and `redirect_uris`.
It reads the application, attempts a partial PATCH with only a changed name,
reads again, then sends a PATCH with the changed name **and the prior read's
redirect URIs**, and reads again. The two reads independently test whether
the rejected update left the original state and the accepted update persisted.

`FULL_PATCH_PERSISTS_PARTIAL_422` means both controls held: partial PATCH
returned 422, the name was unchanged, full PATCH returned 200, and a later
GET showed the new name with the original redirect URI. Any other outcome is
`INCONCLUSIVE`; inspect the trace. A documented optional property rejected
with undocumented HTTP 422 is a contract discrepancy candidate, not yet a
state semantic bug. The PATCH description also says it regenerates the OAuth2
client secret; this experiment makes no claim that the secret stays constant.

The evidence ZIP includes only allowlisted request and response fields
(`id`, `name`, `redirect_uris`, `message`, and relevant request fields), status,
timestamps, a script snapshot, summary and checksums. It does **not** include
the `client_secret`, request bearer token, Docker logs or raw HTTP responses.
This applies to this new diagnostic only; Stage 3's previous ZIP retains its
existing evidence and must not be shared as a sanitized artifact.

After seeing successful controls, the next generator change can carry
documented fields from the independently read resource into PATCH stories,
then run a fresh Stage 6 with a comparable seed and explicit coverage counts.
