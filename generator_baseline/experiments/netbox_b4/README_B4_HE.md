# NetBox B4 -- הקשחת E_REFERENTIAL_INTEGRITY בלבד

B4 נבנה ישירות על B3 שעבר 5/5. השינוי היחיד ביחס ל-B3 הוא המחלקה החמישית: ה-witness ההיסטורי `E_WORKFLOW` בן 2 הפעולות מוחלף ב-`E_REFERENTIAL_INTEGRITY` בהתאם למינימום של V35, בן 4 פעולות HTTP.

המטריצה ב-B4 היא:

- `A_LOGIC = 5` -- נשמר ללא שינוי מ-B1.
- `B_LIFECYCLE = 5` -- נשמר ללא שינוי מ-B2.
- `C_UNIQUENESS = 2` -- כבר תואם V35 ונשמר ללא שינוי.
- `D_INTEGRITY = 4` -- נשמר ללא שינוי מ-B3.
- `E_REFERENTIAL_INTEGRITY = 4` -- השינוי היחיד ב-B4.

## ה-witness החדש של E

1. יצירת Site תקין.
2. יצירת Device תקין שמפנה ל-Site.
3. מחיקת ה-Site בהצלחה (`204`).
4. יצירת Device חדש עם אותו מזהה Site שנמחק; אם היצירה מצליחה והתגובה מחזירה את ההפניה ל-Site שנמחק, התקלה מאושרת.

ה-evaluator הוא sequence-local, מסתמך רק על trace חיצוני של HTTP, ואינו מחבר ראיות בין ריצות. הוא גם דורש היסטוריית parent-child תקינה לפני המחיקה; reference שרירותי ל-parent לא קיים אינו מספיק.

## הרצה

```powershell
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_b4\Run-NetBox-B4.ps1
```

תוצאת הצלחה צפויה:

`B4 PASS: A_LOGIC=5, B_LIFECYCLE=5, C_UNIQUENESS=2, D_INTEGRITY=4 retained; E_REFERENTIAL_INTEGRITY hardened to 4 (5/5).`

B4 הוא checkpoint הנדסי מבודד. הוא משלים את מטריצת עומקי ה-witness המינימליים של V35, אך אינו כשלעצמו תוצאת קמפיין A2A סופי.
