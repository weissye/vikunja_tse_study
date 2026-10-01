# תיקון inference גנרי למשאבים מקוננים

החבילה מתקנת את יצירת מודל ה־SBT עבור APIs שבהם פעולת היצירה של ישות
נמצאת תחת ישות־אב, למשל `POST /projects/{project}/tasks`.

## השינויים

- זיהוי אוסף מקונן ושיוכו לישות הילד (`tasks`) במקום ל־action של האב.
- התאמת תבניות נתיב גם כששמות הפרמטרים שונים (`{id}` לעומת `{project}`).
- העברת מזהה האב האמיתי לפעולת היצירה של הילד.
- הבחנה בין מזהה ישות הבעלים לבין מזהים נוספים בנתיב association.
- קישור `task` ו־`label_id`/`label` למופעים אמיתיים שנוצרו קודם לכן.

אין בקוד שמות מיוחדים ל־Vikunja או כללי domain ייעודיים למערכת.

## התקנה ב־Windows

מתוך `D:\Yeshayahu\Temp\vikunja_tse_study`, חלץ את ה־ZIP עם שמירת מבנה
התיקיות ואשר החלפה של הקבצים הקיימים. החבילה כוללת רק קבצים ששונו ופלט
חדש תחת `phase1\core-generated-nested-fix`.

## בדיקות שבוצעו

- 72 בדיקות unit עברו.
- בדיקת golden של Todoist לא רצה כי קובץ ה־holdout אינו כלול בעותק המחקר.
- 5 בדיקות integration עברו; 3 בדיקות התלויות ב־Todoist דולגו.
- Vikunja projection: ‏21/21 operations ו־21/21 response codes.
- `node --check` עבר עבור שני קובצי ה־JavaScript.
- סדר יצירה: `labels`, אחריו `projects`, אחריו `tasks`.

## הפלט לשימוש בניסוי

- `phase1\core-generated-nested-fix\interfaces.vikunja.js`
- `phase1\core-generated-nested-fix\stories.vikunja.js`
- `phase1\core-generated-nested-fix\generation_report.json`
- `phase1\core-generated-nested-fix\dependency_graph.json`

ה־base URL בפלט הוא `http://127.0.0.1:3457`, כלומר דרך ה־research proxy.

## הרצת ה־smoke הראשון

החבילה כוללת גם runner ו־evaluator לשלב הבא. לפני ההרצה יש לעצור proxy ישן
שעדיין מאזין בפורט 3457, משום שה־runner מפעיל proxy חדש ושומר trace נפרד.

```powershell
Set-Location "D:\Yeshayahu\Temp\vikunja_tse_study"
$env:VIKUNJA_API_TOKEN = "הטוקן-האמיתי"
& ".\scripts\Invoke-Vikunja-Provengo-Smoke.ps1"
```

ה־token נשאר רק במשתנה הסביבה ואינו נשמר ב־trace או ב־metadata. הצלחת הניסוי
דורשת עדות HTTP חיצונית ליצירת Project, יצירת Task תחת אותו Project, יצירת
Label וחיבור אותו Label לאותו Task. פעולת detach נמדדת בנפרד ואינה תנאי PASS,
מפני שסדר שני סיפורי ה־action המקבילים אינו מוגדר.
