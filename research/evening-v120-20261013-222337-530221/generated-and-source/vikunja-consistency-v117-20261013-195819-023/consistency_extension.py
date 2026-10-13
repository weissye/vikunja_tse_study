"""Add independent readback audits to the existing unified emitter output."""
import json
import re


def render(ir, generation, rounds):
    if type(rounds) is not int or not 1 <= rounds <= 10:
        raise ValueError('rounds must be an integer from 1 to 10')
    bindings = generation['instance_bindings']
    rows = []
    for entity in ir['entities']:
        name = entity['name']
        if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_]*', name):
            raise ValueError('Invalid entity function name')
        if not entity.get('get'):
            continue
        for item in bindings[name]:
            rows.append({'logical_id': item['id'], 'type': name,
                         'bindings': item['bindings'], 'dependencies': entity['dependencies'],
                         'read_pointer': '#/paths/' + entity['detail'].replace('~', '~0').replace('/', '~1') + '/get',
                         'expectation': 'Existing strict verifier against registered Context state',
                         'authority': 'Inherited baseline model oracle; not newly inferred semantics'})
    text = '\n// Independent consistency readback extension v117.\n'
    text += 'var CONSISTENCY_AUDITS=' + json.dumps(rows) + ';\n'
    text += 'function consistencyVerify(type,entity,session){\n'
    for name in sorted({r['type'] for r in rows}):
        text += 'if(type===' + json.dumps(name) + ')return verify' + name + '(entity,session);\n'
    text += 'throw new Error("Unknown consistency verifier");}\n'
    text += '''
function registerConsistencyAudit(definition,session){
 bthread("CONSISTENCY_"+session+"_"+definition.logical_id,function(){
  awaitSession(session);
  waitForDependencies(definition.dependencies,definition.bindings);
  waitForResource(definition.logical_id,1);
  for(var round=0;round<CONSISTENCY_ROUNDS;round++){
   request(bp.Event("OperationAcquire",{logicalId:definition.logical_id,session:session}));
   consistencyVerify(definition.type,getModelEntity(definition.logical_id),session);
   bp.log.info("CONSISTENCY_AUDIT_COMPLETED "+JSON.stringify({logicalId:definition.logical_id,session:session,round:round,source:definition.read_pointer}));
   request(bp.Event("OperationRelease",{logicalId:definition.logical_id,session:session}));
  }
 });
}
'''
    text += 'var CONSISTENCY_ROUNDS=' + str(rounds) + ';\n'
    text += 'CONSISTENCY_AUDITS.forEach(function(d){["A","B"].forEach(function(s){registerConsistencyAudit(d,s);});});\n'
    return text, {'version': 'v117', 'resources': len(rows), 'audit_bthreads': 2*len(rows),
                  'planned_readback_audits': 2*len(rows)*rounds, 'cases': rows,
                  'live_execution': False, 'ordering': 'Provengo runtime selection',
                  'limitations': ['No new update/relation scenarios', 'No new recovery coverage',
                                  'Native completion counters not extended',
                                  'Audit rounds are not guaranteed distinct states']}
