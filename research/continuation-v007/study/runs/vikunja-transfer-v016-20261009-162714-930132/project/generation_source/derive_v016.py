#!/usr/bin/env python3
"""Derive declarative positive consistency rules from a verified Stage 2 catalog."""
import argparse,hashlib,json,pathlib,re,zipfile
VERSION='v016'
POLICY={'version':VERSION,'actor_scope':'SINGLE_RESEARCH_ACTOR_OWN_CREATED_RESOURCES','field_priority':['title','name'],'eligible_types':['string'],'exclude_formatted_fields':True,'semantic_assumptions':['selected scalar roundtrips without normalization','a successful update persists its selected scalar','resource identity remains stable across reads and updates'],'source':'DECLARED_GENERIC_RESEARCH_POLICY; NOT_INFERRED_FROM_OPENAPI','request_values':'NOT_GENERATED','live_enabled':False}
def digest(b):return hashlib.sha256(b).hexdigest()
def noun(path):
    segments=[s for s in path.split('/') if s and not s.startswith('{')]
    return segments[-1].rstrip('s').lower() if segments else ''
def placeholders(path):return re.findall(r'\{([^}]+)\}',path)
def response_schemas(op):
    return [s['schema'].get('$ref','').rsplit('/',1)[-1] for r in op['success_responses'] for s in r['schemas'] if s['schema'].get('$ref')]
def response_fields(op,schemas):
    return {f['name']:f for name in response_schemas(op) for f in schemas.get(name,{}).get('fields',[])}
def build(cat):
    schemas={s['schema']:s for s in cat['resource_schema_catalog']};ops=[o for o in cat['operations'] if o['selected_family']]
    resources=[];unresolved=[];rules=[];relations=[]
    for create in [o for o in ops if o['method'] in ('POST','PUT') and not o['path'].endswith('}') and any(r['code']=='201' for r in o['success_responses'])]:
        typed=response_fields(create,schemas)
        if 'id' not in typed:
            unresolved.append({'operation':create['key'],'reason':'NO_ROOT_ID_FIELD; POSSIBLE_RELATION_OPERATION'});continue
        readers=[o for o in ops if o['method']=='GET' and o['path'].endswith('}') and noun(o['path'])==noun(create['path']) and len(placeholders(o['path']))==1 and 'id' in response_fields(o,schemas)]
        if len(readers)!=1:
            unresolved.append({'operation':create['key'],'reason':'AMBIGUOUS_OR_MISSING_RESOURCE_READER','candidates':[r['key'] for r in readers]});continue
        read=readers[0];readfields=response_fields(read,schemas)
        if typed['id']['type']!=readfields['id']['type']:
            unresolved.append({'operation':create['key'],'reason':'IDENTITY_TYPE_MISMATCH'});continue
        key=noun(create['path']);slot=placeholders(read['path'])[0]
        candidates=[f for f in create['request_fields'] if f['name'] in POLICY['field_priority'] and f['type'] in POLICY['eligible_types'] and not f['format'] and not f['read_only'] and not f['write_only'] and f['name'] in readfields and readfields[f['name']]['type']==f['type']]
        candidates.sort(key=lambda f:POLICY['field_priority'].index(f['name']))
        if not candidates:
            unresolved.append({'operation':create['key'],'reason':'NO_POLICY_ELIGIBLE_COMMON_SCALAR'});continue
        field=candidates[0]
        res={'resource':key,'create':create['key'],'read':read['key'],'create_pointer':create['pointer'],'read_pointer':read['pointer'],'identity':{'capture_field':'id','producer_field_pointer':typed['id']['pointer'],'read_field_pointer':readfields['id']['pointer'],'path_slot':slot,'type':typed['id']['type'],'binding_basis':'RESPONSE_FIELD_TYPE_AND_PATH_FAMILY_HEURISTIC','binding_review_required':True},'scalar':{'field':field['name'],'request_pointer':field['pointer'],'read_pointer':readfields[field['name']]['pointer'],'selection_source':'GENERIC_POLICY_FIELD_PRIORITY'},'create_parent_slots':placeholders(create['path'])}
        resources.append(res)
        rules.append({'id':key+'_create_read','kind':'CREATE_READBACK','resource':key,'operations':[create['key'],read['key']],'oracle':{'kind':'SCALAR_EQUALITY','field':field['name'],'expected_from':'SUPPLIED_CREATE_VALUE'},'identity_stability_check':True,'scope':POLICY['actor_scope'],'acceptance':'DECLARATIVE_RULE_ONLY; RUNTIME_NOT_VALIDATED'})
        patches=[o for o in ops if o['method'] in ('POST','PUT','PATCH') and o['path']==read['path'] and any(f['name']==field['name'] and f['type']==field['type'] and not f['read_only'] and not f['write_only'] for f in o['request_fields'])]
        if len(patches)==1:
            rules.append({'id':key+'_update_read','kind':'UPDATE_READBACK','resource':key,'operations':[read['key'],patches[0]['key'],read['key']],'oracle':{'kind':'SCALAR_EQUALITY','field':field['name'],'expected_from':'SUPPLIED_UPDATE_VALUE'},'identity_stability_check':True,'scope':POLICY['actor_scope'],'request_mode':'CONTRACT_DECLARED_JSON_MUTATION','acceptance':'DECLARATIVE_RULE_ONLY; RUNTIME_NOT_VALIDATED'})
        else:unresolved.append({'operation':read['key'],'reason':'AMBIGUOUS_OR_MISSING_ELIGIBLE_UPDATE'})
    for res in resources:
        for slot in res['create_parent_slots']:
            segments=res['create'].split(' ',1)[1].split('/'); preceding=segments[segments.index('{'+slot+'}')-1]; parent=[r for r in resources if r['resource']==preceding.rstrip('s').lower()]
            relations.append({'kind':'CREATE_PARENT_IDENTITY_CANDIDATE','child':res['resource'],'path_slot':slot,'producer_resources':[r['resource'] for r in parent],'source':'PARENT_PATH_SEGMENT_HEURISTIC','review_required':True})
    # Distinguish nested link deletion from whole-resource deletion structurally.
    for op in ops:
        if op['method']=='DELETE' and len(placeholders(op['path']))>1:
            collection=op['path'].rsplit('/',1)[0]
            reads=[r for r in ops if r['method']=='GET' and r['path']==collection]
            relations.append({'kind':'LINK_REMOVAL_READBACK_CANDIDATE','remove':op['key'],'collection_reads':[r['key'] for r in reads],'resource_delete':False,'source':'NESTED_PATH_COLLECTION_READ_RULE','membership_projection':'REVIEW_REQUIRED; PAGINATION_NOT_RESOLVED','live_enabled':False})
    return {'version':VERSION,'contract_sha256':cat['contract_sha256'],'contract_version':cat['contract_info'].get('version'),'policy':POLICY,'resources':resources,'rules':rules,'relationship_candidates':relations,'unresolved':unresolved,'live_execution':False,'js_generated':False,'existing_generator_modified':False,'status':'OFFLINE_RULE_DERIVATION_COMPLETE; BINDING_AND_RUNTIME_REVIEW_PENDING'}
