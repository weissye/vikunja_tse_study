import importlib.util
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'scripts'))
spec = importlib.util.spec_from_file_location(
    'builder', ROOT/'scripts/build_keycloak_parallel_ensemble.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


def scenario(index):
    family = ('same-field-one-successful-value-visible', 'noop-versus-change',
              'disjoint-put-serial-outcomes')[index % 3]
    events = [{'name': 'SBT:ScheduleChosen', 'data': {
        'kind': family, 'instance': index % 3 + 1,
        'first': ('AB', 'BA')[index % 2], 'seed': index}},
        {'name': 'REST', 'data': {'lib': 'REST', 'method': 'POST',
                                  'url': 'http://127.0.0.1/admin/realms/x/users'}}]
    events += [{'name': f'prefix-field:{index % 3 + 1}:{r}: selected',
                'data': {'lib': 'bp-base', 'type': 'selection',
                         'name': f'prefix-field:{index % 3 + 1}:{r}',
                         'value': ('a', 'b')[(index >> (r-1)) & 1]}}
               for r in range(1, 9)]
    events += [{'name': 'SBT:PrefixRoundScheduled', 'data': {'round': j}}
               for j in range(1, 9)]
    events += [{'name': 'SBT:SerialOrderScheduled', 'data': {'order': order}}
               for order in ('AB', 'BA')]
    events += [{'name': 'SBT:RaceStart', 'data': {}},
               {'name': 'REST', 'data': {'lib': 'REST', 'method': 'POST',
                                         'url': 'http://127.0.0.1/__sbt_race'}}]
    events += [{'name': 'SBT:ConcurrentWriteScheduled', 'data': {'operation': label}}
               for label in ('A', 'B')]
    events += [{'name': 'REST', 'data': {'lib': 'REST', 'method': 'GET',
                                        'url': 'http://127.0.0.1/admin/realms/x/users/y'}}]
    return events


class EnsembleBuilderTests(unittest.TestCase):
    def test_prefix_choices_expand_symbolic_schedules(self):
        spec = importlib.util.spec_from_file_location(
            'generator', ROOT/'scripts/prepare_runtime_bound_sample.py')
        generator = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(generator)
        fixture = ROOT/'tests/fixtures'
        plan = json.loads((fixture/'runtime_sample_plan.json').read_text())
        controls = json.loads((fixture/'runtime_sample_controls.json').read_text())
        code, _ = generator.render(plan, controls)
        self.assertEqual(code.count('select("prefix-field:'), 24)
        self.assertIn('b["firstName"]="sbt-prefix-1"', code)
        self.assertIn('b["lastName"]="sbt-prefix-8"', code)
        self.assertIn('/__sbt_race', code)
        for instance in range(1, 4):
            for round_index in range(1, 9):
                for option in ('a', 'b'):
                    key = f'sbt_prefix_body_{instance}_{round_index}_{option}'
                    self.assertIn('pvg.rtv.set("'+key+'"', code)
                    self.assertIn('body:"@{'+key+'}"', code)
        self.assertNotIn('pvg.rtv.set("sbt_prefix_body_1",', code)
        self.assertIn('sbt_control_body_1_1_AB_BA_A', code)
        self.assertIn('sbt_control_body_1_1_BA_AB_A', code)

    def test_six_batches_select_fifteen_and_remove_raw_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            plan = root/'plan.json'; plan.write_text('{}')
            controls = root/'controls.json'; controls.write_text('{}')
            out = root/'output'
            batches = iter(range(6))

            def fake_run(command, **kwargs):
                if 'prepare_runtime_bound_sample.py' in str(command[1]):
                    project = out/'model/provengo_project/spec/js'
                    project.mkdir(parents=True)
                    (project/'runtime-bound.generated.js').write_text(
                        '/__sbt_race' + 'select("prefix-field:' * 24)
                    return subprocess.CompletedProcess(command, 0, '', '')
                number = next(batches)
                self.assertEqual(command[0], 'C:\\tools\\provengo.cmd')
                output = Path(command[command.index('-o')+1])
                output.write_text(json.dumps([scenario(number*50+i)
                                              for i in range(50)]))
                return subprocess.CompletedProcess(command, 0)

            args = type('Args', (), {'plan': plan, 'controls': controls,
                                     'out': out, 'timeout_seconds': 10})()
            with patch.object(builder.subprocess, 'run', side_effect=fake_run), \
                 patch.object(builder.shutil, 'which', return_value='C:\\tools\\provengo.cmd'), \
                 redirect_stdout(io.StringIO()):
                builder.build(args)
            manifest = json.loads((out/'sampling-manifest.json').read_text())
            self.assertEqual(manifest['result'], 'ENSEMBLE_15_READY')
            self.assertEqual(len(manifest['batch_archives']), 6)
            self.assertEqual(len(json.loads((out/'ensemble-15.json').read_text())), 15)
            self.assertEqual(len(list(out.glob('batch-*-samples-50.json'))), 0)
            with zipfile.ZipFile(out/'parallel-ensemble-15.zip') as archive:
                self.assertIn('ranking-report.json', archive.namelist())


if __name__ == '__main__':
    unittest.main()
