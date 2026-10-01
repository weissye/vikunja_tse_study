#!/usr/bin/env python3
"""Discover complete nested subresource lifecycles from an OpenAPI contract."""
import argparse, json, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"generator_baseline"))
from openapi_to_sbt.pipeline import run_pipeline

def main():
    p=argparse.ArgumentParser(); p.add_argument("--openapi",required=True); p.add_argument("--output",required=True); a=p.parse_args()
    result=run_pipeline(a.openapi,"candidate-discovery","http://127.0.0.1:1",seed=1)
    candidates=[]
    for ep in result.plan.entities:
        actions=[op for op in ep.ops if op.kind=="action"]
        for create in sorted((op for op in actions if op.op.method=="POST"),key=lambda x:x.op.path):
            base=create.op.path; item=[op for op in actions if op.op.path.startswith(base+"/{")]
            methods={op.op.method for op in item}; has_list=any(op.op.method=="GET" and op.op.path==base for op in actions)
            if has_list and {"GET","PUT","DELETE"}.issubset(methods):
                candidates.append({"owner_entity":ep.entity.key,"collection_path":base,"item_path":sorted({op.op.path for op in item})[0],"methods":["POST","GET_COLLECTION","GET_ITEM","PUT","DELETE"],"score":5,"selected":False})
    if candidates: candidates[0]["selected"]=True
    report={"policy":"OpenAPI-derived structural discovery; no system or endpoint names are matched","candidate_count":len(candidates),"candidates":candidates}
    Path(a.output).parent.mkdir(parents=True,exist_ok=True); Path(a.output).write_text(json.dumps(report,indent=2,sort_keys=True)+"\n",encoding="utf-8"); print(json.dumps(report,indent=2,sort_keys=True))
if __name__=="__main__": main()
