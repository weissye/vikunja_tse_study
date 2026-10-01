#!/usr/bin/env python3
"""Sequence-local external validator for Increment-4 action verifiers."""
import argparse,json,re
from pathlib import Path

def load(path):
    events=[]; dec=json.JSONDecoder(); text=Path(path).read_text(encoding="utf-8-sig").replace("\x00","")
    for line_no,line in enumerate(text.splitlines(),1):
        rest=line.strip().lstrip("\ufeff")
        while rest:
            try: value,end=dec.raw_decode(rest)
            except json.JSONDecodeError as exc: raise ValueError(f"Malformed trace line {line_no}, column {exc.colno}") from exc
            if not isinstance(value,dict): raise ValueError(f"Invalid event on line {line_no}")
            value["_index"]=len(events);events.append(value);rest=rest[end:].strip()
    return events
def req(e):
    for k in ("request","request_body"):
        if isinstance(e.get(k),dict): return e[k]
    return {}
def resp(e): return e.get("response") if isinstance(e.get("response"),(dict,list)) else {}
def listed(value,wanted):
    values=value.get("items",value) if isinstance(value,dict) else value
    return isinstance(values,list) and any(isinstance(x,dict) and x.get("id")==wanted for x in values)
def rels(value):
    related=value.get("related_tasks",{}) if isinstance(value,dict) else {}
    return {k:{x.get("id") for x in xs if isinstance(x,dict)} for k,xs in related.items() if isinstance(xs,list)} if isinstance(related,dict) else {}
def next_get(events,start,path,stop=()):
    for e in events[start+1:]:
        if e.get("model_path")!=path: continue
        if str(e.get("method","")).upper() in stop: return None,"superseded-before-observation"
        if str(e.get("method","")).upper()=="GET": return e,None
    return None,"observation-not-found"
def witness(oid,trigger,observation,expected,observed,result,reason=None):
    value={"oracle_id":oid,"trigger_event":trigger["_index"],"observation_event":observation.get("_index") if observation else None,"expected":expected,"observed":observed,"result":result}
    if reason:value["reason"]=reason
    return value
def decide(observation,good,reason):
    if not observation:return "INCONCLUSIVE","observation-not-found"
    return ("PASS",None) if good else ("VIOLATED",reason)

