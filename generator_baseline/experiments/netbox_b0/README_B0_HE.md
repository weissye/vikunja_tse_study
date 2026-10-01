# NetBox B0 -- נקודת החזרה לפני הקשחה

B0 אינו גרסת artifact חדשה ואינו תוצאת A-2-A סופית. הוא checkpoint הנדסי קטן שמטרתו לשחזר תחילה את נקודת ה-NetBox הקודמת שבה Provengo אישר 5/5 על חמשת ה-witnesses הקצרים, ורק לאחר מכן להאריך/להקשות כל מחלקה בנפרד.

## מה נבדק

- A_LOGIC -- יצירת Device על Site במצב `retired` מתקבלת.
- B_LIFECYCLE -- מחיקה מדווחת 404, אך אותו Site עדיין מוחזר ב-GET.
- C_UNIQUENESS -- שני Sites שונים עם אותו `slug` מתקבלים.
- D_INTEGRITY -- PATCH לסטטוס Circuit מתקבל, אך הערך החדש אינו נשמר.
- E_WORKFLOW -- מעבר ישיר `draft -> archived` מתקבל.

כל מחלקה רצה ב-Provengo run נפרד. האורקל קורא רק `http_trace.jsonl` חיצוני שנאסף דרך `scripts/http_trace_proxy.py`. אין שימוש ב-state פנימי של ה-SUT, אין marker נסתר, ואין stitching בין runs.

## מיקום בעץ הקיים

יש ליצור/להחליף רק את הקבצים הבאים תחת:

`experiments\netbox_b0\`

- `Run-NetBox-B0.ps1`
- `netbox_b0_sut.py`
- `netbox_b0_target.js`
- `evaluate_netbox_b0.py`
- `README_B0_HE.md`
- `SHA256SUMS.txt`

B0 משתמש ב-`scripts\run_flask_sut.py` וב-`scripts\http_trace_proxy.py` שכבר קיימים בארטיפקט; אין להחליף אותם.

## הרצה

משורש האריטפקט:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_b0\Run-NetBox-B0.ps1
```

הצלחה מחייבת בסוף:

`B0 PASS: short A11 checkpoint restored (5/5).`

התוצאות נשמרות כברירת מחדל תחת `results\netbox_b0\b0_<timestamp>\`, עם תיקייה נפרדת לכל מחלקה ו-`B0_SUMMARY.json` אחד.

## מה עושים אחרי PASS

לא משנים את כל חמשת ה-witnesses יחד. מקפיאים את B0 ואז עוברים ל-B1: מקשיחים מחלקה אחת בלבד, מריצים שוב, ומוודאים שהארבע האחרות נשארות 4/4 ושגם המחלקה שהוקשחה עדיין ניתנת לאישור על ידי Provengo. כך אפשר לזהות בדיוק באיזה שינוי נשברה היכולת להגיע לבאג.
