import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR = ROOT / "generator_baseline"
if str(GENERATOR) not in sys.path:
    sys.path.insert(0, str(GENERATOR))

from openapi_to_sbt.parsing.normalize import normalize
from openapi_to_sbt.render.verification_js import render_verification_js
from openapi_to_sbt.verification import _binding, _create_for_item


def operation(doc, operation_id):
    return next(item for item in doc.operations if item.operation_id == operation_id)


class GiteaStage31ConcurrencyTests(unittest.TestCase):
    def setUp(self):
        repository = {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "owner": {"type": "object", "properties": {
                    "id": {"type": "integer"},
                    "login": {"type": "string"},
                }},
            },
        }
        spec = {
            "openapi": "3.0.3", "info": {"title": "generic", "version": "1"},
            "paths": {
                "/user/repos": {"post": {"operationId": "createRootRepo",
                    "responses": {"201": {"description": "ok", "content": {
                        "application/json": {"schema": repository}}}}}},
                "/admin/users/{username}/repos": {"post": {"operationId": "createNestedRepo",
                    "parameters": [{"name": "username", "in": "path", "required": True,
                                    "schema": {"type": "string"}}],
                    "responses": {"201": {"description": "ok", "content": {
                        "application/json": {"schema": repository}}}}}},
                "/repos/{owner}/{repo}": {
                    "get": {"operationId": "readRepo", "parameters": [
                        {"name": "owner", "in": "path", "required": True,
                         "schema": {"type": "string"}},
                        {"name": "repo", "in": "path", "required": True,
                         "schema": {"type": "string"}}],
                        "responses": {"200": {"description": "ok", "content": {
                            "application/json": {"schema": repository}}}}},
                    "patch": {"operationId": "editRepo", "parameters": [
                        {"name": "owner", "in": "path", "required": True,
                         "schema": {"type": "string"}},
                        {"name": "repo", "in": "path", "required": True,
                         "schema": {"type": "string"}}],
                        "requestBody": {"content": {"application/merge-patch+json": {
                            "schema": {"type": "object", "properties": {
                                "description": {"type": "string"}}}}}},
                        "responses": {"200": {"description": "ok", "content": {
                            "application/json": {"schema": repository}}}}},
                },
            },
        }
        self.doc = normalize(spec, spec)

    def test_nested_type_compatible_binding_is_openapi_derived(self):
        binding = _binding(operation(self.doc, "createRootRepo"), operation(self.doc, "readRepo"))
        self.assertEqual({"owner": "owner.login", "repo": "name"}, binding["response"])

    def test_root_producer_wins_without_application_specific_rule(self):
        create, binding = _create_for_item(self.doc, operation(self.doc, "readRepo"))
        self.assertEqual("createRootRepo", create.operation_id)
        self.assertEqual("owner.login", binding["response"]["owner"])

    def test_runtime_waits_for_exact_operation_and_reads_nested_path(self):
        derived = {"counts": {"concurrency_oracles": 1}, "concurrency_oracles": [{
            "oracle_id": "concurrency::same-field::edit::description",
            "kind": "same-field-one-successful-value-visible", "operation_id": "editRepo",
            "method": "PATCH", "path_template": "/repos/{owner}/{repo}",
            "media_type": "application/merge-patch+json", "success_statuses": [200],
            "fields": [{"name": "description", "type": "string"}],
            "runtime": {"ready": True, "entity_key": "repos",
                        "create_operation_id": "createRootRepo",
                        "path_binding_from_create_response": {"owner": "owner.login", "repo": "name"},
                        "path_binding_from_create_request_path": {}},
        }]}
        rendered = render_verification_js(derived, "generic")
        self.assertIn('__sbtCreateEvent("createRootRepo")', rendered)
        self.assertIn('__sbtReadPath(__created.data.__httpResponse,"owner.login")', rendered)

    def test_stage31_has_a_strict_end_to_end_gate(self):
        stage3 = (ROOT / "scripts" / "Invoke-Gitea-Stage3.ps1").read_text(encoding="utf-8-sig")
        wrapper = (ROOT / "scripts" / "Invoke-Gitea-Stage3_1.ps1").read_text(encoding="utf-8-sig")
        for marker in ("concurrency_ready_count", "concurrency_permit_count",
                       "concurrency_closed_count", "evaluatedConcurrency",
                       "GITEA_STAGE3_1_CONCURRENCY_ACCEPTED"):
            self.assertIn(marker, stage3)
        self.assertIn("-RequireConcurrency", wrapper)
        self.assertIn("Invoke-Gitea-Stage2-Preflight.ps1", wrapper)


if __name__ == "__main__":
    unittest.main()
