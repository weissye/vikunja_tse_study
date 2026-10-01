# Gitea Stage 5 — אישור מועמדים בכמה prefixes עצמאיים

Stage 5 אינו מקודד שמות פעולות או כללים של Gitea. בכל ריצה הוא מייצר מודל חדש
מאותו OpenAPI, מריץ prefix עצמאי, וקורא את ה־witnesses של הבדקן הגנרי.

המסנן שומר רק אותות חזקים:

- תגובת 2xx שאינה מתועדת בחוזה;
- תגובת 5xx שאינה מתועדת בחוזה.

תגובות 4xx נשארות בראיות המקוריות אך אינן מקודמות אוטומטית. מועמד חייב להופיע
במספר ריצות עצמאיות כדי לקבל אישור. 5xx חוזר נשאר
`REPRODUCIBLE_SERVER_FAILURE_CANDIDATE` ולא מוכרז כבאג מוצר עד שתנאי־הקדם
הסמנטיים שלו הוכחו.

## הרצה

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# אם הטוקן אינו קיים בחלון הנוכחי:
& ".\scripts\Prepare-Gitea-Stage1.ps1"

Unblock-File ".\scripts\Invoke-Gitea-Stage5.ps1"

& ".\scripts\Invoke-Gitea-Stage5.ps1" `
  -Runs 5 `
  -BaseSeed 20260960 `
  -MinimumIndependentRuns 3
```

הסמן הסופי הוא `GITEA_STAGE5_COMPLETE`. חבילת הראיות כוללת summary, טבלת
מועמדים, אינדקס ריצות ולוג container.
