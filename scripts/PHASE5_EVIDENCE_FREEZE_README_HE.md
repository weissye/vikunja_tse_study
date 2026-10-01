# הקפאת ראיות — Phase 5

החבילה אוספת את ארבע הרצות ה־PASS של הפרופיל
`interleaved-relational-lifecycle`, מאמתת את קובצי הראיות ואת ה־SHA-256,
ומשווה את רצפי אירועי `Intent:*`. גיוון בין לוחות הזמנים מתועד כתוצאה,
אך אינו תנאי להקפאת ארבע הרצות PASS תקינות.

מתוך PowerShell, בשורש `D:\Yeshayahu\Temp\vikunja_tse_study`:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Freeze-Vikunja-Phase5-Interleaved-BP-Evidence.ps1"
& ".\scripts\Freeze-Vikunja-Phase5-Interleaved-BP-Evidence.ps1"
```

הצלחה מסתיימת ב־`PHASE5_INTERLEAVED_BP_EVIDENCE_FREEZE_PASS` ומדפיסה
את נתיב תיקיית הראיות, נתיב קובץ ה־ZIP וה־SHA-256 שלו.

הקפאה זו מתעדת stabilization: ארבע הרצות תקינות וללא anomaly. היא אינה
טוענת שנמצא באג אמיתי.
