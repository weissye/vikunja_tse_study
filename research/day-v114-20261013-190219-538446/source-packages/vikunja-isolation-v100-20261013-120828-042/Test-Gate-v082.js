// Exercise the actual generated bthread's blocker across acquire/release events.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
function gate(file){
 const samples=[{name:'NegativeAcquire',data:{logicalId:'parent',caseId:'case-parent'}},
 {name:'NegativeRelease',data:{logicalId:'parent',caseId:'wrong-case'}},
 {name:'NegativeRelease',data:{logicalId:'parent',caseId:'case-parent'}}];let iteration=0;const stopped={};
 const blocked=[];
 const c={bthread:(n,f)=>{try{f()}catch(e){if(e!==stopped)throw e}},bp:{all:{},EventSet:(n,p)=>p},sync:o=>{
   if(iteration===samples.length+1)throw stopped;
   const writes=[{name:'PUT',data:{model:{action:'create',logicalId:'child',affected:['child','parent']}}},
     {name:'POST',data:{model:{action:'update',logicalId:'unrelated',affected:['unrelated']}}},
     {name:'POST',data:{model:{action:'negative_attempt',logicalId:'parent',caseId:'case-parent'}}},
     {name:'POST',data:{model:{action:'negative_attempt',logicalId:'other',caseId:'case-other',affected:['other','parent']}}},
     {name:'GET',data:{model:{action:'read',logicalId:'parent'}}}];
   blocked.push(writes.map(o.block));
   return samples[iteration++]||{name:'Stop',data:{}};
 }};
 vm.createContext(c);vm.runInContext(fs.readFileSync(file,'utf8').slice(fs.readFileSync(file,'utf8').lastIndexOf('// Generic observation isolation')),c);
 assert.deepStrictEqual(blocked[0],[false,false,false,false,false]);
 assert.deepStrictEqual(blocked[1],[true,false,false,true,false]);
 assert.deepStrictEqual(blocked[2],[true,false,false,true,false]);
 assert.deepStrictEqual(blocked[3],[false,false,false,false,false]);
}
gate(process.argv[2]);console.log('V082_FOOTPRINT_GATE_PASS: child blocked, unrelated enabled, own negative enabled, stale release ignored, correct release unblocks');
