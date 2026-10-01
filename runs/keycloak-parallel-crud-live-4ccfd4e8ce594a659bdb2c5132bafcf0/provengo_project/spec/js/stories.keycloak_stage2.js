// Generated symbolic concurrent CRUD. Callback data is runtime-only.
// @provengo summon rest
// @provengo summon rtv
const SBT_POOL = {}; const SBT_FINISHED = {};
bthread("parallel-crud:state", function(){ while(true){
let e=sync({waitFor:EventSet("CRUD state",function(x){return x.name==="SBT:InstanceReady" || x.name==="SBT:WorkerFinished";})});
let k=e.data.process+":"+e.data.entity;
if(e.name==="SBT:InstanceReady") { if(!SBT_POOL[k]) SBT_POOL[k]=[]; SBT_POOL[k].push({owner:e.data.owner,values:e.data.values}); }
else { if(!SBT_FINISHED[k]) SBT_FINISHED[k]={}; SBT_FINISHED[k][e.data.owner]=true; if(SBT_POOL[k]) SBT_POOL[k]=SBT_POOL[k].filter(function(v){return v.owner!==e.data.owner;}); }
} });
bthread("verify:P1:admin/realms:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms:1",function(e){return e.data && e.data.owner==="P1:admin/realms:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["displayName"] !== "displayName_58543") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms",owner:"P1:admin/realms:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms:1",process:1,entity:"admin/realms",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms:1" && e.data.stage===stage;})}); }
__args.realm="realm_41005";
svc.post("/admin/realms",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({realm:__args.realm,enabled: true}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms" + ":" + response.code); return; } pvg.success("contract response verified"); }});
svc.get("/admin/realms/" + __args["realm"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms",owner:"P1:admin/realms:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["displayName"]="displayName_58543"; pvg.rtv.set("sbt_P1_admin_realms_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
while(!SBT_FINISHED["1:admin/realms/{realm}/authentication/config"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/config"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/authentication/config";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/authentication/executions";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/authentication/executions/{executionId}/config"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions/{executionId}/config"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/authentication/executions/{executionId}/config";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/authentication/flows"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/flows"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/authentication/flows";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/client-scopes"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-scopes"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/client-scopes";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/client-templates"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-templates"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/client-templates";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/clients"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/roles"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/roles"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients/{client-uuid}/roles";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/components"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/components"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/components";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/groups"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/groups"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/groups";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/identity-provider/instances";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/identity-provider/instances/{alias}/mappers";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/organizations"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/groups"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/groups"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations/{org-id}/groups";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations/{org-id}/identity-providers";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations/{org-id}/members";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/roles"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/roles"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/roles";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/users"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/users"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/users";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/workflows"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/workflows"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/workflows";})});
}
svc.delete("/admin/realms/" + __args["realm"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/authentication/config:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/authentication/config:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/authentication/config:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/authentication/config/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/config/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/authentication/config/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/config/{id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["alias"] !== "alias_91376") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/authentication/config:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/authentication/config:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/authentication/config",owner:"P1:admin/realms/{realm}/authentication/config:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/authentication/config:1",process:1,entity:"admin/realms/{realm}/authentication/config",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/authentication/config:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/authentication/config:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/authentication/config:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/authentication/config:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["alias"]="alias_30036";
svc.post("/admin/realms/" + __args["realm"] + "/authentication/config",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"alias":__args["alias"],"config":__args["config"],"id":__args["id"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/authentication/config" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["id"] === undefined ? obj.id : obj["id"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__authentication_config_1_id", value); pvg.success("contract response verified"); }});
__args["id"]="@{sbt_P1_admin_realms__realm__authentication_config_1_id}";
svc.get("/admin/realms/" + __args["realm"] + "/authentication/config/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/config/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/authentication/config",owner:"P1:admin/realms/{realm}/authentication/config:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/authentication/config/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/config/{id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__authentication_config_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["alias"]="alias_91376"; pvg.rtv.set("sbt_P1_admin_realms__realm__authentication_config_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/authentication/config/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__authentication_config_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/authentication/config/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/authentication/config/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/authentication/config/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/authentication/flows:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/authentication/flows:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/authentication/flows:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/authentication/flows/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/flows/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/authentication/flows/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/flows/{id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["description"] !== "description_66757") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/authentication/flows:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/authentication/flows:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/authentication/flows",owner:"P1:admin/realms/{realm}/authentication/flows:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/authentication/flows:1",process:1,entity:"admin/realms/{realm}/authentication/flows",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/authentication/flows:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/authentication/flows:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/authentication/flows:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/authentication/flows:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["alias"]="alias_17059";
svc.post("/admin/realms/" + __args["realm"] + "/authentication/flows",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"alias":__args["alias"],"authenticationExecutions":__args["authenticationExecutions"],"builtIn":__args["builtIn"],"description":__args["description"],"id":__args["id"],"providerId":__args["providerId"],"topLevel":__args["topLevel"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/authentication/flows" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["id"] === undefined ? obj.id : obj["id"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__authentication_flows_1_id", value); pvg.success("contract response verified"); }});
__args["id"]="@{sbt_P1_admin_realms__realm__authentication_flows_1_id}";
svc.get("/admin/realms/" + __args["realm"] + "/authentication/flows/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/flows/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/authentication/flows",owner:"P1:admin/realms/{realm}/authentication/flows:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/authentication/flows/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/flows/{id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__authentication_flows_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["description"]="description_66757"; pvg.rtv.set("sbt_P1_admin_realms__realm__authentication_flows_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/authentication/flows/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__authentication_flows_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/authentication/flows/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
while(!SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/authentication/flows:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/authentication/executions";})});
}
svc.delete("/admin/realms/" + __args["realm"] + "/authentication/flows/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/authentication/flows/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/client-scopes:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/client-scopes:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/client-scopes:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/client-scopes/" + step.data.values["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-scopes/{client-scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/client-scopes/" + step.data.values["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-scopes/{client-scope-id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["description"] !== "description_54234") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/client-scopes:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/client-scopes:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/client-scopes",owner:"P1:admin/realms/{realm}/client-scopes:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/client-scopes:1",process:1,entity:"admin/realms/{realm}/client-scopes",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/client-scopes:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/client-scopes:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/client-scopes:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/client-scopes:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["name"]="name_67026";
svc.post("/admin/realms/" + __args["realm"] + "/client-scopes",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"attributes":__args["attributes"],"description":__args["description"],"id":__args["id"],"name":__args["name"],"protocol":__args["protocol"],"protocolMappers":__args["protocolMappers"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/client-scopes" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["clientScopeId"] === undefined ? obj.id : obj["clientScopeId"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__client_scopes_1_clientScopeId", value); pvg.success("contract response verified"); }});
__args["clientScopeId"]="@{sbt_P1_admin_realms__realm__client_scopes_1_clientScopeId}";
svc.get("/admin/realms/" + __args["realm"] + "/client-scopes/" + __args["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-scopes/{client-scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/client-scopes",owner:"P1:admin/realms/{realm}/client-scopes:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/client-scopes/" + __args["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-scopes/{client-scope-id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__client_scopes_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["description"]="description_54234"; pvg.rtv.set("sbt_P1_admin_realms__realm__client_scopes_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/client-scopes/" + __args["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__client_scopes_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/client-scopes/{client-scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
while(!SBT_FINISHED["1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/client-scopes:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/client-templates"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-templates"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/client-scopes:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/client-templates";})});
}
svc.delete("/admin/realms/" + __args["realm"] + "/client-scopes/" + __args["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/client-scopes/{client-scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/clients:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/clients:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/clients:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["description"] !== "description_70277") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/clients:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/clients:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/clients",owner:"P1:admin/realms/{realm}/clients:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/clients:1",process:1,entity:"admin/realms/{realm}/clients",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/clients:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/clients:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/clients:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/clients:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["clientId"]="clientId_54596";
__args["name"]="name_98395";
svc.post("/admin/realms/" + __args["realm"] + "/clients",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"access":__args["access"],"adminUrl":__args["adminUrl"],"alwaysDisplayInConsole":__args["alwaysDisplayInConsole"],"attributes":__args["attributes"],"authenticationFlowBindingOverrides":__args["authenticationFlowBindingOverrides"],"authorizationServicesEnabled":__args["authorizationServicesEnabled"],"authorizationSettings":__args["authorizationSettings"],"baseUrl":__args["baseUrl"],"bearerOnly":__args["bearerOnly"],"clientAuthenticatorType":__args["clientAuthenticatorType"],"clientId":__args["clientId"],"clientTemplate":__args["clientTemplate"],"consentRequired":__args["consentRequired"],"defaultClientScopes":__args["defaultClientScopes"],"defaultRoles":__args["defaultRoles"],"description":__args["description"],"directAccessGrantsEnabled":__args["directAccessGrantsEnabled"],"directGrantsOnly":__args["directGrantsOnly"],"enabled":__args["enabled"],"frontchannelLogout":__args["frontchannelLogout"],"fullScopeAllowed":__args["fullScopeAllowed"],"id":__args["id"],"implicitFlowEnabled":__args["implicitFlowEnabled"],"name":__args["name"],"nodeReRegistrationTimeout":__args["nodeReRegistrationTimeout"],"notBefore":__args["notBefore"],"optionalClientScopes":__args["optionalClientScopes"],"origin":__args["origin"],"protocol":__args["protocol"],"protocolMappers":__args["protocolMappers"],"publicClient":__args["publicClient"],"redirectUris":__args["redirectUris"],"registeredNodes":__args["registeredNodes"],"registrationAccessToken":__args["registrationAccessToken"],"rootUrl":__args["rootUrl"],"secret":__args["secret"],"serviceAccountsEnabled":__args["serviceAccountsEnabled"],"standardFlowEnabled":__args["standardFlowEnabled"],"surrogateAuthRequired":__args["surrogateAuthRequired"],"type":__args["type"],"useTemplateConfig":__args["useTemplateConfig"],"useTemplateMappers":__args["useTemplateMappers"],"useTemplateScope":__args["useTemplateScope"],"webOrigins":__args["webOrigins"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/clients" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["clientUuid"] === undefined ? obj.id : obj["clientUuid"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__clients_1_clientUuid", value); pvg.success("contract response verified"); }});
__args["clientUuid"]="@{sbt_P1_admin_realms__realm__clients_1_clientUuid}";
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/clients",owner:"P1:admin/realms/{realm}/clients:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__clients_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["description"]="description_70277"; pvg.rtv.set("sbt_P1_admin_realms__realm__clients_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__clients_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/clients/{client-uuid}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
while(!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/clients:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/clients:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/clients:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/roles"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/roles"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/clients:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients/{client-uuid}/roles";})});
}
svc.delete("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/clients/{client-uuid}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/components:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/components:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/components:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/components/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/components/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/components/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/components/{id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["name"] !== "name_90248") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/components:1",stage:stage,ok:true})});
}
});
bthread("verify-lookup:P1:admin/realms/{realm}/components:1", function(){
let step=sync({waitFor:EventSet("lookup-or-finish:P1:admin/realms/{realm}/components:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/components:1" && ((e.name==="SBT:CrudStep" && e.data.stage==="lookup") || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:CrudStep") sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/components:1",stage:"lookup",ok:true})});
});
bthread("crud:P1:admin/realms/{realm}/components:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/components",owner:"P1:admin/realms/{realm}/components:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/components:1",process:1,entity:"admin/realms/{realm}/components",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/components:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/components:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/components:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/components:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["name"]="name_28624";
svc.post("/admin/realms/" + __args["realm"] + "/components",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],body:JSON.stringify({"config":__args["config"],"id":__args["id"],"name":__args["name"],"parentId":__args["parentId"],"providerId":__args["providerId"],"providerType":__args["providerType"],"subType":__args["subType"]}),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/components" + ":" + response.code); return; } pvg.success("contract response verified"); }});
rtv.doStore("sbt_P1_admin_realms__realm__components_1_lookup_name",__args["name"]);
svc.get("/admin/realms/" + __args["realm"] + "/components",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};q["name"]=__args["name"];if(__args["parent"]!==undefined && __args["parent"]!==null) q["parent"]=__args["parent"];if(__args["providerId"]!==undefined && __args["providerId"]!==null) q["providerId"]=__args["providerId"];if(__args["type"]!==undefined && __args["type"]!==null) q["type"]=__args["type"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/components" + ":" + response.code); return; } var items; try { items = JSON.parse(response.body); } catch(err) { pvg.fail("lookup JSON invalid"); return; } if (!Array.isArray(items)) { pvg.fail("lookup is not an array"); return; } var matches = items.filter(function(item){ return item && item["name"] === pvg.rtv.get("sbt_P1_admin_realms__realm__components_1_lookup_name"); }); if (matches.length !== 1 || !matches[0].id) { pvg.fail("exact lookup missing or ambiguous"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__components_1_id", matches[0].id); pvg.success("contract response verified"); }});
verified("lookup");
__args["id"]="@{sbt_P1_admin_realms__realm__components_1_id}";
svc.get("/admin/realms/" + __args["realm"] + "/components/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/components/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/components",owner:"P1:admin/realms/{realm}/components:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/components/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/components/{id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__components_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["name"]="name_90248"; pvg.rtv.set("sbt_P1_admin_realms__realm__components_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/components/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],body:"@{sbt_P1_admin_realms__realm__components_1_update_body}",callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/components/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/components/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/components/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/groups:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/groups:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/groups:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/groups/" + step.data.values["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/groups/{group-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/groups/" + step.data.values["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/groups/{group-id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["description"] !== "description_96377") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/groups:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/groups:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/groups",owner:"P1:admin/realms/{realm}/groups:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/groups:1",process:1,entity:"admin/realms/{realm}/groups",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/groups:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/groups:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/groups:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/groups:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["name"]="name_69992";
svc.post("/admin/realms/" + __args["realm"] + "/groups",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201, 204],body:JSON.stringify({"access":__args["access"],"attributes":__args["attributes"],"clientRoles":__args["clientRoles"],"description":__args["description"],"id":__args["id"],"name":__args["name"],"parentId":__args["parentId"],"path":__args["path"],"realmRoles":__args["realmRoles"],"subGroupCount":__args["subGroupCount"],"subGroups":__args["subGroups"]}),callback:function(response) { if ([201, 204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/groups" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["groupId"] === undefined ? obj.id : obj["groupId"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__groups_1_groupId", value); pvg.success("contract response verified"); }});
__args["groupId"]="@{sbt_P1_admin_realms__realm__groups_1_groupId}";
svc.get("/admin/realms/" + __args["realm"] + "/groups/" + __args["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/groups/{group-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/groups",owner:"P1:admin/realms/{realm}/groups:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/groups/" + __args["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/groups/{group-id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__groups_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["description"]="description_96377"; pvg.rtv.set("sbt_P1_admin_realms__realm__groups_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/groups/" + __args["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__groups_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/groups/{group-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/groups/" + __args["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/groups/{group-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/identity-provider/instances:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/identity-provider/instances:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/identity-provider/instances:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/identity-provider/instances/" + step.data.values["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/identity-provider/instances/{alias}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/identity-provider/instances/" + step.data.values["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/identity-provider/instances/{alias}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["displayName"] !== "displayName_70623") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/identity-provider/instances:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/identity-provider/instances:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/identity-provider/instances",owner:"P1:admin/realms/{realm}/identity-provider/instances:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/identity-provider/instances:1",process:1,entity:"admin/realms/{realm}/identity-provider/instances",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/identity-provider/instances:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/identity-provider/instances:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/identity-provider/instances:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/identity-provider/instances:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["alias"]="alias_33322";
svc.post("/admin/realms/" + __args["realm"] + "/identity-provider/instances",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"addReadTokenRoleOnCreate":__args["addReadTokenRoleOnCreate"],"alias":__args["alias"],"authenticateByDefault":__args["authenticateByDefault"],"config":__args["config"],"displayName":__args["displayName"],"enabled":__args["enabled"],"firstBrokerLoginFlowAlias":__args["firstBrokerLoginFlowAlias"],"hideOnLogin":__args["hideOnLogin"],"internalId":__args["internalId"],"linkOnly":__args["linkOnly"],"organizationId":__args["organizationId"],"postBrokerLoginFlowAlias":__args["postBrokerLoginFlowAlias"],"providerId":__args["providerId"],"storeToken":__args["storeToken"],"trustEmail":__args["trustEmail"],"types":__args["types"],"updateProfileFirstLogin":__args["updateProfileFirstLogin"],"updateProfileFirstLoginMode":__args["updateProfileFirstLoginMode"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/identity-provider/instances" + ":" + response.code); return; } pvg.success("contract response verified"); }});
svc.get("/admin/realms/" + __args["realm"] + "/identity-provider/instances/" + __args["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/identity-provider/instances/{alias}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/identity-provider/instances",owner:"P1:admin/realms/{realm}/identity-provider/instances:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/identity-provider/instances/" + __args["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/identity-provider/instances/{alias}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__identity_provider_instances_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["displayName"]="displayName_70623"; pvg.rtv.set("sbt_P1_admin_realms__realm__identity_provider_instances_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/identity-provider/instances/" + __args["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__identity_provider_instances_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/identity-provider/instances/{alias}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
while(!SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/identity-provider/instances:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/identity-provider/instances/{alias}/mappers";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/identity-provider/instances:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations/{org-id}/identity-providers";})});
}
svc.delete("/admin/realms/" + __args["realm"] + "/identity-provider/instances/" + __args["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/identity-provider/instances/{alias}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/organizations:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/organizations:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/organizations:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/organizations/" + step.data.values["orgId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/organizations/" + step.data.values["orgId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["description"] !== "description_456") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/organizations:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/organizations:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/organizations",owner:"P1:admin/realms/{realm}/organizations:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/organizations:1",process:1,entity:"admin/realms/{realm}/organizations",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/organizations:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/organizations:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/organizations:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/organizations:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["name"]="name_51751";
__args["alias"]="alias_16964";
svc.post("/admin/realms/" + __args["realm"] + "/organizations",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"alias":__args["alias"],"attributes":__args["attributes"],"description":__args["description"],"domains":__args["domains"],"enabled":__args["enabled"],"groups":__args["groups"],"id":__args["id"],"identityProviders":__args["identityProviders"],"members":__args["members"],"name":__args["name"],"redirectUrl":__args["redirectUrl"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/organizations" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["orgId"] === undefined ? obj.id : obj["orgId"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__organizations_1_orgId", value); pvg.success("contract response verified"); }});
__args["orgId"]="@{sbt_P1_admin_realms__realm__organizations_1_orgId}";
svc.get("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/organizations",owner:"P1:admin/realms/{realm}/organizations:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__organizations_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["description"]="description_456"; pvg.rtv.set("sbt_P1_admin_realms__realm__organizations_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__organizations_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/organizations/{org-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
while(!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/groups"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/groups"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/organizations:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations/{org-id}/groups";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/organizations:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations/{org-id}/identity-providers";})});
}
while(!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/organizations:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations/{org-id}/members";})});
}
svc.delete("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/organizations/{org-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/roles:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/roles:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/roles:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/roles/" + step.data.values["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/roles/{role-name}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/roles/" + step.data.values["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/roles/{role-name}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["description"] !== "description_58615") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
if(stage==="delete") svc.get("/admin/realms/" + step.data.values["realm"] + "/roles/" + step.data.values["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[404],callback:function(response) { if ([404].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/roles/{role-name}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/roles:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/roles:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/roles",owner:"P1:admin/realms/{realm}/roles:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/roles:1",process:1,entity:"admin/realms/{realm}/roles",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/roles:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/roles:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/roles:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/roles:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["name"]="name_17363";
svc.post("/admin/realms/" + __args["realm"] + "/roles",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"attributes":__args["attributes"],"clientRole":__args["clientRole"],"composite":__args["composite"],"composites":__args["composites"],"containerId":__args["containerId"],"description":__args["description"],"id":__args["id"],"name":__args["name"],"scopeParamRequired":__args["scopeParamRequired"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/roles" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["roleName"] === undefined ? obj.id : obj["roleName"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__roles_1_roleName", value); pvg.success("contract response verified"); }});
__args["roleName"]="@{sbt_P1_admin_realms__realm__roles_1_roleName}";
svc.get("/admin/realms/" + __args["realm"] + "/roles/" + __args["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/roles/{role-name}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/roles",owner:"P1:admin/realms/{realm}/roles:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/roles/" + __args["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/roles/{role-name}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__roles_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["description"]="description_58615"; pvg.rtv.set("sbt_P1_admin_realms__realm__roles_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/roles/" + __args["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__roles_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/roles/{role-name}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/roles/" + __args["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/roles/{role-name}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/users:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/users:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/users:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/users/" + step.data.values["userId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(step.data.values["userProfileMetadata"]!==undefined && step.data.values["userProfileMetadata"]!==null) q["userProfileMetadata"]=step.data.values["userProfileMetadata"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/users/{user-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/users/" + step.data.values["userId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(step.data.values["userProfileMetadata"]!==undefined && step.data.values["userProfileMetadata"]!==null) q["userProfileMetadata"]=step.data.values["userProfileMetadata"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/users/{user-id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["firstName"] !== "firstName_13778") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/users:1",stage:stage,ok:true})});
}
});
bthread("verify-lookup:P1:admin/realms/{realm}/users:1", function(){
let step=sync({waitFor:EventSet("lookup-or-finish:P1:admin/realms/{realm}/users:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/users:1" && ((e.name==="SBT:CrudStep" && e.data.stage==="lookup") || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:CrudStep") sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/users:1",stage:"lookup",ok:true})});
});
bthread("crud:P1:admin/realms/{realm}/users:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/users",owner:"P1:admin/realms/{realm}/users:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/users:1",process:1,entity:"admin/realms/{realm}/users",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/users:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/users:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/users:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/users:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["username"]="username_51431";
svc.post("/admin/realms/" + __args["realm"] + "/users",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"access":__args["access"],"applicationRoles":__args["applicationRoles"],"attributes":__args["attributes"],"clientConsents":__args["clientConsents"],"clientRoles":__args["clientRoles"],"createdTimestamp":__args["createdTimestamp"],"credentials":__args["credentials"],"disableableCredentialTypes":__args["disableableCredentialTypes"],"email":__args["email"],"emailVerified":__args["emailVerified"],"enabled":__args["enabled"],"federatedIdentities":__args["federatedIdentities"],"federationLink":__args["federationLink"],"firstName":__args["firstName"],"groups":__args["groups"],"id":__args["id"],"issuedVerifiableCredentials":__args["issuedVerifiableCredentials"],"lastName":__args["lastName"],"notBefore":__args["notBefore"],"origin":__args["origin"],"realmRoles":__args["realmRoles"],"requiredActions":__args["requiredActions"],"self":__args["self"],"serviceAccountClientId":__args["serviceAccountClientId"],"socialLinks":__args["socialLinks"],"totp":__args["totp"],"userProfileMetadata":__args["userProfileMetadata"],"username":__args["username"],"verifiableCredentials":__args["verifiableCredentials"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/users" + ":" + response.code); return; } pvg.success("contract response verified"); }});
rtv.doStore("sbt_P1_admin_realms__realm__users_1_lookup_username",__args["username"]);
svc.get("/admin/realms/" + __args["realm"] + "/users",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["briefRepresentation"]!==undefined && __args["briefRepresentation"]!==null) q["briefRepresentation"]=__args["briefRepresentation"];if(__args["createdAfter"]!==undefined && __args["createdAfter"]!==null) q["createdAfter"]=__args["createdAfter"];if(__args["createdBefore"]!==undefined && __args["createdBefore"]!==null) q["createdBefore"]=__args["createdBefore"];if(__args["email"]!==undefined && __args["email"]!==null) q["email"]=__args["email"];if(__args["emailVerified"]!==undefined && __args["emailVerified"]!==null) q["emailVerified"]=__args["emailVerified"];if(__args["enabled"]!==undefined && __args["enabled"]!==null) q["enabled"]=__args["enabled"];q["exact"]=true;if(__args["first"]!==undefined && __args["first"]!==null) q["first"]=__args["first"];if(__args["firstName"]!==undefined && __args["firstName"]!==null) q["firstName"]=__args["firstName"];if(__args["idpAlias"]!==undefined && __args["idpAlias"]!==null) q["idpAlias"]=__args["idpAlias"];if(__args["idpUserId"]!==undefined && __args["idpUserId"]!==null) q["idpUserId"]=__args["idpUserId"];if(__args["lastName"]!==undefined && __args["lastName"]!==null) q["lastName"]=__args["lastName"];if(__args["max"]!==undefined && __args["max"]!==null) q["max"]=__args["max"];if(__args["q"]!==undefined && __args["q"]!==null) q["q"]=__args["q"];if(__args["search"]!==undefined && __args["search"]!==null) q["search"]=__args["search"];q["username"]=__args["username"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/users" + ":" + response.code); return; } var items; try { items = JSON.parse(response.body); } catch(err) { pvg.fail("lookup JSON invalid"); return; } if (!Array.isArray(items)) { pvg.fail("lookup is not an array"); return; } var matches = items.filter(function(item){ return item && item["username"] === pvg.rtv.get("sbt_P1_admin_realms__realm__users_1_lookup_username"); }); if (matches.length !== 1 || !matches[0].id) { pvg.fail("exact lookup missing or ambiguous"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__users_1_userId", matches[0].id); pvg.success("contract response verified"); }});
verified("lookup");
__args["userId"]="@{sbt_P1_admin_realms__realm__users_1_userId}";
svc.get("/admin/realms/" + __args["realm"] + "/users/" + __args["userId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["userProfileMetadata"]!==undefined && __args["userProfileMetadata"]!==null) q["userProfileMetadata"]=__args["userProfileMetadata"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/users/{user-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/users",owner:"P1:admin/realms/{realm}/users:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/users/" + __args["userId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["userProfileMetadata"]!==undefined && __args["userProfileMetadata"]!==null) q["userProfileMetadata"]=__args["userProfileMetadata"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/users/{user-id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__users_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["firstName"]="firstName_13778"; pvg.rtv.set("sbt_P1_admin_realms__realm__users_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/users/" + __args["userId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__users_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/users/{user-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
while(!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/users:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations/{org-id}/members";})});
}
svc.delete("/admin/realms/" + __args["realm"] + "/users/" + __args["userId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/users/{user-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/workflows:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/workflows:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/workflows:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/workflows/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(step.data.values["includeId"]!==undefined && step.data.values["includeId"]!==null) q["includeId"]=step.data.values["includeId"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/workflows/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/workflows/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(step.data.values["includeId"]!==undefined && step.data.values["includeId"]!==null) q["includeId"]=step.data.values["includeId"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/workflows/{id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["name"] !== "name_56483") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/workflows:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/workflows:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/workflows",owner:"P1:admin/realms/{realm}/workflows:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/workflows:1",process:1,entity:"admin/realms/{realm}/workflows",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/workflows:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/workflows:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/workflows:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/workflows:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["realm"]=__args["realm"];
__args["name"]="name_35172";
svc.post("/admin/realms/" + __args["realm"] + "/workflows",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"cancelInProgress":__args["cancelInProgress"],"concurrency":__args["concurrency"],"enabled":__args["enabled"],"id":__args["id"],"if":__args["if_"],"name":__args["name"],"on":__args["on"],"restartInProgress":__args["restartInProgress"],"schedule":__args["schedule"],"state":__args["state"],"steps":__args["steps"],"with":__args["with_"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/workflows" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["id"] === undefined ? obj.id : obj["id"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__workflows_1_id", value); pvg.success("contract response verified"); }});
__args["id"]="@{sbt_P1_admin_realms__realm__workflows_1_id}";
svc.get("/admin/realms/" + __args["realm"] + "/workflows/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["includeId"]!==undefined && __args["includeId"]!==null) q["includeId"]=__args["includeId"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/workflows/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/workflows",owner:"P1:admin/realms/{realm}/workflows:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/workflows/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["includeId"]!==undefined && __args["includeId"]!==null) q["includeId"]=__args["includeId"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/workflows/{id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__workflows_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["name"]="name_56483"; pvg.rtv.set("sbt_P1_admin_realms__realm__workflows_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/workflows/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__workflows_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/workflows/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/workflows/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/workflows/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/authentication/executions:1", function(){
for (let stage of ["readback", "create", "read", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/authentication/executions:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/authentication/executions:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/authentication/executions/" + step.data.values["executionId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/executions/{executionId}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/authentication/executions:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/authentication/executions:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/authentication/executions",owner:"P1:admin/realms/{realm}/authentication/executions:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/authentication/executions:1",process:1,entity:"admin/realms/{realm}/authentication/executions",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/authentication/executions:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/authentication/executions:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/authentication/flows"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/authentication/flows"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/flows"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/authentication/executions:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/authentication/flows";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/authentication/executions:1",type:"admin/realms/{realm}/authentication/flows",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/authentication/flows"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/authentication/flows"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/authentication/flows"].realm;
__args["flowId"]=__parentBindings["admin/realms/{realm}/authentication/flows"]["id"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/authentication/executions:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/authentication/executions:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["flowId"]=__args["flowId"];
__args["realm"]=__args["realm"];
svc.post("/admin/realms/" + __args["realm"] + "/authentication/executions",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"authenticator":__args["authenticator"],"authenticatorConfig":__args["authenticatorConfig"],"authenticatorFlow":__args["authenticatorFlow"],"autheticatorFlow":__args["autheticatorFlow"],"flowId":__args["flowId"],"id":__args["id"],"parentFlow":__args["parentFlow"],"priority":__args["priority"],"requirement":__args["requirement"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/authentication/executions" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["executionId"] === undefined ? obj.id : obj["executionId"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__authentication_executions_1_executionId", value); pvg.success("contract response verified"); }});
__args["executionId"]="@{sbt_P1_admin_realms__realm__authentication_executions_1_executionId}";
svc.get("/admin/realms/" + __args["realm"] + "/authentication/executions/" + __args["executionId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/executions/{executionId}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/authentication/executions",owner:"P1:admin/realms/{realm}/authentication/executions:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/authentication/executions/" + __args["executionId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/executions/{executionId}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__authentication_executions_1_read_body", response.body); pvg.success("contract response verified"); }});
verified("read");
while(!SBT_FINISHED["1:admin/realms/{realm}/authentication/executions/{executionId}/config"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions/{executionId}/config"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/authentication/executions:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/authentication/executions/{executionId}/config";})});
}
svc.delete("/admin/realms/" + __args["realm"] + "/authentication/executions/" + __args["executionId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/authentication/executions/{executionId}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/client-scopes/" + step.data.values["clientScopeId"] + "/protocol-mappers/models/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/client-scopes/" + step.data.values["clientScopeId"] + "/protocol-mappers/models/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["consentText"] !== "consentText_87716") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",process:1,entity:"admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/client-scopes"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/client-scopes"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-scopes"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/client-scopes";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",type:"admin/realms/{realm}/client-scopes",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/client-scopes"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/client-scopes"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/client-scopes"].realm;
__args["clientScopeId"]=__parentBindings["admin/realms/{realm}/client-scopes"]["clientScopeId"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["clientScopeId"]=__args["clientScopeId"];
__args["realm"]=__args["realm"];
__args["name"]="name_82588";
svc.post("/admin/realms/" + __args["realm"] + "/client-scopes/" + __args["clientScopeId"] + "/protocol-mappers/models",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"config":__args["config"],"consentRequired":__args["consentRequired"],"consentText":__args["consentText"],"id":__args["id"],"name":__args["name"],"protocol":__args["protocol"],"protocolMapper":__args["protocolMapper"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["id"] === undefined ? obj.id : obj["id"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__client_scopes__client_scope_id__protocol_mappers_models_1_id", value); pvg.success("contract response verified"); }});
__args["id"]="@{sbt_P1_admin_realms__realm__client_scopes__client_scope_id__protocol_mappers_models_1_id}";
svc.get("/admin/realms/" + __args["realm"] + "/client-scopes/" + __args["clientScopeId"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/client-scopes/" + __args["clientScopeId"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__client_scopes__client_scope_id__protocol_mappers_models_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["consentText"]="consentText_87716"; pvg.rtv.set("sbt_P1_admin_realms__realm__client_scopes__client_scope_id__protocol_mappers_models_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/client-scopes/" + __args["clientScopeId"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__client_scopes__client_scope_id__protocol_mappers_models_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/client-scopes/" + __args["clientScopeId"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/client-templates:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/client-templates:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/client-templates:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/client-templates/" + step.data.values["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-templates/{client-scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/client-templates/" + step.data.values["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-templates/{client-scope-id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["description"] !== "description_37004") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/client-templates:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/client-templates:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/client-templates",owner:"P1:admin/realms/{realm}/client-templates:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/client-templates:1",process:1,entity:"admin/realms/{realm}/client-templates",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/client-templates:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/client-templates:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/client-scopes"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/client-scopes"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-scopes"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/client-templates:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/client-scopes";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/client-templates:1",type:"admin/realms/{realm}/client-scopes",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/client-scopes"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/client-scopes"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/client-scopes"].realm;
__args["clientScopeId"]=__parentBindings["admin/realms/{realm}/client-scopes"]["clientScopeId"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/client-templates:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/client-templates:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["clientScopeId"]=__args["clientScopeId"];
__args["realm"]=__args["realm"];
__args["name"]="name_3330";
svc.post("/admin/realms/" + __args["realm"] + "/client-templates",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"attributes":__args["attributes"],"description":__args["description"],"id":__args["id"],"name":__args["name"],"protocol":__args["protocol"],"protocolMappers":__args["protocolMappers"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/client-templates" + ":" + response.code); return; } pvg.success("contract response verified"); }});
svc.get("/admin/realms/" + __args["realm"] + "/client-templates/" + __args["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-templates/{client-scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/client-templates",owner:"P1:admin/realms/{realm}/client-templates:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/client-templates/" + __args["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-templates/{client-scope-id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__client_templates_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["description"]="description_37004"; pvg.rtv.set("sbt_P1_admin_realms__realm__client_templates_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/client-templates/" + __args["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__client_templates_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/client-templates/{client-scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
while(!SBT_FINISHED["1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models"]).length<1){
sync({waitFor:EventSet("child:P1:admin/realms/{realm}/client-templates:1",function(e){return e.name==="SBT:WorkerFinished" && e.data.process===1 && e.data.entity==="admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models";})});
}
svc.delete("/admin/realms/" + __args["realm"] + "/client-templates/" + __args["clientScopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/client-templates/{client-scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/authz/resource-server/resource/" + step.data.values["resourceId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(step.data.values["id"]!==undefined && step.data.values["id"]!==null) q["_id"]=step.data.values["id"];if(step.data.values["deep"]!==undefined && step.data.values["deep"]!==null) q["deep"]=step.data.values["deep"];if(step.data.values["exactName"]!==undefined && step.data.values["exactName"]!==null) q["exactName"]=step.data.values["exactName"];if(step.data.values["first"]!==undefined && step.data.values["first"]!==null) q["first"]=step.data.values["first"];if(step.data.values["matchingUri"]!==undefined && step.data.values["matchingUri"]!==null) q["matchingUri"]=step.data.values["matchingUri"];if(step.data.values["max"]!==undefined && step.data.values["max"]!==null) q["max"]=step.data.values["max"];if(step.data.values["name"]!==undefined && step.data.values["name"]!==null) q["name"]=step.data.values["name"];if(step.data.values["owner"]!==undefined && step.data.values["owner"]!==null) q["owner"]=step.data.values["owner"];if(step.data.values["scope"]!==undefined && step.data.values["scope"]!==null) q["scope"]=step.data.values["scope"];if(step.data.values["type"]!==undefined && step.data.values["type"]!==null) q["type"]=step.data.values["type"];if(step.data.values["uri"]!==undefined && step.data.values["uri"]!==null) q["uri"]=step.data.values["uri"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/authz/resource-server/resource/" + step.data.values["resourceId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(step.data.values["id"]!==undefined && step.data.values["id"]!==null) q["_id"]=step.data.values["id"];if(step.data.values["deep"]!==undefined && step.data.values["deep"]!==null) q["deep"]=step.data.values["deep"];if(step.data.values["exactName"]!==undefined && step.data.values["exactName"]!==null) q["exactName"]=step.data.values["exactName"];if(step.data.values["first"]!==undefined && step.data.values["first"]!==null) q["first"]=step.data.values["first"];if(step.data.values["matchingUri"]!==undefined && step.data.values["matchingUri"]!==null) q["matchingUri"]=step.data.values["matchingUri"];if(step.data.values["max"]!==undefined && step.data.values["max"]!==null) q["max"]=step.data.values["max"];if(step.data.values["name"]!==undefined && step.data.values["name"]!==null) q["name"]=step.data.values["name"];if(step.data.values["owner"]!==undefined && step.data.values["owner"]!==null) q["owner"]=step.data.values["owner"];if(step.data.values["scope"]!==undefined && step.data.values["scope"]!==null) q["scope"]=step.data.values["scope"];if(step.data.values["type"]!==undefined && step.data.values["type"]!==null) q["type"]=step.data.values["type"];if(step.data.values["uri"]!==undefined && step.data.values["uri"]!==null) q["uri"]=step.data.values["uri"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["displayName"] !== "displayName_24681") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
if(stage==="delete") svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/authz/resource-server/resource/" + step.data.values["resourceId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[404],parameters:(function(){var q={};if(step.data.values["id"]!==undefined && step.data.values["id"]!==null) q["_id"]=step.data.values["id"];if(step.data.values["deep"]!==undefined && step.data.values["deep"]!==null) q["deep"]=step.data.values["deep"];if(step.data.values["exactName"]!==undefined && step.data.values["exactName"]!==null) q["exactName"]=step.data.values["exactName"];if(step.data.values["first"]!==undefined && step.data.values["first"]!==null) q["first"]=step.data.values["first"];if(step.data.values["matchingUri"]!==undefined && step.data.values["matchingUri"]!==null) q["matchingUri"]=step.data.values["matchingUri"];if(step.data.values["max"]!==undefined && step.data.values["max"]!==null) q["max"]=step.data.values["max"];if(step.data.values["name"]!==undefined && step.data.values["name"]!==null) q["name"]=step.data.values["name"];if(step.data.values["owner"]!==undefined && step.data.values["owner"]!==null) q["owner"]=step.data.values["owner"];if(step.data.values["scope"]!==undefined && step.data.values["scope"]!==null) q["scope"]=step.data.values["scope"];if(step.data.values["type"]!==undefined && step.data.values["type"]!==null) q["type"]=step.data.values["type"];if(step.data.values["uri"]!==undefined && step.data.values["uri"]!==null) q["uri"]=step.data.values["uri"];return q;})(),callback:function(response) { if ([404].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",stage:stage,ok:true})});
}
});
bthread("verify-lookup:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function(){
let step=sync({waitFor:EventSet("lookup-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" && ((e.name==="SBT:CrudStep" && e.data.stage==="lookup") || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:CrudStep") sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",stage:"lookup",ok:true})});
});
bthread("crud:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/clients"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/clients"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",type:"admin/realms/{realm}/clients",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/clients"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/clients"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/clients"].realm;
__args["clientUuid"]=__parentBindings["admin/realms/{realm}/clients"]["clientUuid"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["clientUuid"]=__args["clientUuid"];
__args["realm"]=__args["realm"];
__args["name"]="name_63282";
svc.post("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/resource",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"_id":__args["id"],"attributes":__args["attributes"],"displayName":__args["displayName"],"icon_uri":__args["iconUri"],"name":__args["name"],"ownerManagedAccess":__args["ownerManagedAccess"],"scopes":__args["scopes"],"scopesUma":__args["scopesUma"],"type":__args["type"],"uri":__args["uri"],"uris":__args["uris"]}),parameters:(function(){var q={};if(__args["id"]!==undefined && __args["id"]!==null) q["_id"]=__args["id"];if(__args["deep"]!==undefined && __args["deep"]!==null) q["deep"]=__args["deep"];if(__args["exactName"]!==undefined && __args["exactName"]!==null) q["exactName"]=__args["exactName"];if(__args["first"]!==undefined && __args["first"]!==null) q["first"]=__args["first"];if(__args["matchingUri"]!==undefined && __args["matchingUri"]!==null) q["matchingUri"]=__args["matchingUri"];if(__args["max"]!==undefined && __args["max"]!==null) q["max"]=__args["max"];if(__args["name"]!==undefined && __args["name"]!==null) q["name"]=__args["name"];if(__args["owner"]!==undefined && __args["owner"]!==null) q["owner"]=__args["owner"];if(__args["scope"]!==undefined && __args["scope"]!==null) q["scope"]=__args["scope"];if(__args["type"]!==undefined && __args["type"]!==null) q["type"]=__args["type"];if(__args["uri"]!==undefined && __args["uri"]!==null) q["uri"]=__args["uri"];return q;})(),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource" + ":" + response.code); return; } pvg.success("contract response verified"); }});
rtv.doStore("sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_resource_1_lookup_name",__args["name"]);
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/resource",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["id"]!==undefined && __args["id"]!==null) q["_id"]=__args["id"];if(__args["deep"]!==undefined && __args["deep"]!==null) q["deep"]=__args["deep"];if(__args["exactName"]!==undefined && __args["exactName"]!==null) q["exactName"]=__args["exactName"];if(__args["first"]!==undefined && __args["first"]!==null) q["first"]=__args["first"];if(__args["matchingUri"]!==undefined && __args["matchingUri"]!==null) q["matchingUri"]=__args["matchingUri"];if(__args["max"]!==undefined && __args["max"]!==null) q["max"]=__args["max"];q["name"]=__args["name"];if(__args["owner"]!==undefined && __args["owner"]!==null) q["owner"]=__args["owner"];if(__args["scope"]!==undefined && __args["scope"]!==null) q["scope"]=__args["scope"];if(__args["type"]!==undefined && __args["type"]!==null) q["type"]=__args["type"];if(__args["uri"]!==undefined && __args["uri"]!==null) q["uri"]=__args["uri"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource" + ":" + response.code); return; } var items; try { items = JSON.parse(response.body); } catch(err) { pvg.fail("lookup JSON invalid"); return; } if (!Array.isArray(items)) { pvg.fail("lookup is not an array"); return; } var matches = items.filter(function(item){ return item && item["name"] === pvg.rtv.get("sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_resource_1_lookup_name"); }); if (matches.length !== 1 || !matches[0].id) { pvg.fail("exact lookup missing or ambiguous"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_resource_1_resourceId", matches[0].id); pvg.success("contract response verified"); }});
verified("lookup");
__args["resourceId"]="@{sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_resource_1_resourceId}";
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/resource/" + __args["resourceId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["id"]!==undefined && __args["id"]!==null) q["_id"]=__args["id"];if(__args["deep"]!==undefined && __args["deep"]!==null) q["deep"]=__args["deep"];if(__args["exactName"]!==undefined && __args["exactName"]!==null) q["exactName"]=__args["exactName"];if(__args["first"]!==undefined && __args["first"]!==null) q["first"]=__args["first"];if(__args["matchingUri"]!==undefined && __args["matchingUri"]!==null) q["matchingUri"]=__args["matchingUri"];if(__args["max"]!==undefined && __args["max"]!==null) q["max"]=__args["max"];if(__args["name"]!==undefined && __args["name"]!==null) q["name"]=__args["name"];if(__args["owner"]!==undefined && __args["owner"]!==null) q["owner"]=__args["owner"];if(__args["scope"]!==undefined && __args["scope"]!==null) q["scope"]=__args["scope"];if(__args["type"]!==undefined && __args["type"]!==null) q["type"]=__args["type"];if(__args["uri"]!==undefined && __args["uri"]!==null) q["uri"]=__args["uri"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/resource/" + __args["resourceId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["id"]!==undefined && __args["id"]!==null) q["_id"]=__args["id"];if(__args["deep"]!==undefined && __args["deep"]!==null) q["deep"]=__args["deep"];if(__args["exactName"]!==undefined && __args["exactName"]!==null) q["exactName"]=__args["exactName"];if(__args["first"]!==undefined && __args["first"]!==null) q["first"]=__args["first"];if(__args["matchingUri"]!==undefined && __args["matchingUri"]!==null) q["matchingUri"]=__args["matchingUri"];if(__args["max"]!==undefined && __args["max"]!==null) q["max"]=__args["max"];if(__args["name"]!==undefined && __args["name"]!==null) q["name"]=__args["name"];if(__args["owner"]!==undefined && __args["owner"]!==null) q["owner"]=__args["owner"];if(__args["scope"]!==undefined && __args["scope"]!==null) q["scope"]=__args["scope"];if(__args["type"]!==undefined && __args["type"]!==null) q["type"]=__args["type"];if(__args["uri"]!==undefined && __args["uri"]!==null) q["uri"]=__args["uri"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_resource_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["displayName"]="displayName_24681"; pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_resource_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/resource/" + __args["resourceId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_resource_1_update_body}",parameters:(function(){var q={};if(__args["id"]!==undefined && __args["id"]!==null) q["_id"]=__args["id"];if(__args["deep"]!==undefined && __args["deep"]!==null) q["deep"]=__args["deep"];if(__args["exactName"]!==undefined && __args["exactName"]!==null) q["exactName"]=__args["exactName"];if(__args["first"]!==undefined && __args["first"]!==null) q["first"]=__args["first"];if(__args["matchingUri"]!==undefined && __args["matchingUri"]!==null) q["matchingUri"]=__args["matchingUri"];if(__args["max"]!==undefined && __args["max"]!==null) q["max"]=__args["max"];if(__args["name"]!==undefined && __args["name"]!==null) q["name"]=__args["name"];if(__args["owner"]!==undefined && __args["owner"]!==null) q["owner"]=__args["owner"];if(__args["scope"]!==undefined && __args["scope"]!==null) q["scope"]=__args["scope"];if(__args["type"]!==undefined && __args["type"]!==null) q["type"]=__args["type"];if(__args["uri"]!==undefined && __args["uri"]!==null) q["uri"]=__args["uri"];return q;})(),callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/resource/" + __args["resourceId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],parameters:(function(){var q={};if(__args["id"]!==undefined && __args["id"]!==null) q["_id"]=__args["id"];if(__args["deep"]!==undefined && __args["deep"]!==null) q["deep"]=__args["deep"];if(__args["exactName"]!==undefined && __args["exactName"]!==null) q["exactName"]=__args["exactName"];if(__args["first"]!==undefined && __args["first"]!==null) q["first"]=__args["first"];if(__args["matchingUri"]!==undefined && __args["matchingUri"]!==null) q["matchingUri"]=__args["matchingUri"];if(__args["max"]!==undefined && __args["max"]!==null) q["max"]=__args["max"];if(__args["name"]!==undefined && __args["name"]!==null) q["name"]=__args["name"];if(__args["owner"]!==undefined && __args["owner"]!==null) q["owner"]=__args["owner"];if(__args["scope"]!==undefined && __args["scope"]!==null) q["scope"]=__args["scope"];if(__args["type"]!==undefined && __args["type"]!==null) q["type"]=__args["type"];if(__args["uri"]!==undefined && __args["uri"]!==null) q["uri"]=__args["uri"];return q;})(),callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource/{resource-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/authz/resource-server/scope/" + step.data.values["scopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/authz/resource-server/scope/" + step.data.values["scopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["displayName"] !== "displayName_93047") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
if(stage==="delete") svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/authz/resource-server/scope/" + step.data.values["scopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[404],callback:function(response) { if ([404].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",stage:stage,ok:true})});
}
});
bthread("verify-lookup:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function(){
let step=sync({waitFor:EventSet("lookup-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" && ((e.name==="SBT:CrudStep" && e.data.stage==="lookup") || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:CrudStep") sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",stage:"lookup",ok:true})});
});
bthread("crud:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/clients"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/clients"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",type:"admin/realms/{realm}/clients",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/clients"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/clients"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/clients"].realm;
__args["clientUuid"]=__parentBindings["admin/realms/{realm}/clients"]["clientUuid"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["clientUuid"]=__args["clientUuid"];
__args["realm"]=__args["realm"];
__args["name"]="name_82726";
svc.post("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/scope",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],body:JSON.stringify({"displayName":__args["displayName"],"iconUri":__args["iconUri"],"id":__args["id"],"name":__args["name"],"policies":__args["policies"],"resources":__args["resources"]}),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope" + ":" + response.code); return; } pvg.success("contract response verified"); }});
rtv.doStore("sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_scope_1_lookup_name",__args["name"]);
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/scope",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["first"]!==undefined && __args["first"]!==null) q["first"]=__args["first"];if(__args["max"]!==undefined && __args["max"]!==null) q["max"]=__args["max"];q["name"]=__args["name"];if(__args["scopeId"]!==undefined && __args["scopeId"]!==null) q["scopeId"]=__args["scopeId"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope" + ":" + response.code); return; } var items; try { items = JSON.parse(response.body); } catch(err) { pvg.fail("lookup JSON invalid"); return; } if (!Array.isArray(items)) { pvg.fail("lookup is not an array"); return; } var matches = items.filter(function(item){ return item && item["name"] === pvg.rtv.get("sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_scope_1_lookup_name"); }); if (matches.length !== 1 || !matches[0].id) { pvg.fail("exact lookup missing or ambiguous"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_scope_1_scopeId", matches[0].id); pvg.success("contract response verified"); }});
verified("lookup");
__args["scopeId"]="@{sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_scope_1_scopeId}";
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/scope/" + __args["scopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/scope/" + __args["scopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_scope_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["displayName"]="displayName_93047"; pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_scope_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/scope/" + __args["scopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],body:"@{sbt_P1_admin_realms__realm__clients__client_uuid__authz_resource_server_scope_1_update_body}",callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/authz/resource-server/scope/" + __args["scopeId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope/{scope-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/protocol-mappers/models/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/protocol-mappers/models/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models/{id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["consentText"] !== "consentText_90225") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/clients"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/clients"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",type:"admin/realms/{realm}/clients",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/clients"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/clients"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/clients"].realm;
__args["clientUuid"]=__parentBindings["admin/realms/{realm}/clients"]["clientUuid"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["clientUuid"]=__args["clientUuid"];
__args["realm"]=__args["realm"];
__args["name"]="name_36887";
svc.post("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/protocol-mappers/models",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"config":__args["config"],"consentRequired":__args["consentRequired"],"consentText":__args["consentText"],"id":__args["id"],"name":__args["name"],"protocol":__args["protocol"],"protocolMapper":__args["protocolMapper"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["id"] === undefined ? obj.id : obj["id"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__protocol_mappers_models_1_id", value); pvg.success("contract response verified"); }});
__args["id"]="@{sbt_P1_admin_realms__realm__clients__client_uuid__protocol_mappers_models_1_id}";
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models/{id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__protocol_mappers_models_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["consentText"]="consentText_90225"; pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__protocol_mappers_models_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__clients__client_uuid__protocol_mappers_models_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/roles/" + step.data.values["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/roles/" + step.data.values["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["description"] !== "description_7812") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
if(stage==="delete") svc.get("/admin/realms/" + step.data.values["realm"] + "/clients/" + step.data.values["clientUuid"] + "/roles/" + step.data.values["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[404],callback:function(response) { if ([404].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/roles",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/roles",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/clients"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/clients"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/clients";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",type:"admin/realms/{realm}/clients",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/clients"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/clients"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/clients"].realm;
__args["clientUuid"]=__parentBindings["admin/realms/{realm}/clients"]["clientUuid"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["clientUuid"]=__args["clientUuid"];
__args["realm"]=__args["realm"];
__args["name"]="name_96109";
svc.post("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/roles",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"attributes":__args["attributes"],"clientRole":__args["clientRole"],"composite":__args["composite"],"composites":__args["composites"],"containerId":__args["containerId"],"description":__args["description"],"id":__args["id"],"name":__args["name"],"scopeParamRequired":__args["scopeParamRequired"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/clients/{client-uuid}/roles" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["roleName"] === undefined ? obj.id : obj["roleName"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__roles_1_roleName", value); pvg.success("contract response verified"); }});
__args["roleName"]="@{sbt_P1_admin_realms__realm__clients__client_uuid__roles_1_roleName}";
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/roles/" + __args["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/roles",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/roles/" + __args["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__roles_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["description"]="description_7812"; pvg.rtv.set("sbt_P1_admin_realms__realm__clients__client_uuid__roles_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/roles/" + __args["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__clients__client_uuid__roles_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/clients/" + __args["clientUuid"] + "/roles/" + __args["roleName"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/clients/{client-uuid}/roles/{role-name}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/identity-provider/instances/" + step.data.values["alias"] + "/mappers/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/identity-provider/instances/{alias}/mappers/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/identity-provider/instances/" + step.data.values["alias"] + "/mappers/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/identity-provider/instances/{alias}/mappers/{id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["name"] !== "name_81379") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/identity-provider/instances/{alias}/mappers",owner:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",process:1,entity:"admin/realms/{realm}/identity-provider/instances/{alias}/mappers",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/identity-provider/instances"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/identity-provider/instances";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",type:"admin/realms/{realm}/identity-provider/instances",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/identity-provider/instances"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/identity-provider/instances"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/identity-provider/instances"].realm;
__args["alias"]=__parentBindings["admin/realms/{realm}/identity-provider/instances"]["alias"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["alias"]=__args["alias"];
__args["realm"]=__args["realm"];
__args["name"]="name_63901";
svc.post("/admin/realms/" + __args["realm"] + "/identity-provider/instances/" + __args["alias"] + "/mappers",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],body:JSON.stringify({"config":__args["config"],"id":__args["id"],"identityProviderAlias":__args["identityProviderAlias"],"identityProviderMapper":__args["identityProviderMapper"],"name":__args["name"]}),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/identity-provider/instances/{alias}/mappers" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["id"] === undefined ? obj.id : obj["id"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__identity_provider_instances__alias__mappers_1_id", value); pvg.success("contract response verified"); }});
__args["id"]="@{sbt_P1_admin_realms__realm__identity_provider_instances__alias__mappers_1_id}";
svc.get("/admin/realms/" + __args["realm"] + "/identity-provider/instances/" + __args["alias"] + "/mappers/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/identity-provider/instances/{alias}/mappers/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/identity-provider/instances/{alias}/mappers",owner:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/identity-provider/instances/" + __args["alias"] + "/mappers/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/identity-provider/instances/{alias}/mappers/{id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__identity_provider_instances__alias__mappers_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["name"]="name_81379"; pvg.rtv.set("sbt_P1_admin_realms__realm__identity_provider_instances__alias__mappers_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/identity-provider/instances/" + __args["alias"] + "/mappers/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__identity_provider_instances__alias__mappers_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/identity-provider/instances/{alias}/mappers/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/identity-provider/instances/" + __args["alias"] + "/mappers/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/identity-provider/instances/{alias}/mappers/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/organizations/{org-id}/groups:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/organizations/{org-id}/groups:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/organizations/{org-id}/groups:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/organizations/" + step.data.values["orgId"] + "/groups/" + step.data.values["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(step.data.values["subGroupsCount"]!==undefined && step.data.values["subGroupsCount"]!==null) q["subGroupsCount"]=step.data.values["subGroupsCount"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/organizations/" + step.data.values["orgId"] + "/groups/" + step.data.values["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(step.data.values["subGroupsCount"]!==undefined && step.data.values["subGroupsCount"]!==null) q["subGroupsCount"]=step.data.values["subGroupsCount"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["description"] !== "description_97257") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/organizations/{org-id}/groups:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/organizations/{org-id}/groups",owner:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",process:1,entity:"admin/realms/{realm}/organizations/{org-id}/groups",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/organizations/{org-id}/groups:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/organizations/{org-id}/groups:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/organizations"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/organizations"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/groups:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",type:"admin/realms/{realm}/organizations",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/organizations"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/organizations"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/organizations"].realm;
__args["orgId"]=__parentBindings["admin/realms/{realm}/organizations"]["orgId"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/groups:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["orgId"]=__args["orgId"];
__args["realm"]=__args["realm"];
__args["name"]="name_28365";
svc.post("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/groups",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201, 204],body:JSON.stringify({"access":__args["access"],"attributes":__args["attributes"],"clientRoles":__args["clientRoles"],"description":__args["description"],"id":__args["id"],"name":__args["name"],"parentId":__args["parentId"],"path":__args["path"],"realmRoles":__args["realmRoles"],"subGroupCount":__args["subGroupCount"],"subGroups":__args["subGroups"]}),callback:function(response) { if ([201, 204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/organizations/{org-id}/groups" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["groupId"] === undefined ? obj.id : obj["groupId"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__organizations__org_id__groups_1_groupId", value); pvg.success("contract response verified"); }});
__args["groupId"]="@{sbt_P1_admin_realms__realm__organizations__org_id__groups_1_groupId}";
svc.get("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/groups/" + __args["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["subGroupsCount"]!==undefined && __args["subGroupsCount"]!==null) q["subGroupsCount"]=__args["subGroupsCount"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/organizations/{org-id}/groups",owner:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/groups/" + __args["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],parameters:(function(){var q={};if(__args["subGroupsCount"]!==undefined && __args["subGroupsCount"]!==null) q["subGroupsCount"]=__args["subGroupsCount"];return q;})(),callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__organizations__org_id__groups_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["description"]="description_97257"; pvg.rtv.set("sbt_P1_admin_realms__realm__organizations__org_id__groups_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/groups/" + __args["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__organizations__org_id__groups_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/groups/" + __args["groupId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1", function(){
for (let stage of ["readback", "create", "read", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/organizations/" + step.data.values["orgId"] + "/identity-providers/" + step.data.values["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/identity-providers/{alias}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="delete") svc.get("/admin/realms/" + step.data.values["realm"] + "/organizations/" + step.data.values["orgId"] + "/identity-providers/" + step.data.values["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[404],callback:function(response) { if ([404].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/identity-providers/{alias}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/organizations/{org-id}/identity-providers",owner:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",process:1,entity:"admin/realms/{realm}/organizations/{org-id}/identity-providers",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/identity-provider/instances"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/identity-provider/instances";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",type:"admin/realms/{realm}/identity-provider/instances",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/identity-provider/instances"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/identity-provider/instances"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/identity-provider/instances"].realm;
__args["alias"]=__parentBindings["admin/realms/{realm}/identity-provider/instances"]["alias"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/organizations"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/organizations"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",type:"admin/realms/{realm}/organizations",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/organizations"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/organizations"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/organizations"].realm;
__args["orgId"]=__parentBindings["admin/realms/{realm}/organizations"]["orgId"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["alias"]=__args["alias"];
__args["orgId"]=__args["orgId"];
__args["realm"]=__args["realm"];
svc.post("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/identity-providers",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:JSON.stringify(__args["alias"]),callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/organizations/{org-id}/identity-providers" + ":" + response.code); return; } pvg.success("contract response verified"); }});
svc.get("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/identity-providers/" + __args["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/identity-providers/{alias}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/organizations/{org-id}/identity-providers",owner:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/identity-providers/" + __args["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/identity-providers/{alias}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__organizations__org_id__identity_providers_1_read_body", response.body); pvg.success("contract response verified"); }});
verified("read");
svc.delete("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/identity-providers/" + __args["alias"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/organizations/{org-id}/identity-providers/{alias}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/organizations/{org-id}/members:1", function(){
for (let stage of ["readback", "create", "read", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/organizations/{org-id}/members:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/organizations/{org-id}/members:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/organizations/" + step.data.values["orgId"] + "/members/" + step.data.values["memberId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/members/{member-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/organizations/{org-id}/members:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/organizations/{org-id}/members",owner:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",process:1,entity:"admin/realms/{realm}/organizations/{org-id}/members",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/organizations/{org-id}/members:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/organizations/{org-id}/members:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/organizations"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/organizations"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/members:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/organizations";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",type:"admin/realms/{realm}/organizations",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/organizations"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/organizations"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/organizations"].realm;
__args["orgId"]=__parentBindings["admin/realms/{realm}/organizations"]["orgId"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/users"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/users"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/users"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/members:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/users";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",type:"admin/realms/{realm}/users",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/users"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/users"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/users"].realm;
__args["userId"]=__parentBindings["admin/realms/{realm}/users"]["userId"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/members:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["orgId"]=__args["orgId"];
__args["realm"]=__args["realm"];
__args["userId"]=__args["userId"];
svc.post("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/members",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify(__args["userId"]),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/organizations/{org-id}/members" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["memberId"] === undefined ? obj.id : obj["memberId"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__organizations__org_id__members_1_memberId", value); pvg.success("contract response verified"); }});
__args["memberId"]="@{sbt_P1_admin_realms__realm__organizations__org_id__members_1_memberId}";
svc.get("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/members/" + __args["memberId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/members/{member-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/organizations/{org-id}/members",owner:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/members/" + __args["memberId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/organizations/{org-id}/members/{member-id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__organizations__org_id__members_1_read_body", response.body); pvg.success("contract response verified"); }});
verified("read");
svc.delete("/admin/realms/" + __args["realm"] + "/organizations/" + __args["orgId"] + "/members/" + __args["memberId"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/organizations/{org-id}/members/{member-id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1", function(){
for (let stage of ["readback", "create", "read"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/authentication/executions/" + step.data.values["executionId"] + "/config/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/executions/{executionId}/config/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/authentication/executions/{executionId}/config",owner:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",process:1,entity:"admin/realms/{realm}/authentication/executions/{executionId}/config",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/authentication/executions"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/authentication/executions";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",type:"admin/realms/{realm}/authentication/executions",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/authentication/executions"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/authentication/executions"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/authentication/executions"].realm;
__args["executionId"]=__parentBindings["admin/realms/{realm}/authentication/executions"]["executionId"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["executionId"]=__args["executionId"];
__args["realm"]=__args["realm"];
__args["alias"]="alias_79905";
svc.post("/admin/realms/" + __args["realm"] + "/authentication/executions/" + __args["executionId"] + "/config",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"alias":__args["alias"],"config":__args["config"],"id":__args["id"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/authentication/executions/{executionId}/config" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["id"] === undefined ? obj.id : obj["id"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__authentication_executions__executionId__config_1_id", value); pvg.success("contract response verified"); }});
__args["id"]="@{sbt_P1_admin_realms__realm__authentication_executions__executionId__config_1_id}";
svc.get("/admin/realms/" + __args["realm"] + "/authentication/executions/" + __args["executionId"] + "/config/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/executions/{executionId}/config/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/authentication/executions/{executionId}/config",owner:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/authentication/executions/" + __args["executionId"] + "/config/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/authentication/executions/{executionId}/config/{id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__authentication_executions__executionId__config_1_read_body", response.body); pvg.success("contract response verified"); }});
verified("read");
finish("complete");
});
bthread("verify:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1", function(){
for (let stage of ["readback", "create", "read", "update", "delete"]) {
let step=sync({waitFor:EventSet("step-or-finish:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",function(e){return e.data && e.data.owner==="P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1" && ((e.name==="SBT:CrudStep" && e.data.stage===stage) || e.name==="SBT:WorkerFinished");})});
if(step.name==="SBT:WorkerFinished") return;
if(stage==="create" || stage==="readback") {
svc.get("/admin/realms/" + step.data.values["realm"] + "/client-templates/" + step.data.values["clientScopeId"] + "/protocol-mappers/models/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
}
if(stage==="update") svc.get("/admin/realms/" + step.data.values["realm"] + "/client-templates/" + step.data.values["clientScopeId"] + "/protocol-mappers/models/" + step.data.values["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } var observed; try { observed = JSON.parse(response.body); } catch(err) { pvg.fail("update readback JSON invalid"); return; } if (!observed || observed["consentText"] !== "consentText_59583") { pvg.fail("update readback mismatch"); return; } pvg.success("contract response verified"); }});
sync({request:Event("SBT:CrudVerified",{owner:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",stage:stage,ok:true})});
}
});
bthread("crud:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1", function() {
let __args={}; let __parentBindings={};
function finish(reason){ sync({request:Event("SBT:WorkerFinished",{process:1,entity:"admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",reason:reason})}); }
function verified(stage){ sync({request:Event("SBT:CrudStep",{owner:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",process:1,entity:"admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models",stage:stage,values:Object.assign({},__args)})});sync({waitFor:EventSet("verified:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",function(e){return e.name==="SBT:CrudVerified" && e.data.owner==="P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1" && e.data.stage===stage;})}); }
{ function matchingParents(){ return (SBT_POOL["1:admin/realms/{realm}/client-templates"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms/{realm}/client-templates"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-templates"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms/{realm}/client-templates";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",type:"admin/realms/{realm}/client-templates",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms/{realm}/client-templates"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms/{realm}/client-templates"].realm!==undefined) __args.realm=__parentBindings["admin/realms/{realm}/client-templates"].realm;
__args["clientScopeId"]=__parentBindings["admin/realms/{realm}/client-templates"]["clientScopeId"];
}
{ function matchingParents(){ return (SBT_POOL["1:admin/realms"]||[]).filter(function(parent){ return __args.realm===undefined || parent.values.realm===__args.realm; }); }
while(!matchingParents().length){
if(SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length===1){ finish("parent-unavailable"); return; }
sync({waitFor:EventSet("parent:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",function(e){return (e.name==="SBT:InstanceReady"||e.name==="SBT:WorkerFinished") && e.data.process===1 && e.data.entity==="admin/realms";})});
}
let candidates=matchingParents();
let choices=candidates.map(function(parent,index){return Event("SBT:BindParent",{child:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",type:"admin/realms",index:index});});
let picked=sync({request:choices});
__parentBindings["admin/realms"]=candidates[picked.data.index].values;
if(__args.realm===undefined && __parentBindings["admin/realms"].realm!==undefined) __args.realm=__parentBindings["admin/realms"].realm;
__args["realm"]=__parentBindings["admin/realms"]["realm"];
}
__args["clientScopeId"]=__args["clientScopeId"];
__args["realm"]=__args["realm"];
__args["name"]="name_31227";
svc.post("/admin/realms/" + __args["realm"] + "/client-templates/" + __args["clientScopeId"] + "/protocol-mappers/models",{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[201],body:JSON.stringify({"config":__args["config"],"consentRequired":__args["consentRequired"],"consentText":__args["consentText"],"id":__args["id"],"name":__args["name"],"protocol":__args["protocol"],"protocolMapper":__args["protocolMapper"]}),callback:function(response) { if ([201].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for POST /admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models" + ":" + response.code); return; } var obj = null; try { obj = JSON.parse(response.body); } catch(err) {} var value = obj && typeof obj === "object" ? (obj["id"] === undefined ? obj.id : obj["id"]) : null; if (value === undefined || value === null || value === "") {  var headers = response.headers || {}; var location = headers.Location || headers.location;  if (!location) { for (var name in headers) { if (name.toLowerCase() === "location") { location = headers[name]; break; } } }  if (location) value = String(location).split("?")[0].replace(/\/$/, "").split("/").pop(); } if (value === undefined || value === null || value === "") { pvg.fail("create identifier unavailable"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__client_templates__client_scope_id__protocol_mappers_models_1_id", value); pvg.success("contract response verified"); }});
__args["id"]="@{sbt_P1_admin_realms__realm__client_templates__client_scope_id__protocol_mappers_models_1_id}";
svc.get("/admin/realms/" + __args["realm"] + "/client-templates/" + __args["clientScopeId"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("readback");
verified("create");
sync({request:Event("SBT:InstanceReady",{process:1,entity:"admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",values:Object.assign({},__args)})});
svc.get("/admin/realms/" + __args["realm"] + "/client-templates/" + __args["clientScopeId"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[200],callback:function(response) { if ([200].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for GET /admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } try { JSON.parse(response.body); } catch(err) { pvg.fail("read body JSON invalid"); return; } pvg.rtv.set("sbt_P1_admin_realms__realm__client_templates__client_scope_id__protocol_mappers_models_1_read_body", response.body); var updateBody; try { updateBody = JSON.parse(response.body); } catch(err) { pvg.fail("update base JSON invalid"); return; } if (!updateBody || typeof updateBody !== "object" || Array.isArray(updateBody)) { pvg.fail("update base is not an object"); return; } updateBody["consentText"]="consentText_59583"; pvg.rtv.set("sbt_P1_admin_realms__realm__client_templates__client_scope_id__protocol_mappers_models_1_update_body",JSON.stringify(updateBody)); pvg.success("contract response verified"); }});
verified("read");
svc.put("/admin/realms/" + __args["realm"] + "/client-templates/" + __args["clientScopeId"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],body:"@{sbt_P1_admin_realms__realm__client_templates__client_scope_id__protocol_mappers_models_1_update_body}",callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for PUT /admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("update");
svc.delete("/admin/realms/" + __args["realm"] + "/client-templates/" + __args["clientScopeId"] + "/protocol-mappers/models/" + __args["id"],{headers:{Authorization:"Bearer @{getEnv('KC_STAGE2_ACCESS_TOKEN')}"},expectedResponseCodes:[204],callback:function(response) { if ([204].indexOf(response.code) < 0) { pvg.fail("Unexpected HTTP for DELETE /admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models/{id}" + ":" + response.code); return; } pvg.success("contract response verified"); }});
verified("delete");
finish("complete");
});
