//@provengo summon rest
// NetBox B3: third isolated hardening checkpoint after frozen B0.
// A_LOGIC and B_LIFECYCLE retain their hardened witnesses from B1/B2.
// C_UNIQUENESS is already V35-compliant at 2 HTTP operations and remains unchanged.
// Only D_INTEGRITY changes in this checkpoint: 3 -> 4 HTTP operations.
// E_WORKFLOW remains at the B0 witness.
// Engineering regression checkpoint only; NOT the final A2A campaign input.
// The runner replaces __TARGET__ and __PORT__ per class-local run.

var target = "__TARGET__";
var svc = new RESTSession("http://127.0.0.1:__PORT__", "netbox-b3", {
  headers: { "Content-Type": "application/json" }
});

function post(path, body) {
  svc.post(path, { body: JSON.stringify(body), expectedResponseCodes: [201] });
}
function patch(path, body) {
  svc.patch(path, { body: JSON.stringify(body), expectedResponseCodes: [200] });
}
function get(path, expected) {
  svc.get(path, { expectedResponseCodes: [expected] });
}
function del(path, expected) {
  svc.delete(path, { expectedResponseCodes: [expected] });
}

bthread("B3:" + target, function() {
  if (target === "A_LOGIC") {
    // Retained from B1: V35 minimum witness, exactly 5 HTTP operations.
    post("/api/dcim/sites", {
      id: "b3_site_A1", name: "site-A1", slug: "b3-site-a1", status: "active"
    });
    post("/api/dcim/sites", {
      id: "b3_site_A2", name: "site-A2", slug: "b3-site-a2", status: "active"
    });
    post("/api/dcim/devices", {
      id: "b3_dev_A", name: "device-A", site: { id: "b3_site_A1" }
    });
    patch("/api/dcim/devices/b3_dev_A", { site: { id: "b3_site_A2" } });
    get("/api/dcim/devices/b3_dev_A", 200);
    return;
  }

  if (target === "B_LIFECYCLE") {
    // Retained from B2: V35 minimum witness, exactly 5 HTTP operations.
    post("/api/dcim/sites", {
      id: "b3_site_B", name: "site-B", slug: "b3-site-b", status: "active"
    });
    post("/api/dcim/devices", {
      id: "b3_dev_B1", name: "device-B1", site: { id: "b3_site_B" }
    });
    post("/api/dcim/devices", {
      id: "b3_dev_B2", name: "device-B2", site: { id: "b3_site_B" }
    });
    del("/api/dcim/sites/b3_site_B", 204);
    get("/api/dcim/devices/b3_dev_B1", 200);
    return;
  }

  if (target === "C_UNIQUENESS") {
    // Already identical to the V35 minimum witness: 2 HTTP operations.
    post("/api/dcim/sites", {
      id: "b3_site_C1", name: "site-C1", slug: "b3-same-slug"
    });
    post("/api/dcim/sites", {
      id: "b3_site_C2", name: "site-C2", slug: "b3-same-slug"
    });
    return;
  }

  if (target === "D_INTEGRITY") {
    // B3 hardening: V35 minimum witness, exactly 4 HTTP operations.
    // First update must succeed and be externally verified. A second distinct
    // update then returns 200 but exposes the previously verified value.
    post("/api/circuits/circuits", {
      id: "b3_circuit_D", cid: "B3-CIR-D", description: "initial"
    });
    patch("/api/circuits/circuits/b3_circuit_D", { description: "verified" });
    get("/api/circuits/circuits/b3_circuit_D", 200);
    patch("/api/circuits/circuits/b3_circuit_D", { description: "lost-second-update" });
    return;
  }

  if (target === "E_WORKFLOW") {
    // Historical B0 witness retained for this checkpoint.
    post("/api/dcim/devices", {
      id: "b3_dev_E", name: "device-E", status: "draft"
    });
    patch("/api/dcim/devices/b3_dev_E", { status: "archived" });
    return;
  }

  throw new Error("Unknown B3 target: " + target);
});
