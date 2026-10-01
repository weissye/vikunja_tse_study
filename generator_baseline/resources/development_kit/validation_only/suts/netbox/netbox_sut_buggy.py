"""NetBox-shaped V35 benchmark SUT.

V35 keeps the public OpenAPI and generator frozen, but retunes the five seeded
semantic faults to intermediate-depth witnesses.  The SUT also emits hidden,
server-side ground-truth activation markers to NETBOX_V35_GROUND_TRUTH_LOG.
Those markers are never returned in HTTP status, body, or headers and are not
available to Provengo, RESTler, or EvoMaster.
"""
from __future__ import annotations

from collections import defaultdict
import json
import os
from pathlib import Path
import threading
import time
from flask import Flask, jsonify, request

app = Flask(__name__)

SITE_KEY = "api/dcim/sites"
DEVICE_KEY = "api/dcim/devices"
CIRCUIT_KEY = "api/circuits/circuits"
GROUND_TRUTH_ENV = "NETBOX_V35_GROUND_TRUTH_LOG"
_GT_LOCK = threading.Lock()


class State:
    def __init__(self):
        self.variant = (
            os.environ.get("NETBOX_V35_VARIANT")
            or os.environ.get("NETBOX_V31_VARIANT")
            or "buggy"
        ).strip().lower()
        self.reset()

    def reset(self):
        self.db = defaultdict(list)
        self.next_id = 1
        self.device_meta = {}
        self.circuit_meta = {}
        self.deleted_site_meta = {}
        self.fault_markers = []

    def allocate_id(self):
        value = f"id_{self.next_id}"
        self.next_id += 1
        return value


state = State()


def reset_state(variant: str | None = None):
    if variant is not None:
        state.variant = variant
    state.reset()


def mark_fault(class_id: str, **details):
    """Record hidden server-side ground truth without changing HTTP behavior."""
    event = {
        "kind": "fault_ground_truth",
        "class": class_id,
        "time_ns": time.time_ns(),
        "method": getattr(request, "method", None),
        "path": getattr(request, "path", None),
        **details,
    }
    state.fault_markers.append(event)
    target = os.environ.get(GROUND_TRUTH_ENV, "").strip()
    if target:
        p = Path(target)
        p.parent.mkdir(parents=True, exist_ok=True)
        with _GT_LOCK, p.open("a", encoding="utf-8") as f:
            f.write(json.dumps(event, sort_keys=True) + "\n")
            f.flush()


def find(key, item_id):
    return next((x for x in state.db[key] if str(x.get("id")) == str(item_id)), None)


def split_path(path):
    parts = path.strip("/").split("/") if path.strip("/") else []
    if not parts:
        return "", None
    full = "/".join(parts)
    if len(parts) >= 2:
        parent = "/".join(parts[:-1])
        if parent in (SITE_KEY, DEVICE_KEY, CIRCUIT_KEY):
            return parent, parts[-1]
    return full, None


def ref_id(value):
    if isinstance(value, dict):
        value = value.get("id")
    if value in (None, ""):
        return None
    return str(value)


def children_of(site_id):
    sid = str(site_id)
    return [d for d in state.db[DEVICE_KEY] if ref_id(d.get("site")) == sid]


@app.after_request
def trace(response):
    event = {
        "kind": "api_event",
        "method": request.method,
        "path": request.path,
        "body": request.get_json(silent=True),
        "status": response.status_code,
        "response": response.get_json(silent=True),
    }
    app.logger.info("MODEL_EVENT %s", json.dumps(event, sort_keys=True))
    return response


