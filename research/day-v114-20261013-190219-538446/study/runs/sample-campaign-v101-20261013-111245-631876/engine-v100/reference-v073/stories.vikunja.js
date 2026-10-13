// Generated stories: explicit entity instances; Context-driven verification.
// HTTP paths and request bodies are confined to interfaces.
ctx.bthread("protectWriteAndReadback", "WriteLock.All", function(lock) {
    sync({block:matchesConflictingWrites(lock.logicalId,lock.owner),waitFor:matchesVerified(lock.logicalId,lock.revision)});
});
ctx.bthread("protectPendingVerification", "Verification.Pending", function(resource) {
    sync({block:matchesMutations(resource.id),waitFor:matchesVerified(resource.id,resource.revision)});
});

// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsProjectAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsProject") return;
    verifyModelsProject(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsProject_1: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsProject_1", function() {
    var parents=waitForDependencies([],{});
    createModelsProject("ModelsProject_1",{"title":"sbt-1-ModelsProject-1-title"},parents);
    waitFor(matchesVerified("ModelsProject_1",1));
    updateModelsProject(getModelEntity("ModelsProject_1"),{"description":"sbt-1-ModelsProject_1-updated"});
    waitFor(matchesVerified("ModelsProject_1",2));
});

// Instance ModelsProject_2: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsProject_2", function() {
    var parents=waitForDependencies([],{});
    createModelsProject("ModelsProject_2",{"title":"sbt-1-ModelsProject-2-title"},parents);
    waitFor(matchesVerified("ModelsProject_2",1));
    updateModelsProject(getModelEntity("ModelsProject_2"),{"description":"sbt-1-ModelsProject_2-updated"});
    waitFor(matchesVerified("ModelsProject_2",2));
});

// Instance ModelsProject_3: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsProject_3", function() {
    var parents=waitForDependencies([],{});
    createModelsProject("ModelsProject_3",{"title":"sbt-1-ModelsProject-3-title"},parents);
    waitFor(matchesVerified("ModelsProject_3",1));
    updateModelsProject(getModelEntity("ModelsProject_3"),{"description":"sbt-1-ModelsProject_3-updated"});
    waitFor(matchesVerified("ModelsProject_3",2));
});

// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsTaskAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsTask") return;
    verifyModelsTask(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsTask_1: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsTask_1", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_1"});
    createModelsTask("ModelsTask_1",{"title":"sbt-1-ModelsTask-1-title"},parents);
    waitFor(matchesVerified("ModelsTask_1",1));
    updateModelsTask(getModelEntity("ModelsTask_1"),{"description":"sbt-1-ModelsTask_1-updated"});
    waitFor(matchesVerified("ModelsTask_1",2));
});

// Instance ModelsTask_2: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsTask_2", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_2"});
    createModelsTask("ModelsTask_2",{"title":"sbt-1-ModelsTask-2-title"},parents);
    waitFor(matchesVerified("ModelsTask_2",1));
    updateModelsTask(getModelEntity("ModelsTask_2"),{"description":"sbt-1-ModelsTask_2-updated"});
    waitFor(matchesVerified("ModelsTask_2",2));
});

// Instance ModelsTask_3: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsTask_3", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_3"});
    createModelsTask("ModelsTask_3",{"title":"sbt-1-ModelsTask-3-title"},parents);
    waitFor(matchesVerified("ModelsTask_3",1));
    updateModelsTask(getModelEntity("ModelsTask_3"),{"description":"sbt-1-ModelsTask_3-updated"});
    waitFor(matchesVerified("ModelsTask_3",2));
});

// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsLabelAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsLabel") return;
    verifyModelsLabel(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsLabel_1: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsLabel_1", function() {
    var parents=waitForDependencies([],{});
    createModelsLabel("ModelsLabel_1",{"title":"sbt-1-ModelsLabel-1-title"},parents);
    waitFor(matchesVerified("ModelsLabel_1",1));
    updateModelsLabel(getModelEntity("ModelsLabel_1"),{"description":"sbt-1-ModelsLabel_1-updated"});
    waitFor(matchesVerified("ModelsLabel_1",2));
});

// Instance ModelsLabel_2: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsLabel_2", function() {
    var parents=waitForDependencies([],{});
    createModelsLabel("ModelsLabel_2",{"title":"sbt-1-ModelsLabel-2-title"},parents);
    waitFor(matchesVerified("ModelsLabel_2",1));
    updateModelsLabel(getModelEntity("ModelsLabel_2"),{"description":"sbt-1-ModelsLabel_2-updated"});
    waitFor(matchesVerified("ModelsLabel_2",2));
});

// Instance ModelsLabel_3: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsLabel_3", function() {
    var parents=waitForDependencies([],{});
    createModelsLabel("ModelsLabel_3",{"title":"sbt-1-ModelsLabel-3-title"},parents);
    waitFor(matchesVerified("ModelsLabel_3",1));
    updateModelsLabel(getModelEntity("ModelsLabel_3"),{"description":"sbt-1-ModelsLabel_3-updated"});
    waitFor(matchesVerified("ModelsLabel_3",2));
});

// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsSavedFilterAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsSavedFilter") return;
    verifyModelsSavedFilter(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsSavedFilter_1: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsSavedFilter_1", function() {
    var parents=waitForDependencies([],{});
    createModelsSavedFilter("ModelsSavedFilter_1",{"title":"sbt-1-ModelsSavedFilter-1-title","filters":{"filter":"done = false"}},parents);
    waitFor(matchesVerified("ModelsSavedFilter_1",1));
});

// Instance ModelsSavedFilter_2: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsSavedFilter_2", function() {
    var parents=waitForDependencies([],{});
    createModelsSavedFilter("ModelsSavedFilter_2",{"title":"sbt-1-ModelsSavedFilter-2-title","filters":{"filter":"done = false"}},parents);
    waitFor(matchesVerified("ModelsSavedFilter_2",1));
});

// Instance ModelsSavedFilter_3: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsSavedFilter_3", function() {
    var parents=waitForDependencies([],{});
    createModelsSavedFilter("ModelsSavedFilter_3",{"title":"sbt-1-ModelsSavedFilter-3-title","filters":{"filter":"done = false"}},parents);
    waitFor(matchesVerified("ModelsSavedFilter_3",1));
});

// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsLinkSharingAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsLinkSharing") return;
    verifyModelsLinkSharing(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsLinkSharing_1: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsLinkSharing_1", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_1"});
    createModelsLinkSharing("ModelsLinkSharing_1",{"created":"sbt-1-ModelsLinkSharing-1-created"},parents);
    waitFor(matchesVerified("ModelsLinkSharing_1",1));
});

// Instance ModelsLinkSharing_2: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsLinkSharing_2", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_2"});
    createModelsLinkSharing("ModelsLinkSharing_2",{"created":"sbt-1-ModelsLinkSharing-2-created"},parents);
    waitFor(matchesVerified("ModelsLinkSharing_2",1));
});

// Instance ModelsLinkSharing_3: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsLinkSharing_3", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_3"});
    createModelsLinkSharing("ModelsLinkSharing_3",{"created":"sbt-1-ModelsLinkSharing-3-created"},parents);
    waitFor(matchesVerified("ModelsLinkSharing_3",1));
});

// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsProjectViewAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsProjectView") return;
    verifyModelsProjectView(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsProjectView_1: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsProjectView_1", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_1"});
    createModelsProjectView("ModelsProjectView_1",{"title":"sbt-1-ModelsProjectView-1-title"},parents);
    waitFor(matchesVerified("ModelsProjectView_1",1));
    updateModelsProjectView(getModelEntity("ModelsProjectView_1"),{"bucket_configuration_mode":"none"});
    waitFor(matchesVerified("ModelsProjectView_1",2));
});

// Instance ModelsProjectView_2: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsProjectView_2", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_2"});
    createModelsProjectView("ModelsProjectView_2",{"title":"sbt-1-ModelsProjectView-2-title"},parents);
    waitFor(matchesVerified("ModelsProjectView_2",1));
    updateModelsProjectView(getModelEntity("ModelsProjectView_2"),{"bucket_configuration_mode":"none"});
    waitFor(matchesVerified("ModelsProjectView_2",2));
});

// Instance ModelsProjectView_3: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsProjectView_3", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_3"});
    createModelsProjectView("ModelsProjectView_3",{"title":"sbt-1-ModelsProjectView-3-title"},parents);
    waitFor(matchesVerified("ModelsProjectView_3",1));
    updateModelsProjectView(getModelEntity("ModelsProjectView_3"),{"bucket_configuration_mode":"none"});
    waitFor(matchesVerified("ModelsProjectView_3",2));
});

// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsTaskCommentAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsTaskComment") return;
    verifyModelsTaskComment(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsTaskComment_1: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsTaskComment_1", function() {
    var parents=waitForDependencies(["ModelsTask"],{"ModelsTask":"ModelsTask_1"});
    createModelsTaskComment("ModelsTaskComment_1",{"comment":"sbt-1-ModelsTaskComment-1-comment"},parents);
    waitFor(matchesVerified("ModelsTaskComment_1",1));
});

// Instance ModelsTaskComment_2: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsTaskComment_2", function() {
    var parents=waitForDependencies(["ModelsTask"],{"ModelsTask":"ModelsTask_2"});
    createModelsTaskComment("ModelsTaskComment_2",{"comment":"sbt-1-ModelsTaskComment-2-comment"},parents);
    waitFor(matchesVerified("ModelsTaskComment_2",1));
});

// Instance ModelsTaskComment_3: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsTaskComment_3", function() {
    var parents=waitForDependencies(["ModelsTask"],{"ModelsTask":"ModelsTask_3"});
    createModelsTaskComment("ModelsTaskComment_3",{"comment":"sbt-1-ModelsTaskComment-3-comment"},parents);
    waitFor(matchesVerified("ModelsTaskComment_3",1));
});

// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsTeamAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsTeam") return;
    verifyModelsTeam(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsTeam_1: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsTeam_1", function() {
    var parents=waitForDependencies([],{});
    createModelsTeam("ModelsTeam_1",{"name":"sbt-1-ModelsTeam-1-name"},parents);
    waitFor(matchesVerified("ModelsTeam_1",1));
    updateModelsTeam(getModelEntity("ModelsTeam_1"),{"description":"sbt-1-ModelsTeam_1-updated"});
    waitFor(matchesVerified("ModelsTeam_1",2));
});

// Instance ModelsTeam_2: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsTeam_2", function() {
    var parents=waitForDependencies([],{});
    createModelsTeam("ModelsTeam_2",{"name":"sbt-1-ModelsTeam-2-name"},parents);
    waitFor(matchesVerified("ModelsTeam_2",1));
    updateModelsTeam(getModelEntity("ModelsTeam_2"),{"description":"sbt-1-ModelsTeam_2-updated"});
    waitFor(matchesVerified("ModelsTeam_2",2));
});

