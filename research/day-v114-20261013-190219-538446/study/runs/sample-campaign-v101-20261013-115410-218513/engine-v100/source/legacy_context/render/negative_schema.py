"""Contract-derived, bounded update rejection stories for the original Context model."""
import json

def catalog(c, entities):
    cases=[];blocked=[]
    for e in entities:
        if not e['update_method']:
            blocked.append({'resource':e['name'],'reason':'NO_UPDATE_OPERATION'});continue
        schema=e['update_schema'];props=schema.get('properties',{})
        for field,prop in props.items():
            s=c.resolve(prop)
            if s.get('readOnly'):
                blocked.append({'resource':e['name'],'field':field,'reason':'READ_ONLY_REQUEST_FIELD'});continue
            typ=s.get('type');values=[]
            if typ=='string':values=[('TYPE_NUMBER',42),('TYPE_BOOLEAN',False),('TYPE_ARRAY',[]),('TYPE_OBJECT',{})]
            elif typ in ('integer','number','boolean','array','object'):values=[('TYPE_STRING','schema-type-mismatch')]
            else:
                blocked.append({'resource':e['name'],'field':field,'reason':'NO_UNAMBIGUOUS_SUPPORTED_TYPE'});continue
            if typ=='string':
                if s.get('minLength',0)>0:values.append(('MIN_LENGTH','x'*(s['minLength']-1)))
                if isinstance(s.get('maxLength'),int) and s['maxLength']<4096:values.append(('MAX_LENGTH','x'*(s['maxLength']+1)))
                elif s.get('maxLength',0)>=4096:blocked.append({'resource':e['name'],'field':field,'reason':'PAYLOAD_BOUND_MAX_LENGTH'})
            if typ in ('number','integer'):
                if isinstance(s.get('minimum'),(int,float)):values.append(('MINIMUM',s['minimum']-1))
                if isinstance(s.get('maximum'),(int,float)):values.append(('MAXIMUM',s['maximum']+1))
                if typ=='integer':values.append(('INTEGER_FRACTION',1.5))
            if typ=='array':
                if s.get('minItems',0)>0:values.append(('MIN_ITEMS',[]))
                if isinstance(s.get('maxItems'),int) and s['maxItems']<32:
                    try:values.append(('MAX_ITEMS',[c.value(s.get('items',{}),'negative-array')]*(s['maxItems']+1)))
                    except ValueError:blocked.append({'resource':e['name'],'field':field,'reason':'NO_VALID_ARRAY_ITEM_CONSTRUCTION'})
            if s.get('enum'):
                probe='outside-enum' if typ=='string' else 918273645 if typ in ('integer','number') else None
                if probe is not None and probe not in s['enum']:values.append(('ENUM',probe))
                else:blocked.append({'resource':e['name'],'field':field,'reason':'ENUM_COMPLEMENT_UNIMPLEMENTED'})
            for constraint in ('pattern','format','multipleOf','uniqueItems','exclusiveMinimum','exclusiveMaximum'):
                if constraint in s:blocked.append({'resource':e['name'],'field':field,'constraint':constraint,'reason':'DEDICATED_CONSTRAINT_CASE_NOT_IMPLEMENTED'})
            if typ=='object' or (typ=='array' and c.resolve(s.get('items',{})).get('type')=='object'):
                blocked.append({'resource':e['name'],'field':field,'reason':'NESTED_FIELD_TRAVERSAL_NOT_IMPLEMENTED'})
            for kind,value in values:
                # Bound/enum violations can also violate format/pattern: disclose this instead of claiming isolation.
                constraint={'MIN_LENGTH':'minLength','MAX_LENGTH':'maxLength','MINIMUM':'minimum','MAXIMUM':'maximum','MIN_ITEMS':'minItems','MAX_ITEMS':'maxItems','ENUM':'enum'}.get(kind,'type')
                source=prop.get('$ref')
                base=e['update'].get('requestBody',{}).get('content',{}).get('application/json',{}).get('schema',{}).get('$ref',e['detail'])
                cases.append({'id':e['name']+'/'+field+'/'+kind,'resource':e['name'],'field':field,'kind':kind,'mutation':'replace','invalid_value':value,'constraint':constraint,'declared_constraint':s.get(constraint),'source_pointer':(source or base+'/properties/'+field.replace('~','~0').replace('/','~1')).replace('#/components/schemas/','#/definitions/')+'/'+constraint,'schema_pointer':(source or base+'/properties/'+field.replace('~','~0').replace('/','~1'))+'/'+constraint,'operation':e.get('source_update_method',e['update_method']).upper()+' '+e['detail'],'effective_operation':e['update_method'].upper()+' '+e['detail'],'documented_statuses':list(e['update'].get('responses',{})),'compound_constraints':[k for k in ('pattern','format','enum') if k in s and kind not in ('ENUM',) and not kind.startswith('TYPE_')]})
        for field in schema.get('required',[]):
            if field not in props or c.resolve(props[field]).get('readOnly'):continue
            base=e['update'].get('requestBody',{}).get('content',{}).get('application/json',{}).get('schema',{}).get('$ref',e['detail'])
            cases.append({'id':e['name']+'/'+field+'/REQUIRED','resource':e['name'],'field':field,'kind':'REQUIRED','mutation':'omit','constraint':'required','source_pointer':base.replace('#/components/schemas/','#/definitions/')+'/required','schema_pointer':base+'/required','operation':e.get('source_update_method',e['update_method']).upper()+' '+e['detail'],'effective_operation':e['update_method'].upper()+' '+e['detail'],'documented_statuses':list(e['update'].get('responses',{})),'compound_constraints':[]})
    return {'version':'v007','cases':cases,'blocked':blocked,'rejection_policy':'4xx rejection plus unchanged observed projection; documentation classified independently','state_policy':'research rejected-write preservation hypothesis, not an OpenAPI postcondition','scope':'selected Context entities, all supported top-level writable update properties','deferred_families':['nullability','nested-property violations','create rejection and absence proof','delete/state transitions','ownership/authorization','unsupported constraint classes listed individually']}

