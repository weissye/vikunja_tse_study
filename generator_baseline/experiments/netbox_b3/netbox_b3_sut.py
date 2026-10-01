from flask import Flask, request, jsonify
from collections import defaultdict
import json

app = Flask(__name__)
db = defaultdict(list)
deleted = set()
circuit_meta = {}


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
        # boundary. Treat a path as an item path once its collection exists.
        if parent in db:
            return parent, parts[-1]
    return full, None


def ref_id(value):
    if isinstance(value, dict):
        value = value.get("id")
    return None if value is None else str(value)


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
        if not item:
            return jsonify({"detail": "Not found."}), 404
        if key == "api/circuits/circuits":
            meta = circuit_meta.setdefault(str(item_id), {"patches": 0, "verified_after_first": False})
            if meta["patches"] >= 1:
                meta["verified_after_first"] = True
        return jsonify(item), 200

    if request.method == "POST":
        item = dict(request.get_json(silent=True) or {})
        item.setdefault("id", f"id_{sum(map(len, db.values())) + 1}")
        item.setdefault("status", "draft")
        item.setdefault("description", "")
        db[key].append(item)
        if key == "api/circuits/circuits":
            circuit_meta[str(item["id"])] = {"patches": 0, "verified_after_first": False}
        return jsonify(item), 201

    item = find(key, item_id)
    if request.method == "DELETE":
        if not item:
            return jsonify({"detail": "Not found."}), 404
        # Retained B2 behavior: deleting a Site with >=2 dependent Devices
        # succeeds but leaves those children retrievable with the deleted ref.
        if key == "api/dcim/sites":
            kids = []
            for child in db["api/dcim/devices"]:
                if ref_id(child.get("site")) == str(item_id):
                    kids.append(child)
            if len(kids) >= 2:
                db[key].remove(item)
                deleted.add((key, str(item_id)))
                return ("", 204)
        deleted.add((key, str(item_id)))
        return jsonify({"detail": "Deletion recorded."}), 404

    if not item:
        return jsonify({"detail": "Not found."}), 404

    updates = dict(request.get_json(silent=True) or {})

    # Retained B1 behavior: a valid Device reassignment to another existing
    # Site is acknowledged but silently discarded.
    if key == "api/dcim/devices" and "site" in updates:
        requested_id = ref_id(updates.get("site"))
        current_id = ref_id(item.get("site"))
        target_site = find("api/dcim/sites", requested_id) if requested_id is not None else None
        if target_site is not None and requested_id != current_id:
            updates.pop("site", None)

    # B3 single newly hardened behavior: first Circuit description update is
    # applied; after a GET externally verifies it, the next distinct update is
    # acknowledged with 200 but silently discarded. The stale PATCH response
    # itself completes the four-operation external witness.
    if key == "api/circuits/circuits" and "description" in updates:
        meta = circuit_meta.setdefault(str(item_id), {"patches": 0, "verified_after_first": False})
        previous = item.get("description")
        requested = updates.get("description")
        activated = meta["patches"] >= 1 and meta["verified_after_first"]
        meta["patches"] += 1
        meta["verified_after_first"] = False
        if activated and requested != previous:
            for k, v in updates.items():
                if k != "description":
                    item[k] = v
            return jsonify(item), 200

    item.update(updates)
    return jsonify(item), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
