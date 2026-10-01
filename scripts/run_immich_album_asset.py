#!/usr/bin/env python3
"""Directed album/asset membership experiment on the pinned isolated Immich."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import csv
import hashlib
import json
import os
import random
import socket
import struct
import threading
import time
import urllib.error
import urllib.request
import uuid
import zipfile
import zlib
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

from openapi_to_sbt.trace_proxy import build_server as build_proxy
from run_immich_album_serial import SPEC_SHA, authenticate, validate_spec, call as direct_call


def port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def png_bytes(color):
    def chunk(label, body):
        return struct.pack(">I", len(body)) + label + body + struct.pack(">I", zlib.crc32(label + body) & 0xffffffff)
    raw = b"".join(b"\x00" + bytes(color) * 16 for _ in range(16))
    return (b"\x89PNG\r\n\x1a\n" +
            chunk(b"IHDR", struct.pack(">2I5B", 16, 16, 8, 2, 0, 0, 0)) +
            chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))


def multipart_asset(color, filename):
    boundary = "sbt-" + uuid.uuid4().hex
    timestamp = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    fields = [("fileCreatedAt", timestamp), ("fileModifiedAt", timestamp),
              ("filename", filename)]
    body = bytearray()
    for key, value in fields:
        body.extend(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" +
                     key + "\"\r\n\r\n" + value + "\r\n").encode("utf-8"))
    body.extend(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"assetData\"; filename=\"" +
                 filename + "\"\r\nContent-Type: image/png\r\n\r\n").encode("utf-8"))
    body.extend(png_bytes(color))
    body.extend(("\r\n--" + boundary + "--\r\n").encode("utf-8"))
    return bytes(body), "multipart/form-data; boundary=" + boundary


def request(base, method, path, data=None, *, content_type="application/json", epoch=None, op_id=None):
    headers = {"Accept": "application/json", "Content-Type": content_type}
    if epoch:
        headers.update({"X-Provengo-Epoch-Id": epoch, "X-Provengo-Operation-Id": op_id})
    if data is not None and not isinstance(data, bytes):
        data = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(base + path, method=method, headers=headers, data=data)
    try:
        with urllib.request.urlopen(req, timeout=65) as r:
            status, raw = r.status, r.read()
    except urllib.error.HTTPError as err:
        status, raw = err.code, err.read()
    try:
        body = json.loads(raw) if raw else None
    except (ValueError, UnicodeError):
        body = None
    return {"status": status, "body": body}


def search_members(base, album_id):
    # SearchFilter.albumIds.any is the active v3.2.0 schema field; legacy
    # MetadataSearchDto.albumIds is deprecated.
    r = request(base, "POST", "/search/metadata",
                {"filter": {"albumIds": {"any": [album_id]}}, "size": 250})
    if r["status"] != 200 or not isinstance(r["body"], dict):
        return None
    page = r["body"].get("assets")
    if not isinstance(page, dict) or not isinstance(page.get("items"), list):
        return None
    if page.get("nextCursor"):
        return None  # A truncated observation cannot prove absence.
    return {item["id"] for item in page["items"]
            if isinstance(item, dict) and isinstance(item.get("id"), str)}


def observe(base, album_id):
    album = request(base, "GET", "/albums/" + album_id)
    members = search_members(base, album_id)
    if album["status"] != 200 or not isinstance(album["body"], dict) or members is None:
        return None
    return {"members": members, "asset_count": album["body"].get("assetCount"),
            "thumbnail": album["body"].get("albumThumbnailAssetId")}


def stable(base, album_id, expected, attempts=8):
    last = None
    for _ in range(attempts):
        last = observe(base, album_id)
        if last is not None and last["members"] == expected and last["asset_count"] == len(expected):
            return last
        time.sleep(0.25)
    return None


def success_ids(response, expected):
    body = response["body"]
    return (response["status"] == 200 and isinstance(body, list) and
            {x.get("id") for x in body if isinstance(x, dict)} == expected and
            all(isinstance(x, dict) and x.get("success") is True for x in body))


def check_trace(trace_path, epoch, resource, asset_a, asset_b):
    rows = [json.loads(line) for line in trace_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    writes = [r for r in rows if r.get("epoch_id") == epoch and
              r.get("model_path") == resource and r.get("method") in ("PUT", "DELETE")]
    reads = [r for r in rows if r.get("epoch_id") == epoch and
             r.get("operation_id") == epoch + "-observe" and r.get("method") == "GET"]
    if len(writes) != 2 or len(reads) != 1:
        return False, "epoch-http-witness-missing", writes
    try:
        start = max(datetime.fromisoformat(r["upstream_started_utc"]) for r in writes)
        end = min(datetime.fromisoformat(r["upstream_completed_utc"]) for r in writes)
        observed = datetime.fromisoformat(reads[0]["upstream_started_utc"])
    except (ValueError, KeyError, TypeError):
        return False, "timing-unavailable", writes
    if not start < end or observed <= max(datetime.fromisoformat(r["upstream_completed_utc"]) for r in writes):
        return False, "no-proxy-overlap-or-early-read", writes
    requests = {(r["method"], tuple(r.get("request", {}).get("ids", []))) for r in writes}
    if requests != {("DELETE", (asset_a,)), ("PUT", (asset_b,))}:
        return False, "wrong-epoch-membership-operations", writes
    beginning = min(datetime.fromisoformat(r["upstream_started_utc"]) for r in writes)
    for r in rows:
        if r.get("epoch_id") == epoch or r.get("method") not in ("PUT", "POST", "DELETE", "PATCH"):
            continue
        if not (r.get("model_path", "").startswith(resource) or
                r.get("model_path") in ("/albums/assets", "/assets")):
            continue
        try:
            if (datetime.fromisoformat(r["upstream_started_utc"]) < observed and
                    datetime.fromisoformat(r["upstream_completed_utc"]) > beginning):
                return False, "intervening-related-write", writes
        except (ValueError, TypeError, KeyError):
            return False, "interferer-timing-unavailable", writes
    return True, "", writes


def classify(epoch, trace_ok, trace_writes, first, second, a, b):
    if not trace_ok or first is None or second is None or len(trace_writes) != 2:
        return "INCONCLUSIVE", "overlap-or-final-observation-unverified"
    ops = epoch.get("operations", [])
    if (epoch.get("all_workers_ready_before_release") is not True or len(ops) != 2 or
            any(not success_ids(x["result"], {a if x["method"] == "DELETE" else b}) for x in ops) or
            any(not success_ids({"status": x.get("status"), "body": x.get("response")},
                                {a if x.get("method") == "DELETE" else b}) for x in trace_writes)):
        return "INCONCLUSIVE", "epoch-operation-not-successful"
    if first != second or any(x["asset_count"] != len(x["members"]) for x in (first, second)):
        return "INCONCLUSIVE", "post-epoch-observations-unstable"
    if second["members"] != {b}:
        return "SEMANTIC_CANDIDATE", "disjoint-membership-update-not-preserved"
    return "PASS", "both-disjoint-membership-updates-persisted"


def concurrent_epoch(base, epoch_id, resource, a, b, rng):
    operations = [("DELETE", a), ("PUT", b)]
    rng.shuffle(operations)
    barrier = threading.Barrier(3, timeout=20)
    def worker(index, operation):
        method, asset_id = operation
        barrier.wait()
        return {"method": method, "asset_id": asset_id,
                "result": request(base, method, resource, {"ids": [asset_id]},
                                  epoch=epoch_id, op_id=epoch_id + "-op-" + str(index))}
    with ThreadPoolExecutor(max_workers=2, thread_name_prefix="immich-membership") as executor:
        jobs = [executor.submit(worker, i, op) for i, op in enumerate(operations)]
        barrier.wait()
        results = [job.result(timeout=75) for job in jobs]
    return {"all_workers_ready_before_release": True, "operations": results}


def trial(base, trace, index, prefix_rounds, rng):
    mark = uuid.uuid4().hex[:12]
    record = {"trial": index, "verdict": "INCONCLUSIVE"}
    album_id = None
    assets = []
    try:
        album = request(base, "POST", "/albums", {"albumName": "sbt-album-asset-" + mark})
        album_id = album["body"].get("id") if isinstance(album["body"], dict) else None
        if album["status"] != 201 or not album_id:
            record["reason"] = "album-create-failed"; return record
        for letter, color in (("A", (150, 80, 30)), ("B", (35, 100, 180))):
            data, content_type = multipart_asset(color, "sbt-" + mark + "-" + letter + ".png")
            uploaded = request(base, "POST", "/assets", data, content_type=content_type)
            asset_id = uploaded["body"].get("id") if isinstance(uploaded["body"], dict) else None
            asset_read = request(base, "GET", "/assets/" + asset_id) if isinstance(asset_id, str) else None
            if (uploaded["status"] != 201 or not isinstance(asset_id, str) or
                    not asset_read or asset_read["status"] != 200 or
                    not isinstance(asset_read["body"], dict) or asset_read["body"].get("id") != asset_id):
                record["reason"] = "asset-create-or-read-failed-" + letter
                record["upload_status"] = uploaded["status"]; return record
            assets.append(asset_id)
        a, b = assets
        record["asset_ids"] = {"a": a, "b": b}
        resource = "/albums/" + album_id + "/assets"
        if not success_ids(request(base, "PUT", resource, {"ids": [a]}), {a}):
            record["reason"] = "initial-add-failed"; return record
        if stable(base, album_id, {a}) is None:
            record["reason"] = "initial-membership-unverified"; return record
        for round_number in range(prefix_rounds):
            value = "sbt-" + mark + "-round-" + str(round_number)
            change = request(base, "PATCH", "/albums/" + album_id, {"albumName": value})
            state = request(base, "GET", "/albums/" + album_id)
            if (change["status"] != 200 or state["status"] != 200 or
                    not isinstance(state["body"], dict) or state["body"].get("albumName") != value):
                record["reason"] = "prefix-unverified";record["round"] = round_number; return record
        record["prefix_rounds_verified"] = prefix_rounds
        # A real, readable, album-member asset replaces the fabricated UUID.
        thumb = request(base, "PATCH", "/albums/" + album_id, {"albumThumbnailAssetId": a})
        state = request(base, "GET", "/albums/" + album_id)
        if (thumb["status"] != 200 or state["status"] != 200 or
                not isinstance(state["body"], dict) or state["body"].get("albumThumbnailAssetId") != a):
            record["reason"] = "real-thumbnail-prerequisite-unverified"
            record["thumbnail_status"] = thumb["status"]; return record
        record["real_thumbnail_verified"] = True
        # Both serial orders, each starting and ending at {A}.
        for sequence in ((("DELETE", a), ("PUT", b)), (("PUT", b), ("DELETE", a))):
            for method, target in sequence:
                if not success_ids(request(base, method, resource, {"ids": [target]}), {target}):
                    record["reason"] = "serial-control-write-failed"; return record
            if stable(base, album_id, {b}) is None:
                record["reason"] = "serial-control-result-unverified"; return record
            if not success_ids(request(base, "PUT", resource, {"ids": [a]}), {a}):
                record["reason"] = "serial-reset-add-failed"; return record
            if not success_ids(request(base, "DELETE", resource, {"ids": [b]}), {b}):
                record["reason"] = "serial-reset-remove-failed"; return record
            if stable(base, album_id, {a}) is None:
                record["reason"] = "serial-baseline-not-restored"; return record
        record["two_serial_orders_verified"] = True
        epoch_id = "immich-membership-" + mark
        epoch = concurrent_epoch(base, epoch_id, resource, a, b, rng)
        # The first read is explicitly tagged; other independent observations
        # use the same authenticated proxy after adapter quiescence.
        request(base, "GET", "/albums/" + album_id, epoch=epoch_id, op_id=epoch_id + "-observe")
        final = observe(base, album_id)
        time.sleep(0.8)
        repeated_final = observe(base, album_id)
        trace_ok, trace_reason, writes = check_trace(trace, epoch_id, resource, a, b)
        verdict, reason = classify(epoch, trace_ok, writes, final, repeated_final, a, b)
        record.update({"verdict": verdict, "reason": trace_reason or reason,
                       "epoch_id": epoch_id, "overlap": trace_ok,
                       "http_witness": trace_ok,
                       "final_members": sorted(final["members"]) if final else None,
                       "final_count": final["asset_count"] if final else None,
                       "repeat_members": sorted(repeated_final["members"]) if repeated_final else None,
                       "repeat_count": repeated_final["asset_count"] if repeated_final else None})
        return record
    finally:
        if album_id:
            try:
                record["cleanup_album_status"] = request(base, "DELETE", "/albums/" + album_id)["status"]
            except Exception:
                record["cleanup_album_status"] = None
        if assets:
            try:
                record["cleanup_assets_status"] = request(base, "DELETE", "/assets", {"ids": assets})["status"]
            except Exception:
                record["cleanup_assets_status"] = None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--target", default="http://127.0.0.1:9926")
    parser.add_argument("--trials", type=int, default=2)
    parser.add_argument("--prefix-rounds", type=int, default=4)
    parser.add_argument("--seed", type=int, default=20261420)
    parser.add_argument("--freeze-evidence", action="store_true")
    args = parser.parse_args()
    if args.target != "http://127.0.0.1:9926" or not (1 <= args.trials <= 20) or not (1 <= args.prefix_rounds <= 12):
        parser.error("isolated local pilot only; Trials 1..20, PrefixRounds 1..12")
    root = args.root.resolve()
    validate_spec(root / "model/immich/immich-v3.2.0-openapi.json")
    spec = json.loads((root / "model/immich/immich-v3.2.0-openapi.json").read_text(encoding="utf-8"))
    required = {("post", "/assets"): "uploadAsset", ("get", "/assets/{id}"): "getAssetInfo",
                ("delete", "/assets"): "deleteAssets",
                ("put", "/albums/{id}/assets"): "addAssetsToAlbum",
                ("delete", "/albums/{id}/assets"): "removeAssetFromAlbum",
                ("post", "/search/metadata"): "searchAssets",
                ("patch", "/albums/{id}"): "updateAlbumInfo",
                ("get", "/albums/{id}"): "getAlbumInfo"}
    for (method, path), operation in required.items():
        if spec["paths"][path][method].get("operationId") != operation:
            parser.error("pinned OpenAPI operation mismatch: " + path)
    if hashlib.sha256((root / "model/immich/immich-v3.2.0-openapi.json").read_bytes()).hexdigest() != SPEC_SHA:
        parser.error("pinned OpenAPI SHA256 mismatch")
    version = direct_call(args.target, "GET", "/server/version")
    if version["status"] != 200 or any(version["body"].get(k) != v
                                       for k, v in (("major", 3), ("minor", 2), ("patch", 0))):
        parser.error("isolated Immich server is not v3.2.0")
    token = authenticate(args.target, root / "deployment/immich_album_pilot/local-admin-credentials.json")
    run_name = "research-fit-immich-album-asset-" + datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")[:-3]
    run = root / "runs" / run_name
    run.mkdir(parents=True, exist_ok=False)
    trace = run / "http-trace.jsonl"
    proxy_port = port()
    os.environ["IMMICH_PILOT_EPHEMERAL_TOKEN"] = token
    try:
        proxy = build_proxy(SimpleNamespace(listen_host="127.0.0.1", listen_port=proxy_port,
            target=args.target, api_prefix="/api", trace=str(trace),
            bearer_token_env="IMMICH_PILOT_EPHEMERAL_TOKEN", require_bearer_token=True,
            authorization_scheme="Bearer", timeout=60.0))
    finally:
        os.environ.pop("IMMICH_PILOT_EPHEMERAL_TOKEN", None)
        token = None
    threading.Thread(target=proxy.serve_forever, daemon=True).start()
    results = []
    rng = random.Random(args.seed)
    try:
        for i in range(1, args.trials + 1):
            try:
                results.append(trial("http://127.0.0.1:%d" % proxy_port,
                                     trace, i, args.prefix_rounds, rng))
            except Exception as exc:
                results.append({"trial": i, "verdict": "INCONCLUSIVE",
                                "reason": "unexpected-" + type(exc).__name__})
    finally:
        proxy.shutdown()
        proxy.server_close()
    # Multipart bytes are irrelevant to the oracle and stay out of evidence.
    if trace.exists():
        cleaned = []
        for line in trace.read_text(encoding="utf-8").splitlines():
            row = json.loads(line)
            if str(row.get("request_content_type", "")).startswith("multipart/form-data"):
                row["request"] = "[REDACTED_MULTIPART_ASSET]"
            cleaned.append(json.dumps(row, sort_keys=True))
        trace.write_text("\n".join(cleaned) + ("\n" if cleaned else ""), encoding="utf-8")
    summary = {"schema_version": 1, "candidate": "immich", "version": "v3.2.0",
               "source_spec_sha256": SPEC_SHA, "scope": "directed diagnostic; separate from generated campaign",
               "parameters": {"trials": args.trials, "prefix_rounds": args.prefix_rounds, "seed": args.seed},
               "counts": {verdict: sum(x["verdict"] == verdict for x in results)
                          for verdict in ("PASS", "SEMANTIC_CANDIDATE", "INCONCLUSIVE")},
               "results": results}
    (run / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (run / "run_immich_album_asset.py").write_bytes(Path(__file__).read_bytes())
    files = sorted(p for p in run.iterdir() if p.is_file())
    with (run / "checksums.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=("file", "sha256"))
        writer.writeheader()
        writer.writerows({"file": p.name, "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
                         for p in files)
    if args.freeze_evidence:
        archive = root / "evidence" / (run_name + "-review.zip")
        archive.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(archive, "x", zipfile.ZIP_DEFLATED) as output:
            for path in sorted(run.iterdir()):
                if path.is_file():
                    output.write(path, path.name)
        print("IMMICH_ALBUM_ASSET_EVIDENCE_READY", archive)
        print("ZIP SHA256:", hashlib.sha256(archive.read_bytes()).hexdigest())
    print("IMMICH_ALBUM_ASSET_COUNTS", json.dumps(summary["counts"]))
    for result in results:
        print("IMMICH_ALBUM_ASSET_RESULT trial=%d verdict=%s reason=%s" %
              (result["trial"], result["verdict"], result.get("reason", "")))
    print("IMMICH_ALBUM_ASSET_COMPLETE run=" + str(run))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
