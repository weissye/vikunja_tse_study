"""Contract-mapped merge/removal experiment. Generic arithmetic is an explicit hypothesis."""
import hashlib,json,re
from pathlib import Path
from .context_model import build_model,render,j,pointer
from .context_contribution import infer_contribution,unique

def infer_removal(c,entities,variant):
 p=infer_contribution(c,entities);p['mode']='removal'
 link=unique([x for x in p['keys'] if x['source'].lower()==variant],'selected ingredient link')
 recipe=unique([e for e in entities if e['name']==p['recipe_type']],'source')
 nested=recipe['nested'][0];dependency=unique([l for l in nested['links'] if l['field']==link['source']],'merge dependency')
 target=unique([e for e in entities if e['name']==dependency['target']],'merge resource')
 candidates=[]
 for path,ops in c.raw['paths'].items():
  for method,op in ops.items():
   if method not in ('put','post') or path!=target['path']+'/merge':continue
   props=c.body(op).get('properties',{});fr=[f for f in props if f.lower().startswith('from')];to=[f for f in props if f.lower().startswith('to')]
   if len(fr)==len(to)==1:candidates.append((path,method,op,fr[0],to[0]))
 path,method,op,fr,to=unique(candidates,'merge operation')
 removals=[]
 for route,ops in c.raw['paths'].items():
  operation=ops.get('post',{})
  if route.startswith(p['list_detail']+'/') and re.search(r'\bremove\b',operation.get('summary',''),re.I):
   props=c.body(operation).get('properties',{});dec=[f for f in props if 'decrement' in f.lower()]
   if len(dec)==1:removals.append((route,operation,dec[0]))
 removal,operation,dec=unique(removals,'decrement action')
 p.update(variant=variant,merge_type=target['name'],merge_source_field=link['source'],merge_item_key=link['item'],merge_path=path,merge_method=method.upper(),merge_codes=c.response(op)[0],merge_from=fr,merge_to=to,remove_path=removal,remove_codes=c.response(operation)[0],decrement=dec,manual_quantity=7,fixture_quantities=[2,2] if variant=='food' else [3,3],dependency_links=nested['links'],item_create_path=unique([e for e in entities if e['name']==p['item_type']],'item')['path'],item_create_codes=c.response(unique([e for e in entities if e['name']==p['item_type']],'item')['create'])[0],required_ready={e['name']:2 if e['name']==target['name'] else 1 for e in entities if e['name']!=p['item_type']})
 p['sources'] += [pointer(path,method),pointer(removal,'post')]
 p['hypothesis']='Canonical merge preserves aggregate quantities; removing one recipe subtracts its current canonical ingredient aggregate and leaves the manual baseline. Not implied by OpenAPI alone.'
 return p

