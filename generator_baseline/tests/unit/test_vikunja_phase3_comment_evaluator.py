import importlib.util, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
SPEC=importlib.util.spec_from_file_location("comment_eval",ROOT/"scripts"/"evaluate_vikunja_comment_lifecycle.py")
M=importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(M)

class CommentEvaluatorTests(unittest.TestCase):
    def test_fifteen_witnesses_and_negative_control(self):
        rows=[("POST","/projects",201,{"title":"p"},{"id":1}),("GET","/projects/1",200,None,{"id":1}),("POST","/projects/1/tasks",201,{"title":"t"},{"id":2}),("GET","/tasks/2",200,None,{"id":2}),("POST","/tasks/2/comments",201,{"comment":"a"},{"id":3,"comment":"a"}),("GET","/tasks/2/comments/3",200,None,{"id":3,"comment":"a"}),("GET","/tasks/2/comments",200,None,{"items":[{"id":3}]}),("PUT","/tasks/2/comments/3",200,{"comment":"b"},{"id":3,"comment":"b"}),("GET","/tasks/2/comments/3",200,None,{"id":3,"comment":"b"}),("DELETE","/tasks/2/comments/3",204,None,None),("GET","/tasks/2/comments",200,None,{"items":[]}),("DELETE","/tasks/2",204,None,None),("DELETE","/projects/1",204,None,None),("GET","/tasks/2/comments/3",404,None,None),("GET","/tasks/2",404,None,None),("GET","/projects/1",404,None,None)]
        es=[{"_i":i,"method":m,"model_path":p,"status":s,"request":q,"response":r} for i,(m,p,s,q,r) in enumerate(rows)]
        result=M.evaluate(es); self.assertTrue(result["phase3_pilot_passed"]); self.assertEqual(result["passed_count"],15)
        es[8]["response"]["comment"]="stale"; self.assertFalse(M.evaluate(es)["phase3_pilot_passed"])
if __name__=="__main__": unittest.main()
