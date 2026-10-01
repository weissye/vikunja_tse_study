"""Scans the generator's own source code for literals specific to the four
supplied example systems, used as *operational* string constants (equality
checks, membership tests, dict/set/list elements) rather than prose inside
comments or docstrings. This is a generality safeguard, not a functional
test.

Per ACCEPTANCE_CRITERIA.md 'Generality safeguards' #1: "No branches,
templates, fixtures, or special cases keyed by library, garage, pharmacy,
netbox, their endpoint names, or their entity names."

We use Python's `ast` module rather than a raw-text/regex scan so that
plain-English mentions of these words inside docstrings (e.g. this file's
own explanation, or entities.py's worked example "/books and
/books/{id}") are correctly ignored: `#` comments never enter the AST at
all, and a module/function/class's leading string-literal docstring is
explicitly excluded. What remains and gets checked is only string
constants that actually appear as *code* -- e.g. as an operand of `==`, as
a membership-test target, or as a dict/set/list/tuple literal element.
"""
import ast
import unittest
from pathlib import Path
from typing import List, Set, Tuple

PACKAGE_ROOT = Path(__file__).resolve().parents[2] / "openapi_to_sbt"
# The independent `compare-reference` validator is explicitly allowed (by
# design) to know about reference/SUT paths and concepts -- that is its
# entire purpose, and it is never imported by the `generate` code path. It
# is excluded from this generality/isolation scan, which targets the
# generator itself.
EXCLUDED_DIR = PACKAGE_ROOT / "compare"


def _files():
    return [p for p in sorted(PACKAGE_ROOT.rglob("*.py")) if EXCLUDED_DIR not in p.parents]

FORBIDDEN = {
    "library", "garage", "pharmacy", "netbox",
    "book", "books", "loan", "loans", "hold", "holds", "user", "users",
    "chain", "chains", "customer", "customers", "car", "cars",
    "repairorder", "repair-order", "repair-orders", "periodicmaintenance", "periodic-maintenance",
    "drug", "drugs", "patient", "patients", "prescription", "prescriptions",
    "dispense", "processrx", "process-rx", "inventory", "store", "stores",
    "device", "devices", "site", "sites", "rack", "tenant",  # netbox resource names
}


def _docstring_ids(tree: ast.AST) -> Set[int]:
    """id()s of string-constant nodes that are docstrings (first statement
    of a module/function/class body), to exclude them."""
    ids = set()
    for node in ast.walk(tree):
        if isinstance(node, (ast.Module, ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            body = getattr(node, "body", [])
            if body and isinstance(body[0], ast.Expr) and isinstance(body[0].value, ast.Constant) \
                    and isinstance(body[0].value.value, str):
                ids.add(id(body[0].value))
    return ids


def _operational_string_constants(tree: ast.AST, doc_ids: Set[int]) -> List[Tuple[str, ast.AST]]:
    """String constants used as code: comparison operands or elements of a
    dict/set/list/tuple literal. Plain string-formatting arguments
    (f-strings, .format(), log/report/provenance messages) are
    intentionally excluded -- those are human-readable text, not branching
    logic, and legitimately describe example paths/rules in docstrings and
    provenance detail strings."""
    found = []

    class Visitor(ast.NodeVisitor):
        def visit_Compare(self, node: ast.Compare):
            for o in [node.left] + list(node.comparators):
                if isinstance(o, ast.Constant) and isinstance(o.value, str) and id(o) not in doc_ids:
                    found.append((o.value, o))
            self.generic_visit(node)

        def _collect(self, node):
            for elt in getattr(node, "elts", []) or []:
                if isinstance(elt, ast.Constant) and isinstance(elt.value, str) and id(elt) not in doc_ids:
                    found.append((elt.value, elt))

        def visit_Set(self, node):
            self._collect(node); self.generic_visit(node)

        def visit_Tuple(self, node):
            self._collect(node); self.generic_visit(node)

        def visit_List(self, node):
            self._collect(node); self.generic_visit(node)

        def visit_Dict(self, node):
            for k in node.keys:
                if isinstance(k, ast.Constant) and isinstance(k.value, str) and id(k) not in doc_ids:
                    found.append((k.value, k))
            self.generic_visit(node)

    Visitor().visit(tree)
    return found


class TestNoHardcoding(unittest.TestCase):
    def test_no_operational_literals_match_example_systems(self):
        offenders = []
        for py_file in _files():
            tree = ast.parse(py_file.read_text(encoding="utf-8"), filename=str(py_file))
            doc_ids = _docstring_ids(tree)
            for value, node in _operational_string_constants(tree, doc_ids):
                if value.strip().lower() in FORBIDDEN:
                    offenders.append((str(py_file), getattr(node, "lineno", "?"), value))
        self.assertEqual(
            offenders, [],
            f"Found example-specific literal(s) used as CODE (not prose) in generator source: {offenders}\n"
            "The generator must remain fully generic (DEVELOPMENT_PROMPT.md constraint #3)."
        )

    def test_no_example_or_reference_paths_referenced(self):
        offenders = []
        for py_file in _files():
            text = py_file.read_text(encoding="utf-8")
            for name in ("examples/library", "examples/garage", "examples/pharmacy", "examples/netbox",
                         "validation_only", "reference.js"):
                if name in text:
                    offenders.append((str(py_file), name))
        self.assertEqual(offenders, [], f"Generator source references example/reference paths directly: {offenders}")


if __name__ == "__main__":
    unittest.main()
