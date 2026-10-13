import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parent
for name,h in json.loads((root/'MANIFEST_v101.json').read_text()).items():
 if hashlib.sha256((root/name).read_bytes()).hexdigest()!=h:raise SystemExit('Package mismatch: '+name)
print('V101_INTEGRITY_PASS')
