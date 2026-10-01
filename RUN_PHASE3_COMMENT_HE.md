# Phase 3A — Vikunja Comment Lifecycle Pilot

חלץ את ה־ZIP מעל `D:\Yeshayahu\Temp\vikunja_tse_study` ושמור את מבנה התיקיות.

ה־profile החדש נגזר מבנית מה־OpenAPI ומריץ:

`Project create/read → Task create/read → Comment create/read/list/update/read/delete/list → Task delete → Project delete`.

## הרצה

```powershell
Set-Location "D:\Yeshayahu\Temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Vikunja-Comment-Lifecycle.ps1"

if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)) {
    "TOKEN MISSING"
} else {
    "TOKEN SET"
}

& ".\scripts\Invoke-Vikunja-Comment-Lifecycle.ps1" -Seed 20261001
```

הצלחה מלאה מסתיימת ב־:

```text
VIKUNJA_COMMENT_LIFECYCLE_PASS
```

וב־`phase3-comment-evaluation.json` צריכים להופיע `15/15` ו־`phase3_pilot_passed: true`.

אין להריץ עדיין קמפיין מרובה seeds. תחילה יש לבדוק את ה־pilot ואת ה־trace המלא.
