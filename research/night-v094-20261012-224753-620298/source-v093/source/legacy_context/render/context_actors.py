"""Opt-in actor bindings. Credentials are environment references, never literals."""
import json
import re
from pathlib import Path
from .context_model import j


def load_actor_plan(path, entities, instances):
    raw = json.loads(Path(path).read_text(encoding='utf-8-sig'))
    if set(raw) - {'actors', 'lifecycle_actors', 'process_actors', 'readback_actor'}:
        raise ValueError('Unknown actor configuration fields')
    actors = raw.get('actors', [])
    if not 1 <= len(actors) <= 8:
        raise ValueError('Provide 1..8 actors')
    for actor in actors:
        if set(actor) != {'id', 'token_env'}:
            raise ValueError('Actor requires id and token_env; literal credentials are forbidden')
        if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_]*', actor['id']):
            raise ValueError('Invalid actor id')
        if not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*', actor['token_env']):
            raise ValueError('Invalid token environment reference')
    ids = [a['id'] for a in actors]
    if len(set(ids)) != len(ids) or len({a['token_env'] for a in actors}) != len(ids):
        raise ValueError('Actor ids and token environment references must be distinct')
    required = {e['name']+'_'+str(i) for e in entities for i in range(1, instances+1)}
    assignments = raw.get('lifecycle_actors', {})
    if set(assignments) != required or any(a not in ids for a in assignments.values()):
        raise ValueError('Bind every lifecycle instance to one declared actor')
    selected = raw.get('process_actors', ids)
    if not selected or len(set(selected)) != len(selected) or any(a not in ids for a in selected):
        raise ValueError('Invalid process actor selection')
    if raw.get('readback_actor') is not None and raw['readback_actor'] not in ids:
        raise ValueError('Invalid readback actor')
    return dict(actors=actors, lifecycle_actors=assignments, process_actors=selected,
                readback_actor=raw.get('readback_actor'),
                execution='sequential HTTP with interleaved logical actor processes',
                policy='Actor bindings do not infer authorization or transition semantics')


def render_actors(plan, base_url):
    sessions = []
    for actor in plan['actors']:
        # Token values resolve only at actuation, outside source and symbolic state.
        expression = "@{java.lang.System.getenv('" + actor['token_env'] + "')}"
        sessions.append(j(actor['id'])+':new RESTSession('+j(base_url.rstrip('/'))+','+
                        j('actor-'+actor['id'])+',{headers:'+j({'Content-Type':'application/json', 'Authorization':'Bearer '+expression})+'})')
    interface = '\n'.join([
        'var actorSessions={'+','.join(sessions)+'};',
        'var lifecycleActors='+j(plan['lifecycle_actors'])+';',
        'function resolveRequestActor(model) {',
        '    var actor=model && (model.actor || lifecycleActors[model.logicalId]);',
        '    if(!actor || !actorSessions[actor]) throw new Error("Missing explicit actor binding");',
        '    return actor;',
        '}',
        'function actorSemantic(model) {',
        '    var result={};Object.keys(model||{}).forEach(function(k){result[k]=model[k];});',
        '    result.actor=resolveRequestActor(model);return result;',
        '}',
    ])
    dal = '\n'.join([
        "ctx.registerQuery('Actor.All',function(e){return e.type==='actor';});",
        "ctx.registerEffect('ActorDeclared',function(d){ctx.insertEntity(ctx.Entity('actor_'+d.id,'actor',{actorId:d.id}));});",
    ])
    story = '\n'.join([
        "bthread('declare configured actors',function(){",
        *["    request(bp.Event('ActorDeclared',{id:"+j(a['id'])+'}));' for a in plan['actors']],
        '});',
        "bthread('bind requests to declared actors',function(){",
        "    var actors="+j([a['id'] for a in plan['actors']])+";",
        "    sync({block:bp.EventSet('Actor business HTTP',function(e){return !!(e.data && e.data.lib==='REST');}),",
        "          waitFor:bp.Event('ActorDeclared',{id:actors[actors.length-1]})});",
        '});',
    ])
    return interface, dal, story
