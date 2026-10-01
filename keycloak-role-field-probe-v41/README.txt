Keycloak role field probe v41

Extract to C:\work\temp\vikunja_tse_study and run Run-Keycloak-Role-Field-Probe-v41.ps1.
Creates one temporary realm, one client, and two roles. Checks whether full
PUTs on each role accept independent description and attributes changes while
keeping the role name stable. Deletes the temporary realm and prints only
statuses and Boolean checks. No Provengo sample or expanded scenario is used.
