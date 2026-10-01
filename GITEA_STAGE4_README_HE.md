# Gitea Stage 4 — הרחבת reachability וקמפיין רב־זרעי

Stage 4 מתקן פער כללי במחולל: פעולת יצירה שהופקה כסיפור standalone/action
פרסמה אירוע `Done`, אך לא בהכרח את `InstanceReady` שעליו ממתינות פעולות המשך.
המחולל 0.26.0 מוסיף bridge שנגזר רק מן OpenAPI וממפת ה־path bindings.

הקמפיין מריץ כמה זרעים, מחדש גם את ערכי הקלט בכל זרע, צובר oracle IDs ייחודיים,
ומפסיק אחרי רוויה מוגדרת. אין בו שמות משאבים או כללים עסקיים של Gitea.

## הרצה

יש להריץ באותו חלון PowerShell שבו בוצע `Prepare-Gitea-Stage1.ps1`:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Unblock-File ".\scripts\Invoke-Gitea-Stage4.ps1"
& ".\scripts\Invoke-Gitea-Stage4.ps1" `
  -Runs 5 `
  -BaseSeed 20260940 `
  -SaturationRuns 2 `
  -MinimumUniqueOracles 7 `
  -MinimumProducerFamilies 2
```

במהלך הקמפיין המסך מציג שורת סיכום אחת לכל זרע. הלוגים המלאים נשמרים תחת
`runs`, וכל הרצה שומרת evidence עצמאי. בסוף מתקבלת חבילת campaign קטנה תחת
`evidence` ובה summary, טבלת epochs ואינדקס לחבילות ההרצה.

`PASS` דורש כברירת מחדל לפחות שבעה oracles ייחודיים ולפחות שני producers;
כלומר התקדמות מעבר לששת תרחישי repository שנצפו ב־Stage 3.2.
