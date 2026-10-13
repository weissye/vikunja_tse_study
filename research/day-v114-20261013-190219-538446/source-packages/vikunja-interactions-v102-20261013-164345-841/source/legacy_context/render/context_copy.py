"""Schema-derived embedded graph copy experiment; integrity is an explicit hypothesis."""
import hashlib,json,uuid
from pathlib import Path
from .context_model import build_model,render,j,pointer
from .context_contribution import unique

def infer_copy(c,entities):
 recipe=unique([e for e in entities if e['nested']],'embedded graph resource')
 arrays=[]
 for f,s in recipe['update_schema']['properties'].items():
  s=c.resolve(s)
  if s.get('type')=='array':arrays.append((f,c.resolve(s['items'])))
 ingredients=unique([(f,s) for f,s in arrays if 'referenceId' in s.get('properties',{}) and f==recipe['nested'][0]['field']],'embedded identity array')
 steps=[]
 for f,step in arrays:
  for refs,rs in step.get('properties',{}).items():
   rs=c.resolve(rs)
   if rs.get('type')=='array':
    child=c.resolve(rs['items'])
    if 'referenceId' in child.get('properties',{}) and 'ingredient' in (refs+' '+child.get('description','')).lower():steps.append((f,step,refs))
 step_field,step_schema,refs=unique(steps,'embedded reference array')
 text=unique([f for f in step_schema.get('required',[]) if c.resolve(step_schema['properties'][f]).get('type')=='string'],'required step text')
 candidates=[(path,ops['post']) for path,ops in c.raw['paths'].items() if 'post' in ops and path.startswith(recipe['detail']+'/') and 'duplicat' in ops['post'].get('summary','').lower()]
 path,op=unique(candidates,'copy operation')
 if 'name' not in c.body(op).get('properties',{}):raise ValueError('Copy name input not supported')
 return dict(mode='copy',recipe_type=recipe['name'],item_type='',copy_path=path,copy_codes=c.response(op)[0],detail=recipe['detail'],parameter=recipe['parameter'],ingredients=ingredients[0],steps=step_field,references=refs,reference_id='referenceId',text=text,links=recipe['nested'][0]['links'],required_ready={e['name']:1 for e in entities},sources=[pointer(path,'post'),pointer(recipe['detail'],recipe['update_method'])+'/requestBody','#/components/schemas/RecipeIngredient-Input/properties/referenceId','#/components/schemas/RecipeStep/properties/ingredientReferences','#/components/schemas/IngredientReferences/properties/referenceId'],hypothesis='Copy preserves internal reference closure, corresponding ingredient links and source state. UUID schemas and copy description do not fully specify identity remapping. This is an opt-in generic graph-copy integrity hypothesis.')

