#!/usr/bin/env python3
"""Audit the five explicit V35 NetBox intermediate-prefix fault mechanisms."""
from __future__ import annotations
import argparse, ast, json
from pathlib import Path

FAULTS=[
  {"id":"A_LOGIC","class":"relation reassignment silently lost","description":"A valid first reassignment to another existing parent is acknowledged but discarded; GET exposes the stale parent."},
  {"id":"B_LIFECYCLE","class":"multi-child parent deletion leaves dependents","description":"Deleting a parent with at least two children succeeds but leaves dependents retrievable."},
  {"id":"C_UNIQUENESS","class":"required unique string constraint missing","description":"Two distinct parent resources can be created with the same benchmark unique string value."},
  {"id":"D_INTEGRITY","class":"second verified scalar update silently lost","description":"After one update is verified, a second distinct update is acknowledged but discarded."},
  {"id":"E_REFERENTIAL_INTEGRITY","class":"deleted parent reference reuse accepted","description":"After valid parent-child history and deletion, a new child may reuse the deleted parent id."},
]


def audit(path:Path):
    src=path.read_text(encoding='utf-8'); ast.parse(src)
    checks={
      "A_LOGIC": all(x in src for x in ['changed_parent', 'mark_fault(', '"A_LOGIC"']),
      "B_LIFECYCLE": all(x in src for x in ['len(kids) >= 2', '"B_LIFECYCLE"']),
      "C_UNIQUENESS": all(x in src for x in ['duplicate =', '"C_UNIQUENESS"']),
      "D_INTEGRITY": all(x in src for x in ['meta["verified_after_first"]', '"D_INTEGRITY"']),
      "E_REFERENTIAL_INTEGRITY": all(x in src for x in ['reuse_after_valid_history', '"E_REFERENTIAL_INTEGRITY"']),
    }
    return {
      "schema_version":6,"artifact_version":"v36","sut":path.name,
      "fault_count":sum(checks.values()),
      "source_fault_mechanism_count":sum(checks.values()),"expected_source_fault_mechanism_count":5,
      "semantic_fault_class_count":5,"semantic_fault_classes":list(checks),
      "minimum_http_steps":{"A_LOGIC":5,"B_LIFECYCLE":5,"C_UNIQUENESS":2,"D_INTEGRITY":4,"E_REFERENTIAL_INTEGRITY":4},
      "hidden_ground_truth":{"visible_to_tools":False,"used_for_official_score":False},
      "checks":checks,"faults":FAULTS,
      "classification_note":"V35 retunes NetBox to intermediate external witnesses while keeping the generator frozen. Official evidence is sequence-local external HTTP only; hidden activation markers are diagnostic only.",
      "ok":all(checks.values()) and sum(checks.values())==5,
    }


def main():
    root=Path(__file__).resolve().parents[1]
    default=root/'resources/development_kit/validation_only/suts/netbox/netbox_sut_buggy.py'
    ap=argparse.ArgumentParser(); ap.add_argument('--sut',default=str(default)); a=ap.parse_args()
    r=audit(Path(a.sut)); print(json.dumps(r,indent=2,sort_keys=True)); return 0 if r['ok'] else 1

if __name__=='__main__': raise SystemExit(main())
