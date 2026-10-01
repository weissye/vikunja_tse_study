# Gitea Stage 6 — חבילת הרצה מלאה

החבילה מכילה `scripts/stage6.py`, `scripts/Invoke-Gitea-Stage6.ps1`, את מפרט OpenAPI שנשמר ב־Stage 1, ואת הגדרות פרויקט Provengo מבודד. חילוץ לשורש הפרויקט מחליף את גרסת `stage6.py` הישנה בלבד. אין צורך להקליד או לשמור טוקן ידנית.

## הוראות PowerShell מלאות

יש להעתיק את `gitea-stage6-ready.zip` אל `C:\work\temp\vikunja_tse_study`. מתוך אותה תיקייה:

```powershell
Set-Location C:\work\temp\vikunja_tse_study
Expand-Archive .\gitea-stage6-ready.zip -DestinationPath . -Force
Unblock-File .\scripts\Invoke-Gitea-Stage6.ps1
& .\scripts\Invoke-Gitea-Stage6.ps1 -Seed 301 -Seeds 3 -Length 30
```

אין להריץ `Prepare-Gitea-Stage1.ps1 -ResetState` לצורך Stage 6. סקריפט ההרצה קורא את `deployment/gitea_stage1/gitea-stage1-session.json`, בודק את טביעת המפרט ואת זהות המחקר, מאתר את `provengo.bat`, מאמת טוקן קיים או מנפיק טוקן מקומי חדש לאותו משתמש באמצעות `docker exec`, מפעיל את Provengo ואת ניסוי ה־HTTP, ומנקה את הטוקן מסביבת התהליך לאחר ההרצה. הוא אינו מציג את הטוקן ואינו שומר אותו בתוצאות. המכולה `gitea-stage1-server` חייבת להיות פעילה.

אפשר להציג את הסיכום לאחר ההרצה:

```powershell
Get-Content .\runs\gitea-stage6-pilot\summary.json -Raw
```

אם Provengo מותקן בנתיב אחר:

```powershell
& .\scripts\Invoke-Gitea-Stage6.ps1 -ProvengoPath 'C:\Program Files\Provengo\Provengo Cli\provengo.bat' -Seed 301 -Seeds 3 -Length 30
```

אין לשלוח טוקנים בצ'אט או לצרף אותם לראיות. אם מתקבלת שגיאה, מספיק למסור את נוסח השגיאה ואת `summary.json` אם נוצר.

## משמעות התוצאות

המפרט מניב 445 פעולות ו־38 משפחות תלויות מצב. 15 משפחות מתחילות ממשאב repository שניתן ליצור עם משתמש המחקר; שאר המשפחות מופיעות בקטלוג, אך דורשות קדם־תנאים נוספים. Provengo בוחר family, פעולות וסדרתי/מקביל; Python מבצע את התוכנית ושומר `provengo-plan-<seed>.json`, `trial-<seed>.json` ו־`summary.json`. מסלולי request שלא ניתן לקשור לתשובות API, או יצירה שנכשלה, מסווגים כ־blocked.

`5xx`, שינוי זהות או שונות בסטטוס הם מועמדים בלבד. סף שחזור של שלושה seeds מדווח על מועמד חוזר; `confirmed_bugs` נשאר אפס עד אימות בקשה תקינה, תנאי קדם וראיה חיצונית. שדה `overlap` מודד חפיפה בצד הלקוח בלבד. לא הורצה כאן ריצת Gitea החיה ב־Windows, ולכן אין לייחס לחבילה תוצאה מחקרית בטרם תימסר ראיית ריצה.
