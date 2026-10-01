# ניסוי Vikunja הראשון

## מטרת הניסוי

הניסוי הראשון אינו קמפיין גילוי באגים מלא. מטרתו להוכיח שרשרת מבוקרת:

1. קיבוע מפרט OpenAPI אמיתי של Vikunja.
2. יצירת SBT אוטומטית באמצעות מחולל v38 הקפוא.
3. audit של הישויות, המפתחות והתלויות שנלמדו.
4. הרצת smoke מול Vikunja upstream לא-משונה בחשבון מחקר ייעודי.
5. שמירת trace חיצוני שמאפשר לשחזר ולסווג כל תוצאה.

## המצב שכבר הושג

- מפרט: OpenAPI 3.0.3 של API v2.
- SHA-256: `207ec830ffe3f73be3324dda465a33e1d6ae4afca5b2e4d35e66d2e371e0510d`.
- 141 paths ו-205 operations.
- המחולל ייצג 205/205 operations ו-206/206 response codes.
- קובצי JavaScript עברו `node --check`.
- זוהו 17 משפחות ישויות ו-20 נקודות ambiguity.

הצלחה מבנית אינה עדיין הצלחה סמנטית. בין היתר, זוהתה תלות חשודה
`admin/users.username -> avatar`, וחלק גדול מהפעולות קובץ למשפחות הרחבות
`projects` ו-`tasks`. אין להריץ campaign מדווח לפני audit של graph התלויות.

## פריסה מקומית ראשונה

נדרש Docker Desktop או Docker Engine.

```powershell
cd deployment
Copy-Item .env.example .env
New-Item -ItemType Directory -Force state\db,state\files | Out-Null
docker compose up -d
docker compose logs -f vikunja
```

לאחר שהמערכת זמינה ב-`http://localhost:3456`, יוצרים משתמש מחקר ייעודי
ומפיקים עבורו API token דרך ממשק Vikunja. אין לשמור את ה-token בקובץ או ב-Git.

```powershell
$env:VIKUNJA_API_TOKEN = "<research-token>"
python scripts\vikunja_research_proxy.py `
  --target http://127.0.0.1:3456 `
  --listen-port 3457 `
  --trace runs\smoke-001\http-trace.jsonl
```

המודל שנוצר מכוון ל-`http://127.0.0.1:3457`. ה-proxy מוסיף את `/api/v2`
ואת Bearer token ושומר trace ללא הסוד.

## תנאי מעבר לשלב הבא

- ה-image והגרסה קובעו ונשמרו יחד עם digest.
- בסיס הנתונים ניתן לאיפוס מאותה snapshot.
- לפחות create/read/update/delete אחד פועל עבור Project ו-Task.
- אין שימוש ב-admin, migration, password-reset או email operations בקמפיין הראשון.
- dependency audit אושר והחריגות תועדו כ-overrides כלליים או כמגבלות.
- כל anomaly משוחזר פעמיים ממצב DB נקי לפני סיווגו כבאג.

## SLURM לעומת שרת אינטרנט

SLURM מתאים רק אם האוניברסיטה מאפשרת job ממושך, container או binary, אחסון
מתמשך וכניסת TCP לפורט השירות. אם אין ingress, ניתן עדיין להריץ בו את SUT ואת
ה-tester באותו allocation, אך זה אינו ניסוי דרך אינטרנט ציבורי. מבחינה מחקרית
זה עדיין SUT אמיתי; את ניסוי הרשת ניתן לבצע בהמשך על VPS פרטי.

