#!/usr/bin/env python3
"""External, sequence-local validator for Increment 5 negative probes."""
import argparse,json,re
from pathlib import Path

UNKNOWN={
 'unknown-project-rejected':('GET','/projects/2147483001'),
 'unknown-task-rejected':('GET','/tasks/2147483002'),
 'unknown-label-rejected':('GET','/labels/2147483003'),
 'unknown-comment-rejected':('GET','/tasks/2147483002/comments/2147483004'),
}
ITEMS={
 'project':re.compile(r'^/projects/\d+$'),
 'task':re.compile(r'^/tasks/\d+$'),
 'label':re.compile(r'^/labels/\d+$'),
 'comment':re.compile(r'^/tasks/\d+/comments/\d+$'),
}
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
def is4xx(status):return isinstance(status,int) and 400<=status<500
def relations(response):
    r=response.get('related_tasks',{}) if isinstance(response,dict) else {}
    return {x.get('id') for values in r.values() if isinstance(values,list) for x in values if isinstance(x,dict)} if isinstance(r,dict) else set()
def one(oid,trigger,expected,result,reason=None,extra=None):
    value={'oracle_id':oid,'trigger_event':trigger.get('_index') if trigger else None,'expected':expected,'observed':{'status':trigger.get('status') if trigger else None},'result':result}
    if reason:value['reason']=reason
    if extra:value['observed'].update(extra)
    return value
def status_result(event):
    if event is None:return 'INCONCLUSIVE','observation-not-found'
    if is4xx(event.get('status')):return 'PASS',None
    return 'VIOLATED','negative-operation-was-not-rejected-with-4xx'
def later(events,start,path,method):return next((e for e in events[start+1:] if e.get('model_path')==path and str(e.get('method','')).upper()==method),None)

def evaluate(events,manifest):
    for index,event in enumerate(events):event.setdefault('_index',index)
    expected={x['oracle_id']:int(x['expected_witness_count']) for x in manifest.get('oracles',[])}; witnesses=[]
    for oid,(method,path) in UNKNOWN.items():
        if oid not in expected:continue
        event=next((e for e in events if e.get('model_path')==path and str(e.get('method','')).upper()==method),None);result,reason=status_result(event);witnesses.append(one(oid,event,{'status_class':'4xx'},result,reason))
    for resource,pattern in ITEMS.items():
        successful=[e for e in events if str(e.get('method','')).upper()=='DELETE' and pattern.fullmatch(str(e.get('model_path',''))) and e.get('status') in (200,204)]
        for trigger in successful:
            path=trigger['model_path']; after=[e for e in events[trigger['_index']+1:] if e.get('model_path')==path]
            gets=[e for e in after if str(e.get('method','')).upper()=='GET']
            probes={'read':gets[-1] if len(gets)>=2 else None,
                    'update':next((e for e in after if str(e.get('method','')).upper() in ('PUT','PATCH')),None),
                    'delete':next((e for e in after if str(e.get('method','')).upper()=='DELETE'),None)}
            for operation,event in probes.items():
                oid=f'deleted-{resource}-{operation}-rejected'
                if oid not in expected:continue
                result,reason=status_result(event);witnesses.append(one(oid,event,{'status_class':'4xx','after_successful_delete_event':trigger['_index']},result,reason,{'resource_path':path}))
    relation_pattern=re.compile(r'^/tasks/(\d+)/relations/([^/]+)/(\d+)$')
    relation_triggers=[e for e in events if str(e.get('method','')).upper()=='DELETE' and relation_pattern.fullmatch(str(e.get('model_path',''))) and e.get('status') in (200,204)]
    for trigger in relation_triggers if 'deleted-relation-delete-rejected-and-absent' in expected else []:
        match=relation_pattern.fullmatch(trigger['model_path']);source=int(match.group(1));target=int(match.group(3))
        negative=later(events,trigger['_index'],trigger['model_path'],'DELETE');read=later(events,negative['_index'],f'/tasks/{source}','GET') if negative else None
        if negative is None or read is None:result,reason='INCONCLUSIVE','negative-delete-or-absence-read-missing'
        elif not is4xx(negative.get('status')):result,reason='VIOLATED','repeated-relation-delete-not-rejected'
        elif read.get('status')!=200 or target in relations(read.get('response')):result,reason='VIOLATED','deleted-relation-visible-after-repeated-delete'
        else:result,reason='PASS',None
        witnesses.append(one('deleted-relation-delete-rejected-and-absent',negative,{'delete_status_class':'4xx','relation_absent':True},result,reason,{'read_status':read.get('status') if read else None,'relation_present':target in relations(read.get('response')) if read else None}))
    summary={}
    for oid,n in expected.items():
        group=[w for w in witnesses if w['oracle_id']==oid];counts={s:sum(w['result']==s for w in group) for s in ('PASS','VIOLATED','INCONCLUSIVE')};missing=max(0,n-len(group));status='NOT_EXERCISED' if not group else ('VIOLATED' if counts['VIOLATED'] else ('INCONCLUSIVE' if counts['INCONCLUSIVE'] or missing or len(group)!=n else 'PASS'));summary[oid]={'status':status,'witness_count':len(group),'expected_witness_count':n,'missing_witness_count':missing,'counts':counts}
    run='SEMANTIC_ANOMALY' if any(x['status']=='VIOLATED' for x in summary.values()) else ('INCONCLUSIVE' if any(x['status']!='PASS' for x in summary.values()) else 'PASS')
    return {'profile':'negative-and-conflict-exploration','evaluation_basis':'external HTTP trace plus generated negative oracle manifest','run_status':run,'bug_candidate':run=='SEMANTIC_ANOMALY','confirmed_product_bug':False,'confirmation_policy':'Reproduce the same violated oracle twice, minimize the schedule, and exclude harness/contract causes before confirmation.','oracle_summary':summary,'witness_count':len(witnesses),'witnesses':witnesses}
def main():
    p=argparse.ArgumentParser();p.add_argument('--trace',required=True);p.add_argument('--manifest',required=True);p.add_argument('--output',required=True);a=p.parse_args();result=evaluate(load(a.trace),json.loads(Path(a.manifest).read_text(encoding='utf-8-sig')));text=json.dumps(result,indent=2,sort_keys=True);Path(a.output).write_text(text+'\n',encoding='utf-8');print(text);raise SystemExit(0 if result['run_status']=='PASS' else 2)
if __name__=='__main__':main()
