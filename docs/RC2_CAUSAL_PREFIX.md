# RC2: a verified prefix before disjoint-field concurrency

Apply this tree overlay **after** `immich_generator_verifier_profiles_rc1_tree_overlay.zip` at the project root. It adds an opt-in `combined` campaign profile. The default generator output is unchanged.

## What the new option establishes

`--prefix-before-concurrency N` requires N successful rounds of a generated long update story on one captured item. Each round checks the GET before the update, the update response, and a tagged GET after it. A concurrency oracle admits its epoch only after N consecutive verified events for the same item path and story. The trace evaluator independently checks that the N tagged GETs succeeded and completed in order before both concurrent operations began. Other generated mutations are blocked from admission through the epoch's final observation. A skipped dependency or unobserved prefix yields an inconclusive witness, never a semantic violation.

The preflight generates JavaScript and manifest files; only a real Provengo run can establish actual overlap and a causal prefix. Profiles `baseline`, `coverage`, `depth`, and `parallel` retain their existing parameters.

## Run on the Windows project

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\immich_causal_prefix_rc2_tree_overlay.zip" -DestinationPath . -Force
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile combined -PreflightOnly
& .\scripts\Prepare-Immich-Album-Pilot.ps1
& .\scripts\Invoke-Immich-Generated-Profile.ps1 -Profile combined
```

The combined profile uses two seeds, 7–10 rounds, four candidate field pairs, JSON disjoint fields, a maximum length of 50,000, and a seven-round gate. Check the campaign's `scope.json`, individual `seed-*/summary.json`, the HTTP trace and the generated verifier evaluation. Demand observed epoch overlap and a nonempty `prefix_evidence` for a claimed causal witness; a generation count alone does not establish coverage.

## Seven-system backwards compatibility gate

The included `scripts/check_generator_compatibility.py` runs without SUT access. It compares SHA256 of the default generated interface, stories, verifier, and verifier manifest with RC1 for each pinned spec. It reads the four original article contracts from `openapi_to_sbt_provengo_four_systems_v35_b4.zip` and accepts the pinned Vikunja OpenAPI file explicitly. It writes a JSON report; code 0 means all seven matched, code 4 means Vikunja was omitted, code 1 means a mismatch. An explicitly missing spec fails before comparison. Supply the exact Vikunja spec used for the prior runs, not an unrelated downloaded version.

```powershell
$old = "$env:USERPROFILE\Downloads\immich_generator_verifier_profiles_rc1_tree_overlay.zip"
$article = "$env:USERPROFILE\Downloads\openapi_to_sbt_provengo_four_systems_v35_b4.zip"
$vikunja = 'C:\path\to\the\pinned\vikunja-openapi.json' # Replace with the actual pinned file
python .\scripts\check_generator_compatibility.py --root . --baseline-zip $old --article-zip $article --vikunja-spec $vikunja --report .\runs\generator-compatibility-seven.json
```

In the supplied environment Gitea, Immich, Library, Garage, Pharmacy and NetBox passed byte-for-byte static compatibility. The pinned Vikunja contract and running Windows SUTs were unavailable, so seven-system compatibility and runtime compatibility remain gates before declaring the generator frozen. See `docs/rc2_static_compatibility.json` for the six-system comparison.
