import pathlib
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]/'scripts'))
from prepare_keycloak_provengo_sample_project import MODEL, prepare


class PrepareTests(unittest.TestCase):
    def test_copies_generated_model_without_modifying_campaign(self):
        with tempfile.TemporaryDirectory() as temp:
            root=pathlib.Path(temp)
            for folder,filename in MODEL:
                src=root/'campaign'/folder
                src.mkdir(parents=True,exist_ok=True)
                (src/filename).write_text(filename)
            def fake_run(command, **_):
                project=pathlib.Path(command[-1]); (project/'config').mkdir(parents=True)
                (project/'config/provengo.yml').write_text('name: test')
                (project/'spec/js').mkdir(parents=True)
                (project/'spec/js/hello-world.js').write_text('example')
                return type('Result',(),{'returncode':0})()
            with patch('prepare_keycloak_provengo_sample_project.subprocess.run',side_effect=fake_run):
                result=prepare(root/'campaign',root/'output','provengo')
            self.assertEqual(result['runtime_status'],'NOT_RUN')
            self.assertFalse((root/'output/provengo_project/spec/js/hello-world.js').exists())
            for _,filename in MODEL:
                self.assertEqual((root/'output/provengo_project/spec/js'/filename).read_text(),filename)

    def test_rejects_campaign_without_generated_js(self):
        with tempfile.TemporaryDirectory() as temp:
            root=pathlib.Path(temp)
            with self.assertRaisesRegex(ValueError,'missing generated'):
                prepare(root,root/'out','provengo')

if __name__=='__main__': unittest.main()
