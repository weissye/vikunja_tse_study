// Execute the actual generated callback source, not an imitation of its oracle.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const text=fs.readFileSync(process.argv[2],'utf8');
const begin=text.indexOf('function verifyNegativeModelsLabel(pending){');
const fn=text.slice(begin,text.indexOf('\nfunction awaitSession',begin));let callback;
const context={requestRest:(...args)=>{callback=args[5]},callbackFromSource:s=>s};
vm.createContext(context);vm.runInContext(fn,context);
const pending={logicalId:'ModelsLabel_1',caseId:'case',expected:{title:'valid'},revision:1,caseDef:{id:'ModelsLabel/title/MIN_LENGTH',field:'title',source_pointer:'/schema/title/minLength'}};
context.verifyNegativeModelsLabel(pending);
const fields=['created','created_by','description','hex_color','id','title','updated'];
const before={id:1,title:'valid'};const projection={};fields.forEach(f=>projection[f]={present:Object.hasOwn(before,f),value:before[f]});
function check(safe,available=true){let logs=[],failed=false;
 const values={case_BEFORE:JSON.stringify(projection),case_RECEIPT:JSON.stringify({status:200,rejected:false,status_documented:true}),case_BODY:'{"title":""}'};
 const recovery={case_id:'case',observation_available:available,observed_after:{id:1,title:''},observed_status:available?200:401,verified_after:before,safe_to_continue:safe,snapshot_restored:true,api_prefix_equal:true};
 new Function('response','pvg','bp',callback)({code:200,body:JSON.stringify(recovery)},{rtv:{get:k=>values[k]},fail:()=>{failed=true}},{log:{info:s=>logs.push(s)}});
 const finding=JSON.parse(logs.find(s=>s.startsWith('NEGATIVE_CHECK ')).slice(15));
 assert.strictEqual(finding.pass,available?false:null);assert.strictEqual(finding.checked_field_after,available?finding.checked_field_after:null);if(available)assert.strictEqual(finding.checked_field_after.value,'');
 assert.strictEqual(failed,!safe);
}
check(true);check(false);check(true,false);console.log('V082_GENERATED_CALLBACK_TEST_PASS');
