const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(process.argv[2],'utf8');
const code=source.slice(source.indexOf('bthread("research time budget and stable boundary"'));
let now=0,body,logs=[],i=0;
const events=[{name:'OperationAcquire',data:{logicalId:'r'}},{name:'NegativeAcquire',data:{caseId:'n'}},{name:'NegativeRelease',data:{caseId:'n'}},{name:'OperationRelease',data:{logicalId:'r'}}];
const stop={};
const sandbox={java:{lang:{System:{nanoTime:()=>now}}},bthread:(name,f)=>{body=f},ctx:{runQuery:()=>[]},bp:{all:{},EventSet:(name,f)=>f,log:{info:s=>logs.push(JSON.parse(s.split('SHORT_RUN_BOUNDARY ')[1]))}},sync:spec=>{
 if(i===events.length)throw stop;
 if(i===2)now=601e9;
 if(now>0){
  assert(spec.block({name:'OperationAcquire'}));assert(spec.block({name:'NegativeAcquire'}));assert(spec.block({name:'PUT',data:{model:{action:'create'}}}));
  for(const action of ['update','checkpoint','negative_attempt','negative_readback','authenticate','read'])assert(!spec.block({name:'POST',data:{model:{action}}}));
  assert(!spec.block({name:'OperationRelease'}));assert(!spec.block({name:'NegativeRelease'}));
 }
 return events[i++];
}};
vm.runInNewContext(code,sandbox);try{body()}catch(e){if(e!==stop)throw e}
assert(logs[2].expired&&logs[2].active_operations===1);assert(logs[3].active_operations===0&&logs[3].expired);
console.log('V096_BUDGET_GATE_PASS: admission closed, in-flight drain allowed');
