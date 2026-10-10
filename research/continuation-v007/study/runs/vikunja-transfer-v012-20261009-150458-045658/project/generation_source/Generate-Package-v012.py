"""Offline derivation of native JS and its complete generation-source snapshot."""
import argparse,json,pathlib
from prepare_v012 import prepare
from generator_v56.transfer_stage5_v012 import write_full_package
p=argparse.ArgumentParser()
p.add_argument('--contract',required=True,type=pathlib.Path)
p.add_argument('--output',required=True,type=pathlib.Path)
p.add_argument('--base-url',default='http://127.0.0.1:3456/api/v1')
p.add_argument('--instances',type=int,default=1)
p.add_argument('--depth',type=int,default=3)
p.add_argument('--seed',type=int,default=1)
p.add_argument('--candidate',default='all')
p.add_argument('--tag',default='offline')
a=p.parse_args()
contract,catalog,rules,selection,graph=prepare(a.contract.read_bytes(),a.instances,a.depth,a.seed,a.candidate)
report=write_full_package(graph,rules,contract,a.base_url,a.output,a.tag)
for name,obj in [('catalog_v012.json',catalog),('rules_v012.json',rules),('selection_v012.json',selection),('graph_v012.json',graph)]:
    (a.output/name).write_text(json.dumps(obj,indent=2),encoding='utf-8')
(a.output/'contract-source-v012.json').write_bytes(a.contract.read_bytes())
print('V012_OFFLINE_PACKAGE_GENERATED',report['step_count'])
