"""Deterministic stratified sampling of supported runtime case instances."""
import random
from collections import defaultdict

def select_cases(entities,plans,ir,c,cfg):
 from native_sessions import fields_for
 candidates=[]
 for e in entities:
  fields,_=fields_for(e,c)
  rules=[r for r in ir['negative_catalog']['cases'] if r['resource']==e['name'] and r['field'] in fields]
  for binding in plans[e['name']]:
   for sid in ('A','B'):
    for index,r in enumerate(rules):
     candidates.append({'case_id':'NEG_'+sid+'_'+binding['id']+'_'+str(index),'rule_id':r['id'],'resource_type':e['name'],'logical_id':binding['id'],'session':sid,'field':r['field'],'kind':r.get('kind',r.get('mutation',r['id'].split('/')[-1]))})
 sample=cfg.get('sampling')
 if not sample:return {'candidate_count':len(candidates),'selected':candidates,'omitted':[],'mode':'all_supported'}
 rng=random.Random(sample['seed']);seen=set(sample['completed_case_ids']);groups=defaultdict(list)
 for item in candidates:groups[item['resource_type']].append(item)
 keys=sorted(groups);rng.shuffle(keys)
 for items in groups.values():
  rng.shuffle(items);items.sort(key=lambda x:x['case_id'] in seen)
 chosen=[]
 while len(chosen)<min(sample['negative_limit'],len(candidates)):
  active=False
  for key in keys:
   if groups[key] and len(chosen)<sample['negative_limit']:
    # Prefer unseen cases, then rule/field kinds and sessions absent from selection.
    items=groups[key]
    items.sort(key=lambda x:(x['case_id'] in seen,any(v['rule_id']==x['rule_id'] for v in chosen),any(v['resource_type']==key and v['session']==x['session'] for v in chosen)))
    chosen.append(items.pop(0));active=True
  if not active:break
 ids={x['case_id'] for x in chosen}
 return {'mode':'stratified_resource_then_rule_session','seed':sample['seed'],'candidate_count':len(candidates),'selected':chosen,'omitted':[dict(x,reason='outside_this_run_sample') for x in candidates if x['case_id'] not in ids],'unseen_preference_input_count':len(seen),'scope':'supported writable observable fields only; entities without supported negative rules have no candidates'}
