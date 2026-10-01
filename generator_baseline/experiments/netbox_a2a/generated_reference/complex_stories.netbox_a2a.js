// Auto-generated V34 deep structural scenarios from OpenAPI only.
// Literal-key callbacks preserve server-assigned identifiers at runtime.
// Runtime consumers use literal @{...} expressions directly in REST event fields.
// No evaluator, seeded-fault manifest, SUT source, or analyst trigger is read.
//@provengo summon rtv
//@provengo summon rest

// V34_FAMILY family=duplicate_required_string steps=2
bthread("auto:duplicate-required-string:Site:name", function() {
  svc.post("/api/dcim/sites/", { body: "{\"name\":\"v34_shared_site_name\",\"slug\":\"v34_dup1_site_name_slug\",\"status\":\"v34_dup1_site_name_status\",\"description\":\"v34_dup1_site_name_description\"}", expectedResponseCodes: [201] });
  svc.post("/api/dcim/sites/", { body: "{\"name\":\"v34_shared_site_name\",\"slug\":\"v34_dup2_site_name_slug\",\"status\":\"v34_dup2_site_name_status\",\"description\":\"v34_dup2_site_name_description\"}", expectedResponseCodes: [201] });
});

// V34_FAMILY family=duplicate_required_string steps=2
bthread("auto:duplicate-required-string:Site:slug", function() {
  svc.post("/api/dcim/sites/", { body: "{\"name\":\"v34_dup1_site_slug_name\",\"slug\":\"v34_shared_site_slug\",\"status\":\"v34_dup1_site_slug_status\",\"description\":\"v34_dup1_site_slug_description\"}", expectedResponseCodes: [201] });
  svc.post("/api/dcim/sites/", { body: "{\"name\":\"v34_dup2_site_slug_name\",\"slug\":\"v34_shared_site_slug\",\"status\":\"v34_dup2_site_slug_status\",\"description\":\"v34_dup2_site_slug_description\"}", expectedResponseCodes: [201] });
});

// V34_FAMILY family=duplicate_required_string steps=2
bthread("auto:duplicate-required-string:Circuit:cid", function() {
  svc.post("/api/circuits/circuits/", { body: "{\"cid\":\"v34_shared_circuit_cid\",\"status\":\"v34_dup1_circuit_cid_status\",\"description\":\"v34_dup1_circuit_cid_description\"}", expectedResponseCodes: [201] });
  svc.post("/api/circuits/circuits/", { body: "{\"cid\":\"v34_shared_circuit_cid\",\"status\":\"v34_dup2_circuit_cid_status\",\"description\":\"v34_dup2_circuit_cid_description\"}", expectedResponseCodes: [201] });
});

// V34_FAMILY family=scalar_second_update steps=5
bthread("auto:scalar-second-update:Circuit:description", function() {
  svc.post("/api/circuits/circuits/", { body: "{\"cid\":\"v34_scalar_circuit_description_cid\",\"status\":\"v34_scalar_circuit_description_status\",\"description\":\"v34_x_circuit_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_scalar_circuit_description_id", __p["id"]); } } });
  svc.patch("/api/circuits/circuits/@{v34_scalar_circuit_description_id}/", { body: "{\"description\":\"v34_y_circuit_description\"}", expectedResponseCodes: [200,404] });
  svc.get("/api/circuits/circuits/@{v34_scalar_circuit_description_id}/", { expectedResponseCodes: [200,404] });
  svc.patch("/api/circuits/circuits/@{v34_scalar_circuit_description_id}/", { body: "{\"description\":\"v34_z_circuit_description\"}", expectedResponseCodes: [200,404] });
  svc.get("/api/circuits/circuits/@{v34_scalar_circuit_description_id}/", { expectedResponseCodes: [200,404] });
});

