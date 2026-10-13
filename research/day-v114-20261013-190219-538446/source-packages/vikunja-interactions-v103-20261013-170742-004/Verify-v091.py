import json,hashlib
from pathlib import Path
r=Path(__file__).resolve().parent
for n,h in json.loads((r/'MANIFEST_v091.json').read_text()).items():
 if hashlib.sha256((r/n).read_bytes()).hexdigest()!=h:raise SystemExit('Mismatch: '+n)
print('V091_INTEGRITY_PASS')
