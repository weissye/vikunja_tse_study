Stage 6.4R: one-file project-tree overlay

Apply after the Stage 6.4 identity-ordering patch. The only changed source is:
  generator_baseline/openapi_to_sbt/render/stories_js.py

This file is based byte-for-byte on the source in the previous Stage 6.4
identity-ordering patch (SHA256 f7580a501c16bc6c80a2965797802c75f7b64a3f60d002b9114409fa3d8ba5db)
plus a generic contract-description email format inference confined to the
opt-in long-interleaving profile. The frozen Gitea OpenAPI describes the org
email field as an email address but omits format: email. Seed 20261004 had
generated an invalid value; the corrected generated value is email-shaped.
The full profile generated story output was byte-identical in offline checks.
This change does not resolve failed resource producers or establish a bug.

From the existing Windows project root, verify the source revision BEFORE
extracting the ZIP. If the hash differs, stop and send the hash for rebase.

  $target = '.\generator_baseline\openapi_to_sbt\render\stories_js.py'
  $expected = 'f7580a501c16bc6c80a2965797802c75f7b64a3f60d002b9114409fa3d8ba5db'
  if ((Get-FileHash $target -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected) {
      throw 'Generator differs from preserved Stage 6.4; stop before extraction.'
  }
  Copy-Item $target "$target.before-stage6_4r"
  Expand-Archive -LiteralPath '.\gitea-stage6-4r-tree-overlay.zip' -DestinationPath . -Force
  (Get-FileHash $target -Algorithm SHA256).Hash.ToLowerInvariant()

The final hash must be:
  86ef9bcb354f776a9ae63c493a7c941e12ec4be53b8fcb438751544920bccd74

Use the existing Stage 6 generated runner, as in the Stage 6.4 README:

  if (-not $env:GITEA_API_TOKEN) { throw 'GITEA_API_TOKEN is not set' }
  & .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
    -Runs 1 -BaseSeed 20261004 -MaxLength 120000 `
    -InstancesPerEntity 2 -InstancesPerAction 1

Return the new gitea-stage6-generated-*-review.zip and its paired
gitea-stage3-live-acceptance-*-review.zip, plus the short console summary.
Do not interpret skipped stories, response-code discrepancies or overlapping
epochs alone as confirmed semantic faults.
