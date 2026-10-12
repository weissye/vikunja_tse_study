"""Opt-in Context renderer. Contract-only inputs; no application-name branches.

This module is part of generator_v56's CLI, not a scenario runner. Scope paths
select operations only. Inferences, unsupported semantics, and source pointers
are emitted alongside every generated file.
"""
from __future__ import annotations
import copy
import hashlib
import json
import re
from pathlib import Path
from .naming import to_pascal
from ..parsing.swagger_context import normalize_context_contract


def j(value):
    return json.dumps(value, ensure_ascii=True, separators=(',', ':'))


def pointer(path, method):
    return '#/paths/' + path.replace('~', '~0').replace('/', '~1') + '/' + method


def canonical(name):
    return re.sub(r'[^a-z0-9]', '', re.sub(r'(-?(Input|Output)|Out|Summary)$', '', name).lower())


class Contract:
    def __init__(self, raw):
        self.raw = raw
        self.schemas = raw.get('components', {}).get('schemas', {})

    def resolve(self, schema):
        seen = set()
        while '$ref' in schema:
            ref = schema['$ref']
            if not ref.startswith('#/components/schemas/') or ref in seen:
                raise ValueError('Unsupported reference: ' + ref)
            seen.add(ref)
            schema = self.schemas[ref.rsplit('/', 1)[-1]]
        if 'anyOf' in schema or 'oneOf' in schema:
            branches = schema.get('anyOf', schema.get('oneOf'))
            choices = [s for s in branches if self.resolve(s).get('type') != 'null']
            # Named alternatives remain recorded as inference, not proven equivalence.
            if not choices:
                return {'type': 'null'}
            return self.resolve(choices[0])
        return schema

    def body(self, op):
        content = op.get('requestBody', {}).get('content', {})
        return self.resolve(content.get('application/json', {}).get('schema', {}))

    def response(self, op):
        successes = [int(k) for k in op.get('responses', {}) if k.isdigit() and 200 <= int(k) < 300]
        if not successes:
            raise ValueError('No explicit success response')
        code = min(successes)
        s = op['responses'][str(code)].get('content', {}).get('application/json', {}).get('schema', {})
        return successes, self.resolve(s)

    def value(self, schema, salt):
        s = self.resolve(schema)
        if 'const' in s:
            return s['const']
        if s.get('enum'):
            return s['enum'][0]
        if 'default' in s:
            return copy.deepcopy(s['default'])
        t = s.get('type')
        if t == 'string':
            fmt = s.get('format')
            h = hashlib.sha256(salt.encode()).hexdigest()
            if fmt in ('uuid', 'uuid4'):
                return h[:8]+'-'+h[8:12]+'-4'+h[13:16]+'-8'+h[17:20]+'-'+h[20:32]
            if fmt == 'date':
                return '2026-10-06'
            if fmt == 'date-time':
                return '2026-10-06T00:00:00Z'
            if fmt == 'email':
                return 'sbt-' + h[:8] + '@example.com'
            if fmt or s.get('pattern'):
                raise ValueError('Unimplemented format/pattern at ' + salt)
            return ('sbt-' + salt)[:s.get('maxLength', 1000)].ljust(s.get('minLength', 0), 'x')
        if t in ('number', 'integer'):
            v = max(s.get('minimum', 1), 1)
            if isinstance(s.get('exclusiveMinimum'), (int, float)) and not isinstance(s['exclusiveMinimum'], bool):
                v = max(v, s['exclusiveMinimum'] + 1)
            if s.get('maximum') is not None and v > s['maximum']:
                v = s['maximum']
            return int(v) if t == 'integer' else v
        if t == 'boolean':
            return False
        if t == 'array':
            return [self.value(s.get('items', {}), salt+'-'+str(i)) for i in range(s.get('minItems', 0))]
        if t == 'object' or 'properties' in s:
            return {k: self.value(s['properties'][k], salt+'-'+k) for k in s.get('required', [])}
        if t == 'null':
            return None
        raise ValueError('Unsupported value schema at ' + salt)


