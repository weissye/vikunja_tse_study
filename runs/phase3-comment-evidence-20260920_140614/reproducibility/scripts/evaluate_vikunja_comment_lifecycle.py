#!/usr/bin/env python3
"""Evaluate 15 externally observable witnesses for the comment lifecycle."""
import argparse, json
from pathlib import Path

def load(path):
    out=[]
    for line in Path(path).read_text(encoding="utf-8-sig").splitlines():
        if line.strip(): out.append(json.loads(line))
    for i,e in enumerate(out): e["_i"]=i
    return out
def find(es,m,p,codes,after=-1): return next((e for e in es if e["_i"]>after and e.get("method")==m and e.get("model_path")==p and e.get("status") in codes),None)
def rid(e): return e.get("response",{}).get("id") if e and isinstance(e.get("response"),dict) else None
def ids(resp):
    values=resp.get("items",[]) if isinstance(resp,dict) else resp
    return {x.get("id") for x in values if isinstance(x,dict) and isinstance(x.get("id"),int)} if isinstance(values,list) else set()
def evaluate(es):
    pc=find(es,"POST","/projects",{200,201}); pi=rid(pc); pr=find(es,"GET",f"/projects/{pi}",{200}) if pi else None
    tc=find(es,"POST",f"/projects/{pi}/tasks",{200,201}) if pi else None; ti=rid(tc); tr=find(es,"GET",f"/tasks/{ti}",{200}) if ti else None
    cc=find(es,"POST",f"/tasks/{ti}/comments",{200,201}) if ti else None; ci=rid(cc)
    cr1=find(es,"GET",f"/tasks/{ti}/comments/{ci}",{200}) if ci else None
    listing1=find(es,"GET",f"/tasks/{ti}/comments",{200},cc["_i"] if cc else -1) if ti else None
    up=find(es,"PUT",f"/tasks/{ti}/comments/{ci}",{200}) if ci else None
    cr2=find(es,"GET",f"/tasks/{ti}/comments/{ci}",{200},up["_i"] if up else -1) if ci else None
    req=up.get("request",{}) if up and isinstance(up.get("request"),dict) else {}
    persisted=bool(cr2 and isinstance(cr2.get("response"),dict) and req and all(cr2["response"].get(k)==v for k,v in req.items() if k=="comment"))
    cd=find(es,"DELETE",f"/tasks/{ti}/comments/{ci}",{200,204}) if ci else None
    listing2=find(es,"GET",f"/tasks/{ti}/comments",{200},cd["_i"] if cd else -1) if ti else None
    td=find(es,"DELETE",f"/tasks/{ti}",{200,204}) if ti else None; pd=find(es,"DELETE",f"/projects/{pi}",{200,204}) if pi else None
    cp=find(es,"GET",f"/tasks/{ti}/comments/{ci}",{403,404},cd["_i"] if cd else -1) if ci else None
    tp=find(es,"GET",f"/tasks/{ti}",{404},td["_i"] if td else -1) if ti else None; pp=find(es,"GET",f"/projects/{pi}",{404},pd["_i"] if pd else -1) if pi else None
    w={"01_project_created":pi is not None,"02_project_read":pr is not None,"03_task_created":ti is not None,"04_task_read":tr is not None,"05_comment_created":ci is not None,"06_comment_read":cr1 is not None,"07_comment_listed":bool(listing1 and ci in ids(listing1.get("response"))),"08_comment_updated":up is not None,"09_update_persisted":persisted,"10_comment_deleted":cd is not None,"11_comment_absent_from_list":bool(listing2 and ci not in ids(listing2.get("response"))),"12_comment_inaccessible":cp is not None,"13_task_deleted":td is not None,"14_project_deleted":pd is not None,"15_deletions_observable":bool(cp and tp and pp)}
    return {"profile":"validated-action-lifecycle","evaluation_basis":"external redacted HTTP trace","event_count":len(es),"observed_ids":{"project_id":pi,"task_id":ti,"comment_id":ci},"witnesses":w,"passed_count":sum(w.values()),"required_count":15,"phase3_pilot_passed":all(w.values())}
def main():
    p=argparse.ArgumentParser(); p.add_argument("--trace",required=True); p.add_argument("--output"); a=p.parse_args(); r=evaluate(load(a.trace)); text=json.dumps(r,indent=2,sort_keys=True); print(text)
    if a.output: Path(a.output).write_text(text+"\n",encoding="utf-8")
    raise SystemExit(0 if r["phase3_pilot_passed"] else 2)
if __name__=="__main__": main()
