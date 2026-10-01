#!/usr/bin/env python3
"""External sequence-local semantic evaluator for Garage/Pharmacy V35_b4."""
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path


CLASSES = {
    "garage": ["GARAGE_OVERFLOW", "TELEPORTING_CAR"],
    "pharmacy": ["P1_REFILL_UNDERFLOW", "P2_DOUBLE_PROCESS"],
}
ACTIVE = {"open", "in-progress", "awaiting-approval"}


def load_events(path):
    events = []
    if not Path(path).exists():
        return events
    for line in Path(path).read_text(encoding="utf-8-sig", errors="replace").splitlines():
        text = line.split("MODEL_EVENT ", 1)[-1].strip() if "MODEL_EVENT " in line else line.strip()
        try:
            value = json.loads(text)
        except Exception:
            continue
        if isinstance(value, dict):
            events.append(value)
    return events


def method(event):
    return str(event.get("method") or "").upper()


def path(event):
    return ("/" + str(event.get("path") or "").split("?", 1)[0].strip("/")).rstrip("/") or "/"


def status(event):
    try:
        return int(event.get("status"))
    except Exception:
        return None


def success(event):
    value = status(event)
    return value is not None and 200 <= value < 300


def as_dict(value):
    return value if isinstance(value, dict) else {}


def cid(value):
    return None if value is None or isinstance(value, bool) else str(value)


def brief(event, index):
    return {
        "event_index": index,
        "method": method(event),
        "path": path(event),
        "status": status(event),
        "request_body": as_dict(event.get("body")),
        "response_body": as_dict(event.get("response")),
    }


def garage_sequence(events):
    orders = {}
    sources = {}
    witnesses = {}
    sequence = list(events)

    for index, event in enumerate(sequence, 1):
        if not success(event):
            continue
        m, p = method(event), path(event)
        response = as_dict(event.get("response"))

        if m == "GET" and p == "/repair-orders" and isinstance(event.get("response"), list):
            orders = {}
            sources = {}
            for item in event["response"]:
                if isinstance(item, dict) and item.get("roId") is not None:
                    rid = cid(item.get("roId"))
                    orders[rid] = dict(item)
                    sources[rid] = {
                        "event_index": index,
                        "source": "fresh_sut_initial_state_snapshot",
                        "repair_order": dict(item),
                    }
        elif m == "POST" and p == "/repair-orders":
            if all(response.get(key) is not None for key in ("roId", "carVin", "customerId", "garageId", "status")):
                rid = cid(response.get("roId"))
                orders[rid] = dict(response)
                sources[rid] = brief(event, index)
        elif m == "PUT" and p.startswith("/repair-orders/") and "/" not in p[len("/repair-orders/"):]:
            rid = cid(response.get("roId")) or p.rsplit("/", 1)[-1]
            if isinstance(response, dict) and response:
                orders[rid] = dict(response)
                sources[rid] = brief(event, index)
        elif m == "DELETE" and p.startswith("/repair-orders/"):
            rid = p[len("/repair-orders/"):].split("/", 1)[0]
            orders.pop(rid, None)
            sources.pop(rid, None)
        elif m == "POST" and (p.endswith("/approve") or p.endswith("/close")) and response.get("roId") is not None:
            rid = cid(response.get("roId"))
            orders[rid] = dict(response)
            sources[rid] = brief(event, index)

        active = [(rid, item) for rid, item in orders.items() if item.get("status") in ACTIVE]
        by_garage = defaultdict(list)
        by_car = defaultdict(list)
        for rid, item in active:
            by_garage[cid(item.get("garageId"))].append(rid)
            by_car[cid(item.get("carVin"))].append(rid)

        if "GARAGE_OVERFLOW" not in witnesses:
            found = next(((gid, rids) for gid, rids in by_garage.items() if gid and len(set(rids)) >= 3), None)
            if found:
                gid, rids = found
                chosen = list(dict.fromkeys(rids))[:3]
                witnesses["GARAGE_OVERFLOW"] = {
                    "garage_id": gid,
                    "active_repair_order_ids": chosen,
                    "order_events": [sources[rid] for rid in chosen],
                    "sequence_steps_to_witness": index,
                }

        if "TELEPORTING_CAR" not in witnesses:
            for car, rids in by_car.items():
                garage_ids = {cid(orders[rid].get("garageId")) for rid in rids}
                garage_ids.discard(None)
                if car and len(garage_ids) >= 2:
                    chosen = []
                    seen = set()
                    for rid in rids:
                        gid = cid(orders[rid].get("garageId"))
                        if gid not in seen:
                            chosen.append(rid)
                            seen.add(gid)
                        if len(chosen) == 2:
                            break
                    witnesses["TELEPORTING_CAR"] = {
                        "car_vin": car,
                        "garage_ids": [cid(orders[rid].get("garageId")) for rid in chosen],
                        "repair_order_ids": chosen,
                        "order_events": [sources[rid] for rid in chosen],
                        "sequence_steps_to_witness": index,
                    }
                    break

    confirmed = [name for name in CLASSES["garage"] if name in witnesses]
    return result(confirmed, witnesses, len(sequence))


def response_text(event):
    try:
        return json.dumps(event.get("response"), sort_keys=True)
    except Exception:
        return str(event.get("response"))


