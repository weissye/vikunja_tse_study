Increment 7.2: disjoint-field JSON Merge Patch commutativity

This delta corrects the invalid Increment 7.1 oracle. Increment 7.1 used
partial PUT bodies even though Vikunja API v2 defines PUT as a full update.
Its pilot is diagnostic evidence only and must not be frozen as a product bug.

Increment 7.2 keeps the same six Tasks and the same two independent fields,
but uses PATCH with application/merge-patch+json. For each Task, one BP writer
patches title and another patches description. A verifier GET executes only
after both PATCH operations close and requires both successful effects to be
visible. This adds 12 PATCH requests, 6 verifier GETs and 6 witnesses.

The OpenAPI projection already contains PATCH /tasks/{task}; no operation was
added outside the generated boundary. The external oracle accepts only PATCH
triggers with the increment7_2_ prefix, so the preserved 7.1 PUT trace cannot
be misclassified as 7.2 evidence.

Extract this delta directly into:
  C:\work\temp\vikunja_tse_study

Then run only the pilot:
  python .\tests\test_increment7_2_disjoint_patch_updates.py
  & ".\scripts\Prepare-Vikunja-Increment7_2.ps1"
  & ".\scripts\Invoke-Vikunja-Increment7_2.ps1" -Seed 20262221

Do not delete the Increment 7.1 run directory. Do not freeze Increment 7.2
until the pilot output has been reviewed.
