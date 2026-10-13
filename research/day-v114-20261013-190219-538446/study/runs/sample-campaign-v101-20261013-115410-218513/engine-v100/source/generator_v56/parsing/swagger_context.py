"""Conservative Swagger 2 JSON normalization for the existing Context renderer."""
import copy

def normalize_context_contract(raw):
    if raw.get('openapi','').startswith('3.'):
        return raw, {'mode':'IDENTITY_OPENAPI3'}
    if raw.get('swagger')!='2.0':
        raise ValueError('Unsupported contract dialect')
    def refs(v):
        if isinstance(v,dict):
            return {k:(x.replace('#/definitions/','#/components/schemas/') if k=='$ref' and isinstance(x,str) else refs(x)) for k,x in v.items()}
        if isinstance(v,list):return [refs(x) for x in v]
        return v
    doc=refs(copy.deepcopy(raw))
    schemas=doc.pop('definitions',{})
    for name,schema in schemas.items():schema.setdefault('title',name)
    schemes={}
    for name,scheme in doc.pop('securityDefinitions',{}).items():
        if scheme.get('type')=='apiKey' and scheme.get('in')=='header' and scheme.get('name','').lower()=='authorization':
            schemes[name]={'type':'http','scheme':'bearer'}
        else:schemes[name]=scheme
    doc['components']={'schemas':schemas,'securitySchemes':schemes}
    for path,item in doc['paths'].items():
        for method,op in item.items():
            if method not in ('get','post','put','patch','delete','options','head'):continue
            parameters=op.get('parameters',[])
            if any('$ref' in p for p in parameters):raise ValueError('Referenced Swagger parameters require explicit normalization')
            bodies=[p for p in parameters if p.get('in')=='body']
            if len(bodies)>1:raise ValueError('Multiple body parameters: '+path)
            forms=[p for p in parameters if p.get('in')=='formData']
            if forms:
                op['requestBody']={'content':{'multipart/form-data':{'schema':{'type':'object','properties':{p['name']:({'type':'string','format':'binary'} if p.get('type')=='file' else {k:p[k] for k in ('type','format','items','enum') if k in p}) for p in forms},'required':[p['name'] for p in forms if p.get('required')]}}}}
            if bodies:
                if 'application/json' not in op.get('consumes',raw.get('consumes',[])):raise ValueError('Non-JSON body: '+path)
                b=bodies[0];op['requestBody']={'required':b.get('required',False),'content':{'application/json':{'schema':b['schema']}}}
            op['parameters']=[p for p in parameters if p.get('in') not in ('body','formData')]
            for p in op['parameters']:
                if 'schema' not in p:p['schema']={k:p.pop(k) for k in list(p) if k in ('type','format','enum','items','minimum','maximum','default')}
            for response in op.get('responses',{}).values():
                if '$ref' in response:raise ValueError('Referenced Swagger response requires explicit normalization')
                if 'schema' in response:response['content']={'application/json':{'schema':response.pop('schema')}}
    doc.pop('swagger');doc['openapi']='3.0.3'
    return doc,{'mode':'SWAGGER2_JSON_INTERNAL_VIEW','source_unchanged':True,'methods_unchanged':True,'ref_rewrite':'#/definitions/ -> #/components/schemas/','bearer_mapping':'Authorization header API-key declaration treated as bearer integration hypothesis'}