def build_model(raw, paths, instances, seed):
    if not 1 <= instances <= 8:
        raise ValueError('instances must be 1..8')
    c = Contract(raw)
    entities = []
    for path in paths:
        create_methods=[m for m in ('post','put') if m in raw['paths'].get(path,{}) and '201' in raw['paths'][path][m].get('responses',{})]
        if len(create_methods)!=1:
            raise ValueError('No unique collection creation operation with 201: ' + path)
        create_method=create_methods[0]
        candidates = [p for p in raw['paths'] if re.fullmatch(re.escape(path)+r'/\{[^/]+\}', p)
                      and 'get' in raw['paths'][p]]
        if not candidates:
            # Match a split creation/detail route only by the exact declared response schema.
            _, created_schema=c.response(raw['paths'][path][create_method])
            candidates=[route for route,ops in raw['paths'].items()
                if 'get' in ops and len(re.findall(r'\{[^}]+\}',route))==1
                and c.response(ops['get'])[1]==created_schema
                and route.endswith('}')]
        if len(candidates) != 1:
            raise ValueError('Ambiguous/missing item GET: ' + path)
        detail = candidates[0]
        get = raw['paths'][detail]['get']
        create = raw['paths'][path][create_method]
        _, read_schema = c.response(get)
        props = read_schema.get('properties', {})
        keys = [k for k in props if k == 'id']
        if len(keys) != 1:
            raise ValueError('No unambiguous conventional id in item GET: ' + detail)
        name = to_pascal(read_schema.get('title') or path.rsplit('/', 1)[-1])
        parameter = re.findall(r'\{([^}]+)\}', detail)[-1]
        route_field = parameter if parameter in props else 'id'
        update_method = 'patch' if 'patch' in raw['paths'][detail] else 'post' if 'post' in raw['paths'][detail] else 'put' if 'put' in raw['paths'][detail] else None
        update = raw['paths'][detail].get(update_method, {})
        e = dict(name=name, path=path, detail=detail, parameter=parameter, route_field=route_field,
                 id_field='id', get=get, create=create, create_method=create_method, create_schema=c.body(create),
                 update=update, update_method=update_method,
                 update_schema=c.body(update) if update else {}, read_schema=read_schema,
                 create_response=c.response(create)[1], dependencies=[], nested=[],
                 provenance=[dict(pointer=pointer(path,create_method),rule='collection creation with 201 plus unique item GET'),
                             dict(pointer=pointer(detail,'get'),rule='response id convention; route parameter matched to property')])
        entities.append(e)
    if len({e['name'] for e in entities}) != len(entities):
        raise ValueError('Resource display names collide; no silent aliasing')

    # Semantic types are matched by component title after Input/Output normalization.
    def target_for(prop):
        resolved = c.resolve(prop)
        title = resolved.get('title', '')
        matches = [e for e in entities if canonical(title) == canonical(e['read_schema'].get('title',''))]
        return matches[0] if len(matches) == 1 else None

    def id_target(field):
        token = canonical(re.sub(r'Id$', '', field))
        matches = [e for e in entities if token and
                   (canonical(e['name']).endswith(token) or canonical(e['path'].rsplit('/',1)[-1]).rstrip('s') == token)]
        return matches[0] if len(matches) == 1 else None

    for e in entities:
        props = e['create_schema'].get('properties', {})
        for field, prop in props.items():
            if c.resolve(prop).get('readOnly'):
                continue
            target = target_for(prop) or (id_target(field) if field.endswith('Id') else None)
            if target and target is not e:
                e['dependencies'].append(dict(field=field,target=target['name'],object=not field.endswith('Id'),
                                              pointer=pointer(e['path'],e['create_method'])+'/requestBody'))
        # Join-record arrays can express explicit foreign keys instead of an embedded view.
        # This is a reported persistence hypothesis, not a guarantee of OpenAPI semantics.
        array_links = []
        for field, prop in props.items():
            array = c.resolve(prop)
            output_array = c.resolve(e['read_schema'].get('properties', {}).get(field, {}))
            if array.get('type') != 'array' or array.get('readOnly') or output_array.get('type') != 'array':
                continue
            item = c.resolve(array.get('items', {}))
            if any(canonical(item.get('title','')) == canonical(other['read_schema'].get('title','')) for other in entities):
                continue
            links = []
            for subfield, subprop in item.get('properties', {}).items():
                target = id_target(subfield) if subfield.endswith('Id') else None
                if target and target is not e and not c.resolve(subprop).get('readOnly'):
                    links.append(dict(field=field, subfield=subfield, target=target['name'], object=False,
                                      array=True, pointer=pointer(e['path'],e['create_method'])+'/requestBody'))
            if not links:
                continue
            if array.get('minItems', 0) > 1 or array.get('maxItems', 1) < 1:
                raise ValueError('Join array cannot use one fixture record: '+field)
            template = {}
            linked_fields = {d['subfield'] for d in links}
            for subfield, subprop in item.get('properties', {}).items():
                resolved = c.resolve(subprop)
                if subfield in linked_fields or resolved.get('readOnly'):
                    continue
                if subfield in item.get('required', []):
                    template[subfield] = c.value(subprop, str(seed)+'-'+e['name']+'-'+field+'-'+subfield)
                elif resolved.get('type') in ('number', 'integer'):
                    # Choose a schema-valid numeric test input; no domain quantity law inferred.
                    resolved = dict(resolved); resolved.pop('default', None)
                    template[subfield] = c.value(resolved, str(seed)+'-'+field+'-'+subfield)
            for link in links:
                link['template'] = template
            array_links.extend(links)
        for target in {d['target'] for d in array_links}:
            if len({d['field'] for d in array_links if d['target']==target}) > 1:
                raise ValueError('Ambiguous join arrays for parent: '+target)
        e['dependencies'].extend(array_links)
        # Avoid embedding a full object when an explicit ID field describes the same link.
        scalar_targets = {d['target'] for d in e['dependencies'] if not d['object']}
        displaced = [d for d in e['dependencies'] if d['object'] and d['target'] in scalar_targets]
        if displaced:
            e['provenance'].append(dict(pointer=pointer(e['path'],e['create_method'])+'/requestBody',
                rule='prefer explicit foreign-key representation over embedded parent object',
                omitted_embedded_fields=[d['field'] for d in displaced],
                limitation='write/read persistence remains a runtime hypothesis'))
        e['dependencies'] = [d for d in e['dependencies'] if not d['object'] or d['target'] not in scalar_targets]
        for field, prop in e['update_schema'].get('properties', {}).items():
            array = c.resolve(prop)
            if array.get('type') != 'array':
                continue
            item = c.resolve(array.get('items', {}))
            # Existing resources in an update array require their own lifecycle, not fabricated IDs.
            if any(canonical(item.get('title','')) == canonical(other['read_schema'].get('title','')) for other in entities):
                continue
            links = []
            for subfield, subprop in item.get('properties', {}).items():
                target = target_for(subprop)
                if target and target is not e:
                    links.append(dict(field=subfield,target=target['name'],required=c.resolve(subprop).get('required',[])))
            if links:
                e['nested'].append(dict(field=field,schema=item,links=links,
                                        pointer=pointer(e['detail'], e['update_method'])+'/requestBody'))
        response = e['create_response']
        if response.get('type') == 'string':
            e['identity_mode'] = 'primitive-route'
            e['provenance'].append(dict(pointer=pointer(e['path'],e['create_method'])+'/responses',
                                        rule='string response used as single string route parameter; hypothesis checked by GET'))
        elif 'id' in response.get('properties', {}):
            e['identity_mode'] = 'object'
        else:
            fields = [k for k,v in response.get('properties',{}).items()
                      if c.resolve(v).get('type') == 'array'
                      and canonical(c.resolve(c.resolve(v).get('items',{})).get('title','')) == canonical(e['name'])]
            if not fields:
                raise ValueError('Cannot infer create identity candidates: ' + e['path'])
            e['identity_mode'] = 'collection'
            e['identity_arrays'] = fields
            e['provenance'].append(dict(pointer=pointer(e['path'],e['create_method'])+'/responses',
                                        rule='unique matching identity across schema-compatible response arrays; ambiguity is failure'))
        create_body = {}
        for field in e['create_schema'].get('required', []):
            if not any(d['field'] == field for d in e['dependencies']):
                create_body[field] = c.value(props[field],str(seed)+'-'+e['name']+'-INSTANCE-'+field)
        for field, prop in props.items():
            resolved=c.resolve(prop)
            if resolved.get('type')=='string' and resolved.get('minLength',0)>0 and not resolved.get('readOnly') and not resolved.get('format') and not any(d['field']==field for d in e['dependencies']):
                create_body[field]=c.value(prop,str(seed)+'-'+e['name']+'-INSTANCE-'+field)
        for field, prop in props.items():
            s = c.resolve(prop)
            if field not in create_body and not any(d['field']==field for d in e['dependencies']) and s.get('type') in ('string','number','integer','boolean') and not s.get('format') and not s.get('readOnly'):
                # Only optional strings without defaults are used as fixture labels.
                if s.get('type') == 'string' and 'default' not in s and not field.lower().endswith('id') and not any(isinstance(v,str) for v in create_body.values()):
                    create_body[field] = c.value(prop,str(seed)+'-'+e['name']+'-INSTANCE-'+field)
                    break
        e['body'] = create_body
        # Choose one writable non-route scalar; this is a test input, not a domain rule.
        update_props = e['update_schema'].get('properties',{})
        fields = [f for f,s in update_props.items() if f in e['read_schema'].get('properties',{})
                  and c.resolve(s).get('type') == 'string' and not c.resolve(s).get('format')
                  and not c.resolve(s).get('readOnly') and f not in (e['route_field'], 'id')
                  and not f.lower().endswith('id')]
        e['change_field'] = sorted(fields, key=lambda f:(f not in ('description','note'),f))[0] if fields else None
        e['update_fields'] = [f for f,s in update_props.items() if not c.resolve(s).get('readOnly')]
        e['required_update'] = e['update_schema'].get('required',[])
        if e['nested']:
            e['provenance'].append(dict(pointer=e['nested'][0]['pointer'],rule='array items with explicit references; two embedded objects share selected dependencies'))
    for e in entities:
        e['path_dependencies']=[]
        for parameter in re.findall(r'\{([^}]+)\}',e['path']):
            prefix=e['path'].split('{'+parameter+'}')[0].rstrip('/')
            parents=[other for other in entities if other['path']==prefix]
            if not parents:
                # Split create/detail routes: /projects/{id}/tasks creates /tasks/{id}.
                parents=[other for other in entities
                         if re.fullmatch(re.escape(prefix)+r'/\{[^/]+\}',other['detail'])]
            if len(parents)!=1:raise ValueError('Ambiguous path parent: '+e['path'])
            parent=parents[0]
            field=parent['path'].rsplit('/',1)[-1].rstrip('s')+'_id'
            foreign=field if field in e['read_schema'].get('properties',{}) else None
            e['path_dependencies'].append(dict(parameter=parameter,target=parent['name'],foreign_field=foreign))
            e['dependencies'].append(dict(field=parameter,target=parent['name'],object=False,path_only=True,pointer=pointer(e['path'],e['create_method'])))
            e['provenance'].append(dict(pointer=pointer(e['path'],e['create_method']),rule='PATH_PARENT_FROM_SELECTED_COLLECTION_PREFIX',target=parent['name']))
    # Reject cycles in required readiness dependencies; do not silently discard graph edges.
    graph={e['name']:{d['target'] for d in e['dependencies']} for e in entities}
    def visit(n, stack):
        if n in stack:raise ValueError('Cyclic create dependency needs a separate linking phase: '+n)
        for v in graph[n]:visit(v,stack+[n])
    for n in graph:visit(n,[])
    return c, entities


