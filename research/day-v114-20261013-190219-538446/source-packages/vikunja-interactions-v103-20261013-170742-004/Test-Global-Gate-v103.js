const fs=require('fs'),vm=require('vm'),assert=require('assert');let body,i=0;const stop={};
const E=(name,data={})=>({name,data});
const events=[E('OperationAcquire',{logicalId:'other',session:'A'}),E('ModelWriteBegin',{logicalId:'other',revision:2}),E('InteractionReserve',{groupId:'G'}),E('ModelVerified',{logicalId:'other',revision:2}),E('OperationRelease',{logicalId:'other',session:'A'}),E('InteractionAcquire',{groupId:'G'}),E('InteractionRelease',{groupId:'G'})];
const c={bthread:(n,f)=>body=f,bp:{all:{},EventSet:(n,f)=>f},sync:s=>{
 if(i===3){assert(s.block(E('InteractionAcquire',{groupId:'G'})));assert(s.block(E('OperationAcquire',{logicalId:'new'})));assert(!s.block(E('POST',{model:{action:'update',logicalId:'other'}})));}
 if(i===5)assert(!s.block(E('InteractionAcquire',{groupId:'G'})));
 if(i===6){assert(s.block(E('POST',{model:{action:'update',logicalId:'other'}})));assert(!s.block(E('POST',{model:{action:'interaction_write',groupId:'G'}})));assert(!s.block(E('POST',{model:{action:'authenticate'}})));}
 if(i===7){assert(!s.block(E('OperationAcquire',{logicalId:'new'})));throw stop}return events[i++];
}};
vm.runInNewContext(fs.readFileSync(process.argv[2],'utf8'),c);try{body()}catch(e){if(e!==stop)throw e}
console.log('V103_GLOBAL_ADMISSION_GATE_PASS: drain before snapshot / worker-only window / release resumes lifecycle');
