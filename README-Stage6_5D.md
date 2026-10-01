# Stage 6.5D: confirm remaining user-controlled producers

Copy the ZIP into `C:\work\temp\vikunja_tse_study`. The only project file
added is `scripts/Invoke-Gitea-Stage6_5D.ps1`.

Run from the project root in the PowerShell process with the Stage 1 token:

```powershell
& .\scripts\Invoke-Gitea-Stage6_5D.ps1 -Trials 2 -FreezeEvidence
```

No reset is needed: resource names include a run timestamp, and the control
does not repeat the generated Stage 6 seed. If the current shell has no
`GITEA_API_TOKEN`, first run `& .\scripts\Prepare-Gitea-Stage1.ps1` in this
shell without `-ResetState`.

The script follows the Stage 5.2/6.5 sequential confirmation layout:
authenticate, try the earlier failing request, try documented repair
variants, independently GET created objects, record requests and verdicts,
preserve a time-bounded server log, compute checksums and freeze a review ZIP.

For User Hook the controls compare an empty config with a config containing
a URL on the isolated local Gitea instance. Hooks are created inactive; no
test delivery is requested. For OAuth2 the controls compare an empty body,
name alone and name plus a local redirect URI. Responses are scrubbed for
secret or token fields before the HTTP trace is saved.

The experiment does not edit the generator or count a 422/500 as a semantic
concurrency bug. Share the evidence ZIP to determine which of seven skipped
stories have confirmed resource producers. Four Admin Hook stories still
require admin authorization; the Runner story needs a separately verified
producer.
