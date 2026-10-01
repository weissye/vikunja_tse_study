param([ValidateSet("correct","buggy")][string]$Variant="correct",[int]$Seed=1,[int]$MaxLength=1200,[int]$InstancesPerEntity=2,[int]$InstancesPerAction=2)
& (Join-Path $PSScriptRoot "Invoke-GeneratedModel-Provengo.ps1") -System todoist -Variant $Variant -Seed $Seed -MaxLength $MaxLength -InstancesPerEntity $InstancesPerEntity -InstancesPerAction $InstancesPerAction
exit $LASTEXITCODE