DAL=r'''
var copyPlan=PLAN;
ctx.registerQuery('F03.Flags',function(e){return e.type==='f03flag';});
ctx.registerEffect('F03Ready',function(d){ctx.insertEntity(ctx.Entity('f03_'+d.flag,'f03flag',{flag:d.flag}));});
function waitCopyFlag(flag){while(!ctx.runQuery('F03.Flags').some(function(e){return e.flag===flag;}))waitFor(bp.EventSet('F03 ready '+flag,function(e){return e.name==='F03Ready'&&e.data.flag===flag;}));}
function waitCopyParents(){while(true){var missing=Object.keys(copyPlan.required_ready).filter(function(t){return !readyResources(t).some(function(e){return e.verifiedRevision>=2;});});if(!missing.length)return;waitFor(bp.EventSet('F03 dependency verified',function(e){return e.name==='ModelVerified';}));}}
ctx.registerQuery('F03.Pending',function(e){return e.type==='f03verification';});
ctx.registerEffect('F03CopyRequested',function(d){ctx.insertEntity(ctx.Entity('f03_pending','f03verification',{expected:d.expected}));});
ctx.registerEffect('F03Verified',function(){ctx.removeEntity('f03_pending');});
'''
INTERFACES=r'''
var copyWirePlan=PLAN;
function copyCallback(kind,expected,finish){return new Function('response','return ('+validateCopyResponse.toString()+')(response,'+JSON.stringify(copyWirePlan)+','+JSON.stringify(kind)+','+JSON.stringify(expected)+','+JSON.stringify(!!finish)+');');}
function validateCopyResponse(response,plan,kind,expected,finish){
 function resolve(v){if(typeof v==='string'&&/^@\{[A-Za-z0-9_]+\}$/.test(v))return pvg.rtv.get(v.slice(2,-1));if(Array.isArray(v))return v.map(resolve);if(v&&typeof v==='object'){var r={};Object.keys(v).forEach(function(k){r[k]=resolve(v[k]);});return r;}return v;}
 expected=resolve(expected);var body=JSON.parse(response.body||'{}');
 var review=kind==='source-before'?{issues:[],receipts:[]}:JSON.parse(String(pvg.rtv.get('F03_REVIEW')));
 function problem(s){review.issues.push(kind+': '+s);}
 if(kind==='copy-response'){if(!body.id||!body.slug)problem('copied identity/route absent');if(body.id===expected.sourceId)problem('copy retained source identity');pvg.rtv.set('F03_COPY_ID',body.id);pvg.rtv.set('F03_COPY_ROUTE',body.slug);}
 if(kind.indexOf('copy')===0){if(body.id!==pvg.rtv.get('F03_COPY_ID'))problem('copy identity changed');if(body.name!==expected.copyName)problem('copy name mismatch');}
 else {if(body.id!==expected.sourceId)problem('source identity changed');if(body.name!==expected.source.name)problem('source name changed');}
 var rows=body[plan.ingredients]||[],steps=body[plan.steps]||[],wanted=expected.source[plan.ingredients];
 if(rows.length!==wanted.length)problem('ingredient count changed');
 var ids=rows.map(function(r){return r[plan.reference_id];});if(ids.some(function(id,i){return !id||ids.indexOf(id)!==i;}))problem('ingredient identities missing/duplicated');
 wanted.forEach(function(w){var found=rows.filter(function(r){return r.note===w.note;});if(found.length!==1){problem('ingredient marker missing/ambiguous');return;}var a=found[0];if(a.quantity!==w.quantity)problem('ingredient quantity changed');plan.links.forEach(function(l){if(!a[l.field]||a[l.field].id!==w[l.field].id)problem('external dependency changed '+l.field);});});
 if(steps.length!==expected.source[plan.steps].length)problem('step count changed');
 expected.source[plan.steps].forEach(function(w){var found=steps.filter(function(s){return s[plan.text]===w[plan.text];});if(found.length!==1){problem('step text missing/ambiguous');return;}var actual=found[0][plan.references]||[],wr=w[plan.references];if(actual.length!==wr.length)problem('reference count changed');var mapped=wr.map(function(ref){var sourceIngredient=wanted.filter(function(r){return r[plan.reference_id]===ref[plan.reference_id];})[0];var target=sourceIngredient&&rows.filter(function(r){return r.note===sourceIngredient.note;})[0];return target&&target[plan.reference_id];}).sort();var observed=actual.map(function(ref){return ref[plan.reference_id];}).sort();if(JSON.stringify(mapped)!==JSON.stringify(observed))problem('reference multiplicity does not match corresponding ingredients in this recipe');actual.forEach(function(ref){if(ids.indexOf(ref[plan.reference_id])<0)problem('reference outside this recipe ingredient set');});});
 if(kind.indexOf('source')===0){wanted.forEach(function(w){var a=rows.filter(function(r){return r.note===w.note;})[0];if(a&&a[plan.reference_id]!==w[plan.reference_id])problem('source ingredient identity changed');});}
 var receipt={kind:kind,code:response.code,response:body,expected:expected};review.receipts.push(receipt);bp.log.info('F03_RECEIPT '+JSON.stringify(receipt));pvg.rtv.set('F03_REVIEW',JSON.stringify(review));
 if(finish){review.status=review.issues.length?'F03_REFERENCE_CANDIDATE':'F03_FUNCTIONAL_PASS';bp.log.info('F03_EVIDENCE '+JSON.stringify(review));if(review.issues.length)pvg.fail('F03 graph-copy discrepancy; independent source/copy readbacks completed.');}
}
function buildCopyIngredients(recipe){
 var rows=FIXTURES;rows.forEach(function(row){copyWirePlan.links.forEach(function(l){var parent=readyResources(l.target).filter(function(e){return e.verifiedRevision>=2;})[0],v={};l.required.forEach(function(f){if(f!=='id')v[f]=parent.expected[f];});v.id='@{ID_'+parent.id+'}';row[l.field]=v;});});var delta={};delta[copyWirePlan.ingredients]=rows;updateRECIPE(recipe,delta);
}
function buildCopySteps(recipe){var delta={};delta[copyWirePlan.steps]=STEPS;updateRECIPE(recipe,delta);}
function copyExpectation(){var resource=getModelEntity(copyWirePlan.recipe_type+'_1');return {sourceId:'@{ID_'+resource.id+'}',source:cloneExpected(resource.expected),copyName:'sbt-SEED-copy'};}
function readCopySource(expected,kind){requestRest('GET',copyWirePlan.detail.replace('{'+copyWirePlan.parameter+'}','@{ROUTE_'+copyWirePlan.recipe_type+'_1}'),undefined,[200],{action:'f03read'},copyCallback(kind,expected,false));}
function duplicateCopySource(expected){requestRest('POST',copyWirePlan.copy_path.replace('{'+copyWirePlan.parameter+'}','@{ROUTE_'+copyWirePlan.recipe_type+'_1}'),{name:expected.copyName},copyWirePlan.copy_codes,{action:'f03copy'},copyCallback('copy-response',expected,false));}
function readCopyTarget(expected,finish){requestRest('GET',copyWirePlan.detail.replace('{'+copyWirePlan.parameter+'}','@{F03_COPY_ROUTE}'),undefined,[200],{action:'f03read'},copyCallback('copy-get',expected,finish));}
'''
STORIES=r'''
// Embedded objects have separate planning bthreads; persistence uses the containing API.
bthread('F03 ingredient instance 1',function(){waitCopyParents();request(bp.Event('F03Ready',{flag:'ingredient1'}));});
bthread('F03 ingredient instance 2',function(){waitCopyParents();request(bp.Event('F03Ready',{flag:'ingredient2'}));});
bthread('F03 persist ingredient graph',function(){waitCopyFlag('ingredient1');waitCopyFlag('ingredient2');buildCopyIngredients(getModelEntity(PLAN.recipe_type+'_1'));waitFor(matchesVerified(PLAN.recipe_type+'_1',3));request(bp.Event('F03Ready',{flag:'ingredients'}));});
bthread('F03 instruction links',function(){waitCopyFlag('ingredients');buildCopySteps(getModelEntity(PLAN.recipe_type+'_1'));waitFor(matchesVerified(PLAN.recipe_type+'_1',4));request(bp.Event('F03Ready',{flag:'graph'}));});
bthread('F03 duplicate graph',function(){waitCopyFlag('graph');var expected=copyExpectation();readCopySource(expected,'source-before');duplicateCopySource(expected);request(bp.Event('F03CopyRequested',{expected:expected}));});
ctx.bthread('F03 verify copied graph','F03.Pending',function(state){readCopyTarget(state.expected,false);readCopySource(state.expected,'source-after');readCopyTarget(state.expected,true);request(bp.Event('F03Verified'));request(bp.Event('F03Completed'));});
'''
def render_copy(p):
 return (INTERFACES.replace('PLAN',j(p)).replace('FIXTURES',j(p['fixtures'])).replace('STEPS',j(p['step_fixtures'])).replace('RECIPE',p['recipe_type']).replace('SEED',str(p['seed'])),DAL.replace('PLAN',j(p)),STORIES.replace('PLAN',j(p)))

