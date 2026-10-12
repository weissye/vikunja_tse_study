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
ctx.bthread("verifyModelsProjectViewAfterEveryWrite", "Verification.Pending", function(resource) {
    if(resource.resourceType!=="ModelsProjectView") return;
    verifyModelsProjectView(resource);
    request(bp.Event("ModelVerified",{logicalId:resource.id,revision:resource.revision}));
});

// Instance ModelsProjectView_1: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsProjectView_1", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_1"});
    createModelsProjectView("ModelsProjectView_1",{"title":"sbt-1-ModelsProjectView-1-title","view_kind":"list"},parents);
    waitFor(matchesVerified("ModelsProjectView_1",1));
    updateModelsProjectView(getModelEntity("ModelsProjectView_1"),{"title":"sbt-1-ModelsProjectView_1-updated"});
    waitFor(matchesVerified("ModelsProjectView_1",2));
});

// Instance ModelsProjectView_2: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsProjectView_2", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_2"});
    createModelsProjectView("ModelsProjectView_2",{"title":"sbt-1-ModelsProjectView-2-title","view_kind":"list"},parents);
    waitFor(matchesVerified("ModelsProjectView_2",1));
    updateModelsProjectView(getModelEntity("ModelsProjectView_2"),{"title":"sbt-1-ModelsProjectView_2-updated"});
    waitFor(matchesVerified("ModelsProjectView_2",2));
});

// Instance ModelsProjectView_3: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsProjectView_3", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_3"});
    createModelsProjectView("ModelsProjectView_3",{"title":"sbt-1-ModelsProjectView-3-title","view_kind":"list"},parents);
    waitFor(matchesVerified("ModelsProjectView_3",1));
    updateModelsProjectView(getModelEntity("ModelsProjectView_3"),{"title":"sbt-1-ModelsProjectView_3-updated"});
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
    createModelsLinkSharing("ModelsLinkSharing_1",{"name":"sbt-1-ModelsLinkSharing-1-name","permission":0},parents);
    waitFor(matchesVerified("ModelsLinkSharing_1",1));
});

// Instance ModelsLinkSharing_2: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsLinkSharing_2", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_2"});
    createModelsLinkSharing("ModelsLinkSharing_2",{"name":"sbt-1-ModelsLinkSharing-2-name","permission":0},parents);
    waitFor(matchesVerified("ModelsLinkSharing_2",1));
});

