# Verified generator 0.25.3 compatibility hotfix

This hotfix supersedes the earlier `0.25.3_input_policy_delta` package.

The earlier delta contained an obsolete `stories_js.py` and therefore removed
the `story_profile` argument and the Vikunja lifecycle, relation, exploration,
and multi-resource profiles. The resulting 51 matrix errors were all symptoms
of that single packaging regression.

This package is based on the latest Vikunja renderer and preserves every
existing story profile. It adds only contract-derived request-input policy:

- required path, query, and body fields are populated;
- dependency-bound identities are populated from captured resources;
- optional transport fields are omitted;
- read-only fields are omitted;
- optional nullable fields are omitted;
- optional unbound identity fields are omitted;
- optional object and array fields are omitted;
- optional writable primitive fields may still be generated;
- positive generic stories are not emitted when a required path identity is
  neither created nor dependency-bound.

No Vikunja- or Todoist-specific field names or business rules are used by this
policy.

## Verification performed before packaging

- Full reconstructed generator suite: 119 tests passed, 3 skipped.
- The reviewed dependency-graph goldens passed for all five systems, including
  Todoist.
- Vikunja full-profile generation covered 29 of 29 operations.
- Independent static validation passed with 100% declared response-code
  coverage.
- Both generated JavaScript files passed `node --check`.

## Installation

Extract the ZIP at the root of `C:\work\temp\vikunja_tse_study` with overwrite
enabled, then run:

```powershell
python ".\generator_baseline\tests\unit\test_v0253_input_policy_compatibility.py"
& ".\scripts\Test-OpenApi-Verified-Generator-Matrix.ps1"
```
