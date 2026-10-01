#!/usr/bin/env python3
"""Validate the byte-preserved V29 12-operation A2A projection used by V31 against the bundled NetBox OpenAPI.

This is a provenance/clean-room gate, not a semantic generator. It verifies that
selected operationIds and the benchmark's selected writable fields exist in the
bundled NetBox 4.4.2 OpenAPI, and that the A2A projection contains no semantic
value annotations such as enum/example/default/regex/length constraints.
"""
from __future__ import annotations
import argparse, json
from pathlib import Path

EXPECTED_OPS = {
    "dcim_sites_list", "dcim_sites_create", "dcim_sites_retrieve", "dcim_sites_destroy",
    "dcim_devices_list", "dcim_devices_create", "dcim_devices_retrieve", "dcim_devices_partial_update",
    "circuits_circuits_list", "circuits_circuits_create", "circuits_circuits_retrieve", "circuits_circuits_partial_update",
}
FORBIDDEN_SCHEMA_KEYS = {"enum", "example", "examples", "default", "pattern", "minLength", "maxLength", "minimum", "maximum"}
REQUIRED_SOURCE_FIELDS = {
    "WritableSiteRequest": {"name", "slug", "status", "description"},
    "WritableDeviceWithConfigContextRequest": {"name", "site", "status", "description"},
    "PatchedWritableDeviceWithConfigContextRequest": {"site"},
    "WritableCircuitRequest": {"cid", "status", "description"},
    "PatchedWritableCircuitRequest": {"description"},
}


def op_ids(doc):
    out=set()
    for _, methods in doc.get("paths",{}).items():
        for _, op in methods.items():
            if isinstance(op,dict) and op.get("operationId"):
                out.add(op["operationId"])
    return out


def scan_forbidden(obj, path="$", hits=None):
    if hits is None: hits=[]
    if isinstance(obj,dict):
        for k,v in obj.items():
            p=f"{path}.{k}"
            if k in FORBIDDEN_SCHEMA_KEYS:
                hits.append(p)
            scan_forbidden(v,p,hits)
    elif isinstance(obj,list):
        for i,v in enumerate(obj): scan_forbidden(v,f"{path}[{i}]",hits)
    return hits


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    ap.add_argument("--projection", required=True)
    a=ap.parse_args()
    source=json.loads(Path(a.source).read_text(encoding="utf-8"))
    proj=json.loads(Path(a.projection).read_text(encoding="utf-8"))
    errors=[]
    src_ops=op_ids(source); proj_ops=op_ids(proj)
    if proj_ops != EXPECTED_OPS:
        errors.append(f"projection operationIds differ: {sorted(proj_ops ^ EXPECTED_OPS)}")
    missing=EXPECTED_OPS-src_ops
    if missing: errors.append(f"operationIds absent from bundled source OpenAPI: {sorted(missing)}")
    schemas=source.get("components",{}).get("schemas",{})
    for s,fields in REQUIRED_SOURCE_FIELDS.items():
        props=set(schemas.get(s,{}).get("properties",{}))
        absent=fields-props
        if absent: errors.append(f"source schema {s} lacks selected fields: {sorted(absent)}")
    forbidden=scan_forbidden(proj.get("components",{}).get("schemas",{}))
    if forbidden: errors.append("semantic/value metadata present in projection: "+", ".join(forbidden[:20]))
    result={
        "schema_version":1,
        "operation_count":len(proj_ops),
        "source_operation_count":len(src_ops),
        "forbidden_metadata_hits":forbidden,
        "ok":not errors,
        "errors":errors,
        "note":"The projection is task-scoped; this gate verifies source provenance of operations/selected fields and absence of value-level semantic annotations."
    }
    print(json.dumps(result,indent=2,sort_keys=True))
    return 0 if not errors else 1

if __name__=="__main__": raise SystemExit(main())
