# Vikunja Phase 2 — validated lifecycle

ה־ZIP הוא עדכון דלתא. יש לחלץ אותו מעל `D:\Yeshayahu\Temp\vikunja_tse_study` תוך שמירת מבנה התיקיות.

## 1. הכנת חלון PowerShell

```powershell
Set-Location "D:\Yeshayahu\Temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Vikunja-ValidatedLifecycle.ps1"
Unblock-File ".\scripts\Invoke-Vikunja-Phase2-ThreeSeeds.ps1"
Unblock-File ".\scripts\Freeze-Vikunja-Phase2-Evidence.ps1"
```

יש לוודא שה־token כבר מוגדר בחלון זה וש־Vikunja פעיל:

```powershell
if ([string]::IsNullOrWhiteSpace($env:VIKUNJA_API_TOKEN)) { "TOKEN MISSING" } else { "TOKEN SET" }
docker compose -f ".\deployment\docker-compose.yml" ps
```

## 2. Pilot: seed יחיד

```powershell
& ".\scripts\Invoke-Vikunja-ValidatedLifecycle.ps1" -Seed 20260930
```

ממשיכים רק אם השורה האחרונה היא:

```text
VIKUNJA_VALIDATED_LIFECYCLE_PASS
```

והקובץ `phase2-evaluation.json` מציג `15/15` ו־`phase2_passed: true`.

## 3. שלושה seeds נוספים

```powershell
& ".\scripts\Invoke-Vikunja-Phase2-ThreeSeeds.ps1"
```

ממשיכים להקפאה רק לאחר:

```text
VIKUNJA_PHASE2_THREE_SEEDS_PASS
```

## 4. הקפאת evidence

יש להעביר לסקריפט את ארבע תיקיות הריצה: ה־pilot ושלוש הריצות מהקמפיין.

```powershell
& ".\scripts\Freeze-Vikunja-Phase2-Evidence.ps1" -RunDirectories @(
  ".\runs\phase2-validated-lifecycle-seed-20260930-YYYYMMDD_HHMMSS_mmm",
  ".\runs\phase2-validated-lifecycle-seed-20260931-YYYYMMDD_HHMMSS_mmm",
  ".\runs\phase2-validated-lifecycle-seed-20260932-YYYYMMDD_HHMMSS_mmm",
  ".\runs\phase2-validated-lifecycle-seed-20260933-YYYYMMDD_HHMMSS_mmm"
)
```

הסקריפט מסרב להקפיא evidence אם אין ארבעה seeds שונים או אם אחת הריצות אינה PASS של 15/15.
