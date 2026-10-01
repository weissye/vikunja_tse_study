"""Normalize a fully $ref-resolved OpenAPI dict into the Document IR."""
from __future__ import annotations

from typing import Any, Dict, List

from .model import (
    Document, Operation, Parameter, RequestBody, RequestBodyVariant,
    ResponseSpec, Schema, SecurityScheme,
)

HTTP_METHODS = ("get", "put", "post", "delete", "options", "head", "patch", "trace")


def _esc(key: str) -> str:
    return key.replace("~", "~0").replace("/", "~1")


def normalize(resolved: Dict[str, Any], raw_unresolved: Dict[str, Any]) -> Document:
    openapi_version = resolved.get("openapi", "")
    info = resolved.get("info", {}) or {}
    title = info.get("title", "Untitled API")
    version = str(info.get("version", "0.0.0"))

    servers = []
    for s in resolved.get("servers", []) or []:
        url = s.get("url") if isinstance(s, dict) else None
        if url:
            servers.append(url)

    doc = Document(title=title, version=version, openapi_version=str(openapi_version),
                    servers=servers, raw=raw_unresolved)

    # --- component schemas (kept for entity/key/dependency inference) ---
    schemas_raw = resolved.get("components", {}).get("schemas", {}) or {}
    for name, schema_dict in schemas_raw.items():
        if not isinstance(schema_dict, dict):
            continue
        doc.component_schemas[name] = Schema(
            raw=schema_dict,
            source_pointer=f"#/components/schemas/{_esc(name)}",
            name=name,
        )

    # --- security schemes ---
    sec_schemes = resolved.get("components", {}).get("securitySchemes", {}) or {}
    for name, s in sec_schemes.items():
        if not isinstance(s, dict):
            continue
        doc.security_schemes[name] = SecurityScheme(
            name=name,
            type_=s.get("type", ""),
            scheme=s.get("scheme", ""),
            location=s.get("in", ""),
            param_name=s.get("name", ""),
        )

    global_security = resolved.get("security", []) or []

    # --- paths / operations ---
    paths = resolved.get("paths", {}) or {}
    for path_template, path_item in paths.items():
        if not isinstance(path_item, dict):
            continue
        shared_params_raw = path_item.get("parameters", []) or []
        for method in HTTP_METHODS:
            op_dict = path_item.get(method)
            if not isinstance(op_dict, dict):
                continue
            pointer = f"#/paths/{_esc(path_template)}/{method}"
            op_id = op_dict.get("operationId")
            params: List[Parameter] = []
            seen_param_keys = set()
            for p in list(shared_params_raw) + list(op_dict.get("parameters", []) or []):
                if not isinstance(p, dict) or "name" not in p or "in" not in p:
                    continue
                key = (p["name"], p["in"])
                if key in seen_param_keys:
                    continue
                seen_param_keys.add(key)
                params.append(Parameter(
                    name=p["name"],
                    location=p["in"],
                    required=bool(p.get("required", p["in"] == "path")),
                    schema=p.get("schema", {}) or {},
                    description=p.get("description", ""),
                    pointer=f"{pointer}/parameters",
                ))

            request_body = None
            rb = op_dict.get("requestBody")
            if isinstance(rb, dict):
                variants = []
                for media_type, media_obj in (rb.get("content", {}) or {}).items():
                    if not isinstance(media_obj, dict):
                        continue
                    variants.append(RequestBodyVariant(
                        media_type=media_type,
                        schema=media_obj.get("schema", {}) or {},
                        pointer=f"{pointer}/requestBody/content/{_esc(media_type)}",
                    ))
                request_body = RequestBody(required=bool(rb.get("required", False)), variants=variants)

            responses: List[ResponseSpec] = []
            for status, resp_obj in (op_dict.get("responses", {}) or {}).items():
                if not isinstance(resp_obj, dict):
                    continue
                media_types = {}
                for mt, mobj in (resp_obj.get("content", {}) or {}).items():
                    if isinstance(mobj, dict):
                        media_types[mt] = mobj.get("schema", {}) or {}
                responses.append(ResponseSpec(
                    status=str(status),
                    media_types=media_types,
                    pointer=f"{pointer}/responses/{_esc(str(status))}",
                    is_default=(status == "default"),
                ))

            security = op_dict.get("security", global_security)

            doc.operations.append(Operation(
                operation_id=op_id,
                method=method.upper(),
                path=path_template,
                tags=op_dict.get("tags", []) or [],
                summary=op_dict.get("summary") or op_dict.get("description", "") or "",
                parameters=params,
                request_body=request_body,
                responses=responses,
                security=security,
                pointer=pointer,
                deprecated=bool(op_dict.get("deprecated", False)),
            ))

    return doc
