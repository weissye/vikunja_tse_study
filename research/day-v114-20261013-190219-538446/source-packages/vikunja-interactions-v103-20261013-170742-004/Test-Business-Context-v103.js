const fs=require('fs'),vm=require('vm'),assert=require('assert');
let rows=[{id:'r',resourceType:'Type',expected:{title:'baseline'},revision:2,verifiedRevision:2}],pending=false;
const c={ctx:{registerQuery:()=>{},registerEffect:()=>{},runQuery:name=>name==='Resource.All'?rows:pending&&name==='WriteLock.All'?[{}]:[]},cloneExpected:v=>JSON.parse(JSON.stringify(v))};
vm.runInNewContext(fs.readFileSync(process.argv[2],'utf8'),c);
const saved=c.interactionBusinessState();assert(saved===c.interactionBusinessState());rows[0].expected.title='unverified observed';assert(saved!==c.interactionBusinessState());pending=true;assert.throws(()=>c.interactionBusinessState(),/drained/);
console.log('V103_BUSINESS_CONTEXT_GUARD_PASS: drift cannot be adopted silently');
