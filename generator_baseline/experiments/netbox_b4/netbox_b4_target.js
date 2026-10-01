//@provengo summon rest
// NetBox B4: fourth isolated hardening checkpoint after frozen B0.
// A_LOGIC and B_LIFECYCLE retain their hardened witnesses from B1/B2.
// C_UNIQUENESS is already V35-compliant at 2 HTTP operations and remains unchanged.
// D_INTEGRITY remains hardened from B3 at 4 HTTP operations.
// Only E changes here: historical E_WORKFLOW (2) is replaced by
// E_REFERENTIAL_INTEGRITY at the V35 minimum of 4 HTTP operations.
// Engineering regression checkpoint only; B4 completes the V35 minimum witness-depth matrix but is not itself the final A2A campaign.
// The runner replaces __TARGET__ and __PORT__ per class-local run.

var target = "__TARGET__";
var svc = new RESTSession("http://127.0.0.1:__PORT__", "netbox-b4", {
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

bthread("B4:" + target, function() {
  if (target === "A_LOGIC") {
    // Retained from B1: V35 minimum witness, exactly 5 HTTP operations.
    post("/api/dcim/sites", {
      id: "b4_site_A1", name: "site-A1", slug: "b4-site-a1", status: "active"
    });
    post("/api/dcim/sites", {
      id: "b4_site_A2", name: "site-A2", slug: "b4-site-a2", status: "active"
    });
    post("/api/dcim/devices", {
      id: "b4_dev_A", name: "device-A", site: { id: "b4_site_A1" }
    });
    patch("/api/dcim/devices/b4_dev_A", { site: { id: "b4_site_A2" } });
    get("/api/dcim/devices/b4_dev_A", 200);
    return;
  }

  if (target === "B_LIFECYCLE") {
    // Retained from B2: V35 minimum witness, exactly 5 HTTP operations.
    post("/api/dcim/sites", {
      id: "b4_site_B", name: "site-B", slug: "b4-site-b", status: "active"
    });
    post("/api/dcim/devices", {
      id: "b4_dev_B1", name: "device-B1", site: { id: "b4_site_B" }
    });
    post("/api/dcim/devices", {
      id: "b4_dev_B2", name: "device-B2", site: { id: "b4_site_B" }
    });
    del("/api/dcim/sites/b4_site_B", 204);
    get("/api/dcim/devices/b4_dev_B1", 200);
    return;
  }

  if (target === "C_UNIQUENESS") {
    // Already identical to the V35 minimum witness: 2 HTTP operations.
    post("/api/dcim/sites", {
      id: "b4_site_C1", name: "site-C1", slug: "b4-same-slug"
    });
    post("/api/dcim/sites", {
      id: "b4_site_C2", name: "site-C2", slug: "b4-same-slug"
    });
    return;
  }

  if (target === "D_INTEGRITY") {
    // B3 hardening: V35 minimum witness, exactly 4 HTTP operations.
    // First update must succeed and be externally verified. A second distinct
    // update then returns 200 but exposes the previously verified value.
    post("/api/circuits/circuits", {
      id: "b4_circuit_D", cid: "B4-CIR-D", description: "initial"
    });
    patch("/api/circuits/circuits/b4_circuit_D", { description: "verified" });
    get("/api/circuits/circuits/b4_circuit_D", 200);
    patch("/api/circuits/circuits/b4_circuit_D", { description: "lost-second-update" });
    return;
  }

  if (target === "E_REFERENTIAL_INTEGRITY") {
    // B4 hardening: V35 minimum witness, exactly 4 HTTP operations.
    // Establish valid parent-child history, delete the parent successfully,
    // then create a new child reusing the deleted parent id. The successful
    // create response itself exposes the dangling reference.
    post("/api/dcim/sites", {
      id: "b4_site_E", name: "site-E", slug: "b4-site-e", status: "active"
    });
    post("/api/dcim/devices", {
      id: "b4_dev_E1", name: "device-E1", site: { id: "b4_site_E" }
    });
    del("/api/dcim/sites/b4_site_E", 204);
    post("/api/dcim/devices", {
      id: "b4_dev_E2", name: "device-E2", site: { id: "b4_site_E" }
    });
    return;
  }

  throw new Error("Unknown B4 target: " + target);
});
