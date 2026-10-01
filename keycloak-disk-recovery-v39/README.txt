Keycloak disk recovery v39

Extract into C:\work\temp\vikunja_tse_study.
Run Recover-Keycloak-v37-Disk-v39.ps1.
It queries all 16 generated v37 realms. Only if every realm returns 404,
it removes the orphaned expanded scenario.json from the failed v37 attempt.
It never deletes evidence or compressed scenarios. It prints free disk space,
the largest study files, and Docker disk usage for further targeted cleanup.
Do not start another pilot before reviewing the disk report.