def pharmacy_sequence(events):
    sequence = list(events)
    prescriptions = set()
    stores = set()
    rx_state = {}
    first_process = defaultdict(list)
    witnesses = {}

    for index, event in enumerate(sequence, 1):
        m, p, st = method(event), path(event), status(event)
        body, response = as_dict(event.get("body")), as_dict(event.get("response"))

        if m == "POST" and p == "/prescriptions" and success(event):
            rx = cid(response.get("id", body.get("id")))
            if rx is None:
                continue
            prescriptions.add(rx)
            try:
                refills = int(response.get("refillsLeft", body.get("refillsLeft")))
            except (TypeError, ValueError):
                continue
            if refills >= 0:
                rx_state[rx] = {"created_at": index, "initial_refills": refills, "successful_dispenses": 0}
            continue

        if m == "POST" and p == "/stores" and success(event):
            store = cid(response.get("storeId", body.get("storeId")))
            if store is not None:
                stores.add(store)
            continue

        if m == "POST" and p == "/dispense":
            rx = cid(body.get("rxId"))
            state = rx_state.get(rx)
            if state is None:
                continue
            if success(event):
                state["successful_dispenses"] += 1
            elif "SEMANTIC INVARIANT P1" in response_text(event):
                if state["successful_dispenses"] == state["initial_refills"]:
                    witnesses.setdefault("P1_REFILL_UNDERFLOW", {
                        "rx_id": rx,
                        "created_event_index": state["created_at"],
                        "initial_refills": state["initial_refills"],
                        "successful_dispenses_before_violation": state["successful_dispenses"],
                        "violation": brief(event, index),
                        "sequence_steps_to_witness": index,
                    })
            continue

        if m == "POST" and p == "/process-rx":
            rx, store = cid(body.get("rxId")), cid(body.get("storeId"))
            if rx not in prescriptions or store not in stores:
                continue
            if success(event):
                first_process[rx].append((store, index, brief(event, index)))
            elif "SEMANTIC INVARIANT P2" in response_text(event):
                first = next((item for item in first_process.get(rx, []) if item[0] != store), None)
                if first:
                    witnesses.setdefault("P2_DOUBLE_PROCESS", {
                        "rx_id": rx,
                        "first_store_id": first[0],
                        "second_store_id": store,
                        "first_process": first[2],
                        "violation": brief(event, index),
                        "sequence_steps_to_witness": index,
                    })

    confirmed = [name for name in CLASSES["pharmacy"] if name in witnesses]
    return result(confirmed, witnesses, len(sequence))


def result(confirmed, witnesses, count):
    return {
        "confirmed_classes": confirmed,
        "semantic_class_count": len(confirmed),
        "semantic_score": f"{len(confirmed)}/2",
        "event_count": count,
        "witnesses": witnesses,
    }


def load_sequences(directory):
    directory = Path(directory)
    manifest_path = directory / "sequence_manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8-sig")) if manifest_path.exists() else {}
    files = [directory / item["file"] for item in manifest.get("sequences", []) if item.get("file")]
    return [(file.name, load_events(file)) for file in files if file.is_file()], manifest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--system", required=True, choices=["garage", "pharmacy"])
    parser.add_argument("--sequence-dir", required=True)
    parser.add_argument("--campaign-trace")
    parser.add_argument("--tool", required=True)
    parser.add_argument("--artifact-version", default="v35_b4")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    evaluator = garage_sequence if args.system == "garage" else pharmacy_sequence
    sequences, manifest = load_sequences(args.sequence_dir)
    per_sequence = []
    official_witnesses = {name: [] for name in CLASSES[args.system]}
    for name, events in sequences:
        evaluated = evaluator(events)
        per_sequence.append({"sequence": name, **evaluated})
        for class_name in evaluated["confirmed_classes"]:
            official_witnesses[class_name].append({"sequence": name, **evaluated["witnesses"][class_name]})

    official_classes = [name for name in CLASSES[args.system] if official_witnesses[name]]
    complete = bool(manifest.get("official_evaluation_complete"))
    campaign = None
    if args.campaign_trace and Path(args.campaign_trace).exists():
        campaign = evaluator(load_events(args.campaign_trace))
        campaign["diagnostic_only"] = True
        campaign["warning"] = "Campaign-global evidence may stitch independent tests and is not official."

    output = {
        "schema_version": 1,
        "artifact_version": args.artifact_version,
        "system": args.system,
        "tool": args.tool,
        "oracle": "external_http_evidence_sequence_local_fresh_sut",
        "official_status": "complete" if complete else str(manifest.get("official_status") or "undetermined"),
        "official_evaluation_complete": complete,
        "sequence_confirmed_semantic_classes": official_classes,
        "sequence_confirmed_semantic_class_count": len(official_classes),
        "sequence_confirmed_score": f"{len(official_classes)}/2" if complete else None,
        "sequence_confirmed_lower_bound": f"{len(official_classes)}/2",
        "sequence_witnesses": official_witnesses,
        "evaluated_sequence_count": len(per_sequence),
        "per_sequence": per_sequence,
        "campaign_global_diagnostic": campaign,
        "campaign_global_used_for_official_score": False,
        "native_tool_faults_used_for_official_score": False,
        "sequence_manifest_summary": {
            key: manifest.get(key) for key in (
                "boundary_source", "boundary_verified", "parsed_sequence_count",
                "candidate_sequence_count", "replayed_sequence_count", "parse_error_count",
                "replay_error_count", "official_status"
            ) if key in manifest
        },
    }
    text = json.dumps(output, indent=2, sort_keys=True) + "\n"
    Path(args.output).write_text(text, encoding="utf-8")
    print(text, end="")


if __name__ == "__main__":
    main()