INTERFACE_COMMON = r'''
// Native REST events, matching the attached Library interface pattern.
// Metadata is local to the model; it is NOT sent as URL query parameters.
function requestBodyExpression(value) {
    // Resolve references and serialize JSON together at actuation, in ONE RTV phrase.
    // Never interpolate several RTV phrases into an already serialized nested JSON body.
    function source(v) {
        if(typeof v==="string" && /^@\{[A-Za-z0-9_]+\}$/.test(v)) return v.slice(2,-1);
        if(Array.isArray(v)) return "["+v.map(source).join(",")+"]";
        if(v && typeof v==="object") return "{"+Object.keys(v).map(function(k){return JSON.stringify(k)+":"+source(v[k]);}).join(",")+"}";
        return JSON.stringify(v);
    }
    return "@{JSON.stringify("+source(value)+")}";
}
var RELATION_ACTOR='A';
function requestRest(method, url, body, codes, semantic, callback) {
    if(semantic)semantic.actor=RELATION_ACTOR;
    url='/__actor/'+RELATION_ACTOR+url;
    var data = {
        lib: "REST", method: method, url: svc.baseURL + url,
        headers: svc.defaultHeaders, parameters: {},
        expectedResponseCodes: codes, callback: new Function("response",
            "var callback=("+String(callback)+");callback(response);var receipt="+
            JSON.stringify({method:method,url_template:url,action:semantic.action,logicalId:semantic.logicalId,actor:RELATION_ACTOR})+
            ";receipt.status=Number(response.code);bp.log.info('CONTEXT_HTTP_CALLBACK '+JSON.stringify(receipt));"), model: semantic
    };
    if (body !== undefined) data.body = typeof body === "string" ? body : requestBodyExpression(body);
    return sync({request: bp.Event(method, data)});
}
function matchesInterfaceEvent(action, type, logicalId) {
    return bp.EventSet(action + ":" + type + ":" + logicalId, function(event) {
        var m = event.data && event.data.model;
        return !!m && m.action === action && m.type === type &&
            (logicalId === undefined || m.logicalId === logicalId);
    });
}
function extractEventData(event) {
    return event.data && event.data.model;
}
function matchesVerified(logicalId, revision) {
    return bp.EventSet("Verified " + logicalId + "/" + revision, function(event) {
        return event.name === "ModelVerified" && event.data.logicalId === logicalId && event.data.revision === revision;
    });
}
function matchesMutations(logicalId) {
    return bp.EventSet("Writes " + logicalId, function(event) {
        var m = event.data && event.data.model;
        return !!m && m.logicalId === logicalId && (m.action === "create" || m.action === "update");
    });
}
function matchesConflictingWrites(resourceId, owner) {
    return bp.EventSet("Conflicting write "+resourceId,function(event){
        var m=event.data && event.data.model;
        if(event.name==="ModelWriteBegin") return event.data.logicalId===resourceId && event.data.owner!==owner;
        return !!m && m.owner!==owner && (m.action==="create" || m.action==="update") &&
            (m.affected || [m.logicalId]).indexOf(resourceId)>=0;
    });
}
function callbackFromSource(source) {
    // Capture arguments in source literals: callbacks run at actuation, after sampling.
    return new Function("response", source);
}
function validationSource(expected, identityKey, snapshotKey, prepare, bindIdentity) {
    return "var expected = " + JSON.stringify(expected) + ";\n" +
        "function resolve(v) { if(typeof v === 'string' && /^@\\{[A-Za-z0-9_]+\\}$/.test(v)) return pvg.rtv.get(v.slice(2,-1)); if(Array.isArray(v)) return v.map(resolve); if(v && typeof v === 'object'){var r={};Object.keys(v).forEach(function(k){r[k]=resolve(v[k]);});return r;}return v;}\n" +
        "expected = resolve(expected);\n" +
        "function check(actual,wanted,path) { if(Array.isArray(wanted)){if(!Array.isArray(actual)||actual.length!==wanted.length) {pvg.fail('Array mismatch '+path);return;} wanted.forEach(function(v,i){check(actual[i],v,path+'['+i+']');});} else if(wanted && typeof wanted === 'object'){ if(!actual||typeof actual!=='object'){pvg.fail('Object mismatch '+path);return;} Object.keys(wanted).forEach(function(k){check(actual[k],wanted[k],path+'.'+k);});} else if(actual!==wanted){pvg.fail('Value mismatch '+path+': expected '+JSON.stringify(wanted)+' observed '+JSON.stringify(actual));}}\n" +
        "var actual=JSON.parse(response.body); check(actual,expected,'$');\n" +
        (identityKey ? ("if(!actual || !actual.id){pvg.fail('Readback identity absent');return;}" +
            (bindIdentity ? "" : "var known=pvg.rtv.get(" + JSON.stringify(identityKey) + ");if(String(actual.id)!==String(known)){pvg.fail('Stable identity changed');return;}") +
            "pvg.rtv.set(" + JSON.stringify(identityKey) + ",actual.id);\n") : "") +
        (snapshotKey ? "pvg.rtv.set(" + JSON.stringify(snapshotKey) + ",response.body);\n" : "") +
        (prepare || "");
}
'''

