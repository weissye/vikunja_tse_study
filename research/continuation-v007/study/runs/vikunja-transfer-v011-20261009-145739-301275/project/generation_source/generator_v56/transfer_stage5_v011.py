"""Compile a checked own-resource prefix graph to native Provengo REST JS."""
import hashlib,json,pathlib,re
from .parsing.model import Provenance
VERSION='v011'
def slot(node):return node.replace('/','_')+'_ID'
def resolve(doc,obj,seen=()):
    if not isinstance(obj,dict):return {}
    if '$ref' not in obj:return obj
    ref=obj['$ref']
    if not ref.startswith('#/') or ref in seen:raise ValueError('Unsupported schema reference')
    val=doc
    for part in ref[2:].split('/'):val=val[part.replace('~1','/').replace('~0','~')]
    return resolve(doc,val,seen+(ref,))
def compile_package(graph,rules,contract,base_url,output,tag):
    out=pathlib.Path(output);(out/'spec/js').mkdir(parents=True);(out/'config').mkdir()
    raw_override=json.loads(pathlib.Path(__file__).with_name('contract_overrides_v011.json').read_text())
    by={n['id']:n for n in graph['nodes']};steps=[];resource={r['resource']:r for r in rules['resources']}
    # Validate every operation and request shape before sending any request.
    for n in graph['nodes']:
        method,path=n['operation'].split(' ',1);op=contract['paths'].get(path,{}).get(method.lower())
        source_method=method
        applied_override=None
        if path==raw_override['path'] and method==raw_override['source_method']:
            if contract['info']['version']!=raw_override['contract_version'] or graph.get('contract_sha256')!=raw_override['contract_sha256']:raise ValueError('Override is not approved for this contract')
            method=raw_override['effective_method'];applied_override=raw_override
        if not op:raise ValueError('Missing operation '+n['operation'])
        codes=[int(c) for c in op['responses'] if str(c).isdigit() and 200<=int(c)<300]
        if not codes:raise ValueError('No documented success response')
        r=resource[n['resource']];field=r['scalar']['field'];urlpath=path
        if 'identity_from' in n:
            urlpath=urlpath.replace('{'+r['identity']['path_slot']+'}','@{'+slot(n['identity_from'])+'}')
        for name,b in n.get('bindings',{}).items():urlpath=urlpath.replace('{'+name+'}','@{'+slot(b['producer'])+'}')
        if re.search(r'(?<!@)\{',urlpath):raise ValueError('Unbound path identity')
        step={'id':n['id'],'source_method':source_method,'contract_override':applied_override,'method':method,'path':urlpath,'codes':codes,'phase':n['phase'],'deps':n['depends_on'],'field':field}
        if method in ('POST','PUT','PATCH'):
            if contract.get('swagger')=='2.0':
                params=op.get('parameters',[])+contract['paths'][path].get('parameters',[])
                bodies=[resolve(contract,p) for p in params if resolve(contract,p).get('in')=='body']
                if len(bodies)!=1:raise ValueError('Expected one Swagger JSON body')
                media='application/json'
                if media not in op.get('consumes',contract.get('consumes',[])):raise ValueError('JSON media type not declared')
                schema=resolve(contract,bodies[0].get('schema',{}));props=schema.get('properties',{})
            else:
                content=resolve(contract,op.get('requestBody',{})).get('content',{})
                media='application/merge-patch+json' if method=='PATCH' else 'application/json'
                if media not in content:raise ValueError('Required request media type missing: '+media)
                schema=resolve(contract,content[media].get('schema',{}));props=schema.get('properties',{})
            if any(x!=field for x in schema.get('required',[])):raise ValueError('Additional required creation fields need adapter')
            prop=resolve(contract,props.get(field,{}))
            value='sbt_'+tag+'_'+n['resource']+'_'+str(n['instance'])+'_'+str(n.get('scalar_version',0))
            if prop.get('type')!='string' or prop.get('readOnly') or prop.get('writeOnly'):raise ValueError('Selected field not supported')
            if len(value)<prop.get('minLength',0) or len(value)>prop.get('maxLength',10000) or (prop.get('pattern') and not re.fullmatch(prop['pattern'],value)) or (prop.get('enum') and value not in prop['enum']):raise ValueError('Value incompatible with schema')
            step.update(body={field:value},media_type=media)
        if 'capture' in n:step['capture_key']=slot(n['id'])
        if 'identity_from' in n:step['identity_key']=slot(n['identity_from'])
        if method=='GET':
            expected_node=n.get('expected_from',n.get('identity_from'));producer=by[expected_node]
            step['expected']='sbt_'+tag+'_'+producer['resource']+'_'+str(producer['instance'])+'_'+str(producer.get('scalar_version',0))
        # Independent readback of the parent membership inferred from path + schema.
        if method=='GET' and 'identity_from' in n:
            create_node=by[n['identity_from']]
            checks=[]
            for binding_name,binding in create_node.get('bindings',{}).items():
                parent_resource=by[binding['producer']]['resource']
                candidate_field=parent_resource+'_id'
                response_schemas=[]
                for code,response in op.get('responses',{}).items():
                    if str(code).isdigit() and 200<=int(code)<300:
                        response=resolve(contract,response)
                        if contract.get('swagger')=='2.0':response_schemas.append(response.get('schema',{}))
                        else:response_schemas.extend(c.get('schema',{}) for c in response.get('content',{}).values())
                properties=[resolve(contract,x).get('properties',{}) for x in response_schemas]
                matched=[resolve(contract,x[candidate_field]) for x in properties if candidate_field in x]
                parent_type=resource[parent_resource]['identity']['type']
                if not matched or any(x.get('type')!=parent_type for x in matched):raise ValueError('No compatible parent membership response field: '+candidate_field)
                checks.append({'field':candidate_field,'parent_identity_key':slot(binding['producer']),'source':'PARENT_PATH_BINDING_PLUS_COMPATIBLE_RESPONSE_FIELD','field_source':'ORIGINAL_RESPONSE_SCHEMA','binding_source':create_node['provenance']})
            if checks:step['parent_checks']=checks
        step['provenance']=Provenance(n['provenance']['pointer'],'GRAPH_TO_REST_V011').to_dict();steps.append(step)
    callback=r'''var s=__STEP_JSON__; var body=JSON.parse(response.body);var ok=true;
if(s.capture_key){if(body.id===undefined||body.id===null)ok=false;else pvg.rtv.set(s.capture_key,body.id);}
if(s.identity_key){var wanted=pvg.rtv.get(s.identity_key);if(wanted===null||wanted===undefined||String(body.id)!==String(wanted))ok=false;}
if(s.expected!==undefined&&body[s.field]!==s.expected)ok=false;
var parents=[];var parentVerdict='NOT_APPLICABLE';
if(s.parent_checks){parentVerdict='PASS';for(var i=0;i<s.parent_checks.length;i++){var check=s.parent_checks[i];var expectedParent=pvg.rtv.get(check.parent_identity_key);var observedParent=body[check.field];var verdict='PASS';if(expectedParent===undefined||expectedParent===null||observedParent===undefined||observedParent===null){verdict='INCONCLUSIVE';parentVerdict='INCONCLUSIVE';ok=false;}else if(String(observedParent)!==String(expectedParent)){verdict='PARENT_MEMBERSHIP_MISMATCH_CANDIDATE';if(parentVerdict!=='INCONCLUSIVE')parentVerdict=verdict;ok=false;}parents.push({field:check.field,expected:expectedParent,observed:observedParent,verdict:verdict});}}
bp.log.info('V011_CALLBACK '+JSON.stringify({step:s.id,status:response.code,phase:s.phase,id:body.id,value:body[s.field],expected:s.expected,parent_checks:parents,parent_verdict:parentVerdict,valid:ok}));
if(!ok){pvg.fail('V011 consistency mismatch '+s.id);throw new Error('V011 consistency mismatch '+s.id);}
bp.log.info('V011_STEP_PASS '+s.id);
'''
    js=['//@provengo summon rest','//@provengo summon rtv']
    done_prefix='V011_DONE '
    for s in steps:
        done_names=[done_prefix+d for d in s['deps']]
        cb=callback.replace('__STEP_JSON__',json.dumps(s))
        data={'lib':'REST','method':s['method'],'url':base_url.rstrip('/')+s['path'],'headers':{'Content-Type':s.get('media_type','application/json'),'Authorization':'Bearer @{java.lang.System.getenv(\'SBT_VIKUNJA_TOKEN\')}'},'parameters':{},'expectedResponseCodes':s['codes'],'model':{'step':s['id']}}
        if 'body' in s:data['body']=json.dumps(s['body'])
        raw=json.dumps(data)[:-1]+',callback:function(response){'+cb+'}}'
        js.append("bthread("+json.dumps(s['id'])+",function(){var pending="+json.dumps(done_names)+";while(pending.length){var event=sync({waitFor:bp.EventSet('deps',function(e){return pending.indexOf(e.name)>=0;})});pending.splice(pending.indexOf(event.name),1);}sync({request:bp.Event("+json.dumps(s['id'])+','+raw+")});request(bp.Event("+json.dumps(done_prefix+s['id'])+"));});")
    pending=[done_prefix+s['id'] for s in steps]
    js.append("bthread('completion',function(){var pending="+json.dumps(pending)+";while(pending.length){var e=sync({waitFor:bp.EventSet('all done',function(e){return pending.indexOf(e.name)>=0;})});pending.splice(pending.indexOf(e.name),1);}request(bp.Event('V011_COMPLETE'));});")
    (out/'spec/js/model.v011.js').write_text('\n'.join(js),encoding='utf-8')
    (out/'config/provengo.yml').write_text('version: 2\nscenario.max-length: '+str(2*len(steps)+20)+'\n',encoding='utf-8')
    report={'version':VERSION,'steps':steps,'step_count':len(steps),'contract_sha256':hashlib.sha256(json.dumps(contract,sort_keys=True).encode()).hexdigest(),'schedule_selection':'NATIVE_PROVENGO_DEPENDENCY_CONSTRAINED','http_execution':'SEQUENTIAL','live_acceptance':'PENDING','contract_overrides':[raw_override],'parent_readback_obligations':sum(len(s.get('parent_checks',[])) for s in steps)}
    (out/'generation_report_v011.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    return report

def write_full_package(graph,rules,contract,base_url,output,tag):
    report=compile_package(graph,rules,contract,base_url,output,tag)
    out=pathlib.Path(output)
    root=pathlib.Path(__file__).resolve().parent.parent
    for source in list(root.rglob('*')):
        if out.resolve() in source.resolve().parents:
            continue
        if source.is_file() and source.suffix in ('.py','.json','.ps1','.md') and '__pycache__' not in source.parts and 'example_results' not in source.parts:
            target=out/'generation_source'/source.relative_to(root)
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(source.read_bytes())
    return report
