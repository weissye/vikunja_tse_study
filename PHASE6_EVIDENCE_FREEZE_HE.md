# הקפאת ראיות Phase 6 v2

הסקריפט בוחר את שלוש הרצות הקמפיין `phase6-bug-search-20260920_165133`
עבור ה־seeds `20261502`, `20262503`, ו־`20263504`.

הוא מאמת בכל run:

- פרופיל `interleaved-relational-exploration`;
- תוצאה `13/13` ללא anomalies;
- השלמת Provengo, ה־probe וה־evaluator בהצלחה;
- תקינות manifest המקור;
- אותו OpenAPI ואותו מודל בכל ההרצות;
- שלושה Intent schedules ושלושה Permit schedules שונים.

החבילה כוללת raw traces, logs, evaluations, probes, המודל שנוצר וכלי השחזור.
מסדי הנתונים הפנימיים והניתנים לבנייה מחדש של Provengo אינם נכללים.

```powershell
Set-Location "D:\Yeshayahu\Temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Freeze-Vikunja-Phase6-Exploration-Evidence.ps1"
& ".\scripts\Freeze-Vikunja-Phase6-Exploration-Evidence.ps1"
```

הצלחה מסתיימת ב־`PHASE6_EXPLORATION_EVIDENCE_FREEZE_PASS`.
