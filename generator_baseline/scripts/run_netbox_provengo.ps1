param([string]$DevelopmentKit=(Join-Path $PSScriptRoot "..\resources\development_kit"),[ValidateSet("correct","buggy")][string]$Variant="buggy",[int]$Seed=1,[int]$MaxLength=500,[int]$InstancesPerEntity=5,[int]$InstancesPerAction=7)
& (Join-Path $PSScriptRoot "Invoke-GeneratedModel-Provengo.ps1") -System netbox -Variant $Variant -DevelopmentKit $DevelopmentKit -Seed $Seed -MaxLength $MaxLength -InstancesPerEntity $InstancesPerEntity -InstancesPerAction $InstancesPerAction
exit $LASTEXITCODE