DAL_COMMON = r'''
// Context contains expected request-derived state, never a copy of an observed response.
// Real identities and server snapshots are kept only in runtime variables at the boundary.
function getModelEntity(id) {
    var found=ctx.runQuery("Resource.All").filter(function(e){return e.id===id;});
    if(found.length!==1) throw new Error("Missing/ambiguous Context resource "+id);
    return found[0];
}
function cloneExpected(value) {return JSON.parse(JSON.stringify(value));}
function applyInterfaceEffect(event) {
    var data=extractEventData(event);
    if(data && data.action==="f02") {applyF02Effect(data);return;}
    if(data && data.action==="contribute") {applyContributionEffect(data);return;}
    if(!data || (data.action!=="create" && data.action!=="update")) return;
    if(data.action==="create") {
        ctx.insertEntity(ctx.Entity(data.logicalId,"resource",{
            resourceType:data.type,expected:cloneExpected(data.expected),revision:1,verifiedRevision:0
        }));
    } else {
        var resource=getModelEntity(data.logicalId);
        var expected=cloneExpected(resource.expected);
        Object.keys(data.expected).forEach(function(k){expected[k]=cloneExpected(data.expected[k]);});
        ctx.removeEntity(resource.id);
        ctx.insertEntity(ctx.Entity(resource.id,"resource",{
            resourceType:resource.resourceType,expected:expected,revision:resource.revision+1,
            verifiedRevision:resource.verifiedRevision
        }));
    }
}
["POST","PUT","PATCH"].forEach(function(method){
    ctx.registerEffect(method,function(data){applyInterfaceEffect(bp.Event(method,data));});
});
ctx.registerEffect("ModelWriteBegin",function(data){
    ctx.insertEntity(ctx.Entity("lock_"+data.owner,"writeLock",{logicalId:data.logicalId,owner:data.owner,revision:data.revision}));
});
ctx.registerQuery("WriteLock.All",function(e){return e.type==="writeLock";});
ctx.registerEffect("ModelVerified",function(data){
    ctx.runQuery("WriteLock.All").forEach(function(lock){
        if(lock.logicalId===data.logicalId && lock.revision===data.revision) ctx.removeEntity(lock.id);
    });
    var resource=getModelEntity(data.logicalId);
    if(resource.revision!==data.revision) throw new Error("Stale verification acknowledgement");
    ctx.removeEntity(resource.id);
    ctx.insertEntity(ctx.Entity(resource.id,"resource",{
        resourceType:resource.resourceType,expected:cloneExpected(resource.expected),
        revision:resource.revision,verifiedRevision:data.revision
    }));
});
ctx.registerQuery("Resource.All",function(e){return e.type==="resource";});
ctx.registerQuery("Verification.Pending",function(e){return e.type==="resource" && e.verifiedRevision<e.revision;});
function waitForResource(logicalId, revision) {
    while(true) {
        var resources=ctx.runQuery("Resource.All").filter(function(e){return e.id===logicalId;});
        if(resources.length===1 && resources[0].verifiedRevision>=revision && resources[0].verifiedRevision===resources[0].revision) return resources[0];
        waitFor(bp.EventSet("Resource verified "+logicalId,function(event){return event.name==="ModelVerified" && event.data.logicalId===logicalId;}));
    }
}
function readyResources(type) {
    return ctx.runQuery(type+".Ready");
}
function waitForDependencies(types, bindings) {
    // Each wakeup re-evaluates ALL dependencies. No fixed ordering of parents.
    while(true) {
        var chosen={};
        var missing=[];
        types.forEach(function(type){
            if(chosen[type]) return;
            var available=readyResources(type).filter(function(resource){return !bindings || !bindings[type] || resource.id===bindings[type];});
            if(available.length) chosen[type]=available[0]; else missing.push(type);
        });
        if(!missing.length) return chosen;
        waitFor(bp.EventSet("Any required dependency becomes verified",function(event){
            return event.name==="ModelVerified";
        }));
    }
}
'''


def infer_authentication(raw, paths):
    """OAuth2 password flow is declared by OpenAPI; no application-name branch."""
    schemes = raw.get('components', {}).get('securitySchemes', {})
    used = set()
    for path in paths:
        for method in ('post','put'):
            if method not in raw['paths'][path]:continue
            requirements = raw['paths'][path][method].get('security', raw.get('security', []))
            for requirement in requirements:
                used.update(requirement)
    if not used:
        return None
    candidates = []
    c = Contract(raw)
    for name in sorted(used):
        scheme = schemes.get(name, {})
        if scheme.get('type')=='http' and scheme.get('scheme')=='bearer':
            candidates.append(dict(scheme=name,external_token=True,source='#/components/securitySchemes/'+name));continue
        flow = scheme.get('flows', {}).get('password')
        if scheme.get('type') != 'oauth2' or not flow:
            raise ValueError('Unsupported authentication scheme: ' + name)
        url = flow['tokenUrl']
        op = raw.get('paths', {}).get(url, {}).get('post')
        if not op:
            raise ValueError('Token URL must resolve to a documented local POST: ' + url)
        content = op.get('requestBody', {}).get('content', {})
        schema = c.resolve(content.get('application/x-www-form-urlencoded', {}).get('schema', {}))
        props = schema.get('properties', {})
        if not {'username', 'password'} <= set(props):
            raise ValueError('Password flow lacks documented username/password fields')
        fields = {}
        for field in schema.get('required', []):
            if field not in ('username', 'password'):
                fields[field] = c.value(props[field], 'authentication-' + field)
        candidates.append(dict(scheme=name, token_url=url, codes=c.response(op)[0], extra_fields=fields,
                               source='#/components/securitySchemes/' + name,
                               operation=pointer(url,'post')))
    if len(candidates) != 1:
        raise ValueError('Ambiguous password authentication flow')
    return candidates[0]