// Instance ModelsTeam_3: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsTeam_3", function() {
    var parents=waitForDependencies([],{});
    createModelsTeam("ModelsTeam_3",{"name":"sbt-1-ModelsTeam-3-name"},parents);
    waitFor(matchesVerified("ModelsTeam_3",1));
    updateModelsTeam(getModelEntity("ModelsTeam_3"),{"description":"sbt-1-ModelsTeam_3-updated"});
    waitFor(matchesVerified("ModelsTeam_3",2));
});
bthread("initialize negative Context rules",function(){request(bp.Event("NegativeCatalogReady",{rules:[{"id":"ModelsProject/background_blur_hash/TYPE_NUMBER","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/background_blur_hash/TYPE_BOOLEAN","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/background_blur_hash/TYPE_ARRAY","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/background_blur_hash/TYPE_OBJECT","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/created/TYPE_NUMBER","resource":"ModelsProject","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/created/TYPE_BOOLEAN","resource":"ModelsProject","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/created/TYPE_ARRAY","resource":"ModelsProject","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/created/TYPE_OBJECT","resource":"ModelsProject","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/description/TYPE_NUMBER","resource":"ModelsProject","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/description/TYPE_BOOLEAN","resource":"ModelsProject","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/description/TYPE_ARRAY","resource":"ModelsProject","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/description/TYPE_OBJECT","resource":"ModelsProject","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/hex_color/TYPE_NUMBER","resource":"ModelsProject","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/hex_color/TYPE_BOOLEAN","resource":"ModelsProject","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/hex_color/TYPE_ARRAY","resource":"ModelsProject","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/hex_color/TYPE_OBJECT","resource":"ModelsProject","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/hex_color/MAX_LENGTH","resource":"ModelsProject","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Project/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/id/TYPE_STRING","resource":"ModelsProject","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/id/type","schema_pointer":"#/components/schemas/models.Project/properties/id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/id/INTEGER_FRACTION","resource":"ModelsProject","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/id/type","schema_pointer":"#/components/schemas/models.Project/properties/id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/identifier/TYPE_NUMBER","resource":"ModelsProject","field":"identifier","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/identifier/TYPE_BOOLEAN","resource":"ModelsProject","field":"identifier","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/identifier/TYPE_ARRAY","resource":"ModelsProject","field":"identifier","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/identifier/TYPE_OBJECT","resource":"ModelsProject","field":"identifier","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/identifier/MAX_LENGTH","resource":"ModelsProject","field":"identifier","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxx","constraint":"maxLength","declared_constraint":10,"source_pointer":"#/definitions/models.Project/properties/identifier/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/identifier/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/is_archived/TYPE_STRING","resource":"ModelsProject","field":"is_archived","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Project/properties/is_archived/type","schema_pointer":"#/components/schemas/models.Project/properties/is_archived/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/is_favorite/TYPE_STRING","resource":"ModelsProject","field":"is_favorite","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Project/properties/is_favorite/type","schema_pointer":"#/components/schemas/models.Project/properties/is_favorite/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/max_permission/TYPE_STRING","resource":"ModelsProject","field":"max_permission","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Permission/type","schema_pointer":"#/components/schemas/models.Permission/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/max_permission/INTEGER_FRACTION","resource":"ModelsProject","field":"max_permission","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Permission/type","schema_pointer":"#/components/schemas/models.Permission/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":["enum"]},{"id":"ModelsProject/max_permission/ENUM","resource":"ModelsProject","field":"max_permission","kind":"ENUM","mutation":"replace","invalid_value":918273645,"constraint":"enum","declared_constraint":[0,1,2],"source_pointer":"#/definitions/models.Permission/enum","schema_pointer":"#/components/schemas/models.Permission/enum","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/parent_project_id/TYPE_STRING","resource":"ModelsProject","field":"parent_project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/parent_project_id/type","schema_pointer":"#/components/schemas/models.Project/properties/parent_project_id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/parent_project_id/INTEGER_FRACTION","resource":"ModelsProject","field":"parent_project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/parent_project_id/type","schema_pointer":"#/components/schemas/models.Project/properties/parent_project_id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/position/TYPE_STRING","resource":"ModelsProject","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Project/properties/position/type","schema_pointer":"#/components/schemas/models.Project/properties/position/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/TYPE_NUMBER","resource":"ModelsProject","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/TYPE_BOOLEAN","resource":"ModelsProject","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/TYPE_ARRAY","resource":"ModelsProject","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/TYPE_OBJECT","resource":"ModelsProject","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/MIN_LENGTH","resource":"ModelsProject","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Project/properties/title/minLength","schema_pointer":"#/components/schemas/models.Project/properties/title/minLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/MAX_LENGTH","resource":"ModelsProject","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Project/properties/title/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/title/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/updated/TYPE_NUMBER","resource":"ModelsProject","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/updated/TYPE_BOOLEAN","resource":"ModelsProject","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/updated/TYPE_ARRAY","resource":"ModelsProject","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/updated/TYPE_OBJECT","resource":"ModelsProject","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/views/TYPE_STRING","resource":"ModelsProject","field":"views","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Project/properties/views/type","schema_pointer":"#/components/schemas/models.Project/properties/views/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/assignees/TYPE_STRING","resource":"ModelsTask","field":"assignees","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/assignees/type","schema_pointer":"#/components/schemas/models.Task/properties/assignees/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/attachments/TYPE_STRING","resource":"ModelsTask","field":"attachments","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/attachments/type","schema_pointer":"#/components/schemas/models.Task/properties/attachments/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/bucket_id/TYPE_STRING","resource":"ModelsTask","field":"bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/bucket_id/type","schema_pointer":"#/components/schemas/models.Task/properties/bucket_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/bucket_id/INTEGER_FRACTION","resource":"ModelsTask","field":"bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/bucket_id/type","schema_pointer":"#/components/schemas/models.Task/properties/bucket_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/buckets/TYPE_STRING","resource":"ModelsTask","field":"buckets","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/buckets/type","schema_pointer":"#/components/schemas/models.Task/properties/buckets/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/comment_count/TYPE_STRING","resource":"ModelsTask","field":"comment_count","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/comment_count/type","schema_pointer":"#/components/schemas/models.Task/properties/comment_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/comment_count/INTEGER_FRACTION","resource":"ModelsTask","field":"comment_count","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/comment_count/type","schema_pointer":"#/components/schemas/models.Task/properties/comment_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/comments/TYPE_STRING","resource":"ModelsTask","field":"comments","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/comments/type","schema_pointer":"#/components/schemas/models.Task/properties/comments/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/cover_image_attachment_id/TYPE_STRING","resource":"ModelsTask","field":"cover_image_attachment_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/cover_image_attachment_id/type","schema_pointer":"#/components/schemas/models.Task/properties/cover_image_attachment_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/cover_image_attachment_id/INTEGER_FRACTION","resource":"ModelsTask","field":"cover_image_attachment_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/cover_image_attachment_id/type","schema_pointer":"#/components/schemas/models.Task/properties/cover_image_attachment_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/created/TYPE_NUMBER","resource":"ModelsTask","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/created/TYPE_BOOLEAN","resource":"ModelsTask","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/created/TYPE_ARRAY","resource":"ModelsTask","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/created/TYPE_OBJECT","resource":"ModelsTask","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/deleted_at/TYPE_NUMBER","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/deleted_at/TYPE_BOOLEAN","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/deleted_at/TYPE_ARRAY","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/deleted_at/TYPE_OBJECT","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/description/TYPE_NUMBER","resource":"ModelsTask","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/description/TYPE_BOOLEAN","resource":"ModelsTask","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/description/TYPE_ARRAY","resource":"ModelsTask","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/description/TYPE_OBJECT","resource":"ModelsTask","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/done/TYPE_STRING","resource":"ModelsTask","field":"done","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/done/type","schema_pointer":"#/components/schemas/models.Task/properties/done/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/done_at/TYPE_NUMBER","resource":"ModelsTask","field":"done_at","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/done_at/TYPE_BOOLEAN","resource":"ModelsTask","field":"done_at","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/done_at/TYPE_ARRAY","resource":"ModelsTask","field":"done_at","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/done_at/TYPE_OBJECT","resource":"ModelsTask","field":"done_at","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/due_date/TYPE_NUMBER","resource":"ModelsTask","field":"due_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/due_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"due_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/due_date/TYPE_ARRAY","resource":"ModelsTask","field":"due_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/due_date/TYPE_OBJECT","resource":"ModelsTask","field":"due_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/end_date/TYPE_NUMBER","resource":"ModelsTask","field":"end_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/end_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"end_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/end_date/TYPE_ARRAY","resource":"ModelsTask","field":"end_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/end_date/TYPE_OBJECT","resource":"ModelsTask","field":"end_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/hex_color/TYPE_NUMBER","resource":"ModelsTask","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/hex_color/TYPE_BOOLEAN","resource":"ModelsTask","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/hex_color/TYPE_ARRAY","resource":"ModelsTask","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/hex_color/TYPE_OBJECT","resource":"ModelsTask","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/hex_color/MAX_LENGTH","resource":"ModelsTask","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Task/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/maxLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/id/TYPE_STRING","resource":"ModelsTask","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/id/type","schema_pointer":"#/components/schemas/models.Task/properties/id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/id/INTEGER_FRACTION","resource":"ModelsTask","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/id/type","schema_pointer":"#/components/schemas/models.Task/properties/id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/identifier/TYPE_NUMBER","resource":"ModelsTask","field":"identifier","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/identifier/TYPE_BOOLEAN","resource":"ModelsTask","field":"identifier","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/identifier/TYPE_ARRAY","resource":"ModelsTask","field":"identifier","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/identifier/TYPE_OBJECT","resource":"ModelsTask","field":"identifier","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/index/TYPE_STRING","resource":"ModelsTask","field":"index","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/index/type","schema_pointer":"#/components/schemas/models.Task/properties/index/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/index/INTEGER_FRACTION","resource":"ModelsTask","field":"index","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/index/type","schema_pointer":"#/components/schemas/models.Task/properties/index/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/is_favorite/TYPE_STRING","resource":"ModelsTask","field":"is_favorite","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/is_favorite/type","schema_pointer":"#/components/schemas/models.Task/properties/is_favorite/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/is_unread/TYPE_STRING","resource":"ModelsTask","field":"is_unread","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/is_unread/type","schema_pointer":"#/components/schemas/models.Task/properties/is_unread/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/labels/TYPE_STRING","resource":"ModelsTask","field":"labels","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/labels/type","schema_pointer":"#/components/schemas/models.Task/properties/labels/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/percent_done/TYPE_STRING","resource":"ModelsTask","field":"percent_done","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Task/properties/percent_done/type","schema_pointer":"#/components/schemas/models.Task/properties/percent_done/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/position/TYPE_STRING","resource":"ModelsTask","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Task/properties/position/type","schema_pointer":"#/components/schemas/models.Task/properties/position/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/priority/TYPE_STRING","resource":"ModelsTask","field":"priority","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/priority/type","schema_pointer":"#/components/schemas/models.Task/properties/priority/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/priority/INTEGER_FRACTION","resource":"ModelsTask","field":"priority","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/priority/type","schema_pointer":"#/components/schemas/models.Task/properties/priority/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/project_id/TYPE_STRING","resource":"ModelsTask","field":"project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/project_id/type","schema_pointer":"#/components/schemas/models.Task/properties/project_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/project_id/INTEGER_FRACTION","resource":"ModelsTask","field":"project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/project_id/type","schema_pointer":"#/components/schemas/models.Task/properties/project_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/reminders/TYPE_STRING","resource":"ModelsTask","field":"reminders","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/reminders/type","schema_pointer":"#/components/schemas/models.Task/properties/reminders/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/repeat_after/TYPE_STRING","resource":"ModelsTask","field":"repeat_after","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/repeat_after/type","schema_pointer":"#/components/schemas/models.Task/properties/repeat_after/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/repeat_after/INTEGER_FRACTION","resource":"ModelsTask","field":"repeat_after","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/repeat_after/type","schema_pointer":"#/components/schemas/models.Task/properties/repeat_after/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/start_date/TYPE_NUMBER","resource":"ModelsTask","field":"start_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/start_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"start_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/start_date/TYPE_ARRAY","resource":"ModelsTask","field":"start_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/start_date/TYPE_OBJECT","resource":"ModelsTask","field":"start_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/time_entries_count/TYPE_STRING","resource":"ModelsTask","field":"time_entries_count","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/time_entries_count/type","schema_pointer":"#/components/schemas/models.Task/properties/time_entries_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/time_entries_count/INTEGER_FRACTION","resource":"ModelsTask","field":"time_entries_count","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/time_entries_count/type","schema_pointer":"#/components/schemas/models.Task/properties/time_entries_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/TYPE_NUMBER","resource":"ModelsTask","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/TYPE_BOOLEAN","resource":"ModelsTask","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/TYPE_ARRAY","resource":"ModelsTask","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/TYPE_OBJECT","resource":"ModelsTask","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/MIN_LENGTH","resource":"ModelsTask","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Task/properties/title/minLength","schema_pointer":"#/components/schemas/models.Task/properties/title/minLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/updated/TYPE_NUMBER","resource":"ModelsTask","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/updated/TYPE_BOOLEAN","resource":"ModelsTask","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/updated/TYPE_ARRAY","resource":"ModelsTask","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/updated/TYPE_OBJECT","resource":"ModelsTask","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsLabel/created/TYPE_NUMBER","resource":"ModelsLabel","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/created/TYPE_BOOLEAN","resource":"ModelsLabel","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/created/TYPE_ARRAY","resource":"ModelsLabel","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/created/TYPE_OBJECT","resource":"ModelsLabel","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/description/TYPE_NUMBER","resource":"ModelsLabel","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/description/TYPE_BOOLEAN","resource":"ModelsLabel","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/description/TYPE_ARRAY","resource":"ModelsLabel","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/description/TYPE_OBJECT","resource":"ModelsLabel","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/hex_color/TYPE_NUMBER","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/hex_color/TYPE_BOOLEAN","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/hex_color/TYPE_ARRAY","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/hex_color/TYPE_OBJECT","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/hex_color/MAX_LENGTH","resource":"ModelsLabel","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Label/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/maxLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/id/TYPE_STRING","resource":"ModelsLabel","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Label/properties/id/type","schema_pointer":"#/components/schemas/models.Label/properties/id/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/id/INTEGER_FRACTION","resource":"ModelsLabel","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Label/properties/id/type","schema_pointer":"#/components/schemas/models.Label/properties/id/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/TYPE_NUMBER","resource":"ModelsLabel","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/TYPE_BOOLEAN","resource":"ModelsLabel","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/TYPE_ARRAY","resource":"ModelsLabel","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/TYPE_OBJECT","resource":"ModelsLabel","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/MIN_LENGTH","resource":"ModelsLabel","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Label/properties/title/minLength","schema_pointer":"#/components/schemas/models.Label/properties/title/minLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/MAX_LENGTH","resource":"ModelsLabel","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Label/properties/title/maxLength","schema_pointer":"#/components/schemas/models.Label/properties/title/maxLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/updated/TYPE_NUMBER","resource":"ModelsLabel","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/updated/TYPE_BOOLEAN","resource":"ModelsLabel","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/updated/TYPE_ARRAY","resource":"ModelsLabel","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/updated/TYPE_OBJECT","resource":"ModelsLabel","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsProjectView/bucket_configuration/TYPE_STRING","resource":"ModelsProjectView","field":"bucket_configuration","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_NUMBER","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_ARRAY","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_OBJECT","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/bucket_configuration_mode/ENUM","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"ENUM","mutation":"replace","invalid_value":"outside-enum","constraint":"enum","declared_constraint":["none","manual","filter"],"source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/enum","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/enum","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/created/TYPE_NUMBER","resource":"ModelsProjectView","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/created/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/created/TYPE_ARRAY","resource":"ModelsProjectView","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/created/TYPE_OBJECT","resource":"ModelsProjectView","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/default_bucket_id/TYPE_STRING","resource":"ModelsProjectView","field":"default_bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/default_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/default_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/default_bucket_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"default_bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/default_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/default_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/done_bucket_id/TYPE_STRING","resource":"ModelsProjectView","field":"done_bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/done_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/done_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/done_bucket_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"done_bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/done_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/done_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/id/TYPE_STRING","resource":"ModelsProjectView","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/position/TYPE_STRING","resource":"ModelsProjectView","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.ProjectView/properties/position/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/position/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/project_id/TYPE_STRING","resource":"ModelsProjectView","field":"project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/project_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/project_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/project_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/project_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/project_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/TYPE_NUMBER","resource":"ModelsProjectView","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/TYPE_ARRAY","resource":"ModelsProjectView","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/TYPE_OBJECT","resource":"ModelsProjectView","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/MIN_LENGTH","resource":"ModelsProjectView","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.ProjectView/properties/title/minLength","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/minLength","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/MAX_LENGTH","resource":"ModelsProjectView","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.ProjectView/properties/title/maxLength","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/maxLength","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/updated/TYPE_NUMBER","resource":"ModelsProjectView","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/updated/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/updated/TYPE_ARRAY","resource":"ModelsProjectView","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/updated/TYPE_OBJECT","resource":"ModelsProjectView","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/view_kind/TYPE_NUMBER","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/view_kind/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/view_kind/TYPE_ARRAY","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/view_kind/TYPE_OBJECT","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/view_kind/ENUM","resource":"ModelsProjectView","field":"view_kind","kind":"ENUM","mutation":"replace","invalid_value":"outside-enum","constraint":"enum","declared_constraint":["list","gantt","table","kanban"],"source_pointer":"#/definitions/models.ProjectView/properties/view_kind/enum","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/enum","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/created/TYPE_NUMBER","resource":"ModelsTeam","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/created/TYPE_BOOLEAN","resource":"ModelsTeam","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/created/TYPE_ARRAY","resource":"ModelsTeam","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/created/TYPE_OBJECT","resource":"ModelsTeam","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/description/TYPE_NUMBER","resource":"ModelsTeam","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/description/TYPE_BOOLEAN","resource":"ModelsTeam","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/description/TYPE_ARRAY","resource":"ModelsTeam","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/description/TYPE_OBJECT","resource":"ModelsTeam","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/external_id/TYPE_NUMBER","resource":"ModelsTeam","field":"external_id","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/external_id/TYPE_BOOLEAN","resource":"ModelsTeam","field":"external_id","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/external_id/TYPE_ARRAY","resource":"ModelsTeam","field":"external_id","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/external_id/TYPE_OBJECT","resource":"ModelsTeam","field":"external_id","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/external_id/MAX_LENGTH","resource":"ModelsTeam","field":"external_id","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Team/properties/external_id/maxLength","schema_pointer":"#/components/schemas/models.Team/properties/external_id/maxLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/id/TYPE_STRING","resource":"ModelsTeam","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Team/properties/id/type","schema_pointer":"#/components/schemas/models.Team/properties/id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/id/INTEGER_FRACTION","resource":"ModelsTeam","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Team/properties/id/type","schema_pointer":"#/components/schemas/models.Team/properties/id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/is_public/TYPE_STRING","resource":"ModelsTeam","field":"is_public","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Team/properties/is_public/type","schema_pointer":"#/components/schemas/models.Team/properties/is_public/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/members/TYPE_STRING","resource":"ModelsTeam","field":"members","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Team/properties/members/type","schema_pointer":"#/components/schemas/models.Team/properties/members/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/TYPE_NUMBER","resource":"ModelsTeam","field":"name","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/TYPE_BOOLEAN","resource":"ModelsTeam","field":"name","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/TYPE_ARRAY","resource":"ModelsTeam","field":"name","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/TYPE_OBJECT","resource":"ModelsTeam","field":"name","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/MIN_LENGTH","resource":"ModelsTeam","field":"name","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Team/properties/name/minLength","schema_pointer":"#/components/schemas/models.Team/properties/name/minLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/MAX_LENGTH","resource":"ModelsTeam","field":"name","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Team/properties/name/maxLength","schema_pointer":"#/components/schemas/models.Team/properties/name/maxLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/updated/TYPE_NUMBER","resource":"ModelsTeam","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/updated/TYPE_BOOLEAN","resource":"ModelsTeam","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/updated/TYPE_ARRAY","resource":"ModelsTeam","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/updated/TYPE_OBJECT","resource":"ModelsTeam","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]}]}));});
ctx.bthread("negative verifier ModelsProject","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsProject")return;verifyNegativeModelsProject(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});
bthread("negative NEG_ModelsProject_1_0",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_0"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/background_blur_hash/TYPE_NUMBER","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_0"}));
});
bthread("negative NEG_ModelsProject_1_1",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_1"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/background_blur_hash/TYPE_BOOLEAN","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_1"}));
});
bthread("negative NEG_ModelsProject_1_2",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_2"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/background_blur_hash/TYPE_ARRAY","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_2"}));
});
bthread("negative NEG_ModelsProject_1_3",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_3"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/background_blur_hash/TYPE_OBJECT","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_3"}));
});
bthread("negative NEG_ModelsProject_1_4",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_4"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/created/TYPE_NUMBER","resource":"ModelsProject","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_4"}));
});
bthread("negative NEG_ModelsProject_1_5",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_5"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/created/TYPE_BOOLEAN","resource":"ModelsProject","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_5"}));
});
bthread("negative NEG_ModelsProject_1_6",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_6"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/created/TYPE_ARRAY","resource":"ModelsProject","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_6"}));
});
bthread("negative NEG_ModelsProject_1_7",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_7"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/created/TYPE_OBJECT","resource":"ModelsProject","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_7"}));
});
bthread("negative NEG_ModelsProject_1_8",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_8"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/description/TYPE_NUMBER","resource":"ModelsProject","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_8"}));
});
bthread("negative NEG_ModelsProject_1_9",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_9"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/description/TYPE_BOOLEAN","resource":"ModelsProject","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_9"}));
});
bthread("negative NEG_ModelsProject_1_10",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_10"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/description/TYPE_ARRAY","resource":"ModelsProject","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_10"}));
});
bthread("negative NEG_ModelsProject_1_11",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_11"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/description/TYPE_OBJECT","resource":"ModelsProject","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_11"}));
});
bthread("negative NEG_ModelsProject_1_12",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_12"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/hex_color/TYPE_NUMBER","resource":"ModelsProject","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_12"}));
});
bthread("negative NEG_ModelsProject_1_13",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_13"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/hex_color/TYPE_BOOLEAN","resource":"ModelsProject","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_13"}));
});
bthread("negative NEG_ModelsProject_1_14",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_14"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/hex_color/TYPE_ARRAY","resource":"ModelsProject","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_14"}));
});
bthread("negative NEG_ModelsProject_1_15",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_15"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/hex_color/TYPE_OBJECT","resource":"ModelsProject","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_15"}));
});
bthread("negative NEG_ModelsProject_1_16",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_16"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/hex_color/MAX_LENGTH","resource":"ModelsProject","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Project/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_16"}));
});
bthread("negative NEG_ModelsProject_1_17",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_17"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/id/TYPE_STRING","resource":"ModelsProject","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/id/type","schema_pointer":"#/components/schemas/models.Project/properties/id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_17"}));
});
bthread("negative NEG_ModelsProject_1_18",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_18"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/id/INTEGER_FRACTION","resource":"ModelsProject","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/id/type","schema_pointer":"#/components/schemas/models.Project/properties/id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_18"}));
});
bthread("negative NEG_ModelsProject_1_19",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_19"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/identifier/TYPE_NUMBER","resource":"ModelsProject","field":"identifier","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_19"}));
});
bthread("negative NEG_ModelsProject_1_20",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_20"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/identifier/TYPE_BOOLEAN","resource":"ModelsProject","field":"identifier","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_20"}));
});
bthread("negative NEG_ModelsProject_1_21",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_21"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/identifier/TYPE_ARRAY","resource":"ModelsProject","field":"identifier","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_21"}));
});
bthread("negative NEG_ModelsProject_1_22",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_22"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/identifier/TYPE_OBJECT","resource":"ModelsProject","field":"identifier","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_22"}));
});
bthread("negative NEG_ModelsProject_1_23",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_23"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/identifier/MAX_LENGTH","resource":"ModelsProject","field":"identifier","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxx","constraint":"maxLength","declared_constraint":10,"source_pointer":"#/definitions/models.Project/properties/identifier/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/identifier/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_23"}));
});
bthread("negative NEG_ModelsProject_1_24",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_24"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/is_archived/TYPE_STRING","resource":"ModelsProject","field":"is_archived","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Project/properties/is_archived/type","schema_pointer":"#/components/schemas/models.Project/properties/is_archived/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_24"}));
});
bthread("negative NEG_ModelsProject_1_25",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_25"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/is_favorite/TYPE_STRING","resource":"ModelsProject","field":"is_favorite","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Project/properties/is_favorite/type","schema_pointer":"#/components/schemas/models.Project/properties/is_favorite/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_25"}));
});
bthread("negative NEG_ModelsProject_1_26",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_26"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/max_permission/TYPE_STRING","resource":"ModelsProject","field":"max_permission","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Permission/type","schema_pointer":"#/components/schemas/models.Permission/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_26"}));
});
bthread("negative NEG_ModelsProject_1_27",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_27"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/max_permission/INTEGER_FRACTION","resource":"ModelsProject","field":"max_permission","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Permission/type","schema_pointer":"#/components/schemas/models.Permission/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":["enum"]},"NEG_ModelsProject_1_27");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_27"}));
});
bthread("negative NEG_ModelsProject_1_28",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_28"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/max_permission/ENUM","resource":"ModelsProject","field":"max_permission","kind":"ENUM","mutation":"replace","invalid_value":918273645,"constraint":"enum","declared_constraint":[0,1,2],"source_pointer":"#/definitions/models.Permission/enum","schema_pointer":"#/components/schemas/models.Permission/enum","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_28");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_28"}));
});
bthread("negative NEG_ModelsProject_1_29",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_29"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/parent_project_id/TYPE_STRING","resource":"ModelsProject","field":"parent_project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/parent_project_id/type","schema_pointer":"#/components/schemas/models.Project/properties/parent_project_id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_29");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_29"}));
});
bthread("negative NEG_ModelsProject_1_30",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_30"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/parent_project_id/INTEGER_FRACTION","resource":"ModelsProject","field":"parent_project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/parent_project_id/type","schema_pointer":"#/components/schemas/models.Project/properties/parent_project_id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_30");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_30"}));
});
bthread("negative NEG_ModelsProject_1_31",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_31"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/position/TYPE_STRING","resource":"ModelsProject","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Project/properties/position/type","schema_pointer":"#/components/schemas/models.Project/properties/position/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_31");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_31"}));
});
bthread("negative NEG_ModelsProject_1_32",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_32"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/title/TYPE_NUMBER","resource":"ModelsProject","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_32");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_32"}));
});
bthread("negative NEG_ModelsProject_1_33",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_33"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/title/TYPE_BOOLEAN","resource":"ModelsProject","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_33");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_33"}));
});
bthread("negative NEG_ModelsProject_1_34",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_34"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/title/TYPE_ARRAY","resource":"ModelsProject","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_34");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_34"}));
});
bthread("negative NEG_ModelsProject_1_35",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_35"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/title/TYPE_OBJECT","resource":"ModelsProject","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_35");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_35"}));
});
bthread("negative NEG_ModelsProject_1_36",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_36"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/title/MIN_LENGTH","resource":"ModelsProject","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Project/properties/title/minLength","schema_pointer":"#/components/schemas/models.Project/properties/title/minLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_36");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_36"}));
});
bthread("negative NEG_ModelsProject_1_37",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_37"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/title/MAX_LENGTH","resource":"ModelsProject","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Project/properties/title/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/title/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_37");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_37"}));
});
bthread("negative NEG_ModelsProject_1_38",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_38"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/updated/TYPE_NUMBER","resource":"ModelsProject","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_38");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_38"}));
});
bthread("negative NEG_ModelsProject_1_39",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_39"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/updated/TYPE_BOOLEAN","resource":"ModelsProject","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_39");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_39"}));
});
bthread("negative NEG_ModelsProject_1_40",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_40"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/updated/TYPE_ARRAY","resource":"ModelsProject","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_40");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_40"}));
});
bthread("negative NEG_ModelsProject_1_41",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_41"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/updated/TYPE_OBJECT","resource":"ModelsProject","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_41");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_41"}));
});
bthread("negative NEG_ModelsProject_1_42",function(){
    waitForResource("ModelsProject_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_42"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_1"),{"id":"ModelsProject/views/TYPE_STRING","resource":"ModelsProject","field":"views","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Project/properties/views/type","schema_pointer":"#/components/schemas/models.Project/properties/views/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_1_42");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_1",caseId:"NEG_ModelsProject_1_42"}));
});
bthread("negative NEG_ModelsProject_2_0",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_0"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/background_blur_hash/TYPE_NUMBER","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_0"}));
});
bthread("negative NEG_ModelsProject_2_1",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_1"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/background_blur_hash/TYPE_BOOLEAN","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_1"}));
});
bthread("negative NEG_ModelsProject_2_2",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_2"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/background_blur_hash/TYPE_ARRAY","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_2"}));
});
bthread("negative NEG_ModelsProject_2_3",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_3"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/background_blur_hash/TYPE_OBJECT","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_3"}));
});
bthread("negative NEG_ModelsProject_2_4",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_4"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/created/TYPE_NUMBER","resource":"ModelsProject","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_4"}));
});
bthread("negative NEG_ModelsProject_2_5",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_5"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/created/TYPE_BOOLEAN","resource":"ModelsProject","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_5"}));
});
bthread("negative NEG_ModelsProject_2_6",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_6"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/created/TYPE_ARRAY","resource":"ModelsProject","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_6"}));
});
bthread("negative NEG_ModelsProject_2_7",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_7"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/created/TYPE_OBJECT","resource":"ModelsProject","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_7"}));
});
bthread("negative NEG_ModelsProject_2_8",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_8"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/description/TYPE_NUMBER","resource":"ModelsProject","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_8"}));
});
bthread("negative NEG_ModelsProject_2_9",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_9"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/description/TYPE_BOOLEAN","resource":"ModelsProject","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_9"}));
});
bthread("negative NEG_ModelsProject_2_10",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_10"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/description/TYPE_ARRAY","resource":"ModelsProject","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_10"}));
});
bthread("negative NEG_ModelsProject_2_11",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_11"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/description/TYPE_OBJECT","resource":"ModelsProject","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_11"}));
});
bthread("negative NEG_ModelsProject_2_12",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_12"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/hex_color/TYPE_NUMBER","resource":"ModelsProject","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_12"}));
});
bthread("negative NEG_ModelsProject_2_13",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_13"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/hex_color/TYPE_BOOLEAN","resource":"ModelsProject","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_13"}));
});
bthread("negative NEG_ModelsProject_2_14",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_14"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/hex_color/TYPE_ARRAY","resource":"ModelsProject","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_14"}));
});
bthread("negative NEG_ModelsProject_2_15",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_15"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/hex_color/TYPE_OBJECT","resource":"ModelsProject","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_15"}));
});
bthread("negative NEG_ModelsProject_2_16",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_16"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/hex_color/MAX_LENGTH","resource":"ModelsProject","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Project/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_16"}));
});
bthread("negative NEG_ModelsProject_2_17",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_17"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/id/TYPE_STRING","resource":"ModelsProject","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/id/type","schema_pointer":"#/components/schemas/models.Project/properties/id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_17"}));
});
bthread("negative NEG_ModelsProject_2_18",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_18"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/id/INTEGER_FRACTION","resource":"ModelsProject","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/id/type","schema_pointer":"#/components/schemas/models.Project/properties/id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_18"}));
});
bthread("negative NEG_ModelsProject_2_19",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_19"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/identifier/TYPE_NUMBER","resource":"ModelsProject","field":"identifier","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_19"}));
});
bthread("negative NEG_ModelsProject_2_20",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_20"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/identifier/TYPE_BOOLEAN","resource":"ModelsProject","field":"identifier","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_20"}));
});
bthread("negative NEG_ModelsProject_2_21",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_21"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/identifier/TYPE_ARRAY","resource":"ModelsProject","field":"identifier","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_21"}));
});
bthread("negative NEG_ModelsProject_2_22",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_22"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/identifier/TYPE_OBJECT","resource":"ModelsProject","field":"identifier","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_22"}));
});
bthread("negative NEG_ModelsProject_2_23",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_23"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/identifier/MAX_LENGTH","resource":"ModelsProject","field":"identifier","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxx","constraint":"maxLength","declared_constraint":10,"source_pointer":"#/definitions/models.Project/properties/identifier/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/identifier/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_23"}));
});
bthread("negative NEG_ModelsProject_2_24",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_24"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/is_archived/TYPE_STRING","resource":"ModelsProject","field":"is_archived","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Project/properties/is_archived/type","schema_pointer":"#/components/schemas/models.Project/properties/is_archived/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_24"}));
});
bthread("negative NEG_ModelsProject_2_25",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_25"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/is_favorite/TYPE_STRING","resource":"ModelsProject","field":"is_favorite","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Project/properties/is_favorite/type","schema_pointer":"#/components/schemas/models.Project/properties/is_favorite/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_25"}));
});
bthread("negative NEG_ModelsProject_2_26",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_26"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/max_permission/TYPE_STRING","resource":"ModelsProject","field":"max_permission","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Permission/type","schema_pointer":"#/components/schemas/models.Permission/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_26"}));
});
bthread("negative NEG_ModelsProject_2_27",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_27"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/max_permission/INTEGER_FRACTION","resource":"ModelsProject","field":"max_permission","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Permission/type","schema_pointer":"#/components/schemas/models.Permission/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":["enum"]},"NEG_ModelsProject_2_27");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_27"}));
});
bthread("negative NEG_ModelsProject_2_28",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_28"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/max_permission/ENUM","resource":"ModelsProject","field":"max_permission","kind":"ENUM","mutation":"replace","invalid_value":918273645,"constraint":"enum","declared_constraint":[0,1,2],"source_pointer":"#/definitions/models.Permission/enum","schema_pointer":"#/components/schemas/models.Permission/enum","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_28");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_28"}));
});
bthread("negative NEG_ModelsProject_2_29",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_29"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/parent_project_id/TYPE_STRING","resource":"ModelsProject","field":"parent_project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/parent_project_id/type","schema_pointer":"#/components/schemas/models.Project/properties/parent_project_id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_29");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_29"}));
});
bthread("negative NEG_ModelsProject_2_30",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_30"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/parent_project_id/INTEGER_FRACTION","resource":"ModelsProject","field":"parent_project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/parent_project_id/type","schema_pointer":"#/components/schemas/models.Project/properties/parent_project_id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_30");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_30"}));
});
bthread("negative NEG_ModelsProject_2_31",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_31"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/position/TYPE_STRING","resource":"ModelsProject","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Project/properties/position/type","schema_pointer":"#/components/schemas/models.Project/properties/position/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_31");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_31"}));
});
bthread("negative NEG_ModelsProject_2_32",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_32"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/title/TYPE_NUMBER","resource":"ModelsProject","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_32");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_32"}));
});
bthread("negative NEG_ModelsProject_2_33",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_33"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/title/TYPE_BOOLEAN","resource":"ModelsProject","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_33");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_33"}));
});
bthread("negative NEG_ModelsProject_2_34",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_34"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/title/TYPE_ARRAY","resource":"ModelsProject","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_34");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_34"}));
});
bthread("negative NEG_ModelsProject_2_35",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_35"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/title/TYPE_OBJECT","resource":"ModelsProject","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_35");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_35"}));
});
bthread("negative NEG_ModelsProject_2_36",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_36"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/title/MIN_LENGTH","resource":"ModelsProject","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Project/properties/title/minLength","schema_pointer":"#/components/schemas/models.Project/properties/title/minLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_36");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_36"}));
});
bthread("negative NEG_ModelsProject_2_37",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_37"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/title/MAX_LENGTH","resource":"ModelsProject","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Project/properties/title/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/title/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_37");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_37"}));
});
bthread("negative NEG_ModelsProject_2_38",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_38"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/updated/TYPE_NUMBER","resource":"ModelsProject","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_38");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_38"}));
});
bthread("negative NEG_ModelsProject_2_39",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_39"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/updated/TYPE_BOOLEAN","resource":"ModelsProject","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_39");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_39"}));
});
bthread("negative NEG_ModelsProject_2_40",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_40"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/updated/TYPE_ARRAY","resource":"ModelsProject","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_40");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_40"}));
});
bthread("negative NEG_ModelsProject_2_41",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_41"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/updated/TYPE_OBJECT","resource":"ModelsProject","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_41");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_41"}));
});
bthread("negative NEG_ModelsProject_2_42",function(){
    waitForResource("ModelsProject_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_42"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_2"),{"id":"ModelsProject/views/TYPE_STRING","resource":"ModelsProject","field":"views","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Project/properties/views/type","schema_pointer":"#/components/schemas/models.Project/properties/views/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_2_42");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_2",caseId:"NEG_ModelsProject_2_42"}));
});
bthread("negative NEG_ModelsProject_3_0",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_0"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/background_blur_hash/TYPE_NUMBER","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_0"}));
});
bthread("negative NEG_ModelsProject_3_1",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_1"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/background_blur_hash/TYPE_BOOLEAN","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_1"}));
});
bthread("negative NEG_ModelsProject_3_2",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_2"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/background_blur_hash/TYPE_ARRAY","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_2"}));
});
bthread("negative NEG_ModelsProject_3_3",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_3"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/background_blur_hash/TYPE_OBJECT","resource":"ModelsProject","field":"background_blur_hash","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/background_blur_hash/type","schema_pointer":"#/components/schemas/models.Project/properties/background_blur_hash/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_3"}));
});
bthread("negative NEG_ModelsProject_3_4",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_4"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/created/TYPE_NUMBER","resource":"ModelsProject","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_4"}));
});
bthread("negative NEG_ModelsProject_3_5",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_5"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/created/TYPE_BOOLEAN","resource":"ModelsProject","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_5"}));
});
bthread("negative NEG_ModelsProject_3_6",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_6"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/created/TYPE_ARRAY","resource":"ModelsProject","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_6"}));
});
bthread("negative NEG_ModelsProject_3_7",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_7"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/created/TYPE_OBJECT","resource":"ModelsProject","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/created/type","schema_pointer":"#/components/schemas/models.Project/properties/created/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_7"}));
});
bthread("negative NEG_ModelsProject_3_8",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_8"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/description/TYPE_NUMBER","resource":"ModelsProject","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_8"}));
});
bthread("negative NEG_ModelsProject_3_9",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_9"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/description/TYPE_BOOLEAN","resource":"ModelsProject","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_9"}));
});
bthread("negative NEG_ModelsProject_3_10",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_10"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/description/TYPE_ARRAY","resource":"ModelsProject","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_10"}));
});
bthread("negative NEG_ModelsProject_3_11",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_11"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/description/TYPE_OBJECT","resource":"ModelsProject","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_11"}));
});
bthread("negative NEG_ModelsProject_3_12",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_12"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/hex_color/TYPE_NUMBER","resource":"ModelsProject","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_12"}));
});
bthread("negative NEG_ModelsProject_3_13",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_13"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/hex_color/TYPE_BOOLEAN","resource":"ModelsProject","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_13"}));
});
bthread("negative NEG_ModelsProject_3_14",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_14"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/hex_color/TYPE_ARRAY","resource":"ModelsProject","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_14"}));
});
bthread("negative NEG_ModelsProject_3_15",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_15"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/hex_color/TYPE_OBJECT","resource":"ModelsProject","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_15"}));
});
bthread("negative NEG_ModelsProject_3_16",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_16"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/hex_color/MAX_LENGTH","resource":"ModelsProject","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Project/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_16"}));
});
bthread("negative NEG_ModelsProject_3_17",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_17"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/id/TYPE_STRING","resource":"ModelsProject","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/id/type","schema_pointer":"#/components/schemas/models.Project/properties/id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_17"}));
});
bthread("negative NEG_ModelsProject_3_18",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_18"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/id/INTEGER_FRACTION","resource":"ModelsProject","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/id/type","schema_pointer":"#/components/schemas/models.Project/properties/id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_18"}));
});
bthread("negative NEG_ModelsProject_3_19",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_19"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/identifier/TYPE_NUMBER","resource":"ModelsProject","field":"identifier","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_19"}));
});
bthread("negative NEG_ModelsProject_3_20",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_20"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/identifier/TYPE_BOOLEAN","resource":"ModelsProject","field":"identifier","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_20"}));
});
bthread("negative NEG_ModelsProject_3_21",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_21"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/identifier/TYPE_ARRAY","resource":"ModelsProject","field":"identifier","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_21"}));
});
bthread("negative NEG_ModelsProject_3_22",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_22"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/identifier/TYPE_OBJECT","resource":"ModelsProject","field":"identifier","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_22"}));
});
bthread("negative NEG_ModelsProject_3_23",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_23"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/identifier/MAX_LENGTH","resource":"ModelsProject","field":"identifier","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxx","constraint":"maxLength","declared_constraint":10,"source_pointer":"#/definitions/models.Project/properties/identifier/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/identifier/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_23"}));
});
bthread("negative NEG_ModelsProject_3_24",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_24"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/is_archived/TYPE_STRING","resource":"ModelsProject","field":"is_archived","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Project/properties/is_archived/type","schema_pointer":"#/components/schemas/models.Project/properties/is_archived/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_24"}));
});
bthread("negative NEG_ModelsProject_3_25",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_25"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/is_favorite/TYPE_STRING","resource":"ModelsProject","field":"is_favorite","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Project/properties/is_favorite/type","schema_pointer":"#/components/schemas/models.Project/properties/is_favorite/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_25"}));
});
bthread("negative NEG_ModelsProject_3_26",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_26"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/max_permission/TYPE_STRING","resource":"ModelsProject","field":"max_permission","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Permission/type","schema_pointer":"#/components/schemas/models.Permission/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_26"}));
});
bthread("negative NEG_ModelsProject_3_27",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_27"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/max_permission/INTEGER_FRACTION","resource":"ModelsProject","field":"max_permission","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Permission/type","schema_pointer":"#/components/schemas/models.Permission/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":["enum"]},"NEG_ModelsProject_3_27");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_27"}));
});
bthread("negative NEG_ModelsProject_3_28",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_28"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/max_permission/ENUM","resource":"ModelsProject","field":"max_permission","kind":"ENUM","mutation":"replace","invalid_value":918273645,"constraint":"enum","declared_constraint":[0,1,2],"source_pointer":"#/definitions/models.Permission/enum","schema_pointer":"#/components/schemas/models.Permission/enum","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_28");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_28"}));
});
bthread("negative NEG_ModelsProject_3_29",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_29"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/parent_project_id/TYPE_STRING","resource":"ModelsProject","field":"parent_project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/parent_project_id/type","schema_pointer":"#/components/schemas/models.Project/properties/parent_project_id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_29");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_29"}));
});
bthread("negative NEG_ModelsProject_3_30",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_30"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/parent_project_id/INTEGER_FRACTION","resource":"ModelsProject","field":"parent_project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Project/properties/parent_project_id/type","schema_pointer":"#/components/schemas/models.Project/properties/parent_project_id/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_30");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_30"}));
});
bthread("negative NEG_ModelsProject_3_31",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_31"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/position/TYPE_STRING","resource":"ModelsProject","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Project/properties/position/type","schema_pointer":"#/components/schemas/models.Project/properties/position/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_31");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_31"}));
});
bthread("negative NEG_ModelsProject_3_32",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_32"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/title/TYPE_NUMBER","resource":"ModelsProject","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_32");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_32"}));
});
bthread("negative NEG_ModelsProject_3_33",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_33"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/title/TYPE_BOOLEAN","resource":"ModelsProject","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_33");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_33"}));
});
bthread("negative NEG_ModelsProject_3_34",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_34"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/title/TYPE_ARRAY","resource":"ModelsProject","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_34");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_34"}));
});
bthread("negative NEG_ModelsProject_3_35",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_35"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/title/TYPE_OBJECT","resource":"ModelsProject","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_35");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_35"}));
});
bthread("negative NEG_ModelsProject_3_36",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_36"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/title/MIN_LENGTH","resource":"ModelsProject","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Project/properties/title/minLength","schema_pointer":"#/components/schemas/models.Project/properties/title/minLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_36");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_36"}));
});
bthread("negative NEG_ModelsProject_3_37",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_37"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/title/MAX_LENGTH","resource":"ModelsProject","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Project/properties/title/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/title/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_37");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_37"}));
});
bthread("negative NEG_ModelsProject_3_38",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_38"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/updated/TYPE_NUMBER","resource":"ModelsProject","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_38");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_38"}));
});
bthread("negative NEG_ModelsProject_3_39",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_39"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/updated/TYPE_BOOLEAN","resource":"ModelsProject","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_39");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_39"}));
});
bthread("negative NEG_ModelsProject_3_40",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_40"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/updated/TYPE_ARRAY","resource":"ModelsProject","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_40");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_40"}));
});
bthread("negative NEG_ModelsProject_3_41",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_41"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/updated/TYPE_OBJECT","resource":"ModelsProject","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/updated/type","schema_pointer":"#/components/schemas/models.Project/properties/updated/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_41");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_41"}));
});
bthread("negative NEG_ModelsProject_3_42",function(){
    waitForResource("ModelsProject_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_42"}));
    attemptNegativeModelsProject(getModelEntity("ModelsProject_3"),{"id":"ModelsProject/views/TYPE_STRING","resource":"ModelsProject","field":"views","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Project/properties/views/type","schema_pointer":"#/components/schemas/models.Project/properties/views/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsProject_3_42");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProject_3",caseId:"NEG_ModelsProject_3_42"}));
});
ctx.bthread("negative verifier ModelsTask","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsTask")return;verifyNegativeModelsTask(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});
bthread("negative NEG_ModelsTask_1_0",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_0"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/assignees/TYPE_STRING","resource":"ModelsTask","field":"assignees","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/assignees/type","schema_pointer":"#/components/schemas/models.Task/properties/assignees/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_0"}));
});
bthread("negative NEG_ModelsTask_1_1",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_1"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/attachments/TYPE_STRING","resource":"ModelsTask","field":"attachments","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/attachments/type","schema_pointer":"#/components/schemas/models.Task/properties/attachments/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_1"}));
});
bthread("negative NEG_ModelsTask_1_2",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_2"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/bucket_id/TYPE_STRING","resource":"ModelsTask","field":"bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/bucket_id/type","schema_pointer":"#/components/schemas/models.Task/properties/bucket_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_2"}));
});
bthread("negative NEG_ModelsTask_1_3",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_3"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/bucket_id/INTEGER_FRACTION","resource":"ModelsTask","field":"bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/bucket_id/type","schema_pointer":"#/components/schemas/models.Task/properties/bucket_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_3"}));
});
bthread("negative NEG_ModelsTask_1_4",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_4"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/buckets/TYPE_STRING","resource":"ModelsTask","field":"buckets","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/buckets/type","schema_pointer":"#/components/schemas/models.Task/properties/buckets/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_4"}));
});
bthread("negative NEG_ModelsTask_1_5",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_5"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/comment_count/TYPE_STRING","resource":"ModelsTask","field":"comment_count","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/comment_count/type","schema_pointer":"#/components/schemas/models.Task/properties/comment_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_5"}));
});
bthread("negative NEG_ModelsTask_1_6",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_6"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/comment_count/INTEGER_FRACTION","resource":"ModelsTask","field":"comment_count","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/comment_count/type","schema_pointer":"#/components/schemas/models.Task/properties/comment_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_6"}));
});
bthread("negative NEG_ModelsTask_1_7",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_7"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/comments/TYPE_STRING","resource":"ModelsTask","field":"comments","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/comments/type","schema_pointer":"#/components/schemas/models.Task/properties/comments/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_7"}));
});
bthread("negative NEG_ModelsTask_1_8",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_8"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/cover_image_attachment_id/TYPE_STRING","resource":"ModelsTask","field":"cover_image_attachment_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/cover_image_attachment_id/type","schema_pointer":"#/components/schemas/models.Task/properties/cover_image_attachment_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_8"}));
});
bthread("negative NEG_ModelsTask_1_9",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_9"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/cover_image_attachment_id/INTEGER_FRACTION","resource":"ModelsTask","field":"cover_image_attachment_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/cover_image_attachment_id/type","schema_pointer":"#/components/schemas/models.Task/properties/cover_image_attachment_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_9"}));
});
bthread("negative NEG_ModelsTask_1_10",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_10"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/created/TYPE_NUMBER","resource":"ModelsTask","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_10"}));
});
bthread("negative NEG_ModelsTask_1_11",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_11"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/created/TYPE_BOOLEAN","resource":"ModelsTask","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_11"}));
});
bthread("negative NEG_ModelsTask_1_12",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_12"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/created/TYPE_ARRAY","resource":"ModelsTask","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_12"}));
});
bthread("negative NEG_ModelsTask_1_13",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_13"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/created/TYPE_OBJECT","resource":"ModelsTask","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_13"}));
});
bthread("negative NEG_ModelsTask_1_14",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_14"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/deleted_at/TYPE_NUMBER","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_14"}));
});
bthread("negative NEG_ModelsTask_1_15",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_15"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/deleted_at/TYPE_BOOLEAN","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_15"}));
});
bthread("negative NEG_ModelsTask_1_16",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_16"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/deleted_at/TYPE_ARRAY","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_16"}));
});
bthread("negative NEG_ModelsTask_1_17",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_17"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/deleted_at/TYPE_OBJECT","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_17"}));
});
bthread("negative NEG_ModelsTask_1_18",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_18"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/description/TYPE_NUMBER","resource":"ModelsTask","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_18"}));
});
bthread("negative NEG_ModelsTask_1_19",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_19"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/description/TYPE_BOOLEAN","resource":"ModelsTask","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_19"}));
});
bthread("negative NEG_ModelsTask_1_20",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_20"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/description/TYPE_ARRAY","resource":"ModelsTask","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_20"}));
});
bthread("negative NEG_ModelsTask_1_21",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_21"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/description/TYPE_OBJECT","resource":"ModelsTask","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_21"}));
});
bthread("negative NEG_ModelsTask_1_22",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_22"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/done/TYPE_STRING","resource":"ModelsTask","field":"done","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/done/type","schema_pointer":"#/components/schemas/models.Task/properties/done/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_22"}));
});
bthread("negative NEG_ModelsTask_1_23",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_23"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/done_at/TYPE_NUMBER","resource":"ModelsTask","field":"done_at","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_23"}));
});
bthread("negative NEG_ModelsTask_1_24",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_24"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/done_at/TYPE_BOOLEAN","resource":"ModelsTask","field":"done_at","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_24"}));
});
bthread("negative NEG_ModelsTask_1_25",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_25"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/done_at/TYPE_ARRAY","resource":"ModelsTask","field":"done_at","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_25"}));
});
bthread("negative NEG_ModelsTask_1_26",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_26"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/done_at/TYPE_OBJECT","resource":"ModelsTask","field":"done_at","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_26"}));
});
bthread("negative NEG_ModelsTask_1_27",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_27"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/due_date/TYPE_NUMBER","resource":"ModelsTask","field":"due_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_27");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_27"}));
});
bthread("negative NEG_ModelsTask_1_28",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_28"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/due_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"due_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_28");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_28"}));
});
bthread("negative NEG_ModelsTask_1_29",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_29"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/due_date/TYPE_ARRAY","resource":"ModelsTask","field":"due_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_29");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_29"}));
});
bthread("negative NEG_ModelsTask_1_30",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_30"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/due_date/TYPE_OBJECT","resource":"ModelsTask","field":"due_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_30");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_30"}));
});
bthread("negative NEG_ModelsTask_1_31",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_31"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/end_date/TYPE_NUMBER","resource":"ModelsTask","field":"end_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_31");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_31"}));
});
bthread("negative NEG_ModelsTask_1_32",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_32"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/end_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"end_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_32");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_32"}));
});
bthread("negative NEG_ModelsTask_1_33",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_33"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/end_date/TYPE_ARRAY","resource":"ModelsTask","field":"end_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_33");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_33"}));
});
bthread("negative NEG_ModelsTask_1_34",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_34"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/end_date/TYPE_OBJECT","resource":"ModelsTask","field":"end_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_34");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_34"}));
});
bthread("negative NEG_ModelsTask_1_35",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_35"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/hex_color/TYPE_NUMBER","resource":"ModelsTask","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_35");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_35"}));
});
bthread("negative NEG_ModelsTask_1_36",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_36"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/hex_color/TYPE_BOOLEAN","resource":"ModelsTask","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_36");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_36"}));
});
bthread("negative NEG_ModelsTask_1_37",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_37"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/hex_color/TYPE_ARRAY","resource":"ModelsTask","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_37");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_37"}));
});
bthread("negative NEG_ModelsTask_1_38",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_38"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/hex_color/TYPE_OBJECT","resource":"ModelsTask","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_38");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_38"}));
});
bthread("negative NEG_ModelsTask_1_39",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_39"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/hex_color/MAX_LENGTH","resource":"ModelsTask","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Task/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/maxLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_39");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_39"}));
});
bthread("negative NEG_ModelsTask_1_40",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_40"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/id/TYPE_STRING","resource":"ModelsTask","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/id/type","schema_pointer":"#/components/schemas/models.Task/properties/id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_40");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_40"}));
});
bthread("negative NEG_ModelsTask_1_41",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_41"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/id/INTEGER_FRACTION","resource":"ModelsTask","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/id/type","schema_pointer":"#/components/schemas/models.Task/properties/id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_41");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_41"}));
});
bthread("negative NEG_ModelsTask_1_42",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_42"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/identifier/TYPE_NUMBER","resource":"ModelsTask","field":"identifier","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_42");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_42"}));
});
bthread("negative NEG_ModelsTask_1_43",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_43"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/identifier/TYPE_BOOLEAN","resource":"ModelsTask","field":"identifier","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_43");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_43"}));
});
bthread("negative NEG_ModelsTask_1_44",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_44"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/identifier/TYPE_ARRAY","resource":"ModelsTask","field":"identifier","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_44");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_44"}));
});
bthread("negative NEG_ModelsTask_1_45",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_45"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/identifier/TYPE_OBJECT","resource":"ModelsTask","field":"identifier","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_45");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_45"}));
});
bthread("negative NEG_ModelsTask_1_46",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_46"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/index/TYPE_STRING","resource":"ModelsTask","field":"index","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/index/type","schema_pointer":"#/components/schemas/models.Task/properties/index/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_46");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_46"}));
});
bthread("negative NEG_ModelsTask_1_47",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_47"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/index/INTEGER_FRACTION","resource":"ModelsTask","field":"index","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/index/type","schema_pointer":"#/components/schemas/models.Task/properties/index/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_47");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_47"}));
});
bthread("negative NEG_ModelsTask_1_48",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_48"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/is_favorite/TYPE_STRING","resource":"ModelsTask","field":"is_favorite","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/is_favorite/type","schema_pointer":"#/components/schemas/models.Task/properties/is_favorite/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_48");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_48"}));
});
bthread("negative NEG_ModelsTask_1_49",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_49"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/is_unread/TYPE_STRING","resource":"ModelsTask","field":"is_unread","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/is_unread/type","schema_pointer":"#/components/schemas/models.Task/properties/is_unread/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_49");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_49"}));
});
bthread("negative NEG_ModelsTask_1_50",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_50"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/labels/TYPE_STRING","resource":"ModelsTask","field":"labels","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/labels/type","schema_pointer":"#/components/schemas/models.Task/properties/labels/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_50");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_50"}));
});
bthread("negative NEG_ModelsTask_1_51",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_51"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/percent_done/TYPE_STRING","resource":"ModelsTask","field":"percent_done","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Task/properties/percent_done/type","schema_pointer":"#/components/schemas/models.Task/properties/percent_done/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_51");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_51"}));
});
bthread("negative NEG_ModelsTask_1_52",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_52"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/position/TYPE_STRING","resource":"ModelsTask","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Task/properties/position/type","schema_pointer":"#/components/schemas/models.Task/properties/position/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_52");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_52"}));
});
bthread("negative NEG_ModelsTask_1_53",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_53"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/priority/TYPE_STRING","resource":"ModelsTask","field":"priority","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/priority/type","schema_pointer":"#/components/schemas/models.Task/properties/priority/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_53");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_53"}));
});
bthread("negative NEG_ModelsTask_1_54",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_54"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/priority/INTEGER_FRACTION","resource":"ModelsTask","field":"priority","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/priority/type","schema_pointer":"#/components/schemas/models.Task/properties/priority/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_54");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_54"}));
});
bthread("negative NEG_ModelsTask_1_55",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_55"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/project_id/TYPE_STRING","resource":"ModelsTask","field":"project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/project_id/type","schema_pointer":"#/components/schemas/models.Task/properties/project_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_55");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_55"}));
});
bthread("negative NEG_ModelsTask_1_56",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_56"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/project_id/INTEGER_FRACTION","resource":"ModelsTask","field":"project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/project_id/type","schema_pointer":"#/components/schemas/models.Task/properties/project_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_56");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_56"}));
});
bthread("negative NEG_ModelsTask_1_57",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_57"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/reminders/TYPE_STRING","resource":"ModelsTask","field":"reminders","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/reminders/type","schema_pointer":"#/components/schemas/models.Task/properties/reminders/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_57");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_57"}));
});
bthread("negative NEG_ModelsTask_1_58",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_58"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/repeat_after/TYPE_STRING","resource":"ModelsTask","field":"repeat_after","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/repeat_after/type","schema_pointer":"#/components/schemas/models.Task/properties/repeat_after/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_58");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_58"}));
});
bthread("negative NEG_ModelsTask_1_59",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_59"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/repeat_after/INTEGER_FRACTION","resource":"ModelsTask","field":"repeat_after","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/repeat_after/type","schema_pointer":"#/components/schemas/models.Task/properties/repeat_after/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_59");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_59"}));
});
bthread("negative NEG_ModelsTask_1_60",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_60"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/start_date/TYPE_NUMBER","resource":"ModelsTask","field":"start_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_60");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_60"}));
});
bthread("negative NEG_ModelsTask_1_61",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_61"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/start_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"start_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_61");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_61"}));
});
bthread("negative NEG_ModelsTask_1_62",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_62"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/start_date/TYPE_ARRAY","resource":"ModelsTask","field":"start_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_62");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_62"}));
});
bthread("negative NEG_ModelsTask_1_63",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_63"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/start_date/TYPE_OBJECT","resource":"ModelsTask","field":"start_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_63");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_63"}));
});
bthread("negative NEG_ModelsTask_1_64",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_64"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/time_entries_count/TYPE_STRING","resource":"ModelsTask","field":"time_entries_count","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/time_entries_count/type","schema_pointer":"#/components/schemas/models.Task/properties/time_entries_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_64");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_64"}));
});
bthread("negative NEG_ModelsTask_1_65",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_65"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/time_entries_count/INTEGER_FRACTION","resource":"ModelsTask","field":"time_entries_count","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/time_entries_count/type","schema_pointer":"#/components/schemas/models.Task/properties/time_entries_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_65");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_65"}));
});
bthread("negative NEG_ModelsTask_1_66",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_66"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/title/TYPE_NUMBER","resource":"ModelsTask","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_66");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_66"}));
});
bthread("negative NEG_ModelsTask_1_67",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_67"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/title/TYPE_BOOLEAN","resource":"ModelsTask","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_67");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_67"}));
});
bthread("negative NEG_ModelsTask_1_68",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_68"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/title/TYPE_ARRAY","resource":"ModelsTask","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_68");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_68"}));
});
bthread("negative NEG_ModelsTask_1_69",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_69"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/title/TYPE_OBJECT","resource":"ModelsTask","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_69");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_69"}));
});
bthread("negative NEG_ModelsTask_1_70",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_70"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/title/MIN_LENGTH","resource":"ModelsTask","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Task/properties/title/minLength","schema_pointer":"#/components/schemas/models.Task/properties/title/minLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_70");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_70"}));
});
bthread("negative NEG_ModelsTask_1_71",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_71"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/updated/TYPE_NUMBER","resource":"ModelsTask","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_71");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_71"}));
});
bthread("negative NEG_ModelsTask_1_72",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_72"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/updated/TYPE_BOOLEAN","resource":"ModelsTask","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_72");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_72"}));
});
bthread("negative NEG_ModelsTask_1_73",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_73"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/updated/TYPE_ARRAY","resource":"ModelsTask","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_73");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_73"}));
});
bthread("negative NEG_ModelsTask_1_74",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_74"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/updated/TYPE_OBJECT","resource":"ModelsTask","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_74");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_74"}));
});
bthread("negative NEG_ModelsTask_2_0",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_0"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/assignees/TYPE_STRING","resource":"ModelsTask","field":"assignees","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/assignees/type","schema_pointer":"#/components/schemas/models.Task/properties/assignees/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_0"}));
});
bthread("negative NEG_ModelsTask_2_1",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_1"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/attachments/TYPE_STRING","resource":"ModelsTask","field":"attachments","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/attachments/type","schema_pointer":"#/components/schemas/models.Task/properties/attachments/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_1"}));
});
bthread("negative NEG_ModelsTask_2_2",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_2"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/bucket_id/TYPE_STRING","resource":"ModelsTask","field":"bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/bucket_id/type","schema_pointer":"#/components/schemas/models.Task/properties/bucket_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_2"}));
});
bthread("negative NEG_ModelsTask_2_3",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_3"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/bucket_id/INTEGER_FRACTION","resource":"ModelsTask","field":"bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/bucket_id/type","schema_pointer":"#/components/schemas/models.Task/properties/bucket_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_3"}));
});
bthread("negative NEG_ModelsTask_2_4",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_4"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/buckets/TYPE_STRING","resource":"ModelsTask","field":"buckets","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/buckets/type","schema_pointer":"#/components/schemas/models.Task/properties/buckets/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_4"}));
});
bthread("negative NEG_ModelsTask_2_5",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_5"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/comment_count/TYPE_STRING","resource":"ModelsTask","field":"comment_count","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/comment_count/type","schema_pointer":"#/components/schemas/models.Task/properties/comment_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_5"}));
});
bthread("negative NEG_ModelsTask_2_6",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_6"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/comment_count/INTEGER_FRACTION","resource":"ModelsTask","field":"comment_count","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/comment_count/type","schema_pointer":"#/components/schemas/models.Task/properties/comment_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_6"}));
});
bthread("negative NEG_ModelsTask_2_7",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_7"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/comments/TYPE_STRING","resource":"ModelsTask","field":"comments","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/comments/type","schema_pointer":"#/components/schemas/models.Task/properties/comments/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_7"}));
});
bthread("negative NEG_ModelsTask_2_8",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_8"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/cover_image_attachment_id/TYPE_STRING","resource":"ModelsTask","field":"cover_image_attachment_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/cover_image_attachment_id/type","schema_pointer":"#/components/schemas/models.Task/properties/cover_image_attachment_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_8"}));
});
bthread("negative NEG_ModelsTask_2_9",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_9"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/cover_image_attachment_id/INTEGER_FRACTION","resource":"ModelsTask","field":"cover_image_attachment_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/cover_image_attachment_id/type","schema_pointer":"#/components/schemas/models.Task/properties/cover_image_attachment_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_9"}));
});
bthread("negative NEG_ModelsTask_2_10",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_10"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/created/TYPE_NUMBER","resource":"ModelsTask","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_10"}));
});
bthread("negative NEG_ModelsTask_2_11",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_11"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/created/TYPE_BOOLEAN","resource":"ModelsTask","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_11"}));
});
bthread("negative NEG_ModelsTask_2_12",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_12"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/created/TYPE_ARRAY","resource":"ModelsTask","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_12"}));
});
bthread("negative NEG_ModelsTask_2_13",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_13"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/created/TYPE_OBJECT","resource":"ModelsTask","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_13"}));
});
bthread("negative NEG_ModelsTask_2_14",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_14"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/deleted_at/TYPE_NUMBER","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_14"}));
});
bthread("negative NEG_ModelsTask_2_15",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_15"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/deleted_at/TYPE_BOOLEAN","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_15"}));
});
bthread("negative NEG_ModelsTask_2_16",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_16"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/deleted_at/TYPE_ARRAY","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_16"}));
});
bthread("negative NEG_ModelsTask_2_17",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_17"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/deleted_at/TYPE_OBJECT","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_17"}));
});
bthread("negative NEG_ModelsTask_2_18",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_18"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/description/TYPE_NUMBER","resource":"ModelsTask","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_18"}));
});
bthread("negative NEG_ModelsTask_2_19",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_19"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/description/TYPE_BOOLEAN","resource":"ModelsTask","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_19"}));
});
bthread("negative NEG_ModelsTask_2_20",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_20"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/description/TYPE_ARRAY","resource":"ModelsTask","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_20"}));
});
bthread("negative NEG_ModelsTask_2_21",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_21"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/description/TYPE_OBJECT","resource":"ModelsTask","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_21"}));
});
bthread("negative NEG_ModelsTask_2_22",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_22"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/done/TYPE_STRING","resource":"ModelsTask","field":"done","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/done/type","schema_pointer":"#/components/schemas/models.Task/properties/done/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_22"}));
});
bthread("negative NEG_ModelsTask_2_23",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_23"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/done_at/TYPE_NUMBER","resource":"ModelsTask","field":"done_at","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_23"}));
});
bthread("negative NEG_ModelsTask_2_24",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_24"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/done_at/TYPE_BOOLEAN","resource":"ModelsTask","field":"done_at","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_24"}));
});
bthread("negative NEG_ModelsTask_2_25",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_25"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/done_at/TYPE_ARRAY","resource":"ModelsTask","field":"done_at","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_25"}));
});
bthread("negative NEG_ModelsTask_2_26",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_26"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/done_at/TYPE_OBJECT","resource":"ModelsTask","field":"done_at","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_26"}));
});
bthread("negative NEG_ModelsTask_2_27",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_27"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/due_date/TYPE_NUMBER","resource":"ModelsTask","field":"due_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_27");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_27"}));
});
bthread("negative NEG_ModelsTask_2_28",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_28"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/due_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"due_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_28");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_28"}));
});
bthread("negative NEG_ModelsTask_2_29",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_29"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/due_date/TYPE_ARRAY","resource":"ModelsTask","field":"due_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_29");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_29"}));
});
bthread("negative NEG_ModelsTask_2_30",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_30"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/due_date/TYPE_OBJECT","resource":"ModelsTask","field":"due_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_30");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_30"}));
});
bthread("negative NEG_ModelsTask_2_31",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_31"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/end_date/TYPE_NUMBER","resource":"ModelsTask","field":"end_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_31");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_31"}));
});
bthread("negative NEG_ModelsTask_2_32",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_32"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/end_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"end_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_32");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_32"}));
});
bthread("negative NEG_ModelsTask_2_33",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_33"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/end_date/TYPE_ARRAY","resource":"ModelsTask","field":"end_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_33");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_33"}));
});
bthread("negative NEG_ModelsTask_2_34",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_34"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/end_date/TYPE_OBJECT","resource":"ModelsTask","field":"end_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_34");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_34"}));
});
bthread("negative NEG_ModelsTask_2_35",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_35"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/hex_color/TYPE_NUMBER","resource":"ModelsTask","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_35");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_35"}));
});
bthread("negative NEG_ModelsTask_2_36",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_36"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/hex_color/TYPE_BOOLEAN","resource":"ModelsTask","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_36");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_36"}));
});
bthread("negative NEG_ModelsTask_2_37",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_37"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/hex_color/TYPE_ARRAY","resource":"ModelsTask","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_37");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_37"}));
});
bthread("negative NEG_ModelsTask_2_38",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_38"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/hex_color/TYPE_OBJECT","resource":"ModelsTask","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_38");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_38"}));
});
bthread("negative NEG_ModelsTask_2_39",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_39"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/hex_color/MAX_LENGTH","resource":"ModelsTask","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Task/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/maxLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_39");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_39"}));
});
bthread("negative NEG_ModelsTask_2_40",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_40"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/id/TYPE_STRING","resource":"ModelsTask","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/id/type","schema_pointer":"#/components/schemas/models.Task/properties/id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_40");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_40"}));
});
bthread("negative NEG_ModelsTask_2_41",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_41"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/id/INTEGER_FRACTION","resource":"ModelsTask","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/id/type","schema_pointer":"#/components/schemas/models.Task/properties/id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_41");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_41"}));
});
bthread("negative NEG_ModelsTask_2_42",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_42"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/identifier/TYPE_NUMBER","resource":"ModelsTask","field":"identifier","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_42");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_42"}));
});
bthread("negative NEG_ModelsTask_2_43",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_43"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/identifier/TYPE_BOOLEAN","resource":"ModelsTask","field":"identifier","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_43");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_43"}));
});
bthread("negative NEG_ModelsTask_2_44",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_44"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/identifier/TYPE_ARRAY","resource":"ModelsTask","field":"identifier","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_44");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_44"}));
});
bthread("negative NEG_ModelsTask_2_45",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_45"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/identifier/TYPE_OBJECT","resource":"ModelsTask","field":"identifier","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_45");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_45"}));
});
bthread("negative NEG_ModelsTask_2_46",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_46"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/index/TYPE_STRING","resource":"ModelsTask","field":"index","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/index/type","schema_pointer":"#/components/schemas/models.Task/properties/index/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_46");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_46"}));
});
bthread("negative NEG_ModelsTask_2_47",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_47"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/index/INTEGER_FRACTION","resource":"ModelsTask","field":"index","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/index/type","schema_pointer":"#/components/schemas/models.Task/properties/index/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_47");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_47"}));
});
bthread("negative NEG_ModelsTask_2_48",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_48"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/is_favorite/TYPE_STRING","resource":"ModelsTask","field":"is_favorite","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/is_favorite/type","schema_pointer":"#/components/schemas/models.Task/properties/is_favorite/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_48");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_48"}));
});
bthread("negative NEG_ModelsTask_2_49",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_49"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/is_unread/TYPE_STRING","resource":"ModelsTask","field":"is_unread","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/is_unread/type","schema_pointer":"#/components/schemas/models.Task/properties/is_unread/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_49");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_49"}));
});
bthread("negative NEG_ModelsTask_2_50",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_50"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/labels/TYPE_STRING","resource":"ModelsTask","field":"labels","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/labels/type","schema_pointer":"#/components/schemas/models.Task/properties/labels/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_50");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_50"}));
});
bthread("negative NEG_ModelsTask_2_51",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_51"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/percent_done/TYPE_STRING","resource":"ModelsTask","field":"percent_done","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Task/properties/percent_done/type","schema_pointer":"#/components/schemas/models.Task/properties/percent_done/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_51");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_51"}));
});
bthread("negative NEG_ModelsTask_2_52",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_52"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/position/TYPE_STRING","resource":"ModelsTask","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Task/properties/position/type","schema_pointer":"#/components/schemas/models.Task/properties/position/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_52");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_52"}));
});
bthread("negative NEG_ModelsTask_2_53",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_53"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/priority/TYPE_STRING","resource":"ModelsTask","field":"priority","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/priority/type","schema_pointer":"#/components/schemas/models.Task/properties/priority/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_53");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_53"}));
});
bthread("negative NEG_ModelsTask_2_54",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_54"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/priority/INTEGER_FRACTION","resource":"ModelsTask","field":"priority","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/priority/type","schema_pointer":"#/components/schemas/models.Task/properties/priority/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_54");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_54"}));
});
bthread("negative NEG_ModelsTask_2_55",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_55"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/project_id/TYPE_STRING","resource":"ModelsTask","field":"project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/project_id/type","schema_pointer":"#/components/schemas/models.Task/properties/project_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_55");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_55"}));
});
bthread("negative NEG_ModelsTask_2_56",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_56"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/project_id/INTEGER_FRACTION","resource":"ModelsTask","field":"project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/project_id/type","schema_pointer":"#/components/schemas/models.Task/properties/project_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_56");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_56"}));
});
bthread("negative NEG_ModelsTask_2_57",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_57"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/reminders/TYPE_STRING","resource":"ModelsTask","field":"reminders","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/reminders/type","schema_pointer":"#/components/schemas/models.Task/properties/reminders/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_57");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_57"}));
});
bthread("negative NEG_ModelsTask_2_58",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_58"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/repeat_after/TYPE_STRING","resource":"ModelsTask","field":"repeat_after","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/repeat_after/type","schema_pointer":"#/components/schemas/models.Task/properties/repeat_after/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_58");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_58"}));
});
bthread("negative NEG_ModelsTask_2_59",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_59"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/repeat_after/INTEGER_FRACTION","resource":"ModelsTask","field":"repeat_after","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/repeat_after/type","schema_pointer":"#/components/schemas/models.Task/properties/repeat_after/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_59");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_59"}));
});
bthread("negative NEG_ModelsTask_2_60",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_60"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/start_date/TYPE_NUMBER","resource":"ModelsTask","field":"start_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_60");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_60"}));
});
bthread("negative NEG_ModelsTask_2_61",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_61"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/start_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"start_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_61");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_61"}));
});
bthread("negative NEG_ModelsTask_2_62",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_62"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/start_date/TYPE_ARRAY","resource":"ModelsTask","field":"start_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_62");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_62"}));
});
bthread("negative NEG_ModelsTask_2_63",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_63"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/start_date/TYPE_OBJECT","resource":"ModelsTask","field":"start_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_63");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_63"}));
});
bthread("negative NEG_ModelsTask_2_64",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_64"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/time_entries_count/TYPE_STRING","resource":"ModelsTask","field":"time_entries_count","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/time_entries_count/type","schema_pointer":"#/components/schemas/models.Task/properties/time_entries_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_64");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_64"}));
});
bthread("negative NEG_ModelsTask_2_65",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_65"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/time_entries_count/INTEGER_FRACTION","resource":"ModelsTask","field":"time_entries_count","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/time_entries_count/type","schema_pointer":"#/components/schemas/models.Task/properties/time_entries_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_65");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_65"}));
});
bthread("negative NEG_ModelsTask_2_66",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_66"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/title/TYPE_NUMBER","resource":"ModelsTask","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_66");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_66"}));
});
bthread("negative NEG_ModelsTask_2_67",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_67"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/title/TYPE_BOOLEAN","resource":"ModelsTask","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_67");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_67"}));
});
bthread("negative NEG_ModelsTask_2_68",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_68"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/title/TYPE_ARRAY","resource":"ModelsTask","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_68");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_68"}));
});
bthread("negative NEG_ModelsTask_2_69",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_69"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/title/TYPE_OBJECT","resource":"ModelsTask","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_69");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_69"}));
});
bthread("negative NEG_ModelsTask_2_70",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_70"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/title/MIN_LENGTH","resource":"ModelsTask","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Task/properties/title/minLength","schema_pointer":"#/components/schemas/models.Task/properties/title/minLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_70");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_70"}));
});
bthread("negative NEG_ModelsTask_2_71",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_71"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/updated/TYPE_NUMBER","resource":"ModelsTask","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_71");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_71"}));
});
bthread("negative NEG_ModelsTask_2_72",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_72"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/updated/TYPE_BOOLEAN","resource":"ModelsTask","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_72");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_72"}));
});
bthread("negative NEG_ModelsTask_2_73",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_73"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/updated/TYPE_ARRAY","resource":"ModelsTask","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_73");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_73"}));
});
bthread("negative NEG_ModelsTask_2_74",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_74"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/updated/TYPE_OBJECT","resource":"ModelsTask","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_74");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_74"}));
});
bthread("negative NEG_ModelsTask_3_0",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_0"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/assignees/TYPE_STRING","resource":"ModelsTask","field":"assignees","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/assignees/type","schema_pointer":"#/components/schemas/models.Task/properties/assignees/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_0"}));
});
bthread("negative NEG_ModelsTask_3_1",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_1"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/attachments/TYPE_STRING","resource":"ModelsTask","field":"attachments","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/attachments/type","schema_pointer":"#/components/schemas/models.Task/properties/attachments/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_1"}));
});
bthread("negative NEG_ModelsTask_3_2",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_2"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/bucket_id/TYPE_STRING","resource":"ModelsTask","field":"bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/bucket_id/type","schema_pointer":"#/components/schemas/models.Task/properties/bucket_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_2"}));
});
bthread("negative NEG_ModelsTask_3_3",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_3"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/bucket_id/INTEGER_FRACTION","resource":"ModelsTask","field":"bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/bucket_id/type","schema_pointer":"#/components/schemas/models.Task/properties/bucket_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_3"}));
});
bthread("negative NEG_ModelsTask_3_4",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_4"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/buckets/TYPE_STRING","resource":"ModelsTask","field":"buckets","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/buckets/type","schema_pointer":"#/components/schemas/models.Task/properties/buckets/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_4"}));
});
bthread("negative NEG_ModelsTask_3_5",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_5"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/comment_count/TYPE_STRING","resource":"ModelsTask","field":"comment_count","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/comment_count/type","schema_pointer":"#/components/schemas/models.Task/properties/comment_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_5"}));
});
bthread("negative NEG_ModelsTask_3_6",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_6"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/comment_count/INTEGER_FRACTION","resource":"ModelsTask","field":"comment_count","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/comment_count/type","schema_pointer":"#/components/schemas/models.Task/properties/comment_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_6"}));
});
bthread("negative NEG_ModelsTask_3_7",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_7"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/comments/TYPE_STRING","resource":"ModelsTask","field":"comments","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/comments/type","schema_pointer":"#/components/schemas/models.Task/properties/comments/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_7"}));
});
bthread("negative NEG_ModelsTask_3_8",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_8"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/cover_image_attachment_id/TYPE_STRING","resource":"ModelsTask","field":"cover_image_attachment_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/cover_image_attachment_id/type","schema_pointer":"#/components/schemas/models.Task/properties/cover_image_attachment_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_8"}));
});
bthread("negative NEG_ModelsTask_3_9",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_9"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/cover_image_attachment_id/INTEGER_FRACTION","resource":"ModelsTask","field":"cover_image_attachment_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/cover_image_attachment_id/type","schema_pointer":"#/components/schemas/models.Task/properties/cover_image_attachment_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_9"}));
});
bthread("negative NEG_ModelsTask_3_10",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_10"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/created/TYPE_NUMBER","resource":"ModelsTask","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_10"}));
});
bthread("negative NEG_ModelsTask_3_11",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_11"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/created/TYPE_BOOLEAN","resource":"ModelsTask","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_11"}));
});
bthread("negative NEG_ModelsTask_3_12",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_12"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/created/TYPE_ARRAY","resource":"ModelsTask","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_12"}));
});
bthread("negative NEG_ModelsTask_3_13",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_13"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/created/TYPE_OBJECT","resource":"ModelsTask","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/created/type","schema_pointer":"#/components/schemas/models.Task/properties/created/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_13"}));
});
bthread("negative NEG_ModelsTask_3_14",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_14"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/deleted_at/TYPE_NUMBER","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_14"}));
});
bthread("negative NEG_ModelsTask_3_15",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_15"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/deleted_at/TYPE_BOOLEAN","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_15"}));
});
bthread("negative NEG_ModelsTask_3_16",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_16"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/deleted_at/TYPE_ARRAY","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_16"}));
});
bthread("negative NEG_ModelsTask_3_17",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_17"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/deleted_at/TYPE_OBJECT","resource":"ModelsTask","field":"deleted_at","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/deleted_at/type","schema_pointer":"#/components/schemas/models.Task/properties/deleted_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_17"}));
});
bthread("negative NEG_ModelsTask_3_18",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_18"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/description/TYPE_NUMBER","resource":"ModelsTask","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_18"}));
});
bthread("negative NEG_ModelsTask_3_19",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_19"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/description/TYPE_BOOLEAN","resource":"ModelsTask","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_19"}));
});
bthread("negative NEG_ModelsTask_3_20",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_20"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/description/TYPE_ARRAY","resource":"ModelsTask","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_20"}));
});
bthread("negative NEG_ModelsTask_3_21",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_21"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/description/TYPE_OBJECT","resource":"ModelsTask","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_21"}));
});
bthread("negative NEG_ModelsTask_3_22",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_22"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/done/TYPE_STRING","resource":"ModelsTask","field":"done","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/done/type","schema_pointer":"#/components/schemas/models.Task/properties/done/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_22"}));
});
bthread("negative NEG_ModelsTask_3_23",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_23"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/done_at/TYPE_NUMBER","resource":"ModelsTask","field":"done_at","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_23"}));
});
bthread("negative NEG_ModelsTask_3_24",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_24"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/done_at/TYPE_BOOLEAN","resource":"ModelsTask","field":"done_at","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_24"}));
});
bthread("negative NEG_ModelsTask_3_25",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_25"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/done_at/TYPE_ARRAY","resource":"ModelsTask","field":"done_at","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_25"}));
});
bthread("negative NEG_ModelsTask_3_26",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_26"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/done_at/TYPE_OBJECT","resource":"ModelsTask","field":"done_at","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/done_at/type","schema_pointer":"#/components/schemas/models.Task/properties/done_at/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_26"}));
});
bthread("negative NEG_ModelsTask_3_27",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_27"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/due_date/TYPE_NUMBER","resource":"ModelsTask","field":"due_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_27");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_27"}));
});
bthread("negative NEG_ModelsTask_3_28",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_28"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/due_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"due_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_28");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_28"}));
});
bthread("negative NEG_ModelsTask_3_29",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_29"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/due_date/TYPE_ARRAY","resource":"ModelsTask","field":"due_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_29");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_29"}));
});
bthread("negative NEG_ModelsTask_3_30",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_30"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/due_date/TYPE_OBJECT","resource":"ModelsTask","field":"due_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/due_date/type","schema_pointer":"#/components/schemas/models.Task/properties/due_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_30");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_30"}));
});
bthread("negative NEG_ModelsTask_3_31",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_31"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/end_date/TYPE_NUMBER","resource":"ModelsTask","field":"end_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_31");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_31"}));
});
bthread("negative NEG_ModelsTask_3_32",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_32"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/end_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"end_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_32");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_32"}));
});
bthread("negative NEG_ModelsTask_3_33",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_33"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/end_date/TYPE_ARRAY","resource":"ModelsTask","field":"end_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_33");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_33"}));
});
bthread("negative NEG_ModelsTask_3_34",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_34"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/end_date/TYPE_OBJECT","resource":"ModelsTask","field":"end_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/end_date/type","schema_pointer":"#/components/schemas/models.Task/properties/end_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_34");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_34"}));
});
bthread("negative NEG_ModelsTask_3_35",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_35"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/hex_color/TYPE_NUMBER","resource":"ModelsTask","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_35");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_35"}));
});
bthread("negative NEG_ModelsTask_3_36",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_36"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/hex_color/TYPE_BOOLEAN","resource":"ModelsTask","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_36");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_36"}));
});
bthread("negative NEG_ModelsTask_3_37",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_37"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/hex_color/TYPE_ARRAY","resource":"ModelsTask","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_37");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_37"}));
});
bthread("negative NEG_ModelsTask_3_38",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_38"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/hex_color/TYPE_OBJECT","resource":"ModelsTask","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_38");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_38"}));
});
bthread("negative NEG_ModelsTask_3_39",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_39"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/hex_color/MAX_LENGTH","resource":"ModelsTask","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Task/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/maxLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_39");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_39"}));
});
bthread("negative NEG_ModelsTask_3_40",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_40"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/id/TYPE_STRING","resource":"ModelsTask","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/id/type","schema_pointer":"#/components/schemas/models.Task/properties/id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_40");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_40"}));
});
bthread("negative NEG_ModelsTask_3_41",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_41"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/id/INTEGER_FRACTION","resource":"ModelsTask","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/id/type","schema_pointer":"#/components/schemas/models.Task/properties/id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_41");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_41"}));
});
bthread("negative NEG_ModelsTask_3_42",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_42"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/identifier/TYPE_NUMBER","resource":"ModelsTask","field":"identifier","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_42");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_42"}));
});
bthread("negative NEG_ModelsTask_3_43",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_43"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/identifier/TYPE_BOOLEAN","resource":"ModelsTask","field":"identifier","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_43");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_43"}));
});
bthread("negative NEG_ModelsTask_3_44",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_44"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/identifier/TYPE_ARRAY","resource":"ModelsTask","field":"identifier","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_44");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_44"}));
});
bthread("negative NEG_ModelsTask_3_45",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_45"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/identifier/TYPE_OBJECT","resource":"ModelsTask","field":"identifier","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/identifier/type","schema_pointer":"#/components/schemas/models.Task/properties/identifier/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_45");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_45"}));
});
bthread("negative NEG_ModelsTask_3_46",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_46"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/index/TYPE_STRING","resource":"ModelsTask","field":"index","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/index/type","schema_pointer":"#/components/schemas/models.Task/properties/index/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_46");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_46"}));
});
bthread("negative NEG_ModelsTask_3_47",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_47"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/index/INTEGER_FRACTION","resource":"ModelsTask","field":"index","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/index/type","schema_pointer":"#/components/schemas/models.Task/properties/index/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_47");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_47"}));
});
bthread("negative NEG_ModelsTask_3_48",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_48"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/is_favorite/TYPE_STRING","resource":"ModelsTask","field":"is_favorite","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/is_favorite/type","schema_pointer":"#/components/schemas/models.Task/properties/is_favorite/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_48");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_48"}));
});
bthread("negative NEG_ModelsTask_3_49",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_49"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/is_unread/TYPE_STRING","resource":"ModelsTask","field":"is_unread","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Task/properties/is_unread/type","schema_pointer":"#/components/schemas/models.Task/properties/is_unread/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_49");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_49"}));
});
bthread("negative NEG_ModelsTask_3_50",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_50"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/labels/TYPE_STRING","resource":"ModelsTask","field":"labels","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/labels/type","schema_pointer":"#/components/schemas/models.Task/properties/labels/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_50");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_50"}));
});
bthread("negative NEG_ModelsTask_3_51",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_51"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/percent_done/TYPE_STRING","resource":"ModelsTask","field":"percent_done","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Task/properties/percent_done/type","schema_pointer":"#/components/schemas/models.Task/properties/percent_done/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_51");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_51"}));
});
bthread("negative NEG_ModelsTask_3_52",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_52"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/position/TYPE_STRING","resource":"ModelsTask","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.Task/properties/position/type","schema_pointer":"#/components/schemas/models.Task/properties/position/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_52");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_52"}));
});
bthread("negative NEG_ModelsTask_3_53",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_53"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/priority/TYPE_STRING","resource":"ModelsTask","field":"priority","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/priority/type","schema_pointer":"#/components/schemas/models.Task/properties/priority/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_53");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_53"}));
});
bthread("negative NEG_ModelsTask_3_54",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_54"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/priority/INTEGER_FRACTION","resource":"ModelsTask","field":"priority","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/priority/type","schema_pointer":"#/components/schemas/models.Task/properties/priority/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_54");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_54"}));
});
bthread("negative NEG_ModelsTask_3_55",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_55"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/project_id/TYPE_STRING","resource":"ModelsTask","field":"project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/project_id/type","schema_pointer":"#/components/schemas/models.Task/properties/project_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_55");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_55"}));
});
bthread("negative NEG_ModelsTask_3_56",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_56"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/project_id/INTEGER_FRACTION","resource":"ModelsTask","field":"project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/project_id/type","schema_pointer":"#/components/schemas/models.Task/properties/project_id/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_56");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_56"}));
});
bthread("negative NEG_ModelsTask_3_57",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_57"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/reminders/TYPE_STRING","resource":"ModelsTask","field":"reminders","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Task/properties/reminders/type","schema_pointer":"#/components/schemas/models.Task/properties/reminders/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_57");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_57"}));
});
bthread("negative NEG_ModelsTask_3_58",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_58"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/repeat_after/TYPE_STRING","resource":"ModelsTask","field":"repeat_after","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/repeat_after/type","schema_pointer":"#/components/schemas/models.Task/properties/repeat_after/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_58");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_58"}));
});
bthread("negative NEG_ModelsTask_3_59",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_59"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/repeat_after/INTEGER_FRACTION","resource":"ModelsTask","field":"repeat_after","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/repeat_after/type","schema_pointer":"#/components/schemas/models.Task/properties/repeat_after/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_59");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_59"}));
});
bthread("negative NEG_ModelsTask_3_60",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_60"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/start_date/TYPE_NUMBER","resource":"ModelsTask","field":"start_date","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_60");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_60"}));
});
bthread("negative NEG_ModelsTask_3_61",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_61"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/start_date/TYPE_BOOLEAN","resource":"ModelsTask","field":"start_date","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_61");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_61"}));
});
bthread("negative NEG_ModelsTask_3_62",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_62"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/start_date/TYPE_ARRAY","resource":"ModelsTask","field":"start_date","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_62");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_62"}));
});
bthread("negative NEG_ModelsTask_3_63",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_63"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/start_date/TYPE_OBJECT","resource":"ModelsTask","field":"start_date","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/start_date/type","schema_pointer":"#/components/schemas/models.Task/properties/start_date/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_63");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_63"}));
});
bthread("negative NEG_ModelsTask_3_64",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_64"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/time_entries_count/TYPE_STRING","resource":"ModelsTask","field":"time_entries_count","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/time_entries_count/type","schema_pointer":"#/components/schemas/models.Task/properties/time_entries_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_64");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_64"}));
});
bthread("negative NEG_ModelsTask_3_65",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_65"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/time_entries_count/INTEGER_FRACTION","resource":"ModelsTask","field":"time_entries_count","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Task/properties/time_entries_count/type","schema_pointer":"#/components/schemas/models.Task/properties/time_entries_count/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_65");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_65"}));
});
bthread("negative NEG_ModelsTask_3_66",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_66"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/title/TYPE_NUMBER","resource":"ModelsTask","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_66");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_66"}));
});
bthread("negative NEG_ModelsTask_3_67",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_67"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/title/TYPE_BOOLEAN","resource":"ModelsTask","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_67");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_67"}));
});
bthread("negative NEG_ModelsTask_3_68",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_68"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/title/TYPE_ARRAY","resource":"ModelsTask","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_68");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_68"}));
});
bthread("negative NEG_ModelsTask_3_69",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_69"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/title/TYPE_OBJECT","resource":"ModelsTask","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_69");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_69"}));
});
bthread("negative NEG_ModelsTask_3_70",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_70"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/title/MIN_LENGTH","resource":"ModelsTask","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Task/properties/title/minLength","schema_pointer":"#/components/schemas/models.Task/properties/title/minLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_70");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_70"}));
});
bthread("negative NEG_ModelsTask_3_71",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_71"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/updated/TYPE_NUMBER","resource":"ModelsTask","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_71");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_71"}));
});
bthread("negative NEG_ModelsTask_3_72",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_72"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/updated/TYPE_BOOLEAN","resource":"ModelsTask","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_72");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_72"}));
});
bthread("negative NEG_ModelsTask_3_73",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_73"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/updated/TYPE_ARRAY","resource":"ModelsTask","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_73");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_73"}));
});
bthread("negative NEG_ModelsTask_3_74",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_74"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/updated/TYPE_OBJECT","resource":"ModelsTask","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/updated/type","schema_pointer":"#/components/schemas/models.Task/properties/updated/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_74");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_74"}));
});
ctx.bthread("negative verifier ModelsLabel","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsLabel")return;verifyNegativeModelsLabel(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});
bthread("negative NEG_ModelsLabel_1_0",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_0"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/created/TYPE_NUMBER","resource":"ModelsLabel","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_0"}));
});
bthread("negative NEG_ModelsLabel_1_1",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_1"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/created/TYPE_BOOLEAN","resource":"ModelsLabel","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_1"}));
});
bthread("negative NEG_ModelsLabel_1_2",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_2"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/created/TYPE_ARRAY","resource":"ModelsLabel","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_2"}));
});
bthread("negative NEG_ModelsLabel_1_3",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_3"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/created/TYPE_OBJECT","resource":"ModelsLabel","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_3"}));
});
bthread("negative NEG_ModelsLabel_1_4",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_4"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/description/TYPE_NUMBER","resource":"ModelsLabel","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_4"}));
});
bthread("negative NEG_ModelsLabel_1_5",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_5"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/description/TYPE_BOOLEAN","resource":"ModelsLabel","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_5"}));
});
bthread("negative NEG_ModelsLabel_1_6",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_6"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/description/TYPE_ARRAY","resource":"ModelsLabel","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_6"}));
});
bthread("negative NEG_ModelsLabel_1_7",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_7"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/description/TYPE_OBJECT","resource":"ModelsLabel","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_7"}));
});
bthread("negative NEG_ModelsLabel_1_8",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_8"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/hex_color/TYPE_NUMBER","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_8"}));
});
bthread("negative NEG_ModelsLabel_1_9",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_9"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/hex_color/TYPE_BOOLEAN","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_9"}));
});
bthread("negative NEG_ModelsLabel_1_10",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_10"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/hex_color/TYPE_ARRAY","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_10"}));
});
bthread("negative NEG_ModelsLabel_1_11",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_11"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/hex_color/TYPE_OBJECT","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_11"}));
});
bthread("negative NEG_ModelsLabel_1_12",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_12"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/hex_color/MAX_LENGTH","resource":"ModelsLabel","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Label/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/maxLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_12"}));
});
bthread("negative NEG_ModelsLabel_1_13",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_13"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/id/TYPE_STRING","resource":"ModelsLabel","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Label/properties/id/type","schema_pointer":"#/components/schemas/models.Label/properties/id/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_13"}));
});
bthread("negative NEG_ModelsLabel_1_14",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_14"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/id/INTEGER_FRACTION","resource":"ModelsLabel","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Label/properties/id/type","schema_pointer":"#/components/schemas/models.Label/properties/id/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_14"}));
});
bthread("negative NEG_ModelsLabel_1_15",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_15"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/title/TYPE_NUMBER","resource":"ModelsLabel","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_15"}));
});
bthread("negative NEG_ModelsLabel_1_16",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_16"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/title/TYPE_BOOLEAN","resource":"ModelsLabel","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_16"}));
});
bthread("negative NEG_ModelsLabel_1_17",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_17"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/title/TYPE_ARRAY","resource":"ModelsLabel","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_17"}));
});
bthread("negative NEG_ModelsLabel_1_18",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_18"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/title/TYPE_OBJECT","resource":"ModelsLabel","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_18"}));
});
bthread("negative NEG_ModelsLabel_1_19",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_19"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/title/MIN_LENGTH","resource":"ModelsLabel","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Label/properties/title/minLength","schema_pointer":"#/components/schemas/models.Label/properties/title/minLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_19"}));
});
bthread("negative NEG_ModelsLabel_1_20",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_20"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/title/MAX_LENGTH","resource":"ModelsLabel","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Label/properties/title/maxLength","schema_pointer":"#/components/schemas/models.Label/properties/title/maxLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_20"}));
});
bthread("negative NEG_ModelsLabel_1_21",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_21"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/updated/TYPE_NUMBER","resource":"ModelsLabel","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_21"}));
});
bthread("negative NEG_ModelsLabel_1_22",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_22"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/updated/TYPE_BOOLEAN","resource":"ModelsLabel","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_22"}));
});
bthread("negative NEG_ModelsLabel_1_23",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_23"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/updated/TYPE_ARRAY","resource":"ModelsLabel","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_23"}));
});
bthread("negative NEG_ModelsLabel_1_24",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_24"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/updated/TYPE_OBJECT","resource":"ModelsLabel","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_24"}));
});
bthread("negative NEG_ModelsLabel_2_0",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_0"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/created/TYPE_NUMBER","resource":"ModelsLabel","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_0"}));
});
bthread("negative NEG_ModelsLabel_2_1",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_1"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/created/TYPE_BOOLEAN","resource":"ModelsLabel","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_1"}));
});
bthread("negative NEG_ModelsLabel_2_2",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_2"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/created/TYPE_ARRAY","resource":"ModelsLabel","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_2"}));
});
bthread("negative NEG_ModelsLabel_2_3",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_3"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/created/TYPE_OBJECT","resource":"ModelsLabel","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_3"}));
});
bthread("negative NEG_ModelsLabel_2_4",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_4"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/description/TYPE_NUMBER","resource":"ModelsLabel","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_4"}));
});
bthread("negative NEG_ModelsLabel_2_5",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_5"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/description/TYPE_BOOLEAN","resource":"ModelsLabel","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_5"}));
});
bthread("negative NEG_ModelsLabel_2_6",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_6"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/description/TYPE_ARRAY","resource":"ModelsLabel","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_6"}));
});
bthread("negative NEG_ModelsLabel_2_7",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_7"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/description/TYPE_OBJECT","resource":"ModelsLabel","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_7"}));
});
bthread("negative NEG_ModelsLabel_2_8",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_8"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/hex_color/TYPE_NUMBER","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_8"}));
});
bthread("negative NEG_ModelsLabel_2_9",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_9"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/hex_color/TYPE_BOOLEAN","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_9"}));
});
bthread("negative NEG_ModelsLabel_2_10",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_10"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/hex_color/TYPE_ARRAY","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_10"}));
});
bthread("negative NEG_ModelsLabel_2_11",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_11"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/hex_color/TYPE_OBJECT","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_11"}));
});
bthread("negative NEG_ModelsLabel_2_12",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_12"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/hex_color/MAX_LENGTH","resource":"ModelsLabel","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Label/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/maxLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_12"}));
});
bthread("negative NEG_ModelsLabel_2_13",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_13"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/id/TYPE_STRING","resource":"ModelsLabel","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Label/properties/id/type","schema_pointer":"#/components/schemas/models.Label/properties/id/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_13"}));
});
bthread("negative NEG_ModelsLabel_2_14",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_14"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/id/INTEGER_FRACTION","resource":"ModelsLabel","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Label/properties/id/type","schema_pointer":"#/components/schemas/models.Label/properties/id/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_14"}));
});
bthread("negative NEG_ModelsLabel_2_15",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_15"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/title/TYPE_NUMBER","resource":"ModelsLabel","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_15"}));
});
bthread("negative NEG_ModelsLabel_2_16",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_16"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/title/TYPE_BOOLEAN","resource":"ModelsLabel","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_16"}));
});
bthread("negative NEG_ModelsLabel_2_17",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_17"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/title/TYPE_ARRAY","resource":"ModelsLabel","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_17"}));
});
bthread("negative NEG_ModelsLabel_2_18",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_18"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/title/TYPE_OBJECT","resource":"ModelsLabel","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_18"}));
});
bthread("negative NEG_ModelsLabel_2_19",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_19"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/title/MIN_LENGTH","resource":"ModelsLabel","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Label/properties/title/minLength","schema_pointer":"#/components/schemas/models.Label/properties/title/minLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_19"}));
});
bthread("negative NEG_ModelsLabel_2_20",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_20"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/title/MAX_LENGTH","resource":"ModelsLabel","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Label/properties/title/maxLength","schema_pointer":"#/components/schemas/models.Label/properties/title/maxLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_20"}));
});
bthread("negative NEG_ModelsLabel_2_21",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_21"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/updated/TYPE_NUMBER","resource":"ModelsLabel","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_21"}));
});
bthread("negative NEG_ModelsLabel_2_22",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_22"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/updated/TYPE_BOOLEAN","resource":"ModelsLabel","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_22"}));
});
bthread("negative NEG_ModelsLabel_2_23",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_23"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/updated/TYPE_ARRAY","resource":"ModelsLabel","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_23"}));
});
bthread("negative NEG_ModelsLabel_2_24",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_24"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/updated/TYPE_OBJECT","resource":"ModelsLabel","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_24"}));
});
bthread("negative NEG_ModelsLabel_3_0",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_0"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/created/TYPE_NUMBER","resource":"ModelsLabel","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_0"}));
});
bthread("negative NEG_ModelsLabel_3_1",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_1"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/created/TYPE_BOOLEAN","resource":"ModelsLabel","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_1"}));
});
bthread("negative NEG_ModelsLabel_3_2",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_2"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/created/TYPE_ARRAY","resource":"ModelsLabel","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_2"}));
});
bthread("negative NEG_ModelsLabel_3_3",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_3"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/created/TYPE_OBJECT","resource":"ModelsLabel","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/created/type","schema_pointer":"#/components/schemas/models.Label/properties/created/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_3"}));
});
bthread("negative NEG_ModelsLabel_3_4",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_4"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/description/TYPE_NUMBER","resource":"ModelsLabel","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_4"}));
});
bthread("negative NEG_ModelsLabel_3_5",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_5"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/description/TYPE_BOOLEAN","resource":"ModelsLabel","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_5"}));
});
bthread("negative NEG_ModelsLabel_3_6",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_6"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/description/TYPE_ARRAY","resource":"ModelsLabel","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_6"}));
});
bthread("negative NEG_ModelsLabel_3_7",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_7"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/description/TYPE_OBJECT","resource":"ModelsLabel","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_7"}));
});
bthread("negative NEG_ModelsLabel_3_8",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_8"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/hex_color/TYPE_NUMBER","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_8"}));
});
bthread("negative NEG_ModelsLabel_3_9",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_9"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/hex_color/TYPE_BOOLEAN","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_9"}));
});
bthread("negative NEG_ModelsLabel_3_10",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_10"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/hex_color/TYPE_ARRAY","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_10"}));
});
bthread("negative NEG_ModelsLabel_3_11",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_11"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/hex_color/TYPE_OBJECT","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_11"}));
});
bthread("negative NEG_ModelsLabel_3_12",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_12"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/hex_color/MAX_LENGTH","resource":"ModelsLabel","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Label/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/maxLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_12"}));
});
bthread("negative NEG_ModelsLabel_3_13",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_13"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/id/TYPE_STRING","resource":"ModelsLabel","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Label/properties/id/type","schema_pointer":"#/components/schemas/models.Label/properties/id/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_13"}));
});
bthread("negative NEG_ModelsLabel_3_14",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_14"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/id/INTEGER_FRACTION","resource":"ModelsLabel","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Label/properties/id/type","schema_pointer":"#/components/schemas/models.Label/properties/id/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_14"}));
});
bthread("negative NEG_ModelsLabel_3_15",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_15"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/title/TYPE_NUMBER","resource":"ModelsLabel","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_15"}));
});
bthread("negative NEG_ModelsLabel_3_16",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_16"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/title/TYPE_BOOLEAN","resource":"ModelsLabel","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_16"}));
});
bthread("negative NEG_ModelsLabel_3_17",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_17"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/title/TYPE_ARRAY","resource":"ModelsLabel","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_17"}));
});
bthread("negative NEG_ModelsLabel_3_18",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_18"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/title/TYPE_OBJECT","resource":"ModelsLabel","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_18"}));
});
bthread("negative NEG_ModelsLabel_3_19",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_19"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/title/MIN_LENGTH","resource":"ModelsLabel","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Label/properties/title/minLength","schema_pointer":"#/components/schemas/models.Label/properties/title/minLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_19"}));
});
bthread("negative NEG_ModelsLabel_3_20",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_20"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/title/MAX_LENGTH","resource":"ModelsLabel","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Label/properties/title/maxLength","schema_pointer":"#/components/schemas/models.Label/properties/title/maxLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_20"}));
});
bthread("negative NEG_ModelsLabel_3_21",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_21"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/updated/TYPE_NUMBER","resource":"ModelsLabel","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_21"}));
});
bthread("negative NEG_ModelsLabel_3_22",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_22"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/updated/TYPE_BOOLEAN","resource":"ModelsLabel","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_22"}));
});
bthread("negative NEG_ModelsLabel_3_23",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_23"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/updated/TYPE_ARRAY","resource":"ModelsLabel","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_23"}));
});
bthread("negative NEG_ModelsLabel_3_24",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_24"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/updated/TYPE_OBJECT","resource":"ModelsLabel","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/updated/type","schema_pointer":"#/components/schemas/models.Label/properties/updated/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_24"}));
});
ctx.bthread("negative verifier ModelsProjectView","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsProjectView")return;verifyNegativeModelsProjectView(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});
bthread("negative NEG_ModelsProjectView_1_0",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_0"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/bucket_configuration/TYPE_STRING","resource":"ModelsProjectView","field":"bucket_configuration","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_0"}));
});
bthread("negative NEG_ModelsProjectView_1_1",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_1"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_NUMBER","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_1"}));
});
bthread("negative NEG_ModelsProjectView_1_2",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_2"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_2"}));
});
bthread("negative NEG_ModelsProjectView_1_3",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_3"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_ARRAY","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_3"}));
});
bthread("negative NEG_ModelsProjectView_1_4",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_4"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_OBJECT","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_4"}));
});
bthread("negative NEG_ModelsProjectView_1_5",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_5"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/bucket_configuration_mode/ENUM","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"ENUM","mutation":"replace","invalid_value":"outside-enum","constraint":"enum","declared_constraint":["none","manual","filter"],"source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/enum","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/enum","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_5"}));
});
bthread("negative NEG_ModelsProjectView_1_6",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_6"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/created/TYPE_NUMBER","resource":"ModelsProjectView","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_6"}));
});
bthread("negative NEG_ModelsProjectView_1_7",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_7"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/created/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_7"}));
});
bthread("negative NEG_ModelsProjectView_1_8",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_8"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/created/TYPE_ARRAY","resource":"ModelsProjectView","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_8"}));
});
bthread("negative NEG_ModelsProjectView_1_9",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_9"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/created/TYPE_OBJECT","resource":"ModelsProjectView","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_9"}));
});
bthread("negative NEG_ModelsProjectView_1_10",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_10"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/default_bucket_id/TYPE_STRING","resource":"ModelsProjectView","field":"default_bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/default_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/default_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_10"}));
});
bthread("negative NEG_ModelsProjectView_1_11",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_11"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/default_bucket_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"default_bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/default_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/default_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_11"}));
});
bthread("negative NEG_ModelsProjectView_1_12",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_12"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/done_bucket_id/TYPE_STRING","resource":"ModelsProjectView","field":"done_bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/done_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/done_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_12"}));
});
bthread("negative NEG_ModelsProjectView_1_13",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_13"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/done_bucket_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"done_bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/done_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/done_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_13"}));
});
bthread("negative NEG_ModelsProjectView_1_14",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_14"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/id/TYPE_STRING","resource":"ModelsProjectView","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_14"}));
});
bthread("negative NEG_ModelsProjectView_1_15",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_15"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_15"}));
});
bthread("negative NEG_ModelsProjectView_1_16",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_16"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/position/TYPE_STRING","resource":"ModelsProjectView","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.ProjectView/properties/position/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/position/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_16"}));
});
bthread("negative NEG_ModelsProjectView_1_17",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_17"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/project_id/TYPE_STRING","resource":"ModelsProjectView","field":"project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/project_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/project_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_17"}));
});
bthread("negative NEG_ModelsProjectView_1_18",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_18"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/project_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/project_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/project_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_18"}));
});
bthread("negative NEG_ModelsProjectView_1_19",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_19"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/title/TYPE_NUMBER","resource":"ModelsProjectView","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_19"}));
});
bthread("negative NEG_ModelsProjectView_1_20",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_20"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/title/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_20"}));
});
bthread("negative NEG_ModelsProjectView_1_21",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_21"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/title/TYPE_ARRAY","resource":"ModelsProjectView","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_21"}));
});
bthread("negative NEG_ModelsProjectView_1_22",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_22"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/title/TYPE_OBJECT","resource":"ModelsProjectView","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_22"}));
});
bthread("negative NEG_ModelsProjectView_1_23",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_23"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/title/MIN_LENGTH","resource":"ModelsProjectView","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.ProjectView/properties/title/minLength","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/minLength","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_23"}));
});
bthread("negative NEG_ModelsProjectView_1_24",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_24"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/title/MAX_LENGTH","resource":"ModelsProjectView","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.ProjectView/properties/title/maxLength","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/maxLength","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_24"}));
});
bthread("negative NEG_ModelsProjectView_1_25",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_25"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/updated/TYPE_NUMBER","resource":"ModelsProjectView","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_25"}));
});
bthread("negative NEG_ModelsProjectView_1_26",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_26"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/updated/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_26"}));
});
bthread("negative NEG_ModelsProjectView_1_27",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_27"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/updated/TYPE_ARRAY","resource":"ModelsProjectView","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_27");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_27"}));
});
bthread("negative NEG_ModelsProjectView_1_28",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_28"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/updated/TYPE_OBJECT","resource":"ModelsProjectView","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_28");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_28"}));
});
bthread("negative NEG_ModelsProjectView_1_29",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_29"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/view_kind/TYPE_NUMBER","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_29");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_29"}));
});
bthread("negative NEG_ModelsProjectView_1_30",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_30"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/view_kind/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_30");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_30"}));
});
bthread("negative NEG_ModelsProjectView_1_31",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_31"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/view_kind/TYPE_ARRAY","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_31");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_31"}));
});
bthread("negative NEG_ModelsProjectView_1_32",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_32"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/view_kind/TYPE_OBJECT","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_32");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_32"}));
});
bthread("negative NEG_ModelsProjectView_1_33",function(){
    waitForResource("ModelsProjectView_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_33"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_1"),{"id":"ModelsProjectView/view_kind/ENUM","resource":"ModelsProjectView","field":"view_kind","kind":"ENUM","mutation":"replace","invalid_value":"outside-enum","constraint":"enum","declared_constraint":["list","gantt","table","kanban"],"source_pointer":"#/definitions/models.ProjectView/properties/view_kind/enum","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/enum","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_1_33");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_1",caseId:"NEG_ModelsProjectView_1_33"}));
});
bthread("negative NEG_ModelsProjectView_2_0",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_0"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/bucket_configuration/TYPE_STRING","resource":"ModelsProjectView","field":"bucket_configuration","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_0"}));
});
bthread("negative NEG_ModelsProjectView_2_1",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_1"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_NUMBER","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_1"}));
});
bthread("negative NEG_ModelsProjectView_2_2",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_2"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_2"}));
});
bthread("negative NEG_ModelsProjectView_2_3",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_3"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_ARRAY","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_3"}));
});
bthread("negative NEG_ModelsProjectView_2_4",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_4"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_OBJECT","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_4"}));
});
bthread("negative NEG_ModelsProjectView_2_5",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_5"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/bucket_configuration_mode/ENUM","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"ENUM","mutation":"replace","invalid_value":"outside-enum","constraint":"enum","declared_constraint":["none","manual","filter"],"source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/enum","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/enum","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_5"}));
});
bthread("negative NEG_ModelsProjectView_2_6",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_6"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/created/TYPE_NUMBER","resource":"ModelsProjectView","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_6"}));
});
bthread("negative NEG_ModelsProjectView_2_7",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_7"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/created/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_7"}));
});
bthread("negative NEG_ModelsProjectView_2_8",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_8"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/created/TYPE_ARRAY","resource":"ModelsProjectView","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_8"}));
});
bthread("negative NEG_ModelsProjectView_2_9",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_9"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/created/TYPE_OBJECT","resource":"ModelsProjectView","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_9"}));
});
bthread("negative NEG_ModelsProjectView_2_10",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_10"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/default_bucket_id/TYPE_STRING","resource":"ModelsProjectView","field":"default_bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/default_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/default_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_10"}));
});
bthread("negative NEG_ModelsProjectView_2_11",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_11"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/default_bucket_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"default_bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/default_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/default_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_11"}));
});
bthread("negative NEG_ModelsProjectView_2_12",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_12"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/done_bucket_id/TYPE_STRING","resource":"ModelsProjectView","field":"done_bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/done_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/done_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_12"}));
});
bthread("negative NEG_ModelsProjectView_2_13",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_13"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/done_bucket_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"done_bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/done_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/done_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_13"}));
});
bthread("negative NEG_ModelsProjectView_2_14",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_14"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/id/TYPE_STRING","resource":"ModelsProjectView","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_14"}));
});
bthread("negative NEG_ModelsProjectView_2_15",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_15"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_15"}));
});
bthread("negative NEG_ModelsProjectView_2_16",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_16"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/position/TYPE_STRING","resource":"ModelsProjectView","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.ProjectView/properties/position/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/position/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_16"}));
});
bthread("negative NEG_ModelsProjectView_2_17",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_17"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/project_id/TYPE_STRING","resource":"ModelsProjectView","field":"project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/project_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/project_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_17"}));
});
bthread("negative NEG_ModelsProjectView_2_18",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_18"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/project_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/project_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/project_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_18"}));
});
bthread("negative NEG_ModelsProjectView_2_19",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_19"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/title/TYPE_NUMBER","resource":"ModelsProjectView","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_19"}));
});
bthread("negative NEG_ModelsProjectView_2_20",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_20"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/title/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_20"}));
});
bthread("negative NEG_ModelsProjectView_2_21",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_21"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/title/TYPE_ARRAY","resource":"ModelsProjectView","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_21"}));
});
bthread("negative NEG_ModelsProjectView_2_22",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_22"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/title/TYPE_OBJECT","resource":"ModelsProjectView","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_22"}));
});
bthread("negative NEG_ModelsProjectView_2_23",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_23"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/title/MIN_LENGTH","resource":"ModelsProjectView","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.ProjectView/properties/title/minLength","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/minLength","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_23"}));
});
bthread("negative NEG_ModelsProjectView_2_24",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_24"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/title/MAX_LENGTH","resource":"ModelsProjectView","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.ProjectView/properties/title/maxLength","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/maxLength","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_24"}));
});
bthread("negative NEG_ModelsProjectView_2_25",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_25"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/updated/TYPE_NUMBER","resource":"ModelsProjectView","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_25"}));
});
bthread("negative NEG_ModelsProjectView_2_26",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_26"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/updated/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_26"}));
});
bthread("negative NEG_ModelsProjectView_2_27",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_27"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/updated/TYPE_ARRAY","resource":"ModelsProjectView","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_27");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_27"}));
});
bthread("negative NEG_ModelsProjectView_2_28",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_28"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/updated/TYPE_OBJECT","resource":"ModelsProjectView","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_28");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_28"}));
});
bthread("negative NEG_ModelsProjectView_2_29",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_29"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/view_kind/TYPE_NUMBER","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_29");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_29"}));
});
bthread("negative NEG_ModelsProjectView_2_30",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_30"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/view_kind/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_30");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_30"}));
});
bthread("negative NEG_ModelsProjectView_2_31",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_31"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/view_kind/TYPE_ARRAY","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_31");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_31"}));
});
bthread("negative NEG_ModelsProjectView_2_32",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_32"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/view_kind/TYPE_OBJECT","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_32");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_32"}));
});
bthread("negative NEG_ModelsProjectView_2_33",function(){
    waitForResource("ModelsProjectView_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_33"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_2"),{"id":"ModelsProjectView/view_kind/ENUM","resource":"ModelsProjectView","field":"view_kind","kind":"ENUM","mutation":"replace","invalid_value":"outside-enum","constraint":"enum","declared_constraint":["list","gantt","table","kanban"],"source_pointer":"#/definitions/models.ProjectView/properties/view_kind/enum","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/enum","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_2_33");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_2",caseId:"NEG_ModelsProjectView_2_33"}));
});
bthread("negative NEG_ModelsProjectView_3_0",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_0"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/bucket_configuration/TYPE_STRING","resource":"ModelsProjectView","field":"bucket_configuration","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_0"}));
});
bthread("negative NEG_ModelsProjectView_3_1",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_1"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_NUMBER","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_1"}));
});
bthread("negative NEG_ModelsProjectView_3_2",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_2"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_2"}));
});
bthread("negative NEG_ModelsProjectView_3_3",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_3"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_ARRAY","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_3"}));
});
bthread("negative NEG_ModelsProjectView_3_4",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_4"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/bucket_configuration_mode/TYPE_OBJECT","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_4"}));
});
bthread("negative NEG_ModelsProjectView_3_5",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_5"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/bucket_configuration_mode/ENUM","resource":"ModelsProjectView","field":"bucket_configuration_mode","kind":"ENUM","mutation":"replace","invalid_value":"outside-enum","constraint":"enum","declared_constraint":["none","manual","filter"],"source_pointer":"#/definitions/models.ProjectView/properties/bucket_configuration_mode/enum","schema_pointer":"#/components/schemas/models.ProjectView/properties/bucket_configuration_mode/enum","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_5"}));
});
bthread("negative NEG_ModelsProjectView_3_6",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_6"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/created/TYPE_NUMBER","resource":"ModelsProjectView","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_6"}));
});
bthread("negative NEG_ModelsProjectView_3_7",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_7"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/created/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_7"}));
});
bthread("negative NEG_ModelsProjectView_3_8",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_8"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/created/TYPE_ARRAY","resource":"ModelsProjectView","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_8"}));
});
bthread("negative NEG_ModelsProjectView_3_9",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_9"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/created/TYPE_OBJECT","resource":"ModelsProjectView","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/created/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/created/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_9"}));
});
bthread("negative NEG_ModelsProjectView_3_10",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_10"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/default_bucket_id/TYPE_STRING","resource":"ModelsProjectView","field":"default_bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/default_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/default_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_10"}));
});
bthread("negative NEG_ModelsProjectView_3_11",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_11"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/default_bucket_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"default_bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/default_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/default_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_11"}));
});
bthread("negative NEG_ModelsProjectView_3_12",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_12"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/done_bucket_id/TYPE_STRING","resource":"ModelsProjectView","field":"done_bucket_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/done_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/done_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_12"}));
});
bthread("negative NEG_ModelsProjectView_3_13",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_13"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/done_bucket_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"done_bucket_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/done_bucket_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/done_bucket_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_13"}));
});
bthread("negative NEG_ModelsProjectView_3_14",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_14"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/id/TYPE_STRING","resource":"ModelsProjectView","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_14"}));
});
bthread("negative NEG_ModelsProjectView_3_15",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_15"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_15"}));
});
bthread("negative NEG_ModelsProjectView_3_16",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_16"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/position/TYPE_STRING","resource":"ModelsProjectView","field":"position","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"number","source_pointer":"#/definitions/models.ProjectView/properties/position/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/position/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_16"}));
});
bthread("negative NEG_ModelsProjectView_3_17",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_17"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/project_id/TYPE_STRING","resource":"ModelsProjectView","field":"project_id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/project_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/project_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_17"}));
});
bthread("negative NEG_ModelsProjectView_3_18",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_18"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/project_id/INTEGER_FRACTION","resource":"ModelsProjectView","field":"project_id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.ProjectView/properties/project_id/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/project_id/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_18"}));
});
bthread("negative NEG_ModelsProjectView_3_19",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_19"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/title/TYPE_NUMBER","resource":"ModelsProjectView","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_19"}));
});
bthread("negative NEG_ModelsProjectView_3_20",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_20"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/title/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_20"}));
});
bthread("negative NEG_ModelsProjectView_3_21",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_21"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/title/TYPE_ARRAY","resource":"ModelsProjectView","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_21"}));
});
bthread("negative NEG_ModelsProjectView_3_22",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_22"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/title/TYPE_OBJECT","resource":"ModelsProjectView","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_22"}));
});
bthread("negative NEG_ModelsProjectView_3_23",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_23"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/title/MIN_LENGTH","resource":"ModelsProjectView","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.ProjectView/properties/title/minLength","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/minLength","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_23"}));
});
bthread("negative NEG_ModelsProjectView_3_24",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_24"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/title/MAX_LENGTH","resource":"ModelsProjectView","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.ProjectView/properties/title/maxLength","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/maxLength","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_24"}));
});
bthread("negative NEG_ModelsProjectView_3_25",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_25"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/updated/TYPE_NUMBER","resource":"ModelsProjectView","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_25"}));
});
bthread("negative NEG_ModelsProjectView_3_26",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_26"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/updated/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_26"}));
});
bthread("negative NEG_ModelsProjectView_3_27",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_27"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/updated/TYPE_ARRAY","resource":"ModelsProjectView","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_27");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_27"}));
});
bthread("negative NEG_ModelsProjectView_3_28",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_28"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/updated/TYPE_OBJECT","resource":"ModelsProjectView","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/updated/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/updated/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_28");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_28"}));
});
bthread("negative NEG_ModelsProjectView_3_29",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_29"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/view_kind/TYPE_NUMBER","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_29");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_29"}));
});
bthread("negative NEG_ModelsProjectView_3_30",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_30"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/view_kind/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_30");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_30"}));
});
bthread("negative NEG_ModelsProjectView_3_31",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_31"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/view_kind/TYPE_ARRAY","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_31");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_31"}));
});
bthread("negative NEG_ModelsProjectView_3_32",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_32"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/view_kind/TYPE_OBJECT","resource":"ModelsProjectView","field":"view_kind","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/view_kind/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_32");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_32"}));
});
bthread("negative NEG_ModelsProjectView_3_33",function(){
    waitForResource("ModelsProjectView_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_33"}));
    attemptNegativeModelsProjectView(getModelEntity("ModelsProjectView_3"),{"id":"ModelsProjectView/view_kind/ENUM","resource":"ModelsProjectView","field":"view_kind","kind":"ENUM","mutation":"replace","invalid_value":"outside-enum","constraint":"enum","declared_constraint":["list","gantt","table","kanban"],"source_pointer":"#/definitions/models.ProjectView/properties/view_kind/enum","schema_pointer":"#/components/schemas/models.ProjectView/properties/view_kind/enum","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsProjectView_3_33");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsProjectView_3",caseId:"NEG_ModelsProjectView_3_33"}));
});
ctx.bthread("negative verifier ModelsTeam","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsTeam")return;verifyNegativeModelsTeam(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});
bthread("negative NEG_ModelsTeam_1_0",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_0"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/created/TYPE_NUMBER","resource":"ModelsTeam","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_0"}));
});
bthread("negative NEG_ModelsTeam_1_1",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_1"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/created/TYPE_BOOLEAN","resource":"ModelsTeam","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_1"}));
});
bthread("negative NEG_ModelsTeam_1_2",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_2"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/created/TYPE_ARRAY","resource":"ModelsTeam","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_2"}));
});
bthread("negative NEG_ModelsTeam_1_3",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_3"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/created/TYPE_OBJECT","resource":"ModelsTeam","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_3"}));
});
bthread("negative NEG_ModelsTeam_1_4",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_4"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/description/TYPE_NUMBER","resource":"ModelsTeam","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_4"}));
});
bthread("negative NEG_ModelsTeam_1_5",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_5"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/description/TYPE_BOOLEAN","resource":"ModelsTeam","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_5"}));
});
bthread("negative NEG_ModelsTeam_1_6",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_6"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/description/TYPE_ARRAY","resource":"ModelsTeam","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_6"}));
});
bthread("negative NEG_ModelsTeam_1_7",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_7"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/description/TYPE_OBJECT","resource":"ModelsTeam","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_7"}));
});
bthread("negative NEG_ModelsTeam_1_8",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_8"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/external_id/TYPE_NUMBER","resource":"ModelsTeam","field":"external_id","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_8"}));
});
bthread("negative NEG_ModelsTeam_1_9",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_9"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/external_id/TYPE_BOOLEAN","resource":"ModelsTeam","field":"external_id","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_9"}));
});
bthread("negative NEG_ModelsTeam_1_10",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_10"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/external_id/TYPE_ARRAY","resource":"ModelsTeam","field":"external_id","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_10"}));
});
bthread("negative NEG_ModelsTeam_1_11",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_11"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/external_id/TYPE_OBJECT","resource":"ModelsTeam","field":"external_id","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_11"}));
});
bthread("negative NEG_ModelsTeam_1_12",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_12"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/external_id/MAX_LENGTH","resource":"ModelsTeam","field":"external_id","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Team/properties/external_id/maxLength","schema_pointer":"#/components/schemas/models.Team/properties/external_id/maxLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_12"}));
});
bthread("negative NEG_ModelsTeam_1_13",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_13"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/id/TYPE_STRING","resource":"ModelsTeam","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Team/properties/id/type","schema_pointer":"#/components/schemas/models.Team/properties/id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_13"}));
});
bthread("negative NEG_ModelsTeam_1_14",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_14"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/id/INTEGER_FRACTION","resource":"ModelsTeam","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Team/properties/id/type","schema_pointer":"#/components/schemas/models.Team/properties/id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_14"}));
});
bthread("negative NEG_ModelsTeam_1_15",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_15"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/is_public/TYPE_STRING","resource":"ModelsTeam","field":"is_public","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Team/properties/is_public/type","schema_pointer":"#/components/schemas/models.Team/properties/is_public/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_15"}));
});
bthread("negative NEG_ModelsTeam_1_16",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_16"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/members/TYPE_STRING","resource":"ModelsTeam","field":"members","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Team/properties/members/type","schema_pointer":"#/components/schemas/models.Team/properties/members/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_16"}));
});
bthread("negative NEG_ModelsTeam_1_17",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_17"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/name/TYPE_NUMBER","resource":"ModelsTeam","field":"name","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_17"}));
});
bthread("negative NEG_ModelsTeam_1_18",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_18"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/name/TYPE_BOOLEAN","resource":"ModelsTeam","field":"name","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_18"}));
});
bthread("negative NEG_ModelsTeam_1_19",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_19"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/name/TYPE_ARRAY","resource":"ModelsTeam","field":"name","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_19"}));
});
bthread("negative NEG_ModelsTeam_1_20",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_20"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/name/TYPE_OBJECT","resource":"ModelsTeam","field":"name","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_20"}));
});
bthread("negative NEG_ModelsTeam_1_21",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_21"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/name/MIN_LENGTH","resource":"ModelsTeam","field":"name","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Team/properties/name/minLength","schema_pointer":"#/components/schemas/models.Team/properties/name/minLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_21"}));
});
bthread("negative NEG_ModelsTeam_1_22",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_22"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/name/MAX_LENGTH","resource":"ModelsTeam","field":"name","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Team/properties/name/maxLength","schema_pointer":"#/components/schemas/models.Team/properties/name/maxLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_22"}));
});
bthread("negative NEG_ModelsTeam_1_23",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_23"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/updated/TYPE_NUMBER","resource":"ModelsTeam","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_23"}));
});
bthread("negative NEG_ModelsTeam_1_24",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_24"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/updated/TYPE_BOOLEAN","resource":"ModelsTeam","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_24"}));
});
bthread("negative NEG_ModelsTeam_1_25",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_25"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/updated/TYPE_ARRAY","resource":"ModelsTeam","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_25"}));
});
bthread("negative NEG_ModelsTeam_1_26",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_26"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/updated/TYPE_OBJECT","resource":"ModelsTeam","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_26"}));
});
bthread("negative NEG_ModelsTeam_2_0",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_0"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/created/TYPE_NUMBER","resource":"ModelsTeam","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_0"}));
});
bthread("negative NEG_ModelsTeam_2_1",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_1"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/created/TYPE_BOOLEAN","resource":"ModelsTeam","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_1"}));
});
bthread("negative NEG_ModelsTeam_2_2",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_2"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/created/TYPE_ARRAY","resource":"ModelsTeam","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_2"}));
});
bthread("negative NEG_ModelsTeam_2_3",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_3"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/created/TYPE_OBJECT","resource":"ModelsTeam","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_3"}));
});
bthread("negative NEG_ModelsTeam_2_4",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_4"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/description/TYPE_NUMBER","resource":"ModelsTeam","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_4"}));
});
bthread("negative NEG_ModelsTeam_2_5",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_5"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/description/TYPE_BOOLEAN","resource":"ModelsTeam","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_5"}));
});
bthread("negative NEG_ModelsTeam_2_6",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_6"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/description/TYPE_ARRAY","resource":"ModelsTeam","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_6"}));
});
bthread("negative NEG_ModelsTeam_2_7",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_7"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/description/TYPE_OBJECT","resource":"ModelsTeam","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_7"}));
});
bthread("negative NEG_ModelsTeam_2_8",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_8"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/external_id/TYPE_NUMBER","resource":"ModelsTeam","field":"external_id","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_8"}));
});
bthread("negative NEG_ModelsTeam_2_9",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_9"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/external_id/TYPE_BOOLEAN","resource":"ModelsTeam","field":"external_id","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_9"}));
});
bthread("negative NEG_ModelsTeam_2_10",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_10"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/external_id/TYPE_ARRAY","resource":"ModelsTeam","field":"external_id","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_10"}));
});
bthread("negative NEG_ModelsTeam_2_11",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_11"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/external_id/TYPE_OBJECT","resource":"ModelsTeam","field":"external_id","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_11"}));
});
bthread("negative NEG_ModelsTeam_2_12",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_12"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/external_id/MAX_LENGTH","resource":"ModelsTeam","field":"external_id","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Team/properties/external_id/maxLength","schema_pointer":"#/components/schemas/models.Team/properties/external_id/maxLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_12"}));
});
bthread("negative NEG_ModelsTeam_2_13",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_13"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/id/TYPE_STRING","resource":"ModelsTeam","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Team/properties/id/type","schema_pointer":"#/components/schemas/models.Team/properties/id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_13"}));
});
bthread("negative NEG_ModelsTeam_2_14",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_14"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/id/INTEGER_FRACTION","resource":"ModelsTeam","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Team/properties/id/type","schema_pointer":"#/components/schemas/models.Team/properties/id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_14"}));
});
bthread("negative NEG_ModelsTeam_2_15",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_15"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/is_public/TYPE_STRING","resource":"ModelsTeam","field":"is_public","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Team/properties/is_public/type","schema_pointer":"#/components/schemas/models.Team/properties/is_public/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_15"}));
});
bthread("negative NEG_ModelsTeam_2_16",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_16"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/members/TYPE_STRING","resource":"ModelsTeam","field":"members","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Team/properties/members/type","schema_pointer":"#/components/schemas/models.Team/properties/members/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_16"}));
});
bthread("negative NEG_ModelsTeam_2_17",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_17"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/name/TYPE_NUMBER","resource":"ModelsTeam","field":"name","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_17"}));
});
bthread("negative NEG_ModelsTeam_2_18",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_18"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/name/TYPE_BOOLEAN","resource":"ModelsTeam","field":"name","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_18"}));
});
bthread("negative NEG_ModelsTeam_2_19",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_19"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/name/TYPE_ARRAY","resource":"ModelsTeam","field":"name","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_19"}));
});
bthread("negative NEG_ModelsTeam_2_20",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_20"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/name/TYPE_OBJECT","resource":"ModelsTeam","field":"name","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_20"}));
});
bthread("negative NEG_ModelsTeam_2_21",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_21"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/name/MIN_LENGTH","resource":"ModelsTeam","field":"name","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Team/properties/name/minLength","schema_pointer":"#/components/schemas/models.Team/properties/name/minLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_21"}));
});
bthread("negative NEG_ModelsTeam_2_22",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_22"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/name/MAX_LENGTH","resource":"ModelsTeam","field":"name","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Team/properties/name/maxLength","schema_pointer":"#/components/schemas/models.Team/properties/name/maxLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_22"}));
});
bthread("negative NEG_ModelsTeam_2_23",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_23"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/updated/TYPE_NUMBER","resource":"ModelsTeam","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_23"}));
});
bthread("negative NEG_ModelsTeam_2_24",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_24"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/updated/TYPE_BOOLEAN","resource":"ModelsTeam","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_24"}));
});
bthread("negative NEG_ModelsTeam_2_25",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_25"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/updated/TYPE_ARRAY","resource":"ModelsTeam","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_25"}));
});
bthread("negative NEG_ModelsTeam_2_26",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_26"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/updated/TYPE_OBJECT","resource":"ModelsTeam","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_26"}));
});
bthread("negative NEG_ModelsTeam_3_0",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_0"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/created/TYPE_NUMBER","resource":"ModelsTeam","field":"created","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_0"}));
});
bthread("negative NEG_ModelsTeam_3_1",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_1"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/created/TYPE_BOOLEAN","resource":"ModelsTeam","field":"created","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_1"}));
});
bthread("negative NEG_ModelsTeam_3_2",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_2"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/created/TYPE_ARRAY","resource":"ModelsTeam","field":"created","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_2");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_2"}));
});
bthread("negative NEG_ModelsTeam_3_3",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_3"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/created/TYPE_OBJECT","resource":"ModelsTeam","field":"created","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/created/type","schema_pointer":"#/components/schemas/models.Team/properties/created/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_3");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_3"}));
});
bthread("negative NEG_ModelsTeam_3_4",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_4"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/description/TYPE_NUMBER","resource":"ModelsTeam","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_4");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_4"}));
});
bthread("negative NEG_ModelsTeam_3_5",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_5"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/description/TYPE_BOOLEAN","resource":"ModelsTeam","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_5");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_5"}));
});
bthread("negative NEG_ModelsTeam_3_6",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_6"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/description/TYPE_ARRAY","resource":"ModelsTeam","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_6");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_6"}));
});
bthread("negative NEG_ModelsTeam_3_7",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_7"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/description/TYPE_OBJECT","resource":"ModelsTeam","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_7");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_7"}));
});
bthread("negative NEG_ModelsTeam_3_8",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_8"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/external_id/TYPE_NUMBER","resource":"ModelsTeam","field":"external_id","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_8");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_8"}));
});
bthread("negative NEG_ModelsTeam_3_9",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_9"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/external_id/TYPE_BOOLEAN","resource":"ModelsTeam","field":"external_id","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_9");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_9"}));
});
bthread("negative NEG_ModelsTeam_3_10",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_10"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/external_id/TYPE_ARRAY","resource":"ModelsTeam","field":"external_id","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_10");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_10"}));
});
bthread("negative NEG_ModelsTeam_3_11",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_11"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/external_id/TYPE_OBJECT","resource":"ModelsTeam","field":"external_id","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/external_id/type","schema_pointer":"#/components/schemas/models.Team/properties/external_id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_11");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_11"}));
});
bthread("negative NEG_ModelsTeam_3_12",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_12"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/external_id/MAX_LENGTH","resource":"ModelsTeam","field":"external_id","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Team/properties/external_id/maxLength","schema_pointer":"#/components/schemas/models.Team/properties/external_id/maxLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_12");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_12"}));
});
bthread("negative NEG_ModelsTeam_3_13",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_13"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/id/TYPE_STRING","resource":"ModelsTeam","field":"id","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Team/properties/id/type","schema_pointer":"#/components/schemas/models.Team/properties/id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_13");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_13"}));
});
bthread("negative NEG_ModelsTeam_3_14",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_14"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/id/INTEGER_FRACTION","resource":"ModelsTeam","field":"id","kind":"INTEGER_FRACTION","mutation":"replace","invalid_value":1.5,"constraint":"type","declared_constraint":"integer","source_pointer":"#/definitions/models.Team/properties/id/type","schema_pointer":"#/components/schemas/models.Team/properties/id/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_14");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_14"}));
});
bthread("negative NEG_ModelsTeam_3_15",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_15"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/is_public/TYPE_STRING","resource":"ModelsTeam","field":"is_public","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"boolean","source_pointer":"#/definitions/models.Team/properties/is_public/type","schema_pointer":"#/components/schemas/models.Team/properties/is_public/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_15");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_15"}));
});
bthread("negative NEG_ModelsTeam_3_16",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_16"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/members/TYPE_STRING","resource":"ModelsTeam","field":"members","kind":"TYPE_STRING","mutation":"replace","invalid_value":"schema-type-mismatch","constraint":"type","declared_constraint":"array","source_pointer":"#/definitions/models.Team/properties/members/type","schema_pointer":"#/components/schemas/models.Team/properties/members/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_16");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_16"}));
});
bthread("negative NEG_ModelsTeam_3_17",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_17"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/name/TYPE_NUMBER","resource":"ModelsTeam","field":"name","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_17");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_17"}));
});
bthread("negative NEG_ModelsTeam_3_18",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_18"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/name/TYPE_BOOLEAN","resource":"ModelsTeam","field":"name","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_18");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_18"}));
});
bthread("negative NEG_ModelsTeam_3_19",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_19"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/name/TYPE_ARRAY","resource":"ModelsTeam","field":"name","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_19");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_19"}));
});
bthread("negative NEG_ModelsTeam_3_20",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_20"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/name/TYPE_OBJECT","resource":"ModelsTeam","field":"name","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_20");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_20"}));
});
bthread("negative NEG_ModelsTeam_3_21",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_21"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/name/MIN_LENGTH","resource":"ModelsTeam","field":"name","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Team/properties/name/minLength","schema_pointer":"#/components/schemas/models.Team/properties/name/minLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_21");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_21"}));
});
bthread("negative NEG_ModelsTeam_3_22",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_22"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/name/MAX_LENGTH","resource":"ModelsTeam","field":"name","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Team/properties/name/maxLength","schema_pointer":"#/components/schemas/models.Team/properties/name/maxLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_22");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_22"}));
});
bthread("negative NEG_ModelsTeam_3_23",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_23"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/updated/TYPE_NUMBER","resource":"ModelsTeam","field":"updated","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_23");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_23"}));
});
bthread("negative NEG_ModelsTeam_3_24",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_24"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/updated/TYPE_BOOLEAN","resource":"ModelsTeam","field":"updated","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_24");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_24"}));
});
bthread("negative NEG_ModelsTeam_3_25",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_25"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/updated/TYPE_ARRAY","resource":"ModelsTeam","field":"updated","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_25");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_25"}));
});
bthread("negative NEG_ModelsTeam_3_26",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_26"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/updated/TYPE_OBJECT","resource":"ModelsTeam","field":"updated","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/updated/type","schema_pointer":"#/components/schemas/models.Team/properties/updated/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_26");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_26"}));
});

// v069: resource-local oracle isolation; independent resources remain enabled.
bthread("resource-local negative observation isolation",function(){
    var positives={},negatives={};
    while(true){
        var event=sync({waitFor:bp.all,block:bp.EventSet("resource-local observation conflicts",function(e){
            var d=e.data||{};
            if(e.name==="NegativeAcquire")return !!positives[d.logicalId]||!!negatives[d.logicalId];
            if(e.name==="ModelWriteBegin")return !!negatives[d.logicalId];
            var m=d.model;
            return !!m && !!negatives[m.logicalId] && (m.action==="create"||m.action==="update");
        })});
        var data=event.data||{};
        if(event.name==="ModelWriteBegin")positives[data.logicalId]=data.revision;
        if(event.name==="ModelVerified" && positives[data.logicalId]===data.revision)delete positives[data.logicalId];
        if(event.name==="NegativeAcquire")negatives[data.logicalId]=data.caseId;
        if(event.name==="NegativeRelease" && negatives[data.logicalId]===data.caseId)delete negatives[data.logicalId];
    }
});
