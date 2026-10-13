const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=process.argv[2],story=fs.readFileSync(root+'/project/spec/js/stories.vikunja.js','utf8'),ir=JSON.parse(fs.readFileSync(root+'/contract-ir.json','utf8'));
const begin=story.indexOf('function workflowValue('),end=story.indexOf('\n}',begin)+2,c={WORKFLOW_NAMESPACE:'test-namespace'};vm.createContext(c);vm.runInContext(story.slice(begin,end),c);
const colours=[];for(const entity of Object.keys(ir.value_domains))for(const [field,domain] of Object.entries(ir.value_domains[entity])){
 assert.strictEqual(domain.authority,'DESCRIPTION_INFERENCE');assert(domain.source_pointer.endsWith('/description'));
 if(domain.kind==='hex_rgb')for(const session of ['A','B'])for(let index=1;index<=10;index++){
  const value=c.workflowValue(session,entity+'_'+index,{field,domain:'hex_rgb'});assert(/^[0-9a-f]{6}$/.test(value));colours.push(value);
 }
 if(domain.kind==='unique_short_identifier'){
  const values=[];for(const session of ['A','B'])for(let index=1;index<=10;index++)values.push(c.workflowValue(session,entity+'_'+index,{field,domain:domain.kind}));
  assert.strictEqual(new Set(values).size,20);assert(values.every(v=>/^[A-Z0-9]{1,10}$/.test(v)));
 }
}
assert.strictEqual(colours.length,60);
console.log('V093_ACTUAL_VALUE_FORMATTER_PASS: 60 hex colours, 20 unique short identifiers, description provenance');