def render_authentication(auth, base_url):
    if not auth:
        return [], []
    if auth.get('external_token'):
        return [], []
    body = "username=@{encodeURIComponent(java.lang.System.getenv('SBT_USERNAME'))}&password=@{encodeURIComponent(java.lang.System.getenv('SBT_PASSWORD'))}"
    for field, value in auth['extra_fields'].items():
        from urllib.parse import quote
        body += '&' + quote(field, safe='') + '=' + quote(str(value), safe='')
    interface = [
        '// ' + auth['source'] + ' and ' + auth['operation'],
        '// Credentials are evaluated from the child-process environment at execution.',
        '// No credential value is included in generated source or symbolic samples.',
        'var AuthenticationReady = bp.Event("AuthenticationReady");',
        'var BusinessHTTP = bp.EventSet("Business HTTP", function(event) {',
        '    return !!(event.data && event.data.lib === "REST" && event.data.model && event.data.model.action !== "authenticate");',
        '});',
        'function authenticate() {',
        '    var callback = callbackFromSource(' + j("var token=JSON.parse(response.body);if(typeof token.access_token!=='string'||!token.access_token) {pvg.fail('OAuth2 access_token absent');return;}if(token.token_type && String(token.token_type).toLowerCase()!=='bearer'){pvg.fail('Unsupported OAuth2 token type');return;}pvg.rtv.set('SBT_AUTH_TOKEN',token.access_token);") + ');',
        '    return sync({request:bp.Event("POST", {',
        '        lib:"REST",method:"POST",url:' + j(base_url.rstrip('/') + auth['token_url']) + ',',
        '        headers:{"Content-Type":"application/x-www-form-urlencoded"},parameters:{},',
        '        body:' + j(body) + ',expectedResponseCodes:' + j(auth['codes']) + ',',
        '        model:{action:"authenticate"},callback:callback',
        '    })});',
        '}'
    ]
    stories = [
        '// Authentication is a separate protocol process; all HTTP stays in interfaces.',
        'bthread("authenticate client",function(){',
        '    authenticate();',
        '    request(AuthenticationReady);',
        '});',
        'bthread("require authentication before business HTTP",function(){',
        '    sync({block:BusinessHTTP,waitFor:AuthenticationReady});',
        '});'
    ]
    return interface, stories


