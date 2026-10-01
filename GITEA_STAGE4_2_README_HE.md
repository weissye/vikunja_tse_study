# Gitea Stage 4.2 — תיקון identity ranking ורוויה

ניתוח Stage 4.1 הראה שה־concurrency עצמו פעל: נרשמו 18 epochs, בכולם היה
overlap אמיתי, ו־release skew היה קטן ממילישנייה. עם זאת, כל הפעולות נשלחו
לנתיב repository שגוי כגון `/repos/{owner}/12` ולכן קיבלו 404.

הסיבה הייתה כלל גנרי חלש שבחר `id` מספרי עבור פרמטר path סמנטי מסוג string,
גם כאשר תגובת OpenAPI תיעדה `name` מסוג string. גרסה 0.26.2 מדרגת מועמדים לפי:

1. התאמת טיפוס לפרמטר הנתיב;
2. תפקידי זהות `name`, `slug`, `key`, ורק אחריהם `id`;
3. fallback להמרת primitive רק כאשר אין התאמה חזקה יותר.

בנוסף, campaign אינו רשאי עוד להפסיק בגלל רוויה לפני שהושגו גם מספר ה־oracles
וגם מספר משפחות ה־producer שנדרשו. אם הספים לא הושגו, הוא משלים את כל `Runs`.

## הרצה

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# אם הטוקן אינו קיים בחלון הנוכחי:
& ".\scripts\Prepare-Gitea-Stage1.ps1"

Unblock-File ".\scripts\Invoke-Gitea-Stage4_2.ps1"

& ".\scripts\Invoke-Gitea-Stage4_2.ps1" `
  -Runs 5 `
  -BaseSeed 20260940 `
  -SaturationRuns 2 `
  -MinimumUniqueOracles 7 `
  -MinimumProducerFamilies 2
```

הסמן הסופי הצפוי הוא `GITEA_STAGE4_2_COMPLETE`.
