[CmdletBinding()]
param(
  [string]$Root = ""
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($Root)) {
  $Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
} else {
  $Root = (Resolve-Path $Root).Path
}

$files = Get-ChildItem -Path $Root -Filter "*.ps1" -Recurse -File
$failed = $false
foreach ($file in $files) {
  $tokens = $null
  $parseErrors = $null
  [System.Management.Automation.Language.Parser]::ParseFile(
    $file.FullName,
    [ref]$tokens,
    [ref]$parseErrors
  ) | Out-Null

  if ($parseErrors -and $parseErrors.Count -gt 0) {
    $failed = $true
    Write-Host "POWERSHELL SYNTAX FAIL: $($file.FullName)"
    foreach ($err in $parseErrors) {
      Write-Host "  line $($err.Extent.StartLineNumber), col $($err.Extent.StartColumnNumber): $($err.Message)"
    }
  }
}

if ($failed) {
  throw "PowerShell syntax validation failed."
}

Write-Host "V36 POWERSHELL SYNTAX: PASS ($($files.Count) .ps1 files parsed)"
