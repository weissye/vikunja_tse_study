//@provengo summon rest
// NetBox B1: first isolated hardening step after the frozen B0 checkpoint.
// Only A_LOGIC changes; B-E retain the B0 witnesses unchanged.
// Engineering regression checkpoint only; NOT the final A2A campaign input.
// The runner replaces __TARGET__ and __PORT__ per class-local run.

var target = "__TARGET__";
var svc = new RESTSession("http://127.0.0.1:__PORT__", "netbox-b1", {
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

bthread("B1:" + target, function() {
  if (target === "A_LOGIC") {
    // B1 hardening: V35 minimum external witness, exactly 5 HTTP operations.
    post("/api/dcim/sites", {
      id: "b1_site_A1", name: "site-A1", slug: "b1-site-a1", status: "active"
    });
    post("/api/dcim/sites", {
      id: "b1_site_A2", name: "site-A2", slug: "b1-site-a2", status: "active"
    });
    post("/api/dcim/devices", {
      id: "b1_dev_A", name: "device-A", site: { id: "b1_site_A1" }
    });
    patch("/api/dcim/devices/b1_dev_A", { site: { id: "b1_site_A2" } });
    get("/api/dcim/devices/b1_dev_A", 200);
    return;
  }

  if (target === "B_LIFECYCLE") {
    // Short historical witness: DELETE reports 404 but the Site remains retrievable.
    post("/api/dcim/sites", {
      id: "b0_site_B", name: "site-B", slug: "b0-site-b"
    });
    del("/api/dcim/sites/b0_site_B", 404);
    get("/api/dcim/sites/b0_site_B", 200);
    return;
  }

  if (target === "C_UNIQUENESS") {
    // Short historical witness: two different Sites with the same slug are accepted.
    post("/api/dcim/sites", {
      id: "b0_site_C1", name: "site-C1", slug: "b0-same-slug"
    });
    post("/api/dcim/sites", {
      id: "b0_site_C2", name: "site-C2", slug: "b0-same-slug"
    });
    return;
  }

  if (target === "D_INTEGRITY") {
    // Short historical witness: Circuit status update is acknowledged but discarded.
    post("/api/circuits/circuits", {
      id: "b0_circuit_D", cid: "B0-CIR-D", status: "planned"
    });
    patch("/api/circuits/circuits/b0_circuit_D", { status: "active" });
    get("/api/circuits/circuits/b0_circuit_D", 200);
    return;
  }

  if (target === "E_WORKFLOW") {
    // Short historical witness: direct draft -> archived transition is accepted.
    post("/api/dcim/devices", {
      id: "b0_dev_E", name: "device-E", status: "draft"
    });
    patch("/api/dcim/devices/b0_dev_E", { status: "archived" });
    return;
  }

  throw new Error("Unknown B1 target: " + target);
});
