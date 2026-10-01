"""Contract-only regression tests for inferred prerequisite identities."""
import unittest

from openapi_to_sbt.inference.dependencies import (infer_dependencies, match_field_to_entity,
                                                    match_array_ids_to_entity)
from openapi_to_sbt.inference.entities import EntityCandidate
from openapi_to_sbt.inference.keys import KeyInfo
from openapi_to_sbt.parsing.model import Document, Operation, RequestBody, RequestBodyVariant
from openapi_to_sbt.render.stories_js import _dependency_assignment_expr
from types import SimpleNamespace


def entity(key, field, create=False, properties=None):
    collection = "/" + key
    operations = []
    if create:
        operations.append(Operation(None, "POST", collection, request_body=RequestBody(
            variants=[RequestBodyVariant("application/json", {"properties": properties or {}})])))
    return EntityCandidate(key=key, display_name=key.split("/")[-1],
        plural_display_name=key.split("/")[-1], schema_name=None,
        family_segment=key.split("/")[-1], collection_path=collection,
        item_path=collection + "/{" + field + "}", operations=operations)


class DependencyProducerTests(unittest.TestCase):
    def test_read_only_consumer_cannot_become_foreign_key_producer(self):
        consumer = entity("api/users/self/ratings", "recipe_id")
        dependent = entity("api/households/mealplans", "item_id", True,
                           {"recipeId": {"type": "string"}})
        keys = {e.key: KeyInfo([e.item_path.split("{")[1][:-1]], False, .8)
                for e in (consumer, dependent)}
        self.assertEqual([], infer_dependencies(Document("x", "1", "3"),
                                                [consumer, dependent], keys))

    def test_same_namespace_single_creatable_producer_preserved(self):
        producer = entity("api/groups/teams", "group_id", True)
        dependent = entity("api/groups/members", "item_id", True,
                           {"group_id": {"type": "integer"}})
        keys = {e.key: KeyInfo([e.item_path.split("{")[1][:-1]], False, .8)
                for e in (producer, dependent)}
        edges = infer_dependencies(Document("x", "1", "3"), [producer, dependent], keys)
        self.assertEqual([("api/groups/members", "api/groups/teams", "group_id")],
                         [(e.source, e.target, e.field_name) for e in edges])

    def test_identical_keys_across_namespace_and_ambiguous_keys_not_guessed(self):
        producer = entity("api/admin/backups", "file_name", True)
        media = entity("api/media/users", "item_id", True, {"file_name": {"type": "string"}})
        keys = {e.key: KeyInfo([e.item_path.split("{")[1][:-1]], False, .8)
                for e in (producer, media)}
        self.assertEqual([], infer_dependencies(Document("x", "1", "3"),
                                                [producer, media], keys))
        a, b = entity("users", "foreign_id", True), entity("groups", "foreign_id", True)
        keys = {e.key: KeyInfo(["foreign_id"], False, .8) for e in (a, b)}
        self.assertIsNone(match_field_to_entity("foreign_id", [a, b], keys))

    def test_named_id_array_uses_producer_and_renders_array(self):
        asset = entity("assets", "id", True)
        album = entity("albums", "id", True,
                       {"assetIds": {"type": "array", "items": {"type": "string", "format": "uuid"}}})
        keys = {e.key: KeyInfo(["id"], False, 1.) for e in (asset, album)}
        edges = infer_dependencies(Document("x", "1", "3"), [album, asset], keys)
        self.assertEqual([("albums", "assets", "assetIds")],
                         [(e.source, e.target, e.field_name) for e in edges])
        self.assertEqual('[captured["assetIds"]]', _dependency_assignment_expr(
            "assetIds", SimpleNamespace(key=keys["assets"]),
            {"type": "array", "items": {"type": "string"}}))

    def test_unnamed_or_untyped_array_does_not_invent_dependency(self):
        asset = entity("assets", "id", True)
        keys = {"assets": KeyInfo(["id"], False, 1.)}
        for name, schema in (("ids", {"type": "array", "items": {"type": "string"}}),
                             ("assetIds", {"type": "array", "items": {"type": "object"}})):
            self.assertIsNone(match_array_ids_to_entity(name, schema, "albums", [asset], keys))


if __name__ == "__main__":
    unittest.main()
