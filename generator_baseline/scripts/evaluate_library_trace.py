import json, re, sys
from collections import defaultdict

events = []
for line in open(sys.argv[1], encoding="utf-8", errors="replace"):
    m = re.search(r"MODEL_EVENT\s+(\{.*\})", line)
    if m:
        try: events.append(json.loads(m.group(1)))
        except json.JSONDecodeError: pass

holds = defaultdict(set)
active = defaultdict(set)
hold_violation = False
limit_violation = False
for e in events:
    kind = e.get("kind")
    if kind in {"api_success", "api_result"}:
        method, path, body = e.get("method"), e.get("path", ""), e.get("body") or {}
        if e.get("status", 999) < 400 and method == "POST" and path == "/holds":
            kind, e = "hold_created", {"kind":"hold_created", "userId":body.get("userId"), "bookId":body.get("bookId")}
        elif e.get("status", 999) < 400 and method == "POST" and path == "/loans":
            kind, e = "loan_created", {"kind":"loan_created", "userId":body.get("userId"), "bookId":body.get("bookId")}
        elif e.get("status", 999) < 400 and method == "DELETE" and path.startswith("/loans/"):
            parts = path.strip("/").split("/")
            kind, e = "loan_deleted", {"kind":"loan_deleted", "userId":parts[1], "bookId":parts[2]}
    if kind == "hold_created": holds[e["bookId"]].add(e["userId"])
    elif kind == "hold_deleted":
        pass
    elif kind == "loan_created":
        user, book = e["userId"], e["bookId"]
        if holds.get(book) and any(str(owner) != str(user) for owner in holds[book]):
            hold_violation = True
        active[user].add(book)
        if len(active[user]) >= 3: limit_violation = True
    elif kind == "loan_deleted": active[e["userId"]].discard(e["bookId"])

result = {
    "rule_basis": "HTTP/SUT event trace; evaluator is external to generated stories",
    "hold_ownership_confirmed": hold_violation,
    "loan_limit_confirmed": limit_violation,
    "event_count": len(events),
}
print(json.dumps(result, indent=2))
