import json
import os
import tempfile
import unittest
from pathlib import Path

from openapi_to_sbt.parsing.loader import load_and_resolve, load_raw, LoadError
from openapi_to_sbt.parsing.normalize import normalize


MINI_SPEC = {
    "openapi": "3.0.3",
    "info": {"title": "Mini", "version": "1.0.0"},
    "paths": {
        "/widgets": {
            "get": {
                "summary": "List widgets",
                "responses": {
                    "200": {
                        "content": {"application/json": {
                            "schema": {"type": "array", "items": {"$ref": "#/components/schemas/Widget"}}
                        }}
                    }
                },
            },
            "post": {
                "summary": "Create a widget",
                "requestBody": {
                    "required": True,
                    "content": {"application/json": {"schema": {"$ref": "#/components/schemas/WidgetCreate"}}},
                },
                "responses": {"201": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Widget"}}}}},
            },
        },
        "/widgets/{id}": {
            "get": {
                "summary": "Get widget by id",
                "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
                "responses": {
                    "200": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Widget"}}}},
                    "404": {"description": "not found"},
                },
            },
            "delete": {
                "summary": "Delete a widget",
                "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
                "responses": {"204": {"description": "deleted"}, "404": {"description": "not found"}},
            },
        },
    },
    "components": {
        "schemas": {
            "WidgetCreate": {
                "type": "object",
                "required": ["id", "name"],
                "properties": {"id": {"type": "integer"}, "name": {"type": "string"}},
            },
            "Widget": {
                "type": "object",
                "required": ["id", "name"],
                "properties": {"id": {"type": "integer"}, "name": {"type": "string"}},
            },
        }
    },
}


class TestLoader(unittest.TestCase):
    def _write(self, data):
        f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        json.dump(data, f)
        f.close()
        self.addCleanup(os.unlink, f.name)
        return f.name

    def test_load_raw_missing_file(self):
        with self.assertRaises(LoadError):
            load_raw("/nonexistent/path/x.json")

    def test_resolve_internal_ref(self):
        path = self._write(MINI_SPEC)
        resolved, unsupported = load_and_resolve(path)
        self.assertEqual(unsupported, [])
        schema = resolved["paths"]["/widgets"]["get"]["responses"]["200"]["content"]["application/json"]["schema"]
        self.assertEqual(schema["items"]["type"], "object")
        self.assertEqual(schema["items"]["__source_ref__"], "#/components/schemas/Widget")

    def test_remote_ref_reported_not_fetched(self):
        spec = json.loads(json.dumps(MINI_SPEC))
        spec["components"]["schemas"]["Remote"] = {"$ref": "https://example.com/schemas/Foo.json"}
        path = self._write(spec)
        resolved, unsupported = load_and_resolve(path)
        self.assertIn("https://example.com/schemas/Foo.json", unsupported)

    def test_cyclic_schema_ref_does_not_infinite_loop(self):
        spec = json.loads(json.dumps(MINI_SPEC))
        spec["components"]["schemas"]["Node"] = {
            "type": "object",
            "properties": {"child": {"$ref": "#/components/schemas/Node"}},
        }
        path = self._write(spec)
        resolved, _ = load_and_resolve(path)
        node = resolved["components"]["schemas"]["Node"]
        # The resolver expands one level before breaking the cycle (since the
        # first Node dict is reached directly, not via a $ref token); the
        # important property is that it terminates and marks the cycle
        # rather than recursing forever.
        self.assertIn("__cyclic_ref__", json.dumps(node))

    def test_local_file_ref_is_resolved(self):
        """Regression test for ACCEPTANCE_CRITERIA.md #2 ('resolve
        internal and local-FILE $ref values'): a $ref pointing into a
        *different* file on disk (not just '#/...' within the same
        document) must be resolved, and the external file must be added
        to the isolation allow-list so it doesn't trip the isolation
        guard as an unexpected read."""
        external_schema = {"Widget": {"type": "object", "properties": {"id": {"type": "string"}}}}
        ext_path = self._write(external_schema)
        spec = json.loads(json.dumps(MINI_SPEC))
        rel_name = os.path.basename(ext_path)
        spec["paths"]["/widgets"]["get"]["responses"]["200"]["content"]["application/json"]["schema"] = {
            "$ref": f"{rel_name}#/Widget"
        }
        path = self._write(spec)
        from openapi_to_sbt.isolation import InputAllowList
        allow_list = InputAllowList(allowed_files=[path])
        resolved, unsupported = load_and_resolve(path, allow_list=allow_list)
        self.assertEqual(unsupported, [])
        schema = resolved["paths"]["/widgets"]["get"]["responses"]["200"]["content"]["application/json"]["schema"]
        self.assertEqual(schema["properties"]["id"]["type"], "string")
        self.assertIn(str(Path(ext_path).resolve()), allow_list.allowed_files)


class TestNormalize(unittest.TestCase):
    def test_normalize_basic(self):
        path = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        json.dump(MINI_SPEC, path)
        path.close()
        self.addCleanup(os.unlink, path.name)
        resolved, _ = load_and_resolve(path.name)
        doc = normalize(resolved, MINI_SPEC)
        self.assertEqual(doc.title, "Mini")
        self.assertEqual(len(doc.operations), 4)
        get_item = next(o for o in doc.operations if o.method == "GET" and o.path == "/widgets/{id}")
        self.assertEqual([p.name for p in get_item.path_params], ["id"])
        self.assertEqual(sorted(get_item.all_response_codes), ["200", "404"])

    def test_security_scheme_parsed_as_placeholder(self):
        """Regression test for ACCEPTANCE_CRITERIA.md Validation #1
        ('security placeholders'): a declared securityScheme must be
        captured in the IR (and, downstream, surfaced in
        generation_report.json["security_schemes"]) as an authentication
        placeholder -- never as embedded credentials."""
        spec = json.loads(json.dumps(MINI_SPEC))
        spec["components"]["securitySchemes"] = {
            "apiKeyAuth": {"type": "apiKey", "in": "header", "name": "X-API-Key"}
        }
        spec["security"] = [{"apiKeyAuth": []}]
        path = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        json.dump(spec, path)
        path.close()
        self.addCleanup(os.unlink, path.name)
        resolved, _ = load_and_resolve(path.name)
        doc = normalize(resolved, spec)
        self.assertIn("apiKeyAuth", doc.security_schemes)
        scheme = doc.security_schemes["apiKeyAuth"]
        self.assertEqual(scheme.type_, "apiKey")
        self.assertEqual(scheme.location, "header")
        self.assertEqual(scheme.param_name, "X-API-Key")
        # never a literal credential/secret value, only the placeholder shape
        self.assertNotIn("secret", scheme.param_name.lower())

    def test_openapi_31_and_yaml_format_both_parse(self):
        """Regression test: OpenAPI 3.1 (not just 3.0) and YAML (not just
        JSON) must both parse correctly, independently of each other --
        ACCEPTANCE_CRITERIA.md Functional #1 ('Accept OpenAPI 3.0 and 3.1
        in JSON and YAML'). The 4 kit examples are all 3.0/JSON and the
        Todoist holdout is 3.1/YAML, so the 3.1/JSON and 3.0/YAML
        combinations were never independently exercised until this test."""
        spec_31 = json.loads(json.dumps(MINI_SPEC))
        spec_31["openapi"] = "3.1.0"
        # OpenAPI 3.1 JSON
        f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        json.dump(spec_31, f)
        f.close()
        self.addCleanup(os.unlink, f.name)
        resolved, _ = load_and_resolve(f.name)
        doc = normalize(resolved, spec_31)
        self.assertEqual(doc.openapi_version, "3.1.0")
        self.assertEqual(len(doc.operations), 4)

        # OpenAPI 3.0 YAML
        import yaml
        spec_30_yaml = json.loads(json.dumps(MINI_SPEC))
        spec_30_yaml["openapi"] = "3.0.3"
        f2 = tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False)
        yaml.safe_dump(spec_30_yaml, f2)
        f2.close()
        self.addCleanup(os.unlink, f2.name)
        resolved2, _ = load_and_resolve(f2.name)
        doc2 = normalize(resolved2, spec_30_yaml)
        self.assertEqual(doc2.openapi_version, "3.0.3")
        self.assertEqual(len(doc2.operations), 4)


if __name__ == "__main__":
    unittest.main()
