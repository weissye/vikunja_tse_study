# NetBox B2 -- הקשחה שנייה ומבודדת אחרי B1

B2 נבנה ישירות מעל B1 שעבר 5/5. גם כאן משנים **רק מחלקה סמנטית אחת נוספת** כדי לזהות במדויק אם הארכת ה-prefix פוגעת בגילוי.

## השינוי היחיד לעומת B1

`B_LIFECYCLE` מוחלף מה-witness הקצר של B0/B1 (3 פעולות HTTP) ל-witness המינימלי של V35 (5 פעולות HTTP):

1. יצירת Site הורה.
2. יצירת Device ראשון שמצביע ל-Site.
3. יצירת Device שני שמצביע לאותו Site.
4. DELETE של ה-Site שמצליח ב-204.
5. GET של אחד ה-Devices שמראה שהוא עדיין קיים ועדיין מצביע ל-Site שנמחק.

זהו כשל `multi-child lifecycle deletion incomplete`.

## מה נשאר ללא שינוי לעומת B1

- `A_LOGIC` -- נשאר witness של 5 פעולות שכבר עבר ב-B1.
- `C_UNIQUENESS` -- 2 פעולות, witness של B0.
- `D_INTEGRITY` -- 3 פעולות, witness של B0.
- `E_WORKFLOW` -- 2 פעולות, witness של B0.

כללי המדידה נשארים זהים: כל מחלקה בריצת Provengo נפרדת; האורקל קורא רק `http_trace.jsonl`; אין גישה ל-state פנימי; ואין stitching בין runs.

## תכולת B2

B0 ו-B1 נשמרים ללא שינוי לצורכי provenance. B2 נוסף תחת `experiments/netbox_b2/`:

- `Run-NetBox-B2.ps1`
- `netbox_b2_sut.py`
- `netbox_b2_target.js`
- `evaluate_netbox_b2.py`
- `README_B2_HE.md`
- `SHA256SUMS.txt`
- `check_b2_release.py`

## הרצה

משורש ה-artifact:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_b2\Run-NetBox-B2.ps1
```

הצלחה מחייבת:

`B2 PASS: A_LOGIC retained at 5 and B_LIFECYCLE hardened to 5 HTTP operations; C-E retained (5/5).`

התוצאות נשמרות תחת `results\netbox_b2\b2_<timestamp>\` ובסופן `B2_SUMMARY.json`.

## משמעות הניסוי

אם B2 עובר 5/5, אפשר לקבע גם את A וגם את B ברמת הקושי החדשה ולעבור ל-B3, שבו מקשיחים מחלקה נוספת בלבד.
