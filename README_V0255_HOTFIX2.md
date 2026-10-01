# Version 0.25.5 Hotfix 2

Fixes the Windows-native argument quoting failure in the direct Vikunja 304
confirmation. PowerShell removed JSON property quotes before invoking Python,
causing `JSONDecodeError`. The wrapper now writes the create body to a UTF-8
JSON file and passes its path. The Python confirmation tool accepts the file
with BOM-safe decoding.

Install over 0.25.5 Hotfix 1 and rerun only
`Confirm-Vikunja-Patch304Candidate.ps1`. The current token is already valid;
do not prepare or reset Vikunja again.

