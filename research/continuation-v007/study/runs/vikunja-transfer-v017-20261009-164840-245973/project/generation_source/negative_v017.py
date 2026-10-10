"""Bounded request-schema rejection checks for selected owned-resource scalars."""
import copy
from generator_v56.transfer_stage5_v017 import resolve

def cases(contract, rules):
    result=[];blocked=[]
    updates={r['resource']:r for r in rules['rules'] if r['kind']=='UPDATE_READBACK'}
    for resource in rules['resources']:
        name=resource['resource'];operation=updates[name]['operations'][1]
        method,path=operation.split(' ',1);op=contract['paths'][path][method.lower()]
        params=op.get('parameters',[])+contract['paths'][path].get('parameters',[])
        bodies=[resolve(contract,p) for p in params if resolve(contract,p).get('in')=='body']
        if len(bodies)!=1 or '400' not in op.get('responses',{}):
            blocked.append({'resource':name,'reason':'NO_SINGLE_SWAGGER_BODY_OR_DOCUMENTED_400'});continue
        schema=resolve(contract,bodies[0]['schema']);field=resource['scalar']['field'];prop=resolve(contract,schema.get('properties',{}).get(field,{}))
        if prop.get('type')!='string':
            blocked.append({'resource':name,'reason':'FIRST_INCREMENT_SUPPORTS_SELECTED_STRING_FIELDS_ONLY'});continue
        values=[('TYPE','type',42),('TYPE_BOOLEAN','type',False),('TYPE_ARRAY','type',[]),('TYPE_OBJECT','type',{})]
        if isinstance(prop.get('minLength'),int) and prop['minLength']>0:
            values.append(('MIN_LENGTH','minLength','x'*(prop['minLength']-1)))
        if isinstance(prop.get('maxLength'),int):
            if prop['maxLength']<=4096:values.append(('MAX_LENGTH','maxLength','x'*(prop['maxLength']+1)))
            else:blocked.append({'resource':name,'reason':'MAX_LENGTH_EXCEEDS_BOUNDED_PAYLOAD_POLICY'})
        for kind,constraint,value in values:
            # Do not claim isolated violations if enum/pattern would also reject.
            if constraint!='type' and (prop.get('enum') or prop.get('pattern')):
                blocked.append({'resource':name,'kind':kind,'reason':'COMPOUND_CONSTRAINT_REQUIRES_ISOLATION'});continue
            result.append({'resource':name,'operation':operation,'field':field,'kind':kind,'constraint':constraint,'declared_constraint':prop[constraint],'invalid_value':value,'expected_status':400,'documented_status_codes':sorted(op.get('responses',{})),'rejection_policy':'HTTP_4XX_AND_UNCHANGED_PROJECTION; STATUS_DOCUMENTATION_REPORTED_SEPARATELY','expected_status_basis':'DOCUMENTED_400_INVALID_OBJECT_PLUS_REQUEST_SCHEMA_VIOLATION','schema_pointer':bodies[0]['schema'].get('$ref',resource['scalar']['request_pointer'].rsplit('/properties/',1)[0])+'/properties/'+field+'/'+constraint,'response_pointer':'#/paths/'+path.replace('~','~0').replace('/','~1')+'/'+method.lower()+'/responses/400','state_oracle':'DECLARED_RESEARCH_POLICY_REJECTED_WRITE_PRESERVES_ID_SCALAR_AND_PARENT_PROJECTION; NOT_EXPLICIT_CONTRACT_POSTCONDITION'})
    return {'version':'v017','cases':result,'blocked':blocked,'scope':'SELECTED_STRING_UPDATE_FIELDS; OWN_CREATED_RESOURCES','live_execution':False}

def extend(graph, catalog):
    graph=copy.deepcopy(graph);nodes=graph['nodes'];old=list(nodes)
    prefix=[n for n in old if n['phase']=='prefix'];last={}
    for n in prefix:
        if '/prefix_read/' in n['id'] or n['id'].endswith('/create_read'):last[(n['resource'],n['instance'])]=n
    finals=[n['id'] for n in last.values()];terminal=[]
    for (resource,index),base in sorted(last.items()):
        previous=base['id'];create=resource+'/'+str(index)+'/create'
        for case in [c for c in catalog['cases'] if c['resource']==resource]:
            stem=resource+'/'+str(index)+'/negative/'+case['kind']
            negative={'id':stem+'/request','operation':case['operation'],'depends_on':sorted(set(finals+[previous])),'phase':'negative','resource':resource,'instance':index,'actor':'RESEARCH_OWNER','identity_from':create,'negative_case':case,'provenance':{**base['provenance'],'pointer':case['response_pointer'].split('/responses/')[0]}}
            read={'id':stem+'/readback','operation':base['operation'],'depends_on':[negative['id']],'phase':'negative_readback','resource':resource,'instance':index,'actor':'RESEARCH_OWNER','identity_from':create,'negative_after':negative['id'],'baseline_from':previous,'expected_from':base.get('expected_from',create),'provenance':base['provenance']}
            nodes.extend([negative,read]);previous=read['id']
        terminal.append(previous)
    for n in nodes:
        if n['phase']=='suffix' and '/suffix_update' in n['id']:n['depends_on']=sorted(set(n['depends_on']+terminal))
    from generator_v56.transfer_prefix_v017 import schedule
    graph.update(node_count=len(nodes),negative_nodes=sum(n['phase'].startswith('negative') for n in nodes),negative_cases=sum('negative_case' in n for n in nodes),schedules=[{'seed':s['seed'],'order':schedule(nodes,s['seed']),'sampler':'PYTHON_TOPOLOGICAL_SAMPLER; NOT_NATIVE_PROVENGO'} for s in graph['schedules']])
    return graph
