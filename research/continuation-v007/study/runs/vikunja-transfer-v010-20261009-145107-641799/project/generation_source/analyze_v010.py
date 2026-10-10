#!/usr/bin/env python3
"""Offline OpenAPI inventory and relationship candidates. No HTTP or JS execution."""
import argparse,datetime,hashlib,json,pathlib,re,zipfile
VERSION='v010'
METHODS={'get','put','post','patch','delete','head','options','trace'}
def pointer(*parts):return '#/'+ '/'.join(str(x).replace('~','~0').replace('/','~1') for x in parts)
def resolve(doc,ref):
    if not isinstance(ref,str) or not ref.startswith('#/'):return None
    obj=doc
    try:
        for p in ref[2:].split('/'):obj=obj[p.replace('~1','/').replace('~0','~')]
        return obj
    except (KeyError,TypeError):return None
def deref(doc,obj,seen=()):
    if isinstance(obj,dict) and '$ref' in obj:
        ref=obj['$ref']
        if ref in seen:return {}
        target=resolve(doc,ref)
        if target is None:return {}
        return deref(doc,target,seen+(ref,))
    return obj if isinstance(obj,dict) else {}
def fields(doc,schema,loc,seen=()):
    if not isinstance(schema,dict):return []
    if '$ref' in schema:
        r=schema['$ref']
        if r in seen:return []
        return fields(doc,resolve(doc,r),r,seen+(r,))
    result=[]
    for name,p in schema.get('properties',{}).items():
        q=deref(doc,p)
        result.append({'name':name,'pointer':loc+'/properties/'+name.replace('~','~0').replace('/','~1'),'type':q.get('type'),'format':q.get('format'),'ref':p.get('$ref'),'required':name in schema.get('required',[]),'read_only':q.get('readOnly',False),'write_only':q.get('writeOnly',False),'writable_candidate':not q.get('readOnly',False),'branch_condition':'DIRECT_OR_ALLOF'})
    for i,p in enumerate(schema.get('allOf',[])):result+=fields(doc,p,loc+'/allOf/'+str(i),seen)
    return result
def walk(obj,loc='#'):
    if isinstance(obj,dict):
        for k,v in obj.items():
            pl=loc+'/'+k.replace('~','~0').replace('/','~1')
            if k=='$ref':yield {'pointer':pl,'target':v}
            yield from walk(v,pl)
    elif isinstance(obj,list):
        for i,v in enumerate(obj):yield from walk(v,loc+'/'+str(i))
def schema_entries(obj,loc):
    if obj.get('schema'):return [{'pointer':loc+'/schema','schema':obj['schema']}]
    return [{'pointer':loc+'/content/'+mime.replace('~','~0').replace('/','~1')+'/schema','media_type':mime,'schema':v['schema']} for mime,v in obj.get('content',{}).items() if isinstance(v,dict) and 'schema' in v]
