# Gitea — שלב 3: Live verified acceptance

שלב 3 מריץ לראשונה את המודל והבדקנים שנוצרו בשלב 2 מול מופע Gitea המקומי.
זהו pilot מבוקר: מטרתו למדוד אילו פעולות ואורקלים ניתנים למימוש בפועל, לא
להכריז שכל 478 הפעולות או כל 181 אורקלי המקביליות הופעלו.

## גבול מתודולוגי

- פעולות, request bodies, קודי תגובה, bindings ואורקלים מגיעים מפלט המחולל.
- פרטי הכתובת והאימות הם תצורת harness בלבד.
- לא נוספו שמות משאבים, כללים עסקיים או payloads ידניים למחולל.
- המקור שנוצר בשלב 2 נשמר ללא שינוי. רק עותק runtime חד-פעמי מאפשר לכל קוד
  HTTP להגיע ל־evaluator החיצוני.
- token אינו נשמר ב־trace, בלוגים או ב־ZIP הראיות.

## הגנה מפני false positives

כל epoch מקבילי כולל sequential control שנוצר מאותו oracle. אם הבקרה הסדרתית
אינה מצליחה או שהערך אינו נשמר במצב, התוצאה המקבילית מסווגת `INCONCLUSIVE`
ולא `VIOLATED`. לכן binding מבני שגוי, הרשאה חסרה או ערך שה־API אינו מקבל אינם
מדווחים אוטומטית כבאג concurrency.

## הרצה

יש להריץ באותו PowerShell שבו `Prepare-Gitea-Stage1.ps1` יצר את
`GITEA_API_TOKEN`. אם נפתח חלון חדש, מריצים שוב את Stage 1 ללא `-ResetState`.

```powershell
Set-Location "C:\work\temp\vikunja_tse_study"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Unblock-File ".\scripts\Invoke-Gitea-Stage3.ps1"
python ".\tests\test_gitea_stage3_live_acceptance.py"

& ".\scripts\Invoke-Gitea-Stage3.ps1"
```

ברירת המחדל בוחרת אוטומטית את תיקיית `generated\gitea-stage2-*` האחרונה.
אפשר לקבע אותה באמצעות `-Generated`.

השלב יוצר:

- `http-trace.jsonl` עם כל בקשות ה־HTTP, ללא Authorization;
- `concurrent-epochs.jsonl` עם זמני barrier, חיבורים וחפיפה;
- `generated-verifier-evaluation.json`;
- `run-metadata.json`, לוגים ו־SHA-256;
- ZIP ראיות תחת `evidence`.

סמני המסירה הם:

```text
GITEA_STAGE3_EVIDENCE_READY
GITEA_STAGE3_COMPLETE
```

ולאחריו אחד מ־`GITEA_STAGE3_PASS`, `GITEA_STAGE3_SEMANTIC_ANOMALY` או
`GITEA_STAGE3_INCONCLUSIVE`.
