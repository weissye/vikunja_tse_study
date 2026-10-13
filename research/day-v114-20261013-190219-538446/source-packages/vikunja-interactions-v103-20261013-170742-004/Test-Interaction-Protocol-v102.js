const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync(process.argv[2],'utf8');let threads=[],requests=[],queue=[];
const sandbox={INTERACTION_GROUPS:[],bthread:(name,body)=>threads.push({name,body}),bp:{Event:(name,data)=>({name,data}),EventSet:(name,f)=>f},sync:()=>{},request:e=>requests.push(e),waitForResource:()=>{},awaitSession:()=>{},captureInteractionRead:()=>{},writeInteractionSnapshot:()=>{},probeInteraction:()=>{},waitFor:predicate=>{let e=queue.shift();assert(e&&predicate(e));return e;}};
vm.runInNewContext(code,sandbox);
function run(profile){
 const group={id:'G',logical_id:'R',profile};threads=[];requests=[];
 sandbox.registerInteractionCoordinator(group);
 const event=(name,sid)=>({name,data:{groupId:'G',session:sid}});
 queue=profile==='free_stale_disjoint_fields'?[]:[event('InteractionReadReady','B'),event('InteractionReadReady','B'),event('InteractionReadReady','A')];
 queue.push(event('InteractionWriteDone','B'),event('InteractionWriteDone','A'),event('InteractionProbeDone'),event('InteractionReconciled'));
 threads[0].body();assert(queue.length===0);
 assert(requests[0].name==='InteractionAcquire'&&requests[1].name==='InteractionOpen');
 assert(requests.some(e=>e.name==='InteractionWritePermit')===(profile!=='free_stale_disjoint_fields'));
 assert(requests[requests.length-1].name==='InteractionRelease');
}
run('shared_read_same_field');run('shared_read_disjoint_fields');run('free_stale_disjoint_fields');
console.log('V102_PROTOCOL_LOCAL_PASS: B-first readiness, duplicate readiness, free/shared barrier distinction');
