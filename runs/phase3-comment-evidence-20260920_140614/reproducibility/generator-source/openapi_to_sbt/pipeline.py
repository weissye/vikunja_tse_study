"""Orchestration for `generate` and `inspect`. This module is imported by
`generate` and `inspect` only -- `compare/reference_comparator.py` must
never import from here in a way that feeds reference data back into it.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from .parsing.loader import load_and_resolve
from .parsing.normalize import normalize
from .parsing.model import Document
from .inference.entities import infer_entities, standalone_operations
from .inference.keys import infer_key
from .inference.dependencies import infer_dependencies
from .inference.graph import build_graph
from .render.plan import build_plan
from .render.interfaces_js import render_interfaces
from .render.stories_js import render_stories
from .report.generation_report import build_generation_report, build_dependency_graph_report


@dataclass
class PipelineResult:
    doc: Document
    plan: object
    interfaces_js: str
    stories_js: str
    generation_report: Dict[str, Any]
    dependency_graph_report: Dict[str, Any]
    unsupported_refs: List[str]


def run_pipeline(openapi_path: str, name: str, base_url: str, seed: int,
                  allow_list=None, overrides: Optional[Dict[str, Any]] = None,
                  cli_args: Optional[Dict[str, Any]] = None,
                  instances_per_entity: int = 1,
                  instances_per_action: int = 1,
                  story_profile: str = "full") -> PipelineResult:
    resolved, unsupported_refs = load_and_resolve(openapi_path, allow_list=allow_list)
    raw_unresolved, _ = _load_raw_only(openapi_path, allow_list)
    doc = normalize(resolved, raw_unresolved)

    if unsupported_refs:
        doc.unsupported.append(
            f"{len(unsupported_refs)} remote $ref value(s) were not resolved (network access is "
            f"forbidden at generation time): {unsupported_refs}"
        )

    entities = infer_entities(doc)
    keys = {e.key: infer_key(doc, e) for e in entities}

    applied_overrides = []
    if overrides:
        applied_overrides = _apply_overrides(entities, keys, overrides)

    dependencies = infer_dependencies(doc, entities, keys)
    graph = build_graph([e.key for e in entities], dependencies)
    standalone_ops = standalone_operations(doc, entities)

    ambiguities = []
    for e in entities:
        if e.confidence < 1.0:
            ambiguities.append(
                f"Entity '{e.key}' has no component-schema evidence; name derived from path segment "
                f"(confidence={e.confidence})."
            )
    for e in entities:
        k = keys[e.key]
        if k.confidence < 0.85:
            ambiguities.append(
                f"Key inference for entity '{e.key}' has reduced confidence ({k.confidence}); "
                f"path parameter(s) {k.fields} could not be fully cross-validated against the schema."
            )
    if graph.had_cycle:
        ambiguities.append(
            f"Dependency graph contained a cycle; {len(graph.cycle_edges_removed)} lowest-confidence "
            f"edge(s) were removed to allow a deterministic creation order. See dependency_graph.json."
        )
    ambiguities.extend(applied_overrides)

    plan = build_plan(doc, entities, keys, dependencies, graph, standalone_ops,
                      seed, instances_per_entity=instances_per_entity,
                      instances_per_action=instances_per_action)

    parsed_base = base_url.rstrip("/")
    host, port, protocol = _split_base_url(parsed_base)

    interfaces_js = render_interfaces(plan, name, host, port, protocol)
    stories_js = render_stories(plan, name, story_profile=story_profile)

    gen_report = build_generation_report(
        doc, plan, unsupported_refs, ambiguities,
        isolation_audit=(allow_list and getattr(allow_list, "_audit", None)),
        cli_args=cli_args,
    )
    dep_report = build_dependency_graph_report(plan, dependencies)

    return PipelineResult(
        doc=doc, plan=plan, interfaces_js=interfaces_js, stories_js=stories_js,
        generation_report=gen_report, dependency_graph_report=dep_report,
        unsupported_refs=unsupported_refs,
    )


def _apply_overrides(entities, keys, overrides: Dict[str, Any]) -> List[str]:
    """Applies generic, user-supplied overrides for genuinely ambiguous
    contract elements. Overrides are keyed by the *generic* entity key
    (the inferred family path, visible via `inspect`), never by a
    hard-coded example name, and every applied override is recorded here
    so it shows up in generation_report.json (never a silent special
    case). Supported override shape:

        {
          "entities": {
            "<entity_key>": {
              "display_name": "Widget",
              "key_fields": ["id"]
            }
          }
        }
    """
    applied = []
    entity_overrides = overrides.get("entities", {}) if isinstance(overrides, dict) else {}
    by_key = {e.key: e for e in entities}
    for entity_key, patch in entity_overrides.items():
        e = by_key.get(entity_key)
        if not e:
            applied.append(f"Override ignored: no entity with key '{entity_key}' was inferred from this contract.")
            continue
        if "display_name" in patch:
            old = e.display_name
            e.display_name = patch["display_name"]
            from .inference.entities import _pluralize_display
            e.plural_display_name = patch.get("plural_display_name", _pluralize_display(e.display_name))
            applied.append(f"Override applied: entity '{entity_key}' display_name '{old}' -> '{e.display_name}' "
                            f"(plural '{e.plural_display_name}'). Note: an explicit OpenAPI operationId still wins "
                            f"over any generic name derived from display_name for that specific operation.")
        if "key_fields" in patch and entity_key in keys:
            old = keys[entity_key].fields
            keys[entity_key].fields = list(patch["key_fields"])
            applied.append(f"Override applied: entity '{entity_key}' key_fields {old} -> {keys[entity_key].fields}.")
    return applied


def _load_raw_only(path, allow_list):
    from .parsing.loader import load_raw
    return load_raw(path), None


def _split_base_url(base_url: str):
    import re
    m = re.match(r"^(https?)://([^:/]+)(?::(\d+))?", base_url)
    if not m:
        return "localhost", 5000, "http"
    protocol, host, port = m.group(1), m.group(2), m.group(3)
    return host, int(port) if port else (443 if protocol == "https" else 80), protocol