def render(c, entities, name, base_url, instances, seed, contribution=None, instance_counts=None, observation_support=False, actor_plan=None, resume_only=False, instance_plans=None):
    auth=None if actor_plan else infer_authentication(c.raw,[e['path'] for e in entities])
    auth_interface,auth_stories=render_authentication(auth,base_url)
    headers={'Content-Type':'application/json'}
    if auth:headers['Authorization']="Bearer @{java.lang.System.getenv('SBT_AUTH_TOKEN')}" if auth.get('external_token') else 'Bearer @{SBT_AUTH_TOKEN}'
    iface=['//@provengo summon rest','//@provengo summon rtv',
           '// Generated by generator_v56 context-generate; do not edit.',
           'var svc = new RESTSession('+j(base_url.rstrip('/'))+', "context-client", {headers:'+j(headers)+'});',INTERFACE_COMMON] + auth_interface
    dal=['//@provengo summon context','// Generated Context DAL using the built-in Provengo Context library.',DAL_COMMON]
    stories=['// Generated stories: explicit entity instances; Context-driven verification.',
             '// HTTP paths and request bodies are confined to interfaces.',
             'ctx.bthread("protectWriteAndReadback", "WriteLock.All", function(lock) {',
             '    sync({block:matchesConflictingWrites(lock.logicalId,lock.owner),waitFor:matchesVerified(lock.logicalId,lock.revision)});',
             '});',
             'ctx.bthread("protectPendingVerification", "Verification.Pending", function(resource) {',
             '    sync({block:matchesMutations(resource.id),waitFor:matchesVerified(resource.id,resource.revision)});',
             '});'] + auth_stories
    report=[]
    for e in entities:
        n=e['name']; t=j(n)
        dal += ['ctx.registerQuery('+j(n+'.Ready')+',function(e){return e.type==="resource" && e.resourceType==='+t+' && e.verifiedRevision===e.revision;});']
        create_codes,_=c.response(e['create']);get_codes,_=c.response(e['get'])
        url=e['detail'].replace('{'+e['parameter']+'}', 'PLACEHOLDER')
        iface += ['\n// '+pointer(e['path'],e['create_method']),
                  'var Any'+n+'Created = matchesInterfaceEvent("create",'+t+');',
                  'var Any'+n+'Updated = matchesInterfaceEvent("update",'+t+');',
                  'function create'+n+'(logicalId, fixture, parents) {',
                  '    var body=JSON.parse(JSON.stringify(fixture));']
        initialized_arrays = set()
        for d in e['dependencies']:
            if d.get('path_only'):continue
            val='"@{ID_" + parents['+j(d['target'])+'].id.replace(/[^A-Za-z0-9_]/g,"_") + "}"'
            if d.get('array'):
                if d['field'] not in initialized_arrays:
                    iface += ['    body['+j(d['field'])+']=['+j(d['template'])+'];']
                    initialized_arrays.add(d['field'])
                iface += ['    body['+j(d['field'])+'][0]['+j(d['subfield'])+']='+val+';']
                continue
            if d['object']:val='{id:'+val+'}'
            iface += ['    body['+j(d['field'])+']='+val+';']
        iface += ['    var key=logicalId.replace(/[^A-Za-z0-9_]/g,"_");',
                  '    var source="var payload=JSON.parse(response.body);\\n";']
        if e['identity_mode']=='primitive-route':
            iface += ['    source += "if(typeof payload!==\'string\'||!payload) pvg.fail(\'No route locator\');pvg.rtv.set("+JSON.stringify("ROUTE_"+key)+",payload);\\n";']
        else:
            if e['identity_mode']=='collection':
                iface += ['    source += "var candidates=[];";',
                          '    source += '+j('var fields='+j(e['identity_arrays'])+';fields.forEach(function(f){(payload[f]||[]).forEach(function(item){candidates.push(item);});});')+';',
                          '    source += "if(candidates.length!==1) pvg.fail(\'Create identity ambiguous; no merge guess\');payload=candidates[0];\\n";']
            iface += ['    source += "if(!payload.id) pvg.fail(\'Create identity absent\');pvg.rtv.set("+JSON.stringify("ID_"+key)+",payload.id);pvg.rtv.set("+JSON.stringify("ROUTE_"+key)+",payload["+'+j(j(e['route_field']))+'+"]);\\n";']
        # Nested item routes bind parent locators independently of the item's own locator.
        for dep in e.get('path_dependencies',[]):
            if dep['parameter']==e['parameter'] or '{'+dep['parameter']+'}' not in e['detail']:continue
            iface += ['    source += "pvg.rtv.set("+JSON.stringify("PARENT_"+key+"_'+dep['parameter']+'")+",pvg.rtv.get("+JSON.stringify("ROUTE_"+parents['+j(dep['target'])+'].id.replace(/[^A-Za-z0-9_]/g,"_"))+"));\\n";']
        create_route=j(e['path'])
        for dep in e.get('path_dependencies',[]):
            create_route+=' .replace('+j('{'+dep['parameter']+'}')+',"@{ROUTE_"+parents['+j(dep['target'])+'].id.replace(/[^A-Za-z0-9_]/g,"_")+"}")'
        iface += ['    var expectedBody=JSON.parse(JSON.stringify(body));']
        for dep in e.get('path_dependencies',[]):
            if dep.get('foreign_field'):
                iface += ['    expectedBody['+j(dep['foreign_field'])+']="@{ID_"+parents['+j(dep['target'])+'].id.replace(/[^A-Za-z0-9_]/g,"_")+"}";']
        iface += ['    return requestRest('+j(e['create_method'].upper())+','+create_route+',body,'+j(create_codes)+',',
                  '        {action:"create",type:'+t+',logicalId:logicalId,expected:expectedBody,affected:[logicalId].concat(Object.keys(parents).map(function(k){return parents[k].id;}))},callbackFromSource(source));',
                  '}',
                  '\n// '+pointer(e['detail'],'get'),
                  'function verify'+n+'(resource) {',
                  '    var key=resource.id.replace(/[^A-Za-z0-9_]/g,"_");',
                  '    return requestRest("GET",'+j(url)+'.replace("PLACEHOLDER","@{ROUTE_"+key+"}"),undefined,'+j(get_codes)+',',
                  '        {action:"read",type:'+t+',logicalId:resource.id},',
                  '        callbackFromSource(validationSource(resource.expected,"ID_"+key,"SNAPSHOT_"+key,null,' + ('resource.revision===1 && resource.verifiedRevision===0' if e['identity_mode']=='primitive-route' else 'false') + ')));',
                  '}']
        update=e['update_method'] if e['change_field'] else None
        if update:
            codes,_=c.response(e['update'])
            iface += ['\n// '+pointer(e['detail'],e.get('source_update_method',update)),
                      'function update'+n+'(resource, delta) {',
                      '    var owner=resource.id+"_"+(resource.revision+1);',
                      '    request(bp.Event("ModelWriteBegin",{logicalId:resource.id,owner:owner,revision:resource.revision+1}));',
                      '    var key=resource.id.replace(/[^A-Za-z0-9_]/g,"_");',
                      '    var prepare="var before=JSON.parse(response.body);var body={};var fields="+'+j(j(e['update_fields']))+'+";fields.forEach(function(f){if(before[f]!==undefined)body[f]=before[f];});var delta="+JSON.stringify(delta)+";";',
                      '    prepare += "function resolve(v){if(typeof v===\'string\'&&/^@\\\\{[A-Za-z0-9_]+\\\\}$/.test(v))return pvg.rtv.get(v.slice(2,-1));if(Array.isArray(v))return v.map(resolve);if(v&&typeof v===\'object\'){var r={};Object.keys(v).forEach(function(k){r[k]=resolve(v[k]);});return r;}return v;}";',
                      '    prepare += "Object.keys(delta).forEach(function(f){body[f]=resolve(delta[f]);});var required="+'+j(j(e['required_update']))+'+";required.forEach(function(f){if(body[f]===undefined)pvg.fail(\'Required update carry absent: \'+f);});pvg.rtv.set("+JSON.stringify("UPDATE_"+key)+",JSON.stringify(body));";',
                      '    requestRest("GET",'+j(url)+'.replace("PLACEHOLDER","@{ROUTE_"+key+"}"),undefined,'+j(get_codes)+',',
                      '        {action:"prepare",type:'+t+',logicalId:resource.id},callbackFromSource(validationSource(resource.expected,"ID_"+key,null,prepare)));',
                      '    return requestRest('+j(update.upper())+','+j(url)+'.replace("PLACEHOLDER","@{ROUTE_"+key+"}"),"@{UPDATE_"+key+"}",'+j(codes)+',',
                      '        {action:"update",type:'+t+',logicalId:resource.id,expected:delta,owner:owner,affected:[resource.id]},',
                      '        callbackFromSource("if(response.body) JSON.parse(response.body);"));',
                      '}']
        stories += ['\n// Verification is activated by a Context query, independently of producers.',
                    'ctx.bthread("verify'+n+'AfterEveryWrite", "Verification.Pending", function(resource) {',
                    '    if(resource.resourceType!=='+t+') return;',
                    '    verify'+n+'(resource);',
                    '    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));',
                    '});']
        for instance_plan in (instance_plans or {}).get(n,[{'id':n+'_'+str(i),'bindings':{}} for i in range(1,(instance_counts or {}).get(n,instances)+1)]):
            i=instance_plan.get('fixture_index',1)
            if resume_only:continue
            if contribution and n==contribution["item_type"]: continue
            logical=instance_plan['id']
            body=json.loads(j(e['body']).replace('INSTANCE',str(i)))
            targets=sorted({d['target'] for d in e['dependencies']})
            stories += ['\n// Instance '+logical+': creation, independent readback, update, independent readback.',
                        'bthread('+j('lifecycle '+logical)+', function() {',
                        '    var parents=waitForDependencies('+j(targets)+','+j(instance_plan['bindings'])+');',
                        '    create'+n+'('+j(logical)+','+j(body)+',parents);',
                        '    waitFor(matchesVerified('+j(logical)+',1));']
            if update:
                delta={e['change_field']:c.value(e['update_schema']['properties'][e['change_field']],str(seed)+'-'+logical+'-updated')}
                # Default may equal the existing value. Explicitly generate a nonempty test delta.
                if delta[e['change_field']] == c.resolve(e['update_schema']['properties'][e['change_field']]).get('default'):
                    delta[e['change_field']]='sbt-'+str(seed)+'-'+logical+'-updated'
                stories += ['    update'+n+'(getModelEntity('+j(logical)+'),'+j(delta)+');',
                            '    waitFor(matchesVerified('+j(logical)+',2));']
            stories += ['});']
        # Embedded-object linking gets its OWN process bthread, separate from recipe lifecycle.
        if e['nested'] and update and not (contribution and contribution.get('mode') in ('removal','copy')):
            nested=e['nested'][0]
            targets=sorted({l['target'] for l in nested['links']})
            for i in range(1,(instance_counts or {}).get(n,instances)+1):
                logical=n+'_'+str(i)
                iface += ['\nfunction link'+n+'Dependencies(resource, parents) {','    var links=[];']
                # one named function suffices for all instances
                iface=iface[:-2] if i>1 else iface
                if i==1:
                    for k in range(2):
                        item={f:c.value(s,str(seed)+'-'+n+'-embedded-'+str(k)+'-'+f) for f,s in nested['schema'].get('properties',{}).items()
                              if f in nested['schema'].get('required',[]) and not any(l['field']==f for l in nested['links'])}
                        for f,s in nested['schema'].get('properties',{}).items():
                            if c.resolve(s).get('type') in ('number','integer'):
                                numeric=dict(c.resolve(s)); numeric.pop('default',None); item[f]=c.value(numeric,str(seed)+'-'+f)
                                if contribution and n==contribution['recipe_type'] and f==contribution['quantity_field']:
                                    item[f]=max(2*(k+1),numeric.get('minimum',0))
                                    if numeric.get('maximum') is not None and item[f]>numeric['maximum']:raise ValueError('F01 fixture quantity outside schema bounds')
                        iface+=['    var item'+str(k)+'='+j(item)+';']
                        for l in nested['links']:
                            iface+=['    var dependency'+str(k)+l['field']+'={};',
                                    '    '+j(l['required'])+'.forEach(function(f){if(f!=="id") dependency'+str(k)+l['field']+'[f]=parents['+j(l['target'])+'].expected[f];});',
                                    '    dependency'+str(k)+l['field']+'.id="@{ID_"+parents['+j(l['target'])+'].id.replace(/[^A-Za-z0-9_]/g,"_")+"}";',
                                    '    item'+str(k)+'['+j(l['field'])+']=dependency'+str(k)+l['field']+';']
                        iface+=['    links.push(item'+str(k)+');']
                    iface+=['    var delta={}; delta['+j(nested['field'])+']=links;']
                    if contribution and n==contribution['recipe_type']:
                        for f,prop in e['update_schema']['properties'].items():
                            numeric=c.resolve(prop)
                            # Optional nullable scalars are not contribution preconditions.
                            nullable = prop.get('nullable', False) or any(x.get('type') == 'null' for x in prop.get('anyOf', []))
                            if numeric.get('type') in ('number','integer') and numeric.get('default') == 0 and not nullable and f in e['read_schema']['properties']:
                                numeric=dict(numeric);numeric.pop('default',None)
                                iface+=['    delta['+j(f)+']='+j(c.value(numeric,str(seed)+'-'+f))+';']
                    iface+=['    update'+n+'(resource,delta);','}']
                stories+=['\n// Separate process: build two embedded objects sharing independent parents.',
                          'bthread('+j('link '+logical)+' ,function(){',
                          '    waitForDependencies('+j(targets+[n])+');',
                          '    waitForResource('+j(logical)+','+str(2 if update else 1)+');',
                          '    var parents=waitForDependencies('+j(targets)+','+j(instance_plan['bindings'])+');',
                          '    link'+n+'Dependencies(getModelEntity('+j(logical)+'),parents);',
                          '    waitFor(matchesVerified('+j(logical)+',3));','});']
        report.append(dict(entity=n,source=e['provenance'],create_dependencies=e['dependencies'],
                           embedded_links=[dict(field=v['field'],links=v['links'],pointer=v['pointer']) for v in e['nested']],
                           identity_mode=e['identity_mode'],readback='request-derived projection plus stable identity',
                           update_field=e['change_field'],delete='not emitted: absence response is not explicitly documented',
                           complex_actions='opt-in contribution hypothesis emitted' if contribution else 'not emitted: transition effects are not specified by schemas alone'))
    if contribution:
        if contribution.get('mode')=='copy':
            from .context_copy import render_copy
            ci,cd,cs=render_copy(contribution)
        elif contribution.get('mode')=='removal':
            from .context_removal import render_removal
            ci,cd,cs=render_removal(contribution)
        else:
            from .context_contribution import render_contribution
            ci,cd,cs=render_contribution(contribution)
        iface.append(ci);dal.append(cd);stories.append(cs)
    if observation_support:
        from .context_observation_common import INTERFACES, DAL, STORIES
        iface.append(INTERFACES); dal.append(DAL); stories.append(STORIES)
    if actor_plan:
        from .context_actors import render_actors
        ai, ad, ast = render_actors(actor_plan, base_url)
        # Specialize the shared transport template inside the central renderer.
        iface[4] = iface[4].replace('headers: svc.defaultHeaders, parameters: {},',
            'headers: actorSessions[resolveRequestActor(semantic)].defaultHeaders, parameters: {},')
        iface[4] = iface[4].replace('expectedResponseCodes: codes, callback: callback, model: semantic',
            'expectedResponseCodes: codes, callback: callback, model: actorSemantic(semantic)')
        iface.append(ai); dal.append(ad); stories.append(ast)
        dal = [s.replace('resourceType:data.type,expected:cloneExpected(data.expected)',
                         'resourceType:data.type,actorId:data.actor,expected:cloneExpected(data.expected)')
                 .replace('resourceType:resource.resourceType,expected:expected',
                          'resourceType:resource.resourceType,actorId:resource.actorId,expected:expected')
                 .replace('resourceType:resource.resourceType,expected:cloneExpected(resource.expected)',
                          'resourceType:resource.resourceType,actorId:resource.actorId,expected:cloneExpected(resource.expected)') for s in dal]
        if observation_support:
            iface = [s.replace("{action:'observe',observationId:id}", "{action:'observe',observationId:id,actor:targets[0].actionActor}")
                      .replace("{action:'observationReadback',observationId:observation.id}",
                               "{action:'observationReadback',observationId:observation.id,actor:target.actor}")
                      .replace("var r={code:raw.code", "var r={actor:"+"JSON_PLACEHOLDER"+",code:raw.code") for s in iface]
            # Callback actor provenance is serialized from the model, never from tokens.
            iface = [s.replace("var r={actor:JSON_PLACEHOLDER,code:raw.code", "var r={actor:'+JSON.stringify(targets[0].actionActor)+',code:raw.code") for s in iface]
    for entity in entities:
        item_url=entity['detail'].replace('{'+entity['parameter']+'}','PLACEHOLDER')
        old=j(item_url)+'.replace("PLACEHOLDER","@{ROUTE_"+key+"}")'
        new=old
        for dep in entity.get('path_dependencies',[]):
            if dep['parameter']!=entity['parameter'] and '{'+dep['parameter']+'}' in item_url:
                new+='.replace('+j('{'+dep['parameter']+'}')+',"@{PARENT_"+key+"_'+dep['parameter']+'}")'
        if new!=old:iface=[line.replace(old,new) for line in iface]
    return '\n'.join(iface)+'\n','\n'.join(dal)+'\n','\n'.join(stories)+'\n',report


