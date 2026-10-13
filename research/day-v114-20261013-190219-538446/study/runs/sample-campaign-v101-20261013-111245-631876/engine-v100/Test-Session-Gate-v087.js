const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(process.argv[2],'utf8').split('bthread("shared session observation windows"')[1];
assert(source);let step=0;const halt={},rows=[];
const events=[{name:'SharedAcquire',data:{logicalId:'task',session:'A'}},{name:'SharedRelease',data:{logicalId:'task',session:'B'}},{name:'SharedRelease',data:{logicalId:'task',session:'A'}}];
const probes=[{name:'SharedAcquire',data:{logicalId:'task',session:'B'}},{name:'NegativeAcquire',data:{logicalId:'task'}},{name:'ModelWriteBegin',data:{logicalId:'task',session:'B'}},{name:'POST',data:{model:{action:'update',logicalId:'task',session:'A'}}},{name:'PUT',data:{model:{action:'create',logicalId:'comment',affected:['task'],session:'B'}}},{name:'POST',data:{model:{action:'update',logicalId:'other',session:'B'}}}];
const c={bthread:(name,f)=>{try{f()}catch(e){if(e!==halt)throw e}},bp:{all:{},EventSet:(n,p)=>p},sync:o=>{if(step===4)throw halt;rows.push(probes.map(o.block));return events[step++]||{name:'Stop',data:{}}}};
vm.createContext(c);vm.runInContext('bthread("shared session observation windows"'+source,c);
assert.deepStrictEqual(rows[0],[false,false,false,false,false,false]);assert.deepStrictEqual(rows[1],[true,true,true,false,true,false]);assert.deepStrictEqual(rows[2],rows[1]);assert.deepStrictEqual(rows[3],rows[0]);
console.log('V087_SHARED_WINDOW_GATE_PASS');