// Instance ModelsLinkSharing_3: creation, independent readback, update, independent readback.
bthread("lifecycle ModelsLinkSharing_3", function() {
    var parents=waitForDependencies(["ModelsProject"],{"ModelsProject":"ModelsProject_3"});
    createModelsLinkSharing("ModelsLinkSharing_3",{"name":"sbt-1-ModelsLinkSharing-3-name","permission":0},parents);
    waitFor(matchesVerified("ModelsLinkSharing_3",1));
});
bthread("initialize negative Context rules",function(){request(bp.Event("NegativeCatalogReady",{rules:[{"id":"ModelsTask/title/TYPE_ARRAY","resource":"ModelsTask","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsTask/title/MIN_LENGTH","resource":"ModelsTask","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Task/properties/title/minLength","schema_pointer":"#/components/schemas/models.Task/properties/title/minLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/TYPE_ARRAY","resource":"ModelsLabel","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsLabel/title/MIN_LENGTH","resource":"ModelsLabel","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Label/properties/title/minLength","schema_pointer":"#/components/schemas/models.Label/properties/title/minLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/TYPE_ARRAY","resource":"ModelsTeam","field":"name","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},{"id":"ModelsTeam/name/MIN_LENGTH","resource":"ModelsTeam","field":"name","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Team/properties/name/minLength","schema_pointer":"#/components/schemas/models.Team/properties/name/minLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]}]}));});
ctx.bthread("negative verifier ModelsTask","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsTask")return;verifyNegativeModelsTask(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});
bthread("negative NEG_ModelsTask_1_0",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_0"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/title/TYPE_ARRAY","resource":"ModelsTask","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_0"}));
});
bthread("negative NEG_ModelsTask_1_1",function(){
    waitForResource("ModelsTask_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_1"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_1"),{"id":"ModelsTask/title/MIN_LENGTH","resource":"ModelsTask","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Task/properties/title/minLength","schema_pointer":"#/components/schemas/models.Task/properties/title/minLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_1_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_1",caseId:"NEG_ModelsTask_1_1"}));
});
bthread("negative NEG_ModelsTask_2_0",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_0"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/title/TYPE_ARRAY","resource":"ModelsTask","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_0"}));
});
bthread("negative NEG_ModelsTask_2_1",function(){
    waitForResource("ModelsTask_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_1"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_2"),{"id":"ModelsTask/title/MIN_LENGTH","resource":"ModelsTask","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Task/properties/title/minLength","schema_pointer":"#/components/schemas/models.Task/properties/title/minLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_2_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_2",caseId:"NEG_ModelsTask_2_1"}));
});
bthread("negative NEG_ModelsTask_3_0",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_0"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/title/TYPE_ARRAY","resource":"ModelsTask","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Task/properties/title/type","schema_pointer":"#/components/schemas/models.Task/properties/title/type","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_0"}));
});
bthread("negative NEG_ModelsTask_3_1",function(){
    waitForResource("ModelsTask_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_1"}));
    attemptNegativeModelsTask(getModelEntity("ModelsTask_3"),{"id":"ModelsTask/title/MIN_LENGTH","resource":"ModelsTask","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Task/properties/title/minLength","schema_pointer":"#/components/schemas/models.Task/properties/title/minLength","operation":"POST /tasks/{id}","effective_operation":"POST /tasks/{id}","documented_statuses":["200","400","403","500"],"compound_constraints":[]},"NEG_ModelsTask_3_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTask_3",caseId:"NEG_ModelsTask_3_1"}));
});
ctx.bthread("negative verifier ModelsLabel","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsLabel")return;verifyNegativeModelsLabel(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});
bthread("negative NEG_ModelsLabel_1_0",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_0"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/title/TYPE_ARRAY","resource":"ModelsLabel","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_0"}));
});
bthread("negative NEG_ModelsLabel_1_1",function(){
    waitForResource("ModelsLabel_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_1"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_1"),{"id":"ModelsLabel/title/MIN_LENGTH","resource":"ModelsLabel","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Label/properties/title/minLength","schema_pointer":"#/components/schemas/models.Label/properties/title/minLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_1_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_1",caseId:"NEG_ModelsLabel_1_1"}));
});
bthread("negative NEG_ModelsLabel_2_0",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_0"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/title/TYPE_ARRAY","resource":"ModelsLabel","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_0"}));
});
bthread("negative NEG_ModelsLabel_2_1",function(){
    waitForResource("ModelsLabel_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_1"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_2"),{"id":"ModelsLabel/title/MIN_LENGTH","resource":"ModelsLabel","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Label/properties/title/minLength","schema_pointer":"#/components/schemas/models.Label/properties/title/minLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_2_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_2",caseId:"NEG_ModelsLabel_2_1"}));
});
bthread("negative NEG_ModelsLabel_3_0",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_0"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/title/TYPE_ARRAY","resource":"ModelsLabel","field":"title","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Label/properties/title/type","schema_pointer":"#/components/schemas/models.Label/properties/title/type","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_0"}));
});
bthread("negative NEG_ModelsLabel_3_1",function(){
    waitForResource("ModelsLabel_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_1"}));
    attemptNegativeModelsLabel(getModelEntity("ModelsLabel_3"),{"id":"ModelsLabel/title/MIN_LENGTH","resource":"ModelsLabel","field":"title","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Label/properties/title/minLength","schema_pointer":"#/components/schemas/models.Label/properties/title/minLength","operation":"PUT /labels/{id}","effective_operation":"POST /labels/{id}","documented_statuses":["200","400","403","404","500"],"compound_constraints":[]},"NEG_ModelsLabel_3_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsLabel_3",caseId:"NEG_ModelsLabel_3_1"}));
});
ctx.bthread("negative verifier ModelsTeam","Negative.Pending",function(pending){if(pending.resourceType!=="ModelsTeam")return;verifyNegativeModelsTeam(pending);request(bp.Event("NegativeVerified",{caseId:pending.caseId}));});
bthread("negative NEG_ModelsTeam_1_0",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_0"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/name/TYPE_ARRAY","resource":"ModelsTeam","field":"name","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_0"}));
});
bthread("negative NEG_ModelsTeam_1_1",function(){
    waitForResource("ModelsTeam_1",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_1"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_1"),{"id":"ModelsTeam/name/MIN_LENGTH","resource":"ModelsTeam","field":"name","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Team/properties/name/minLength","schema_pointer":"#/components/schemas/models.Team/properties/name/minLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_1_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_1",caseId:"NEG_ModelsTeam_1_1"}));
});
bthread("negative NEG_ModelsTeam_2_0",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_0"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/name/TYPE_ARRAY","resource":"ModelsTeam","field":"name","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_0"}));
});
bthread("negative NEG_ModelsTeam_2_1",function(){
    waitForResource("ModelsTeam_2",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_1"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_2"),{"id":"ModelsTeam/name/MIN_LENGTH","resource":"ModelsTeam","field":"name","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Team/properties/name/minLength","schema_pointer":"#/components/schemas/models.Team/properties/name/minLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_2_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_2",caseId:"NEG_ModelsTeam_2_1"}));
});
bthread("negative NEG_ModelsTeam_3_0",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_0"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/name/TYPE_ARRAY","resource":"ModelsTeam","field":"name","kind":"TYPE_ARRAY","mutation":"replace","invalid_value":[],"constraint":"type","declared_constraint":"string","source_pointer":"#/definitions/models.Team/properties/name/type","schema_pointer":"#/components/schemas/models.Team/properties/name/type","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_0");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_0"}));
});
bthread("negative NEG_ModelsTeam_3_1",function(){
    waitForResource("ModelsTeam_3",1);
    request(bp.Event("NegativeAcquire",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_1"}));
    attemptNegativeModelsTeam(getModelEntity("ModelsTeam_3"),{"id":"ModelsTeam/name/MIN_LENGTH","resource":"ModelsTeam","field":"name","kind":"MIN_LENGTH","mutation":"replace","invalid_value":"","constraint":"minLength","declared_constraint":1,"source_pointer":"#/definitions/models.Team/properties/name/minLength","schema_pointer":"#/components/schemas/models.Team/properties/name/minLength","operation":"POST /teams/{id}","effective_operation":"POST /teams/{id}","documented_statuses":["200","400","500"],"compound_constraints":[]},"NEG_ModelsTeam_3_1");
    request(bp.Event("NegativeRelease",{logicalId:"ModelsTeam_3",caseId:"NEG_ModelsTeam_3_1"}));
});
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
