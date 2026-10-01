#!/usr/bin/env python3
import argparse,json,urllib.request,urllib.error
from pathlib import Path
def main():
 p=argparse.ArgumentParser();p.add_argument("--trace",required=True);p.add_argument("--base-url",required=True);p.add_argument("--output",required=True);a=p.parse_args()
 es=[json.loads(x) for x in Path(a.trace).read_text(encoding="utf-8-sig").splitlines() if x.strip()]
 paths=[]
 for e in es:
  if e.get("method")!="POST" or e.get("status") not in (200,201) or not isinstance(e.get("response"),dict):continue
  i=e["response"].get("id");m=str(e.get("model_path",""))
  if not isinstance(i,int):continue
  if m=="/projects":paths.append(("project",f"/projects/{i}"))
  elif m=="/labels":paths.append(("label",f"/labels/{i}"))
  elif m.endswith("/tasks"):paths.append(("task",f"/tasks/{i}"))
 statuses={}
 for role,path in paths:
  req=urllib.request.Request(a.base_url.rstrip("/")+path,method="GET")
  try:
   with urllib.request.urlopen(req,timeout=10) as r: status=r.status
  except urllib.error.HTTPError as e: status=e.code
  # The request passes through vikunja_research_proxy.py, which is the sole
  # trace writer.  Writing the same observation here would create concurrent
  # writers and can corrupt JSONL on Windows.
  statuses[path]=status
 result={"statuses":statuses,"all_deletions_observable":all(x in (403,404) for x in statuses.values())}
 Path(a.output).write_text(json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf-8");print(json.dumps(result,indent=2));raise SystemExit(0 if result["all_deletions_observable"] else 2)
if __name__=="__main__":main()
