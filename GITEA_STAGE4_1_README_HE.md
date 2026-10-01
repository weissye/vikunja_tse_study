# Gitea Stage 4.1 — תיקון סמנטי גנרי

Stage 4.1 מתקן שלושה מקורות כלליים ל־false positive בלי להוסיף ידע על Gitea:

1. קישור זהות לנתיב משתמש גם במטא־דאטה מתועד של סכמת OpenAPI, כגון
   `title` או `x-go-name`, לפני fallback כללי ל־`id`.
2. בדיקת התמדה משווה את מצב ה־GET המאוחר לערך שהשרת אישר בתגובת המוטציה.
   אם השרת ביצע canonicalization לערך חוקי והתמיד אותו, התוצאה היא
   `INCONCLUSIVE` עם `persistence_result=PASS`, ולא חריגת מצב שגויה.
3. מחולל הערכים מכבד פורמטים ואילוצי אורך נפוצים של OpenAPI.

המחולל הוא גרסה `0.26.1`. אין בקוד שמות משאבים, שדות או כללים עסקיים של
Gitea. התאימות נבדקה מול Library, Garage, Pharmacy, NetBox, Todoist ו־Vikunja;
בכולן נשמרו בדיוק ספירות הכיסוי של גרסת הבסיס.

## הרצה

באותו חלון PowerShell שבו הוגדר `GITEA_API_TOKEN`:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Gitea-Stage4_1.ps1"

& ".\scripts\Invoke-Gitea-Stage4_1.ps1" `
  -Runs 5 `
  -BaseSeed 20260950 `
  -SaturationRuns 2 `
  -MinimumUniqueOracles 7 `
  -MinimumProducerFamilies 2
```

הסמן הסופי הצפוי הוא `GITEA_STAGE4_1_COMPLETE`. הקמפיין שומר evidence לכל
הרצה וחבילת campaign מסכמת תחת `evidence`.

## לאחר Stage 4.1

השלב הבא הוא confirmation campaign גנרי למועמדים שכבר נצפו:

- קיבוץ חריגות לפי operation, status וחתימת בקשה;
- הרצה חוזרת ישירה עם קלט שעובר את אילוצי OpenAPI;
- sequential control שבודק גם התמדה במצב;
- סיווג `CONFIRMED`, `NOT_REPRODUCED` או `INCONCLUSIVE`;
- הרחבת coverage-guided scheduling אל oracles שטרם הורצו, במקום להסתפק
  בעוד זרעים אקראיים שכבר הגיעו לרוויה.
