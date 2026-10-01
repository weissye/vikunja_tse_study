"""Contract-level regression for inferred producer IDs and ambiguity guards."""
import sys
import unittest
from pathlib import Path

root = Path(__file__).resolve().parents[1]
generator = root / 'generator_baseline'
if not (generator / 'openapi_to_sbt' / 'render' / 'plan.py').exists():
    generator = root / 'test_generator'
sys.path.insert(0, str(generator))

from openapi_to_sbt.inference.dependencies import _match_structural_id_field
from openapi_to_sbt.inference.entities import EntityCandidate
from openapi_to_sbt.parsing.model import Operation, Parameter, ResponseSpec


def resource(path, get_id=True, create_response='object'):
    item = path + '/{slug}'
    get_schema = {'type': 'object', 'properties': {}}
    if get_id:
        get_schema['properties']['id'] = {'anyOf': [
            {'type': 'string', 'format': 'uuid4'}, {'type': 'null'}]}
    create_schema = ({'type': 'string'} if create_response == 'string' else
                     {'type': 'object', 'properties': {
                         'id': {'type': 'string', 'format': 'uuid4'}}})
    return EntityCandidate(key=path.strip('/'), display_name='Resource',
                           plural_display_name='Resources', schema_name=None,
                           family_segment=path.rsplit('/', 1)[-1],
                           collection_path=path, item_path=item, operations=[
                               Operation('create', 'POST', path, responses=[
                                   ResponseSpec('201', {'application/json': create_schema})]),
                               Operation('read', 'GET', item, parameters=[
                                   Parameter('slug', 'path', True, {'type': 'string'})], responses=[
                                   ResponseSpec('200', {'application/json': get_schema})])])


class StructuralIdTests(unittest.TestCase):
    def setUp(self):
        self.consumer = EntityCandidate(
            key='api/recipes/events', display_name='Event',
            plural_display_name='Events', schema_name=None,
            family_segment='events', collection_path='/api/recipes/events')
        self.id_field = {'type': 'string', 'format': 'uuid4'}

    def test_ancestor_requires_readable_matching_id(self):
        producer = resource('/api/recipes', create_response='string')
        self.assertEqual(_match_structural_id_field('recipeId', self.id_field,
                                                     self.consumer, [producer]),
                         ('api/recipes', 'structural_verified_id'))
        self.assertIsNone(_match_structural_id_field('recipeId', self.id_field,
                                                     self.consumer, [resource('/api/recipes', get_id=False)]))

    def test_sibling_compound_alias_and_format(self):
        consumer = EntityCandidate(key='api/households/shopping/items',
            display_name='Item', plural_display_name='Items', schema_name=None,
            family_segment='items', collection_path='/api/households/shopping/items')
        producer = resource('/api/households/shopping/lists')
        self.assertEqual(_match_structural_id_field('shoppingListId', self.id_field,
                                                     consumer, [producer])[0], producer.key)
        self.assertIsNone(_match_structural_id_field('shoppingListId',
                            {'type': 'integer'}, consumer, [producer]))

    def test_unrelated_or_ambiguous_producer_is_rejected(self):
        producer = resource('/api/recipes', create_response='string')
        unrelated = resource('/api/other/recipes', create_response='string')
        self.assertIsNone(_match_structural_id_field('recipeId', self.id_field,
                                                     self.consumer, [unrelated]))
        self.assertIsNone(_match_structural_id_field('recipeId', self.id_field,
                                                     self.consumer, [producer, producer]))


if __name__ == '__main__':
    unittest.main()
