# Gitea — שלב 2: תאימות Swagger ו־generation preflight

שלב זה הוא offline ביחס ל־Gitea. הוא משתמש רק במפרט שנשמר בשלב 1 ואינו שולח
בקשות HTTP למערכת.

## תיקון כללי במחולל

המפרט של Gitea 1.27.3 הוא Swagger 2.0. ה־preflight הראשוני גילה שהמחולל קרא את
הנתיבים ואת קודי התגובה, אך לא המיר באופן מלא constructs של Swagger 2.0:

- `definitions`;
- `securityDefinitions`;
- פרמטרים מסוג `in: body` ו־`in: formData`;
- `consumes` ו־`produces`;
- סכמת response הנמצאת ישירות תחת `responses/*/schema`.

התיקון בגרסה 0.25.7 הוא כללי ואינו מכיל שמות של משאבי Gitea או ידע חיצוני על
האפליקציה.

## תוצאת ה־preflight הידועה למפרט הקפוא

- 482 פעולות במפרט;
- 478 פעולות פעילות;
- 4 פעולות deprecated שמוחרגות במכוון;
- 478 contract verifiers;
- 236 mutations;
- 117 state-verified mutations;
- 119 contract-only mutations;
- 181 concurrency oracles;
- 68 concurrency oracles שהם runtime-ready;
- 0 הנחות ידניות.

המספרים יאומתו מחדש מקומית ולא נחשבים קבועים אם SHA-256 של המפרט שונה.

## התקנה והרצה

יש לחלץ את חבילת ה־delta לשורש:

`C:\work\temp\vikunja_tse_study`

ואז להריץ:

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Unblock-File ".\scripts\Invoke-Gitea-Stage2-Preflight.ps1"

python ".\generator_baseline\tests\unit\test_swagger2_normalization.py"
python ".\tests\test_gitea_stage2_preflight.py"

& ".\scripts\Invoke-Gitea-Stage2-Preflight.ps1"
```

הצלחה מסתיימת בשני הסמנים:

```text
GITEA_STAGE2_PREFLIGHT_PASS
GITEA_STAGE2_COMPLETE
```

הפלט כולל נתיב ZIP ראיות ו־SHA-256. אין צורך ב־token בשלב זה, וניתן להריץ אותו
גם לאחר פתיחת PowerShell חדש.
