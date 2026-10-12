const vm=require('vm'),fs=require('fs'),assert=require('assert');
const text=fs.readFileSync(process.argv[2],'utf8');
for(const [type,parent,param,collection,detail] of [
 ['ModelsProjectView','ModelsProject','project','/projects/101/views','/projects/101/views/501'],
 ['ModelsTaskComment','ModelsTask','taskID','/tasks/101/comments','/tasks/101/comments/501']]){
 let args;const variables={['ROUTE_'+parent+'_1']:101};
 const c={requestRest:(...a)=>{args=a},callbackFromSource:s=>s,validationSource:()=>''};vm.createContext(c);
 const begin=text.indexOf('function create'+type+'('),end=text.indexOf('\n// ',begin);
 vm.runInContext(text.slice(begin,end),c);
 const vb=text.indexOf('function verify'+type+'('),ve=text.indexOf('\n}',vb)+2;vm.runInContext(text.slice(vb,ve),c);
 c['create'+type](type+'_1',{title:'valid',comment:'valid'},{[parent]:{id:parent+'_1'}});
 const resolve=s=>s.replace(/@\{([^}]+)\}/g,(_,k)=>variables[k]);assert.strictEqual(resolve(args[1]),collection);
 new Function('response','pvg',args[5])({body:'{"id":501}'},{rtv:{get:k=>variables[k],set:(k,v)=>variables[k]=v},fail:()=>{throw Error('Unexpected fail')}});
 c['verify'+type]({id:type+'_1',expected:{},revision:1});assert.strictEqual(resolve(args[1]),detail);
}
console.log('V082_NESTED_RUNTIME_LOCATOR_CALLBACKS_PASS');
