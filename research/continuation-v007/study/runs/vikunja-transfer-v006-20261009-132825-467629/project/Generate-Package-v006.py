"""Offline complete package derivation. Sends no HTTP requests."""
import argparse,json,pathlib,hashlib
from analyze_v006 import analyze
from derive_v006 import build
from generator_v56.transfer_prefix_v006 import compile_prefix
from generator_v56.transfer_stage5_v006 import write_full_package
p=argparse.ArgumentParser();p.add_argument('--contract',required=True,type=pathlib.Path);p.add_argument('--output',required=True,type=pathlib.Path);p.add_argument('--base-url',default='http://127.0.0.1:3456/api/v1');p.add_argument('--tag',default='offline');a=p.parse_args()
raw=a.contract.read_bytes();doc=json.loads(raw.decode('utf-8-sig'));cat=analyze(doc,hashlib.sha256(raw).hexdigest());rules=build(cat)
graph=compile_prefix(rules,2,3,(1,2,3),{o['key']:o['pointer'] for o in cat['operations']});graph['contract_sha256']=cat['contract_sha256']
report=write_full_package(graph,rules,doc,a.base_url,a.output,a.tag)
for name,obj in [('catalog_v006.json',cat),('rules_v006.json',rules),('graph_v006.json',graph)]: (a.output/name).write_text(json.dumps(obj,indent=2))
(a.output/'contract-source-v006.json').write_bytes(raw)
print('V006_OFFLINE_PACKAGE_GENERATED',report['step_count'])