@app.route("/", defaults={"resource_path": ""}, methods=["GET"])
@app.route("/<path:resource_path>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def api(resource_path):
    key, item_id = split_path(resource_path)

    if request.method == "GET":
        if item_id is None:
            return jsonify(state.db[key]), 200
        item = find(key, item_id)
        if not item:
            return jsonify({"detail": "Not found."}), 404
        if key == CIRCUIT_KEY:
            meta = state.circuit_meta.setdefault(str(item_id), {
                "patches": 0, "verified_after_first": False
            })
            if meta["patches"] >= 1:
                meta["verified_after_first"] = True
        return jsonify(item), 200

    if request.method == "POST":
        item = dict(request.get_json(silent=True) or {})

        if key == SITE_KEY:
            slug = item.get("slug")
            duplicate = (
                slug not in (None, "")
                and any(str(x.get("slug")) == str(slug) for x in state.db[SITE_KEY])
            )
            if duplicate:
                if state.variant != "buggy":
                    return jsonify({"detail": "duplicate value"}), 409
                mark_fault("C_UNIQUENESS", duplicate_value=str(slug))

        if key == DEVICE_KEY:
            sid = ref_id(item.get("site"))
            parent_exists = sid is not None and find(SITE_KEY, sid) is not None
            deleted = state.deleted_site_meta.get(str(sid)) if sid is not None else None
            reuse_after_valid_history = bool(deleted and deleted.get("had_child_before_delete"))
            if not parent_exists:
                if state.variant != "buggy" or not reuse_after_valid_history:
                    return jsonify({"detail": "unknown parent"}), 400
                mark_fault(
                    "E_REFERENTIAL_INTEGRITY",
                    deleted_parent_id=str(sid),
                    previous_child_count=int(deleted.get("child_count_before_delete", 0)),
                )

        item["id"] = state.allocate_id()
        item.setdefault("status", "unspecified")
        item.setdefault("description", "")
        state.db[key].append(item)

        if key == DEVICE_KEY:
            state.device_meta[item["id"]] = {
                "initial_site": ref_id(item.get("site")),
                "reassignment_attempts": 0,
            }
        if key == CIRCUIT_KEY:
            state.circuit_meta[item["id"]] = {
                "patches": 0,
                "verified_after_first": False,
            }
        return jsonify(item), 201

    item = find(key, item_id)
    if not item:
        return jsonify({"detail": "Not found."}), 404

    if request.method == "DELETE":
        if key == SITE_KEY:
            kids = children_of(item_id)
            state.deleted_site_meta[str(item_id)] = {
                "had_child_before_delete": len(kids) >= 1,
                "child_count_before_delete": len(kids),
            }
            state.db[SITE_KEY].remove(item)
            if state.variant == "buggy" and len(kids) >= 2:
                # B: deleting a parent with multiple children succeeds but leaves
                # dependents behind.  One later retrieval is enough to observe it.
                mark_fault("B_LIFECYCLE", parent_id=str(item_id), child_count=len(kids))
                return ("", 204)
            for child in list(kids):
                if child in state.db[DEVICE_KEY]:
                    state.db[DEVICE_KEY].remove(child)
                state.device_meta.pop(str(child.get("id")), None)
            return ("", 204)
        state.db[key].remove(item)
        if key == DEVICE_KEY:
            state.device_meta.pop(str(item_id), None)
        if key == CIRCUIT_KEY:
            state.circuit_meta.pop(str(item_id), None)
        return ("", 204)

    updates = dict(request.get_json(silent=True) or {})

    if key == DEVICE_KEY and "site" in updates:
        requested = ref_id(updates.get("site"))
        if requested is None or find(SITE_KEY, requested) is None:
            return jsonify({"detail": "unknown parent"}), 400
        current = ref_id(item.get("site"))
        meta = state.device_meta.setdefault(str(item_id), {
            "initial_site": current,
            "reassignment_attempts": 0,
        })
        changed_parent = requested != current
        if state.variant == "buggy" and changed_parent:
            # A: the first valid reassignment to another existing parent is
            # acknowledged but silently discarded.  The fault is observable by
            # a subsequent GET, yielding a five-request witness when resources
            # are created normally.
            meta["reassignment_attempts"] += 1
            mark_fault(
                "A_LOGIC",
                device_id=str(item_id),
                old_parent_id=current,
                requested_parent_id=requested,
                reassignment_attempt=int(meta["reassignment_attempts"]),
            )
            for k, v in updates.items():
                if k != "site":
                    item[k] = v
            return jsonify(item), 200
        item.update(updates)
        if changed_parent:
            meta["reassignment_attempts"] += 1
        return jsonify(item), 200

    if key == CIRCUIT_KEY and updates:
        meta = state.circuit_meta.setdefault(str(item_id), {
            "patches": 0, "verified_after_first": False
        })
        activated = (
            state.variant == "buggy"
            and meta["patches"] >= 1
            and meta["verified_after_first"]
        )
        previous_description = item.get("description")
        requested_description = updates.get("description", previous_description)
        meta["patches"] += 1
        meta["verified_after_first"] = False
        if activated and requested_description != previous_description:
            # D: after the first update has been externally verified, the next
            # distinct update is acknowledged but lost.  The stale PATCH response
            # itself is observable, so the minimum witness is four requests.
            mark_fault(
                "D_INTEGRITY",
                circuit_id=str(item_id),
                previous_value=previous_description,
                requested_value=requested_description,
            )
            for k, v in updates.items():
                if k != "description":
                    item[k] = v
            return jsonify(item), 200
        item.update(updates)
        return jsonify(item), 200

    item.update(updates)
    return jsonify(item), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
