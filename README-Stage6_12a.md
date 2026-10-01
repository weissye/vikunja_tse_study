# Stage 6.12a: תיקון קלט יצירת ארגון

בריצת 6.12 הראשונה שלושת תרחישי OAuth עברו. התרחיש `org.full_name`
נעצר לפני בדיקת המקביליות: יצירת הארגון החזירה 422. שם המשתמש שנשלח
נבנה מתווית ארוכה שכללה גם את שם התרחיש (`org_full_name`), והגיע ל־44
תווים עם `_`. המפרט הקפוא אינו מציין מגבלת אורך מפורשת, ולכן זהו חשד
לקדם חסר בבקשת היצירה, ולא ממצא סמנטי.

החבילה מחליפה קובץ אחד בלבד בעץ הקיים:
`scripts/run_gitea_stage6_12_isolated.py`. שם המשתמש ליצירה קצר כעת,
ייחודי לריצה ולניסיון, ומכיל רק אותיות, ספרות ומקפים. אם תחזור תשובת
שגיאה, הסקריפט יציג גם את `message` המקוצר מתגובת יצירת הארגון כדי
לאפשר אבחון; תגובות OAuth עם סודות עדיין עוברות סניטיזציה לפני הקפאה.
סקריפט PowerShell, הגנרטור ותנאי ההכרעה לא שונו.

לא נדרש איפוס סביבת Stage 1 בין הריצה הקודמת להרצה חוזרת **באותו חלון
PowerShell**, משום ששם המשאב החדש כולל חותמת זמן חדשה. אם החלון נסגר,
הרץ קודם `Prepare-Gitea-Stage1.ps1` לקבלת משתני הסביבה באותו חלון.

```powershell
cd C:\work\temp\vikunja_tse_study
$package = Get-ChildItem "$env:USERPROFILE\Downloads" -Filter 'gitea-stage6_12a-org-create-fix*.zip' |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $package) { throw 'Save the Stage 6.12a ZIP to Downloads first' }
Expand-Archive -LiteralPath $package.FullName -DestinationPath . -Force
& .\scripts\Invoke-Gitea-Stage6_12-Isolated.ps1 -Trials 1 -PrefixRounds 4 -FreezeEvidence
```

בדיקת הקוד וההרצה המקומית מול שרת דמה אינן מוכיחות איזה תנאי ב־Gitea
גרם ל־422. ב־ZIP הראיות החדש יש לבדוק שתשובת יצירת הארגון היא 201,
שנרשם epoch עם חפיפה, ושאחרי שני PATCH מוצלח GET מחזיר ערך חוקי.
