#!/usr/bin/env python3
"""Trace-order state-machine oracle for Increment 6 competing writes."""
import argparse,json,re
from pathlib import Path

ITEM=re.compile(r'^/(projects|tasks|labels)/(\d+)$')
COMMENT=re.compile(r'^/tasks/(\d+)/comments/(\d+)$')
FIELD={'project':'title','task':'title','label':'title','comment':'comment'}
def load(path):
    events=[];dec=json.JSONDecoder();text=Path(path).read_text(encoding='utf-8-sig').replace('\x00','')
    for line_no,line in enumerate(text.splitlines(),1):
        rest=line.strip().lstrip('\ufeff')
        while rest:
            try:e,end=dec.raw_decode(rest)
            except json.JSONDecodeError as exc:raise ValueError(f'Malformed trace line {line_no}, column {exc.colno}') from exc
            if not isinstance(e,dict) or not {'method','model_path','status'}.issubset(e):raise ValueError(f'Invalid trace event at line {line_no}')
            e['_index']=len(events);events.append(e);rest=rest[end:].strip()
    return events
def body(e,key):return e.get(key) if isinstance(e.get(key),dict) else {}
def classify(path):
    m=ITEM.fullmatch(path)
    if m:return {'projects':'project','tasks':'task','labels':'label'}[m.group(1)]
    return 'comment' if COMMENT.fullmatch(path) else None
def conflict_value(e,prefix):
    resource=classify(str(e.get('model_path','')));field=FIELD.get(resource);value=body(e,'request').get(field)
    return (resource,field,value) if isinstance(value,str) and value.startswith(prefix) else (None,None,None)
def next_get(events,start,path):return next((e for e in events[start+1:] if e.get('model_path')==path and str(e.get('method','')).upper()=='GET'),None)
def evaluate(events,manifest):
    for i,e in enumerate(events):e.setdefault('_index',i)
    prefix=manifest.get('prefix','conflict6_');expected={x['oracle_id']:int(x['expected_witness_count']) for x in manifest.get('oracles',[])};ws=[]
    triggers=[]
    for e in events:
        resource,field,value=conflict_value(e,prefix)
        if resource and str(e.get('method','')).upper()=='PUT':triggers.append((e,resource,field,value))
    for trigger,resource,field,written in triggers:
        path=trigger['model_path'];observation=next_get(events,trigger['_index'],path)
        latest=None
        if observation:
            for candidate,r,f,value in triggers:
                if candidate['_index']>observation['_index']:break
                if candidate.get('model_path')==path and candidate.get('status')==200:latest=value
        observed=body(observation,'response').get(field) if observation else None
        if trigger.get('status')!=200:result,reason='VIOLATED','conflict-write-failed'
        elif observation is None:result,reason='INCONCLUSIVE','conflict-read-missing'
        elif observation.get('status')!=200:result,reason='VIOLATED','conflict-read-failed'
        elif latest is None:result,reason='INCONCLUSIVE','no-successful-write-before-read'
        elif observed!=latest:result,reason='VIOLATED','read-does-not-reflect-latest-successful-write'
        else:result,reason='PASS',None
        w={'oracle_id':f'{resource}-last-successful-write-visible','resource_path':path,'trigger_event':trigger['_index'],'observation_event':observation.get('_index') if observation else None,'expected':{field:latest},'observed':{'trigger_status':trigger.get('status'),'read_status':observation.get('status') if observation else None,field:observed},'result':result}
        if reason:w['reason']=reason
        ws.append(w)
    summary={}
    for oid,n in expected.items():
        group=[w for w in ws if w['oracle_id']==oid];counts={s:sum(w['result']==s for w in group) for s in ('PASS','VIOLATED','INCONCLUSIVE')};missing=max(0,n-len(group));status='NOT_EXERCISED' if not group else ('VIOLATED' if counts['VIOLATED'] else ('INCONCLUSIVE' if counts['INCONCLUSIVE'] or missing or len(group)!=n else 'PASS'));summary[oid]={'status':status,'witness_count':len(group),'expected_witness_count':n,'missing_witness_count':missing,'counts':counts}
    run='SEMANTIC_ANOMALY' if any(x['status']=='VIOLATED' for x in summary.values()) else ('INCONCLUSIVE' if any(x['status']!='PASS' for x in summary.values()) else 'PASS')
    return {'profile':'linearizable-write-conflicts','evaluation_basis':'external HTTP trace ordered state-machine oracle','run_status':run,'bug_candidate':run=='SEMANTIC_ANOMALY','confirmed_product_bug':False,'confirmation_policy':'Reproduce the same oracle violation twice, minimize the BP schedule, and exclude harness/contract causes.','oracle_summary':summary,'witness_count':len(ws),'witnesses':ws}
def main():
    p=argparse.ArgumentParser();p.add_argument('--trace',required=True);p.add_argument('--manifest',required=True);p.add_argument('--output',required=True);a=p.parse_args();r=evaluate(load(a.trace),json.loads(Path(a.manifest).read_text(encoding='utf-8-sig')));text=json.dumps(r,indent=2,sort_keys=True);Path(a.output).write_text(text+'\n',encoding='utf-8');print(text);raise SystemExit(0 if r['run_status']=='PASS' else 2)
if __name__=='__main__':main()
