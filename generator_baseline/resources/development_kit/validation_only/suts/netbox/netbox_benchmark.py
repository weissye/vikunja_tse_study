from flask import Flask, request, jsonify
from collections import defaultdict
import json

app = Flask(__name__)
db = defaultdict(list)
deleted = set()

def find(key, item_id):
    return next((x for x in db[key] if str(x.get("id")) == str(item_id)), None)

def split_path(path):
    parts = path.strip("/").split("/") if path.strip("/") else []
    if not parts:
        return "", None
    full = "/".join(parts)
    if len(parts) >= 2:
        parent = "/".join(parts[:-1])
        # The compact benchmark accepts arbitrary string IDs at the OpenAPI
        # boundary.  Treat a path as an item path once its collection has
        # been observed, rather than guessing from ID spelling/length.
        if parent in db:
            return parent, parts[-1]
    return full, None

@app.after_request
def trace(response):
    event = {
        "kind": "api_event", "method": request.method, "path": request.path,
        "body": request.get_json(silent=True), "status": response.status_code,
        "response": response.get_json(silent=True)
    }
    app.logger.info("MODEL_EVENT %s", json.dumps(event, sort_keys=True))
    return response

@app.route("/", defaults={"resource_path": ""}, methods=["GET"])
@app.route("/<path:resource_path>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def api(resource_path):
    key, item_id = split_path(resource_path)
    if request.method == "GET":
        if item_id is None:
            return jsonify({"count": len(db[key]), "results": db[key]})
        item = find(key, item_id)
        return (jsonify(item), 200) if item else (jsonify({"detail": "Not found."}), 404)
    if request.method == "POST":
        item = dict(request.get_json(silent=True) or {})
        item.setdefault("id", f"id_{sum(map(len, db.values())) + 1}")
        item.setdefault("status", "draft")
        db[key].append(item)
        return jsonify(item), 201
    item = find(key, item_id)
    if request.method == "DELETE":
        if not item:
            return jsonify({"detail": "Not found."}), 404
        deleted.add((key, str(item_id)))
        return jsonify({"detail": "Deletion recorded."}), 404
    if not item:
        return jsonify({"detail": "Not found."}), 404
    updates = dict(request.get_json(silent=True) or {})
    if key == "api/circuits/circuits" and "status" in updates:
        updates.pop("status")
    item.update(updates)
    return jsonify(item), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
