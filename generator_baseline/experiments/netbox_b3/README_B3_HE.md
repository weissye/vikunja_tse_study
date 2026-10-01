# NetBox B3 -- הקשחת D_INTEGRITY בלבד

B3 נבנה ישירות מעל B2 שעבר 5/5. מטרת checkpoint זה היא לשנות מחלקה סמנטית אחת בלבד ביחס ל-B2.

## למה לא מקשיחים את C ב-B3?

`C_UNIQUENESS` כבר זהה לעומק המינימלי של V35: שתי פעולות HTTP -- יצירת שני Sites שונים עם אותו `slug`. לכן שינוי מלאכותי ב-C היה משנה את הניסוי בלי צורך. B3 משאיר את C בדיוק בעומק 2 ומתקדם למחלקה הבאה שבאמת דורשת הארכה.

## השינוי היחיד לעומת B2

`D_INTEGRITY` עובר מ-witness היסטורי של 3 פעולות ל-witness המינימלי של V35 בן 4 פעולות:

1. POST ל-Circuit עם `description=initial`.
2. PATCH ראשון ל-`description=verified` שמתקבל ונשמר.
3. GET שמאמת חיצונית שהערך `verified` אכן נשמר.
4. PATCH שני לערך שונה (`lost-second-update`) שמחזיר 200, אך התגובה נשארת עם הערך הקודם `verified`.

האורקל מאשר את הבאג רק כאשר יש first update מוצלח, אימות GET חיצוני, ואז second distinct update שאובד. Prefix של 3 פעולות, היעדר GET, עדכון שני לא-שונה או עדכון שני שבאמת נשמר -- כולם נדחים.

## מה נשאר ללא שינוי

- `A_LOGIC` -- 5 פעולות, כפי שעבר ב-B1 וב-B2.
- `B_LIFECYCLE` -- 5 פעולות, כפי שעבר ב-B2.
- `C_UNIQUENESS` -- 2 פעולות; כבר תואם V35.
- `E_WORKFLOW` -- 2 פעולות, witness של B0.

כללי המדידה נשארים זהים: כל מחלקה בריצת Provengo נפרדת, האורקל קורא רק `http_trace.jsonl`, ואין stitching בין runs.

## הרצה

```powershell
Set-ExecutionPolicy -Scope Process Bypass
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_b3\Run-NetBox-B3.ps1
```

הצלחה מלאה מסתיימת ב:

`B3 PASS: A_LOGIC=5 and B_LIFECYCLE=5 retained; C_UNIQUENESS=2 already V35-compliant; D_INTEGRITY hardened to 4; E_WORKFLOW=2 retained (5/5).`

התוצאות נשמרות תחת `results\netbox_b3\b3_<timestamp>\` ובסופן `B3_SUMMARY.json`.