def evaluate_scalar(expected_id,before,after,field,expected_value):
    """Offline evidence oracle. Missing evidence must never become PASS."""
    if not isinstance(after,dict) or field not in after or 'id' not in after or expected_id is None:return 'INCONCLUSIVE'
    if before is not None and (not isinstance(before,dict) or 'id' not in before):return 'INCONCLUSIVE'
    if before is not None and before['id']!=expected_id:return 'INCONCLUSIVE'
    if after['id']!=expected_id:return 'IDENTITY_MISMATCH_CANDIDATE'
    return 'PASS' if type(after[field]) is type(expected_value) and after[field]==expected_value else 'SCALAR_MISMATCH_CANDIDATE'
def load_verified(path):
    with zipfile.ZipFile(path) as z:
        manifest=json.loads(z.read('MANIFEST_RESULTS_v002.json'))
        for name in ('CATALOG_v002.json','SUMMARY_v002.json'):
            if name not in manifest or digest(z.read(name))!=manifest[name]:raise ValueError('Stage 2 manifest mismatch: '+name)
        cat=json.loads(z.read('CATALOG_v002.json'));summary=json.loads(z.read('SUMMARY_v002.json'))
        if cat['contract_sha256']!=summary['contract_sha256']:raise ValueError('Contract hash disagreement.')
        if len(cat['operations'])!=cat['operation_count']:raise ValueError('Operation count disagreement.')
        return cat
def main():
    p=argparse.ArgumentParser();p.add_argument('--stage2-zip',required=True,type=pathlib.Path);p.add_argument('--output',required=True,type=pathlib.Path);a=p.parse_args()
    cat=load_verified(a.stage2_zip);result=build(cat);a.output.mkdir(parents=True,exist_ok=False)
    result['stage2_zip_sha256']=digest(a.stage2_zip.read_bytes())
    (a.output/'RULES_AND_BINDINGS_v016.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    summary={'version':VERSION,'resources':len(result['resources']),'rules':len(result['rules']),'relationship_candidates':len(result['relationship_candidates']),'contract_sha256':cat['contract_sha256'],'live_execution':False,'js_generated':False}
    (a.output/'SUMMARY_v016.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    manifest={f.name:digest(f.read_bytes()) for f in a.output.iterdir() if f.is_file()}
    (a.output/'MANIFEST_RESULTS_v016.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    archive=a.output.with_suffix('.zip')
    with zipfile.ZipFile(archive,'x',zipfile.ZIP_DEFLATED) as z:
        for f in sorted(a.output.iterdir()):z.write(f,f.name)
    print('VIKUNJA_RULE_DERIVATION v016');print(json.dumps(summary));print('Review ZIP:',archive)
if __name__=='__main__':main()
