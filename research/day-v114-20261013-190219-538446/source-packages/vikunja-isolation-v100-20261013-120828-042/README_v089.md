# v089 — v088 startup and evidence fixes

Read ANALYSIS_v088.md. The supplied live v088 run stopped after one successful login and before any research resource operation. This is a model defect, not a Vikunja bug.

Fixed SessionReady missing-entity lookup, empty-token log redaction, immediate native ERROR detection, and actual-count recording on early failure. No change to resource counts, auto-selection, native login design or recovery protocol.

Use Run-Model-v089.ps1. Static first; then RunLive. Home root defaults to D:\Yeshayahu\Temp\vikunja_tse_study. Existing local run configuration is retained. No password prompt.

Local focused tests passed. No native/live v089 acceptance is claimed. All broader v088 limitations remain; see README_v088.md and REQUIREMENTS_AUDIT_v088.json. Full 1380-case live campaign remains long. This version fixes the observed startup failure; it does not claim the remaining native path is already validated.
