Mealie next two experiments, OpenAPI-to-Provengo generator 0.26.13.

Overlay this ZIP on the existing Stage4 tree after version 0.26.12.
Only changed/new files are included. No original evidence or volumes are removed.

Stage 1: four missing-prefix candidates from seed 20261819 are classified by
scripts/mealie_gap_inventory.py. groupId and userId require a proven producer
of real references; id requires identity rebinding. None is counted as a
concurrency finding. The one remaining candidate, tool.name, is generated
from OpenAPI with one-item serial controls and an overlapping epoch. This
branch deliberately sets prefix-before-concurrency to zero; a PASS is not
an 8-round-prefix witness. The live gate fails if no true overlap occurs.

Stage 2: opt-in empirical full-PUT-versus-DELETE on meal plan. The OpenAPI
and the existing verified create values produce three distinct created items.
The GET responses provide all fields used in complete PUT requests. Two serial
orders (PUT,DELETE and DELETE,PUT), with reads after each step, precede a
barrier-controlled PUT/DELETE overlap on the third item. Invalid bodies or
serial controls cause an explicit skip. An adapter-held same-resource HTTP
lease covers the post-join GET. The evaluator rejects other writes between
baseline and final observation; 5xx alone is a server-error candidate, never
a semantic violation. This branch also has no eight-round prefix claim.

Windows PowerShell, from C:\work\temp\vikunja_tse_study:
  Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\mealie_next_stages_v02613_tree_overlay.zip" -DestinationPath . -Force
  python -m unittest discover -s .\tests -p test_mealie_next_stages.py
  python .\scripts\mealie_gap_inventory.py --archive .\evidence\research-fit-mealie-stage4-20260927_101739_168-review.zip --output .\evidence\mealie-stage4-gap-inventory.json
  & .\scripts\Invoke-Mealie-NextStages.ps1 -Branch tool-gap -BaseSeed 20261821 -PreflightOnly
  & .\scripts\Invoke-Mealie-NextStages.ps1 -Branch mealplan-put-delete -BaseSeed 20261822 -PreflightOnly
  & .\scripts\Invoke-Mealie-NextStages.ps1 -Branch tool-gap -BaseSeed 20261821
  & .\scripts\Invoke-Mealie-NextStages.ps1 -Branch mealplan-put-delete -BaseSeed 20261822

Run each branch once before extending Trials. Each live branch runs in its own
clean Docker project. Success/failure evidence is frozen in evidence/. On an
incomplete trial the isolated Docker volume is preserved for diagnosis.
No Windows Docker or Provengo was available when building this delta.
