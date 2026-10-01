#!/usr/bin/env python3
"""Generate OpenAPI-derived verifier contracts for associations and subresources."""
import argparse, hashlib, json
from pathlib import Path

def load(path): return json.loads(Path(path).read_text(encoding="utf-8-sig"))
def op(spec,path,method):
    value=spec.get("paths",{}).get(path,{}).get(method.lower())
    if not isinstance(value,dict): raise ValueError(f"Missing {method} {path}")
    return value
def codes(value): return sorted(int(x) for x in value.get("responses",{}) if str(x).isdigit() and 200<=int(x)<300)
def oracle(oid,trigger,observation,assertion):
    return {"oracle_id":oid,"confidence":"high","trigger":trigger,"observation":observation,"assertions":[assertion]}
def endpoint(spec,path,method):
    value=op(spec,path,method)
    return {"method":method.upper(),"path_template":path,"operation_id":value.get("operationId"),"success_statuses":codes(value)}

def main():
    p=argparse.ArgumentParser();p.add_argument("--openapi",required=True);p.add_argument("--output",required=True);a=p.parse_args()
    spec=load(a.openapi)
    task_labels="/tasks/{task}/labels"; task_label="/tasks/{task}/labels/{label}"
    comments="/tasks/{task}/comments"; comment="/tasks/{task}/comments/{commentid}"
    relations="/tasks/{task}/relations"; relation="/tasks/{task}/relations/{relationKind}/{otherTask}"
    oracles=[
      oracle("label-attachment-visible",endpoint(spec,task_labels,"post"),endpoint(spec,task_labels,"get"),{"type":"collection_contains_bound_label"}),
      oracle("label-detachment-absent",endpoint(spec,task_label,"delete"),endpoint(spec,task_labels,"get"),{"type":"collection_excludes_bound_label"}),
      oracle("comment-create-visible",endpoint(spec,comments,"post"),endpoint(spec,comment,"get"),{"type":"created_comment_visible_with_written_text"}),
      oracle("comment-update-persistence",endpoint(spec,comment,"put"),endpoint(spec,comment,"get"),{"type":"written_comment_persists"}),
      oracle("comment-delete-absence",endpoint(spec,comment,"delete"),{"method":"GET","path_template":comment,"absence_statuses":[404]}, {"type":"comment_absent"}),
      oracle("relation-create-visible",endpoint(spec,relations,"post"),endpoint(spec,"/tasks/{task}","get"),{"type":"relation_visible_from_both_endpoints"}),
      oracle("relation-delete-absence",endpoint(spec,relation,"delete"),endpoint(spec,"/tasks/{task}","get"),{"type":"relation_absent_from_source"}),
    ]
    result={"schema_version":1,"profile":"verified-association-actions","source":{"kind":"openapi-inferred","openapi_sha256":hashlib.sha256(Path(a.openapi).read_bytes()).hexdigest()},"policy":{"evidence_basis":"external HTTP trace only","missing_observation":"INCONCLUSIVE","semantic_mismatch":"VIOLATED","violation_is":"semantic anomaly candidate, not automatically a confirmed product bug"},"oracles":oracles}
    out=Path(a.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(out),"profile":result["profile"],"oracle_count":len(oracles)},indent=2))
if __name__=="__main__": main()
