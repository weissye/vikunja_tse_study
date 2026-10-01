# שלב 6.10: בקשות PATCH תקינות בבדיקות מקביליות OAuth

## למה מריצים את השלב

בריצת 6.9 עם seed ‏20261005 נרשמו 47 epochs עם חפיפה אמיתית, אבל בשלושת
ה־epochs של `userUpdateOAuth2Application` שתי בקשות ה־PATCH בכל epoch החזירו
422. בבקרת 6.8, PATCH חלקי נכשל באותו אופן, בעוד PATCH שכלל גם את `name` וגם
את `redirect_uris` שהתקבלו ב־GET הצליח ושמר את השינוי. לכן שלושת ה־epochs
לא סיפקו עדיין עדות להפרה סמנטית; חסר להם קלט תקין שנבדק בנפרד.

## מה בדיוק משתנה

יש לפרוס את ה־ZIP בשורש `C:\work\temp\vikunja_tse_study`, מעל שלב 6.9:

* `generator_baseline/openapi_to_sbt/verification.py` — כשבקשת היצירה, בקשת
  העדכון ותגובת GET מתעדות שדה שם ושדה רשימת redirect URIs בטיפוסים
  תואמים, רושם בתוכנית המקביליות שיש לשאת אותם מגוף ה־GET. הבחירה נסמכת על
  התיאורים והשדות במפרט ואינה מכילה מזהה פעולה או כתובת שירות מקודדים.
* `generator_baseline/openapi_to_sbt/render/verification_js.py` — בבדיקות
  PATCH שנבחרו מרכיב כל בקשת בקרה וכל בקשת epoch משני השדות שנקראו מ־GET,
  ועליהם מחיל את הערך החדש של השדה הנבדק. גם בקשת האיפוס משתמשת בשדות
  מה־GET. אם שדה נשיאה אינו זמין, הבדיקה נסגרת בלי לשלוח בקשות ניסוי
  שגויות; אין לספור אותה כהצלחה.

לא שונו תנאי האורקל, מדידת החפיפה, מנגנון ה־barrier, או סקריפט ההרצה.
מספר האורקלים נשאר 181, מהם 74 מוכנים בזמן ריצה. שלב 6.9 נדרש מראש;
ה־ZIP הזה אינו כולל את התיקונים המצטברים הקודמים של סיפורים ותיעוד ראיות.

## הוראות הרצה ב־PowerShell

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath C:\path\to\gitea-stage6_10-patch.zip -DestinationPath . -Force
& .\scripts\Prepare-Gitea-Stage1.ps1 -ResetState
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
    -Runs 1 `
    -BaseSeed 20261005 `
    -MaxLength 120000 `
    -InstancesPerEntity 2 `
    -InstancesPerAction 1
```

החלף את `C:\path\to\...` במיקום שבו שמרת את ה־ZIP. יש להריץ את שתי
הפקודות האחרונות באותו חלון PowerShell: הכנת Stage 1 מגדירה בו משתני
סביבה. `-ResetState` מוחק את הנתונים של סביבת Gitea Stage 1 המבודדת;
קובצי `runs` ו־`evidence` שכבר קיימים נשארים בדיסק.

## מה לבדוק אחרי הריצה

בתיקיית ה־run של Stage 3 או ב־ZIP הראיות, חפש את שלושת ה־epochs של
`userUpdateOAuth2Application`: `confidential_client`, `name`,
`skip_secondary_authorization`. ודא ששתי בקשות ה־PATCH בכל אחת החזירו קוד
הצלחה מתועד, שהייתה חפיפה בפועל ושקריאת GET שאחריהן הצליחה. בקשת בקרה
טורית ואיפוס צריכים גם הם להצליח. רק אז אפשר לפרש את הכרעת השכבות
`State` ו־`Concurrency`; 422 חוזר מעיד שהקדם לא הושג, ולא על באג מקביליות.
חריגת החוזה של `repoCreateTag` (201 שאינו מתועד) היא נושא נפרד.

## בדיקות הכנה

על Swagger הקפוא מאותו פרויקט, ההפקה המקומית הצליחה: 478 פעולות,
181 אורקלי מקביליות, והבדל תוכנית רק בשלושת האורקלים שתוארו. ה־JavaScript
שנוצר עבר `node --check`. לא בוצעה כאן הרצה חיה מול Gitea של המשתמש.
