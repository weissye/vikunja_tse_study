Increment 4 delta: verified associations/actions

Copy/extract this ZIP into the Vikunja study root. It replaces only the listed
generator files and adds scripts/tests. It does not replace prior evidence.

Adds profile: multi-resource-verified-actions
Preserves Increment 3's 30 resource witnesses and adds 28 action witnesses:
  labels: attach visibility + detach absence = 6
  comments: create visibility + update persistence + delete absence = 12
  relations: create bidirectional visibility + delete absence = 10
Expected total: 58 witnesses across 16 external oracles for Tasks=6.

Run:
  python .\tests\test_increment4_verified_actions.py
  & ".\scripts\Prepare-Vikunja-Increment4.ps1"
  & ".\scripts\Invoke-Vikunja-Increment4.ps1" -Seed 20262001

Only after the first seed passes, run 20262002, 20262003 and 20262004.
