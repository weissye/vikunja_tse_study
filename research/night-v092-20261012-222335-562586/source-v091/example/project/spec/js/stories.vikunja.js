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


// Instance ModelsProject_2: creation, independent readback, update, independent readback.


// Instance ModelsProject_3: creation, independent readback, update, independent readback.


// Instance ModelsProject_4: creation, independent readback, update, independent readback.


// Instance ModelsProject_5: creation, independent readback, update, independent readback.


// Instance ModelsProject_6: creation, independent readback, update, independent readback.


// Instance ModelsProject_7: creation, independent readback, update, independent readback.


// Instance ModelsProject_8: creation, independent readback, update, independent readback.


// Instance ModelsProject_9: creation, independent readback, update, independent readback.


// Instance ModelsProject_10: creation, independent readback, update, independent readback.


// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsTaskAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsTask") return;
    verifyModelsTask(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsTask_1: creation, independent readback, update, independent readback.


// Instance ModelsTask_2: creation, independent readback, update, independent readback.


// Instance ModelsTask_3: creation, independent readback, update, independent readback.


// Instance ModelsTask_4: creation, independent readback, update, independent readback.


// Instance ModelsTask_5: creation, independent readback, update, independent readback.


// Instance ModelsTask_6: creation, independent readback, update, independent readback.


// Instance ModelsTask_7: creation, independent readback, update, independent readback.


// Instance ModelsTask_8: creation, independent readback, update, independent readback.


// Instance ModelsTask_9: creation, independent readback, update, independent readback.


// Instance ModelsTask_10: creation, independent readback, update, independent readback.


// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsLabelAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsLabel") return;
    verifyModelsLabel(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsLabel_1: creation, independent readback, update, independent readback.


// Instance ModelsLabel_2: creation, independent readback, update, independent readback.


// Instance ModelsLabel_3: creation, independent readback, update, independent readback.


// Instance ModelsLabel_4: creation, independent readback, update, independent readback.


// Instance ModelsLabel_5: creation, independent readback, update, independent readback.


// Instance ModelsLabel_6: creation, independent readback, update, independent readback.


// Instance ModelsLabel_7: creation, independent readback, update, independent readback.


// Instance ModelsLabel_8: creation, independent readback, update, independent readback.


// Instance ModelsLabel_9: creation, independent readback, update, independent readback.


// Instance ModelsLabel_10: creation, independent readback, update, independent readback.


// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsProjectViewAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsProjectView") return;
    verifyModelsProjectView(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsProjectView_1: creation, independent readback, update, independent readback.


// Instance ModelsProjectView_2: creation, independent readback, update, independent readback.


// Instance ModelsProjectView_3: creation, independent readback, update, independent readback.


// Instance ModelsProjectView_4: creation, independent readback, update, independent readback.


// Instance ModelsProjectView_5: creation, independent readback, update, independent readback.


// Instance ModelsProjectView_6: creation, independent readback, update, independent readback.


// Instance ModelsProjectView_7: creation, independent readback, update, independent readback.


// Instance ModelsProjectView_8: creation, independent readback, update, independent readback.


// Instance ModelsProjectView_9: creation, independent readback, update, independent readback.


// Instance ModelsProjectView_10: creation, independent readback, update, independent readback.


// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsTaskCommentAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsTaskComment") return;
    verifyModelsTaskComment(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsTaskComment_1: creation, independent readback, update, independent readback.


// Instance ModelsTaskComment_2: creation, independent readback, update, independent readback.


// Instance ModelsTaskComment_3: creation, independent readback, update, independent readback.


// Instance ModelsTaskComment_4: creation, independent readback, update, independent readback.


// Instance ModelsTaskComment_5: creation, independent readback, update, independent readback.


// Instance ModelsTaskComment_6: creation, independent readback, update, independent readback.


// Instance ModelsTaskComment_7: creation, independent readback, update, independent readback.


// Instance ModelsTaskComment_8: creation, independent readback, update, independent readback.


// Instance ModelsTaskComment_9: creation, independent readback, update, independent readback.


// Instance ModelsTaskComment_10: creation, independent readback, update, independent readback.


// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsTeamAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsTeam") return;
    verifyModelsTeam(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsTeam_1: creation, independent readback, update, independent readback.


// Instance ModelsTeam_2: creation, independent readback, update, independent readback.


// Instance ModelsTeam_3: creation, independent readback, update, independent readback.


// Instance ModelsTeam_4: creation, independent readback, update, independent readback.


// Instance ModelsTeam_5: creation, independent readback, update, independent readback.


// Instance ModelsTeam_6: creation, independent readback, update, independent readback.


// Instance ModelsTeam_7: creation, independent readback, update, independent readback.


// Instance ModelsTeam_8: creation, independent readback, update, independent readback.


// Instance ModelsTeam_9: creation, independent readback, update, independent readback.


// Instance ModelsTeam_10: creation, independent readback, update, independent readback.


// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsSavedFilterAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsSavedFilter") return;
    verifyModelsSavedFilter(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsSavedFilter_1: creation, independent readback, update, independent readback.


// Instance ModelsSavedFilter_2: creation, independent readback, update, independent readback.


// Instance ModelsSavedFilter_3: creation, independent readback, update, independent readback.


// Instance ModelsSavedFilter_4: creation, independent readback, update, independent readback.


// Instance ModelsSavedFilter_5: creation, independent readback, update, independent readback.


// Instance ModelsSavedFilter_6: creation, independent readback, update, independent readback.


// Instance ModelsSavedFilter_7: creation, independent readback, update, independent readback.


// Instance ModelsSavedFilter_8: creation, independent readback, update, independent readback.


// Instance ModelsSavedFilter_9: creation, independent readback, update, independent readback.


// Instance ModelsSavedFilter_10: creation, independent readback, update, independent readback.


// Verification is activated by a Context query, independently of producers.
ctx.bthread("verifyModelsLinkSharingAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsLinkSharing") return;
    verifyModelsLinkSharing(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsLinkSharing_1: creation, independent readback, update, independent readback.


// Instance ModelsLinkSharing_2: creation, independent readback, update, independent readback.


// Instance ModelsLinkSharing_3: creation, independent readback, update, independent readback.


// Instance ModelsLinkSharing_4: creation, independent readback, update, independent readback.


// Instance ModelsLinkSharing_5: creation, independent readback, update, independent readback.


// Instance ModelsLinkSharing_6: creation, independent readback, update, independent readback.


// Instance ModelsLinkSharing_7: creation, independent readback, update, independent readback.


// Instance ModelsLinkSharing_8: creation, independent readback, update, independent readback.


// Instance ModelsLinkSharing_9: creation, independent readback, update, independent readback.


// Instance ModelsLinkSharing_10: creation, independent readback, update, independent readback.

bthread("initialize negative Context rules",function(){request(bp.Event("NegativeCatalogReady",{rules:[{"id":"ModelsProject/description/TYPE_NUMBER","resource":"ModelsProject","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/description/TYPE_BOOLEAN","resource":"ModelsProject","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/description/TYPE_ARRAY","resource":"ModelsProject","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/description/TYPE_OBJECT","resource":"ModelsProject","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/description/type","schema_pointer":"#/components/schemas/models.Project/properties/description/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/hex_color/TYPE_NUMBER","resource":"ModelsProject","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/hex_color/TYPE_BOOLEAN","resource":"ModelsProject","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/hex_color/TYPE_ARRAY","resource":"ModelsProject","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/hex_color/TYPE_OBJECT","resource":"ModelsProject","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/hex_color/MAX_LENGTH","resource":"ModelsProject","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Project/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/hex_color/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/identifier/TYPE_NUMBER","resource":"ModelsProject","field":"identifier","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/identifier/TYPE_BOOLEAN","resource":"ModelsProject","field":"identifier","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/identifier/TYPE_ARRAY","resource":"ModelsProject","field":"identifier","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/identifier/TYPE_OBJECT","resource":"ModelsProject","field":"identifier","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/identifier/type","schema_pointer":"#/components/schemas/models.Project/properties/identifier/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/identifier/MAX_LENGTH","resource":"ModelsProject","field":"identifier","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxx","constraint":"maxLength","declared_constraint":10,"source_pointer":"#/definitions/models.Project/properties/identifier/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/identifier/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/TYPE_NUMBER","resource":"ModelsProject","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/TYPE_BOOLEAN","resource":"ModelsProject","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/TYPE_ARRAY","resource":"ModelsProject","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/TYPE_OBJECT","resource":"ModelsProject","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Project/properties/title/type","schema_pointer":"#/components/schemas/models.Project/properties/title/type","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/MIN_LENGTH","resource":"ModelsProject","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Project/properties/title/minLength","schema_pointer":"#/components/schemas/models.Project/properties/title/minLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsProject/title/MAX_LENGTH","resource":"ModelsProject","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Project/properties/title/maxLength","schema_pointer":"#/components/schemas/models.Project/properties/title/maxLength","operation":"POST /projects/{id}","effective_operation":"POST /projects/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/description/TYPE_NUMBER","resource":"ModelsTask","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/description/TYPE_BOOLEAN","resource":"ModelsTask","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/description/TYPE_ARRAY","resource":"ModelsTask","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/description/TYPE_OBJECT","resource":"ModelsTask","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/description/type","schema_pointer":"#/components/schemas/models.Task/properties/description/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/hex_color/TYPE_NUMBER","resource":"ModelsTask","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/hex_color/TYPE_BOOLEAN","resource":"ModelsTask","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/hex_color/TYPE_ARRAY","resource":"ModelsTask","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/hex_color/TYPE_OBJECT","resource":"ModelsTask","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/hex_color/MAX_LENGTH","resource":"ModelsTask","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Task/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Task/properties/hex_color/maxLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/TYPE_NUMBER","resource":"ModelsTask","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/TYPE_BOOLEAN","resource":"ModelsTask","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/TYPE_ARRAY","resource":"ModelsTask","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/TYPE_OBJECT","resource":"ModelsTask","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/MIN_LENGTH","resource":"ModelsTask","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Task/properties/title/minLength","schema_pointer":"#/components/schemas/models.Task/properties/title/minLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsLabel/description/TYPE_NUMBER","resource":"ModelsLabel","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/description/TYPE_BOOLEAN","resource":"ModelsLabel","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/description/TYPE_ARRAY","resource":"ModelsLabel","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/description/TYPE_OBJECT","resource":"ModelsLabel","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/description/type","schema_pointer":"#/components/schemas/models.Label/properties/description/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/hex_color/TYPE_NUMBER","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/hex_color/TYPE_BOOLEAN","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/hex_color/TYPE_ARRAY","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/hex_color/TYPE_OBJECT","resource":"ModelsLabel","field":"hex_color","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/hex_color/type","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/hex_color/MAX_LENGTH","resource":"ModelsLabel","field":"hex_color","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxx","constraint":"maxLength","declared_constraint":7,"source_pointer":"#/definitions/models.Label/properties/hex_color/maxLength","schema_pointer":"#/components/schemas/models.Label/properties/hex_color/maxLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/TYPE_NUMBER","resource":"ModelsLabel","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/TYPE_BOOLEAN","resource":"ModelsLabel","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/TYPE_ARRAY","resource":"ModelsLabel","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/TYPE_OBJECT","resource":"ModelsLabel","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/MIN_LENGTH","resource":"ModelsLabel","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Label/properties/title/minLength","schema_pointer":"#/components/schemas/models.Label/properties/title/minLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/MAX_LENGTH","resource":"ModelsLabel","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Label/properties/title/maxLength","schema_pointer":"#/components/schemas/models.Label/properties/title/maxLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/TYPE_NUMBER","resource":"ModelsProjectView","field":"title","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/TYPE_BOOLEAN","resource":"ModelsProjectView","field":"title","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/TYPE_ARRAY","resource":"ModelsProjectView","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/TYPE_OBJECT","resource":"ModelsProjectView","field":"title","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.ProjectView/properties/title/type","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/type","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/MIN_LENGTH","resource":"ModelsProjectView","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.ProjectView/properties/title/minLength","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/minLength","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsProjectView/title/MAX_LENGTH","resource":"ModelsProjectView","field":"title","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.ProjectView/properties/title/maxLength","schema_pointer":"#/components/schemas/models.ProjectView/properties/title/maxLength","operation":"POST /projects/{project}/views/{id}","effective_operation":"POST /projects/{project}/views/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/description/TYPE_NUMBER","resource":"ModelsTeam","field":"description","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/description/TYPE_BOOLEAN","resource":"ModelsTeam","field":"description","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/description/TYPE_ARRAY","resource":"ModelsTeam","field":"description","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/description/TYPE_OBJECT","resource":"ModelsTeam","field":"description","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/description/type","schema_pointer":"#/components/schemas/models.Team/properties/description/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/TYPE_NUMBER","resource":"ModelsTeam","field":"name","kind":"TYPE_NUMBER","mutation":"replace","invalid_value":42,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/TYPE_BOOLEAN","resource":"ModelsTeam","field":"name","kind":"TYPE_BOOLEAN","mutation":"replace","invalid_value":false,"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/TYPE_ARRAY","resource":"ModelsTeam","field":"name","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/TYPE_OBJECT","resource":"ModelsTeam","field":"name","kind":"TYPE_OBJECT","mutation":"replace","invalid_value":{},"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/MIN_LENGTH","resource":"ModelsTeam","field":"name","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Team/properties/name/minLength","schema_pointer":"#/components/schemas/models.Team/properties/name/minLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/MAX_LENGTH","resource":"ModelsTeam","field":"name","kind":"MAX_LENGTH","mutation":"replace","invalid_value":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","constraint":"maxLength","declared_constraint":250,"source_pointer":"#/definitions/models.Team/properties/name/maxLength","schema_pointer":"#/components/schemas/models.Team/properties/name/maxLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]}]}));});
ctx.bthread("negative verifier ModelsProject","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsProject")return;verifyNegativeModelsProject(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});








































































































































































































ctx.bthread("negative verifier ModelsTask","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsTask")return;verifyNegativeModelsTask(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});












































































































































ctx.bthread("negative verifier ModelsLabel","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsLabel")return;verifyNegativeModelsLabel(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});






















































































































































ctx.bthread("negative verifier ModelsProjectView","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsProjectView")return;verifyNegativeModelsProjectView(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});




























































ctx.bthread("negative verifier ModelsTeam","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsTeam")return;verifyNegativeModelsTeam(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});




































































































// Generic observation isolation over declared write footprints.
// The scheduler remains Provengo's; disjoint resources are not blocked.
bthread("resource-local negative observation isolation",function(){
    var positives={},negatives={};
    function affected(m){
        var ids=[];
        if(m.logicalId)ids.push(m.logicalId);
        (m.affected||[]).forEach(function(id){if(ids.indexOf(id)<0)ids.push(id);});
        return ids;
    }
    while(true){
        var event=sync({waitFor:bp.all,block:bp.EventSet("resource-local observation conflicts",function(e){
            var d=e.data||{};
            if(e.name==="NegativeAcquire")return !!positives[d.logicalId]||!!negatives[d.logicalId];
            if(e.name==="ModelWriteBegin")return !!negatives[d.logicalId];
            var m=d.model;
            if(!m)return false;
            if(m.action!=="create"&&m.action!=="update"&&m.action!=="delete"&&m.action!=="negative_attempt")return false;
            return affected(m).some(function(id){
                return !!negatives[id] && !(m.action==="negative_attempt"&&negatives[id]===m.caseId);
            });
        })});
        var data=event.data||{};
        if(event.name==="ModelWriteBegin")positives[data.logicalId]=data.revision;
        if(event.name==="ModelVerified" && positives[data.logicalId]===data.revision)delete positives[data.logicalId];
        if(event.name==="NegativeAcquire")negatives[data.logicalId]=data.caseId;
        if(event.name==="NegativeRelease" && negatives[data.logicalId]===data.caseId)delete negatives[data.logicalId];
    }
});
var WORKFLOW_NAMESPACE="baseline";

function workflowValue(sessionId,resourceId,spec){
 var input=WORKFLOW_NAMESPACE+"/"+sessionId+"/"+resourceId+"/"+spec.field,h=2166136261;
 for(var i=0;i<input.length;i++){h^=input.charCodeAt(i);h=(h+(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24))|0;}
 var hex=(h>>>0).toString(16);while(hex.length<8)hex="0"+hex;
 if(spec.domain==="hex_rgb")return hex.slice(0,6);
 if(spec.domain==="unique_short_identifier")return ("P"+hex).toUpperCase();
 return "sbt-"+sessionId+"-"+resourceId+"-"+spec.field;
}

function registerWorkModelsProject(sessionId,resourceId,fieldSpecs){
 var caseId="WORK_"+sessionId+"_"+resourceId;
 bthread(caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  fieldSpecs.forEach(function(spec){
   request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
   var resource=getModelEntity(resourceId),revision=resource.revision+1;
   var value=workflowValue(sessionId,resourceId,spec);while(value.length<spec.minLength)value+="x";if(spec.maxLength)value=value.slice(0,spec.maxLength);var delta={};delta[spec.field]=value;
   updateModelsProject(resource,delta,sessionId);waitFor(matchesVerified(resourceId,revision));
   request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  });
  request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
  verifyModelsProject(getModelEntity(resourceId),sessionId);
  request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  bp.log.info("SESSION_WORKFLOW_COMPLETE "+JSON.stringify({caseId:caseId,logicalId:resourceId,session:sessionId}));
 });
}
["ModelsProject_1", "ModelsProject_2", "ModelsProject_3", "ModelsProject_4", "ModelsProject_5", "ModelsProject_6", "ModelsProject_7", "ModelsProject_8", "ModelsProject_9", "ModelsProject_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){registerWorkModelsProject(sessionId,resourceId,[{"field": "description", "maxLength": null, "minLength": 0, "domain": "plain_string"}, {"field": "hex_color", "maxLength": 7, "minLength": 0, "domain": "hex_rgb"}, {"field": "identifier", "maxLength": 10, "minLength": 0, "domain": "unique_short_identifier"}, {"field": "title", "maxLength": 250, "minLength": 1, "domain": "plain_string"}]);});});

function registerCreationModelsProject(definition){bthread("lifecycle "+definition.id,function(){
 var parents=waitForDependencies([],definition.bindings);
 createModelsProject(definition.id,definition.body,parents);
 waitFor(matchesVerified(definition.id,1));
});}
[{"id": "ModelsProject_1", "bindings": {}, "body": {"title": "sbt-1-ModelsProject-1-title"}}, {"id": "ModelsProject_2", "bindings": {}, "body": {"title": "sbt-1-ModelsProject-2-title"}}, {"id": "ModelsProject_3", "bindings": {}, "body": {"title": "sbt-1-ModelsProject-3-title"}}, {"id": "ModelsProject_4", "bindings": {}, "body": {"title": "sbt-1-ModelsProject-4-title"}}, {"id": "ModelsProject_5", "bindings": {}, "body": {"title": "sbt-1-ModelsProject-5-title"}}, {"id": "ModelsProject_6", "bindings": {}, "body": {"title": "sbt-1-ModelsProject-6-title"}}, {"id": "ModelsProject_7", "bindings": {}, "body": {"title": "sbt-1-ModelsProject-7-title"}}, {"id": "ModelsProject_8", "bindings": {}, "body": {"title": "sbt-1-ModelsProject-8-title"}}, {"id": "ModelsProject_9", "bindings": {}, "body": {"title": "sbt-1-ModelsProject-9-title"}}, {"id": "ModelsProject_10", "bindings": {}, "body": {"title": "sbt-1-ModelsProject-10-title"}}].forEach(registerCreationModelsProject);

function registerNegativeModelsProject(sessionId,resourceId,rule,index){
 var caseId="NEG_"+sessionId+"_"+resourceId+"_"+index;
 bthread("negative "+caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  request(bp.Event("NegativeAcquire",{logicalId:resourceId,caseId:caseId}));
  attemptNegativeModelsProject(getModelEntity(resourceId),rule,caseId);
  request(bp.Event("NegativeRelease",{logicalId:resourceId,caseId:caseId}));
 });
}
["ModelsProject_1", "ModelsProject_2", "ModelsProject_3", "ModelsProject_4", "ModelsProject_5", "ModelsProject_6", "ModelsProject_7", "ModelsProject_8", "ModelsProject_9", "ModelsProject_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){[{"id": "ModelsProject/description/TYPE_NUMBER", "resource": "ModelsProject", "field": "description", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/description/type", "schema_pointer": "#/components/schemas/models.Project/properties/description/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/description/TYPE_BOOLEAN", "resource": "ModelsProject", "field": "description", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/description/type", "schema_pointer": "#/components/schemas/models.Project/properties/description/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/description/TYPE_ARRAY", "resource": "ModelsProject", "field": "description", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/description/type", "schema_pointer": "#/components/schemas/models.Project/properties/description/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/description/TYPE_OBJECT", "resource": "ModelsProject", "field": "description", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/description/type", "schema_pointer": "#/components/schemas/models.Project/properties/description/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/hex_color/TYPE_NUMBER", "resource": "ModelsProject", "field": "hex_color", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Project/properties/hex_color/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/hex_color/TYPE_BOOLEAN", "resource": "ModelsProject", "field": "hex_color", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Project/properties/hex_color/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/hex_color/TYPE_ARRAY", "resource": "ModelsProject", "field": "hex_color", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Project/properties/hex_color/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/hex_color/TYPE_OBJECT", "resource": "ModelsProject", "field": "hex_color", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Project/properties/hex_color/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/hex_color/MAX_LENGTH", "resource": "ModelsProject", "field": "hex_color", "kind": "MAX_LENGTH", "mutation": "replace", "invalid_value": "xxxxxxxx", "constraint": "maxLength", "declared_constraint": 7, "source_pointer": "#/definitions/models.Project/properties/hex_color/maxLength", "schema_pointer": "#/components/schemas/models.Project/properties/hex_color/maxLength", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/identifier/TYPE_NUMBER", "resource": "ModelsProject", "field": "identifier", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/identifier/type", "schema_pointer": "#/components/schemas/models.Project/properties/identifier/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/identifier/TYPE_BOOLEAN", "resource": "ModelsProject", "field": "identifier", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/identifier/type", "schema_pointer": "#/components/schemas/models.Project/properties/identifier/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/identifier/TYPE_ARRAY", "resource": "ModelsProject", "field": "identifier", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/identifier/type", "schema_pointer": "#/components/schemas/models.Project/properties/identifier/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/identifier/TYPE_OBJECT", "resource": "ModelsProject", "field": "identifier", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/identifier/type", "schema_pointer": "#/components/schemas/models.Project/properties/identifier/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/identifier/MAX_LENGTH", "resource": "ModelsProject", "field": "identifier", "kind": "MAX_LENGTH", "mutation": "replace", "invalid_value": "xxxxxxxxxxx", "constraint": "maxLength", "declared_constraint": 10, "source_pointer": "#/definitions/models.Project/properties/identifier/maxLength", "schema_pointer": "#/components/schemas/models.Project/properties/identifier/maxLength", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/title/TYPE_NUMBER", "resource": "ModelsProject", "field": "title", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/title/type", "schema_pointer": "#/components/schemas/models.Project/properties/title/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/title/TYPE_BOOLEAN", "resource": "ModelsProject", "field": "title", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/title/type", "schema_pointer": "#/components/schemas/models.Project/properties/title/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/title/TYPE_ARRAY", "resource": "ModelsProject", "field": "title", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/title/type", "schema_pointer": "#/components/schemas/models.Project/properties/title/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/title/TYPE_OBJECT", "resource": "ModelsProject", "field": "title", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Project/properties/title/type", "schema_pointer": "#/components/schemas/models.Project/properties/title/type", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/title/MIN_LENGTH", "resource": "ModelsProject", "field": "title", "kind": "MIN_LENGTH", "mutation": "replace", "invalid_value": "", "constraint": "minLength", "declared_constraint": 1, "source_pointer": "#/definitions/models.Project/properties/title/minLength", "schema_pointer": "#/components/schemas/models.Project/properties/title/minLength", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsProject/title/MAX_LENGTH", "resource": "ModelsProject", "field": "title", "kind": "MAX_LENGTH", "mutation": "replace", "invalid_value": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "constraint": "maxLength", "declared_constraint": 250, "source_pointer": "#/definitions/models.Project/properties/title/maxLength", "schema_pointer": "#/components/schemas/models.Project/properties/title/maxLength", "operation": "POST /projects/{id}", "effective_operation": "POST /projects/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}].forEach(function(rule,index){registerNegativeModelsProject(sessionId,resourceId,rule,index);});});});

function registerWorkModelsTask(sessionId,resourceId,fieldSpecs){
 var caseId="WORK_"+sessionId+"_"+resourceId;
 bthread(caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  fieldSpecs.forEach(function(spec){
   request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
   var resource=getModelEntity(resourceId),revision=resource.revision+1;
   var value=workflowValue(sessionId,resourceId,spec);while(value.length<spec.minLength)value+="x";if(spec.maxLength)value=value.slice(0,spec.maxLength);var delta={};delta[spec.field]=value;
   updateModelsTask(resource,delta,sessionId);waitFor(matchesVerified(resourceId,revision));
   request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  });
  request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
  verifyModelsTask(getModelEntity(resourceId),sessionId);
  request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  bp.log.info("SESSION_WORKFLOW_COMPLETE "+JSON.stringify({caseId:caseId,logicalId:resourceId,session:sessionId}));
 });
}
["ModelsTask_1", "ModelsTask_2", "ModelsTask_3", "ModelsTask_4", "ModelsTask_5", "ModelsTask_6", "ModelsTask_7", "ModelsTask_8", "ModelsTask_9", "ModelsTask_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){registerWorkModelsTask(sessionId,resourceId,[{"field": "description", "maxLength": null, "minLength": 0, "domain": "plain_string"}, {"field": "hex_color", "maxLength": 7, "minLength": 0, "domain": "hex_rgb"}, {"field": "title", "maxLength": null, "minLength": 1, "domain": "plain_string"}]);});});

function registerCreationModelsTask(definition){bthread("lifecycle "+definition.id,function(){
 var parents=waitForDependencies(["ModelsProject"],definition.bindings);
 createModelsTask(definition.id,definition.body,parents);
 waitFor(matchesVerified(definition.id,1));
});}
[{"id": "ModelsTask_1", "bindings": {"ModelsProject": "ModelsProject_1"}, "body": {"title": "sbt-1-ModelsTask-1-title"}}, {"id": "ModelsTask_2", "bindings": {"ModelsProject": "ModelsProject_2"}, "body": {"title": "sbt-1-ModelsTask-2-title"}}, {"id": "ModelsTask_3", "bindings": {"ModelsProject": "ModelsProject_3"}, "body": {"title": "sbt-1-ModelsTask-3-title"}}, {"id": "ModelsTask_4", "bindings": {"ModelsProject": "ModelsProject_4"}, "body": {"title": "sbt-1-ModelsTask-4-title"}}, {"id": "ModelsTask_5", "bindings": {"ModelsProject": "ModelsProject_5"}, "body": {"title": "sbt-1-ModelsTask-5-title"}}, {"id": "ModelsTask_6", "bindings": {"ModelsProject": "ModelsProject_6"}, "body": {"title": "sbt-1-ModelsTask-6-title"}}, {"id": "ModelsTask_7", "bindings": {"ModelsProject": "ModelsProject_7"}, "body": {"title": "sbt-1-ModelsTask-7-title"}}, {"id": "ModelsTask_8", "bindings": {"ModelsProject": "ModelsProject_8"}, "body": {"title": "sbt-1-ModelsTask-8-title"}}, {"id": "ModelsTask_9", "bindings": {"ModelsProject": "ModelsProject_9"}, "body": {"title": "sbt-1-ModelsTask-9-title"}}, {"id": "ModelsTask_10", "bindings": {"ModelsProject": "ModelsProject_10"}, "body": {"title": "sbt-1-ModelsTask-10-title"}}].forEach(registerCreationModelsTask);

function registerNegativeModelsTask(sessionId,resourceId,rule,index){
 var caseId="NEG_"+sessionId+"_"+resourceId+"_"+index;
 bthread("negative "+caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  request(bp.Event("NegativeAcquire",{logicalId:resourceId,caseId:caseId}));
  attemptNegativeModelsTask(getModelEntity(resourceId),rule,caseId);
  request(bp.Event("NegativeRelease",{logicalId:resourceId,caseId:caseId}));
 });
}
["ModelsTask_1", "ModelsTask_2", "ModelsTask_3", "ModelsTask_4", "ModelsTask_5", "ModelsTask_6", "ModelsTask_7", "ModelsTask_8", "ModelsTask_9", "ModelsTask_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){[{"id": "ModelsTask/description/TYPE_NUMBER", "resource": "ModelsTask", "field": "description", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/description/type", "schema_pointer": "#/components/schemas/models.Task/properties/description/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/description/TYPE_BOOLEAN", "resource": "ModelsTask", "field": "description", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/description/type", "schema_pointer": "#/components/schemas/models.Task/properties/description/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/description/TYPE_ARRAY", "resource": "ModelsTask", "field": "description", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/description/type", "schema_pointer": "#/components/schemas/models.Task/properties/description/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/description/TYPE_OBJECT", "resource": "ModelsTask", "field": "description", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/description/type", "schema_pointer": "#/components/schemas/models.Task/properties/description/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/hex_color/TYPE_NUMBER", "resource": "ModelsTask", "field": "hex_color", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Task/properties/hex_color/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/hex_color/TYPE_BOOLEAN", "resource": "ModelsTask", "field": "hex_color", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Task/properties/hex_color/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/hex_color/TYPE_ARRAY", "resource": "ModelsTask", "field": "hex_color", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Task/properties/hex_color/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/hex_color/TYPE_OBJECT", "resource": "ModelsTask", "field": "hex_color", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Task/properties/hex_color/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/hex_color/MAX_LENGTH", "resource": "ModelsTask", "field": "hex_color", "kind": "MAX_LENGTH", "mutation": "replace", "invalid_value": "xxxxxxxx", "constraint": "maxLength", "declared_constraint": 7, "source_pointer": "#/definitions/models.Task/properties/hex_color/maxLength", "schema_pointer": "#/components/schemas/models.Task/properties/hex_color/maxLength", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/title/TYPE_NUMBER", "resource": "ModelsTask", "field": "title", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/title/type", "schema_pointer": "#/components/schemas/models.Task/properties/title/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/title/TYPE_BOOLEAN", "resource": "ModelsTask", "field": "title", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/title/type", "schema_pointer": "#/components/schemas/models.Task/properties/title/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/title/TYPE_ARRAY", "resource": "ModelsTask", "field": "title", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/title/type", "schema_pointer": "#/components/schemas/models.Task/properties/title/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/title/TYPE_OBJECT", "resource": "ModelsTask", "field": "title", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Task/properties/title/type", "schema_pointer": "#/components/schemas/models.Task/properties/title/type", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}, {"id": "ModelsTask/title/MIN_LENGTH", "resource": "ModelsTask", "field": "title", "kind": "MIN_LENGTH", "mutation": "replace", "invalid_value": "", "constraint": "minLength", "declared_constraint": 1, "source_pointer": "#/definitions/models.Task/properties/title/minLength", "schema_pointer": "#/components/schemas/models.Task/properties/title/minLength", "operation": "POST /tasks/{id}", "effective_operation": "POST /tasks/{id}", "documented_statuses": ["200", "400", "403", "500"], "compound_constraints": []}].forEach(function(rule,index){registerNegativeModelsTask(sessionId,resourceId,rule,index);});});});

function registerWorkModelsLabel(sessionId,resourceId,fieldSpecs){
 var caseId="WORK_"+sessionId+"_"+resourceId;
 bthread(caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  fieldSpecs.forEach(function(spec){
   request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
   var resource=getModelEntity(resourceId),revision=resource.revision+1;
   var value=workflowValue(sessionId,resourceId,spec);while(value.length<spec.minLength)value+="x";if(spec.maxLength)value=value.slice(0,spec.maxLength);var delta={};delta[spec.field]=value;
   updateModelsLabel(resource,delta,sessionId);waitFor(matchesVerified(resourceId,revision));
   request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  });
  request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
  verifyModelsLabel(getModelEntity(resourceId),sessionId);
  request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  bp.log.info("SESSION_WORKFLOW_COMPLETE "+JSON.stringify({caseId:caseId,logicalId:resourceId,session:sessionId}));
 });
}
["ModelsLabel_1", "ModelsLabel_2", "ModelsLabel_3", "ModelsLabel_4", "ModelsLabel_5", "ModelsLabel_6", "ModelsLabel_7", "ModelsLabel_8", "ModelsLabel_9", "ModelsLabel_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){registerWorkModelsLabel(sessionId,resourceId,[{"field": "description", "maxLength": null, "minLength": 0, "domain": "plain_string"}, {"field": "hex_color", "maxLength": 7, "minLength": 0, "domain": "hex_rgb"}, {"field": "title", "maxLength": 250, "minLength": 1, "domain": "plain_string"}]);});});

function registerCreationModelsLabel(definition){bthread("lifecycle "+definition.id,function(){
 var parents=waitForDependencies([],definition.bindings);
 createModelsLabel(definition.id,definition.body,parents);
 waitFor(matchesVerified(definition.id,1));
});}
[{"id": "ModelsLabel_1", "bindings": {}, "body": {"title": "sbt-1-ModelsLabel-1-title"}}, {"id": "ModelsLabel_2", "bindings": {}, "body": {"title": "sbt-1-ModelsLabel-2-title"}}, {"id": "ModelsLabel_3", "bindings": {}, "body": {"title": "sbt-1-ModelsLabel-3-title"}}, {"id": "ModelsLabel_4", "bindings": {}, "body": {"title": "sbt-1-ModelsLabel-4-title"}}, {"id": "ModelsLabel_5", "bindings": {}, "body": {"title": "sbt-1-ModelsLabel-5-title"}}, {"id": "ModelsLabel_6", "bindings": {}, "body": {"title": "sbt-1-ModelsLabel-6-title"}}, {"id": "ModelsLabel_7", "bindings": {}, "body": {"title": "sbt-1-ModelsLabel-7-title"}}, {"id": "ModelsLabel_8", "bindings": {}, "body": {"title": "sbt-1-ModelsLabel-8-title"}}, {"id": "ModelsLabel_9", "bindings": {}, "body": {"title": "sbt-1-ModelsLabel-9-title"}}, {"id": "ModelsLabel_10", "bindings": {}, "body": {"title": "sbt-1-ModelsLabel-10-title"}}].forEach(registerCreationModelsLabel);

function registerNegativeModelsLabel(sessionId,resourceId,rule,index){
 var caseId="NEG_"+sessionId+"_"+resourceId+"_"+index;
 bthread("negative "+caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  request(bp.Event("NegativeAcquire",{logicalId:resourceId,caseId:caseId}));
  attemptNegativeModelsLabel(getModelEntity(resourceId),rule,caseId);
  request(bp.Event("NegativeRelease",{logicalId:resourceId,caseId:caseId}));
 });
}
["ModelsLabel_1", "ModelsLabel_2", "ModelsLabel_3", "ModelsLabel_4", "ModelsLabel_5", "ModelsLabel_6", "ModelsLabel_7", "ModelsLabel_8", "ModelsLabel_9", "ModelsLabel_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){[{"id": "ModelsLabel/description/TYPE_NUMBER", "resource": "ModelsLabel", "field": "description", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/description/type", "schema_pointer": "#/components/schemas/models.Label/properties/description/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/description/TYPE_BOOLEAN", "resource": "ModelsLabel", "field": "description", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/description/type", "schema_pointer": "#/components/schemas/models.Label/properties/description/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/description/TYPE_ARRAY", "resource": "ModelsLabel", "field": "description", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/description/type", "schema_pointer": "#/components/schemas/models.Label/properties/description/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/description/TYPE_OBJECT", "resource": "ModelsLabel", "field": "description", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/description/type", "schema_pointer": "#/components/schemas/models.Label/properties/description/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/hex_color/TYPE_NUMBER", "resource": "ModelsLabel", "field": "hex_color", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Label/properties/hex_color/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/hex_color/TYPE_BOOLEAN", "resource": "ModelsLabel", "field": "hex_color", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Label/properties/hex_color/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/hex_color/TYPE_ARRAY", "resource": "ModelsLabel", "field": "hex_color", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Label/properties/hex_color/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/hex_color/TYPE_OBJECT", "resource": "ModelsLabel", "field": "hex_color", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/hex_color/type", "schema_pointer": "#/components/schemas/models.Label/properties/hex_color/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/hex_color/MAX_LENGTH", "resource": "ModelsLabel", "field": "hex_color", "kind": "MAX_LENGTH", "mutation": "replace", "invalid_value": "xxxxxxxx", "constraint": "maxLength", "declared_constraint": 7, "source_pointer": "#/definitions/models.Label/properties/hex_color/maxLength", "schema_pointer": "#/components/schemas/models.Label/properties/hex_color/maxLength", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/title/TYPE_NUMBER", "resource": "ModelsLabel", "field": "title", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/title/type", "schema_pointer": "#/components/schemas/models.Label/properties/title/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/title/TYPE_BOOLEAN", "resource": "ModelsLabel", "field": "title", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/title/type", "schema_pointer": "#/components/schemas/models.Label/properties/title/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/title/TYPE_ARRAY", "resource": "ModelsLabel", "field": "title", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/title/type", "schema_pointer": "#/components/schemas/models.Label/properties/title/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/title/TYPE_OBJECT", "resource": "ModelsLabel", "field": "title", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Label/properties/title/type", "schema_pointer": "#/components/schemas/models.Label/properties/title/type", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/title/MIN_LENGTH", "resource": "ModelsLabel", "field": "title", "kind": "MIN_LENGTH", "mutation": "replace", "invalid_value": "", "constraint": "minLength", "declared_constraint": 1, "source_pointer": "#/definitions/models.Label/properties/title/minLength", "schema_pointer": "#/components/schemas/models.Label/properties/title/minLength", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}, {"id": "ModelsLabel/title/MAX_LENGTH", "resource": "ModelsLabel", "field": "title", "kind": "MAX_LENGTH", "mutation": "replace", "invalid_value": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "constraint": "maxLength", "declared_constraint": 250, "source_pointer": "#/definitions/models.Label/properties/title/maxLength", "schema_pointer": "#/components/schemas/models.Label/properties/title/maxLength", "operation": "PUT /labels/{id}", "effective_operation": "POST /labels/{id}", "documented_statuses": ["200", "400", "403", "404", "500"], "compound_constraints": []}].forEach(function(rule,index){registerNegativeModelsLabel(sessionId,resourceId,rule,index);});});});

function registerWorkModelsProjectView(sessionId,resourceId,fieldSpecs){
 var caseId="WORK_"+sessionId+"_"+resourceId;
 bthread(caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  fieldSpecs.forEach(function(spec){
   request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
   var resource=getModelEntity(resourceId),revision=resource.revision+1;
   var value=workflowValue(sessionId,resourceId,spec);while(value.length<spec.minLength)value+="x";if(spec.maxLength)value=value.slice(0,spec.maxLength);var delta={};delta[spec.field]=value;
   updateModelsProjectView(resource,delta,sessionId);waitFor(matchesVerified(resourceId,revision));
   request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  });
  request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
  verifyModelsProjectView(getModelEntity(resourceId),sessionId);
  request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  bp.log.info("SESSION_WORKFLOW_COMPLETE "+JSON.stringify({caseId:caseId,logicalId:resourceId,session:sessionId}));
 });
}
["ModelsProjectView_1", "ModelsProjectView_2", "ModelsProjectView_3", "ModelsProjectView_4", "ModelsProjectView_5", "ModelsProjectView_6", "ModelsProjectView_7", "ModelsProjectView_8", "ModelsProjectView_9", "ModelsProjectView_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){registerWorkModelsProjectView(sessionId,resourceId,[{"field": "title", "maxLength": 250, "minLength": 1, "domain": "plain_string"}]);});});

function registerCreationModelsProjectView(definition){bthread("lifecycle "+definition.id,function(){
 var parents=waitForDependencies(["ModelsProject"],definition.bindings);
 createModelsProjectView(definition.id,definition.body,parents);
 waitFor(matchesVerified(definition.id,1));
});}
[{"id": "ModelsProjectView_1", "bindings": {"ModelsProject": "ModelsProject_1"}, "body": {"title": "sbt-1-ModelsProjectView-1-title", "view_kind": "list"}}, {"id": "ModelsProjectView_2", "bindings": {"ModelsProject": "ModelsProject_2"}, "body": {"title": "sbt-1-ModelsProjectView-2-title", "view_kind": "list"}}, {"id": "ModelsProjectView_3", "bindings": {"ModelsProject": "ModelsProject_3"}, "body": {"title": "sbt-1-ModelsProjectView-3-title", "view_kind": "list"}}, {"id": "ModelsProjectView_4", "bindings": {"ModelsProject": "ModelsProject_4"}, "body": {"title": "sbt-1-ModelsProjectView-4-title", "view_kind": "list"}}, {"id": "ModelsProjectView_5", "bindings": {"ModelsProject": "ModelsProject_5"}, "body": {"title": "sbt-1-ModelsProjectView-5-title", "view_kind": "list"}}, {"id": "ModelsProjectView_6", "bindings": {"ModelsProject": "ModelsProject_6"}, "body": {"title": "sbt-1-ModelsProjectView-6-title", "view_kind": "list"}}, {"id": "ModelsProjectView_7", "bindings": {"ModelsProject": "ModelsProject_7"}, "body": {"title": "sbt-1-ModelsProjectView-7-title", "view_kind": "list"}}, {"id": "ModelsProjectView_8", "bindings": {"ModelsProject": "ModelsProject_8"}, "body": {"title": "sbt-1-ModelsProjectView-8-title", "view_kind": "list"}}, {"id": "ModelsProjectView_9", "bindings": {"ModelsProject": "ModelsProject_9"}, "body": {"title": "sbt-1-ModelsProjectView-9-title", "view_kind": "list"}}, {"id": "ModelsProjectView_10", "bindings": {"ModelsProject": "ModelsProject_10"}, "body": {"title": "sbt-1-ModelsProjectView-10-title", "view_kind": "list"}}].forEach(registerCreationModelsProjectView);

function registerNegativeModelsProjectView(sessionId,resourceId,rule,index){
 var caseId="NEG_"+sessionId+"_"+resourceId+"_"+index;
 bthread("negative "+caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  request(bp.Event("NegativeAcquire",{logicalId:resourceId,caseId:caseId}));
  attemptNegativeModelsProjectView(getModelEntity(resourceId),rule,caseId);
  request(bp.Event("NegativeRelease",{logicalId:resourceId,caseId:caseId}));
 });
}
["ModelsProjectView_1", "ModelsProjectView_2", "ModelsProjectView_3", "ModelsProjectView_4", "ModelsProjectView_5", "ModelsProjectView_6", "ModelsProjectView_7", "ModelsProjectView_8", "ModelsProjectView_9", "ModelsProjectView_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){[{"id": "ModelsProjectView/title/TYPE_NUMBER", "resource": "ModelsProjectView", "field": "title", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.ProjectView/properties/title/type", "schema_pointer": "#/components/schemas/models.ProjectView/properties/title/type", "operation": "POST /projects/{project}/views/{id}", "effective_operation": "POST /projects/{project}/views/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsProjectView/title/TYPE_BOOLEAN", "resource": "ModelsProjectView", "field": "title", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.ProjectView/properties/title/type", "schema_pointer": "#/components/schemas/models.ProjectView/properties/title/type", "operation": "POST /projects/{project}/views/{id}", "effective_operation": "POST /projects/{project}/views/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsProjectView/title/TYPE_ARRAY", "resource": "ModelsProjectView", "field": "title", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.ProjectView/properties/title/type", "schema_pointer": "#/components/schemas/models.ProjectView/properties/title/type", "operation": "POST /projects/{project}/views/{id}", "effective_operation": "POST /projects/{project}/views/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsProjectView/title/TYPE_OBJECT", "resource": "ModelsProjectView", "field": "title", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.ProjectView/properties/title/type", "schema_pointer": "#/components/schemas/models.ProjectView/properties/title/type", "operation": "POST /projects/{project}/views/{id}", "effective_operation": "POST /projects/{project}/views/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsProjectView/title/MIN_LENGTH", "resource": "ModelsProjectView", "field": "title", "kind": "MIN_LENGTH", "mutation": "replace", "invalid_value": "", "constraint": "minLength", "declared_constraint": 1, "source_pointer": "#/definitions/models.ProjectView/properties/title/minLength", "schema_pointer": "#/components/schemas/models.ProjectView/properties/title/minLength", "operation": "POST /projects/{project}/views/{id}", "effective_operation": "POST /projects/{project}/views/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsProjectView/title/MAX_LENGTH", "resource": "ModelsProjectView", "field": "title", "kind": "MAX_LENGTH", "mutation": "replace", "invalid_value": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "constraint": "maxLength", "declared_constraint": 250, "source_pointer": "#/definitions/models.ProjectView/properties/title/maxLength", "schema_pointer": "#/components/schemas/models.ProjectView/properties/title/maxLength", "operation": "POST /projects/{project}/views/{id}", "effective_operation": "POST /projects/{project}/views/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}].forEach(function(rule,index){registerNegativeModelsProjectView(sessionId,resourceId,rule,index);});});});

function registerWorkModelsTaskComment(sessionId,resourceId,fieldSpecs){
 var caseId="WORK_"+sessionId+"_"+resourceId;
 bthread(caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
  verifyModelsTaskComment(getModelEntity(resourceId),sessionId);
  request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  bp.log.info("SESSION_WORKFLOW_COMPLETE "+JSON.stringify({caseId:caseId,logicalId:resourceId,session:sessionId}));
 });
}
["ModelsTaskComment_1", "ModelsTaskComment_2", "ModelsTaskComment_3", "ModelsTaskComment_4", "ModelsTaskComment_5", "ModelsTaskComment_6", "ModelsTaskComment_7", "ModelsTaskComment_8", "ModelsTaskComment_9", "ModelsTaskComment_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){registerWorkModelsTaskComment(sessionId,resourceId,[]);});});

function registerCreationModelsTaskComment(definition){bthread("lifecycle "+definition.id,function(){
 var parents=waitForDependencies(["ModelsTask"],definition.bindings);
 createModelsTaskComment(definition.id,definition.body,parents);
 waitFor(matchesVerified(definition.id,1));
});}
[{"id": "ModelsTaskComment_1", "bindings": {"ModelsTask": "ModelsTask_1"}, "body": {"comment": "sbt-1-ModelsTaskComment-1-comment"}}, {"id": "ModelsTaskComment_2", "bindings": {"ModelsTask": "ModelsTask_2"}, "body": {"comment": "sbt-1-ModelsTaskComment-2-comment"}}, {"id": "ModelsTaskComment_3", "bindings": {"ModelsTask": "ModelsTask_3"}, "body": {"comment": "sbt-1-ModelsTaskComment-3-comment"}}, {"id": "ModelsTaskComment_4", "bindings": {"ModelsTask": "ModelsTask_4"}, "body": {"comment": "sbt-1-ModelsTaskComment-4-comment"}}, {"id": "ModelsTaskComment_5", "bindings": {"ModelsTask": "ModelsTask_5"}, "body": {"comment": "sbt-1-ModelsTaskComment-5-comment"}}, {"id": "ModelsTaskComment_6", "bindings": {"ModelsTask": "ModelsTask_6"}, "body": {"comment": "sbt-1-ModelsTaskComment-6-comment"}}, {"id": "ModelsTaskComment_7", "bindings": {"ModelsTask": "ModelsTask_7"}, "body": {"comment": "sbt-1-ModelsTaskComment-7-comment"}}, {"id": "ModelsTaskComment_8", "bindings": {"ModelsTask": "ModelsTask_8"}, "body": {"comment": "sbt-1-ModelsTaskComment-8-comment"}}, {"id": "ModelsTaskComment_9", "bindings": {"ModelsTask": "ModelsTask_9"}, "body": {"comment": "sbt-1-ModelsTaskComment-9-comment"}}, {"id": "ModelsTaskComment_10", "bindings": {"ModelsTask": "ModelsTask_10"}, "body": {"comment": "sbt-1-ModelsTaskComment-10-comment"}}].forEach(registerCreationModelsTaskComment);

function registerWorkModelsTeam(sessionId,resourceId,fieldSpecs){
 var caseId="WORK_"+sessionId+"_"+resourceId;
 bthread(caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  fieldSpecs.forEach(function(spec){
   request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
   var resource=getModelEntity(resourceId),revision=resource.revision+1;
   var value=workflowValue(sessionId,resourceId,spec);while(value.length<spec.minLength)value+="x";if(spec.maxLength)value=value.slice(0,spec.maxLength);var delta={};delta[spec.field]=value;
   updateModelsTeam(resource,delta,sessionId);waitFor(matchesVerified(resourceId,revision));
   request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  });
  request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
  verifyModelsTeam(getModelEntity(resourceId),sessionId);
  request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  bp.log.info("SESSION_WORKFLOW_COMPLETE "+JSON.stringify({caseId:caseId,logicalId:resourceId,session:sessionId}));
 });
}
["ModelsTeam_1", "ModelsTeam_2", "ModelsTeam_3", "ModelsTeam_4", "ModelsTeam_5", "ModelsTeam_6", "ModelsTeam_7", "ModelsTeam_8", "ModelsTeam_9", "ModelsTeam_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){registerWorkModelsTeam(sessionId,resourceId,[{"field": "description", "maxLength": null, "minLength": 0, "domain": "plain_string"}, {"field": "name", "maxLength": 250, "minLength": 1, "domain": "plain_string"}]);});});

function registerCreationModelsTeam(definition){bthread("lifecycle "+definition.id,function(){
 var parents=waitForDependencies([],definition.bindings);
 createModelsTeam(definition.id,definition.body,parents);
 waitFor(matchesVerified(definition.id,1));
});}
[{"id": "ModelsTeam_1", "bindings": {}, "body": {"name": "sbt-1-ModelsTeam-1-name"}}, {"id": "ModelsTeam_2", "bindings": {}, "body": {"name": "sbt-1-ModelsTeam-2-name"}}, {"id": "ModelsTeam_3", "bindings": {}, "body": {"name": "sbt-1-ModelsTeam-3-name"}}, {"id": "ModelsTeam_4", "bindings": {}, "body": {"name": "sbt-1-ModelsTeam-4-name"}}, {"id": "ModelsTeam_5", "bindings": {}, "body": {"name": "sbt-1-ModelsTeam-5-name"}}, {"id": "ModelsTeam_6", "bindings": {}, "body": {"name": "sbt-1-ModelsTeam-6-name"}}, {"id": "ModelsTeam_7", "bindings": {}, "body": {"name": "sbt-1-ModelsTeam-7-name"}}, {"id": "ModelsTeam_8", "bindings": {}, "body": {"name": "sbt-1-ModelsTeam-8-name"}}, {"id": "ModelsTeam_9", "bindings": {}, "body": {"name": "sbt-1-ModelsTeam-9-name"}}, {"id": "ModelsTeam_10", "bindings": {}, "body": {"name": "sbt-1-ModelsTeam-10-name"}}].forEach(registerCreationModelsTeam);

function registerNegativeModelsTeam(sessionId,resourceId,rule,index){
 var caseId="NEG_"+sessionId+"_"+resourceId+"_"+index;
 bthread("negative "+caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  request(bp.Event("NegativeAcquire",{logicalId:resourceId,caseId:caseId}));
  attemptNegativeModelsTeam(getModelEntity(resourceId),rule,caseId);
  request(bp.Event("NegativeRelease",{logicalId:resourceId,caseId:caseId}));
 });
}
["ModelsTeam_1", "ModelsTeam_2", "ModelsTeam_3", "ModelsTeam_4", "ModelsTeam_5", "ModelsTeam_6", "ModelsTeam_7", "ModelsTeam_8", "ModelsTeam_9", "ModelsTeam_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){[{"id": "ModelsTeam/description/TYPE_NUMBER", "resource": "ModelsTeam", "field": "description", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Team/properties/description/type", "schema_pointer": "#/components/schemas/models.Team/properties/description/type", "operation": "POST /teams/{id}", "effective_operation": "POST /teams/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsTeam/description/TYPE_BOOLEAN", "resource": "ModelsTeam", "field": "description", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Team/properties/description/type", "schema_pointer": "#/components/schemas/models.Team/properties/description/type", "operation": "POST /teams/{id}", "effective_operation": "POST /teams/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsTeam/description/TYPE_ARRAY", "resource": "ModelsTeam", "field": "description", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Team/properties/description/type", "schema_pointer": "#/components/schemas/models.Team/properties/description/type", "operation": "POST /teams/{id}", "effective_operation": "POST /teams/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsTeam/description/TYPE_OBJECT", "resource": "ModelsTeam", "field": "description", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Team/properties/description/type", "schema_pointer": "#/components/schemas/models.Team/properties/description/type", "operation": "POST /teams/{id}", "effective_operation": "POST /teams/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsTeam/name/TYPE_NUMBER", "resource": "ModelsTeam", "field": "name", "kind": "TYPE_NUMBER", "mutation": "replace", "invalid_value": 42, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Team/properties/name/type", "schema_pointer": "#/components/schemas/models.Team/properties/name/type", "operation": "POST /teams/{id}", "effective_operation": "POST /teams/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsTeam/name/TYPE_BOOLEAN", "resource": "ModelsTeam", "field": "name", "kind": "TYPE_BOOLEAN", "mutation": "replace", "invalid_value": false, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Team/properties/name/type", "schema_pointer": "#/components/schemas/models.Team/properties/name/type", "operation": "POST /teams/{id}", "effective_operation": "POST /teams/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsTeam/name/TYPE_ARRAY", "resource": "ModelsTeam", "field": "name", "kind": "TYPE_ARRAY", "mutation": "replace", "invalid_value": [], "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Team/properties/name/type", "schema_pointer": "#/components/schemas/models.Team/properties/name/type", "operation": "POST /teams/{id}", "effective_operation": "POST /teams/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsTeam/name/TYPE_OBJECT", "resource": "ModelsTeam", "field": "name", "kind": "TYPE_OBJECT", "mutation": "replace", "invalid_value": {}, "constraint": "type", "declared_constraint": "string", "source_pointer": "#/definitions/models.Team/properties/name/type", "schema_pointer": "#/components/schemas/models.Team/properties/name/type", "operation": "POST /teams/{id}", "effective_operation": "POST /teams/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsTeam/name/MIN_LENGTH", "resource": "ModelsTeam", "field": "name", "kind": "MIN_LENGTH", "mutation": "replace", "invalid_value": "", "constraint": "minLength", "declared_constraint": 1, "source_pointer": "#/definitions/models.Team/properties/name/minLength", "schema_pointer": "#/components/schemas/models.Team/properties/name/minLength", "operation": "POST /teams/{id}", "effective_operation": "POST /teams/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}, {"id": "ModelsTeam/name/MAX_LENGTH", "resource": "ModelsTeam", "field": "name", "kind": "MAX_LENGTH", "mutation": "replace", "invalid_value": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "constraint": "maxLength", "declared_constraint": 250, "source_pointer": "#/definitions/models.Team/properties/name/maxLength", "schema_pointer": "#/components/schemas/models.Team/properties/name/maxLength", "operation": "POST /teams/{id}", "effective_operation": "POST /teams/{id}", "documented_statuses": ["200", "400", "500"], "compound_constraints": []}].forEach(function(rule,index){registerNegativeModelsTeam(sessionId,resourceId,rule,index);});});});

function registerWorkModelsSavedFilter(sessionId,resourceId,fieldSpecs){
 var caseId="WORK_"+sessionId+"_"+resourceId;
 bthread(caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
  verifyModelsSavedFilter(getModelEntity(resourceId),sessionId);
  request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  bp.log.info("SESSION_WORKFLOW_COMPLETE "+JSON.stringify({caseId:caseId,logicalId:resourceId,session:sessionId}));
 });
}
["ModelsSavedFilter_1", "ModelsSavedFilter_2", "ModelsSavedFilter_3", "ModelsSavedFilter_4", "ModelsSavedFilter_5", "ModelsSavedFilter_6", "ModelsSavedFilter_7", "ModelsSavedFilter_8", "ModelsSavedFilter_9", "ModelsSavedFilter_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){registerWorkModelsSavedFilter(sessionId,resourceId,[]);});});

function registerCreationModelsSavedFilter(definition){bthread("lifecycle "+definition.id,function(){
 var parents=waitForDependencies([],definition.bindings);
 createModelsSavedFilter(definition.id,definition.body,parents);
 waitFor(matchesVerified(definition.id,1));
});}
[{"id": "ModelsSavedFilter_1", "bindings": {}, "body": {"title": "sbt-1-ModelsSavedFilter-1-title", "filters": {"filter": "done = false"}}}, {"id": "ModelsSavedFilter_2", "bindings": {}, "body": {"title": "sbt-1-ModelsSavedFilter-2-title", "filters": {"filter": "done = false"}}}, {"id": "ModelsSavedFilter_3", "bindings": {}, "body": {"title": "sbt-1-ModelsSavedFilter-3-title", "filters": {"filter": "done = false"}}}, {"id": "ModelsSavedFilter_4", "bindings": {}, "body": {"title": "sbt-1-ModelsSavedFilter-4-title", "filters": {"filter": "done = false"}}}, {"id": "ModelsSavedFilter_5", "bindings": {}, "body": {"title": "sbt-1-ModelsSavedFilter-5-title", "filters": {"filter": "done = false"}}}, {"id": "ModelsSavedFilter_6", "bindings": {}, "body": {"title": "sbt-1-ModelsSavedFilter-6-title", "filters": {"filter": "done = false"}}}, {"id": "ModelsSavedFilter_7", "bindings": {}, "body": {"title": "sbt-1-ModelsSavedFilter-7-title", "filters": {"filter": "done = false"}}}, {"id": "ModelsSavedFilter_8", "bindings": {}, "body": {"title": "sbt-1-ModelsSavedFilter-8-title", "filters": {"filter": "done = false"}}}, {"id": "ModelsSavedFilter_9", "bindings": {}, "body": {"title": "sbt-1-ModelsSavedFilter-9-title", "filters": {"filter": "done = false"}}}, {"id": "ModelsSavedFilter_10", "bindings": {}, "body": {"title": "sbt-1-ModelsSavedFilter-10-title", "filters": {"filter": "done = false"}}}].forEach(registerCreationModelsSavedFilter);

function registerWorkModelsLinkSharing(sessionId,resourceId,fieldSpecs){
 var caseId="WORK_"+sessionId+"_"+resourceId;
 bthread(caseId,function(){
  awaitSession(sessionId);waitForResource(resourceId,1);
  request(bp.Event("OperationAcquire",{logicalId:resourceId,session:sessionId}));
  verifyModelsLinkSharing(getModelEntity(resourceId),sessionId);
  request(bp.Event("OperationRelease",{logicalId:resourceId,session:sessionId}));
  bp.log.info("SESSION_WORKFLOW_COMPLETE "+JSON.stringify({caseId:caseId,logicalId:resourceId,session:sessionId}));
 });
}
["ModelsLinkSharing_1", "ModelsLinkSharing_2", "ModelsLinkSharing_3", "ModelsLinkSharing_4", "ModelsLinkSharing_5", "ModelsLinkSharing_6", "ModelsLinkSharing_7", "ModelsLinkSharing_8", "ModelsLinkSharing_9", "ModelsLinkSharing_10"].forEach(function(resourceId){["A","B"].forEach(function(sessionId){registerWorkModelsLinkSharing(sessionId,resourceId,[]);});});

function registerCreationModelsLinkSharing(definition){bthread("lifecycle "+definition.id,function(){
 var parents=waitForDependencies(["ModelsProject"],definition.bindings);
 createModelsLinkSharing(definition.id,definition.body,parents);
 waitFor(matchesVerified(definition.id,1));
});}
[{"id": "ModelsLinkSharing_1", "bindings": {"ModelsProject": "ModelsProject_1"}, "body": {"name": "sbt-1-ModelsLinkSharing-1-name", "permission": 0}}, {"id": "ModelsLinkSharing_2", "bindings": {"ModelsProject": "ModelsProject_2"}, "body": {"name": "sbt-1-ModelsLinkSharing-2-name", "permission": 0}}, {"id": "ModelsLinkSharing_3", "bindings": {"ModelsProject": "ModelsProject_3"}, "body": {"name": "sbt-1-ModelsLinkSharing-3-name", "permission": 0}}, {"id": "ModelsLinkSharing_4", "bindings": {"ModelsProject": "ModelsProject_4"}, "body": {"name": "sbt-1-ModelsLinkSharing-4-name", "permission": 0}}, {"id": "ModelsLinkSharing_5", "bindings": {"ModelsProject": "ModelsProject_5"}, "body": {"name": "sbt-1-ModelsLinkSharing-5-name", "permission": 0}}, {"id": "ModelsLinkSharing_6", "bindings": {"ModelsProject": "ModelsProject_6"}, "body": {"name": "sbt-1-ModelsLinkSharing-6-name", "permission": 0}}, {"id": "ModelsLinkSharing_7", "bindings": {"ModelsProject": "ModelsProject_7"}, "body": {"name": "sbt-1-ModelsLinkSharing-7-name", "permission": 0}}, {"id": "ModelsLinkSharing_8", "bindings": {"ModelsProject": "ModelsProject_8"}, "body": {"name": "sbt-1-ModelsLinkSharing-8-name", "permission": 0}}, {"id": "ModelsLinkSharing_9", "bindings": {"ModelsProject": "ModelsProject_9"}, "body": {"name": "sbt-1-ModelsLinkSharing-9-name", "permission": 0}}, {"id": "ModelsLinkSharing_10", "bindings": {"ModelsProject": "ModelsProject_10"}, "body": {"name": "sbt-1-ModelsLinkSharing-10-name", "permission": 0}}].forEach(registerCreationModelsLinkSharing);

function registerNativeLogin(sessionId){bthread("native login "+sessionId,function(){while(true){loginSession(sessionId);request(bp.Event("SessionReady",{session:sessionId}));waitFor(bp.Event("SessionsInvalidated",{}));}});}
["A","B"].forEach(registerNativeLogin);

bthread("native session readiness and restart gate",function(){
 var ready={},pending=false,windowCase=null;
 while(true){var e=sync({waitFor:bp.all,block:bp.EventSet("requires ready session",function(event){
  var m=event.data&&event.data.model;if(!m)return false;if(m.action==="authenticate")return false;
  if(pending)return true;if(windowCase)return !(ready.A&&ready.B&&m.caseId===windowCase&&(m.action==="negative_attempt"||m.action==="negative_readback"));return !ready[m.session||((m.caseId&&/^NEG_[AB]_/.test(m.caseId))?m.caseId.split("_")[1]:"A")];
 })});var d=e.data||{};
 if(e.name==="SessionsInvalidated"){ready={};pending=false;}
 if(e.name==="SessionReady")ready[d.session]=true;
 if(d.model&&d.model.action==="checkpoint"){windowCase=d.model.caseId;pending=true;}
 if(d.model&&d.model.action==="negative_attempt")pending=true;
 if(d.model&&d.model.action==="negative_readback"&&d.model.caseId===windowCase)windowCase=null;
 }
});
bthread("per-operation shared resource windows",function(){
 var locks={},positive={},negative={};
 while(true){var e=sync({waitFor:bp.all,block:bp.EventSet("operation conflicts",function(event){
  var d=event.data||{},m=d.model;
  if(event.name==="OperationAcquire")return !!locks[d.logicalId]||!!positive[d.logicalId]||!!negative[d.logicalId];
  if(event.name==="NegativeAcquire")return !!locks[d.logicalId];
  if(event.name==="ModelWriteBegin")return !!locks[d.logicalId]&&locks[d.logicalId]!==d.session;
  if(!m||["create","update","delete","negative_attempt"].indexOf(m.action)<0)return false;
  var ids=(m.affected||[]).slice();if(m.logicalId)ids.push(m.logicalId);return ids.some(function(id){return !!locks[id]&&locks[id]!==m.session;});
 })});var d=e.data||{};
 if(e.name==="OperationAcquire")locks[d.logicalId]=d.session;
 if(e.name==="OperationRelease"&&locks[d.logicalId]===d.session)delete locks[d.logicalId];
 if(e.name==="ModelWriteBegin")positive[d.logicalId]=d.revision;
 if(e.name==="ModelVerified"&&positive[d.logicalId]===d.revision)delete positive[d.logicalId];
 if(e.name==="NegativeAcquire")negative[d.logicalId]=d.caseId;
 if(e.name==="NegativeRelease"&&negative[d.logicalId]===d.caseId)delete negative[d.logicalId];
 }
});
