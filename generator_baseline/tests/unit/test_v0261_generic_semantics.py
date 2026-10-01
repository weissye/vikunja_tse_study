import unittest

from openapi_to_sbt.evaluate_verifiers import evaluate
from openapi_to_sbt.parsing.normalize import normalize
from openapi_to_sbt.render.verification_js import _value
from openapi_to_sbt.verification import _binding, _semantic_obligation


def operation(doc, operation_id):
    return next(item for item in doc.operations if item.operation_id == operation_id)


class V0261GenericSemanticTests(unittest.TestCase):
    def setUp(self):
        item = {"type": "object", "properties": {
            "id": {"type": "integer", "format": "int64", "x-go-name": "ID"},
            "number": {"type": "integer", "format": "int64", "x-go-name": "Index"},
            "title": {"type": "string"},
            "color": {"type": "string"},
            "state": {"type": "string"},
        }}
        request = {"type": "object", "properties": {
            "title": {"type": "string"},
            "color": {"type": "string"},
            "closed": {"type": "boolean"},
        }}
        spec = {"openapi": "3.0.3", "info": {"title": "generic", "version": "1"},
                "paths": {
                    "/things": {"post": {"operationId": "createThing",
                        "requestBody": {"content": {"application/json": {"schema": request}}},
                        "responses": {"201": {"description": "ok", "content": {
                            "application/json": {"schema": item}}}}}},
                    "/things/{index}": {"get": {"operationId": "readThing",
                        "parameters": [{"name": "index", "in": "path", "required": True,
                                        "schema": {"type": "integer"}}],
                        "responses": {"200": {"description": "ok", "content": {
                            "application/json": {"schema": item}}}}}},
                }}
        self.doc = normalize(spec, spec)

    def test_schema_metadata_binding_precedes_id_fallback(self):
        binding = _binding(operation(self.doc, "createThing"), operation(self.doc, "readThing"))
        self.assertEqual("number", binding["response"]["index"])
        self.assertEqual("openapi-schema-metadata", binding["evidence"]["index"]["source"])
        self.assertEqual("high", binding["evidence"]["index"]["confidence"])

    def test_integer_response_identity_can_fill_string_path_parameter(self):
        read = operation(self.doc, "readThing")
        read.path_params[0].schema["type"] = "string"
        binding = _binding(operation(self.doc, "createThing"), read)
        self.assertEqual("number", binding["response"]["index"])

    def test_named_resource_prefers_type_compatible_name_over_numeric_id(self):
        item = {"type": "object", "properties": {
            "id": {"type": "integer"}, "name": {"type": "string"},
            "owner": {"type": "object", "properties": {
                "login": {"type": "string"}}}}}
        spec = {"openapi": "3.0.3", "info": {"title": "generic", "version": "1"},
                "paths": {
                    "/repos": {"post": {"operationId": "createRepo",
                        "responses": {"201": {"description": "ok", "content": {
                            "application/json": {"schema": item}}}}}},
                    "/repos/{repo}": {"get": {"operationId": "readRepo",
                        "parameters": [{"name": "repo", "in": "path", "required": True,
                                        "schema": {"type": "string"}}],
                        "responses": {"200": {"description": "ok", "content": {
                            "application/json": {"schema": item}}}}}},
                }}
        doc = normalize(spec, spec)
        binding = _binding(operation(doc, "createRepo"), operation(doc, "readRepo"))
        self.assertEqual("name", binding["response"]["repo"])

    def test_state_oracle_uses_only_contract_comparable_fields(self):
        oracle, reason = _semantic_obligation(self.doc, operation(self.doc, "createThing"))
        self.assertEqual("", reason)
        fields = {field["name"]: field for field in oracle["fields"]}
        self.assertEqual({"closed", "color", "title"}, set(fields))
        self.assertEqual("runtime", fields["closed"]["comparison_confidence"])
        self.assertEqual("high", fields["title"]["comparison_confidence"])
        self.assertEqual("number", oracle["observation"]["path_binding_from_response"]["index"])

    def test_server_canonicalization_is_inconclusive_but_persistence_passes(self):
        manifest = {
            "source": {},
            "contract_oracles": [{"oracle_id": "contract::createThing",
                "operation_id": "createThing", "kind": "response-contract", "method": "POST",
                "path_template": "/things", "success_statuses": [201],
                "documented_error_statuses": [], "request_contract": None}],
            "state_oracles": [{"oracle_id": "state::createThing", "operation_id": "createThing",
                "kind": "create-visibility", "method": "POST", "path_template": "/things",
                "trigger_success_statuses": [201], "fields": [{"name": "color"}],
                "superseding_methods": ["PUT", "PATCH", "DELETE"],
                "observation": {"method": "GET", "path_template": "/things/{index}",
                    "success_statuses": [200], "path_binding_from_response": {"index": "number"},
                    "path_binding_from_request_path": {}}}],
            "concurrency_oracles": [],
        }
        events = [
            {"method": "POST", "model_path": "/things", "status": 201,
             "request": {"color": "#00aabb"},
             "response": {"number": 7, "color": "00aabb"}},
            {"method": "GET", "model_path": "/things/7", "status": 200,
             "request": None, "response": {"number": 7, "color": "00aabb"}},
        ]
        result = evaluate(events, manifest)
        witness = next(item for item in result["witnesses"]
                       if item["oracle_id"] == "state::createThing")
        self.assertEqual("INCONCLUSIVE", witness["result"])
        self.assertEqual("PASS", witness["persistence_result"])
        self.assertEqual("server-canonicalized-request-value", witness["reason"])

    def test_generated_values_respect_common_openapi_formats_and_lengths(self):
        self.assertEqual("2026-01-01T00:00:00Z",
                         _value({"name": "when", "type": "string", "format": "date-time"}, "a"))
        self.assertEqual(4, len(_value({"name": "x", "type": "string", "maxLength": 4}, "a")))
        self.assertGreaterEqual(len(_value({"name": "x", "type": "string", "minLength": 40}, "a")), 40)


if __name__ == "__main__":
    unittest.main()
