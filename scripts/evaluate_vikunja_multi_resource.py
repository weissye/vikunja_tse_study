#!/usr/bin/env python3
"""External trace oracle for Phase 7 multi-resource BP executions."""
import argparse, json
from pathlib import Path

def load(path, recover_with_probe=False):
    raw=Path(path).read_bytes()
    if raw.startswith((b"\xff\xfe",b"\xfe\xff")):
        text=raw.decode("utf-16")
    else:
        text=raw.decode("utf-8-sig")
    rows=[]; decoder=json.JSONDecoder(); malformed=[]
    for line_number,line in enumerate(text.splitlines(),1):
        remaining=line.strip().replace("\x00","").lstrip("\ufeff")
        while remaining:
            try:
                event,end=decoder.raw_decode(remaining)
            except json.JSONDecodeError as exc:
                if recover_with_probe:
                    malformed.append({"line":line_number,"column":exc.colno,"prefix":remaining[:120]})
                    break
                raise ValueError(f"Malformed HTTP trace at line {line_number}, column {exc.colno}: {remaining[:120]!r}") from exc
            if not isinstance(event,dict) or not {"method","model_path","status"}.issubset(event):
                raise ValueError(f"Non-event JSON object in HTTP trace at line {line_number}")
            rows.append(event); remaining=remaining[end:].strip()
    for i,e in enumerate(rows): e["_i"]=i
    return rows,malformed

def rid(e):
    r=e.get("response") if e else None
    return r.get("id") if isinstance(r,dict) else None

def body(e):
    r=e.get("request")
    if isinstance(r,dict): return r
    r=e.get("request_body")
    return r if isinstance(r,dict) else {}

def is_generated_incremental_write(e):
    """Keep baseline counters separate from Increment 6/7 oracle writes."""
    return any(isinstance(v,str) and v.startswith(("conflict6_", "increment7_")) for v in body(e).values())

def is_increment6_conflict_write(e):
    """Backward-compatible name retained for the Increment 6 regression suite."""
    return is_generated_incremental_write(e)

def listed(response, wanted):
    values=response.get("items",response) if isinstance(response,dict) else response
    return isinstance(values,list) and any(isinstance(x,dict) and x.get("id")==wanted for x in values)

def relations(response):
    r=response.get("related_tasks",{}) if isinstance(response,dict) else {}
    return {k:{x.get("id") for x in v if isinstance(x,dict)} for k,v in r.items() if isinstance(v,list)} if isinstance(r,dict) else {}

