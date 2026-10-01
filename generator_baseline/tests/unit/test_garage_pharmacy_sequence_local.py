import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def load(name, relative):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def event(method, path, status, body=None, response=None):
    return {"method": method, "path": path, "status": status, "body": body, "response": response}


def test_garage_classes_require_one_complete_sequence():
    m = load("evaluate_gp", "scripts/evaluate_garage_pharmacy_sequences.py")
    orders = [
        event("POST", "/repair-orders", 201,
              {"roId": rid},
              {"roId": rid, "carVin": "VIN-1", "customerId": "C-1",
               "garageId": garage, "status": "open"})
        for rid, garage in (("R1", "G1"), ("R2", "G1"), ("R3", "G1"), ("R4", "G2"))
    ]
    result = m.garage_sequence(orders)
    assert result["confirmed_classes"] == ["GARAGE_OVERFLOW", "TELEPORTING_CAR"]

    assert "GARAGE_OVERFLOW" not in m.garage_sequence(orders[:2])["confirmed_classes"]
    assert "GARAGE_OVERFLOW" not in m.garage_sequence(orders[2:])["confirmed_classes"]
    assert m.garage_sequence([orders[0]])["semantic_score"] == "0/2"
    assert m.garage_sequence([orders[3]])["semantic_score"] == "0/2"


def test_garage_seed_snapshot_is_part_of_fresh_sut_state():
    m = load("evaluate_gp", "scripts/evaluate_garage_pharmacy_sequences.py")
    snapshot = event("GET", "/repair-orders", 200, None, [{
        "roId": "SEED", "carVin": "VIN-1", "customerId": "C-1",
        "garageId": "G1", "status": "open",
    }])
    created = event("POST", "/repair-orders", 201, {"roId": "R2"}, {
        "roId": "R2", "carVin": "VIN-1", "customerId": "C-1",
        "garageId": "G2", "status": "open",
    })
    assert m.garage_sequence([snapshot, created])["confirmed_classes"] == ["TELEPORTING_CAR"]


def test_pharmacy_classes_require_legal_same_rx_prefixes():
    m = load("evaluate_gp", "scripts/evaluate_garage_pharmacy_sequences.py")
    events = [
        event("POST", "/prescriptions", 201,
              {"id": "RX1", "refillsLeft": 1}, {"id": "RX1", "refillsLeft": 1}),
        event("POST", "/dispense", 201, {"rxId": "RX1"}, {"remaining": 0}),
        event("POST", "/dispense", 500, {"rxId": "RX1"},
              {"error": "SEMANTIC INVARIANT P1: exceeded"}),
        event("POST", "/stores", 201, {"storeId": "S1"}, {"storeId": "S1"}),
        event("POST", "/stores", 201, {"storeId": "S2"}, {"storeId": "S2"}),
        event("POST", "/process-rx", 201, {"rxId": "RX1", "storeId": "S1"}, {"status": "processed"}),
        event("POST", "/process-rx", 500, {"rxId": "RX1", "storeId": "S2"},
              {"error": "SEMANTIC INVARIANT P2: moved"}),
    ]
    result = m.pharmacy_sequence(events)
    assert result["confirmed_classes"] == ["P1_REFILL_UNDERFLOW", "P2_DOUBLE_PROCESS"]
    assert m.pharmacy_sequence([events[2], events[6]])["semantic_score"] == "0/2"


def test_restler_candidate_filters_are_conservative():
    m = load("prepare_gp", "scripts/prepare_garage_pharmacy_sequence_traces.py")
    garage = [
        {"method": "POST", "path": "/repair-orders"},
        {"method": "POST", "path": "/repair-orders"},
    ]
    assert m.is_candidate("garage", garage)
    assert m.is_candidate("garage", garage[:1])

    p1 = [
        {"method": "POST", "path": "/prescriptions"},
        {"method": "POST", "path": "/dispense"},
    ]
    p2 = [
        {"method": "POST", "path": "/prescriptions"},
        {"method": "POST", "path": "/stores"},
        {"method": "POST", "path": "/stores"},
        {"method": "POST", "path": "/process-rx"},
        {"method": "POST", "path": "/process-rx"},
    ]
    assert m.is_candidate("pharmacy", p1)
    assert m.is_candidate("pharmacy", p2)
