import json
import os
import re
import tempfile
import unittest
import subprocess
import shutil

from openapi_to_sbt.pipeline import run_pipeline
from openapi_to_sbt.parsing.loader import LoadError

import tests.unit.test_inference as ti


def _write_spec(spec):
    f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
    json.dump(spec, f)
    f.close()
    return f.name


class TestRendering(unittest.TestCase):
    def test_optional_nullable_relationship_and_readonly_fields_are_not_invented(self):
        """Optional relationship-like inputs must not receive random ids.

        This is the generic regression for the real Vikunja failure where a
        generated project create sent a nonexistent ``parent_project_id`` and
        the server correctly rejected it.  The rule uses only OpenAPI facets:
        nullable/readOnly/required/type.
        """
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        create = spec["components"]["schemas"]["AuthorCreate"]
        create["properties"].update({
            "parent_id": {"type": "integer", "nullable": True},
            "owner": {"type": "object", "readOnly": True,
                      "properties": {"id": {"type": "integer"}}},
            "note": {"type": "string"},
        })
        spec["paths"]["/authors"]["post"].setdefault("parameters", []).append({
            "name": "format", "in": "query", "required": False,
            "schema": {"type": "string", "enum": ["html", "markdown"]},
        })
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        story = re.search(r'bthread\("crud:Authors:1".*?\n\}\);', result.stories_js, re.DOTALL)
        self.assertIsNotNone(story)
        self.assertIn("let parentId = undefined;", story.group(0))
        self.assertNotIn("owner", story.group(0))
        self.assertIn("let format = undefined;", story.group(0))
        # Optional fields are deliberately omitted from the positive baseline.
        # This keeps the generated request within the OpenAPI contract without
        # inventing application-specific semantics for optional properties.
        self.assertIn("let note = undefined;", story.group(0))

    def test_unbound_required_path_identifier_suppresses_only_runtime_story(self):
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["paths"]["/orphans/{orphan}/activate"] = {
            "post": {
                "operationId": "activateOrphan",
                "parameters": [{"name": "orphan", "in": "path", "required": True,
                                "schema": {"type": "integer"}}],
                "responses": {"204": {"description": "activated"}},
            }
        }
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        # The callable interface remains generated for contract coverage.
        self.assertIn("function activateOrphan(", result.interfaces_js)
        # But the positive story cannot legally invent an orphan identity.
        self.assertNotIn('action:activateOrphan', result.stories_js)


    def test_multi_dependency_schedule_covers_third_and_later_axes(self):
        from openapi_to_sbt.render.stories_js import _dependency_instance_index
        rows = [[_dependency_instance_index(i, dep, 5) for dep in range(4)]
                for i in range(1, 6)]
        self.assertEqual(rows[0], [1, 1, 1, 1])
        self.assertEqual(rows[1], [2, 1, 1, 1])
        self.assertEqual(rows[2], [3, 1, 1, 1])
        self.assertEqual(rows[3], [1, 2, 2, 2])
        self.assertEqual(rows[4], [1, 3, 3, 3])

    def test_configurable_crud_prefix_depth(self):
        path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1,
                              instances_per_entity=5)
        for i in range(1, 6):
            self.assertIn(f'crud:Authors:{i}', result.stories_js)
            self.assertIn(f'crud:Posts:{i}', result.stories_js)
        self.assertNotIn('crud:Authors:6', result.stories_js)
        self.assertIn('InstanceReady:Authors:3', result.stories_js)
        self.assertIn('InstanceReady:Authors:2', result.stories_js)
        self.assertIn('captured["authorId"]', result.stories_js)

    def test_response_codes_preserved_in_interface(self):
        path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        self.assertIn("expectedResponseCodes: [201, 409]", result.interfaces_js)

    def test_internal_tracking_vars_do_not_shadow_entity_fields_named_the_same(self):
        """Regression test: an entity whose own schema has a field named
        'description' (or 'url'/'body') must not have that field's value
        silently overwritten. `var description = ...` inside a JS function
        where 'description' is already a parameter does not declare a new
        variable -- it reassigns the parameter. Found on NetBox: entities
        with their own 'description' property had it clobbered with
        internal event-tracking text before being sent to the server."""
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["components"]["schemas"]["AuthorCreate"]["properties"]["description"] = {"type": "string"}
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        fn = re.search(r"function createAuthor\([^)]*\)\s*\{.*?\n\}\n", result.interfaces_js, re.DOTALL)
        self.assertIsNotNone(fn)
        # The internal description-tracking variable must be __-prefixed,
        # never the bare name that collides with the entity's own field.
        self.assertNotIn("var description", fn.group(0))
        self.assertIn("var __description", fn.group(0))
        self.assertIn('__body["description"] = String(description)', fn.group(0))

    def test_duplicate_description_text_across_entities_is_disambiguated(self):
        """Regression test: two different entities sharing the exact same
        OpenAPI create-operation summary must not have their completion
        events cross-attributed. Found on NetBox: 'Interface' and
        'VMInterface' both document their create op as "Post a list of
        interface objects.", which made the STATE tracker's description-
        prefix dispatch permanently misattribute one entity's events to
        the other, leaving the shadowed entity's STATE array empty
        forever and hanging the reverse-deletion lifecycle."""
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["paths"]["/authors"]["post"]["summary"] = "Create a thing"
        spec["paths"]["/posts"]["post"]["summary"] = "Create a thing"
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        # Both create functions must tag their event with their own,
        # distinct __entityKey so a shared description text can never
        # cause cross-attribution.
        self.assertIn('"__entityKey": "authors"', result.interfaces_js)
        self.assertIn('"__entityKey": "posts"', result.interfaces_js)
        # The STATE tracker must dispatch on __entityKey, not description text.
        self.assertIn('e.data["__entityKey"] === "authors"', result.stories_js)
        self.assertIn('e.data["__entityKey"] === "posts"', result.stories_js)

    def test_query_params_sent_on_post_not_just_get(self):
        """Regression test: query parameters must be attached to the URL
        for POST/PUT/PATCH too, not only GET. Found while building a real
        SUT for the Todoist holdout contract: its create/update operations
        carry their entire payload as query parameters on a POST with no
        request body -- an earlier version silently dropped all of it,
        which would make every real create/update call fail (400) against
        an actual server."""
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["paths"]["/authors"]["post"] = {
            "parameters": [{"name": "name", "in": "query", "required": True, "schema": {"type": "string"}}],
            "responses": {"201": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Author"}}}}},
        }
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        fn = re.search(r"function createAuthor\([^)]*\)\s*\{.*?\n\}\n", result.interfaces_js, re.DOTALL)
        self.assertIsNotNone(fn)
        self.assertIn('__params["name"]', fn.group(0))
        self.assertIn("parameters: __params", fn.group(0))

    def test_complex_query_parameter_is_serialized_before_provengo(self):
        """Provengo rejects raw object values in its parameters map."""
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["paths"]["/authors"]["post"].setdefault("parameters", []).append({
            "in": "query", "name": "attachment", "required": False,
            "schema": {"type": "object", "properties": {
                "file_type": {"type": "string"}
            }},
        })
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        fn = re.search(r"function createAuthor\([^)]*\)\s*\{.*?\n\}\n", result.interfaces_js, re.DOTALL)
        self.assertIsNotNone(fn)
        self.assertIn('typeof attachment === "object" ? JSON.stringify(attachment) : attachment', fn.group(0))

    def test_cleanup_waits_for_all_story_producers(self):
        """Deletion must not race a late second dependent creation."""
        path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1,
                               instances_per_entity=2)
        stories = result.stories_js
        self.assertIn('StoryPhaseComplete:crud:Authors:1', stories)
        self.assertIn('StoryPhaseComplete:crud:Authors:2', stories)
        barrier = stories.index("let __pendingStories")
        first_delete = stories.index("deleteAuthor(", barrier)
        wait_loop = stories.index("while (Object.keys(__pendingStories).length > 0)", barrier)
        self.assertLess(wait_loop, first_delete)
        self.assertIn("__pendingStories[__storyName].contains(__phaseEvent)", stories)
        self.assertNotIn("__pendingStories[__phaseEvent.name]", stories)
        self.assertNotIn("StateUpdate_", stories)

    def test_multi_instance_uses_real_captured_data_not_stale_local_copy(self):
        """Regression test for a real bug found reviewing an external
        contribution: InstanceReady events must be built from the actual
        completion-event data (captured post-callback, e.g. a
        server-assigned key), not from the story's own local variables --
        those are only ever the pre-call placeholder, since the interface
        function's reassignment happens in its own, separate function
        scope. Building InstanceReady from local variables meant every
        dependent entity in a multi-instance run resolved a placeholder
        value instead of a real server-assigned id, producing 404s
        against a real SUT."""
        path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1,
                               instances_per_entity=2)
        self.assertIn('let __createResult = createAuthor(id, name);', result.stories_js)
        self.assertIn('let __justCreated = (__createResult && __createResult.data) ? __createResult.data : {};', result.stories_js)
        self.assertIn('__justCreated["id"]', result.stories_js)
        self.assertNotIn('sync({ waitFor: matchAnyAuthorsAdded() })', result.stories_js)
        self.assertNotIn('Event("InstanceReady:Authors:1", { id: id,', result.stories_js)

    def test_instances_per_entity_and_action_default_to_one(self):
        """Regression test: --instances-per-entity/--instances-per-action
        must default to 1 (the original, single-instance behavior),
        consistently across the CLI, run_pipeline, and build_plan.
        Defaulting to >1 anywhere silently changes output for every
        existing caller that doesn't pass the flag explicitly -- this is
        exactly what broke the Todoist end-to-end tests (a 5-instance
        fan-out collided with that SUT's own business rule at a scale no
        single-instance test had ever exercised) until this was fixed and
        made a genuine opt-in enhancement instead of a silent default."""
        import inspect
        from openapi_to_sbt.pipeline import run_pipeline as rp
        from openapi_to_sbt.render.plan import build_plan
        self.assertEqual(inspect.signature(rp).parameters["instances_per_entity"].default, 1)
        self.assertEqual(inspect.signature(rp).parameters["instances_per_action"].default, 1)
        self.assertEqual(inspect.signature(build_plan).parameters["instances_per_entity"].default, 1)
        self.assertEqual(inspect.signature(build_plan).parameters["instances_per_action"].default, 1)
        # And the actual output: no instance-number suffix at all when
        # nothing multi-instance was requested.
        path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        self.assertIn('bthread("crud:Authors:1"', result.stories_js)
        self.assertNotIn('crud:Authors:2', result.stories_js)

    def test_reverse_deletion_label_matches_single_repetition_emission(self):
        """Regression test: the reverse-deletion lifecycle's 'wait for
        every story to finish' collector must build EXACTLY the same
        event names the action/standalone emitter actually publishes.
        The emitter omits the instance-number suffix when there's only
        one repetition; an earlier version of the collector always
        appended one regardless -- masked by the old default of 7 (where
        both sides always took the suffixed branch), but with a single
        repetition this made lifecycle:ReverseDeletion wait forever for
        a StoryPhaseComplete event that could never arrive, so deletion
        never ran at all."""
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["paths"]["/authors/{id}/archive"] = {
            "post": {
                "operationId": "archiveAuthor",
                "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
                "responses": {"204": {"description": "archived"}},
            }
        }
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        stories = result.stories_js
        # The action bthread must actually publish this exact event...
        self.assertIn('sync({ request: Event("StoryPhaseComplete:action:archiveAuthor:1") });', stories)
        # ...and the collector must wait for that EXACT same event name,
        # not a variant with an extra trailing instance suffix.
        self.assertIn('__pendingStories["StoryPhaseComplete:action:archiveAuthor:1"]', stories)
        self.assertNotIn('StoryPhaseComplete:action:archiveAuthor:1:1', stories)

    def test_cookie_params_attached_via_cookie_header(self):
        """Regression test: cookie parameters were completely unhandled
        (not wired to the HTTP call, not even reported as an excluded
        construct) -- a real gap found on a full re-audit against
        ACCEPTANCE_CRITERIA.md's "cover every ... parameter location ...
        or list a justified exclusion" requirement. No supplied example
        system declares any cookie parameter, so this is synthetic."""
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["paths"]["/authors"]["get"]["parameters"] = [
            {"name": "session_id", "in": "cookie", "required": False, "schema": {"type": "string"}}
        ]
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        fn = re.search(r"function listAuthors\([^)]*\)\s*\{.*?\n\}\n", result.interfaces_js, re.DOTALL)
        self.assertIsNotNone(fn)
        self.assertIn("__cookieParts.push", fn.group(0))
        self.assertIn('__headers["Cookie"]', fn.group(0))
        self.assertIn("headers: __headers", fn.group(0))

    def test_header_params_attached_to_http_call(self):
        """Regression test: header parameters must actually be attached
        to the HTTP request, not just accepted into the function
        signature and silently dropped (a previously disclosed gap --
        see TRACEABILITY.md). No supplied example system declares any
        operation-level header parameter, so this is a synthetic test."""
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["paths"]["/authors"]["get"]["parameters"] = [
            {"name": "X-Trace-Id", "in": "header", "required": False, "schema": {"type": "string"}}
        ]
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        fn = re.search(r"function listAuthors\([^)]*\)\s*\{.*?\n\}\n", result.interfaces_js, re.DOTALL)
        self.assertIsNotNone(fn)
        self.assertIn("var __headers = {}", fn.group(0))
        self.assertIn('__headers["X-Trace-Id"]', fn.group(0))
        self.assertIn("headers: __headers", fn.group(0))

    def test_no_body_sent_when_operation_declares_no_request_body(self):
        """Regression test: a POST/PUT/PATCH operation with only query
        parameters (no requestBody) must not send `body:
        JSON.stringify(undefined)` -- found while building a real SUT for
        the Todoist holdout contract, where most create/update operations
        use query parameters instead of a JSON body."""
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["paths"]["/authors"]["post"] = {
            "parameters": [{"name": "name", "in": "query", "required": True, "schema": {"type": "string"}}],
            "responses": {"201": {"content": {"application/json": {"schema": {"$ref": "#/components/schemas/Author"}}}}},
        }
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        fn = re.search(r"function createAuthor\([^)]*\)\s*\{[^}]*\}", result.interfaces_js, re.DOTALL)
        self.assertIsNotNone(fn)
        self.assertNotIn("JSON.stringify(undefined)", fn.group(0))
        self.assertNotIn("body:", fn.group(0))

    def test_server_assigned_key_captured_from_response(self):
        """Regression test: when an entity's key is never supplied by the
        client at creation time (server-assigned ID, e.g. Todoist's
        Project 'id'), the emitted completion event must use the value
        captured from the response, not the input placeholder."""
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        # Authors created without an 'id' -- only 'name' is client-supplied;
        # 'id' is assigned by the server and only appears in the response.
        spec["components"]["schemas"]["AuthorCreate"] = {
            "type": "object", "required": ["name"], "properties": {"name": {"type": "string"}},
        }
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        fn = re.search(r"function createAuthor\([^)]*\)\s*\{.*?\n\}\n", result.interfaces_js, re.DOTALL)
        self.assertIsNotNone(fn)
        self.assertIn("callback: function(response)", fn.group(0))
        self.assertIn('JSON.parse(response.body)', fn.group(0))
        self.assertIn('__parsed["id"]', fn.group(0))

    def test_completion_sync_is_outside_rest_callback(self):
        """Real Provengo invokes REST callbacks outside any b-thread.
        Completion events must therefore be requested only after the REST
        helper returns to the calling b-thread."""
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["components"]["schemas"]["AuthorCreate"] = {
            "type": "object", "required": ["name"],
            "properties": {"name": {"type": "string"}},
        }
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        fn = re.search(r"function createAuthor\([^)]*\)\s*\{.*?\n\}\n", result.interfaces_js, re.DOTALL)
        self.assertIsNotNone(fn)
        body = fn.group(0)
        callback_start = body.index("callback: function(response)")
        callback_end = body.index("\n  }", callback_start)
        sync_pos = body.index('sync({ request: Event("Done: "')
        self.assertGreater(sync_pos, callback_end)
        self.assertNotIn("sync(", body[callback_start:callback_end])

    def test_generated_operations_expose_http_observation(self):
        """semantic overlays must be able to chain on the actual HTTP
        response, not only request-intent completion fields."""
        path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        fn = re.search(r"function createAuthor\([^)]*\)\s*\{.*?\n\}\n", result.interfaces_js, re.DOTALL)
        self.assertIsNotNone(fn)
        body = fn.group(0)
        self.assertIn("__httpCode = response.code", body)
        self.assertIn("__httpResponse = (__parsed !== null) ? __parsed : response.body", body)
        self.assertIn('"__httpCode": __httpCode', body)
        self.assertIn('"__httpResponse": __httpResponse', body)
        self.assertIn("return { code: __httpCode, body: __httpResponse", body)
        self.assertIn("data: __completionData", body)

    def test_no_duplicate_top_level_declarations(self):
        path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        import re
        decl_re = re.compile(r"^(var|const|let)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=", re.MULTILINE)
        names_iface = [n for _, n in decl_re.findall(result.interfaces_js)]
        names_story = [n for _, n in decl_re.findall(result.stories_js)]
        overlap = set(names_iface) & set(names_story)
        self.assertEqual(overlap, set(), f"top-level declaration collision: {overlap}")

    @unittest.skipUnless(shutil.which("node"), "node not installed")
    def test_generated_js_is_syntactically_valid(self):
        path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        for label, content in [("interfaces", result.interfaces_js), ("stories", result.stories_js)]:
            tf = tempfile.NamedTemporaryFile(mode="w", suffix=".js", delete=False)
            tf.write(content)
            tf.close()
            try:
                proc = subprocess.run(["node", "--check", tf.name], capture_output=True, text=True)
                self.assertEqual(proc.returncode, 0, f"{label} syntax error: {proc.stderr}")
            finally:
                os.unlink(tf.name)


