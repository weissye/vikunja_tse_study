import json
import os
import tempfile
import unittest

from openapi_to_sbt.pipeline import run_pipeline


def _parameter(name):
    return {"name": name, "in": "path", "required": True,
            "schema": {"type": "integer"}}


def _response(schema, status="200"):
    return {status: {"content": {"application/json": {
        "schema": {"$ref": f"#/components/schemas/{schema}"}}}}}


def _body(schema):
    return {"required": True, "content": {"application/json": {
        "schema": {"$ref": f"#/components/schemas/{schema}"}}}}


def _spec():
    return {
        "openapi": "3.0.3",
        "info": {"title": "Nested collections", "version": "1"},
        "paths": {
            "/projects": {
                "get": {"responses": _response("ProjectList")},
                "post": {"requestBody": _body("Project"),
                         "responses": _response("Project", "201")},
            },
            "/projects/{id}": {
                "get": {"parameters": [_parameter("id")],
                        "responses": _response("Project")},
                "delete": {"parameters": [_parameter("id")],
                           "responses": {"204": {"description": "deleted"}}},
            },
            "/projects/{project}/tasks": {
                "get": {"parameters": [_parameter("project")],
                        "responses": _response("TaskList")},
                "post": {"parameters": [_parameter("project")],
                         "requestBody": _body("Task"),
                         "responses": _response("Task", "201")},
            },
            "/tasks/{task}": {
                "get": {"parameters": [_parameter("task")],
                        "responses": _response("Task")},
                "put": {"parameters": [_parameter("task")],
                        "requestBody": _body("Task"),
                        "responses": _response("Task")},
                "delete": {"parameters": [_parameter("task")],
                           "responses": {"204": {"description": "deleted"}}},
            },
            "/labels": {
                "get": {"responses": _response("LabelList")},
                "post": {"requestBody": _body("Label"),
                         "responses": _response("Label", "201")},
            },
            "/labels/{id}": {
                "get": {"parameters": [_parameter("id")],
                        "responses": _response("Label")},
                "delete": {"parameters": [_parameter("id")],
                           "responses": {"204": {"description": "deleted"}}},
            },
            "/tasks/{task}/labels": {
                "get": {"parameters": [_parameter("task")],
                        "responses": _response("LabelList")},
                "post": {"parameters": [_parameter("task")],
                         "requestBody": _body("LabelTask"),
                         "responses": _response("LabelTask", "201")},
            },
            "/tasks/{task}/labels/{label}": {
                "delete": {"parameters": [_parameter("task"), _parameter("label")],
                           "responses": {"204": {"description": "deleted"}}},
            },
            "/tasks/{task}/comments": {
                "get": {"parameters": [_parameter("task")], "responses": _response("CommentList")},
                "post": {"parameters": [_parameter("task")], "requestBody": _body("Comment"),
                         "responses": _response("Comment", "201")},
            },
            "/tasks/{task}/comments/{commentid}": {
                "get": {"parameters": [_parameter("task"), _parameter("commentid")], "responses": _response("Comment")},
                "put": {"parameters": [_parameter("task"), _parameter("commentid")], "requestBody": _body("Comment"), "responses": _response("Comment")},
                "delete": {"parameters": [_parameter("task"), _parameter("commentid")], "responses": {"204": {"description": "deleted"}}},
            },
        },
        "components": {"schemas": {
            "Project": {"type": "object", "properties": {
                "id": {"type": "integer", "readOnly": True},
                "title": {"type": "string", "minLength": 1}}},
            "ProjectList": {"type": "array", "items": {"$ref": "#/components/schemas/Project"}},
            "Task": {"type": "object", "properties": {
                "id": {"type": "integer", "readOnly": True},
                "done": {"type": "boolean"},
                "title": {"type": "string", "minLength": 1}}},
            "TaskList": {"type": "array", "items": {"$ref": "#/components/schemas/Task"}},
            "Label": {"type": "object", "properties": {
                "id": {"type": "integer", "readOnly": True},
                "title": {"type": "string", "minLength": 1}}},
            "LabelList": {"type": "array", "items": {"$ref": "#/components/schemas/Label"}},
            "LabelTask": {"type": "object", "properties": {
                "label_id": {"type": "integer"}}, "required": ["label_id"]},
            "Comment": {"type": "object", "properties": {
                "id": {"type": "integer", "readOnly": True},
                "comment": {"type": "string"}}},
            "CommentList": {"type": "array", "items": {"$ref": "#/components/schemas/Comment"}},
        }},
    }