// V34_FAMILY family=relation_second_reassignment steps=8
bthread("auto:relation-second-reassignment:Site->Device:site", function() {
  svc.post("/api/dcim/sites/", { body: "{\"name\":\"v34_rel_p1_site_name\",\"slug\":\"v34_rel_p1_site_slug\",\"status\":\"v34_rel_p1_site_status\",\"description\":\"v34_rel_p1_site_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_rel_site_device_site_p1_id", __p["id"]); } } });
  svc.post("/api/dcim/sites/", { body: "{\"name\":\"v34_rel_p2_site_name\",\"slug\":\"v34_rel_p2_site_slug\",\"status\":\"v34_rel_p2_site_status\",\"description\":\"v34_rel_p2_site_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_rel_site_device_site_p2_id", __p["id"]); } } });
  svc.post("/api/dcim/sites/", { body: "{\"name\":\"v34_rel_p3_site_name\",\"slug\":\"v34_rel_p3_site_slug\",\"status\":\"v34_rel_p3_site_status\",\"description\":\"v34_rel_p3_site_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_rel_site_device_site_p3_id", __p["id"]); } } });
  svc.post("/api/dcim/devices/", { body: "{\"name\":\"v34_rel_child_device_name\",\"site\":{\"id\":\"@{v34_rel_site_device_site_p1_id}\"},\"status\":\"v34_rel_child_device_status\",\"description\":\"v34_rel_child_device_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_rel_site_device_site_child_id", __p["id"]); } } });
  svc.patch("/api/dcim/devices/@{v34_rel_site_device_site_child_id}/", { body: "{\"site\":{\"id\":\"@{v34_rel_site_device_site_p2_id}\"}}", expectedResponseCodes: [200,404] });
  svc.get("/api/dcim/devices/@{v34_rel_site_device_site_child_id}/", { expectedResponseCodes: [200,404] });
  svc.patch("/api/dcim/devices/@{v34_rel_site_device_site_child_id}/", { body: "{\"site\":{\"id\":\"@{v34_rel_site_device_site_p3_id}\"}}", expectedResponseCodes: [200,404] });
  svc.get("/api/dcim/devices/@{v34_rel_site_device_site_child_id}/", { expectedResponseCodes: [200,404] });
});

// V34_FAMILY family=parent_delete_multiple_children steps=6
bthread("auto:parent-delete-multiple-children:Site->Device", function() {
  svc.post("/api/dcim/sites/", { body: "{\"name\":\"v34_multi_parent_site_name\",\"slug\":\"v34_multi_parent_site_slug\",\"status\":\"v34_multi_parent_site_status\",\"description\":\"v34_multi_parent_site_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_multi_site_device_parent_id", __p["id"]); } } });
  svc.post("/api/dcim/devices/", { body: "{\"name\":\"v34_multi_c1_device_name\",\"site\":{\"id\":\"@{v34_multi_site_device_parent_id}\"},\"status\":\"v34_multi_c1_device_status\",\"description\":\"v34_multi_c1_device_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_multi_site_device_child1_id", __p["id"]); } } });
  svc.post("/api/dcim/devices/", { body: "{\"name\":\"v34_multi_c2_device_name\",\"site\":{\"id\":\"@{v34_multi_site_device_parent_id}\"},\"status\":\"v34_multi_c2_device_status\",\"description\":\"v34_multi_c2_device_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_multi_site_device_child2_id", __p["id"]); } } });
  svc.delete("/api/dcim/sites/@{v34_multi_site_device_parent_id}/", { expectedResponseCodes: [204,404] });
  svc.get("/api/dcim/devices/@{v34_multi_site_device_child1_id}/", { expectedResponseCodes: [200,404] });
  svc.get("/api/dcim/devices/@{v34_multi_site_device_child2_id}/", { expectedResponseCodes: [200,404] });
});

// V34_FAMILY family=deleted_parent_reference_reuse steps=5
bthread("auto:deleted-parent-reference-reuse:Site->Device", function() {
  svc.post("/api/dcim/sites/", { body: "{\"name\":\"v34_reuse_parent_site_name\",\"slug\":\"v34_reuse_parent_site_slug\",\"status\":\"v34_reuse_parent_site_status\",\"description\":\"v34_reuse_parent_site_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_reuse_site_device_parent_id", __p["id"]); } } });
  svc.post("/api/dcim/devices/", { body: "{\"name\":\"v34_reuse_old_device_name\",\"site\":{\"id\":\"@{v34_reuse_site_device_parent_id}\"},\"status\":\"v34_reuse_old_device_status\",\"description\":\"v34_reuse_old_device_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_reuse_site_device_old_child_id", __p["id"]); } } });
  svc.delete("/api/dcim/sites/@{v34_reuse_site_device_parent_id}/", { expectedResponseCodes: [204,404] });
  svc.post("/api/dcim/devices/", { body: "{\"name\":\"v34_reuse_new_device_name\",\"site\":{\"id\":\"@{v34_reuse_site_device_parent_id}\"},\"status\":\"v34_reuse_new_device_status\",\"description\":\"v34_reuse_new_device_description\"}", expectedResponseCodes: [201], callback: function(response) { var __p = null; try { __p = JSON.parse(response.body); } catch (e) {} if (__p && __p["id"] !== undefined) { pvg.rtv.set("v34_reuse_site_device_new_child_id", __p["id"]); } } });
  svc.get("/api/dcim/devices/@{v34_reuse_site_device_new_child_id}/", { expectedResponseCodes: [200,404] });
});