def render(c,entities,cat,instances,producers=True):
    j=lambda v:json.dumps(v,separators=(',',':'))
    iface=[r'''
function negativeMatches(caseId){return bp.EventSet('Negative verified '+caseId,function(e){return e.name==='NegativeVerified'&&e.data.caseId===caseId;});}
function negativeProjection(body,fields){var projection={};fields.forEach(function(f){projection[f]={present:Object.prototype.hasOwnProperty.call(body,f),value:body[f]};});return projection;}
'''];dal=[r'''
ctx.registerEffect('NegativeBegin',function(data){ctx.insertEntity(ctx.Entity(data.caseId,'negativePending',{caseId:data.caseId,logicalId:data.logicalId,resourceType:data.resourceType,caseDef:data.caseDef,expected:cloneExpected(data.expected),revision:data.revision}));});
ctx.registerEffect('NegativeCatalogReady',function(data){data.rules.forEach(function(rule,index){ctx.insertEntity(ctx.Entity('negative_rule_'+index,'negativeRule',{resourceType:rule.resource,caseDef:rule,expectation:'DENY_SCHEMA_INPUT',requiredState:'VERIFIED_CREATED_RESOURCE'}));});});
ctx.registerQuery('Negative.Rules',function(e){return e.type==='negativeRule';});
ctx.registerQuery('Negative.ReadySubjects',function(e){return e.type==='resource'&&e.revision===1&&e.verifiedRevision===1;});
ctx.registerQuery('Negative.Pending',function(e){return e.type==='negativePending';});
ctx.registerEffect('NegativeVerified',function(data){ctx.removeEntity(data.caseId);});
'''];stories=[]
    stories += ['bthread("initialize negative Context rules",function(){request(bp.Event("NegativeCatalogReady",{rules:'+j(cat['cases'])+'}));});']
    for e in entities:
        n=e['name'];cs=[x for x in cat['cases'] if x['resource']==n]
        if not cs:continue
        detail=e['detail'].replace('{'+e['parameter']+'}','PLACEHOLDER')
        iface += ['function attemptNegative'+n+'(resource,caseDef,caseId){',
          'var key=resource.id.replace(/[^A-Za-z0-9_]/g,"_");var url='+j(detail)+'.replace("PLACEHOLDER","@{ROUTE_"+key+"}");',
          'var fields='+j(e['update_fields'])+'.concat(Object.keys(resource.expected)).concat(["id",caseDef.field]).filter(function(v,i,a){return a.indexOf(v)===i;});',
          'var prepare="var before=JSON.parse(response.body);var body={};var writable="+'+j(j(e['update_fields']))+'+";writable.forEach(function(f){if(before[f]!==undefined)body[f]=before[f];});var def="+JSON.stringify(caseDef)+";if(def.mutation===\'omit\')delete body[def.field];else body[def.field]=def.invalid_value;pvg.rtv.set("+JSON.stringify(caseId+"_BODY")+",JSON.stringify(body));var projection={};var fields="+JSON.stringify(fields)+";fields.forEach(function(f){projection[f]={present:Object.prototype.hasOwnProperty.call(before,f),value:before[f]};});pvg.rtv.set("+JSON.stringify(caseId+"_BEFORE")+",JSON.stringify(projection));";',
          'requestRest("GET",url,undefined,'+j(c.response(e['get'])[0])+',{action:"negative_prepare",logicalId:resource.id},callbackFromSource(validationSource(resource.expected,"ID_"+key,null,prepare)));',
          'var receipt="var status=Number(response.code);var def="+JSON.stringify(caseDef)+";var receipt={status:status,rejected:status>=400&&status<500,status_documented:def.documented_statuses.indexOf(String(status))>=0};pvg.rtv.set("+JSON.stringify(caseId+"_RECEIPT")+",JSON.stringify(receipt));bp.log.info(\'NEGATIVE_RECEIPT \'+JSON.stringify({caseId:"+JSON.stringify(caseId)+",receipt:receipt}));";',
          'requestRest('+j(e['update_method'].upper())+',url,"@{"+caseId+"_BODY}",'+j(list(range(200,600)))+',{action:"negative_attempt",logicalId:resource.id},callbackFromSource(receipt));',
          'request(bp.Event("NegativeBegin",{caseId:caseId,logicalId:resource.id,resourceType:'+j(n)+',caseDef:caseDef,expected:resource.expected,revision:resource.revision}));',
          'waitFor(negativeMatches(caseId));}',
          'function verifyNegative'+n+'(pending){',
          'var key=pending.logicalId.replace(/[^A-Za-z0-9_]/g,"_");var fields='+j(e['update_fields'])+'.concat(Object.keys(pending.expected)).concat(["id",pending.caseDef.field]).filter(function(v,i,a){return a.indexOf(v)===i;});',
          'var source="var after=JSON.parse(response.body);var before=pvg.rtv.get("+JSON.stringify(pending.caseId+"_BEFORE")+");var saved=pvg.rtv.get("+JSON.stringify(pending.caseId+"_RECEIPT")+");if(before===undefined||before===null||saved===undefined||saved===null){pvg.fail(\'Negative evidence missing\');return;}var receipt=JSON.parse(String(saved));var fields="+JSON.stringify(fields)+";var projection={};fields.forEach(function(f){projection[f]={present:Object.prototype.hasOwnProperty.call(after,f),value:after[f]};});var beforeProjection=JSON.parse(String(before));var changedFields=fields.filter(function(f){return JSON.stringify(beforeProjection[f])!==JSON.stringify(projection[f]);});var requestBody=pvg.rtv.get("+JSON.stringify(pending.caseId+"_BODY")+");var rule="+JSON.stringify(pending.caseDef)+";var unchanged=String(before)===JSON.stringify(projection);var pass=receipt.rejected&&unchanged;var result={evidence_version:1,rule_id:rule.id,source_pointer:rule.source_pointer,rule:rule,logicalId:"+JSON.stringify(pending.logicalId)+",resource_id:after.id,expected_revision:"+JSON.stringify(pending.revision)+",readback_status:Number(response.code),request_body:JSON.parse(String(requestBody)),before_projection:beforeProjection,after_projection:projection,changed_fields:changedFields,checked_field:rule.field,checked_field_before:beforeProjection[rule.field],checked_field_after:projection[rule.field],caseId:"+JSON.stringify(pending.caseId)+",status:receipt.status,rejected:receipt.rejected,status_documented:receipt.status_documented,state_projection_unchanged:unchanged,pass:pass};bp.log.info(\'NEGATIVE_CHECK \'+JSON.stringify(result));if(!pass)pvg.fail(\'Negative rejection/state mismatch \'+result.caseId);";',
          'requestRest("GET",'+j(detail)+'.replace("PLACEHOLDER","@{ROUTE_"+key+"}"),undefined,'+j(c.response(e['get'])[0])+',{action:"negative_readback",logicalId:pending.logicalId},callbackFromSource(source));}',]
        stories += ['ctx.bthread('+j('negative verifier '+n)+',"Negative.Pending",function(pending){if(pending.resourceType!=='+j(n)+')return;verifyNegative'+n+'(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});']
        for i in range(1,instances+1):
            if not producers:continue
            logical=n+'_'+str(i)
            stories += ['ctx.bthread('+j('negative lifecycle '+logical)+',"Negative.ReadySubjects",function(resource){if(resource.id!=='+j(logical)+')return;var cases=[];while(cases.length!=='+str(len(cs))+'){cases=ctx.runQuery("Negative.Rules").filter(function(rule){return rule.resourceType==='+j(n)+';}).map(function(rule){return rule.caseDef;});if(cases.length!=='+str(len(cs))+')waitFor(bp.all);}cases.sort(function(a,b){return a.id<b.id?-1:a.id>b.id?1:0;});for(var index=0;index<cases.length;index++){var def=cases[index];attemptNegative'+n+'(getModelEntity('+j(logical)+'),def,'+j('NEG_'+logical+'_')+'+index);}request(bp.Event("NegativeLifecycleComplete",{logicalId:'+j(logical)+'}));});']
    return '\n'.join(iface)+'\n','\n'.join(dal)+'\n','\n'.join(stories)+'\n'
