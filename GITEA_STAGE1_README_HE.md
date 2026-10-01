# Gitea — שלב 1: סביבה קפואה ומבודדת

שלב זה מתקין מקומית Gitea 1.27.3 עם PostgreSQL באמצעות Docker Compose.
הוא אינו מפעיל את המחולל ואינו מריץ פעולות בדיקה על משאבי Gitea.

## מה השלב מבצע

- מפעיל Compose project נפרד בשם `gitea_stage1`.
- משתמש ב־containers, volumes ופורט נפרדים מ־Vikunja.
- יוצר מנהל bootstrap ללא token ומשתמש מחקר רגיל עם token.
- מייצא את ה־token רק ל־PowerShell הנוכחי כ־`GITEA_API_TOKEN`.
- מוריד את Swagger של ה־instance מ־`/swagger.v1.json`.
- שומר גרסה, image IDs, repository digests, גרסאות Docker ו־SHA-256.
- יוצר ZIP ראיות תחת `evidence` ללא סיסמאות וללא token.

## הרצה ראשונה

יש לחלץ את חבילת ה־delta לשורש:

`C:\work\temp\vikunja_tse_study`

ואז להריץ באותו חלון PowerShell:

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Prepare-Gitea-Stage1.ps1"
Unblock-File ".\scripts\Stop-Gitea-Stage1.ps1"

python ".\tests\test_gitea_stage1_environment.py"

& ".\scripts\Prepare-Gitea-Stage1.ps1" -ResetState
```

הצלחת השלב מסתיימת בסמן:

```text
GITEA_STAGE1_READY
```

הפלט יציג את נתיב המפרט, תיקיית הריצה, ZIP הראיות וה־SHA-256 שלו.

## עצירה ושמירת המצב

```powershell
& ".\scripts\Stop-Gitea-Stage1.ps1"
```

## מחיקה מפורשת של סביבת Gitea בלבד

הפקודה הבאה מוחקת את ה־containers וה־volumes של Stage 1 בלבד:

```powershell
& ".\scripts\Stop-Gitea-Stage1.ps1" -RemoveState
```

אין להריץ אותה אם רוצים לשמור את בסיס הנתונים להמשך.

## גבול מתודולוגי

פרטי Docker, authentication וכתובת השרת הם הגדרות harness. לא הוכנס למחולל
מידע על endpoints, משאבים, שדות או התנהגות של Gitea. קלט ה־API היחיד לשלב הבא
יהיה המפרט שנמשך מה־instance וה־SHA-256 שלו נשמר בראיות.
