# שלב 6.11 — תיקון פרשנות התצפית בבדיקות מקביליות

## מה מודדים ולמה

בריצת 6.10 התקבל `VIOLATED` יחיד ב־`generated-epoch-6` על `orgEdit.full_name`.
שתי פעולות PATCH מקבילות החזירו 200; קריאת GET נפרדת מיד לאחריהן כבר הציגה
את אחד משני הערכים. לפני קריאת GET המזוהה עם ה־epoch ביצע סיפור אחר PATCH
מוצלח על אותו ארגון ועל אותו שדה (`http-trace.jsonl`, אירוע 195). הקריאה
המזוהה עם ה־epoch (אירוע 226) ראתה את הערך החדש של אותו סיפור. מכאן אין
ראיה לתוצאת מקביליות לא ליניארית בריצה זו.

## הקובץ המתוקן

יש לפרוס את ה־ZIP בשורש `C:\work\temp\vikunja_tse_study`, אחרי 6.10:

* `generator_baseline/openapi_to_sbt/evaluate_verifiers.py` — מחליף את הבודק
  הקיים. לפני הכרעת ערך סופי, מחפש בתיעוד HTTP פעולת POST/PUT/PATCH/DELETE
  אחרת *לאותו נתיב משאב* בין הפעולה המקבילה הראשונה לבין קריאת GET של
  ה־epoch. אם נמצאה כתיבה מתערבת, מחזיר `INCONCLUSIVE` עם
  `same-resource-mutation-before-observation` ומונה את האירועים שגרמו לכך.
  ננקט כלל שמרני ללא ידע יישומי: גם בקשה שנדחתה עשויה להותיר ספק לגבי
  התצפית. כאשר אין כתיבה כזו, כללי האורקל המקוריים נשארים בתוקף.

החבילה אינה משנה את הבקשות, ה־barrier, הגנרטור או ראיות העבר. הפקת ZIP
ראיות חדשה תשתמש במעריך המתוקן, אבל ZIP קודם נשאר כפי שנחתם במקור.

## הרצה א: הערכה חוזרת של הראיות הקיימות — אינה פונה לשרת

```powershell
cd C:\work\temp\vikunja_tse_study
Expand-Archive -LiteralPath C:\path\to\gitea-stage6_11-evaluator.zip -DestinationPath . -Force

$replay = '.\runs\gitea-stage6_11-replay-133527_367'
New-Item -ItemType Directory -Path $replay -Force | Out-Null
Expand-Archive -LiteralPath '.\evidence\gitea-stage3-live-acceptance-20260924_133527_367-review.zip' -DestinationPath $replay -Force
& python .\generator_baseline\openapi_to_sbt\evaluate_verifiers.py `
    --trace (Join-Path $replay 'http-trace.jsonl') `
    --manifest (Join-Path $replay 'verification-manifest.gitea.json') `
    --output (Join-Path $replay 'stage6_11-reevaluation.json')
```

החלף את נתיב ה־ZIP בנתיב ההורדה בפועל. `CONTRACT_DEVIATION` וקוד יציאה 2
הם התוצאה הצפויה בהערכה החוזרת: `repoCreateTag` עדיין החזיר 201 שאינו
מתועד. זה אינו כשל של פעולת ההערכה החוזרת. ב־JSON החדש צפויה שכבת
`concurrency` עם 37 `PASS`, אפס `VIOLATED` ועשרה `INCONCLUSIVE`; שלושת
ניסויי OAuth נשארים `PASS`. שמור גם את ZIP הראיות המקורי ללא שינוי.

## הרצה ב: ניסוי חי נוסף, אחרי בדיקת ההערכה החוזרת

```powershell
& .\scripts\Prepare-Gitea-Stage1.ps1 -ResetState
& .\scripts\Invoke-Gitea-Stage6-Generated.ps1 `
    -Runs 1 `
    -BaseSeed 20261005 `
    -MaxLength 120000 `
    -InstancesPerEntity 2 `
    -InstancesPerAction 1
```

הרץ את שתי הפקודות באותו חלון PowerShell. `-ResetState` מאפס רק את נתוני
סביבת Gitea Stage 1 המבודדת; תיקיות `runs` ו־`evidence` קיימות נשמרות.
התוצאה החיה אינה מובטחת להיות זהה: אופן השילוב של הסיפורים יכול להשתנות.
אל תציג `INCONCLUSIVE` כ־`PASS`, או את 201 המתועד חלקית כבאג סמנטי.

## בדיקות שבוצעו לפני האריזה

הערכה חוזרת של 689 אירועי ה־HTTP מהראיות שסופקו שינתה עדות אחת בלבד:
`generated-epoch-6` מ־`VIOLATED` ל־`INCONCLUSIVE`, בצירוף אינדקסים
`[194,195,199,201,203,223]`. סטטוס הריצה עבר מ־`SEMANTIC_ANOMALY`
ל־`CONTRACT_DEVIATION`; יתר 46 ההכרעות המקבילות נשמרו, ובפרט שלושת
ה־PASS של OAuth. בדיקת נגד שבה הוסרו מהעתק זמני הכתיבות המתערבות אישרה
שהבודק עדיין מפיק `VIOLATED` כאשר תצפית שונה משני ערכי העדכון ללא
כתיבה מתערבת. לא בוצעה כאן ריצה חיה נוספת.
