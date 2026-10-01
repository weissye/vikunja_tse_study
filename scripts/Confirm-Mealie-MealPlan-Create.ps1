param([string] $Output = '.\evidence\mealie-mealplan-create-serial-controls.json')
$ErrorActionPreference = 'Stop'
python (Join-Path $PSScriptRoot 'confirm_mealie_mealplan_create.py') --output $Output
if ($LASTEXITCODE -ne 0) { throw "Meal plan serial controls failed: $LASTEXITCODE" }
Get-FileHash -LiteralPath $Output -Algorithm SHA256 | Select-Object Path, Hash
