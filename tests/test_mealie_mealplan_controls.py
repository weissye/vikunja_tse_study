import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'mealie_identifier_binding_0266' / 'scripts'))
from confirm_mealie_mealplan_create import control_result


class TestControls(unittest.TestCase):
    def test_success_is_read_by_id_but_id_not_exported(self):
        with patch('confirm_mealie_mealplan_create.call', side_effect=[
                (201, {'id': '123e4567-e89b-12d3-a456-426614174000', 'secret': 'PRIVATE'}),
                (200, {'secret': 'PRIVATE'})]) as request:
            result = control_result('token', 'text_only', {'date': '2026-10-01', 'text': 'PRIVATE'})
        self.assertEqual(result, {'case': 'text_only', 'status': 201,
                                  'field_names': ['date', 'text'], 'read_status': 200})
        self.assertEqual(request.call_count, 2)
        self.assertNotIn('PRIVATE', str(result))

    def test_error_returns_only_structural_fields(self):
        with patch('confirm_mealie_mealplan_create.call', return_value=(422, {
                'detail': [{'loc': ['body', 'recipe_id'], 'type': 'value_error',
                            'msg': 'SECRET'}]})):
            result = control_result('token', 'date_only', {'date': '2026-10-01'})
        self.assertEqual(result['validation']['errors'][0]['type'], 'value_error')
        self.assertNotIn('SECRET', str(result))


if __name__ == '__main__':
    unittest.main()
