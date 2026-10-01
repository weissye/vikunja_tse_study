from flask import Flask, jsonify, request
import json
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("library-model")
app = Flask(__name__)
users, books, loans, holds = [], [], [], []


def emit(kind, **fields):
    log.info("MODEL_EVENT %s", json.dumps({"kind": kind, **fields}, sort_keys=True))


def body():
    value = request.get_json(force=True, silent=True)
    return value if isinstance(value, dict) else None


def positive_id(value):
    return isinstance(value, int) and not isinstance(value, bool) and value >= 1


def by_id(rows, value):
    return next((row for row in rows if row.get("id") == value), None)


@app.route("/users", methods=["POST", "GET"])
def users_collection():
    if request.method == "GET":
        return jsonify(users), 200
    value = body()
    if value is None or not positive_id(value.get("id")) or not isinstance(value.get("name"), str):
        return jsonify({"error": "invalid-user"}), 400
    if by_id(users, value["id"]):
        return jsonify({"error": "duplicate-user"}), 409
    row = {"id": value["id"], "name": value["name"]}
    users.append(row); emit("user_created", id=row["id"])
    return jsonify(row), 201


@app.delete("/users/<int:item_id>")
def delete_user(item_id):
    index = next((i for i, row in enumerate(users) if row.get("id") == item_id), None)
    if index is None: return jsonify({"error": "not-found"}), 404
    users.pop(index); emit("user_deleted", id=item_id)
    return jsonify({"message": "User deleted"}), 200


@app.route("/books", methods=["POST", "GET"])
def books_collection():
    if request.method == "GET": return jsonify(books), 200
    value = body()
    if value is None or not positive_id(value.get("id")) or not isinstance(value.get("title"), str):
        return jsonify({"error": "invalid-book"}), 400
    if by_id(books, value["id"]): return jsonify({"error": "duplicate-book"}), 409
    row = {"id": value["id"], "title": value["title"]}
    books.append(row); emit("book_created", id=row["id"])
    return jsonify(row), 201


@app.route("/books/<int:item_id>", methods=["GET", "DELETE"])
def book_item(item_id):
    row = by_id(books, item_id)
    if row is None: return jsonify({"error": "not-found"}), 404
    if request.method == "GET": return jsonify(row), 200
    books.remove(row); emit("book_deleted", id=item_id)
    return jsonify({"message": "Book deleted", "booksRemaining": len(books)}), 200


@app.route("/holds", methods=["POST", "GET"])
def holds_collection():
    if request.method == "GET": return jsonify(holds), 200
    value = body()
    valid = value is not None and all(positive_id(value.get(k)) for k in ("id", "userId", "bookId"))
    if not valid: return jsonify({"error": "invalid-hold"}), 400
    if not by_id(users, value["userId"]) or not by_id(books, value["bookId"]):
        return jsonify({"error": "unknown-reference"}), 422
    if by_id(holds, value["id"]): return jsonify({"error": "duplicate-hold"}), 409
    row = {k: value[k] for k in ("id", "userId", "bookId")}
    holds.append(row); emit("hold_created", **row)
    return jsonify(row), 201


@app.delete("/holds/<int:item_id>")
def delete_hold(item_id):
    row = by_id(holds, item_id)
    if row is None: return jsonify({"error": "not-found"}), 404
    holds.remove(row); emit("hold_deleted", id=item_id)
    return jsonify({"message": "Hold deleted"}), 200


@app.route("/loans", methods=["POST", "GET"])
def loans_collection():
    if request.method == "GET": return jsonify(loans), 200
    value = body()
    valid = value is not None and all(positive_id(value.get(k)) for k in ("userId", "bookId"))
    if not valid: return jsonify({"error": "invalid-loan"}), 400
    if not by_id(users, value["userId"]) or not by_id(books, value["bookId"]):
        return jsonify({"error": "unknown-reference"}), 422
    row = {"userId": value["userId"], "bookId": value["bookId"]}
    loans.append(row); emit("loan_created", **row)
    return jsonify(row), 201


@app.delete("/loans/<int:user_id>/<int:book_id>")
def delete_loan(user_id, book_id):
    row = next((r for r in loans if r.get("userId") == user_id and r.get("bookId") == book_id), None)
    if row is None: return jsonify({"error": "not-found"}), 404
    loans.remove(row); emit("loan_deleted", userId=user_id, bookId=book_id)
    return jsonify({"message": "Loan deleted"}), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