def analyze(doc,source_hash):
    if not isinstance(doc.get('paths'),dict) or not (doc.get('openapi') or doc.get('swagger')):raise ValueError('Expected JSON OpenAPI or Swagger document.')
    operations=[];issues=[];relations=[]
    schemas=doc.get('components',{}).get('schemas',doc.get('definitions',{}))
    schbase=['components','schemas'] if 'components' in doc else ['definitions']
    refs=list(walk(doc))
    for r in refs:
        if not isinstance(r['target'],str) or not r['target'].startswith('#/'):
            issues.append({'kind':'EXTERNAL_REF_NOT_FETCHED',**r})
        elif resolve(doc,r['target']) is None:issues.append({'kind':'UNRESOLVED_LOCAL_REF',**r})
        else:relations.append({'kind':'EXPLICIT_SCHEMA_OR_DOCUMENT_REFERENCE','provenance':'EXPLICIT_CONTRACT_STRUCTURE',**r,'operational_dependency_confirmed':False})
    for path,item0 in sorted(doc['paths'].items()):
        item=deref(doc,item0)
        for method,op0 in sorted(item.items()):
            if method not in METHODS:continue
            op=deref(doc,op0);loc=pointer('paths',path,method)
            merged={}
            for origin,params in ((pointer('paths',path),item.get('parameters',[])),(loc,op.get('parameters',[]))):
                for i,p0 in enumerate(params):
                    p=deref(doc,p0);merged[(p.get('in'),p.get('name'))]={'pointer':origin+'/parameters/'+str(i),**p}
            params=list(merged.values());bodies=[]
            for p in params:
                if p.get('in')=='body':bodies+=schema_entries(p,p['pointer'])
            if 'requestBody' in op:bodies+=schema_entries(deref(doc,op['requestBody']),loc+'/requestBody')
            responses=[]
            for code,r0 in op.get('responses',{}).items():
                if str(code).startswith('2'):
                    responses.append({'code':str(code),'schemas':schema_entries(deref(doc,r0),loc+'/responses/'+str(code))})
            missing=[n for n in re.findall(r'\{([^}]+)\}',path) if not any(p.get('in')=='path' and p.get('name')==n for p in params)]
            if missing:issues.append({'kind':'PATH_PARAMETER_MISSING','pointer':loc,'names':missing})
            segments=[s for s in path.split('/') if s and not s.startswith('{')]
            selected=True
            opentry={'key':method.upper()+' '+path,'pointer':loc,'operation_id':op.get('operationId'),'method':method.upper(),'path':path,'tags':op.get('tags',[]),'parameters':params,'request_schemas':bodies,'success_responses':responses,'security':op.get('security',doc.get('security',[])),'selected_family':selected,'selection_provenance':'ALL_OPERATIONS_STATIC_CONSIDERATION' if selected else None}
            opentry['request_fields']=[{'media_type':b.get('media_type'),**f} for b in bodies for f in fields(doc,b['schema'],b['pointer'])]
            operations.append(opentry)
            for p in params:
                if p.get('in')=='path':relations.append({'kind':'PATH_IDENTITY_SLOT','name':p.get('name'),'pointer':p['pointer'],'operation':opentry['key'],'provenance':'EXPLICIT_PARAMETER; RESOURCE_ROLE_INFERRED_FROM_PATH','operational_dependency_confirmed':False})
    catalog=[{'schema':name,'pointer':pointer(*schbase,name),'fields':fields(doc,s,pointer(*schbase,name)),'composition_branches':{k:len(s.get(k,[])) for k in ('oneOf','anyOf') if s.get(k)}} for name,s in sorted(schemas.items())]
    selected=[o for o in operations if o['selected_family']]
    candidates=[]
    for o in selected:
        if o['method'] in {'PUT','PATCH','DELETE'}:
            reads=[r for r in selected if r['path']==o['path'] and r['method']=='GET']
            candidates.append({'mutation':o['key'],'readback_operations':[r['key'] for r in reads],'provenance':'GENERIC_SAME_PATH_MUTATION_READBACK_RULE','status':'STRUCTURAL_CANDIDATE' if len(reads)==1 else 'UNRESOLVED','semantic_expectation':'NOT_INFERRED','creation_prefix':'NOT_GENERATED'})
    return {'version':VERSION,'contract_sha256':source_hash,'contract_info':doc.get('info',{}),'specification_version':doc.get('openapi',doc.get('swagger')),'servers_declared':doc.get('servers',[]),'operation_count':len(operations),'schema_count':len(schemas),'selected_operation_count':len(selected),'operations':operations,'resource_schema_catalog':catalog,'relationship_map':relations,'readback_candidates':candidates,'issues':issues,'source_authority':'ARCHIVED_OR_USER_SELECTED_CONTRACT; LIVE_MATCH_NOT_VERIFIED','live_execution':False}
def main():
    p=argparse.ArgumentParser();p.add_argument('--contract',required=True,type=pathlib.Path);p.add_argument('--output',required=True,type=pathlib.Path);a=p.parse_args()
    raw=a.contract.read_bytes();doc=json.loads(raw.decode('utf-8-sig'));result=analyze(doc,hashlib.sha256(raw).hexdigest())
    a.output.mkdir(parents=True,exist_ok=False)
    (a.output/'CATALOG_v010.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    summary={k:result[k] for k in ('version','contract_sha256','contract_info','specification_version','operation_count','schema_count','selected_operation_count','source_authority','live_execution')}
    summary.update({'issue_count':len(result['issues']),'status':'STATIC_ANALYSIS_COMPLETE' if not result['issues'] else 'STATIC_ANALYSIS_COMPLETE_WITH_ISSUES'})
    (a.output/'SUMMARY_v010.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    manifest={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in a.output.iterdir() if f.is_file()}
    (a.output/'MANIFEST_RESULTS_v010.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    archive=a.output.with_suffix('.zip')
    with zipfile.ZipFile(archive,'x',zipfile.ZIP_DEFLATED) as z:
        for f in sorted(a.output.iterdir()):z.write(f,f.name)
    print('VIKUNJA_CONTRACT_ANALYZER v010');print(json.dumps(summary));print('Review ZIP:',archive)
if __name__=='__main__':main()