def generate_context_model(openapi, output, name, base_url, paths, instances=2, seed=1, contribution=False, observation_support=False, observed_actions=None, actor_config=None, negative_schema=False, method_adapter=None, checkpoint_plan=None, instance_plans=None):
    if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]*',name):raise ValueError('Invalid output model name')
    raw_bytes=Path(openapi).read_bytes()
    source_raw=json.loads(raw_bytes.decode('utf-8-sig'))
    raw,normalization=normalize_context_contract(source_raw)
    c, entities=build_model(raw,paths,instances,seed)
    adapter=None
    if method_adapter:
        adapter=json.loads(Path(method_adapter).read_text())
        if adapter['contract_sha256']!=hashlib.sha256(raw_bytes).hexdigest():raise ValueError('Method adapter contract hash mismatch')
        for rule in adapter['rules']:
            matches=[e for e in entities if e['detail']==rule['path'] and e['update_method']==rule['source_method']]
            if len(matches)!=1:raise ValueError('Adapter requires one selected matching update')
            entity=matches[0];entity['source_update_method']=entity['update_method'];entity['update_method']=rule['effective_method']
            entity['provenance'].append(dict(pointer=pointer(rule['path'],rule['source_method']),rule='EXPLICIT_METHOD_COMPATIBILITY_ADAPTER',evidence=adapter['evidence']))
    actor_plan=None
    if actor_config:
        if contribution:
            raise ValueError('Actor mode is not yet supported by contribution experiment templates')
        from .context_actors import load_actor_plan
        actor_plan=load_actor_plan(actor_config,entities,instances)
    process_plan=[]
    process_report=[]
    if observed_actions:
        from .context_processes import infer_processes
        process_plan=infer_processes(c,entities,observed_actions)
        observation_support=True
    plan=None
    if contribution:
        if instances!=1:raise ValueError('Contribution pilot requires one instance per entity')
        from .context_contribution import infer_contribution
        plan=infer_contribution(c,entities)
    checkpoint=json.loads(Path(checkpoint_plan).read_text()) if checkpoint_plan else None
    if checkpoint and (not negative_schema or actor_plan or contribution or observed_actions):
        raise ValueError('Checkpoint acceptance requires the single-user negative schema base model')
    interface,dal,stories,report=render(c,entities,name,base_url,instances,seed,plan,observation_support=observation_support,actor_plan=actor_plan,resume_only=bool(checkpoint and checkpoint['mode']=='resume'),instance_plans=instance_plans)
    negative_catalog=None
    if negative_schema:
        if actor_plan or contribution or observed_actions:
            raise ValueError('Negative schema stage requires the single-user base Context model; combinations are not yet validated')
        from .negative_schema import catalog as negative_catalog_builder, render as render_negatives
        negative_catalog=negative_catalog_builder(c,entities)
        ni,nd,ns=render_negatives(c,entities,negative_catalog,instances,producers=not bool(checkpoint),instance_plans=instance_plans)
        # Unified negatives are independent; legacy gating remains only for legacy calls.
        for entity in entities:
            if checkpoint or instance_plans:continue
            if not any(case['resource']==entity['name'] for case in negative_catalog['cases']):continue
            for index in range(1,instances+1):
                logical=entity['name']+'_'+str(index)
                marker='    waitFor(matchesVerified('+j(logical)+',1));'
                gate='\n    waitFor(bp.EventSet('+j('Negatives complete '+logical)+',function(event){return event.name==="NegativeLifecycleComplete" && event.data.logicalId==='+j(logical)+';}));'
                stories=stories.replace(marker,marker+gate)
        interface+=ni;dal+=nd;stories+=ns
        if checkpoint:
            from .context_checkpoint import render_checkpoint
            ci,cd,cs=render_checkpoint(entities,negative_catalog,instances,checkpoint)
            interface+=ci;dal+=cd;stories+=cs
    if instance_plans:
        # Direct single-identity SUT routing; no legacy actor proxy in unified mode.
        interface=interface.replace("    url='/__actor/'+RELATION_ACTOR+url;\n",'')
        stories+=(Path(__file__).parents[2]/'unified_resource_gate.js').read_text()
    if process_plan:
        from .context_processes import render_processes
        pi,ps,process_report=render_processes(c,process_plan,instances,actor_plan)
        interface+=pi+"\n"
        stories+=ps+"\n"
    out=Path(output)
    if out.exists() and any(out.iterdir()):raise ValueError('Use a new, empty output directory')
    out.mkdir(parents=True,exist_ok=True)
    files={'interfaces.'+name+'.js':interface,'dal.js':dal,'stories.'+name+'.js':stories}
    for filename,content in files.items():
        with (out/filename).open('w',encoding='utf-8',newline='\n') as handle:
            handle.write(content)
    project_config=None
    if out.name=='js' and out.parent.name=='spec':
        config=out.parent.parent/'config'/'provengo.yml'
        if config.exists():raise ValueError('Project config already exists; no overwrite')
        config.parent.mkdir(parents=True,exist_ok=True)
        budget=200+(len(negative_catalog['cases'])*instances*30 if negative_catalog else 0)
        config.write_text('version: 2\nscenario.max-length: '+str(budget)+'\n',encoding='utf-8')
        project_config='config/provengo.yml'
    if negative_catalog:
        (out/'negative_catalog.json').write_text(json.dumps(negative_catalog,indent=2),encoding='utf-8')
    (out/'generation_report.json').write_text(json.dumps(dict(
        status='GENERATED_NOT_NATIVE_EXECUTED',source_sha256=hashlib.sha256(raw_bytes).hexdigest(),
        contract_version=raw.get('info',{}).get('version'),contract_normalization=normalization,method_adapter=adapter,seed=seed,instances=instances,
        scope_paths=paths,instance_plans=instance_plans,entities=report,contribution=plan,authentication=({'mode':'per-actor environment tokens','tokens_in_generated_source':False} if actor_plan else infer_authentication(raw,paths)),project_config=project_config,
        inference_policy='generic schema/title/key conventions; ambiguous cases fail; these conventions are not mathematical consequences of OpenAPI',
        negative_schema=negative_catalog,negative_cases_per_instance=(len(negative_catalog['cases']) if negative_catalog else 0),checkpoint_acceptance=checkpoint,
        oracle_policy='expected request projection, generic write/read preservation hypothesis; no observed-response learning of expected quantity',
        unsupported=([] if plan else ['Recipe contribution quantity transitions'])+['Merge equivalence and quantity algebra','Copy deep-isolation policy','Cross-account authorization policy','DELETE absence when not documented'],
        **({'observation_support': 'shared capture/readback primitives; see process bindings'} if observation_support else {}),
        **({'process_bindings':process_report} if observed_actions else {}),
        **({'actor_bindings':actor_plan} if actor_plan else {}),
        native_executed=False,sut_executed=False,
        file_sha256={k:hashlib.sha256(v.encode()).hexdigest() for k,v in files.items()}
    ),indent=2),encoding='utf-8')
    print('CONTEXT_MODEL_GENERATED_NOT_EXECUTED: '+str(out))
