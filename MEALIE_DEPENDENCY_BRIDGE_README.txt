Mealie dependency bridge 0.26.9 (tree overlay)

Unzip at C:\work\temp\vikunja_tse_study after installing the prior Mealie Stage4 overlays.
This archive contains changed files only. It also includes the 0.26.8
verifier fix, so an installation currently at 0.26.7 can upgrade directly.

PowerShell:
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\mealie_dependency_bridge_v0269_tree_overlay.zip" -DestinationPath . -Force
python -m unittest discover -s .\tests -p test_structural_id_dependencies.py
& .\scripts\Prepare-Mealie-Stage4.ps1
& .\scripts\Invoke-Mealie-Stage4.ps1 -Runs 1 -BaseSeed 20261814 -MaxLength 25000 -InstancesPerEntity 2 -InstancesPerAction 1 -MaxFieldPairs 3 -MaxConcurrencyWidth 2 -StoryProfile long-interleaving -PrefixRounds 8 -PrefixBeforeConcurrency 8 -PreflightOnly -FreezeEvidence
& .\scripts\Invoke-Mealie-Stage4.ps1 -Runs 1 -BaseSeed 20261814 -MaxLength 25000 -InstancesPerEntity 2 -InstancesPerAction 1 -MaxFieldPairs 3 -MaxConcurrencyWidth 2 -StoryProfile long-interleaving -PrefixRounds 8 -PrefixBeforeConcurrency 8 -FreezeEvidence

Preflight should show at least 2 dependency edges. Live verdict must be read
from its actual preserved run; preflight alone does not verify SUT behavior.
