import sys
import unittest
from pathlib import Path

GENERATOR_ROOT = Path(__file__).resolve().parents[2]
if str(GENERATOR_ROOT) not in sys.path:
    sys.path.insert(0, str(GENERATOR_ROOT))

from openapi_to_sbt.parsing.normalize import normalize


class Swagger2NormalizationTests(unittest.TestCase):
    def setUp(self):
        self.spec = {
            "swagger": "2.0",
            "info": {"title": "Swagger Two", "version": "1"},
            "host": "example.test",
            "basePath": "/api/v1",
            "schemes": ["https"],
            "consumes": ["application/json"],
            "produces": ["application/json"],
            "securityDefinitions": {
                "Token": {"type": "apiKey", "name": "Authorization", "in": "header"}
            },
            "definitions": {
                "Thing": {"type": "object", "properties": {"id": {"type": "integer"}}},
                "EditThing": {"type": "object", "properties": {"title": {"type": "string"}}},
            },
            "paths": {
                "/things/{id}": {
                    "patch": {
                        "operationId": "editThing",
                        "parameters": [
                            {"name": "id", "in": "path", "required": True, "type": "integer"},
                            {"name": "verbose", "in": "query", "type": "boolean"},
                            {"name": "body", "in": "body", "required": True,
                             "schema": self_ref("#/definitions/EditThing")},
                        ],
                        "responses": {
                            "200": {"description": "ok", "schema": self_ref("#/definitions/Thing")}
                        },
                    }
                }
            },
        }

    def test_swagger2_document_level_constructs_are_normalized(self):
        doc = normalize(self.spec, self.spec)
        self.assertEqual("2.0", doc.openapi_version)
        self.assertEqual(["https://example.test/api/v1"], doc.servers)
        self.assertIn("Thing", doc.component_schemas)
        self.assertIn("Token", doc.security_schemes)

    def test_body_parameter_becomes_request_body(self):
        op = normalize(self.spec, self.spec).operations[0]
        self.assertEqual(["id", "verbose"], [p.name for p in op.parameters])
        self.assertEqual("integer", op.parameters[0].schema["type"])
        self.assertEqual("boolean", op.parameters[1].schema["type"])
        self.assertTrue(op.request_body.required)
        self.assertEqual("application/json", op.request_body.variants[0].media_type)
        self.assertIn("title", op.request_body.variants[0].schema["properties"])

    def test_swagger2_response_schema_uses_produces(self):
        response = normalize(self.spec, self.spec).operations[0].responses[0]
        self.assertIn("application/json", response.media_types)
        self.assertIn("id", response.media_types["application/json"]["properties"])


def self_ref(pointer):
    # The real loader resolves references before normalize. The small fixture
    # supplies the equivalent resolved schema while retaining readable intent.
    if pointer.endswith("EditThing"):
        return {"type": "object", "properties": {"title": {"type": "string"}}}
    return {"type": "object", "properties": {"id": {"type": "integer"}}}


if __name__ == "__main__":
    unittest.main()
