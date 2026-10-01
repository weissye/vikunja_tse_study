#!/usr/bin/env python3
"""Probe deleted comment, task, and project through the external proxy."""
import argparse, json, urllib.error, urllib.request
from pathlib import Path

def status(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, method="GET"), timeout=10) as r: return r.status
    except urllib.error.HTTPError as e: return e.code

def main():
    p=argparse.ArgumentParser(); p.add_argument("--trace",required=True); p.add_argument("--base-url",required=True); p.add_argument("--output",required=True); a=p.parse_args()
    events=[json.loads(x) for x in Path(a.trace).read_text(encoding="utf-8-sig").splitlines() if x.strip()]
    def created(path_test):
        for e in events:
            if e.get("method")=="POST" and path_test(str(e.get("model_path",""))) and e.get("status") in (200,201) and isinstance(e.get("response"),dict):
                if isinstance(e["response"].get("id"),int): return e["response"]["id"]
    project=created(lambda x:x=="/projects"); task=created(lambda x:x.startswith("/projects/") and x.endswith("/tasks")); comment=created(lambda x:x.startswith("/tasks/") and x.endswith("/comments"))
    if None in (project,task,comment): raise SystemExit("Could not recover project/task/comment IDs")
    statuses={"comment":status(f"{a.base_url}/tasks/{task}/comments/{comment}"),"task":status(f"{a.base_url}/tasks/{task}"),"project":status(f"{a.base_url}/projects/{project}")}
    passed=statuses["comment"] in (403,404) and statuses["task"]==404 and statuses["project"]==404
    result={"ids":{"project":project,"task":task,"comment":comment},"statuses":statuses,"all_deletions_observable":passed}
    Path(a.output).write_text(json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf-8"); print(json.dumps(result,indent=2,sort_keys=True)); raise SystemExit(0 if passed else 2)
if __name__=="__main__": main()
