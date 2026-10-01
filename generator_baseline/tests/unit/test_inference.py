import json
import os
import tempfile
import unittest

from openapi_to_sbt.parsing.loader import load_and_resolve
from openapi_to_sbt.parsing.normalize import normalize
from openapi_to_sbt.inference.entities import infer_entities, standalone_operations
from openapi_to_sbt.inference.keys import infer_key
from openapi_to_sbt.inference.dependencies import infer_dependencies, DependencyEdge
from openapi_to_sbt.inference.graph import build_graph, CycleError
from openapi_to_sbt.inference.values import generate_value


def _doc_from_spec(spec):
    f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
    json.dump(spec, f)
    f.close()
    try:
        resolved, _ = load_and_resolve(f.name)
        return normalize(resolved, spec)
    finally:
        os.unlink(f.name)


def _schema(props, required=None):
    return {"type": "object", "properties": props, "required": required or []}


NESTED_SPEC = {
    "openapi": "3.0.3",
    "info": {"title": "Nested", "version": "1.0.0"},
    "paths": {
        "/authors": {
            "get": {"responses": {"200": {"content": {"application/json": {
                "schema": {"type": "array", "items": {"$ref": "#/components/schemas/Author"}}}}}}},
            "post": {"requestBody": {"content": {"application/json": {
                "schema": {"$ref": "#/components/schemas/AuthorCreate"}}}},
                "responses": {"201": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Author"}}}},
                              "409": {"description": "conflict"}}},
        },
        "/authors/{id}": {
            "get": {"parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
                     "responses": {"200": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Author"}}}},
                                   "404": {"description": "not found"}}},
            "delete": {"parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
                        "responses": {"204": {"description": "deleted"}}},
        },
        "/posts": {
            "post": {"requestBody": {"content": {"application/json": {
                "schema": {"$ref": "#/components/schemas/PostCreate"}}}},
                "responses": {"201": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Post"}}}}}},
            "get": {"responses": {"200": {"content": {"application/json": {
                "schema": {"type": "array", "items": {"$ref": "#/components/schemas/Post"}}}}}}},
        },
        "/posts/{id}": {
            "get": {"parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
                     "responses": {"200": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Post"}}}}}},
        },
    },
    "components": {
        "schemas": {
            "AuthorCreate": _schema({"id": {"type": "integer"}, "name": {"type": "string"}}, ["id", "name"]),
            "Author": _schema({"id": {"type": "integer"}, "name": {"type": "string"}}, ["id", "name"]),
            "PostCreate": _schema({"id": {"type": "integer"}, "title": {"type": "string"},
                                    "authorId": {"type": "integer"}}, ["id", "title", "authorId"]),
            "Post": _schema({"id": {"type": "integer"}, "title": {"type": "string"},
                              "authorId": {"type": "integer"}}, ["id", "title", "authorId"]),
        }
    },
}


class TestEntityInference(unittest.TestCase):
    def setUp(self):
        self.doc = _doc_from_spec(NESTED_SPEC)
        self.entities = infer_entities(self.doc)

    def test_entities_found_with_canonical_display_names(self):
        names = sorted(e.display_name for e in self.entities)
        self.assertEqual(names, ["Author", "Post"])

    def test_entity_schema_prefers_response_over_create_body(self):
        author = next(e for e in self.entities if e.key == "authors")
        self.assertEqual(author.schema_name, "Author")

    def test_no_standalone_ops_left_when_all_covered(self):
        standalone = standalone_operations(self.doc, self.entities)
        self.assertEqual(standalone, [])

    def test_pagination_envelope_is_unwrapped_to_real_item_schema(self):
        """Regression test: a list response that $refs a NAMED wrapper
        schema (DRF-style pagination: {count, next, previous, results:
        [...]}) must resolve to the item schema inside `results`, not the
        wrapper's own name. Found on NetBox: every entity was named
        'Paginated<X>List' instead of '<X>' until this was fixed, which
        also produced near-duplicate STATE-tracker description text
        across entities and contributed to a real deadlock in the
        reverse-deletion lifecycle (see HOLDOUT_REPORT.md)."""
        spec = json.loads(json.dumps(NESTED_SPEC))
        spec["components"]["schemas"]["PaginatedAuthorList"] = {
            "type": "object",
            "required": ["count", "results"],
            "properties": {
                "count": {"type": "integer"},
                "next": {"type": "string", "nullable": True},
                "previous": {"type": "string", "nullable": True},
                "results": {"type": "array", "items": {"$ref": "#/components/schemas/Author"}},
            },
        }
        spec["paths"]["/authors"]["get"]["responses"]["200"]["content"]["application/json"]["schema"] = {
            "$ref": "#/components/schemas/PaginatedAuthorList"
        }
        doc = _doc_from_spec(spec)
        entities = infer_entities(doc)
        author = next(e for e in entities if e.key == "authors")
        self.assertEqual(author.schema_name, "Author")
        self.assertEqual(author.display_name, "Author")


class TestKeyInference(unittest.TestCase):
    def test_single_key_field(self):
        doc = _doc_from_spec(NESTED_SPEC)
        entities = infer_entities(doc)
        posts = next(e for e in entities if e.key == "posts")
        key = infer_key(doc, posts)
        self.assertEqual(key.fields, ["id"])
        self.assertFalse(key.composite)
        self.assertGreaterEqual(key.confidence, 0.9)

    def test_uuid_format_raises_confidence_over_bare_type_match(self):
        """Regression test for the format-based key-confidence gap: a
        non-required, same-named schema property with format 'uuid'
        should be scored higher than a bare type match with no format
        signal, since a uuid-formatted property is much stronger
        identifier evidence."""
        spec = json.loads(json.dumps(NESTED_SPEC))
        spec["components"]["schemas"]["Post"]["properties"]["id"] = {"type": "string", "format": "uuid"}
        spec["components"]["schemas"]["Post"]["required"] = ["title", "authorId"]  # id no longer required
        doc = _doc_from_spec(spec)
        entities = infer_entities(doc)
        posts = next(e for e in entities if e.key == "posts")
        key = infer_key(doc, posts)
        self.assertEqual(key.fields, ["id"])
        self.assertGreaterEqual(key.confidence, 0.95)
        self.assertTrue(any(p.rule == "K4:schema_property_uuid_format_match" for p in key.provenance))


class TestDependencyInference(unittest.TestCase):
    def test_fk_suffix_dependency_detected(self):
        doc = _doc_from_spec(NESTED_SPEC)
        entities = infer_entities(doc)
        keys = {e.key: infer_key(doc, e) for e in entities}
        edges = infer_dependencies(doc, entities, keys)
        self.assertTrue(any(e.source == "posts" and e.target == "authors" and e.field_name == "authorId"
                             for e in edges))
        for e in edges:
            self.assertTrue(e.provenance, "every dependency edge must carry provenance")

    def test_snake_case_fk_in_query_param_detected(self):
        """Regression test for a real bug found while testing against a
        real-world holdout contract (Todoist REST API v2): FK-shaped
        fields named with snake_case ('project_id') passed as *query*
        parameters (not request-body properties) were not being matched
        at all, because matching only normalized camelCase 'Id' suffixes
        and only scanned body properties."""
        spec = json.loads(json.dumps(NESTED_SPEC))
        spec["paths"]["/posts"]["post"] = {
            "parameters": [
                {"name": "post_id", "in": "query", "required": True, "schema": {"type": "string"}},
                {"name": "author_id", "in": "query", "required": True, "schema": {"type": "string"}},
                {"name": "title", "in": "query", "required": True, "schema": {"type": "string"}},
            ],
            "responses": {"201": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Post"}}}}},
        }
        doc = _doc_from_spec(spec)
        entities = infer_entities(doc)
        keys = {e.key: infer_key(doc, e) for e in entities}
        edges = infer_dependencies(doc, entities, keys)
        self.assertTrue(
            any(e.source == "posts" and e.target == "authors" and e.field_name == "author_id" for e in edges),
            f"expected posts->authors via snake_case query param 'author_id'; got {edges}",
        )


class TestGraph(unittest.TestCase):
    def test_topological_order_prerequisites_first(self):
        edges = [DependencyEdge(source="posts", target="authors", field_name="authorId", confidence=0.9)]
        graph = build_graph(["authors", "posts"], edges)
        self.assertEqual(graph.creation_order.index("authors"), 0)
        self.assertLess(graph.creation_order.index("authors"), graph.creation_order.index("posts"))
        self.assertEqual(graph.deletion_order, list(reversed(graph.creation_order)))
        self.assertFalse(graph.had_cycle)

    def test_cycle_is_broken_deterministically_not_raised(self):
        edges = [
            DependencyEdge(source="a", target="b", field_name="bId", confidence=0.9),
            DependencyEdge(source="b", target="a", field_name="aId", confidence=0.5),
        ]
        graph = build_graph(["a", "b"], edges)
        self.assertTrue(graph.had_cycle)
        self.assertEqual(len(graph.cycle_edges_removed), 1)
        # the lower-confidence edge (b->a) should be the one removed
        self.assertEqual(graph.cycle_edges_removed[0].source, "b")
        self.assertEqual(len(graph.creation_order), 2)


class TestValueGeneration(unittest.TestCase):
    def test_enum_default_and_format_priority(self):
        self.assertEqual(generate_value({"enum": ["x", "y"], "default": "z"}, 1, "p"), "z")
        self.assertIn(generate_value({"enum": ["x", "y"]}, 1, "p"), ["x", "y"])

    def test_deterministic_across_calls(self):
        schema = {"type": "string", "format": "uuid"}
        v1 = generate_value(schema, 42, "field.path")
        v2 = generate_value(schema, 42, "field.path")
        self.assertEqual(v1, v2)

    def test_required_object_properties_present(self):
        schema = _schema({"id": {"type": "integer"}, "name": {"type": "string"}}, ["id", "name"])
        v = generate_value(schema, 1, "root")
        self.assertIn("id", v)
        self.assertIn("name", v)


if __name__ == "__main__":
    unittest.main()
