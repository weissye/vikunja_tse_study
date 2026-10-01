# NetBox B1 -- הקשחה ראשונה ומבודדת אחרי B0

B1 הוא checkpoint הנדסי אינקרמנטלי שנבנה ישירות מעל B0 הקפוא. מטרתו היא לשנות **רק משתנה אחד** ולבדוק האם Provengo עדיין מאשר 5/5.

## השינוי היחיד לעומת B0

`A_LOGIC` בלבד מוחלף מה-witness הקצר של B0 (2 פעולות HTTP) ל-witness המינימלי של V35 (5 פעולות HTTP):

1. יצירת Site ראשון.
2. יצירת Site שני.
3. יצירת Device שמצביע ל-Site הראשון.
4. PATCH חוקי שמבקש להעביר את ה-Device ל-Site השני ומקבל 200.
5. GET ל-Device שמראה כי בפועל נשמר הקישור ל-Site הראשון.

זהו כשל של relation reassignment lost.

## מה נשאר זהה ל-B0

- `B_LIFECYCLE` -- 3 פעולות, ללא שינוי.
- `C_UNIQUENESS` -- 2 פעולות, ללא שינוי.
- `D_INTEGRITY` -- 3 פעולות, ללא שינוי.
- `E_WORKFLOW` -- 2 פעולות, ללא שינוי.

גם כללי המדידה נשארים זהים: כל מחלקה בריצת Provengo נפרדת; האורקל קורא רק `http_trace.jsonl`; אין גישה ל-state פנימי; ואין stitching בין runs.

## תכולת B1

הספרייה `experiments/netbox_b0/` נשמרת ללא שינוי לצורכי provenance. B1 נוסף תחת `experiments/netbox_b1/`:

- `Run-NetBox-B1.ps1`
- `netbox_b1_sut.py`
- `netbox_b1_target.js`
- `evaluate_netbox_b1.py`
- `README_B1_HE.md`
- `SHA256SUMS.txt`
- `check_b1_release.py`

## הרצה

משורש ה-artifact:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
powershell -ExecutionPolicy Bypass -File .\experiments\netbox_b1\Run-NetBox-B1.ps1
```

הצלחה מחייבת:

`B1 PASS: A_LOGIC hardened to 5 HTTP operations; B-E retained (5/5).`

התוצאות נשמרות תחת `results\netbox_b1\b1_<timestamp>\` ובסופן `B1_SUMMARY.json`.

## משמעות הניסוי

אם B1 עובר 5/5, אפשר לקבע את A ברמת הקושי החדשה ולעבור ל-B2, שבו מקשיחים מחלקה נוספת בלבד. אם B1 נכשל רק ב-A בעוד B--E נשארות 4/4, נקודת השבירה ממוקמת באופן נקי בהקשחת A.