def _run(story_profile="full"):
    handle = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
    json.dump(_spec(), handle)
    handle.close()
    try:
        return run_pipeline(handle.name, "nested", "http://127.0.0.1:5000", seed=1,
                            story_profile=story_profile)
    finally:
        os.unlink(handle.name)


class NestedCollectionInferenceTests(unittest.TestCase):
    def test_minimal_smoke_omits_optional_values_and_non_post_actions(self):
        result = _run(story_profile="minimal-smoke")
        stories = result.stories_js
        self.assertIn('let title = "', stories)
        self.assertNotIn('bthread("update:', stories)
        self.assertNotIn('lifecycle:ReverseDeletion', stories)
        self.assertIn('bthread("action:', stories)
        self.assertIn('let labelId = captured["labelId"]', stories)

    def test_nested_collection_is_owned_by_child_entity(self):
        result = _run()
        by_key = {ep.entity.key: ep for ep in result.plan.entities}
        tasks = by_key["tasks"]
        projects = by_key["projects"]

        self.assertEqual(tasks.entity.collection_path, "/projects/{project}/tasks")
        self.assertEqual(tasks.create_op.op.operation_id, None)
        self.assertEqual(tasks.create_op.op.path, "/projects/{project}/tasks")
        self.assertFalse(any(op.op.path == "/projects/{project}/tasks" for op in projects.ops))
        self.assertTrue(any(p.rule == "E6:nested_collection_path"
                            for p in tasks.entity.provenance))

    def test_parameter_alias_yields_parent_dependency_and_order(self):
        result = _run()
        edges = {(edge["source"], edge["target"], edge["field_name"])
                 for edge in result.dependency_graph_report["edges"]}
        self.assertIn(("tasks", "projects", "project"), edges)
        self.assertLess(result.plan.graph.creation_order.index("projects"),
                        result.plan.graph.creation_order.index("tasks"))
        self.assertIn('deps["project"] = EventSet("wait:InstanceReady:', result.stories_js)
        self.assertIn('let project = captured["project"]', result.stories_js)

    def test_association_actions_bind_both_existing_entities(self):
        result = _run()
        task_ops = next(ep for ep in result.plan.entities if ep.entity.key == "tasks").ops
        attach = next(op for op in task_ops
                      if op.op.path == "/tasks/{task}/labels" and op.op.method == "POST")
        detach = next(op for op in task_ops
                      if op.op.path == "/tasks/{task}/labels/{label}" and op.op.method == "DELETE")
        self.assertEqual(set(attach.story_dependencies),
                         {("task", "tasks"), ("labelId", "labels")})
        self.assertEqual(set(detach.story_dependencies),
                         {("task", "tasks"), ("label", "labels")})

    def test_validated_lifecycle_is_sequential_and_uses_valid_put_update(self):
        result = _run(story_profile="validated-lifecycle")
        stories = result.stories_js
        self.assertIn('bthread("validated-lifecycle:contract-derived"', stories)
        self.assertIn("updateTask(", stories)
        self.assertIn("updateTask(true,", stories)
        expected = [
            "createProjectList(", "getProjectList(", "createTask(", "getTask(",
            "updateTask(", "getTask(", "createLabelList(", "getLabelList(",
            "labelsTask_2(", "labelsTask(", "labelsTask_3(",
            "labelsTask(", "deleteTask(", "deleteLabelList(", "deleteProjectList(",
        ]
        position = -1
        for fragment in expected:
            position = stories.find(fragment, position + 1)
            self.assertGreaterEqual(position, 0, fragment)
        self.assertNotIn('bthread("crud:', stories)

    def test_validated_action_lifecycle_derives_comment_subresource_chain(self):
        stories = _run(story_profile="validated-action-lifecycle").stories_js
        self.assertIn('bthread("validated-action-lifecycle:contract-derived"', stories)
        self.assertIn('__subresourceCreate.data.__httpResponse["id"]', stories)
        self.assertNotIn('let __subresourceId = __subresourceCreate.data["id"];', stories)
        expected = ["createProjectList(", "createTask(", "commentsTask_2(",
                    "commentsTask_4(", "commentsTask(", "commentsTask_5(",
                    "commentsTask_4(", "commentsTask_3(", "commentsTask(",
                    "deleteTask(", "deleteProjectList("]
        position = -1
        for fragment in expected:
            position = stories.find(fragment, position + 1)
            self.assertGreaterEqual(position, 0, fragment)


if __name__ == "__main__":
    unittest.main()
