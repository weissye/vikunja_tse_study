# הקפאת ראיות Phase 7

הסקריפט בוחר את הריצה canonical החדשה ביותר לכל אחד מה־seeds
`20261701`–`20261704`. הבחירה נעשית לפי תוכן: 16/16, ללא anomalies, ללא
recovery, exit codes אפס, manifest תקין ואותו hash של המודל. ריצות מוקדמות
או כושלות מוחרגות ונרשמות בסיכום.

```powershell
Set-Location "D:\Yeshayahu\Temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Freeze-Vikunja-Phase7-Evidence.ps1"
& ".\scripts\Freeze-Vikunja-Phase7-Evidence.ps1"
```

הצלחה מסתיימת ב־`PHASE7_EVIDENCE_FREEZE_PASS` וב־4/4 Intent ו־Permit schedules.
