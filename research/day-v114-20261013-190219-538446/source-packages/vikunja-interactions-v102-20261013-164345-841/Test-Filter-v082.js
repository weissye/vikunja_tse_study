// Execute the existing generic verifier, including request-derived nested projection.
const vm=require('vm'),fs=require('fs'),assert=require('assert');
const code=fs.readFileSync(process.argv[2],'utf8');
let args,failures=[];const values={ID_ModelsSavedFilter_1:901};
const c={RESTSession:function(url,name,opt){this.baseURL=url;this.defaultHeaders=opt.headers},bp:{EventSet:()=>({}),Event:()=>({}),log:{info:()=>{}}},pvg:{rtv:{get:k=>values[k],set:(k,v)=>values[k]=v},fail:s=>failures.push(s)}};
vm.createContext(c);vm.runInContext(code,c);c.requestRest=(...a)=>args=a;
c.verifyModelsSavedFilter({id:'ModelsSavedFilter_1',expected:{title:'valid',filters:{filter:'done = false'}},revision:1});
const callback=args[5];callback({body:JSON.stringify({id:901,title:'valid',filters:{filter:'done = false',sort_by:null,order_by:null,s:''}})});
assert.strictEqual(failures.length,0);
callback({body:JSON.stringify({id:901,title:'valid',filters:{filter:'wrong'}})});assert(failures.length>0);
console.log('V082_SAVED_FILTER_ACTUAL_VERIFIER_PASS: extra response fields allowed, changed query rejected');
