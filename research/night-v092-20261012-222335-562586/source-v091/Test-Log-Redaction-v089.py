import ast,tempfile,threading
from pathlib import Path
from types import SimpleNamespace
root=Path(__file__).resolve().parent
module=ast.parse((root/'run_recovery_v089.py').read_text())
fn=next(n for n in ast.walk(module) if isinstance(n,ast.FunctionDef) and n.name=='read_log')
with tempfile.TemporaryDirectory() as tmp:
 values={'run':Path(tmp),'gateway':SimpleNamespace(secrets=['','test-secret']), 'process':SimpleNamespace(stdout=iter(['normal log test-secret\n','Test Result: ERROR\n'])),'lines':[],'fatal':threading.Event()}
 exec(compile(ast.Module(body=[fn],type_ignores=[]),'actual-log-reader','exec'),values)
 values['read_log']()
 assert values['lines'][0]=='normal log [REDACTED]\n'
 assert values['fatal'].is_set()
 assert (Path(tmp)/'native.log').read_text()=='normal log [REDACTED]\nTest Result: ERROR\n'
print('V089_ACTUAL_LOG_READER_EMPTY_SECRET_AND_ERROR_TEST_PASS')