class TestDeterminism(unittest.TestCase):
    def test_same_seed_same_output(self):
        path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, path)
        r1 = run_pipeline(path, "nested", "http://localhost:5000", seed=7)
        r2 = run_pipeline(path, "nested", "http://localhost:5000", seed=7)
        self.assertEqual(r1.interfaces_js, r2.interfaces_js)
        self.assertEqual(r1.stories_js, r2.stories_js)

    def test_different_seed_different_story_values(self):
        path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, path)
        r1 = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        r2 = run_pipeline(path, "nested", "http://localhost:5000", seed=2)
        self.assertNotEqual(r1.stories_js, r2.stories_js)


class TestErrorHandling(unittest.TestCase):
    def test_missing_file_raises_load_error(self):
        with self.assertRaises(LoadError):
            run_pipeline("/no/such/file.json", "x", "http://localhost:5000", seed=1)

    def test_default_response_reported_not_silently_dropped(self):
        spec = json.loads(json.dumps(ti.NESTED_SPEC))
        spec["paths"]["/authors"]["get"]["responses"]["default"] = {"description": "error"}
        path = _write_spec(spec)
        self.addCleanup(os.unlink, path)
        result = run_pipeline(path, "nested", "http://localhost:5000", seed=1)
        rc = result.generation_report["response_code_coverage"]
        entry = next(e for e in rc if e["method"] == "GET" and e["path"] == "/authors")
        self.assertTrue(entry["has_default"])


if __name__ == "__main__":
    unittest.main()
