Keycloak expanded JSON cleanup v40

Extract this ZIP into C:\work\temp\vikunja_tse_study.
Run Free-Keycloak-Expanded-v40.ps1 from the extracted folder.
The script checks the SHA-256 of each compressed scenario against its audit,
then checks the SHA-256 of its expanded copy. Only a matching expanded copy
is deleted. Logs, audit files, compressed scenarios, and prior runs remain.
The 15 expanded files can be recreated later with expand_15.py.
