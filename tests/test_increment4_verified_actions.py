#!/usr/bin/env python3
import importlib.util,json,tempfile,unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location("validator",ROOT/"scripts"/"validate_action_verifiers.py")
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
ORACLES=("label-attachment-visible","label-detachment-absent","comment-create-visible","comment-update-persistence","comment-delete-absence","relation-create-visible","relation-delete-absence")
def manifest():return {"oracles":[{"oracle_id":x} for x in ORACLES]}
def e(method,path,status,request=None,response=None):
    x={"method":method,"model_path":path,"status":status}
    if request is not None:x["request"]=request
    if response is not None:x["response"]=response
    return x
class Increment4ValidatorTests(unittest.TestCase):
    def complete(self):
        return [
          e("POST","/tasks/1/labels",201,{"label_id":7},{}),e("GET","/tasks/1/labels",200,response=[{"id":7}]),
          e("DELETE","/tasks/1/labels/7",204),e("GET","/tasks/1/labels",200,response=[]),
          e("POST","/tasks/1/comments",201,{"comment":"old"},{"id":9,"comment":"old"}),e("GET","/tasks/1/comments/9",200,response={"id":9,"comment":"old"}),
          e("PUT","/tasks/1/comments/9",200,{"comment":"new"},{}),e("GET","/tasks/1/comments/9",200,response={"id":9,"comment":"new"}),
          e("DELETE","/tasks/1/comments/9",204),e("GET","/tasks/1/comments/9",404),
          e("POST","/tasks/1/relations",201,{"other_task_id":2,"relation_kind":"related"},{"task_id":1,"other_task_id":2,"relation_kind":"related"}),
          e("GET","/tasks/1",200,response={"related_tasks":{"related":[{"id":2}]}}),e("GET","/tasks/2",200,response={"related_tasks":{"related":[{"id":1}]}}),
          e("DELETE","/tasks/1/relations/related/2",204),e("GET","/tasks/1",200,response={"related_tasks":{}}),
        ]
    def test_complete_sequence_passes_seven_oracles(self):
        r=v.evaluate(self.complete(),manifest(),{"labels":1,"comments":1,"relations":1})
        self.assertEqual("PASS",r["run_status"]);self.assertEqual(7,len(r["witnesses"]));self.assertTrue(all(x["status"]=="PASS" for x in r["oracle_summary"].values()))
    def test_missing_read_is_inconclusive(self):
        rows=[x for x in self.complete() if not (x["method"]=="GET" and x["model_path"]=="/tasks/1/comments/9" and x["status"]==404)]
        r=v.evaluate(rows,manifest(),{"labels":1,"comments":1,"relations":1})
        self.assertEqual("INCONCLUSIVE",r["oracle_summary"]["comment-delete-absence"]["status"])
    def test_stale_update_is_violation(self):
        rows=self.complete();next(x for x in rows if x["method"]=="GET" and x["model_path"]=="/tasks/1/comments/9" and x.get("response",{}).get("comment")=="new")["response"]["comment"]="old"
        r=v.evaluate(rows,manifest(),{"labels":1,"comments":1,"relations":1})
        self.assertEqual("SEMANTIC_ANOMALY",r["run_status"]);self.assertEqual("VIOLATED",r["oracle_summary"]["comment-update-persistence"]["status"])
    def test_generator_contains_balanced_action_obligations(self):
        text=(ROOT/"generator_baseline"/"openapi_to_sbt"/"render"/"stories_js.py").read_text(encoding="utf-8")
        for stem in ("LabelAttach","LabelDetach","CommentCreate","CommentUpdate","CommentDelete","RelationCreate","RelationDelete"):
            self.assertIn(f"Obligation:Verify{stem}",text);self.assertIn(f"VerifierClosed:{stem}",text)
        self.assertIn("Milestone:AllActionVerifiersClosed",text);self.assertIn("MultiResourceVerifiedActionsComplete",text)
if __name__=="__main__":unittest.main()
