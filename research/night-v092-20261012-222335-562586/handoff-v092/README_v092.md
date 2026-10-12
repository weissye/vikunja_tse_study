# v092 — upload before the overnight run

Upload-Night-v092.ps1 uses an isolated sparse/no-checkout MAIN clone and read-tree to preserve existing server files, stages one dated research snapshot, commits, non-forced pushes MAIN, and verifies exact remote commit. Existing study trees and Docker are not modified. Authorization to push MAIN is from the user's explicit request.

Scope: complete v091 package source (including frozen inputs, generator, JS, tests, handoff), available Vikunja packages v069-v092 in Downloads, today's public run sources/evidence/review ZIPs and generated trees in the home StudyRoot. Earlier work-machine snapshots already exist on MAIN; they are not downloaded/copied again.

Included by explicit user authorization: run-config.local.json with the isolated research password.

Excluded: unrelated local credential configs, private snapshots, Docker database/files, products, JAR, unrelated applications. The result of the upcoming night run cannot be uploaded in advance.

Archive copies containing unrelated local credentials or runtime tokens are SANITIZED and labelled; the authorized run-config.local.json is retained. local original ZIPs remain unchanged. Latest internal manifest is rebuilt for sanitized archives, and SourceSHA256 is retained in transfer inventory. The v088 malformed redaction pattern is decoded only for sanitization, then JWT/known passwords are masked. Review ZIPs with no changes preserve exact bytes. Loose historical manifests may describe original bytes; SHA256_v092.json is the authority for transferred loose files. Source-v091's latest package manifest is recomputed for transferred files. Its local research configuration is available at the next computer.

The uploader has tested sanitization/manifests on injected archives and actual Git plumbing on a local bare repo; it has not pushed GitHub here. Windows PowerShell launchers have not been run here. A reported V092_MAIN_UPLOAD_VERIFIED + commit identifies successful server upload. If upload fails, the chained instructions do not start the night campaign.

A single file/member >=90MiB blocks this uploader to respect ordinary Git transfer constraints. No LFS/force push/blind pull/reset is used. Preserve the workspace/receipt on failure.
