"""One small serial control on the pinned isolated Mealie instance.

No token, recipe ID, plan ID, free-form HTTP body or user data is exported.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parent))
from run_mealie_stage4 import BASE, get_token, verified_identity
from diagnose_mealie_mealplan import validation_shape

ENDPOINT = "/api/households/mealplans"


def call(token, method, path, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"Authorization": "Bearer " + token,
                                          "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            raw, status = response.read(), response.status
    except urllib.error.HTTPError as exc:
        raw, status = exc.read(), exc.code
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError):
        parsed = None
    return status, parsed


def control_result(token, name, body):
    status, response = call(token, "POST", ENDPOINT, body)
    result = {"case": name, "status": status, "field_names": sorted(body)}
    if status == 422:
        result["validation"] = validation_shape(response)
    if status == 201 and isinstance(response, dict):
        plan_id = response.get("id")
        if isinstance(plan_id, str) and re.fullmatch(r"[a-f0-9-]{36}", plan_id, flags=re.I):
            read_status, _ = call(token, "GET", ENDPOINT + "/" + urllib.parse.quote(plan_id))
            result["read_status"] = read_status
    return result


def run():
    if BASE != "http://127.0.0.1:9927":
        raise RuntimeError("Controls require the pinned isolated loopback Mealie instance")
    status, version = call("", "GET", "/api/app/about")
    if status != 200 or not isinstance(version, dict):
        raise RuntimeError("Isolated Mealie health/version endpoint unavailable")
    # The Stage 4 runner pins and compares the full specification. This
    # diagnostic keeps its calls scoped to that same local instance.
    token = get_token()
    verified_identity(token)
    day = date.today() + timedelta(days=50)
    key = uuid4().hex[:10]
    text = "Research meal plan " + key
    cases = [
        ("date_only", {"date": day.isoformat()}),
        ("text_only", {"date": (day + timedelta(days=1)).isoformat(), "text": text}),
        ("title_and_text", {"date": (day + timedelta(days=2)).isoformat(), "title": text, "text": text}),
    ]
    out = [control_result(token, name, body) for name, body in cases]
    # Produce a documented, readable recipe to discriminate between a missing
    # recipe prerequisite and an alternative free-text entry.
    recipe_status, recipe = call(token, "POST", "/api/recipes", {"name": "Research recipe " + key})
    recipe_report = {"create_status": recipe_status, "read_status": None}
    if recipe_status == 201 and isinstance(recipe, dict):
        recipe_id, slug = recipe.get("id"), recipe.get("slug")
        if isinstance(recipe_id, str) and isinstance(slug, str) and slug:
            recipe_report["read_status"], _ = call(token, "GET", "/api/recipes/" + urllib.parse.quote(slug))
            if recipe_report["read_status"] == 200:
                out.append(control_result(token, "verified_recipe_id", {
                    "date": (day + timedelta(days=3)).isoformat(), "recipeId": recipe_id}))
    return {"schema_version": 1, "classification": "ISOLATED_MEALPLAN_SERIAL_CONTROLS",
            "recipe_prerequisite": recipe_report, "cases": out}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    result = run()
    target = Path(args.output)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print("MEALIE_MEALPLAN_SERIAL_CONTROLS " + ",".join(
        "%s=%s" % (r["case"], r["status"]) for r in result["cases"]))
    print("MEALIE_MEALPLAN_SERIAL_EVIDENCE_READY " + str(target))


if __name__ == "__main__":
    main()
