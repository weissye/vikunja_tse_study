import json
import os
import tempfile
import unittest

from openapi_to_sbt.pipeline import run_pipeline


def _spec():
    return {
        "openapi": "3.0.3",
        "info": {"title": "Nested reference regression", "version": "1"},
        "paths": {
            "/sites": {
                "get": {"responses": {"200": {"content": {"application/json": {"schema": {"type": "array", "items": {"$ref": "#/components/schemas/Site"}}}}}}},
                "post": {
                    "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/SiteCreate"}}}},
                    "responses": {"201": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Site"}}}}},
                },
            },
            "/sites/{id}": {
                "get": {"parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "string"}}],
                        "responses": {"200": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Site"}}}}, "404": {"description": "missing"}}},
                "delete": {"parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "string"}}],
                           "responses": {"204": {"description": "deleted"}, "404": {"description": "missing"}}},
            },
            "/devices": {
                "get": {"responses": {"200": {"content": {"application/json": {"schema": {"type": "array", "items": {"$ref": "#/components/schemas/Device"}}}}}}},
                "post": {
                    "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/DeviceCreate"}}}},
                    "responses": {"201": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Device"}}}}},
                },
            },
            "/devices/{id}": {
                "get": {"parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "string"}}],
                        "responses": {"200": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Device"}}}}, "404": {"description": "missing"}}},
                "patch": {
                    "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "string"}}],
                    "requestBody": {"required": True, "content": {"application/json": {"schema": {"type": "object", "properties": {"site": {"$ref": "#/components/schemas/SiteRef"}}}}}},
                    "responses": {"200": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Device"}}}}, "404": {"description": "missing"}},
                },
            },
        },
        "components": {"schemas": {
            "Site": {"type": "object", "properties": {"id": {"type": "string", "readOnly": True}, "name": {"type": "string"}}, "required": ["id", "name"]},
            "SiteCreate": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]},
            "SiteRef": {"type": "object", "properties": {"id": {"type": "string"}}, "required": ["id"]},
            "Device": {"type": "object", "properties": {"id": {"type": "string", "readOnly": True}, "name": {"type": "string"}, "site": {"$ref": "#/components/schemas/SiteRef"}}, "required": ["id", "name", "site"]},
            "DeviceCreate": {"type": "object", "properties": {"name": {"type": "string"}, "site": {"$ref": "#/components/schemas/SiteRef"}}, "required": ["name", "site"]},
        }},
    }


def _run(spec):
    f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
    json.dump(spec, f)
    f.close()
    try:
        return run_pipeline(f.name, "nested_ref", "http://127.0.0.1:5000", seed=1,
                            instances_per_entity=2, instances_per_action=1)
    finally:
        os.unlink(f.name)


class NestedReferenceDependencyTests(unittest.TestCase):
    def test_create_dependency_is_inferred_from_name_plus_reference_schema(self):
        result = _run(_spec())
        edges = {(e["source"], e["target"], e["field_name"], e["provenance"][0]["rule"])
                 for e in result.dependency_graph_report["edges"]}
        self.assertIn(("devices", "sites", "site", "D4:reference_object_alias_key_match"), edges)
        self.assertLess(result.plan.graph.creation_order.index("sites"),
                        result.plan.graph.creation_order.index("devices"))

    def test_nested_reference_uses_real_runtime_key_in_documented_object_shape(self):
        result = _run(_spec())
        stories = result.stories_js
        self.assertIn('deps["site"] = EventSet("wait:InstanceReady:Sites:1"', stories)
        self.assertIn('let site = {"id": captured["site"]};', stories)
        # Update must bind BOTH the existing device and the referenced site.
        self.assertIn('bthread("update:', stories)
        self.assertIn('deps["id"] = EventSet("wait:InstanceReady:Devices:1"', stories)
        self.assertIn('deps["site"] = EventSet("wait:InstanceReady:Sites:1"', stories)

    def test_bare_name_without_reference_component_does_not_reenable_unsafe_matching(self):
        spec = _spec()
        # Replace the strong SiteRef with an anonymous object.  The field name
        # alone must NOT be enough to infer a dependency.
        spec["components"]["schemas"]["DeviceCreate"]["properties"]["site"] = {
            "type": "object", "properties": {"id": {"type": "string"}}, "required": ["id"]
        }
        result = _run(spec)
        triples = {(e["source"], e["target"], e["field_name"])
                   for e in result.dependency_graph_report["edges"]}
        self.assertNotIn(("devices", "sites", "site"), triples)


if __name__ == "__main__":
    unittest.main()
