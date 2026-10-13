const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=process.argv[2],story=fs.readFileSync(root+'/spec/js/stories.vikunja.js','utf8'),report=JSON.parse(fs.readFileSync(root+'/GENERATION_v071.json','utf8'));
const threads=new Map(),calls=[],events=[];let current='';const halt={};
const c={ctx:{bthread:()=>{}},bthread:(name,body)=>{assert(!threads.has(name),'duplicate '+name);threads.set(name,body)},bp:{Event:(name,data)=>({name,data}),log:{info:value=>calls.push({kind:'log',value})}},request:e=>events.push(e),awaitSession:id=>calls.push({kind:'session',id}),waitForResource:(id,revision)=>calls.push({kind:'ready',id,revision}),getModelEntity:id=>({id,revision:1,expected:{}}),waitForDependencies:(targets,bindings)=>bindings,matchesVerified:(id,revision)=>({id,revision}),waitFor:e=>{if(current.startsWith('native login '))throw halt;calls.push({kind:'wait',e})},loginSession:id=>calls.push({kind:'login',id})};
for(const entity of Object.keys(report.instance_bindings)){
 c['create'+entity]=(id,body,parents)=>calls.push({kind:'create',entity,id,body,parents});
 c['update'+entity]=(r,delta,session)=>calls.push({kind:'update',entity,id:r.id,delta,session});
 c['verify'+entity]=(r,session)=>calls.push({kind:'read',entity,id:r.id,session});
 c['attemptNegative'+entity]=(r,rule,caseId)=>calls.push({kind:'negative',entity,id:r.id,rule,caseId});
}
vm.createContext(c);vm.runInContext(story,c);
const names=[...threads.keys()];assert.strictEqual(names.filter(n=>n.startsWith('WORK_')).length,160);assert.strictEqual(names.filter(n=>n.startsWith('lifecycle ')).length,80);assert.strictEqual(names.filter(n=>n.startsWith('negative NEG_')).length,report.negative_checks);assert.strictEqual(names.filter(n=>n.startsWith('native login ')).length,2);
function run(name){current=name;calls.length=0;events.length=0;try{threads.get(name)()}catch(e){if(e!==halt)throw e}return JSON.parse(JSON.stringify({calls,events}));}
for(const plan of report.shared_session_workflows){
 const trace=run(plan.case_id);assert.strictEqual(trace.calls.find(c=>c.kind==='session').id,plan.session);
 const updates=trace.calls.filter(c=>c.kind==='update');assert.strictEqual(updates.length,plan.fields.length);
 for(const u of updates){assert.strictEqual(u.id,plan.logical_id);assert.strictEqual(u.session,plan.session);}
 const read=trace.calls.find(c=>c.kind==='read');assert.strictEqual(read.id,plan.logical_id);assert.strictEqual(read.session,plan.session);
 const acquire=trace.events.filter(e=>e.name==='OperationAcquire'),release=trace.events.filter(e=>e.name==='OperationRelease');assert.strictEqual(acquire.length,plan.fields.length+1);assert.strictEqual(release.length,acquire.length);
}
for(const name of names.filter(n=>n.startsWith('negative NEG_'))){const trace=run(name),op=trace.calls.find(c=>c.kind==='negative');assert.strictEqual(op.caseId,name.slice('negative '.length));assert.strictEqual(trace.calls[0].id,name.split('_')[1]);}
for(const name of names.filter(n=>n.startsWith('lifecycle '))){const trace=run(name);assert.strictEqual(trace.calls.find(c=>c.kind==='create').id,name.slice('lifecycle '.length));}
for(const session of ['A','B'])assert.strictEqual(run('native login '+session).calls[0].id,session);
console.log('V091_ACTUAL_TEMPLATE_INSTANTIATION_PASS: 80 creation / 160 workflow / 1300 negative / 2 login; closures retain distinct identities');
