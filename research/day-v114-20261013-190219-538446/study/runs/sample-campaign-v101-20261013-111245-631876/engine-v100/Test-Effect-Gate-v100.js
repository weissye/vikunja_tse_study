const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(process.argv[2],'utf8');
const constStart=source.indexOf('var RESOURCE_EFFECT_FOOTPRINTS=');
const end=source.indexOf('var WORKFLOW_NAMESPACE=',constStart);
assert(constStart>=0&&end>constStart);const code=source.slice(constStart,end);
let body,i=0;const stop={};
const parent='ModelsProject_1',child='ModelsProjectView_1',other='ModelsTeam_1';
const E=(name,data={})=>({name,data});
const neg=E('NegativeAcquire',{logicalId:parent,caseId:'test-negative'});
const events=[
 E('OperationAcquire',{logicalId:child,session:'B'}),
 E('ModelWriteBegin',{logicalId:child,session:'B',revision:2}),
 E('ModelVerified',{logicalId:child,revision:2}),
 E('OperationRelease',{logicalId:child,session:'B'}),neg,
 E('NegativeRelease',{logicalId:parent,caseId:'test-negative'}),
 E('PUT',{model:{action:'create',logicalId:child}}),
 E('ModelVerified',{logicalId:child,revision:1})
];
const sandbox={bthread:(name,f)=>{body=f},bp:{all:{},EventSet:(name,f)=>f},sync:spec=>{
 const blocked=spec.block;
 if(i===0)assert(!blocked(neg));
 if(i===1||i===2||i===3)assert(blocked(neg),'parent negative must wait for complete child window');
 if(i===4)assert(!blocked(neg));
 if(i===5){
  assert(blocked(E('OperationAcquire',{logicalId:child,session:'A'})));
  assert(blocked(E('ModelWriteBegin',{logicalId:child,revision:3})));
  for(const action of ['create','update','delete'])assert(blocked(E('POST',{model:{action,logicalId:child,affected:[child]}})));
  assert(!blocked(E('POST',{model:{action:'update',logicalId:other}})),'unrelated team remains available');
  assert(!blocked(E('GET',{model:{action:'read',logicalId:child}})));
  assert(!blocked(E('POST',{model:{action:'checkpoint',logicalId:parent,caseId:'test-negative'}})));
  assert(!blocked(E('POST',{model:{action:'negative_attempt',logicalId:parent,caseId:'test-negative'}})));
 }
 if(i===6)assert(!blocked(E('OperationAcquire',{logicalId:child,session:'A'})));
 if(i===7)assert(blocked(neg),'creation must drain independent verification');
 if(i===8){assert(!blocked(neg));throw stop}
 return events[i++];
}};
vm.runInNewContext(code,sandbox);assert(sandbox.RESOURCE_EFFECT_FOOTPRINTS[child].includes(parent));
try{body()}catch(e){if(e!==stop)throw e}
console.log('V100_GENERATED_EFFECT_GATE_PASS: child drains, negative isolation, disjoint work available');
