"""Choose deduplicated static plans and compose an owned-resource acceptance graph."""
import hashlib,json,pathlib
from analyze_v012 import analyze
from derive_v012 import build
from select_v012 import select
from generator_v56.transfer_prefix_v012 import compile_prefix
ROOT=pathlib.Path(__file__).resolve().parent
def prepare(raw,instances=1,depth=0,seed=1,candidate='all'):
    if instances not in (1,2) or depth not in (0,1,3,6) or seed not in range(1,11):
        raise ValueError('Configuration outside frozen protocol')
    contract=json.loads(raw.decode('utf-8-sig'))
    catalog=analyze(contract,hashlib.sha256(raw).hexdigest())
    if catalog['issues']:raise ValueError('Contract issues need review')
    selection=select(catalog,json.loads((ROOT/'PROTOCOL_v001.json').read_text()))
    seen={};plans=[];duplicates=[]
    for p in selection['plans']:
        fingerprint=hashlib.sha256(json.dumps(p['graph'],sort_keys=True,separators=(',',':')).encode()).hexdigest()
        if fingerprint in seen:duplicates.append({'removed':p['key'],'same_graph_as':seen[fingerprint]})
        else:seen[fingerprint]=p['key'];plans.append(p)
    selection['plans']=plans
    selection['duplicates_removed']=duplicates
    selection['trial_queue']=[{'trial':i+1,'seed':s,'plan':p['key'],'structural_request_estimate':p['structural_request_estimate']} for i,(s,p) in enumerate((s,p) for s in range(1,11) for p in plans)]
    retained={p['candidate'] for p in plans}
    selection['candidates']=[c for c in selection['candidates'] if c['key'] in retained]
    choices=selection['candidates'] if candidate=='all' else [c for c in selection['candidates'] if c['key']==candidate]
    if not choices:raise ValueError('No selected candidate: '+candidate)
    names={n for c in choices for n in c['closure']}
    derived=build(catalog)
    rules={**derived,'resources':[r for r in derived['resources'] if r['resource'] in names], 'rules':[r for r in derived['rules'] if r['resource'] in names], 'relationship_candidates':[r for r in derived['relationship_candidates'] if r.get('child') in names]}
    graph=compile_prefix(rules,instances,depth,(seed,),{o['key']:o['pointer'] for o in catalog['operations']})
    graph['contract_sha256']=catalog['contract_sha256']
    graph['selected_candidates']=[c['key'] for c in choices]
    graph['composition']='UNION_OF_RESOURCE_CLOSURES; SHARED_ANCESTOR_CREATED_ONCE_PER_INSTANCE'
    return contract,catalog,rules,selection,graph