def generate_copy(openapi,output,base_url,seed):
 rawbytes=Path(openapi).read_bytes();c,entities=build_model(json.loads(rawbytes),['/api/foods','/api/units','/api/recipes'],1,seed);p=infer_copy(c,entities);p['seed']=seed
 p['fixtures']=[{'referenceId':str(uuid.UUID(bytes=hashlib.sha256((str(seed)+'-ingredient-'+str(i)).encode()).digest()[:16],version=4)),'note':'sbt-'+str(seed)+'-ingredient-'+str(i),'quantity':2*(i+1)} for i in range(2)]
 p['step_fixtures']=[{p['text']:'sbt-'+str(seed)+'-step-'+str(i),p['references']:[{p['reference_id']:p['fixtures'][k][p['reference_id']]} for k in ([0,1] if i==0 else [1])]} for i in range(2)]
 iface,dal,stories,report=render(c,entities,'mealie',base_url,1,seed,p,p['required_ready']);out=Path(output)
 if out.exists() and any(out.iterdir()):raise ValueError('Use a new empty output directory')
 out.mkdir(parents=True,exist_ok=True)
 for name,value in [('interfaces.mealie.js',iface),('dal.js',dal),('stories.mealie.js',stories)]: (out/name).write_text(value,encoding='utf-8',newline='\n')
 config=out.parent.parent/'config';config.mkdir(exist_ok=True);(config/'provengo.yml').write_text('version: 2\nscenario.max-length: 350\n')
 (out/'generation_report.json').write_text(json.dumps({'status':'GENERATED_NOT_EXECUTED','source_sha256':hashlib.sha256(rawbytes).hexdigest(),'seed':seed,'plan':p,'entities':report},indent=2));print('F03_GENERATED_NOT_EXECUTED: '+str(out))
