# Phase 6 — חיפוש באגים באמצעות SBT/BP

זהו קמפיין חיפוש ראשון, לא מבחן עומס רגיל. עבור כל גודל נוצר מחדש מודל
SBT מן ה־OpenAPI בפרופיל `interleaved-relational-exploration`. המודל מכיל סיפורי
CRUD וקשרים עצמאיים, תלויות `waitFor`, אילוצי `block`, ו־Provengo בוחר את סדר
אירועי ה־BP לפי seed.

חמישה choosers מבקשים בו־זמנית מערכי אירועי `Permit:*` חוקיים עבור יצירת
משימות, יצירת קשרים, מחיקת קשרים, עדכוני משימות ומחיקת משימות. בחירת Provengo
נמדדת ונשמרת ב־`schedule-comparison.json`; כך PASS חוזר אינו מוצג בטעות ככיסוי
של schedules שונים.

הקמפיין מריץ 15 תצורות: 3 גדלים (8, 12 ו־16 tasks) כפול 5 seeds. כך משתנים גם
עומק השרשרת וגם סדר ה־interleaving, בלי להחליף את החוזה ובלי לכתוב תרחיש HTTP
קשיח.

האורקלים החיצוניים מחפשים אובדן קשר לאחר update, unlink שלא נשמר, relation
שאינו נראה משני הצדדים, מחיקה שאינה נצפית, וקשרים תלויים לאחר cleanup.
כשל תשתיתי או כשל ביצוע נשמר לניתוח אך אינו מסומן כבאג מוצר. רק הפרה סמנטית
שניתנת לשחזור מסווגת `semantic_bug_candidate`.

הרצה משורש הפרויקט:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Vikunja-Bug-Search-Campaign.ps1"
& ".\scripts\Invoke-Vikunja-Bug-Search-Campaign.ps1"
```

מומלץ להתחיל בפיילוט קצר לפני הקמפיין המלא:

```powershell
& ".\scripts\Invoke-Vikunja-Bug-Search-Campaign.ps1" `
    -TaskCounts @(12) -Seeds @(20261401)
```
