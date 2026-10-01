# שלב 6.12 — ניסוי מקביליות מבודד אחרי קידומת

## מטרה ותיחום

בריצת 6.10 `orgEdit.full_name` סומן תחילה כחריגה, אך סיפור אחר כתב לאותו
ארגון לפני קריאת התצפית; 6.11 סיווג את העדות כלא מכריעה. שלב 6.12 יוצר
משאב **חדש לכל תרחיש ולכל ניסיון**, מפעיל ארבעה סבבי קידומת מאומתים ב־GET,
שתי כתיבות בקרה טוריות, איפוס מאומת, שתי כתיבות על חיבורים נפרדים דרך
מתאם ה־barrier הקיים, ולאחר ה־join והמתנת quiescence מבצע GET עצמאי מיד.

הבדיקות: `org.full_name`, `oauth.name`, `oauth.confidential_client`,
`oauth.skip_secondary_authorization`. לכל ניסיון ארבעה תרחישים נפרדים.
זהו ניסוי **ממוקד שמצהיר על בחירת הפעולות והשדות**, המשך למנגנון של 6.6
ולבקרות 6.8; הוא אינו משנה את הגנרטור הכללי ואינו נספר ככיסוי שנוצר
אוטומטית מתוך OpenAPI. המפרט הקפוא נבדק לפני כל הרצה.

## קבצים והנחתם

פרוס את ה־ZIP בשורש `C:\work\temp\vikunja_tse_study`. ב־ZIP:

* `scripts/Invoke-Gitea-Stage6_12-Isolated.ps1` — סקריפט PowerShell,
  לפי תבנית 6.6; משתמש ב־`GITEA_API_TOKEN` שהוכן בשלב 1.
* `scripts/run_gitea_stage6_12_isolated.py` — שימוש ישיר ב־proxy ובמתאם
  `openapi_to_sbt` שכבר קיימים ב־`generator_baseline`. מבצע אימותי
  HTTP, חפיפה וזמני בקשות, בודק שלא התערבה כתיבה לנתיב המשאב, ומקפיא
  trace, epochs, summary, checksums ו־ZIP. מזמן את הסניטייזר הקיים של
  Stage 3 לפני הקפאת ראיות OAuth; כישלון הסניטייזר עוצר את ההקפאה.

נדרשים קובצי `generator_baseline` ו־`scripts/redact_gitea_stage3_evidence.py`
שכבר קיימים אצלך משלב 6.9. אין תלות בבדיקת הטביעה של 6.11.

## לפני ההרצה: מקום בדיסק

לפי צילום WizTree נותרו כ־213MB בכונן C:. פנה מקום לפני הרצת Gitea. קובצי
`runs-db.db` הישנים תופסים ג'יגה־בייטים רבים; ZIP הראיות אינו כולל אותם,
לכן העבר את בסיס הנתונים הישן לכונן אחר אם חשוב לשמר replay פנימי של
Provengo, או מחק רק בסיס נתונים של ריצה שכבר אינך צריך. השאר את תיקיות
`evidence`, את קובצי ה־HTTP, ואת ריצת 6.10 לבדיקה חוזרת.

## פקודות מדויקות

שמור את ה־ZIP שהורדת, למשל בתיקיית Downloads. ב־PowerShell:

```powershell
cd C:\work\temp\vikunja_tse_study
$package = Join-Path $env:USERPROFILE 'Downloads\gitea-stage6_12-isolated.zip'
if (-not (Test-Path -LiteralPath $package)) { throw "Find downloaded ZIP and set `$package to its actual full path" }
Expand-Archive -LiteralPath $package -DestinationPath . -Force
& .\scripts\Prepare-Gitea-Stage1.ps1 -ResetState
& .\scripts\Invoke-Gitea-Stage6_12-Isolated.ps1 -Trials 5 -PrefixRounds 4 -FreezeEvidence
```

אם הדפדפן שמר את ה־ZIP במקום אחר, שנה **רק** את הערך של `$package` לנתיב
שנמצא בפועל. הרץ את שתי הפקודות האחרונות באותו חלון: שלב 1 מגדיר בו
משתני סביבה. `-ResetState` מוחק את נתוני סביבת Gitea Stage 1 המבודדת,
ולא מוחק את התיקיות `runs`/`evidence` שעל הדיסק. הרצת 5 ניסיונות משמעה
20 תרחישים, כל אחד עם משאב חדש. ניתן להתחיל ב־`-Trials 1` כדי לחסוך מקום.

## פירוש הפלט

* `PASS`: בקרה ואיפוס תקינים, שתי בקשות HTTP מתועדות הצליחו, החיבור
  באמת חפף, לא נצפתה כתיבה זרה למשאב, והערך שנקרא מתאים לאחת הכתיבות.
* `INCONCLUSIVE`: תנאי מן התנאים לעיל חסר, כולל 422, כשל הקידומת, אי־חפיפה
  או כתיבה מתערבת; אין להסיק מכך באג.
* `SEMANTIC_CANDIDATE`: שתי הבקשות הצליחו וחפפו, אבל GET נקי החזיר ערך
  שאינו אחד משני ערכי הכתיבה. העלה את ZIP הראיות לבדיקה ידנית של סיבתיות,
  תגובות וקידומת לפני שמכריזים על באג.

## בדיקות מקומיות לפני מסירה

סקריפט Python עבר קומפילציה. בהרצת אינטגרציה מול שרת דמה מקומי עם השהיה
מכוונת ליצירת חפיפה, כל ארבעת התרחישים בניסיון אחד החזירו `PASS`;
נבדקו הקפאת ZIP והסרת ערכי `client_secret`. ניסוי חי מול Gitea דורש
הרצה בסביבת Windows שלך.