DAL=r'''
var removalPlan=PLAN;
ctx.registerQuery("F02.Flags",function(e){return e.type==="f02flag";});
ctx.registerEffect("F02Ready",function(d){ctx.insertEntity(ctx.Entity("f02_"+d.flag,"f02flag",{flag:d.flag}));});
function waitF02Flag(flag){while(!ctx.runQuery("F02.Flags").some(function(e){return e.flag===flag;}))waitFor(bp.EventSet("F02 ready "+flag,function(e){return e.name==="F02Ready"&&e.data.flag===flag;}));}
function waitF02Parents(){
 while(true){var missing=Object.keys(removalPlan.required_ready).filter(function(t){return readyResources(t).filter(function(e){return e.verifiedRevision>=2;}).length<removalPlan.required_ready[t];});if(!missing.length)return;waitFor(bp.EventSet("Any F02 dependency verified",function(e){return e.name==="ModelVerified";}));}
}
function f02Parents(){var p={};Object.keys(removalPlan.required_ready).forEach(function(t){p[t]=readyResources(t).sort(function(a,b){return a.id<b.id?-1:1;});});return p;}
function f02Model(stage){
 var parents=f02Parents(),rows=[],manual={},recipe=getModelEntity(removalPlan.recipe_type+"_1"),list=getModelEntity(removalPlan.list_type+"_1");
 removalPlan.keys.forEach(function(k){var l=removalPlan.dependency_links.filter(function(x){return x.field===k.source;})[0];manual[k.item]="@{ID_"+parents[l.target][0].id+"}";});
 removalPlan.fixture_quantities.forEach(function(q,i){var row={quantity:q,keys:{}};removalPlan.keys.forEach(function(k){var l=removalPlan.dependency_links.filter(function(x){return x.field===k.source;})[0];var index=k.source===removalPlan.merge_source_field&&i===1&&(stage===1||removalPlan.skip_merge)?1:0;row.keys[k.item]="@{ID_"+parents[l.target][index].id+"}";});rows.push(row);});
 var expectedRows=[{quantity:removalPlan.manual_quantity,keys:manual}];if(stage<3)expectedRows=expectedRows.concat(rows);
 var total=0;expectedRows.forEach(function(r){total+=r.quantity;});
 return {stage:stage,rows:expectedRows,recipeRows:rows,total:total,association:stage===3?0:1,recipeId:"@{ID_"+recipe.id+"}",listId:"@{ID_"+list.id+"}",recipeName:recipe.expected.name};
}
function applyF02Effect(d){var old=ctx.runQuery("F02.Stages");old.forEach(function(e){ctx.removeEntity(e.id);});ctx.insertEntity(ctx.Entity("f02_stage","f02stage",{stage:d.expected.stage,expected:cloneExpected(d.expected),verified:false}));}
ctx.registerQuery("F02.Stages",function(e){return e.type==="f02stage";});
ctx.registerQuery("F02.Pending",function(e){return e.type==="f02stage"&&!e.verified;});
ctx.registerEffect("F02Verified",function(d){var e=ctx.runQuery("F02.Stages")[0];ctx.removeEntity(e.id);ctx.insertEntity(ctx.Entity(e.id,"f02stage",{stage:e.stage,expected:cloneExpected(e.expected),verified:true}));});
function waitF02Stage(stage){while(!ctx.runQuery("F02.Stages").some(function(e){return e.stage===stage&&e.verified;}))waitFor(bp.EventSet("F02 stage verified "+stage,function(e){return e.name==="F02Verified"&&e.data.stage===stage;}));}
'''
INTERFACES=r'''
var removalWirePlan=PLAN;
function f02Callback(expected,kind,finish){return new Function("response","return ("+validateRemovalResponse.toString()+")(response,"+JSON.stringify(removalWirePlan)+","+JSON.stringify(expected)+","+JSON.stringify(kind)+","+JSON.stringify(!!finish)+");");}
function validateRemovalResponse(response,plan,expected,kind,finish){
 function resolve(v){if(typeof v==='string'&&/^@\{[A-Za-z0-9_]+\}$/.test(v))return pvg.rtv.get(v.slice(2,-1));if(Array.isArray(v))return v.map(resolve);if(v&&typeof v==='object'){var r={};Object.keys(v).forEach(function(k){r[k]=resolve(v[k]);});return r;}return v;}
 expected=resolve(expected);var body=JSON.parse(response.body||'{}');
 if(kind==='operation'){pvg.rtv.set('F02_REVIEW',JSON.stringify({stage:expected.stage,issues:[],receipts:[]}));}
 var review=JSON.parse(String(pvg.rtv.get('F02_REVIEW')));var receipt={kind:kind,expected:expected,response:body,code:response.code};review.receipts.push(receipt);bp.log.info('F02_RECEIPT '+JSON.stringify(receipt));
 function problem(m){review.issues.push(kind+': '+m);}
 function key(keys){return plan.keys.map(function(k){return String(keys[k.item]);}).join('|');}
 function aggregate(rows,recipe){var result={};rows.forEach(function(row){var keys={};plan.keys.forEach(function(k){keys[k.item]=recipe?(row[k.source]||{}).id:row[k.item];});var k=key(keys);result[k]=(result[k]||0)+row[plan.quantity_field];});return result;}
 function wanted(rows){var result={};rows.forEach(function(row){var k=key(row.keys);result[k]=(result[k]||0)+row.quantity;});return result;}
 function equalMap(a,b,label){var keys=Object.keys(a).concat(Object.keys(b)).filter(function(k,i,x){return x.indexOf(k)===i;});keys.forEach(function(k){if(Math.abs((a[k]||0)-(b[k]||0))>1e-8)problem(label+' '+k+' expected '+(b[k]||0)+' observed '+(a[k]||0));});}
 if(kind==='list'){
  if(body.id!==expected.listId)problem('list identity changed');var items=body[plan.item_array]||[];equalMap(aggregate(items,false),wanted(expected.rows),'aggregate');
  var refs=(body[plan.list_refs]||[]).filter(function(r){return r[plan.recipe_key]===expected.recipeId;});var association=0;refs.forEach(function(r){association+=r[plan.reference_quantity];});if(association!==expected.association)problem('recipe association expected '+expected.association+' observed '+association);
  items.forEach(function(item){if(item[plan.owner_key]!==expected.listId)problem('item ownership changed');});
  if(!finish&&expected.stage===1){for(var i=0;i<2;i++)pvg.rtv.set('F02_ITEM_'+i,items[i]?items[i].id:'00000000-0000-4000-8000-000000000000');}
 }else if(kind==='recipe'){
  if(body.id!==expected.recipeId||body.name!==expected.recipeName)problem('recipe identity/name changed');equalMap(aggregate(body[plan.ingredients_field]||[],true),wanted(expected.recipeRows),'recipe aggregate');
 }else if(kind==='item'&&response.code===200){if(body[plan.owner_key]!==expected.listId)problem('item ownership changed');}
 if(finish){review.status=review.issues.length?'F02_SEMANTIC_CANDIDATE':'F02_STAGE_PASS';bp.log.info('F02_EVIDENCE '+JSON.stringify(review));}
 pvg.rtv.set('F02_REVIEW',JSON.stringify(review));if(finish&&review.issues.length)pvg.fail('F02 discrepancy; all independent readbacks completed.');
}
function createRemovalSource(recipe,parents){
 var rows=[];removalWirePlan.fixture_quantities.forEach(function(q,i){var row={};row[removalWirePlan.quantity_field]=q;removalWirePlan.dependency_links.forEach(function(l){var index=l.field===removalWirePlan.merge_source_field&&i===1?1:0;var parent=parents[l.target][index],object={};l.required.forEach(function(f){if(f!=='id')object[f]=parent.expected[f];});object.id='@{ID_'+parent.id+'}';row[l.field]=object;});rows.push(row);});
 var delta={};delta[removalWirePlan.ingredients_field]=rows;ZERO_FIELDS
 SOURCE_UPDATE(recipe,delta);
}
function createRemovalBaseline(list,parents){
 var fixture={};fixture[removalWirePlan.quantity_field]=removalWirePlan.manual_quantity;
 var bound={};bound[removalWirePlan.list_type]=list;removalWirePlan.dependency_links.forEach(function(l){fixture[l.field+'Id']='@{ID_'+parents[l.target][0].id+'}';});
 fixture[removalWirePlan.owner_key]='@{ID_'+list.id+'}';fixture[removalWirePlan.item_refs]=[];
 var logical=removalWirePlan.item_type+'_1',source="var payload=JSON.parse(response.body);var rows=(payload.createdItems||[]).concat(payload.updatedItems||[]);if(rows.length!==1)pvg.fail('Manual child identity ambiguous');pvg.rtv.set("+JSON.stringify('ID_'+logical)+",rows[0].id);pvg.rtv.set("+JSON.stringify('ROUTE_'+logical)+",rows[0].id);";
 requestRest('POST',removalWirePlan.item_create_path,fixture,removalWirePlan.item_create_codes,{action:'create',type:removalWirePlan.item_type,logicalId:logical,expected:fixture,affected:[logical,list.id]},callbackFromSource(source));
}
function addRemovalContribution(){var expected=f02Model(1),body={};body[removalWirePlan.recipe_key]=expected.recipeId;body[removalWirePlan.increment_field]=1;requestRest('POST',removalWirePlan.operation_path.replace('{'+removalWirePlan.list_parameter+'}',expected.listId),[body],removalWirePlan.codes,{action:'f02',expected:expected},f02Callback(expected,'operation',false));}
function mergeRemovalDependency(){var expected=f02Model(2),parents=f02Parents(),body={};body[removalWirePlan.merge_from]='@{ID_'+parents[removalWirePlan.merge_type][1].id+'}';body[removalWirePlan.merge_to]='@{ID_'+parents[removalWirePlan.merge_type][0].id+'}';requestRest(removalWirePlan.merge_method,removalWirePlan.merge_path,body,removalWirePlan.merge_codes,{action:'f02',expected:expected},f02Callback(expected,'operation',false));}
function removeRemovalContribution(){var expected=f02Model(3),body={};body[removalWirePlan.decrement]=1;var path=removalWirePlan.remove_path.replace('{'+removalWirePlan.list_parameter+'}',expected.listId).replace('{recipe_id}',expected.recipeId);requestRest('POST',path,body,removalWirePlan.remove_codes,{action:'f02',expected:expected},f02Callback(expected,'operation',false));}
function readRemovalList(state,finish){requestRest('GET',removalWirePlan.list_detail.replace('{'+removalWirePlan.list_parameter+'}',state.expected.listId),undefined,[200],{action:'f02read'},f02Callback(state.expected,'list',finish));}
function readRemovalRecipe(state){requestRest('GET',removalWirePlan.recipe_detail.replace('{'+removalWirePlan.recipe_parameter+'}','@{ROUTE_'+removalWirePlan.recipe_type+'_1}'),undefined,[200],{action:'f02read'},f02Callback(state.expected,'recipe',false));}
function readRemovalItem(state,index){requestRest('GET',removalWirePlan.item_detail.replace('{'+removalWirePlan.item_parameter+'}','@{F02_ITEM_'+index+'}'),undefined,[200,404],{action:'f02read'},f02Callback(state.expected,'item',false));}
'''
STORIES=r'''
// Independent dependency construction: all ready requirements are checked together.
bthread('F02 source graph',function(){waitF02Parents();waitForResource(PLAN.recipe_type+'_1',2);createRemovalSource(getModelEntity(PLAN.recipe_type+'_1'),f02Parents());waitFor(matchesVerified(PLAN.recipe_type+'_1',3));request(bp.Event('F02Ready',{flag:'source'}));});
bthread('F02 manual child lifecycle',function(){waitF02Parents();waitForResource(PLAN.list_type+'_1',2);createRemovalBaseline(getModelEntity(PLAN.list_type+'_1'),f02Parents());waitFor(matchesVerified(PLAN.item_type+'_1',1));request(bp.Event('F02Ready',{flag:'manual'}));});
bthread('F02 full contribution',function(){waitF02Flag('source');waitF02Flag('manual');addRemovalContribution();waitF02Stage(1);});
bthread('F02 canonical dependency merge',function(){waitF02Stage(1);mergeRemovalDependency();waitF02Stage(2);});
bthread('F02 remove source contribution',function(){waitF02Stage(2);removeRemovalContribution();waitF02Stage(3);request(bp.Event('F02Completed'));});
ctx.bthread('F02 verify every transition','F02.Pending',function(state){readRemovalList(state,false);readRemovalRecipe(state);readRemovalItem(state,0);readRemovalItem(state,1);readRemovalList(state,true);request(bp.Event('F02Verified',{stage:state.stage}));});
'''
def render_removal(p):
 interface=INTERFACES.replace('PLAN',j(p)).replace('SOURCE_UPDATE','update'+p['recipe_type']).replace('ITEM_CREATE','create'+p['item_type']).replace('ZERO_FIELDS',p['zero_fields_js'])
 stories=STORIES
 if p.get('skip_merge'):
  stories='\n'.join(line for line in stories.splitlines() if "bthread('F02 canonical dependency merge'" not in line)
  stories=stories.replace("waitF02Stage(2);removeRemovalContribution()","waitF02Stage(1);removeRemovalContribution()")
 return interface,DAL.replace('PLAN',j(p)),stories.replace('PLAN',j(p))

