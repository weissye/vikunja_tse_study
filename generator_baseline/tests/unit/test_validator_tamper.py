"""Regression tests for a real tamper vulnerability found by an external
audit: `validate` used to trust `generation_report.json`'s self-reported
coverage numbers and check response codes via a global substring search
over the whole interfaces file's text, so a stub file containing only
comments with the response-code numbers written out as plain text (e.g.
"200 201 202 204...") passed with `ok: true` and "100% coverage".

`validate` now independently re-derives the ground truth (by re-running
the parse -> infer -> plan pipeline directly from the OpenAPI file) and
performs real structural analysis of the actual JS file (brace-matched
function bodies, method-call and expectedResponseCodes checks scoped to
each specific function) -- these tests pin that fix.
"""
import json
import os
import shutil
import tempfile
import unittest
from pathlib import Path

from openapi_to_sbt.validate.static_validate import validate_generated, extract_js_functions
from openapi_to_sbt.pipeline import run_pipeline

import tests.unit.test_inference as ti


def _write_spec(spec):
    f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
    json.dump(spec, f)
    f.close()
    return f.name


class TestValidatorTamperResistance(unittest.TestCase):
    def setUp(self):
        self.openapi_path = _write_spec(ti.NESTED_SPEC)
        self.addCleanup(os.unlink, self.openapi_path)
        self.gen_dir = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.gen_dir, ignore_errors=True)
        result = run_pipeline(self.openapi_path, "nested", "http://localhost:5000", seed=1)
        Path(self.gen_dir, "interfaces.nested.js").write_text(result.interfaces_js, encoding="utf-8")
        Path(self.gen_dir, "stories.nested.js").write_text(result.stories_js, encoding="utf-8")
        Path(self.gen_dir, "generation_report.json").write_text(
            json.dumps(result.generation_report), encoding="utf-8")
        Path(self.gen_dir, "dependency_graph.json").write_text(
            json.dumps(result.dependency_graph_report), encoding="utf-8")

    def test_real_generated_output_passes(self):
        result = validate_generated(self.openapi_path, self.gen_dir)
        self.assertTrue(result["ok"], result)
        self.assertEqual(len(result["operation_coverage"]["uncovered_operations"]), 0)

    def test_stub_file_with_only_comments_is_rejected(self):
        """The auditor's exact scenario: replace interfaces.*.js with two
        comment lines containing the response-code numbers as plain text.
        A generation_report.json claiming full coverage is left
        untouched on disk -- the fix must not depend on that file being
        edited or absent."""
        Path(self.gen_dir, "interfaces.nested.js").write_text(
            "// stub\n// codes: 200 201 202 204 400 404 409\n", encoding="utf-8"
        )
        result = validate_generated(self.openapi_path, self.gen_dir)
        self.assertFalse(result["ok"], result)
        self.assertGreater(len(result["operation_coverage"]["uncovered_operations"]), 0)
        self.assertEqual(result["response_code_coverage"]["coverage_percent"], 0.0)
        reasons = {f["reason"] for f in result["operation_coverage"]["uncovered_operations"]}
        self.assertIn("FUNCTION_NOT_FOUND", reasons)

    def test_function_exists_but_calls_wrong_http_method_is_rejected(self):
        """A function with the right name exists, but internally calls
        the wrong HTTP method (e.g. a create op that actually issues a
        GET) -- this must be caught even though the function is
        present and non-empty."""
        js = Path(self.gen_dir, "interfaces.nested.js").read_text(encoding="utf-8")
        # Flip the very first svc.post( to svc.get( to simulate a wrong
        # method while keeping the function structurally intact.
        tampered = js.replace("svc.post(", "svc.get(", 1)
        Path(self.gen_dir, "interfaces.nested.js").write_text(tampered, encoding="utf-8")
        result = validate_generated(self.openapi_path, self.gen_dir)
        self.assertFalse(result["ok"], result)
        reasons = {f["reason"] for f in result["operation_coverage"]["uncovered_operations"]}
        self.assertIn("WRONG_OR_MISSING_METHOD_CALL", reasons)

    def test_function_declares_fewer_codes_than_openapi_requires(self):
        """A function exists and calls the right method, but its
        expectedResponseCodes array is missing a code the OpenAPI
        contract actually declares -- must be caught even though the
        function is otherwise intact and real."""
        js = Path(self.gen_dir, "interfaces.nested.js").read_text(encoding="utf-8")
        import re
        # Narrow every expectedResponseCodes array down to just its first code.
        tampered = re.sub(
            r"expectedResponseCodes:\s*\[([^\]]*)\]",
            lambda m: f"expectedResponseCodes: [{m.group(1).split(',')[0].strip()}]",
            js,
        )
        self.assertNotEqual(js, tampered, "test fixture assumption failed: no expectedResponseCodes arrays found")
        Path(self.gen_dir, "interfaces.nested.js").write_text(tampered, encoding="utf-8")
        result = validate_generated(self.openapi_path, self.gen_dir)
        self.assertFalse(result["ok"], result)
        reasons = {f["reason"] for f in result["operation_coverage"]["uncovered_operations"]}
        self.assertIn("MISSING_RESPONSE_CODES", reasons)

    def test_stale_generation_report_claiming_full_coverage_does_not_help_tampered_js(self):
        """Explicitly proves the fix doesn't just move the trust problem:
        even with generation_report.json UNCHANGED (still claiming full,
        correct coverage from the original real run), a tampered JS file
        is still correctly rejected, because the ground truth is
        re-derived from the OpenAPI file, not read from that report."""
        original_report = Path(self.gen_dir, "generation_report.json").read_text(encoding="utf-8")
        Path(self.gen_dir, "interfaces.nested.js").write_text("// nothing here\n", encoding="utf-8")
        # generation_report.json is untouched -- still claims full coverage.
        self.assertEqual(Path(self.gen_dir, "generation_report.json").read_text(encoding="utf-8"), original_report)
        result = validate_generated(self.openapi_path, self.gen_dir)
        self.assertFalse(result["ok"], result)


class TestExtractJsFunctions(unittest.TestCase):
    def test_brace_inside_string_does_not_break_extraction(self):
        js = '''
function foo(x) {
  var body = { "a": "value with a brace } inside a string" };
  return body;
}
function bar(y) { return y; }
'''
        functions = extract_js_functions(js)
        self.assertIn("foo", functions)
        self.assertIn("bar", functions)
        self.assertTrue(functions["foo"].strip().endswith("}"))
        self.assertIn("return body;", functions["foo"])

    def test_truncated_function_is_not_extracted(self):
        js = "function broken(x) {\n  var y = 1;\n"  # missing closing brace
        functions = extract_js_functions(js)
        self.assertNotIn("broken", functions)


if __name__ == "__main__":
    unittest.main()
