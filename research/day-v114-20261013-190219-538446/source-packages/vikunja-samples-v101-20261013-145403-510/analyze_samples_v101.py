"""Evidence-only comparison of frozen v100 review archives."""
import hashlib,json,re,zipfile

def digest(value):
 return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def workflow_value(namespace,sid,logical,field,schema,domain):
 h=2166136261
 for ch in namespace+'/'+sid+'/'+logical+'/'+field:
  h^=ord(ch);h=(h+(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24))&0xffffffff
 hx=format(h,'08x')
 if domain=='hex_rgb':value=hx[:6]
 elif domain=='unique_short_identifier':value=('P'+hx).upper()
 else:value='sbt-'+sid+'-'+logical+'-'+field
 while len(value)<schema.get('minLength',0):value+='x'
 if schema.get('maxLength'):value=value[:schema['maxLength']]
 return value

def inspect_review(path):
 with zipfile.ZipFile(path) as z:
  manifest=json.loads(z.read('manifest_v100.json'))
  for name,h in manifest.items():
   if hashlib.sha256(z.read(name)).hexdigest()!=h:raise ValueError('Review hash mismatch: '+name)
  result=json.loads(z.read('result_v100.json'))
  generation=json.loads(z.read('generated/project/GENERATION_v071.json'))
  ir=json.loads(z.read('generated/contract-ir.json'));cfg=json.loads(z.read('generated/research-config.json'))
  rows=[json.loads(line) for line in z.read('gateway-journal.jsonl').decode().splitlines()] if 'gateway-journal.jsonl' in z.namelist() else []
  ledger=json.loads(z.read('recovery-ledger.json')) if 'recovery-ledger.json' in z.namelist() else []
  log=z.read('native.log').decode() if 'native.log' in z.namelist() else ''
  # Never infer successful actuation from markers after native fail mode.
  valid=[]
  for line in log.splitlines():
   if re.search(r'\bERROR:|\bFAIL:|Test Result: (FAIL|ERROR)|Switching to test fail mode|\sERR\s',line):break
   valid.append(line)
  def markers(tag):
   return [json.loads(line.split(tag+' ',1)[1]) for line in valid if tag+' {' in line]
  checks=markers('NEGATIVE_CHECK');recoveries=markers('RECOVERY_CHECK')
  entities={e['name']:e for e in ir['entities']};types={item['id']:name for name,items in generation['instance_bindings'].items() for item in items}
  bindings={item['id']:item['bindings'] for items in generation['instance_bindings'].values() for item in items}
  fields={w['logical_id']:w['fields'] for w in generation['shared_session_workflows']}
  fixtures={r['logical_id']:json.loads(r['response']) for r in rows if r.get('action')=='create' and r.get('status') in (200,201)}
  def schema_value(schema):
   if '$ref' in schema:
    value=ir['document']
    for token in schema['$ref'].removeprefix('#/').split('/'):value=value[token.replace('~1','/').replace('~0','~')]
    return schema_value(value)
   return schema
  def abstract(prefix):
   state={}
   for logical,resource in sorted(prefix.items()):
    name=types[logical];e=entities[name];values={}
    for field in fields.get(logical,[]):
     actual=resource.get(field);domain=ir.get('value_domains',{}).get(name,{}).get(field,{}).get('kind','plain_string')
     schema=schema_value(e['update_schema']['properties'][field]);owner=None
     for sid in ('A','B'):
      if actual==workflow_value(cfg['fixtures']['namespace'],sid,logical,field,schema,domain):owner='session_'+sid;break
     if owner is None:
      owner='fixture' if actual==fixtures.get(logical,{}).get(field) else 'other:'+digest(actual)
     values[field]=owner
    state[logical]={'type':name,'bound_parents':bindings[logical],'field_provenance':values}
   return state
  signatures=[]
  for rec in ledger:
   case=rec['case_id'];abstract_state=abstract(rec['prefix_before'])
   attempt=next((x for x in rows if x.get('action')=='negative_attempt' and x.get('case_id')==case),None)
   preceding=rows[:attempt['index']] if attempt else []
   selected_count=0;native_events_before=None
   for line in valid:
    if 'Selected: [' in line:
     if 'action:"negative_attempt"' in line and 'caseId:"'+case+'"' in line:native_events_before=selected_count;break
     selected_count+=1
   signatures.append({'case_id':case,'abstract_state_sha256':digest(abstract_state),'abstract_state':abstract_state,'concrete_prefix_sha256':rec['prefix_before_sha256'],'successful_create_update_requests_before':sum(x.get('action') in ('create','update') and x.get('status') in (200,201) for x in preceding),'selected_event_log_entries_before_attempt':native_events_before,'raw_state_hash_is_not_semantic_novelty':True})
  selection=json.loads(z.read('generated/project/negative-selection.json'));selected=selection['selected']
  supported_rules={x['rule_id'] for x in selection['selected']+selection['omitted']}
  return {'review_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'verified_files':len(manifest),'status':result['status'],'run_seed':result.get('run_seed'),'sample_seed':cfg['sampling']['seed'],'elapsed_seconds':result.get('coverage',{}).get('elapsed_seconds'),'contract_sha256':ir['source']['sha256'],'scope_entities':sorted(entities),'planned':result.get('planned',{}),'created_resources':result.get('created_resources',0),'positive_updates':result.get('positive_updates',0),'completed_workflows':len(markers('SESSION_WORKFLOW_COMPLETE')),'selected_cases':selected,'supported_rule_count':len(supported_rules),'supported_runtime_case_count':selection['candidate_count'],'source_catalog_rule_count':len(ir['negative_catalog']['cases']),'checked_rules':sorted({x['rule_id'] for x in checks}),'negative_checked':len(checks),'verified_recoveries':sum(x.get('recovery_verified') is True for x in recoveries),'findings':[{'case_id':x['caseId'],'rule_id':x['rule_id'],'status':x['status']} for x in checks if x.get('pass') is False],'undocumented_statuses':[{'case_id':x['caseId'],'rule_id':x['rule_id'],'status':x['status']} for x in checks if x.get('status_documented') is False],'state_observations':signatures,'scope':'State abstraction: resource presence + logical parent bindings + supported-field fixture/A/B/other provenance. Omits timestamps/physical IDs and most field values; not full semantic state or exhaustive state-space coverage.'}

def compare(reviews):
 seen_rules=set();seen_states=set();reports=[]
 for review in reviews:
  rules=set(review['checked_rules']);states={x['abstract_state_sha256'] for x in review['state_observations']}
  reports.append(dict(review,new_checked_rules=sorted(rules-seen_rules),new_abstract_state_count=len(states-seen_states),distinct_abstract_states=len(states)))
  seen_rules.update(rules);seen_states.update(states)
 return {'version':'v101','runs_in_order':reports,'cumulative_checked_rule_count':len(seen_rules),'cumulative_abstract_state_count':len(seen_states),'full_contract_coverage':False,'novelty_basis':'Baseline first; rule IDs and explicitly abstracted logical states; fresh IDs/timestamps alone do not count as state novelty.'}
