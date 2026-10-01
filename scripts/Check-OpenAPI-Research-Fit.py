#!/usr/bin/env python3
"""Offline preflight using the project's existing openapi_to_sbt generator.

No service is started and no HTTP request is sent to the candidate system.
The labels in FAMILIES only select report slices; they are not generator hints.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys


FAMILIES = {
    "openproject": {"primary": ("work_packages", "workpackages"),
                    "links": ("relations",), "secondary": ("projects", "memberships")},
    "immich": {"primary": ("assets",), "links": ("albums",),
               "secondary": ("users", "partners", "shared-links", "shared_links")},
    "mealie": {"primary": ("recipes",), "links": ("shopping", "organizers", "categories"),
               "secondary": ("meal-plans", "mealplans", "households")},
}
METHODS = ("get", "post", "patch", "put", "delete")


def load_spec(path):
    content = path.read_text(encoding="utf-8-sig")
    if path.suffix.lower() in (".json",):
        spec = json.loads(content)
    else:
        try:
            import yaml
        except ImportError as exc:
            raise RuntimeError("YAML requires PyYAML (already needed by the generator); download the JSON specification instead") from exc
        spec = yaml.safe_load(content)
    if not isinstance(spec, dict) or not isinstance(spec.get("paths"), dict):
        raise ValueError("Input has no OpenAPI paths object")
    return spec


def response_ok(op):
    return any(str(status).startswith("2") for status in (op.get("responses") or {}))


def operation_rows(spec):
    rows = []
    for path, item in spec["paths"].items():
        if not isinstance(item, dict):
            continue
        for method in METHODS:
            op = item.get(method)
            if isinstance(op, dict):
                rows.append({"method": method.upper(), "path": path,
                             "operation_id": op.get("operationId"),
                             "has_2xx": response_ok(op),
                             "request_media": sorted((op.get("requestBody") or {}).get("content", {})),
                             "response_codes": sorted(map(str, (op.get("responses") or {}).keys()))})
    return rows


def dependency_path_gate(graph, selected):
    """Check graph connectivity, separately from mere endpoint presence.

    This is still static evidence: an edge is not proof of runtime creation or
    successful verification. Requiring an explicit graph edge prevents a
    collection of unrelated HTTP paths from being called a connected story.
    """
    def in_family(entity_key, tokens):
        path = str(entity_key).lower().replace("-", "_")
        return any(token.replace("-", "_") in path for token in tokens)

    primary = selected["primary"]
    downstream = selected["links"] + selected["secondary"]
    edges = graph.get("edges", [])
    matches = [e for e in edges
               if (in_family(e.get("target", ""), primary)
                   and in_family(e.get("source", ""), downstream))
               or (in_family(e.get("source", ""), primary)
                   and in_family(e.get("target", ""), downstream))]
    # Two prerequisites of one consumer form an indirect graph connection,
    # not proof that the primary resource belongs to the linked resource.
    shared_consumers = sorted({a["source"] for a in edges for b in edges
        if a.get("source") == b.get("source") and a is not b
        and in_family(a.get("target", ""), primary)
        and in_family(b.get("target", ""), downstream)})
    return {"connected": bool(matches), "edges": matches[:40],
            "shared_consumer_paths": shared_consumers,
            "meaning": "A direct edge is a static prerequisite only; shared consumers do not prove membership or a runtime witness."}


def run_generator(spec_path, generator_root, output, timeout):
    package = generator_root / "openapi_to_sbt" / "__main__.py"
    if not package.is_file():
        raise FileNotFoundError("Expected existing generator: " + str(package))
    generated = output / "generated"
    generated.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env["PYTHONPATH"] = str(generator_root) + os.pathsep + env.get("PYTHONPATH", "")
    cmd = [sys.executable, "-m", "openapi_to_sbt", "generate", "--openapi", str(spec_path),
           "--output", str(generated), "--name", "feasibility", "--base-url", "http://127.0.0.1:1",
           "--seed", "1", "--instances-per-entity", "1", "--instances-per-action", "1"]
    try:
        result = subprocess.run(cmd, cwd=str(generator_root), env=env, capture_output=True,
                                text=True, timeout=timeout, check=False)
        (output / "generator.log").write_text(result.stdout + "\n" + result.stderr, encoding="utf-8")
        return {"exit_code": result.returncode, "timed_out": False,
                "report_generated": (generated / "generation_report.json").is_file()}
    except subprocess.TimeoutExpired as exc:
        (output / "generator.log").write_text("Generation timed out after %d seconds\n%s" %
                                               (timeout, (exc.stdout or b"").decode("utf-8", "replace")
                                                if isinstance(exc.stdout, bytes) else (exc.stdout or "")), encoding="utf-8")
        return {"exit_code": None, "timed_out": True, "report_generated": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--spec", type=Path, required=True)
    parser.add_argument("--candidate", choices=sorted(FAMILIES), required=True)
    parser.add_argument("--generator-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--timeout", type=int, default=180)
    args = parser.parse_args()
    spec_path = args.spec.resolve(strict=True)
    generator_root = args.generator_root.resolve(strict=True)
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    report = {"candidate": args.candidate, "spec_path": str(spec_path),
              "sha256": hashlib.sha256(spec_path.read_bytes()).hexdigest()}
    try:
        spec = load_spec(spec_path)
        rows = operation_rows(spec)
        report["openapi_version"] = spec.get("openapi", spec.get("swagger"))
        report["operation_count"] = len(rows)
        report["families"] = {}
        for name, keywords in FAMILIES[args.candidate].items():
            selected = [row for row in rows if any(token in row["path"].lower().replace("-", "_")
                        for token in keywords)]
            report["families"][name] = {"count": len(selected), "operations": selected}
        report["generator"] = run_generator(spec_path, generator_root, output, args.timeout)
        generated = output / "generated"
        gen_report = generated / "generation_report.json"
        graph_path = generated / "dependency_graph.json"
        if gen_report.is_file():
            data = json.loads(gen_report.read_text(encoding="utf-8"))
            report["generator"]["coverage"] = data.get("coverage")
            report["generator"]["unsupported_constructs"] = data.get("unsupported_constructs")
            report["generator"]["warnings"] = data.get("warnings")
        if graph_path.is_file():
            graph = json.loads(graph_path.read_text(encoding="utf-8"))
            selected = FAMILIES[args.candidate]
            report["dependency_path_gate"] = dependency_path_gate(graph, selected)
            report["generator"]["dependency_nodes"] = len(graph.get("nodes", []))
            report["generator"]["dependency_edges"] = len(graph.get("edges", []))
            selected_tokens = set(sum((list(v) for v in FAMILIES[args.candidate].values()), []))
            report["generator"]["relevant_edges"] = [edge for edge in graph.get("edges", [])
                if any(token in (str(edge.get("source", "")) + " " + str(edge.get("target", ""))).lower()
                       for token in selected_tokens)][:40]
        primary = report["families"]["primary"]["operations"]
        links = report["families"]["links"]["operations"]
        stages = {
            "primary_create": any(r["method"] == "POST" and r["has_2xx"] for r in primary),
            "primary_read": any(r["method"] == "GET" and "{" in r["path"] for r in primary),
            "primary_update": any(r["method"] in ("PUT", "PATCH") for r in primary),
            "link_mutation": any(r["method"] in ("POST", "PUT", "PATCH", "DELETE") for r in links),
            "link_read": any(r["method"] == "GET" for r in links),
        }
        report["static_path_gates"] = stages
        report["outcome"] = ("GENERATOR_BLOCKED" if report["generator"]["exit_code"] != 0 else
                             "MISSING_STATIC_PATH" if not all(stages.values()) else
                             "STATIC_PATH_ONLY" if not report.get("dependency_path_gate", {}).get("connected") else
                             "STATIC_PILOT_ONLY")
        report["interpretation"] = ("Generation proves only operations were described and JS was emitted; "
            "it does not prove execution, dependency availability, correct request bodies, "
            "real overlap, or that an oracle is derivable from OpenAPI.")
    except Exception as exc:
        report["outcome"] = "PREFLIGHT_ERROR"
        report["error"] = "%s: %s" % (type(exc).__name__, exc)
    (output / "research_fit.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print("RESEARCH_FIT", report["outcome"], "report=" + str(output / "research_fit.json"))
    # A completed static diagnosis, including an unconnected graph, is not a
    # generator failure. Preserve the existing PowerShell one-step workflow.
    return 0 if report["outcome"] in ("STATIC_PILOT_ONLY", "STATIC_PATH_ONLY") else 2


if __name__ == "__main__":
    sys.exit(main())
