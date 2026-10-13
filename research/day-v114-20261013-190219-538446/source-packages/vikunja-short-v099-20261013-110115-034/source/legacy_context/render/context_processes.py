"""Contract-bound observation processes. No application-specific action templates."""
import re
from .context_model import j, pointer


def infer_processes(c, entities, selections):
    plans=[]
    for selection in selections:
        method,sep,path=selection.partition(':')
        method=method.lower()
        if not sep or method not in ('post','put','patch'):
            raise ValueError('Use METHOD:/path for each observed action')
        item=c.raw.get('paths',{}).get(path,{})
        if method not in item: raise ValueError('Action absent from contract: '+selection)
        op=item[method]
        matches=[e for e in entities if path.startswith(e['detail']+'/')]
        if len(matches)!=1: raise ValueError('Action must bind to one scoped item path: '+selection)
        entity=matches[0]
        if re.findall(r'\{([^}]+)\}',path)!=[entity['parameter']]:
            raise ValueError('Additional route dependencies are not yet supported: '+selection)
        params=item.get('parameters',[])+op.get('parameters',[])
        if any(p.get('required') and p.get('in')!='path' for p in params):
            raise ValueError('Required query/header bindings are not yet supported: '+selection)
        schema=c.body(op)
        if schema.get('required') or schema.get('properties') or schema.get('type') not in (None,'object'):
            raise ValueError('Action body needs explicit typed dependency/transition binding: '+selection)
        body_spec=op.get('requestBody',{})
        if body_spec and 'application/json' not in body_spec.get('content',{}):
            raise ValueError('Only JSON action bodies are supported: '+selection)
        codes,_=c.response(op)
        if not codes: raise ValueError('No concrete documented success codes: '+selection)
        plans.append(dict(index=len(plans),entity=entity,method=method.upper(),path=path,codes=codes,
                          body={} if body_spec else None,source=pointer(path,method),
                          read_source=pointer(entity['detail'],'get')))
    if len({(p['method'],p['path']) for p in plans})!=len(plans):
        raise ValueError('Duplicate action selection')
    return plans


def render_processes(c,plans,instances,actor_plan=None):
    iface=[];stories=[];report=[]
    for p in plans:
        e=p['entity']; n=e['name']; fn='observeProcess'+str(p['index'])
        read_codes,_=c.response(e['get'])
        iface += ['// '+p['source'], 'function '+fn+'(resource,identityKey,routeKey,observationId'+(',actor,readbackActor' if actor_plan else '')+') {',
          '    bp.log.info("OBSERVATION_MODEL "+JSON.stringify(resource.expected));',
          '    var route="@{"+routeKey+"}";',
          '    var target={logicalId:resource.id,expected:cloneExpected(resource.expected),',
          '        identityField:'+j(e['id_field'])+',identityKey:identityKey,',
          '        url:'+j(e['detail'])+'.replace('+j('{'+e['parameter']+'}')+',route),codes:'+j(read_codes)+'};',
          *(['    target.actor=readbackActor;target.actionActor=actor;'] if actor_plan else []),
          '    requestObservedRest('+j(p['method'])+','+j(p['path'])+'.replace('+j('{'+e['parameter']+'}')+',route),',
          '        '+j(p['body'])+','+j(p['codes'])+',observationId,[target]);','}']
        bindings=[(i,a) for i in range(1,instances+1) for a in (actor_plan['process_actors'] if actor_plan else [None])]
        for i, actor in bindings:
            logical=n+'_'+str(i); key=logical.replace('-','_'); obs='process_'+str(p['index'])+'_'+key+('_'+actor if actor else '')
            stories += ['// Process from '+p['source']+'; independent readback from '+p['read_source'],
              'bthread('+j(obs)+',function(){',
              '    var resource=waitForResource('+j(logical)+','+str(2 if e['update'] else 1)+');',
              '    '+fn+'(resource,'+j('ID_'+key)+','+j('ROUTE_'+key)+','+j(obs)+(','+j(actor)+','+j(actor_plan['readback_actor'] or actor) if actor else '')+');',
              '    sync({waitFor:bp.Event("ObservationCompleted",{id:'+j(obs)+'})});','});']
            report.append(dict(bthread=obs,action_pointer=p['source'],readback_pointer=p['read_source'],
                               **({'actor':actor,'readback_actor':actor_plan['readback_actor'] or actor} if actor else {}),
                               resource=logical,dependency_rule='verified lifecycle revision; identity from DAL/RTV',
                               expected_state='verified DAL snapshot; transition semantics not inferred',
                               success_state_mismatch='recorded diagnostic; no implicit preservation assertion'))
    return '\n'.join(iface),'\n'.join(stories),report