def evaluate(es, tasks, labels, comments):
    anomalies=[]
    project=next((e for e in es if e.get("method")=="POST" and e.get("model_path")=="/projects" and e.get("status") in (200,201)),None)
    pid=rid(project)
    task_creates=[e for e in es if e.get("method")=="POST" and str(e.get("model_path","")).startswith(f"/projects/{pid}/tasks") and e.get("status") in (200,201)] if pid else []
    tids=[rid(e) for e in task_creates if isinstance(rid(e),int)]
    label_creates=[e for e in es if e.get("method")=="POST" and e.get("model_path")=="/labels" and e.get("status") in (200,201)]
    lids=[rid(e) for e in label_creates if isinstance(rid(e),int)]
    comment_creates=[e for e in es if e.get("method")=="POST" and "/comments" in str(e.get("model_path","")) and e.get("status") in (200,201)]
    cids=[rid(e) for e in comment_creates if isinstance(rid(e),int)]
    updates=[e for e in es if e.get("method")=="PUT" and str(e.get("model_path","")).startswith("/tasks/") and "/comments/" not in str(e.get("model_path","")) and e.get("status")==200 and not is_generated_incremental_write(e)]
    persisted=0
    for u in updates:
        read=next((e for e in es if e["_i"]>u["_i"] and e.get("method")=="GET" and e.get("model_path")==u.get("model_path") and e.get("status")==200),None)
        req={k:v for k,v in body(u).items() if k in ("title","done")}
        if read and req and all(read.get("response",{}).get(k)==v for k,v in req.items()): persisted+=1
        else: anomalies.append({"phase":"task_update", "path":u.get("model_path")})
    cupdates=[e for e in es if e.get("method")=="PUT" and "/comments/" in str(e.get("model_path","")) and e.get("status")==200 and not is_generated_incremental_write(e)]
    cpersisted=0
    for u in cupdates:
        read=next((e for e in es if e["_i"]>u["_i"] and e.get("method")=="GET" and e.get("model_path")==u.get("model_path") and e.get("status")==200),None)
        if read and read.get("response",{}).get("comment")==body(u).get("comment"): cpersisted+=1
        else: anomalies.append({"phase":"comment_update", "path":u.get("model_path")})
    attaches=[e for e in es if e.get("method")=="POST"
              and str(e.get("model_path","")).startswith("/tasks/")
              and str(e.get("model_path","")).endswith("/labels")
              and e.get("status") in (200,201)]
    detaches=[e for e in es if e.get("method")=="DELETE"
              and str(e.get("model_path","")).startswith("/tasks/")
              and "/labels/" in str(e.get("model_path",""))
              and e.get("status") in (200,204)]
    attach_seen=detach_seen=0
    for a in attaches:
        lid=body(a).get("label_id")
        read=next((e for e in es if e["_i"]>a["_i"] and e.get("method")=="GET" and e.get("model_path")==a.get("model_path") and e.get("status")==200),None)
        if read and listed(read.get("response"),lid): attach_seen+=1
    for d in detaches:
        lid=int(str(d.get("model_path")).rsplit("/",1)[-1])
        collection=str(d.get("model_path")).rsplit("/",1)[0]
        read=next((e for e in es if e["_i"]>d["_i"] and e.get("method")=="GET" and e.get("model_path")==collection and e.get("status")==200),None)
        if read and not listed(read.get("response"),lid): detach_seen+=1
    rcreates=[e for e in es if e.get("method")=="POST" and str(e.get("model_path","")).endswith("/relations") and e.get("status") in (200,201)]
    rdeletes=[e for e in es if e.get("method")=="DELETE" and "/relations/" in str(e.get("model_path","")) and e.get("status") in (200,204)]
    robs=runlinked=0
    for r in rcreates:
        resp=r.get("response",{}); src=resp.get("task_id"); dst=resp.get("other_task_id"); kind=resp.get("relation_kind")
        read=next((e for e in es if e["_i"]>r["_i"] and e.get("method")=="GET" and e.get("model_path")==f"/tasks/{src}" and e.get("status")==200),None)
        if read and dst in relations(read.get("response",{})).get(kind,set()): robs+=1
    for d in rdeletes:
        parts=str(d.get("model_path","")).strip("/").split("/"); src=parts[1]; dst=int(parts[-1])
        read=next((e for e in es if e["_i"]>d["_i"] and e.get("method")=="GET" and e.get("model_path")==f"/tasks/{src}" and e.get("status")==200),None)
        if read and all(dst not in xs for xs in relations(read.get("response",{})).values()): runlinked+=1
    cdeletes=[e for e in es if e.get("method")=="DELETE" and "/comments/" in str(e.get("model_path","")) and e.get("status") in (200,204)]
    tdeletes=[e for e in es if e.get("method")=="DELETE" and str(e.get("model_path","")).startswith("/tasks/") and all(x not in str(e.get("model_path","")) for x in ("/comments/","/labels/","/relations/")) and e.get("status") in (200,204)]
    ldeletes=[e for e in es if e.get("method")=="DELETE" and str(e.get("model_path","")).startswith("/labels/") and e.get("status") in (200,204)]
    probes={(e.get("model_path"),e.get("status")) for e in es if e.get("method")=="GET"}
    deletion_paths={f"/projects/{pid}"}|{f"/tasks/{x}" for x in tids}|{f"/labels/{x}" for x in lids}
    checks={
      "project_created":isinstance(pid,int), "tasks_created":len(tids)==tasks and len(set(tids))==tasks,
      "labels_created":len(lids)==labels and len(set(lids))==labels, "comments_created":len(cids)==comments,
      "task_updates_persisted":len(updates)==tasks and persisted==tasks,
      "comment_updates_persisted":len(cupdates)==comments and cpersisted==comments,
      "labels_attached_and_observed":len(attaches)==labels and attach_seen==labels,
      "labels_detached_and_observed":len(detaches)==labels and detach_seen==labels,
      "relations_created_and_observed":len(rcreates)==tasks-1 and robs==tasks-1,
      "relations_deleted_and_observed":len(rdeletes)==tasks-1 and runlinked==tasks-1,
      "comments_deleted":len(cdeletes)==comments, "tasks_deleted":len(tdeletes)==tasks,
      "labels_deleted":len(ldeletes)==labels,
      "project_deleted":any(e.get("method")=="DELETE" and e.get("model_path")==f"/projects/{pid}" and e.get("status") in (200,204) for e in es),
      "deletions_externally_observable":all((p,404) in probes or (p,403) in probes for p in deletion_paths),
      "no_semantic_anomalies":not anomalies,
    }
    return {"profile":"multi-resource-interleaving","evaluation_basis":"external redacted HTTP trace","event_count":len(es),
            "expected":{"tasks":tasks,"labels":labels,"comments":comments},"observed_ids":{"project":pid,"tasks":tids,"labels":lids,"comments":cids},
            "counts":{"task_updates":len(updates),"comment_updates":len(cupdates),"relation_creates":len(rcreates),"relation_deletes":len(rdeletes)},
            "checks":checks,"anomalies":anomalies,"passed_count":sum(checks.values()),"required_count":len(checks),"phase7_passed":all(checks.values())}

def main():
    p=argparse.ArgumentParser(); p.add_argument("--trace",required=True); p.add_argument("--probe"); p.add_argument("--tasks",type=int,default=6); p.add_argument("--labels",type=int,default=3); p.add_argument("--comments",type=int,default=4); p.add_argument("--output",required=True); a=p.parse_args()
    events,malformed=load(a.trace,recover_with_probe=bool(a.probe))
    if a.probe:
        probe=json.loads(Path(a.probe).read_text(encoding="utf-8-sig"))
        for path,status in probe.get("statuses",{}).items():
            events.append({"method":"GET","model_path":path,"status":status,"response":None,"recovered_from_probe":True})
        for i,e in enumerate(events): e["_i"]=i
    r=evaluate(events,a.tasks,a.labels,a.comments)
    r["trace_recovery"]={"used":bool(a.probe),"malformed_lines_skipped":malformed,"probe_file":str(a.probe) if a.probe else None,
                         "canonical_evidence_eligible":not malformed}
    text=json.dumps(r,indent=2,sort_keys=True); print(text); Path(a.output).write_text(text+"\n",encoding="utf-8"); raise SystemExit(0 if r["phase7_passed"] else 2)
if __name__=="__main__": main()