def generate_removal(openapi,output,base_url,variant,seed,no_merge=False):
 rawbytes=Path(openapi).read_bytes();raw=json.loads(rawbytes);paths=['/api/foods','/api/units','/api/recipes','/api/households/shopping/lists','/api/households/shopping/items'];c,entities=build_model(raw,paths,1,seed);p=infer_removal(c,entities,variant);p['skip_merge']=bool(no_merge)
 recipe=unique([e for e in entities if e['name']==p['recipe_type']],'source');zero=[]
 for f,prop in recipe['update_schema']['properties'].items():
  s=c.resolve(prop);nullable=prop.get('nullable',False) or any(x.get('type')=='null' for x in prop.get('anyOf',[]))
  if s.get('type') in ('number','integer') and s.get('default')==0 and not nullable:
   s=dict(s);s.pop('default',None);zero.append('delta['+j(f)+']='+j(c.value(s,str(seed)+'-'+f))+';')
 p['zero_fields_js']=''.join(zero)
 interface,dal,stories,report=render(c,entities,'mealie',base_url,1,seed,p,p['required_ready'])
 out=Path(output)
 if out.exists() and any(out.iterdir()):raise ValueError('Use a new empty output directory')
 out.mkdir(parents=True,exist_ok=True)
 for name,value in [('interfaces.mealie.js',interface),('dal.js',dal),('stories.mealie.js',stories)]: (out/name).write_text(value,encoding='utf-8',newline='\n')
 config=out.parent.parent/'config';config.mkdir();(config/'provengo.yml').write_text('version: 2\nscenario.max-length: 350\n')
 (out/'generation_report.json').write_text(json.dumps({'status':'GENERATED_NOT_EXECUTED','source_sha256':hashlib.sha256(rawbytes).hexdigest(),'seed':seed,'variant':variant,'plan':p,'entities':report},indent=2))
 print('F02_GENERATED_NOT_EXECUTED: '+str(out))
