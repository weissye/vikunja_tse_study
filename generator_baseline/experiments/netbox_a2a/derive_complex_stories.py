#!/usr/bin/env python3
"""Derive deep structural scenarios from OpenAPI + generated structural report only.

V34 fixes V33's runtime-ID transport bug without changing the information boundary.
V33 passed a runtime-variable *name* through a local JS function parameter and tried
using that local from the asynchronous REST callback. Provengo model-generation
locals do not exist at actuation/runtime. V34 therefore emits the REST calls for the
deep scenarios directly, with literal runtime-variable keys inside callbacks and
literal @{...} expressions in request URLs/bodies.

The generator still reads only the metadata-stripped OpenAPI projection and the
structural generation report. It never reads the evaluator, SUT, seeded-fault
manifest, or analyst-authored triggers.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def q(x):
    return json.dumps(x, ensure_ascii=False, separators=(",", ":"))


def deref(doc, schema):
    seen = set()
    while isinstance(schema, dict) and "$ref" in schema:
        name = schema["$ref"].split("/")[-1]
        if name in seen:
            break
        seen.add(name)
        schema = doc.get("components", {}).get("schemas", {}).get(name, {})
    return schema or {}


def op_index(doc):
    out = {}
    for path, methods in doc.get("paths", {}).items():
        for method, op in methods.items():
            if isinstance(op, dict) and op.get("operationId"):
                out[(path, method.lower())] = op
    return out


def body_schema(doc, op):
    if not op:
        return {}
    raw = op.get("requestBody", {}).get("content", {}).get("application/json", {}).get("schema", {})
    return deref(doc, raw)


def prop_schema(doc, prop):
    return deref(doc, prop)


def reference_object_fields(doc, op):
    """Return request-body fields that are nested key-reference objects.

    Generic create/update families cannot safely invent a referenced runtime
    identifier for these fields.  Relation-specific families below do create
    the producer first and inject its captured runtime id, so generic families
    skip entities with such unresolved reference fields instead of emitting
    syntactically valid but semantically impossible placeholder references.
    """
    bs = body_schema(doc, op)
    out = set()
    for name, raw in bs.get("properties", {}).items():
        p = prop_schema(doc, raw)
        if p.get("type") == "object" and "id" in p.get("properties", {}):
            out.add(name)
    return out


def default_value(doc, prop, prefix):
    p = prop_schema(doc, prop)
    t = p.get("type")
    if t == "object" and "id" in p.get("properties", {}):
        return {"id": f"{prefix}_ref"}
    if t == "integer":
        return 1
    if t == "number":
        return 1.0
    if t == "boolean":
        return True
    return prefix


def entity_fields(doc, entity, opidx):
    fields = set(entity.get("key_fields") or ["id"])
    response_schema = deref(doc, doc.get("components", {}).get("schemas", {}).get(entity["schema_name"], {}))
    fields.update(response_schema.get("properties", {}).keys())
    for o in entity["operations"]:
        spec = opidx.get((o.get("path"), str(o.get("method") or "").lower()))
        if spec:
            fields.update(body_schema(doc, spec).get("properties", {}).keys())
    return sorted(fields)


def operation_specs(entity, opidx):
    out = {}
    for o in entity["operations"]:
        spec = opidx.get((o.get("path"), str(o.get("method") or "").lower()))
        out[o["kind"]] = (o, spec)
    return out


def make_values(doc, entity, fields, overrides=None, prefix="auto"):
    overrides = overrides or {}
    schema = deref(doc, doc["components"]["schemas"][entity["schema_name"]])
    props = schema.get("properties", {})
    vals = {}
    for f in fields:
        if f in overrides:
            vals[f] = overrides[f]
        elif f == "id":
            vals[f] = f"{prefix}_id"
        else:
            vals[f] = default_value(doc, props.get(f, {"type": "string"}), f"{prefix}_{f}")
    return vals


def scalar_values(t, tag):
    if t == "boolean":
        return False, True, False
    if t == "integer":
        return 11, 29, 47
    if t == "number":
        return 11.5, 29.5, 47.5
    return f"v34_x_{tag}", f"v34_y_{tag}", f"v34_z_{tag}"


def response_codes(op):
    vals = []
    for k in (op or {}).get("responses", {}):
        try:
            vals.append(int(k))
        except (TypeError, ValueError):
            pass
    return sorted(set(vals)) or [200]


def request_payload(doc, op, values):
    bs = body_schema(doc, op)
    props = bs.get("properties", {})
    return {k: values[k] for k in props if k in values and values[k] is not None}


def runtime_path(path, var_name):
    """Replace all path-template slots with a literal Provengo runtime expression.

    The A2A projection has single-key item paths. Keeping this generic for all slots
    avoids encoding any benchmark/domain field names.
    """
    return re.sub(r"\{[^}]+\}", "@{" + var_name + "}", path)


def direct_create(doc, op_pair, values, store_var=None):
    o, spec = op_pair
    payload = request_payload(doc, spec, values)
    opts = [f"body: {q(q(payload))}", f"expectedResponseCodes: {q(response_codes(spec))}"]
    if store_var:
        # IMPORTANT: the runtime-variable key is a literal embedded in the callback.
        # No model-generation local is captured by the callback.
        cb = (
            "callback: function(response) { "
            "var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} "
            f"if (__p && __p[\"id\"] !== undefined) {{ pvg.rtv.set({q(store_var)}, __p[\"id\"]); }} "
            "}"
        )
        opts.append(cb)
    return f"svc.post({q(o['path'])}, {{ " + ", ".join(opts) + " });"


def direct_item(doc, op_pair, runtime_id, values=None):
    o, spec = op_pair
    method = str(o["method"]).lower()
    path = runtime_path(o["path"], runtime_id)
    opts = []
    if method in ("post", "put", "patch") and spec and spec.get("requestBody") is not None:
        payload = request_payload(doc, spec, values or {})
        # Store the full JSON request as a literal string. @{...} placeholders are
        # therefore present directly in the REST event payload at model generation.
        opts.append(f"body: {q(q(payload))}")
    opts.append(f"expectedResponseCodes: {q(response_codes(spec))}")
    return f"svc.{method}({q(path)}, {{ " + ", ".join(opts) + " });"


def emit_thread(lines, name, family, stmts, http_steps=None):
    steps = http_steps if http_steps is not None else len(stmts)
    lines.append(f"// V34_FAMILY family={family} steps={steps}")
    lines.append(f"bthread({q(name)}, function() {{")
    lines.extend("  " + s for s in stmts)
    lines.append("});")
    lines.append("")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--openapi", required=True)
    ap.add_argument("--report", required=True)
    ap.add_argument("--output", required=True)
    a = ap.parse_args()

    doc = json.loads(Path(a.openapi).read_text(encoding="utf-8"))
    rep = json.loads(Path(a.report).read_text(encoding="utf-8"))
    entities = rep["entities"]
    opidx = op_index(doc)
    by_display = {e["display_name"].lower(): e for e in entities}
    fields_by = {e["display_name"]: entity_fields(doc, e, opidx) for e in entities}

    lines = [
        "// Auto-generated V34 deep structural scenarios from OpenAPI only.",
        "// Literal-key callbacks preserve server-assigned identifiers at runtime.",
        "// Runtime consumers use literal @{...} expressions directly in REST event fields.",
        "// No evaluator, seeded-fault manifest, SUT source, or analyst trigger is read.",
        "//@provengo summon rtv",
        "//@provengo summon rest",
        "",
    ]
    counts = {}

    def counted(family):
        counts[family] = counts.get(family, 0) + 1

    # Generic duplicate-required-string and repeated scalar-update families.
    for e in entities:
        fields = fields_by[e["display_name"]]
        ops = operation_specs(e, opidx)
        create_pair = ops.get("create")
        get_pair = ops.get("get")
        update_pair = ops.get("update")

        create_ref_fields = reference_object_fields(doc, create_pair[1]) if create_pair else set()

        if create_pair and not create_ref_fields:
            cs = body_schema(doc, create_pair[1])
            required = set(cs.get("required", []))
            cprops = cs.get("properties", {})
            for field in sorted(required):
                p = prop_schema(doc, cprops.get(field, {}))
                if p.get("type") != "string":
                    continue
                shared = f"v34_shared_{e['display_name'].lower()}_{field}"
                v1 = make_values(doc, e, fields, {field: shared}, prefix=f"v34_dup1_{e['display_name'].lower()}_{field}")
                v2 = make_values(doc, e, fields, {field: shared}, prefix=f"v34_dup2_{e['display_name'].lower()}_{field}")
                emit_thread(
                    lines,
                    f"auto:duplicate-required-string:{e['display_name']}:{field}",
                    "duplicate_required_string",
                    [direct_create(doc, create_pair, v1), direct_create(doc, create_pair, v2)],
                    2,
                )
                counted("duplicate_required_string")

        if create_pair and get_pair and update_pair and not create_ref_fields:
            us = body_schema(doc, update_pair[1])
            for field, rawp in sorted(us.get("properties", {}).items()):
                p = prop_schema(doc, rawp)
                t = p.get("type")
                if t not in ("string", "integer", "number", "boolean"):
                    continue
                x, y, z = scalar_values(t, f"{e['display_name'].lower()}_{field}")
                rtv_id = f"v34_scalar_{e['display_name'].lower()}_{field}_id"
                vals = make_values(doc, e, fields, {field: x}, prefix=f"v34_scalar_{e['display_name'].lower()}_{field}")
                emit_thread(
                    lines,
                    f"auto:scalar-second-update:{e['display_name']}:{field}",
                    "scalar_second_update",
                    [
                        direct_create(doc, create_pair, vals, rtv_id),
                        direct_item(doc, update_pair, rtv_id, {field: y}),
                        direct_item(doc, get_pair, rtv_id),
                        direct_item(doc, update_pair, rtv_id, {field: z}),
                        direct_item(doc, get_pair, rtv_id),
                    ],
                    5,
                )
                counted("scalar_second_update")

    # Generic nested-reference families.
    for child in entities:
        cfields = fields_by[child["display_name"]]
        cops = operation_specs(child, opidx)
        cc_pair = cops.get("create")
        cg_pair = cops.get("get")
        cu_pair = cops.get("update")
        if not cc_pair or not cg_pair:
            continue
        cs = deref(doc, doc["components"]["schemas"][child["schema_name"]])

        for rel, rawp in cs.get("properties", {}).items():
            p = prop_schema(doc, rawp)
            parent = by_display.get(rel.lower())
            if not parent or p.get("type") != "object" or "id" not in p.get("properties", {}):
                continue
            pfields = fields_by[parent["display_name"]]
            pops = operation_specs(parent, opidx)
            pc_pair = pops.get("create")
            pd_pair = pops.get("delete")
            if not pc_pair:
                continue

            # Three distinct parents + two verified relation transitions.
            if cu_pair:
                up = prop_schema(doc, body_schema(doc, cu_pair[1]).get("properties", {}).get(rel, {}) or {})
                if up.get("type") == "object" and "id" in up.get("properties", {}):
                    base = f"v34_rel_{parent['display_name'].lower()}_{child['display_name'].lower()}_{rel}"
                    pids = [f"{base}_p{i}_id" for i in (1, 2, 3)]
                    cid = f"{base}_child_id"
                    pvals = [make_values(doc, parent, pfields, prefix=f"v34_rel_p{i}_{parent['display_name'].lower()}") for i in (1, 2, 3)]
                    cv = make_values(doc, child, cfields, {rel: {"id": f"@{{{pids[0]}}}"}}, prefix=f"v34_rel_child_{child['display_name'].lower()}")
                    emit_thread(
                        lines,
                        f"auto:relation-second-reassignment:{parent['display_name']}->{child['display_name']}:{rel}",
                        "relation_second_reassignment",
                        [
                            direct_create(doc, pc_pair, pvals[0], pids[0]),
                            direct_create(doc, pc_pair, pvals[1], pids[1]),
                            direct_create(doc, pc_pair, pvals[2], pids[2]),
                            direct_create(doc, cc_pair, cv, cid),
                            direct_item(doc, cu_pair, cid, {rel: {"id": f"@{{{pids[1]}}}"}}),
                            direct_item(doc, cg_pair, cid),
                            direct_item(doc, cu_pair, cid, {rel: {"id": f"@{{{pids[2]}}}"}}),
                            direct_item(doc, cg_pair, cid),
                        ],
                        8,
                    )
                    counted("relation_second_reassignment")

            if pd_pair:
                # Delete a parent after two children, then verify both children.
                base = f"v34_multi_{parent['display_name'].lower()}_{child['display_name'].lower()}"
                pid, c1id, c2id = f"{base}_parent_id", f"{base}_child1_id", f"{base}_child2_id"
                pv = make_values(doc, parent, pfields, prefix=f"v34_multi_parent_{parent['display_name'].lower()}")
                c1 = make_values(doc, child, cfields, {rel: {"id": f"@{{{pid}}}"}}, prefix=f"v34_multi_c1_{child['display_name'].lower()}")
                c2 = make_values(doc, child, cfields, {rel: {"id": f"@{{{pid}}}"}}, prefix=f"v34_multi_c2_{child['display_name'].lower()}")
                emit_thread(
                    lines,
                    f"auto:parent-delete-multiple-children:{parent['display_name']}->{child['display_name']}",
                    "parent_delete_multiple_children",
                    [
                        direct_create(doc, pc_pair, pv, pid),
                        direct_create(doc, cc_pair, c1, c1id),
                        direct_create(doc, cc_pair, c2, c2id),
                        direct_item(doc, pd_pair, pid),
                        direct_item(doc, cg_pair, c1id),
                        direct_item(doc, cg_pair, c2id),
                    ],
                    6,
                )
                counted("parent_delete_multiple_children")

                # Establish a valid relation, delete the parent, then reuse its id.
                base = f"v34_reuse_{parent['display_name'].lower()}_{child['display_name'].lower()}"
                pid, oldid, newid = f"{base}_parent_id", f"{base}_old_child_id", f"{base}_new_child_id"
                pv2 = make_values(doc, parent, pfields, prefix=f"v34_reuse_parent_{parent['display_name'].lower()}")
                oldc = make_values(doc, child, cfields, {rel: {"id": f"@{{{pid}}}"}}, prefix=f"v34_reuse_old_{child['display_name'].lower()}")
                newc = make_values(doc, child, cfields, {rel: {"id": f"@{{{pid}}}"}}, prefix=f"v34_reuse_new_{child['display_name'].lower()}")
                emit_thread(
                    lines,
                    f"auto:deleted-parent-reference-reuse:{parent['display_name']}->{child['display_name']}",
                    "deleted_parent_reference_reuse",
                    [
                        direct_create(doc, pc_pair, pv2, pid),
                        direct_create(doc, cc_pair, oldc, oldid),
                        direct_item(doc, pd_pair, pid),
                        direct_create(doc, cc_pair, newc, newid),
                        direct_item(doc, cg_pair, newid),
                    ],
                    5,
                )
                counted("deleted_parent_reference_reuse")

    text = "\n".join(lines).replace("\r\n", "\n").replace("\r", "\n")
    Path(a.output).write_bytes(text.encode("utf-8"))
    print(json.dumps({"scenario_count": sum(counts.values()), "families": counts}, sort_keys=True))


if __name__ == "__main__":
    main()