def evaluate(events,manifest,expected):
    for i,e in enumerate(events):e.setdefault("_index",i)
    required={x["oracle_id"] for x in manifest.get("oracles",[])}
    expected_oracles={"label-attachment-visible","label-detachment-absent","comment-create-visible","comment-update-persistence","comment-delete-absence","relation-create-visible","relation-delete-absence"}
    if required!=expected_oracles:raise ValueError("Manifest must contain exactly seven Increment-4 action oracles")
    ws=[]
    for e in events:
        m=str(e.get("method","")).upper();p=str(e.get("model_path",""));s=e.get("status");r=req(e)
        if m=="POST" and re.fullmatch(r"/tasks/\d+/labels",p) and s in (200,201):
            lid=r.get("label_id");o,_=next_get(events,e["_index"],p,("DELETE",));good=bool(o and o.get("status")==200 and listed(resp(o),lid));state,reason=decide(o,good,"attached-label-not-listed");ws.append(witness("label-attachment-visible",e,o,{"label_id":lid},{"listed":good},state,reason))
        elif m=="DELETE" and re.fullmatch(r"/tasks/\d+/labels/\d+",p) and s in (200,204):
            lid=int(p.rsplit("/",1)[1]);coll=p.rsplit("/",1)[0];o,_=next_get(events,e["_index"],coll);good=bool(o and o.get("status")==200 and not listed(resp(o),lid));state,reason=decide(o,good,"detached-label-still-listed");ws.append(witness("label-detachment-absent",e,o,{"label_id":lid,"listed":False},{"listed":None if not o else listed(resp(o),lid)},state,reason))
        elif m=="POST" and re.fullmatch(r"/tasks/\d+/comments",p) and s in (200,201):
            cid=resp(e).get("id") if isinstance(resp(e),dict) else None; path=f"{p}/{cid}";o,_=next_get(events,e["_index"],path,("PUT","DELETE"));want=r.get("comment");got=resp(o).get("comment") if o and isinstance(resp(o),dict) else None;state,reason=decide(o,o.get("status")==200 and got==want if o else False,"created-comment-mismatch");ws.append(witness("comment-create-visible",e,o,{"id":cid,"comment":want},{"comment":got},state,reason))
        elif m=="PUT" and re.fullmatch(r"/tasks/\d+/comments/\d+",p) and s==200:
            o,_=next_get(events,e["_index"],p,("PUT","DELETE"));want=r.get("comment");got=resp(o).get("comment") if o and isinstance(resp(o),dict) else None;state,reason=decide(o,o.get("status")==200 and got==want if o else False,"updated-comment-mismatch");ws.append(witness("comment-update-persistence",e,o,{"comment":want},{"comment":got},state,reason))
        elif m=="DELETE" and re.fullmatch(r"/tasks/\d+/comments/\d+",p) and s in (200,204):
            o,_=next_get(events,e["_index"],p);got=o.get("status") if o else None;state,reason=decide(o,got==404,"deleted-comment-accessible");ws.append(witness("comment-delete-absence",e,o,{"status":404},{"status":got},state,reason))
        elif m=="POST" and re.fullmatch(r"/tasks/\d+/relations",p) and s in (200,201):
            src=int(p.split("/")[2]);dst=r.get("other_task_id");kind=r.get("relation_kind");oa,_=next_get(events,e["_index"],f"/tasks/{src}",( "DELETE",));ob,_=next_get(events,e["_index"],f"/tasks/{dst}",( "DELETE",));a=dst in rels(resp(oa)).get(kind,set()) if oa else False;b=src in {x for xs in rels(resp(ob)).values() for x in xs} if ob else False;state="INCONCLUSIVE" if not oa or not ob else ("PASS" if a and b else "VIOLATED");ws.append(witness("relation-create-visible",e,oa,{"source":src,"target":dst,"kind":kind,"bidirectional":True},{"source_visible":a,"target_visible":b},state,None if state=="PASS" else "relation-not-bidirectionally-visible"))
        elif m=="DELETE" and re.fullmatch(r"/tasks/\d+/relations/[^/]+/\d+",p) and s in (200,204):
            parts=p.strip("/").split("/");src=int(parts[1]);dst=int(parts[-1]);o,_=next_get(events,e["_index"],f"/tasks/{src}");present=dst in {x for xs in rels(resp(o)).values() for x in xs} if o else None;state,reason=decide(o,o.get("status")==200 and not present if o else False,"deleted-relation-still-visible");ws.append(witness("relation-delete-absence",e,o,{"target":dst,"present":False},{"present":present},state,reason))
    counts_expected={"label-attachment-visible":expected["labels"],"label-detachment-absent":expected["labels"],"comment-create-visible":expected["comments"],"comment-update-persistence":expected["comments"],"comment-delete-absence":expected["comments"],"relation-create-visible":expected["relations"],"relation-delete-absence":expected["relations"]}
    summary={}
    for oid in sorted(required):
        group=[x for x in ws if x["oracle_id"]==oid];counts={k:sum(x["result"]==k for x in group) for k in ("PASS","VIOLATED","INCONCLUSIVE")};missing=max(0,counts_expected[oid]-len(group));status="NOT_EXERCISED" if not group else ("VIOLATED" if counts["VIOLATED"] else ("INCONCLUSIVE" if counts["INCONCLUSIVE"] or missing else "PASS"));summary[oid]={"status":status,"witness_count":len(group),"expected_witness_count":counts_expected[oid],"missing_witness_count":missing,"counts":counts}
    run="SEMANTIC_ANOMALY" if any(x["status"]=="VIOLATED" for x in summary.values()) else ("INCONCLUSIVE" if any(x["status"]!="PASS" for x in summary.values()) else "PASS")
    return {"profile":"verified-association-actions","evaluation_basis":"external HTTP trace plus generated oracle manifest","run_status":run,"confirmed_product_bug":False,"oracle_summary":summary,"witnesses":ws}
def main():
    p=argparse.ArgumentParser();p.add_argument("--trace",required=True);p.add_argument("--manifest",required=True);p.add_argument("--expected-labels",type=int,required=True);p.add_argument("--expected-comments",type=int,required=True);p.add_argument("--expected-relations",type=int,required=True);p.add_argument("--output",required=True);a=p.parse_args();result=evaluate(load(a.trace),json.loads(Path(a.manifest).read_text(encoding="utf-8-sig")),{"labels":a.expected_labels,"comments":a.expected_comments,"relations":a.expected_relations});text=json.dumps(result,indent=2,sort_keys=True);Path(a.output).write_text(text+"\n",encoding="utf-8");print(text);raise SystemExit(0 if result["run_status"]=="PASS" else 2)
if __name__=="__main__":main()
