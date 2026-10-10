"""Declarative owned-resource prefix graph; reuses the generator's provenance IR."""
import random
from .parsing.model import Provenance
VERSION='v014'
def schedule(nodes,seed):
    by={n['id']:n for n in nodes}
    if len(by)!=len(nodes):raise ValueError('Duplicate node ID')
    if any(d not in by for n in nodes for d in n['depends_on']):raise ValueError('Unknown dependency')
    rng=random.Random(seed);done=set();order=[]
    while len(done)<len(nodes):
        ready=sorted(k for k,n in by.items() if k not in done and set(n['depends_on'])<=done)
        if not ready:raise ValueError('Dependency cycle')
        chosen=rng.choice(ready);done.add(chosen);order.append(chosen)
    return order
def compile_prefix(rules,instances=2,rounds=3,seeds=(1,2,3),operation_pointers=None):
    if not 1<=instances<=10 or not 0<=rounds<=20:raise ValueError('Configuration bounds exceeded')
    resources=rules['resources'];byresource={r['resource']:r for r in resources};nodes=[];finals=[];suffix=[]
    byrule={(r['resource'],r['kind']):r for r in rules['rules']}
    def emit(id,operation,deps,phase,resource,index,**kw):
        n={'id':id,'operation':operation,'depends_on':sorted(set(deps)),'phase':phase,'resource':resource,'instance':index,'actor':'RESEARCH_OWNER','provenance':Provenance((operation_pointers or {}).get(operation,'UNRESOLVED_OPERATION_POINTER'),'GENERIC_OWN_RESOURCE_PREFIX_V014','Operation provenance is inherited from Stage 2; bindings remain review candidates.').to_dict(),**kw};nodes.append(n);return id
    for r in sorted(resources,key=lambda x:x['resource']):
        resource=r['resource'];update=byrule.get((resource,'UPDATE_READBACK'))
        if update is None:raise ValueError('Missing update rule: '+resource)
        for i in range(instances):
            stem=resource+'/'+str(i);parents=[];bindings={}
            for dep in rules['relationship_candidates']:
                if dep['kind']=='CREATE_PARENT_IDENTITY_CANDIDATE' and dep['child']==resource:
                    if len(dep['producer_resources'])!=1:raise ValueError('Unresolved parent identity')
                    parent=dep['producer_resources'][0];pid=parent+'/'+str(i)+'/create_read'
                    parents.append(pid);bindings[dep['path_slot']]={'producer':parent+'/'+str(i)+'/create','field':'id','review_required':True}
            create=emit(stem+'/create',r['create'],parents,'prefix',resource,i,capture={'slot':stem+'/id','field':'id'},bindings=bindings)
            last=emit(stem+'/create_read',r['read'],[create],'prefix',resource,i,identity_from=create,oracle_rule=resource+'_create_read')
            for j in range(rounds):
                change=emit(stem+'/prefix_update/'+str(j),update['operations'][1],[last],'prefix',resource,i,identity_from=create,scalar_version=j+1)
                last=emit(stem+'/prefix_read/'+str(j),r['read'],[change],'prefix',resource,i,identity_from=create,oracle_rule=update['id'],expected_from=change)
            finals.append(last);suffix.append((r,i,create,update))
    for r,i,create,update in suffix:
        stem=r['resource']+'/'+str(i)
        change=emit(stem+'/suffix_update',update['operations'][1],finals,'suffix',r['resource'],i,identity_from=create,scalar_version=rounds+1)
        emit(stem+'/suffix_read',r['read'],[change],'suffix',r['resource'],i,identity_from=create,oracle_rule=update['id'],expected_from=change)
    schedules=[{'seed':seed,'order':schedule(nodes,seed),'sampler':'PYTHON_TOPOLOGICAL_SAMPLER; NOT_NATIVE_PROVENGO'} for seed in seeds]
    return {'version':VERSION,'instances_per_resource':instances,'prefix_update_rounds':rounds,'nodes':nodes,'schedules':schedules,'node_count':len(nodes),'prefix_nodes':sum(n['phase']=='prefix' for n in nodes),'suffix_nodes':sum(n['phase']=='suffix' for n in nodes),'bindings_runtime_validated':False,'request_values_generated':False,'native_provengo_executed':False,'live_execution':False}
