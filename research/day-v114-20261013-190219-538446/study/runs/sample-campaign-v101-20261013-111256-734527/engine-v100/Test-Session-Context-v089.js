const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(process.argv[2],'utf8');const part=source.slice(source.indexOf('ctx.registerQuery("Session.Ready"'));
const entities=new Map(),queries={},effects={};
const c={ctx:{registerQuery:(name,f)=>queries[name]=f,registerEffect:(name,f)=>effects[name]=f,
 runQuery:name=>Array.from(entities.values()).filter(queries[name]),
 getEntityById:id=>{if(!entities.has(id))throw Error('Key CTX.Entity missing');return entities.get(id)},
 Entity:(id,type,data)=>Object.assign({id,type},data),
 insertEntity:e=>{assert(!entities.has(e.id),'duplicate entity');entities.set(e.id,e)},removeEntity:id=>{assert(entities.has(id),'missing entity');entities.delete(id)}}};
vm.createContext(c);vm.runInContext(part,c);
effects.SessionReady({session:'A'});assert.strictEqual(entities.size,1);
effects.SessionReady({session:'B'});assert.strictEqual(entities.size,2);
effects.SessionReady({session:'B'});assert.strictEqual(entities.size,2);
effects.SessionsInvalidated({});assert.strictEqual(entities.size,0);
effects.SessionReady({session:'B'});effects.SessionReady({session:'A'});assert.strictEqual(entities.size,2);
console.log('V089_ACTUAL_SESSION_CONTEXT_EFFECT_PASS');
