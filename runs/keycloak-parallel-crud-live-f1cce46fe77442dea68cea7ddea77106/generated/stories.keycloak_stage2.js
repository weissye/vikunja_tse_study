// Auto-generated parallel CRUD stories for keycloak_stage2; each process is logical.

// @provengo summon rest

// @provengo summon rtv

const SBT_POOL = {};

const SBT_FINISHED = {};

bthread("parallel-crud:state", function() {

  while (true) {

    let e = sync({waitFor: EventSet("parallel CRUD state", function(x) {

      return x.name === "SBT:InstanceReady" || x.name === "SBT:WorkerFinished";

    })});

    let k = e.data.process + ":" + e.data.entity;

    if (e.name === "SBT:InstanceReady") {

      if (!SBT_POOL[k]) SBT_POOL[k] = [];

      SBT_POOL[k].push({owner:e.data.owner, values:e.data.values});

    } else {

      if (!SBT_FINISHED[k]) SBT_FINISHED[k] = {};

      SBT_FINISHED[k][e.data.owner] = true;

      if (SBT_POOL[k]) SBT_POOL[k] = SBT_POOL[k].filter(function(x) { return x.owner !== e.data.owner; });

    }

  }

});

bthread("verify:P1:admin/realms:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getRealmRepresentation(step.data.values["accessCodeLifespan"], step.data.values["accessCodeLifespanLogin"], step.data.values["accessCodeLifespanUserAction"], step.data.values["accessTokenLifespan"], step.data.values["accessTokenLifespanForImplicitFlow"], step.data.values["accountTheme"], step.data.values["actionTokenGeneratedByAdminLifespan"], step.data.values["actionTokenGeneratedByUserLifespan"], step.data.values["adminEventsDetailsEnabled"], step.data.values["adminEventsEnabled"], step.data.values["adminPermissionsClient"], step.data.values["adminPermissionsEnabled"], step.data.values["adminTheme"], step.data.values["applicationScopeMappings"], step.data.values["applications"], step.data.values["attributes"], step.data.values["authenticationFlows"], step.data.values["authenticatorConfig"], step.data.values["briefRepresentation"], step.data.values["browserFlow"], step.data.values["browserSecurityHeaders"], step.data.values["bruteForceProtected"], step.data.values["bruteForceStrategy"], step.data.values["certificate"], step.data.values["clientAuthenticationFlow"], step.data.values["clientOfflineSessionIdleTimeout"], step.data.values["clientOfflineSessionMaxLifespan"], step.data.values["clientPolicies"], step.data.values["clientProfiles"], step.data.values["clientScopeMappings"], step.data.values["clientScopes"], step.data.values["clientSessionIdleTimeout"], step.data.values["clientSessionMaxLifespan"], step.data.values["clientTemplates"], step.data.values["clients"], step.data.values["codeSecret"], step.data.values["components"], step.data.values["defaultDefaultClientScopes"], step.data.values["defaultGroups"], step.data.values["defaultLocale"], step.data.values["defaultOptionalClientScopes"], step.data.values["defaultRole"], step.data.values["defaultRoles"], step.data.values["defaultSignatureAlgorithm"], step.data.values["directGrantFlow"], step.data.values["displayName"], step.data.values["displayNameHtml"], step.data.values["dockerAuthenticationFlow"], step.data.values["duplicateEmailsAllowed"], step.data.values["editUsernameAllowed"], step.data.values["emailTheme"], step.data.values["enabled"], step.data.values["enabledEventTypes"], step.data.values["eventsEnabled"], step.data.values["eventsExpiration"], step.data.values["eventsListeners"], step.data.values["failureFactor"], step.data.values["federatedUsers"], step.data.values["firstBrokerLoginFlow"], step.data.values["groups"], step.data.values["id"], step.data.values["identityProviderMappers"], step.data.values["identityProviders"], step.data.values["internationalizationEnabled"], step.data.values["keycloakVersion"], step.data.values["localizationTexts"], step.data.values["loginTheme"], step.data.values["loginWithEmailAllowed"], step.data.values["maxDeltaTimeSeconds"], step.data.values["maxFailureWaitSeconds"], step.data.values["maxSecondaryAuthFailures"], step.data.values["maxTemporaryLockouts"], step.data.values["minimumQuickLoginWaitSeconds"], step.data.values["notBefore"], step.data.values["oauth2DeviceCodeLifespan"], step.data.values["oauth2DevicePollingInterval"], step.data.values["oauthClients"], step.data.values["offlineSessionIdleTimeout"], step.data.values["offlineSessionMaxLifespan"], step.data.values["offlineSessionMaxLifespanEnabled"], step.data.values["organizations"], step.data.values["organizationsEnabled"], step.data.values["otpPolicyAlgorithm"], step.data.values["otpPolicyCodeReusable"], step.data.values["otpPolicyDigits"], step.data.values["otpPolicyInitialCounter"], step.data.values["otpPolicyLookAheadWindow"], step.data.values["otpPolicyPeriod"], step.data.values["otpPolicyType"], step.data.values["otpSupportedApplications"], step.data.values["passwordCredentialGrantAllowed"], step.data.values["passwordPolicy"], step.data.values["permanentLockout"], step.data.values["privateKey"], step.data.values["protocolMappers"], step.data.values["publicKey"], step.data.values["quickLoginCheckMilliSeconds"], step.data.values["realm"], step.data.values["realmCacheEnabled"], step.data.values["refreshTokenMaxReuse"], step.data.values["registrationAllowed"], step.data.values["registrationEmailAsUsername"], step.data.values["registrationFlow"], step.data.values["rememberMe"], step.data.values["requiredActions"], step.data.values["requiredCredentials"], step.data.values["resetCredentialsFlow"], step.data.values["resetPasswordAllowed"], step.data.values["revokeRefreshToken"], step.data.values["roles"], step.data.values["scimApiEnabled"], step.data.values["scopeMappings"], step.data.values["smtpServer"], step.data.values["social"], step.data.values["socialProviders"], step.data.values["sslRequired"], step.data.values["ssoSessionIdleTimeout"], step.data.values["ssoSessionIdleTimeoutRememberMe"], step.data.values["ssoSessionMaxLifespan"], step.data.values["ssoSessionMaxLifespanRememberMe"], step.data.values["supportedLocales"], step.data.values["updateProfileOnInitialSocialLogin"], step.data.values["userCacheEnabled"], step.data.values["userFederationMappers"], step.data.values["userFederationProviders"], step.data.values["userManagedAccessAllowed"], step.data.values["users"], step.data.values["verifiableCredentialsEnabled"], step.data.values["verifyEmail"], step.data.values["waitIncrementSeconds"], step.data.values["webAuthnPolicyAcceptableAaguids"], step.data.values["webAuthnPolicyAttestationConveyancePreference"], step.data.values["webAuthnPolicyAuthenticatorAttachment"], step.data.values["webAuthnPolicyAvoidSameAuthenticatorRegister"], step.data.values["webAuthnPolicyCreateTimeout"], step.data.values["webAuthnPolicyExtraOrigins"], step.data.values["webAuthnPolicyPasswordlessAcceptableAaguids"], step.data.values["webAuthnPolicyPasswordlessAttestationConveyancePreference"], step.data.values["webAuthnPolicyPasswordlessAuthenticatorAttachment"], step.data.values["webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister"], step.data.values["webAuthnPolicyPasswordlessCreateTimeout"], step.data.values["webAuthnPolicyPasswordlessExtraOrigins"], step.data.values["webAuthnPolicyPasswordlessMediation"], step.data.values["webAuthnPolicyPasswordlessPasskeysEnabled"], step.data.values["webAuthnPolicyPasswordlessRequireResidentKey"], step.data.values["webAuthnPolicyPasswordlessResidentKey"], step.data.values["webAuthnPolicyPasswordlessRpEntityName"], step.data.values["webAuthnPolicyPasswordlessRpId"], step.data.values["webAuthnPolicyPasswordlessSignatureAlgorithms"], step.data.values["webAuthnPolicyPasswordlessUserVerificationRequirement"], step.data.values["webAuthnPolicyRequireResidentKey"], step.data.values["webAuthnPolicyResidentKey"], step.data.values["webAuthnPolicyRpEntityName"], step.data.values["webAuthnPolicyRpId"], step.data.values["webAuthnPolicySignatureAlgorithms"], step.data.values["webAuthnPolicyUserVerificationRequirement"], "P1:admin/realms:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms",owner:"P1:admin/realms:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms:1",process:1,entity:"admin/realms",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  __args.realm = "realm_64256";

  let created = createRealmRepresentation(__args["accessCodeLifespan"], __args["accessCodeLifespanLogin"], __args["accessCodeLifespanUserAction"], __args["accessTokenLifespan"], __args["accessTokenLifespanForImplicitFlow"], __args["accountTheme"], __args["actionTokenGeneratedByAdminLifespan"], __args["actionTokenGeneratedByUserLifespan"], __args["adminEventsDetailsEnabled"], __args["adminEventsEnabled"], __args["adminPermissionsClient"], __args["adminPermissionsEnabled"], __args["adminTheme"], __args["applicationScopeMappings"], __args["applications"], __args["attributes"], __args["authenticationFlows"], __args["authenticatorConfig"], __args["briefRepresentation"], __args["browserFlow"], __args["browserSecurityHeaders"], __args["bruteForceProtected"], __args["bruteForceStrategy"], __args["certificate"], __args["clientAuthenticationFlow"], __args["clientOfflineSessionIdleTimeout"], __args["clientOfflineSessionMaxLifespan"], __args["clientPolicies"], __args["clientProfiles"], __args["clientScopeMappings"], __args["clientScopes"], __args["clientSessionIdleTimeout"], __args["clientSessionMaxLifespan"], __args["clientTemplates"], __args["clients"], __args["codeSecret"], __args["components"], __args["defaultDefaultClientScopes"], __args["defaultGroups"], __args["defaultLocale"], __args["defaultOptionalClientScopes"], __args["defaultRole"], __args["defaultRoles"], __args["defaultSignatureAlgorithm"], __args["directGrantFlow"], __args["displayName"], __args["displayNameHtml"], __args["dockerAuthenticationFlow"], __args["duplicateEmailsAllowed"], __args["editUsernameAllowed"], __args["emailTheme"], __args["enabled"], __args["enabledEventTypes"], __args["eventsEnabled"], __args["eventsExpiration"], __args["eventsListeners"], __args["failureFactor"], __args["federatedUsers"], __args["firstBrokerLoginFlow"], __args["groups"], __args["id"], __args["identityProviderMappers"], __args["identityProviders"], __args["internationalizationEnabled"], __args["keycloakVersion"], __args["localizationTexts"], __args["loginTheme"], __args["loginWithEmailAllowed"], __args["maxDeltaTimeSeconds"], __args["maxFailureWaitSeconds"], __args["maxSecondaryAuthFailures"], __args["maxTemporaryLockouts"], __args["minimumQuickLoginWaitSeconds"], __args["notBefore"], __args["oauth2DeviceCodeLifespan"], __args["oauth2DevicePollingInterval"], __args["oauthClients"], __args["offlineSessionIdleTimeout"], __args["offlineSessionMaxLifespan"], __args["offlineSessionMaxLifespanEnabled"], __args["organizations"], __args["organizationsEnabled"], __args["otpPolicyAlgorithm"], __args["otpPolicyCodeReusable"], __args["otpPolicyDigits"], __args["otpPolicyInitialCounter"], __args["otpPolicyLookAheadWindow"], __args["otpPolicyPeriod"], __args["otpPolicyType"], __args["otpSupportedApplications"], __args["passwordCredentialGrantAllowed"], __args["passwordPolicy"], __args["permanentLockout"], __args["privateKey"], __args["protocolMappers"], __args["publicKey"], __args["quickLoginCheckMilliSeconds"], __args["realm"], __args["realmCacheEnabled"], __args["refreshTokenMaxReuse"], __args["registrationAllowed"], __args["registrationEmailAsUsername"], __args["registrationFlow"], __args["rememberMe"], __args["requiredActions"], __args["requiredCredentials"], __args["resetCredentialsFlow"], __args["resetPasswordAllowed"], __args["revokeRefreshToken"], __args["roles"], __args["scimApiEnabled"], __args["scopeMappings"], __args["smtpServer"], __args["social"], __args["socialProviders"], __args["sslRequired"], __args["ssoSessionIdleTimeout"], __args["ssoSessionIdleTimeoutRememberMe"], __args["ssoSessionMaxLifespan"], __args["ssoSessionMaxLifespanRememberMe"], __args["supportedLocales"], __args["updateProfileOnInitialSocialLogin"], __args["userCacheEnabled"], __args["userFederationMappers"], __args["userFederationProviders"], __args["userManagedAccessAllowed"], __args["users"], __args["verifiableCredentialsEnabled"], __args["verifyEmail"], __args["waitIncrementSeconds"], __args["webAuthnPolicyAcceptableAaguids"], __args["webAuthnPolicyAttestationConveyancePreference"], __args["webAuthnPolicyAuthenticatorAttachment"], __args["webAuthnPolicyAvoidSameAuthenticatorRegister"], __args["webAuthnPolicyCreateTimeout"], __args["webAuthnPolicyExtraOrigins"], __args["webAuthnPolicyPasswordlessAcceptableAaguids"], __args["webAuthnPolicyPasswordlessAttestationConveyancePreference"], __args["webAuthnPolicyPasswordlessAuthenticatorAttachment"], __args["webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister"], __args["webAuthnPolicyPasswordlessCreateTimeout"], __args["webAuthnPolicyPasswordlessExtraOrigins"], __args["webAuthnPolicyPasswordlessMediation"], __args["webAuthnPolicyPasswordlessPasskeysEnabled"], __args["webAuthnPolicyPasswordlessRequireResidentKey"], __args["webAuthnPolicyPasswordlessResidentKey"], __args["webAuthnPolicyPasswordlessRpEntityName"], __args["webAuthnPolicyPasswordlessRpId"], __args["webAuthnPolicyPasswordlessSignatureAlgorithms"], __args["webAuthnPolicyPasswordlessUserVerificationRequirement"], __args["webAuthnPolicyRequireResidentKey"], __args["webAuthnPolicyResidentKey"], __args["webAuthnPolicyRpEntityName"], __args["webAuthnPolicyRpId"], __args["webAuthnPolicySignatureAlgorithms"], __args["webAuthnPolicyUserVerificationRequirement"], "P1:admin/realms:1" + ":create", {realm: __args.realm, enabled: true});

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  let bound = getRealmRepresentation(__args["accessCodeLifespan"], __args["accessCodeLifespanLogin"], __args["accessCodeLifespanUserAction"], __args["accessTokenLifespan"], __args["accessTokenLifespanForImplicitFlow"], __args["accountTheme"], __args["actionTokenGeneratedByAdminLifespan"], __args["actionTokenGeneratedByUserLifespan"], __args["adminEventsDetailsEnabled"], __args["adminEventsEnabled"], __args["adminPermissionsClient"], __args["adminPermissionsEnabled"], __args["adminTheme"], __args["applicationScopeMappings"], __args["applications"], __args["attributes"], __args["authenticationFlows"], __args["authenticatorConfig"], __args["briefRepresentation"], __args["browserFlow"], __args["browserSecurityHeaders"], __args["bruteForceProtected"], __args["bruteForceStrategy"], __args["certificate"], __args["clientAuthenticationFlow"], __args["clientOfflineSessionIdleTimeout"], __args["clientOfflineSessionMaxLifespan"], __args["clientPolicies"], __args["clientProfiles"], __args["clientScopeMappings"], __args["clientScopes"], __args["clientSessionIdleTimeout"], __args["clientSessionMaxLifespan"], __args["clientTemplates"], __args["clients"], __args["codeSecret"], __args["components"], __args["defaultDefaultClientScopes"], __args["defaultGroups"], __args["defaultLocale"], __args["defaultOptionalClientScopes"], __args["defaultRole"], __args["defaultRoles"], __args["defaultSignatureAlgorithm"], __args["directGrantFlow"], __args["displayName"], __args["displayNameHtml"], __args["dockerAuthenticationFlow"], __args["duplicateEmailsAllowed"], __args["editUsernameAllowed"], __args["emailTheme"], __args["enabled"], __args["enabledEventTypes"], __args["eventsEnabled"], __args["eventsExpiration"], __args["eventsListeners"], __args["failureFactor"], __args["federatedUsers"], __args["firstBrokerLoginFlow"], __args["groups"], __args["id"], __args["identityProviderMappers"], __args["identityProviders"], __args["internationalizationEnabled"], __args["keycloakVersion"], __args["localizationTexts"], __args["loginTheme"], __args["loginWithEmailAllowed"], __args["maxDeltaTimeSeconds"], __args["maxFailureWaitSeconds"], __args["maxSecondaryAuthFailures"], __args["maxTemporaryLockouts"], __args["minimumQuickLoginWaitSeconds"], __args["notBefore"], __args["oauth2DeviceCodeLifespan"], __args["oauth2DevicePollingInterval"], __args["oauthClients"], __args["offlineSessionIdleTimeout"], __args["offlineSessionMaxLifespan"], __args["offlineSessionMaxLifespanEnabled"], __args["organizations"], __args["organizationsEnabled"], __args["otpPolicyAlgorithm"], __args["otpPolicyCodeReusable"], __args["otpPolicyDigits"], __args["otpPolicyInitialCounter"], __args["otpPolicyLookAheadWindow"], __args["otpPolicyPeriod"], __args["otpPolicyType"], __args["otpSupportedApplications"], __args["passwordCredentialGrantAllowed"], __args["passwordPolicy"], __args["permanentLockout"], __args["privateKey"], __args["protocolMappers"], __args["publicKey"], __args["quickLoginCheckMilliSeconds"], __args["realm"], __args["realmCacheEnabled"], __args["refreshTokenMaxReuse"], __args["registrationAllowed"], __args["registrationEmailAsUsername"], __args["registrationFlow"], __args["rememberMe"], __args["requiredActions"], __args["requiredCredentials"], __args["resetCredentialsFlow"], __args["resetPasswordAllowed"], __args["revokeRefreshToken"], __args["roles"], __args["scimApiEnabled"], __args["scopeMappings"], __args["smtpServer"], __args["social"], __args["socialProviders"], __args["sslRequired"], __args["ssoSessionIdleTimeout"], __args["ssoSessionIdleTimeoutRememberMe"], __args["ssoSessionMaxLifespan"], __args["ssoSessionMaxLifespanRememberMe"], __args["supportedLocales"], __args["updateProfileOnInitialSocialLogin"], __args["userCacheEnabled"], __args["userFederationMappers"], __args["userFederationProviders"], __args["userManagedAccessAllowed"], __args["users"], __args["verifiableCredentialsEnabled"], __args["verifyEmail"], __args["waitIncrementSeconds"], __args["webAuthnPolicyAcceptableAaguids"], __args["webAuthnPolicyAttestationConveyancePreference"], __args["webAuthnPolicyAuthenticatorAttachment"], __args["webAuthnPolicyAvoidSameAuthenticatorRegister"], __args["webAuthnPolicyCreateTimeout"], __args["webAuthnPolicyExtraOrigins"], __args["webAuthnPolicyPasswordlessAcceptableAaguids"], __args["webAuthnPolicyPasswordlessAttestationConveyancePreference"], __args["webAuthnPolicyPasswordlessAuthenticatorAttachment"], __args["webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister"], __args["webAuthnPolicyPasswordlessCreateTimeout"], __args["webAuthnPolicyPasswordlessExtraOrigins"], __args["webAuthnPolicyPasswordlessMediation"], __args["webAuthnPolicyPasswordlessPasskeysEnabled"], __args["webAuthnPolicyPasswordlessRequireResidentKey"], __args["webAuthnPolicyPasswordlessResidentKey"], __args["webAuthnPolicyPasswordlessRpEntityName"], __args["webAuthnPolicyPasswordlessRpId"], __args["webAuthnPolicyPasswordlessSignatureAlgorithms"], __args["webAuthnPolicyPasswordlessUserVerificationRequirement"], __args["webAuthnPolicyRequireResidentKey"], __args["webAuthnPolicyResidentKey"], __args["webAuthnPolicyRpEntityName"], __args["webAuthnPolicyRpId"], __args["webAuthnPolicySignatureAlgorithms"], __args["webAuthnPolicyUserVerificationRequirement"], "P1:admin/realms:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms:1:realm", __args["realm"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms",owner:"P1:admin/realms:1",values:Object.assign({},__args)})});

  let read = getRealmRepresentation(__args["accessCodeLifespan"], __args["accessCodeLifespanLogin"], __args["accessCodeLifespanUserAction"], __args["accessTokenLifespan"], __args["accessTokenLifespanForImplicitFlow"], __args["accountTheme"], __args["actionTokenGeneratedByAdminLifespan"], __args["actionTokenGeneratedByUserLifespan"], __args["adminEventsDetailsEnabled"], __args["adminEventsEnabled"], __args["adminPermissionsClient"], __args["adminPermissionsEnabled"], __args["adminTheme"], __args["applicationScopeMappings"], __args["applications"], __args["attributes"], __args["authenticationFlows"], __args["authenticatorConfig"], __args["briefRepresentation"], __args["browserFlow"], __args["browserSecurityHeaders"], __args["bruteForceProtected"], __args["bruteForceStrategy"], __args["certificate"], __args["clientAuthenticationFlow"], __args["clientOfflineSessionIdleTimeout"], __args["clientOfflineSessionMaxLifespan"], __args["clientPolicies"], __args["clientProfiles"], __args["clientScopeMappings"], __args["clientScopes"], __args["clientSessionIdleTimeout"], __args["clientSessionMaxLifespan"], __args["clientTemplates"], __args["clients"], __args["codeSecret"], __args["components"], __args["defaultDefaultClientScopes"], __args["defaultGroups"], __args["defaultLocale"], __args["defaultOptionalClientScopes"], __args["defaultRole"], __args["defaultRoles"], __args["defaultSignatureAlgorithm"], __args["directGrantFlow"], __args["displayName"], __args["displayNameHtml"], __args["dockerAuthenticationFlow"], __args["duplicateEmailsAllowed"], __args["editUsernameAllowed"], __args["emailTheme"], __args["enabled"], __args["enabledEventTypes"], __args["eventsEnabled"], __args["eventsExpiration"], __args["eventsListeners"], __args["failureFactor"], __args["federatedUsers"], __args["firstBrokerLoginFlow"], __args["groups"], __args["id"], __args["identityProviderMappers"], __args["identityProviders"], __args["internationalizationEnabled"], __args["keycloakVersion"], __args["localizationTexts"], __args["loginTheme"], __args["loginWithEmailAllowed"], __args["maxDeltaTimeSeconds"], __args["maxFailureWaitSeconds"], __args["maxSecondaryAuthFailures"], __args["maxTemporaryLockouts"], __args["minimumQuickLoginWaitSeconds"], __args["notBefore"], __args["oauth2DeviceCodeLifespan"], __args["oauth2DevicePollingInterval"], __args["oauthClients"], __args["offlineSessionIdleTimeout"], __args["offlineSessionMaxLifespan"], __args["offlineSessionMaxLifespanEnabled"], __args["organizations"], __args["organizationsEnabled"], __args["otpPolicyAlgorithm"], __args["otpPolicyCodeReusable"], __args["otpPolicyDigits"], __args["otpPolicyInitialCounter"], __args["otpPolicyLookAheadWindow"], __args["otpPolicyPeriod"], __args["otpPolicyType"], __args["otpSupportedApplications"], __args["passwordCredentialGrantAllowed"], __args["passwordPolicy"], __args["permanentLockout"], __args["privateKey"], __args["protocolMappers"], __args["publicKey"], __args["quickLoginCheckMilliSeconds"], __args["realm"], __args["realmCacheEnabled"], __args["refreshTokenMaxReuse"], __args["registrationAllowed"], __args["registrationEmailAsUsername"], __args["registrationFlow"], __args["rememberMe"], __args["requiredActions"], __args["requiredCredentials"], __args["resetCredentialsFlow"], __args["resetPasswordAllowed"], __args["revokeRefreshToken"], __args["roles"], __args["scimApiEnabled"], __args["scopeMappings"], __args["smtpServer"], __args["social"], __args["socialProviders"], __args["sslRequired"], __args["ssoSessionIdleTimeout"], __args["ssoSessionIdleTimeoutRememberMe"], __args["ssoSessionMaxLifespan"], __args["ssoSessionMaxLifespanRememberMe"], __args["supportedLocales"], __args["updateProfileOnInitialSocialLogin"], __args["userCacheEnabled"], __args["userFederationMappers"], __args["userFederationProviders"], __args["userManagedAccessAllowed"], __args["users"], __args["verifiableCredentialsEnabled"], __args["verifyEmail"], __args["waitIncrementSeconds"], __args["webAuthnPolicyAcceptableAaguids"], __args["webAuthnPolicyAttestationConveyancePreference"], __args["webAuthnPolicyAuthenticatorAttachment"], __args["webAuthnPolicyAvoidSameAuthenticatorRegister"], __args["webAuthnPolicyCreateTimeout"], __args["webAuthnPolicyExtraOrigins"], __args["webAuthnPolicyPasswordlessAcceptableAaguids"], __args["webAuthnPolicyPasswordlessAttestationConveyancePreference"], __args["webAuthnPolicyPasswordlessAuthenticatorAttachment"], __args["webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister"], __args["webAuthnPolicyPasswordlessCreateTimeout"], __args["webAuthnPolicyPasswordlessExtraOrigins"], __args["webAuthnPolicyPasswordlessMediation"], __args["webAuthnPolicyPasswordlessPasskeysEnabled"], __args["webAuthnPolicyPasswordlessRequireResidentKey"], __args["webAuthnPolicyPasswordlessResidentKey"], __args["webAuthnPolicyPasswordlessRpEntityName"], __args["webAuthnPolicyPasswordlessRpId"], __args["webAuthnPolicyPasswordlessSignatureAlgorithms"], __args["webAuthnPolicyPasswordlessUserVerificationRequirement"], __args["webAuthnPolicyRequireResidentKey"], __args["webAuthnPolicyResidentKey"], __args["webAuthnPolicyRpEntityName"], __args["webAuthnPolicyRpId"], __args["webAuthnPolicySignatureAlgorithms"], __args["webAuthnPolicyUserVerificationRequirement"], "P1:admin/realms:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["accessCodeLifespan"] !== undefined) __args["accessCodeLifespan"] = read.body["accessCodeLifespan"];

    if (read.body["accessCodeLifespanLogin"] !== undefined) __args["accessCodeLifespanLogin"] = read.body["accessCodeLifespanLogin"];

    if (read.body["accessCodeLifespanUserAction"] !== undefined) __args["accessCodeLifespanUserAction"] = read.body["accessCodeLifespanUserAction"];

    if (read.body["accessTokenLifespan"] !== undefined) __args["accessTokenLifespan"] = read.body["accessTokenLifespan"];

    if (read.body["accessTokenLifespanForImplicitFlow"] !== undefined) __args["accessTokenLifespanForImplicitFlow"] = read.body["accessTokenLifespanForImplicitFlow"];

    if (read.body["accountTheme"] !== undefined) __args["accountTheme"] = read.body["accountTheme"];

    if (read.body["actionTokenGeneratedByAdminLifespan"] !== undefined) __args["actionTokenGeneratedByAdminLifespan"] = read.body["actionTokenGeneratedByAdminLifespan"];

    if (read.body["actionTokenGeneratedByUserLifespan"] !== undefined) __args["actionTokenGeneratedByUserLifespan"] = read.body["actionTokenGeneratedByUserLifespan"];

    if (read.body["adminEventsDetailsEnabled"] !== undefined) __args["adminEventsDetailsEnabled"] = read.body["adminEventsDetailsEnabled"];

    if (read.body["adminEventsEnabled"] !== undefined) __args["adminEventsEnabled"] = read.body["adminEventsEnabled"];

    if (read.body["adminPermissionsClient"] !== undefined) __args["adminPermissionsClient"] = read.body["adminPermissionsClient"];

    if (read.body["adminPermissionsEnabled"] !== undefined) __args["adminPermissionsEnabled"] = read.body["adminPermissionsEnabled"];

    if (read.body["adminTheme"] !== undefined) __args["adminTheme"] = read.body["adminTheme"];

    if (read.body["applicationScopeMappings"] !== undefined) __args["applicationScopeMappings"] = read.body["applicationScopeMappings"];

    if (read.body["applications"] !== undefined) __args["applications"] = read.body["applications"];

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["authenticationFlows"] !== undefined) __args["authenticationFlows"] = read.body["authenticationFlows"];

    if (read.body["authenticatorConfig"] !== undefined) __args["authenticatorConfig"] = read.body["authenticatorConfig"];

    if (read.body["browserFlow"] !== undefined) __args["browserFlow"] = read.body["browserFlow"];

    if (read.body["browserSecurityHeaders"] !== undefined) __args["browserSecurityHeaders"] = read.body["browserSecurityHeaders"];

    if (read.body["bruteForceProtected"] !== undefined) __args["bruteForceProtected"] = read.body["bruteForceProtected"];

    if (read.body["bruteForceStrategy"] !== undefined) __args["bruteForceStrategy"] = read.body["bruteForceStrategy"];

    if (read.body["certificate"] !== undefined) __args["certificate"] = read.body["certificate"];

    if (read.body["clientAuthenticationFlow"] !== undefined) __args["clientAuthenticationFlow"] = read.body["clientAuthenticationFlow"];

    if (read.body["clientOfflineSessionIdleTimeout"] !== undefined) __args["clientOfflineSessionIdleTimeout"] = read.body["clientOfflineSessionIdleTimeout"];

    if (read.body["clientOfflineSessionMaxLifespan"] !== undefined) __args["clientOfflineSessionMaxLifespan"] = read.body["clientOfflineSessionMaxLifespan"];

    if (read.body["clientPolicies"] !== undefined) __args["clientPolicies"] = read.body["clientPolicies"];

    if (read.body["clientProfiles"] !== undefined) __args["clientProfiles"] = read.body["clientProfiles"];

    if (read.body["clientScopeMappings"] !== undefined) __args["clientScopeMappings"] = read.body["clientScopeMappings"];

    if (read.body["clientScopes"] !== undefined) __args["clientScopes"] = read.body["clientScopes"];

    if (read.body["clientSessionIdleTimeout"] !== undefined) __args["clientSessionIdleTimeout"] = read.body["clientSessionIdleTimeout"];

    if (read.body["clientSessionMaxLifespan"] !== undefined) __args["clientSessionMaxLifespan"] = read.body["clientSessionMaxLifespan"];

    if (read.body["clientTemplates"] !== undefined) __args["clientTemplates"] = read.body["clientTemplates"];

    if (read.body["clients"] !== undefined) __args["clients"] = read.body["clients"];

    if (read.body["codeSecret"] !== undefined) __args["codeSecret"] = read.body["codeSecret"];

    if (read.body["components"] !== undefined) __args["components"] = read.body["components"];

    if (read.body["defaultDefaultClientScopes"] !== undefined) __args["defaultDefaultClientScopes"] = read.body["defaultDefaultClientScopes"];

    if (read.body["defaultGroups"] !== undefined) __args["defaultGroups"] = read.body["defaultGroups"];

    if (read.body["defaultLocale"] !== undefined) __args["defaultLocale"] = read.body["defaultLocale"];

    if (read.body["defaultOptionalClientScopes"] !== undefined) __args["defaultOptionalClientScopes"] = read.body["defaultOptionalClientScopes"];

    if (read.body["defaultRole"] !== undefined) __args["defaultRole"] = read.body["defaultRole"];

    if (read.body["defaultRoles"] !== undefined) __args["defaultRoles"] = read.body["defaultRoles"];

    if (read.body["defaultSignatureAlgorithm"] !== undefined) __args["defaultSignatureAlgorithm"] = read.body["defaultSignatureAlgorithm"];

    if (read.body["directGrantFlow"] !== undefined) __args["directGrantFlow"] = read.body["directGrantFlow"];

    if (read.body["displayName"] !== undefined) __args["displayName"] = read.body["displayName"];

    if (read.body["displayNameHtml"] !== undefined) __args["displayNameHtml"] = read.body["displayNameHtml"];

    if (read.body["dockerAuthenticationFlow"] !== undefined) __args["dockerAuthenticationFlow"] = read.body["dockerAuthenticationFlow"];

    if (read.body["duplicateEmailsAllowed"] !== undefined) __args["duplicateEmailsAllowed"] = read.body["duplicateEmailsAllowed"];

    if (read.body["editUsernameAllowed"] !== undefined) __args["editUsernameAllowed"] = read.body["editUsernameAllowed"];

    if (read.body["emailTheme"] !== undefined) __args["emailTheme"] = read.body["emailTheme"];

    if (read.body["enabled"] !== undefined) __args["enabled"] = read.body["enabled"];

    if (read.body["enabledEventTypes"] !== undefined) __args["enabledEventTypes"] = read.body["enabledEventTypes"];

    if (read.body["eventsEnabled"] !== undefined) __args["eventsEnabled"] = read.body["eventsEnabled"];

    if (read.body["eventsExpiration"] !== undefined) __args["eventsExpiration"] = read.body["eventsExpiration"];

    if (read.body["eventsListeners"] !== undefined) __args["eventsListeners"] = read.body["eventsListeners"];

    if (read.body["failureFactor"] !== undefined) __args["failureFactor"] = read.body["failureFactor"];

    if (read.body["federatedUsers"] !== undefined) __args["federatedUsers"] = read.body["federatedUsers"];

    if (read.body["firstBrokerLoginFlow"] !== undefined) __args["firstBrokerLoginFlow"] = read.body["firstBrokerLoginFlow"];

    if (read.body["groups"] !== undefined) __args["groups"] = read.body["groups"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["identityProviderMappers"] !== undefined) __args["identityProviderMappers"] = read.body["identityProviderMappers"];

    if (read.body["identityProviders"] !== undefined) __args["identityProviders"] = read.body["identityProviders"];

    if (read.body["internationalizationEnabled"] !== undefined) __args["internationalizationEnabled"] = read.body["internationalizationEnabled"];

    if (read.body["keycloakVersion"] !== undefined) __args["keycloakVersion"] = read.body["keycloakVersion"];

    if (read.body["localizationTexts"] !== undefined) __args["localizationTexts"] = read.body["localizationTexts"];

    if (read.body["loginTheme"] !== undefined) __args["loginTheme"] = read.body["loginTheme"];

    if (read.body["loginWithEmailAllowed"] !== undefined) __args["loginWithEmailAllowed"] = read.body["loginWithEmailAllowed"];

    if (read.body["maxDeltaTimeSeconds"] !== undefined) __args["maxDeltaTimeSeconds"] = read.body["maxDeltaTimeSeconds"];

    if (read.body["maxFailureWaitSeconds"] !== undefined) __args["maxFailureWaitSeconds"] = read.body["maxFailureWaitSeconds"];

    if (read.body["maxSecondaryAuthFailures"] !== undefined) __args["maxSecondaryAuthFailures"] = read.body["maxSecondaryAuthFailures"];

    if (read.body["maxTemporaryLockouts"] !== undefined) __args["maxTemporaryLockouts"] = read.body["maxTemporaryLockouts"];

    if (read.body["minimumQuickLoginWaitSeconds"] !== undefined) __args["minimumQuickLoginWaitSeconds"] = read.body["minimumQuickLoginWaitSeconds"];

    if (read.body["notBefore"] !== undefined) __args["notBefore"] = read.body["notBefore"];

    if (read.body["oauth2DeviceCodeLifespan"] !== undefined) __args["oauth2DeviceCodeLifespan"] = read.body["oauth2DeviceCodeLifespan"];

    if (read.body["oauth2DevicePollingInterval"] !== undefined) __args["oauth2DevicePollingInterval"] = read.body["oauth2DevicePollingInterval"];

    if (read.body["oauthClients"] !== undefined) __args["oauthClients"] = read.body["oauthClients"];

    if (read.body["offlineSessionIdleTimeout"] !== undefined) __args["offlineSessionIdleTimeout"] = read.body["offlineSessionIdleTimeout"];

    if (read.body["offlineSessionMaxLifespan"] !== undefined) __args["offlineSessionMaxLifespan"] = read.body["offlineSessionMaxLifespan"];

    if (read.body["offlineSessionMaxLifespanEnabled"] !== undefined) __args["offlineSessionMaxLifespanEnabled"] = read.body["offlineSessionMaxLifespanEnabled"];

    if (read.body["organizations"] !== undefined) __args["organizations"] = read.body["organizations"];

    if (read.body["organizationsEnabled"] !== undefined) __args["organizationsEnabled"] = read.body["organizationsEnabled"];

    if (read.body["otpPolicyAlgorithm"] !== undefined) __args["otpPolicyAlgorithm"] = read.body["otpPolicyAlgorithm"];

    if (read.body["otpPolicyCodeReusable"] !== undefined) __args["otpPolicyCodeReusable"] = read.body["otpPolicyCodeReusable"];

    if (read.body["otpPolicyDigits"] !== undefined) __args["otpPolicyDigits"] = read.body["otpPolicyDigits"];

    if (read.body["otpPolicyInitialCounter"] !== undefined) __args["otpPolicyInitialCounter"] = read.body["otpPolicyInitialCounter"];

    if (read.body["otpPolicyLookAheadWindow"] !== undefined) __args["otpPolicyLookAheadWindow"] = read.body["otpPolicyLookAheadWindow"];

    if (read.body["otpPolicyPeriod"] !== undefined) __args["otpPolicyPeriod"] = read.body["otpPolicyPeriod"];

    if (read.body["otpPolicyType"] !== undefined) __args["otpPolicyType"] = read.body["otpPolicyType"];

    if (read.body["otpSupportedApplications"] !== undefined) __args["otpSupportedApplications"] = read.body["otpSupportedApplications"];

    if (read.body["passwordCredentialGrantAllowed"] !== undefined) __args["passwordCredentialGrantAllowed"] = read.body["passwordCredentialGrantAllowed"];

    if (read.body["passwordPolicy"] !== undefined) __args["passwordPolicy"] = read.body["passwordPolicy"];

    if (read.body["permanentLockout"] !== undefined) __args["permanentLockout"] = read.body["permanentLockout"];

    if (read.body["privateKey"] !== undefined) __args["privateKey"] = read.body["privateKey"];

    if (read.body["protocolMappers"] !== undefined) __args["protocolMappers"] = read.body["protocolMappers"];

    if (read.body["publicKey"] !== undefined) __args["publicKey"] = read.body["publicKey"];

    if (read.body["quickLoginCheckMilliSeconds"] !== undefined) __args["quickLoginCheckMilliSeconds"] = read.body["quickLoginCheckMilliSeconds"];

    if (read.body["realm"] !== undefined) __args["realm"] = read.body["realm"];

    if (read.body["realmCacheEnabled"] !== undefined) __args["realmCacheEnabled"] = read.body["realmCacheEnabled"];

    if (read.body["refreshTokenMaxReuse"] !== undefined) __args["refreshTokenMaxReuse"] = read.body["refreshTokenMaxReuse"];

    if (read.body["registrationAllowed"] !== undefined) __args["registrationAllowed"] = read.body["registrationAllowed"];

    if (read.body["registrationEmailAsUsername"] !== undefined) __args["registrationEmailAsUsername"] = read.body["registrationEmailAsUsername"];

    if (read.body["registrationFlow"] !== undefined) __args["registrationFlow"] = read.body["registrationFlow"];

    if (read.body["rememberMe"] !== undefined) __args["rememberMe"] = read.body["rememberMe"];

    if (read.body["requiredActions"] !== undefined) __args["requiredActions"] = read.body["requiredActions"];

    if (read.body["requiredCredentials"] !== undefined) __args["requiredCredentials"] = read.body["requiredCredentials"];

    if (read.body["resetCredentialsFlow"] !== undefined) __args["resetCredentialsFlow"] = read.body["resetCredentialsFlow"];

    if (read.body["resetPasswordAllowed"] !== undefined) __args["resetPasswordAllowed"] = read.body["resetPasswordAllowed"];

    if (read.body["revokeRefreshToken"] !== undefined) __args["revokeRefreshToken"] = read.body["revokeRefreshToken"];

    if (read.body["roles"] !== undefined) __args["roles"] = read.body["roles"];

    if (read.body["scimApiEnabled"] !== undefined) __args["scimApiEnabled"] = read.body["scimApiEnabled"];

    if (read.body["scopeMappings"] !== undefined) __args["scopeMappings"] = read.body["scopeMappings"];

    if (read.body["smtpServer"] !== undefined) __args["smtpServer"] = read.body["smtpServer"];

    if (read.body["social"] !== undefined) __args["social"] = read.body["social"];

    if (read.body["socialProviders"] !== undefined) __args["socialProviders"] = read.body["socialProviders"];

    if (read.body["sslRequired"] !== undefined) __args["sslRequired"] = read.body["sslRequired"];

    if (read.body["ssoSessionIdleTimeout"] !== undefined) __args["ssoSessionIdleTimeout"] = read.body["ssoSessionIdleTimeout"];

    if (read.body["ssoSessionIdleTimeoutRememberMe"] !== undefined) __args["ssoSessionIdleTimeoutRememberMe"] = read.body["ssoSessionIdleTimeoutRememberMe"];

    if (read.body["ssoSessionMaxLifespan"] !== undefined) __args["ssoSessionMaxLifespan"] = read.body["ssoSessionMaxLifespan"];

    if (read.body["ssoSessionMaxLifespanRememberMe"] !== undefined) __args["ssoSessionMaxLifespanRememberMe"] = read.body["ssoSessionMaxLifespanRememberMe"];

    if (read.body["supportedLocales"] !== undefined) __args["supportedLocales"] = read.body["supportedLocales"];

    if (read.body["updateProfileOnInitialSocialLogin"] !== undefined) __args["updateProfileOnInitialSocialLogin"] = read.body["updateProfileOnInitialSocialLogin"];

    if (read.body["userCacheEnabled"] !== undefined) __args["userCacheEnabled"] = read.body["userCacheEnabled"];

    if (read.body["userFederationMappers"] !== undefined) __args["userFederationMappers"] = read.body["userFederationMappers"];

    if (read.body["userFederationProviders"] !== undefined) __args["userFederationProviders"] = read.body["userFederationProviders"];

    if (read.body["userManagedAccessAllowed"] !== undefined) __args["userManagedAccessAllowed"] = read.body["userManagedAccessAllowed"];

    if (read.body["users"] !== undefined) __args["users"] = read.body["users"];

    if (read.body["verifiableCredentialsEnabled"] !== undefined) __args["verifiableCredentialsEnabled"] = read.body["verifiableCredentialsEnabled"];

    if (read.body["verifyEmail"] !== undefined) __args["verifyEmail"] = read.body["verifyEmail"];

    if (read.body["waitIncrementSeconds"] !== undefined) __args["waitIncrementSeconds"] = read.body["waitIncrementSeconds"];

    if (read.body["webAuthnPolicyAcceptableAaguids"] !== undefined) __args["webAuthnPolicyAcceptableAaguids"] = read.body["webAuthnPolicyAcceptableAaguids"];

    if (read.body["webAuthnPolicyAttestationConveyancePreference"] !== undefined) __args["webAuthnPolicyAttestationConveyancePreference"] = read.body["webAuthnPolicyAttestationConveyancePreference"];

    if (read.body["webAuthnPolicyAuthenticatorAttachment"] !== undefined) __args["webAuthnPolicyAuthenticatorAttachment"] = read.body["webAuthnPolicyAuthenticatorAttachment"];

    if (read.body["webAuthnPolicyAvoidSameAuthenticatorRegister"] !== undefined) __args["webAuthnPolicyAvoidSameAuthenticatorRegister"] = read.body["webAuthnPolicyAvoidSameAuthenticatorRegister"];

    if (read.body["webAuthnPolicyCreateTimeout"] !== undefined) __args["webAuthnPolicyCreateTimeout"] = read.body["webAuthnPolicyCreateTimeout"];

    if (read.body["webAuthnPolicyExtraOrigins"] !== undefined) __args["webAuthnPolicyExtraOrigins"] = read.body["webAuthnPolicyExtraOrigins"];

    if (read.body["webAuthnPolicyPasswordlessAcceptableAaguids"] !== undefined) __args["webAuthnPolicyPasswordlessAcceptableAaguids"] = read.body["webAuthnPolicyPasswordlessAcceptableAaguids"];

    if (read.body["webAuthnPolicyPasswordlessAttestationConveyancePreference"] !== undefined) __args["webAuthnPolicyPasswordlessAttestationConveyancePreference"] = read.body["webAuthnPolicyPasswordlessAttestationConveyancePreference"];

    if (read.body["webAuthnPolicyPasswordlessAuthenticatorAttachment"] !== undefined) __args["webAuthnPolicyPasswordlessAuthenticatorAttachment"] = read.body["webAuthnPolicyPasswordlessAuthenticatorAttachment"];

    if (read.body["webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister"] !== undefined) __args["webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister"] = read.body["webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister"];

    if (read.body["webAuthnPolicyPasswordlessCreateTimeout"] !== undefined) __args["webAuthnPolicyPasswordlessCreateTimeout"] = read.body["webAuthnPolicyPasswordlessCreateTimeout"];

    if (read.body["webAuthnPolicyPasswordlessExtraOrigins"] !== undefined) __args["webAuthnPolicyPasswordlessExtraOrigins"] = read.body["webAuthnPolicyPasswordlessExtraOrigins"];

    if (read.body["webAuthnPolicyPasswordlessMediation"] !== undefined) __args["webAuthnPolicyPasswordlessMediation"] = read.body["webAuthnPolicyPasswordlessMediation"];

    if (read.body["webAuthnPolicyPasswordlessPasskeysEnabled"] !== undefined) __args["webAuthnPolicyPasswordlessPasskeysEnabled"] = read.body["webAuthnPolicyPasswordlessPasskeysEnabled"];

    if (read.body["webAuthnPolicyPasswordlessRequireResidentKey"] !== undefined) __args["webAuthnPolicyPasswordlessRequireResidentKey"] = read.body["webAuthnPolicyPasswordlessRequireResidentKey"];

    if (read.body["webAuthnPolicyPasswordlessResidentKey"] !== undefined) __args["webAuthnPolicyPasswordlessResidentKey"] = read.body["webAuthnPolicyPasswordlessResidentKey"];

    if (read.body["webAuthnPolicyPasswordlessRpEntityName"] !== undefined) __args["webAuthnPolicyPasswordlessRpEntityName"] = read.body["webAuthnPolicyPasswordlessRpEntityName"];

    if (read.body["webAuthnPolicyPasswordlessRpId"] !== undefined) __args["webAuthnPolicyPasswordlessRpId"] = read.body["webAuthnPolicyPasswordlessRpId"];

    if (read.body["webAuthnPolicyPasswordlessSignatureAlgorithms"] !== undefined) __args["webAuthnPolicyPasswordlessSignatureAlgorithms"] = read.body["webAuthnPolicyPasswordlessSignatureAlgorithms"];

    if (read.body["webAuthnPolicyPasswordlessUserVerificationRequirement"] !== undefined) __args["webAuthnPolicyPasswordlessUserVerificationRequirement"] = read.body["webAuthnPolicyPasswordlessUserVerificationRequirement"];

    if (read.body["webAuthnPolicyRequireResidentKey"] !== undefined) __args["webAuthnPolicyRequireResidentKey"] = read.body["webAuthnPolicyRequireResidentKey"];

    if (read.body["webAuthnPolicyResidentKey"] !== undefined) __args["webAuthnPolicyResidentKey"] = read.body["webAuthnPolicyResidentKey"];

    if (read.body["webAuthnPolicyRpEntityName"] !== undefined) __args["webAuthnPolicyRpEntityName"] = read.body["webAuthnPolicyRpEntityName"];

    if (read.body["webAuthnPolicyRpId"] !== undefined) __args["webAuthnPolicyRpId"] = read.body["webAuthnPolicyRpId"];

    if (read.body["webAuthnPolicySignatureAlgorithms"] !== undefined) __args["webAuthnPolicySignatureAlgorithms"] = read.body["webAuthnPolicySignatureAlgorithms"];

    if (read.body["webAuthnPolicyUserVerificationRequirement"] !== undefined) __args["webAuthnPolicyUserVerificationRequirement"] = read.body["webAuthnPolicyUserVerificationRequirement"];

  }

  __args["displayName"] = "displayName_85971";

  let changed = updateRealmRepresentation(__args["accessCodeLifespan"], __args["accessCodeLifespanLogin"], __args["accessCodeLifespanUserAction"], __args["accessTokenLifespan"], __args["accessTokenLifespanForImplicitFlow"], __args["accountTheme"], __args["actionTokenGeneratedByAdminLifespan"], __args["actionTokenGeneratedByUserLifespan"], __args["adminEventsDetailsEnabled"], __args["adminEventsEnabled"], __args["adminPermissionsClient"], __args["adminPermissionsEnabled"], __args["adminTheme"], __args["applicationScopeMappings"], __args["applications"], __args["attributes"], __args["authenticationFlows"], __args["authenticatorConfig"], __args["briefRepresentation"], __args["browserFlow"], __args["browserSecurityHeaders"], __args["bruteForceProtected"], __args["bruteForceStrategy"], __args["certificate"], __args["clientAuthenticationFlow"], __args["clientOfflineSessionIdleTimeout"], __args["clientOfflineSessionMaxLifespan"], __args["clientPolicies"], __args["clientProfiles"], __args["clientScopeMappings"], __args["clientScopes"], __args["clientSessionIdleTimeout"], __args["clientSessionMaxLifespan"], __args["clientTemplates"], __args["clients"], __args["codeSecret"], __args["components"], __args["defaultDefaultClientScopes"], __args["defaultGroups"], __args["defaultLocale"], __args["defaultOptionalClientScopes"], __args["defaultRole"], __args["defaultRoles"], __args["defaultSignatureAlgorithm"], __args["directGrantFlow"], __args["displayName"], __args["displayNameHtml"], __args["dockerAuthenticationFlow"], __args["duplicateEmailsAllowed"], __args["editUsernameAllowed"], __args["emailTheme"], __args["enabled"], __args["enabledEventTypes"], __args["eventsEnabled"], __args["eventsExpiration"], __args["eventsListeners"], __args["failureFactor"], __args["federatedUsers"], __args["firstBrokerLoginFlow"], __args["groups"], __args["id"], __args["identityProviderMappers"], __args["identityProviders"], __args["internationalizationEnabled"], __args["keycloakVersion"], __args["localizationTexts"], __args["loginTheme"], __args["loginWithEmailAllowed"], __args["maxDeltaTimeSeconds"], __args["maxFailureWaitSeconds"], __args["maxSecondaryAuthFailures"], __args["maxTemporaryLockouts"], __args["minimumQuickLoginWaitSeconds"], __args["notBefore"], __args["oauth2DeviceCodeLifespan"], __args["oauth2DevicePollingInterval"], __args["oauthClients"], __args["offlineSessionIdleTimeout"], __args["offlineSessionMaxLifespan"], __args["offlineSessionMaxLifespanEnabled"], __args["organizations"], __args["organizationsEnabled"], __args["otpPolicyAlgorithm"], __args["otpPolicyCodeReusable"], __args["otpPolicyDigits"], __args["otpPolicyInitialCounter"], __args["otpPolicyLookAheadWindow"], __args["otpPolicyPeriod"], __args["otpPolicyType"], __args["otpSupportedApplications"], __args["passwordCredentialGrantAllowed"], __args["passwordPolicy"], __args["permanentLockout"], __args["privateKey"], __args["protocolMappers"], __args["publicKey"], __args["quickLoginCheckMilliSeconds"], __args["realm"], __args["realmCacheEnabled"], __args["refreshTokenMaxReuse"], __args["registrationAllowed"], __args["registrationEmailAsUsername"], __args["registrationFlow"], __args["rememberMe"], __args["requiredActions"], __args["requiredCredentials"], __args["resetCredentialsFlow"], __args["resetPasswordAllowed"], __args["revokeRefreshToken"], __args["roles"], __args["scimApiEnabled"], __args["scopeMappings"], __args["smtpServer"], __args["social"], __args["socialProviders"], __args["sslRequired"], __args["ssoSessionIdleTimeout"], __args["ssoSessionIdleTimeoutRememberMe"], __args["ssoSessionMaxLifespan"], __args["ssoSessionMaxLifespanRememberMe"], __args["supportedLocales"], __args["updateProfileOnInitialSocialLogin"], __args["userCacheEnabled"], __args["userFederationMappers"], __args["userFederationProviders"], __args["userManagedAccessAllowed"], __args["users"], __args["verifiableCredentialsEnabled"], __args["verifyEmail"], __args["waitIncrementSeconds"], __args["webAuthnPolicyAcceptableAaguids"], __args["webAuthnPolicyAttestationConveyancePreference"], __args["webAuthnPolicyAuthenticatorAttachment"], __args["webAuthnPolicyAvoidSameAuthenticatorRegister"], __args["webAuthnPolicyCreateTimeout"], __args["webAuthnPolicyExtraOrigins"], __args["webAuthnPolicyPasswordlessAcceptableAaguids"], __args["webAuthnPolicyPasswordlessAttestationConveyancePreference"], __args["webAuthnPolicyPasswordlessAuthenticatorAttachment"], __args["webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister"], __args["webAuthnPolicyPasswordlessCreateTimeout"], __args["webAuthnPolicyPasswordlessExtraOrigins"], __args["webAuthnPolicyPasswordlessMediation"], __args["webAuthnPolicyPasswordlessPasskeysEnabled"], __args["webAuthnPolicyPasswordlessRequireResidentKey"], __args["webAuthnPolicyPasswordlessResidentKey"], __args["webAuthnPolicyPasswordlessRpEntityName"], __args["webAuthnPolicyPasswordlessRpId"], __args["webAuthnPolicyPasswordlessSignatureAlgorithms"], __args["webAuthnPolicyPasswordlessUserVerificationRequirement"], __args["webAuthnPolicyRequireResidentKey"], __args["webAuthnPolicyResidentKey"], __args["webAuthnPolicyRpEntityName"], __args["webAuthnPolicyRpId"], __args["webAuthnPolicySignatureAlgorithms"], __args["webAuthnPolicyUserVerificationRequirement"], "P1:admin/realms:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"displayName",__args["displayName"])) { finish("update-failed"); return; }

  while (!SBT_FINISHED["1:admin/realms/{realm}/authentication/config"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/config"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/authentication/config";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/authentication/executions";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/authentication/executions/{executionId}/config"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions/{executionId}/config"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/authentication/executions/{executionId}/config";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/authentication/flows"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/flows"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/authentication/flows";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/client-scopes"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-scopes"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/client-scopes";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/client-templates"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-templates"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/client-templates";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/clients"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/roles"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/roles"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients/{client-uuid}/roles";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/components"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/components"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/components";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/groups"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/groups"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/groups";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/identity-provider/instances";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/identity-provider/instances/{alias}/mappers";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/organizations"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/groups"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/groups"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations/{org-id}/groups";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations/{org-id}/identity-providers";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations/{org-id}/members";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/roles"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/roles"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/roles";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/users"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/users"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/users";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/workflows"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/workflows"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/workflows";

    })});

  }

  let deleted = deleteRealmRepresentation(__args["accessCodeLifespan"], __args["accessCodeLifespanLogin"], __args["accessCodeLifespanUserAction"], __args["accessTokenLifespan"], __args["accessTokenLifespanForImplicitFlow"], __args["accountTheme"], __args["actionTokenGeneratedByAdminLifespan"], __args["actionTokenGeneratedByUserLifespan"], __args["adminEventsDetailsEnabled"], __args["adminEventsEnabled"], __args["adminPermissionsClient"], __args["adminPermissionsEnabled"], __args["adminTheme"], __args["applicationScopeMappings"], __args["applications"], __args["attributes"], __args["authenticationFlows"], __args["authenticatorConfig"], __args["briefRepresentation"], __args["browserFlow"], __args["browserSecurityHeaders"], __args["bruteForceProtected"], __args["bruteForceStrategy"], __args["certificate"], __args["clientAuthenticationFlow"], __args["clientOfflineSessionIdleTimeout"], __args["clientOfflineSessionMaxLifespan"], __args["clientPolicies"], __args["clientProfiles"], __args["clientScopeMappings"], __args["clientScopes"], __args["clientSessionIdleTimeout"], __args["clientSessionMaxLifespan"], __args["clientTemplates"], __args["clients"], __args["codeSecret"], __args["components"], __args["defaultDefaultClientScopes"], __args["defaultGroups"], __args["defaultLocale"], __args["defaultOptionalClientScopes"], __args["defaultRole"], __args["defaultRoles"], __args["defaultSignatureAlgorithm"], __args["directGrantFlow"], __args["displayName"], __args["displayNameHtml"], __args["dockerAuthenticationFlow"], __args["duplicateEmailsAllowed"], __args["editUsernameAllowed"], __args["emailTheme"], __args["enabled"], __args["enabledEventTypes"], __args["eventsEnabled"], __args["eventsExpiration"], __args["eventsListeners"], __args["failureFactor"], __args["federatedUsers"], __args["firstBrokerLoginFlow"], __args["groups"], __args["id"], __args["identityProviderMappers"], __args["identityProviders"], __args["internationalizationEnabled"], __args["keycloakVersion"], __args["localizationTexts"], __args["loginTheme"], __args["loginWithEmailAllowed"], __args["maxDeltaTimeSeconds"], __args["maxFailureWaitSeconds"], __args["maxSecondaryAuthFailures"], __args["maxTemporaryLockouts"], __args["minimumQuickLoginWaitSeconds"], __args["notBefore"], __args["oauth2DeviceCodeLifespan"], __args["oauth2DevicePollingInterval"], __args["oauthClients"], __args["offlineSessionIdleTimeout"], __args["offlineSessionMaxLifespan"], __args["offlineSessionMaxLifespanEnabled"], __args["organizations"], __args["organizationsEnabled"], __args["otpPolicyAlgorithm"], __args["otpPolicyCodeReusable"], __args["otpPolicyDigits"], __args["otpPolicyInitialCounter"], __args["otpPolicyLookAheadWindow"], __args["otpPolicyPeriod"], __args["otpPolicyType"], __args["otpSupportedApplications"], __args["passwordCredentialGrantAllowed"], __args["passwordPolicy"], __args["permanentLockout"], __args["privateKey"], __args["protocolMappers"], __args["publicKey"], __args["quickLoginCheckMilliSeconds"], __args["realm"], __args["realmCacheEnabled"], __args["refreshTokenMaxReuse"], __args["registrationAllowed"], __args["registrationEmailAsUsername"], __args["registrationFlow"], __args["rememberMe"], __args["requiredActions"], __args["requiredCredentials"], __args["resetCredentialsFlow"], __args["resetPasswordAllowed"], __args["revokeRefreshToken"], __args["roles"], __args["scimApiEnabled"], __args["scopeMappings"], __args["smtpServer"], __args["social"], __args["socialProviders"], __args["sslRequired"], __args["ssoSessionIdleTimeout"], __args["ssoSessionIdleTimeoutRememberMe"], __args["ssoSessionMaxLifespan"], __args["ssoSessionMaxLifespanRememberMe"], __args["supportedLocales"], __args["updateProfileOnInitialSocialLogin"], __args["userCacheEnabled"], __args["userFederationMappers"], __args["userFederationProviders"], __args["userManagedAccessAllowed"], __args["users"], __args["verifiableCredentialsEnabled"], __args["verifyEmail"], __args["waitIncrementSeconds"], __args["webAuthnPolicyAcceptableAaguids"], __args["webAuthnPolicyAttestationConveyancePreference"], __args["webAuthnPolicyAuthenticatorAttachment"], __args["webAuthnPolicyAvoidSameAuthenticatorRegister"], __args["webAuthnPolicyCreateTimeout"], __args["webAuthnPolicyExtraOrigins"], __args["webAuthnPolicyPasswordlessAcceptableAaguids"], __args["webAuthnPolicyPasswordlessAttestationConveyancePreference"], __args["webAuthnPolicyPasswordlessAuthenticatorAttachment"], __args["webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister"], __args["webAuthnPolicyPasswordlessCreateTimeout"], __args["webAuthnPolicyPasswordlessExtraOrigins"], __args["webAuthnPolicyPasswordlessMediation"], __args["webAuthnPolicyPasswordlessPasskeysEnabled"], __args["webAuthnPolicyPasswordlessRequireResidentKey"], __args["webAuthnPolicyPasswordlessResidentKey"], __args["webAuthnPolicyPasswordlessRpEntityName"], __args["webAuthnPolicyPasswordlessRpId"], __args["webAuthnPolicyPasswordlessSignatureAlgorithms"], __args["webAuthnPolicyPasswordlessUserVerificationRequirement"], __args["webAuthnPolicyRequireResidentKey"], __args["webAuthnPolicyResidentKey"], __args["webAuthnPolicyRpEntityName"], __args["webAuthnPolicyRpId"], __args["webAuthnPolicySignatureAlgorithms"], __args["webAuthnPolicyUserVerificationRequirement"], "P1:admin/realms:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/authentication/config:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/authentication/config:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/authentication/config:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getAuthenticatorConfigRepresentation(step.data.values["alias"], step.data.values["config"], step.data.values["id"], step.data.values["realm"], "P1:admin/realms/{realm}/authentication/config:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/authentication/config:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/authentication/config:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/authentication/config",owner:"P1:admin/realms/{realm}/authentication/config:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/authentication/config:1",process:1,entity:"admin/realms/{realm}/authentication/config",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/authentication/config:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/authentication/config:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/authentication/config:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/authentication/config:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["alias"] = "alias_55365";

  let created = createAuthenticatorConfigRepresentation(__args["alias"], __args["config"], __args["id"], __args["realm"], "P1:admin/realms/{realm}/authentication/config:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["id"] === undefined || __args["id"] === null) {

    let response = created.body;

    __args["id"] = response && typeof response === "object" ?

      (response["id"] === undefined ? response.__sbtObservedLocationId : response["id"]) : undefined;

  }

  if (__args["id"] === undefined || __args["id"] === null) { finish("create-id-unresolved"); return; }

  let bound = getAuthenticatorConfigRepresentation(__args["alias"], __args["config"], __args["id"], __args["realm"], "P1:admin/realms/{realm}/authentication/config:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["id"] !== undefined && bound.body["id"] !== __args["id"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["id"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/authentication/config:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/authentication/config:1:id", __args["id"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/authentication/config",owner:"P1:admin/realms/{realm}/authentication/config:1",values:Object.assign({},__args)})});

  let read = getAuthenticatorConfigRepresentation(__args["alias"], __args["config"], __args["id"], __args["realm"], "P1:admin/realms/{realm}/authentication/config:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["alias"] !== undefined) __args["alias"] = read.body["alias"];

    if (read.body["config"] !== undefined) __args["config"] = read.body["config"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

  }

  __args["alias"] = "alias_93536";

  let changed = updateAuthenticatorConfigRepresentation(__args["alias"], __args["config"], __args["id"], __args["realm"], "P1:admin/realms/{realm}/authentication/config:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"alias",__args["alias"])) { finish("update-failed"); return; }

  let deleted = deleteAuthenticatorConfigRepresentation(__args["alias"], __args["config"], __args["id"], __args["realm"], "P1:admin/realms/{realm}/authentication/config:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/authentication/flows:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/authentication/flows:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/authentication/flows:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getAuthenticationFlowRepresentation(step.data.values["alias"], step.data.values["authenticationExecutions"], step.data.values["builtIn"], step.data.values["description"], step.data.values["id"], step.data.values["providerId"], step.data.values["realm"], step.data.values["topLevel"], "P1:admin/realms/{realm}/authentication/flows:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/authentication/flows:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/authentication/flows:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/authentication/flows",owner:"P1:admin/realms/{realm}/authentication/flows:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/authentication/flows:1",process:1,entity:"admin/realms/{realm}/authentication/flows",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/authentication/flows:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/authentication/flows:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/authentication/flows:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/authentication/flows:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["alias"] = "alias_24789";

  let created = createAuthenticationFlowRepresentation(__args["alias"], __args["authenticationExecutions"], __args["builtIn"], __args["description"], __args["id"], __args["providerId"], __args["realm"], __args["topLevel"], "P1:admin/realms/{realm}/authentication/flows:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["id"] === undefined || __args["id"] === null) {

    let response = created.body;

    __args["id"] = response && typeof response === "object" ?

      (response["id"] === undefined ? response.__sbtObservedLocationId : response["id"]) : undefined;

  }

  if (__args["id"] === undefined || __args["id"] === null) { finish("create-id-unresolved"); return; }

  let bound = getAuthenticationFlowRepresentation(__args["alias"], __args["authenticationExecutions"], __args["builtIn"], __args["description"], __args["id"], __args["providerId"], __args["realm"], __args["topLevel"], "P1:admin/realms/{realm}/authentication/flows:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["id"] !== undefined && bound.body["id"] !== __args["id"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["id"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/authentication/flows:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/authentication/flows:1:id", __args["id"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/authentication/flows",owner:"P1:admin/realms/{realm}/authentication/flows:1",values:Object.assign({},__args)})});

  let read = getAuthenticationFlowRepresentation(__args["alias"], __args["authenticationExecutions"], __args["builtIn"], __args["description"], __args["id"], __args["providerId"], __args["realm"], __args["topLevel"], "P1:admin/realms/{realm}/authentication/flows:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["alias"] !== undefined) __args["alias"] = read.body["alias"];

    if (read.body["authenticationExecutions"] !== undefined) __args["authenticationExecutions"] = read.body["authenticationExecutions"];

    if (read.body["builtIn"] !== undefined) __args["builtIn"] = read.body["builtIn"];

    if (read.body["description"] !== undefined) __args["description"] = read.body["description"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["providerId"] !== undefined) __args["providerId"] = read.body["providerId"];

    if (read.body["topLevel"] !== undefined) __args["topLevel"] = read.body["topLevel"];

  }

  __args["description"] = "description_10215";

  let changed = updateAuthenticationFlowRepresentation(__args["alias"], __args["authenticationExecutions"], __args["builtIn"], __args["description"], __args["id"], __args["providerId"], __args["realm"], __args["topLevel"], "P1:admin/realms/{realm}/authentication/flows:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"description",__args["description"])) { finish("update-failed"); return; }

  while (!SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/authentication/flows:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/authentication/executions";

    })});

  }

  let deleted = deleteAuthenticationFlowRepresentation(__args["alias"], __args["authenticationExecutions"], __args["builtIn"], __args["description"], __args["id"], __args["providerId"], __args["realm"], __args["topLevel"], "P1:admin/realms/{realm}/authentication/flows:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/client-scopes:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/client-scopes:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/client-scopes:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getClientScopeRepresentation(step.data.values["attributes"], step.data.values["clientScopeId"], step.data.values["description"], step.data.values["id"], step.data.values["name"], step.data.values["protocol"], step.data.values["protocolMappers"], step.data.values["realm"], "P1:admin/realms/{realm}/client-scopes:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/client-scopes:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/client-scopes:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/client-scopes",owner:"P1:admin/realms/{realm}/client-scopes:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/client-scopes:1",process:1,entity:"admin/realms/{realm}/client-scopes",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/client-scopes:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/client-scopes:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/client-scopes:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/client-scopes:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["name"] = "name_37893";

  let created = createClientScopeRepresentation(__args["attributes"], __args["clientScopeId"], __args["description"], __args["id"], __args["name"], __args["protocol"], __args["protocolMappers"], __args["realm"], "P1:admin/realms/{realm}/client-scopes:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["clientScopeId"] === undefined || __args["clientScopeId"] === null) {

    let response = created.body;

    __args["clientScopeId"] = response && typeof response === "object" ?

      (response["clientScopeId"] === undefined ? response.__sbtObservedLocationId : response["clientScopeId"]) : undefined;

  }

  if (__args["clientScopeId"] === undefined || __args["clientScopeId"] === null) { finish("create-id-unresolved"); return; }

  let bound = getClientScopeRepresentation(__args["attributes"], __args["clientScopeId"], __args["description"], __args["id"], __args["name"], __args["protocol"], __args["protocolMappers"], __args["realm"], "P1:admin/realms/{realm}/client-scopes:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["clientScopeId"] !== undefined && bound.body["clientScopeId"] !== __args["clientScopeId"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["clientScopeId"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/client-scopes:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/client-scopes:1:clientScopeId", __args["clientScopeId"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/client-scopes",owner:"P1:admin/realms/{realm}/client-scopes:1",values:Object.assign({},__args)})});

  let read = getClientScopeRepresentation(__args["attributes"], __args["clientScopeId"], __args["description"], __args["id"], __args["name"], __args["protocol"], __args["protocolMappers"], __args["realm"], "P1:admin/realms/{realm}/client-scopes:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["description"] !== undefined) __args["description"] = read.body["description"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["protocol"] !== undefined) __args["protocol"] = read.body["protocol"];

    if (read.body["protocolMappers"] !== undefined) __args["protocolMappers"] = read.body["protocolMappers"];

  }

  __args["description"] = "description_82178";

  let changed = updateClientScopeRepresentation(__args["attributes"], __args["clientScopeId"], __args["description"], __args["id"], __args["name"], __args["protocol"], __args["protocolMappers"], __args["realm"], "P1:admin/realms/{realm}/client-scopes:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"description",__args["description"])) { finish("update-failed"); return; }

  while (!SBT_FINISHED["1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/client-scopes:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/client-templates"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-templates"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/client-scopes:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/client-templates";

    })});

  }

  let deleted = deleteClientScopeRepresentation(__args["attributes"], __args["clientScopeId"], __args["description"], __args["id"], __args["name"], __args["protocol"], __args["protocolMappers"], __args["realm"], "P1:admin/realms/{realm}/client-scopes:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/clients:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/clients:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/clients:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getClientRepresentation(step.data.values["access"], step.data.values["adminUrl"], step.data.values["alwaysDisplayInConsole"], step.data.values["attributes"], step.data.values["authenticationFlowBindingOverrides"], step.data.values["authorizationServicesEnabled"], step.data.values["authorizationSettings"], step.data.values["baseUrl"], step.data.values["bearerOnly"], step.data.values["clientUuid"], step.data.values["clientAuthenticatorType"], step.data.values["clientId"], step.data.values["clientTemplate"], step.data.values["consentRequired"], step.data.values["defaultClientScopes"], step.data.values["defaultRoles"], step.data.values["description"], step.data.values["directAccessGrantsEnabled"], step.data.values["directGrantsOnly"], step.data.values["enabled"], step.data.values["first"], step.data.values["frontchannelLogout"], step.data.values["fullScopeAllowed"], step.data.values["id"], step.data.values["implicitFlowEnabled"], step.data.values["max"], step.data.values["name"], step.data.values["nodeReRegistrationTimeout"], step.data.values["notBefore"], step.data.values["optionalClientScopes"], step.data.values["origin"], step.data.values["protocol"], step.data.values["protocolMappers"], step.data.values["publicClient"], step.data.values["q"], step.data.values["realm"], step.data.values["redirectUris"], step.data.values["registeredNodes"], step.data.values["registrationAccessToken"], step.data.values["rootUrl"], step.data.values["search"], step.data.values["secret"], step.data.values["serviceAccountsEnabled"], step.data.values["standardFlowEnabled"], step.data.values["surrogateAuthRequired"], step.data.values["type"], step.data.values["useTemplateConfig"], step.data.values["useTemplateMappers"], step.data.values["useTemplateScope"], step.data.values["viewableOnly"], step.data.values["webOrigins"], "P1:admin/realms/{realm}/clients:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/clients:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/clients:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/clients",owner:"P1:admin/realms/{realm}/clients:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/clients:1",process:1,entity:"admin/realms/{realm}/clients",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/clients:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/clients:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/clients:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/clients:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["clientId"] = "clientId_96643";

  __args["name"] = "name_40087";

  let created = createClientRepresentation(__args["access"], __args["adminUrl"], __args["alwaysDisplayInConsole"], __args["attributes"], __args["authenticationFlowBindingOverrides"], __args["authorizationServicesEnabled"], __args["authorizationSettings"], __args["baseUrl"], __args["bearerOnly"], __args["clientUuid"], __args["clientAuthenticatorType"], __args["clientId"], __args["clientTemplate"], __args["consentRequired"], __args["defaultClientScopes"], __args["defaultRoles"], __args["description"], __args["directAccessGrantsEnabled"], __args["directGrantsOnly"], __args["enabled"], __args["first"], __args["frontchannelLogout"], __args["fullScopeAllowed"], __args["id"], __args["implicitFlowEnabled"], __args["max"], __args["name"], __args["nodeReRegistrationTimeout"], __args["notBefore"], __args["optionalClientScopes"], __args["origin"], __args["protocol"], __args["protocolMappers"], __args["publicClient"], __args["q"], __args["realm"], __args["redirectUris"], __args["registeredNodes"], __args["registrationAccessToken"], __args["rootUrl"], __args["search"], __args["secret"], __args["serviceAccountsEnabled"], __args["standardFlowEnabled"], __args["surrogateAuthRequired"], __args["type"], __args["useTemplateConfig"], __args["useTemplateMappers"], __args["useTemplateScope"], __args["viewableOnly"], __args["webOrigins"], "P1:admin/realms/{realm}/clients:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["clientUuid"] === undefined || __args["clientUuid"] === null) {

    let response = created.body;

    __args["clientUuid"] = response && typeof response === "object" ?

      (response["clientUuid"] === undefined ? response.__sbtObservedLocationId : response["clientUuid"]) : undefined;

  }

  if (__args["clientUuid"] === undefined || __args["clientUuid"] === null) { finish("create-id-unresolved"); return; }

  let bound = getClientRepresentation(__args["access"], __args["adminUrl"], __args["alwaysDisplayInConsole"], __args["attributes"], __args["authenticationFlowBindingOverrides"], __args["authorizationServicesEnabled"], __args["authorizationSettings"], __args["baseUrl"], __args["bearerOnly"], __args["clientUuid"], __args["clientAuthenticatorType"], __args["clientId"], __args["clientTemplate"], __args["consentRequired"], __args["defaultClientScopes"], __args["defaultRoles"], __args["description"], __args["directAccessGrantsEnabled"], __args["directGrantsOnly"], __args["enabled"], __args["first"], __args["frontchannelLogout"], __args["fullScopeAllowed"], __args["id"], __args["implicitFlowEnabled"], __args["max"], __args["name"], __args["nodeReRegistrationTimeout"], __args["notBefore"], __args["optionalClientScopes"], __args["origin"], __args["protocol"], __args["protocolMappers"], __args["publicClient"], __args["q"], __args["realm"], __args["redirectUris"], __args["registeredNodes"], __args["registrationAccessToken"], __args["rootUrl"], __args["search"], __args["secret"], __args["serviceAccountsEnabled"], __args["standardFlowEnabled"], __args["surrogateAuthRequired"], __args["type"], __args["useTemplateConfig"], __args["useTemplateMappers"], __args["useTemplateScope"], __args["viewableOnly"], __args["webOrigins"], "P1:admin/realms/{realm}/clients:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["clientUuid"] !== undefined && bound.body["clientUuid"] !== __args["clientUuid"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["clientUuid"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/clients:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/clients:1:clientUuid", __args["clientUuid"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/clients",owner:"P1:admin/realms/{realm}/clients:1",values:Object.assign({},__args)})});

  let read = getClientRepresentation(__args["access"], __args["adminUrl"], __args["alwaysDisplayInConsole"], __args["attributes"], __args["authenticationFlowBindingOverrides"], __args["authorizationServicesEnabled"], __args["authorizationSettings"], __args["baseUrl"], __args["bearerOnly"], __args["clientUuid"], __args["clientAuthenticatorType"], __args["clientId"], __args["clientTemplate"], __args["consentRequired"], __args["defaultClientScopes"], __args["defaultRoles"], __args["description"], __args["directAccessGrantsEnabled"], __args["directGrantsOnly"], __args["enabled"], __args["first"], __args["frontchannelLogout"], __args["fullScopeAllowed"], __args["id"], __args["implicitFlowEnabled"], __args["max"], __args["name"], __args["nodeReRegistrationTimeout"], __args["notBefore"], __args["optionalClientScopes"], __args["origin"], __args["protocol"], __args["protocolMappers"], __args["publicClient"], __args["q"], __args["realm"], __args["redirectUris"], __args["registeredNodes"], __args["registrationAccessToken"], __args["rootUrl"], __args["search"], __args["secret"], __args["serviceAccountsEnabled"], __args["standardFlowEnabled"], __args["surrogateAuthRequired"], __args["type"], __args["useTemplateConfig"], __args["useTemplateMappers"], __args["useTemplateScope"], __args["viewableOnly"], __args["webOrigins"], "P1:admin/realms/{realm}/clients:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["access"] !== undefined) __args["access"] = read.body["access"];

    if (read.body["adminUrl"] !== undefined) __args["adminUrl"] = read.body["adminUrl"];

    if (read.body["alwaysDisplayInConsole"] !== undefined) __args["alwaysDisplayInConsole"] = read.body["alwaysDisplayInConsole"];

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["authenticationFlowBindingOverrides"] !== undefined) __args["authenticationFlowBindingOverrides"] = read.body["authenticationFlowBindingOverrides"];

    if (read.body["authorizationServicesEnabled"] !== undefined) __args["authorizationServicesEnabled"] = read.body["authorizationServicesEnabled"];

    if (read.body["authorizationSettings"] !== undefined) __args["authorizationSettings"] = read.body["authorizationSettings"];

    if (read.body["baseUrl"] !== undefined) __args["baseUrl"] = read.body["baseUrl"];

    if (read.body["bearerOnly"] !== undefined) __args["bearerOnly"] = read.body["bearerOnly"];

    if (read.body["clientAuthenticatorType"] !== undefined) __args["clientAuthenticatorType"] = read.body["clientAuthenticatorType"];

    if (read.body["clientId"] !== undefined) __args["clientId"] = read.body["clientId"];

    if (read.body["clientTemplate"] !== undefined) __args["clientTemplate"] = read.body["clientTemplate"];

    if (read.body["consentRequired"] !== undefined) __args["consentRequired"] = read.body["consentRequired"];

    if (read.body["defaultClientScopes"] !== undefined) __args["defaultClientScopes"] = read.body["defaultClientScopes"];

    if (read.body["defaultRoles"] !== undefined) __args["defaultRoles"] = read.body["defaultRoles"];

    if (read.body["description"] !== undefined) __args["description"] = read.body["description"];

    if (read.body["directAccessGrantsEnabled"] !== undefined) __args["directAccessGrantsEnabled"] = read.body["directAccessGrantsEnabled"];

    if (read.body["directGrantsOnly"] !== undefined) __args["directGrantsOnly"] = read.body["directGrantsOnly"];

    if (read.body["enabled"] !== undefined) __args["enabled"] = read.body["enabled"];

    if (read.body["frontchannelLogout"] !== undefined) __args["frontchannelLogout"] = read.body["frontchannelLogout"];

    if (read.body["fullScopeAllowed"] !== undefined) __args["fullScopeAllowed"] = read.body["fullScopeAllowed"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["implicitFlowEnabled"] !== undefined) __args["implicitFlowEnabled"] = read.body["implicitFlowEnabled"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["nodeReRegistrationTimeout"] !== undefined) __args["nodeReRegistrationTimeout"] = read.body["nodeReRegistrationTimeout"];

    if (read.body["notBefore"] !== undefined) __args["notBefore"] = read.body["notBefore"];

    if (read.body["optionalClientScopes"] !== undefined) __args["optionalClientScopes"] = read.body["optionalClientScopes"];

    if (read.body["origin"] !== undefined) __args["origin"] = read.body["origin"];

    if (read.body["protocol"] !== undefined) __args["protocol"] = read.body["protocol"];

    if (read.body["protocolMappers"] !== undefined) __args["protocolMappers"] = read.body["protocolMappers"];

    if (read.body["publicClient"] !== undefined) __args["publicClient"] = read.body["publicClient"];

    if (read.body["redirectUris"] !== undefined) __args["redirectUris"] = read.body["redirectUris"];

    if (read.body["registeredNodes"] !== undefined) __args["registeredNodes"] = read.body["registeredNodes"];

    if (read.body["registrationAccessToken"] !== undefined) __args["registrationAccessToken"] = read.body["registrationAccessToken"];

    if (read.body["rootUrl"] !== undefined) __args["rootUrl"] = read.body["rootUrl"];

    if (read.body["secret"] !== undefined) __args["secret"] = read.body["secret"];

    if (read.body["serviceAccountsEnabled"] !== undefined) __args["serviceAccountsEnabled"] = read.body["serviceAccountsEnabled"];

    if (read.body["standardFlowEnabled"] !== undefined) __args["standardFlowEnabled"] = read.body["standardFlowEnabled"];

    if (read.body["surrogateAuthRequired"] !== undefined) __args["surrogateAuthRequired"] = read.body["surrogateAuthRequired"];

    if (read.body["type"] !== undefined) __args["type"] = read.body["type"];

    if (read.body["useTemplateConfig"] !== undefined) __args["useTemplateConfig"] = read.body["useTemplateConfig"];

    if (read.body["useTemplateMappers"] !== undefined) __args["useTemplateMappers"] = read.body["useTemplateMappers"];

    if (read.body["useTemplateScope"] !== undefined) __args["useTemplateScope"] = read.body["useTemplateScope"];

    if (read.body["webOrigins"] !== undefined) __args["webOrigins"] = read.body["webOrigins"];

  }

  __args["description"] = "description_64795";

  let changed = updateClientRepresentation(__args["access"], __args["adminUrl"], __args["alwaysDisplayInConsole"], __args["attributes"], __args["authenticationFlowBindingOverrides"], __args["authorizationServicesEnabled"], __args["authorizationSettings"], __args["baseUrl"], __args["bearerOnly"], __args["clientUuid"], __args["clientAuthenticatorType"], __args["clientId"], __args["clientTemplate"], __args["consentRequired"], __args["defaultClientScopes"], __args["defaultRoles"], __args["description"], __args["directAccessGrantsEnabled"], __args["directGrantsOnly"], __args["enabled"], __args["first"], __args["frontchannelLogout"], __args["fullScopeAllowed"], __args["id"], __args["implicitFlowEnabled"], __args["max"], __args["name"], __args["nodeReRegistrationTimeout"], __args["notBefore"], __args["optionalClientScopes"], __args["origin"], __args["protocol"], __args["protocolMappers"], __args["publicClient"], __args["q"], __args["realm"], __args["redirectUris"], __args["registeredNodes"], __args["registrationAccessToken"], __args["rootUrl"], __args["search"], __args["secret"], __args["serviceAccountsEnabled"], __args["standardFlowEnabled"], __args["surrogateAuthRequired"], __args["type"], __args["useTemplateConfig"], __args["useTemplateMappers"], __args["useTemplateScope"], __args["viewableOnly"], __args["webOrigins"], "P1:admin/realms/{realm}/clients:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"description",__args["description"])) { finish("update-failed"); return; }

  while (!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/clients:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/clients:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/clients:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/roles"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients/{client-uuid}/roles"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/clients:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients/{client-uuid}/roles";

    })});

  }

  let deleted = deleteClientRepresentation(__args["access"], __args["adminUrl"], __args["alwaysDisplayInConsole"], __args["attributes"], __args["authenticationFlowBindingOverrides"], __args["authorizationServicesEnabled"], __args["authorizationSettings"], __args["baseUrl"], __args["bearerOnly"], __args["clientUuid"], __args["clientAuthenticatorType"], __args["clientId"], __args["clientTemplate"], __args["consentRequired"], __args["defaultClientScopes"], __args["defaultRoles"], __args["description"], __args["directAccessGrantsEnabled"], __args["directGrantsOnly"], __args["enabled"], __args["first"], __args["frontchannelLogout"], __args["fullScopeAllowed"], __args["id"], __args["implicitFlowEnabled"], __args["max"], __args["name"], __args["nodeReRegistrationTimeout"], __args["notBefore"], __args["optionalClientScopes"], __args["origin"], __args["protocol"], __args["protocolMappers"], __args["publicClient"], __args["q"], __args["realm"], __args["redirectUris"], __args["registeredNodes"], __args["registrationAccessToken"], __args["rootUrl"], __args["search"], __args["secret"], __args["serviceAccountsEnabled"], __args["standardFlowEnabled"], __args["surrogateAuthRequired"], __args["type"], __args["useTemplateConfig"], __args["useTemplateMappers"], __args["useTemplateScope"], __args["viewableOnly"], __args["webOrigins"], "P1:admin/realms/{realm}/clients:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/components:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/components:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/components:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getComponentRepresentation(step.data.values["config"], step.data.values["id"], step.data.values["name"], step.data.values["parent"], step.data.values["parentId"], step.data.values["providerId"], step.data.values["providerType"], step.data.values["realm"], step.data.values["subType"], step.data.values["type"], "P1:admin/realms/{realm}/components:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/components:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("verify-lookup:P1:admin/realms/{realm}/components:1", function() {

  let e = sync({waitFor: EventSet("lookup-or-finish:P1:admin/realms/{realm}/components:1", function(x) {

    return x.data && x.data.owner === "P1:admin/realms/{realm}/components:1" && ((x.name === "SBT:CrudStep" && x.data.stage === "lookup") || x.name === "SBT:WorkerFinished");

  })});

  if (e.name === "SBT:CrudStep") {

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/components:1",stage:"lookup",ok:e.data.success})});

  }

});

bthread("crud:P1:admin/realms/{realm}/components:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/components",owner:"P1:admin/realms/{realm}/components:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/components:1",process:1,entity:"admin/realms/{realm}/components",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/components:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/components:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/components:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/components:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["name"] = "name_6354";

  let created = createComponentRepresentation(__args["config"], __args["id"], __args["name"], __args["parent"], __args["parentId"], __args["providerId"], __args["providerType"], __args["realm"], __args["subType"], __args["type"], "P1:admin/realms/{realm}/components:1" + ":create");

  if (!created || [200].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["id"] === undefined || __args["id"] === null) {

    let response = created.body;

    __args["id"] = response && typeof response === "object" ?

      (response["id"] === undefined ? response.__sbtObservedLocationId : response["id"]) : undefined;

  }

  if (__args["id"] === undefined || __args["id"] === null) {

    let lookup = listComponentRepresentations(__args["config"], __args["id"], __args["name"], __args["parent"], __args["parentId"], __args["providerId"], __args["providerType"], __args["realm"], __args["subType"], __args["type"], "P1:admin/realms/{realm}/components:1" + ":lookup");

    let items = lookup && Array.isArray(lookup.body) ? lookup.body : [];

    let matches = items.filter(function(x) { return x && x["name"] === __args["name"]; });

    let lookupOk = !!lookup && [200].indexOf(lookup.code) >= 0 &&

      matches.length === 1 && matches[0].id !== undefined && matches[0].id !== null;

    if (!verified("lookup", lookup, lookupOk)) { finish("lookup-failed"); return; }

    __args["id"] = matches[0].id;

  }

  if (__args["id"] === undefined || __args["id"] === null) { finish("create-id-unresolved"); return; }

  let bound = getComponentRepresentation(__args["config"], __args["id"], __args["name"], __args["parent"], __args["parentId"], __args["providerId"], __args["providerType"], __args["realm"], __args["subType"], __args["type"], "P1:admin/realms/{realm}/components:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["id"] !== undefined && bound.body["id"] !== __args["id"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["id"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/components:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/components:1:id", __args["id"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/components",owner:"P1:admin/realms/{realm}/components:1",values:Object.assign({},__args)})});

  let read = getComponentRepresentation(__args["config"], __args["id"], __args["name"], __args["parent"], __args["parentId"], __args["providerId"], __args["providerType"], __args["realm"], __args["subType"], __args["type"], "P1:admin/realms/{realm}/components:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["config"] !== undefined) __args["config"] = read.body["config"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["parentId"] !== undefined) __args["parentId"] = read.body["parentId"];

    if (read.body["providerId"] !== undefined) __args["providerId"] = read.body["providerId"];

    if (read.body["providerType"] !== undefined) __args["providerType"] = read.body["providerType"];

    if (read.body["subType"] !== undefined) __args["subType"] = read.body["subType"];

  }

  __args["name"] = "name_62857";

  let changed = updateComponentRepresentation(__args["config"], __args["id"], __args["name"], __args["parent"], __args["parentId"], __args["providerId"], __args["providerType"], __args["realm"], __args["subType"], __args["type"], "P1:admin/realms/{realm}/components:1" + ":update");

  if (!verified("update", changed, !!changed && [200].indexOf(changed.code) >= 0,"name",__args["name"])) { finish("update-failed"); return; }

  let deleted = deleteComponentRepresentation(__args["config"], __args["id"], __args["name"], __args["parent"], __args["parentId"], __args["providerId"], __args["providerType"], __args["realm"], __args["subType"], __args["type"], "P1:admin/realms/{realm}/components:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/groups:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/groups:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/groups:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getGroupRepresentation(step.data.values["access"], step.data.values["attributes"], step.data.values["briefRepresentation"], step.data.values["clientRoles"], step.data.values["description"], step.data.values["exact"], step.data.values["first"], step.data.values["groupId"], step.data.values["id"], step.data.values["max"], step.data.values["name"], step.data.values["parentId"], step.data.values["path"], step.data.values["populateHierarchy"], step.data.values["q"], step.data.values["realm"], step.data.values["realmRoles"], step.data.values["search"], step.data.values["subGroupCount"], step.data.values["subGroups"], step.data.values["subGroupsCount"], "P1:admin/realms/{realm}/groups:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/groups:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/groups:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/groups",owner:"P1:admin/realms/{realm}/groups:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/groups:1",process:1,entity:"admin/realms/{realm}/groups",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/groups:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/groups:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/groups:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/groups:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["name"] = "name_15174";

  let created = createGroupRepresentation(__args["access"], __args["attributes"], __args["briefRepresentation"], __args["clientRoles"], __args["description"], __args["exact"], __args["first"], __args["groupId"], __args["id"], __args["max"], __args["name"], __args["parentId"], __args["path"], __args["populateHierarchy"], __args["q"], __args["realm"], __args["realmRoles"], __args["search"], __args["subGroupCount"], __args["subGroups"], __args["subGroupsCount"], "P1:admin/realms/{realm}/groups:1" + ":create");

  if (!created || [201, 204].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["groupId"] === undefined || __args["groupId"] === null) {

    let response = created.body;

    __args["groupId"] = response && typeof response === "object" ?

      (response["groupId"] === undefined ? response.__sbtObservedLocationId : response["groupId"]) : undefined;

  }

  if (__args["groupId"] === undefined || __args["groupId"] === null) { finish("create-id-unresolved"); return; }

  let bound = getGroupRepresentation(__args["access"], __args["attributes"], __args["briefRepresentation"], __args["clientRoles"], __args["description"], __args["exact"], __args["first"], __args["groupId"], __args["id"], __args["max"], __args["name"], __args["parentId"], __args["path"], __args["populateHierarchy"], __args["q"], __args["realm"], __args["realmRoles"], __args["search"], __args["subGroupCount"], __args["subGroups"], __args["subGroupsCount"], "P1:admin/realms/{realm}/groups:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["groupId"] !== undefined && bound.body["groupId"] !== __args["groupId"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["groupId"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/groups:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/groups:1:groupId", __args["groupId"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/groups",owner:"P1:admin/realms/{realm}/groups:1",values:Object.assign({},__args)})});

  let read = getGroupRepresentation(__args["access"], __args["attributes"], __args["briefRepresentation"], __args["clientRoles"], __args["description"], __args["exact"], __args["first"], __args["groupId"], __args["id"], __args["max"], __args["name"], __args["parentId"], __args["path"], __args["populateHierarchy"], __args["q"], __args["realm"], __args["realmRoles"], __args["search"], __args["subGroupCount"], __args["subGroups"], __args["subGroupsCount"], "P1:admin/realms/{realm}/groups:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["access"] !== undefined) __args["access"] = read.body["access"];

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["clientRoles"] !== undefined) __args["clientRoles"] = read.body["clientRoles"];

    if (read.body["description"] !== undefined) __args["description"] = read.body["description"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["parentId"] !== undefined) __args["parentId"] = read.body["parentId"];

    if (read.body["path"] !== undefined) __args["path"] = read.body["path"];

    if (read.body["realmRoles"] !== undefined) __args["realmRoles"] = read.body["realmRoles"];

    if (read.body["subGroupCount"] !== undefined) __args["subGroupCount"] = read.body["subGroupCount"];

    if (read.body["subGroups"] !== undefined) __args["subGroups"] = read.body["subGroups"];

  }

  __args["description"] = "description_76964";

  let changed = updateGroupRepresentation(__args["access"], __args["attributes"], __args["briefRepresentation"], __args["clientRoles"], __args["description"], __args["exact"], __args["first"], __args["groupId"], __args["id"], __args["max"], __args["name"], __args["parentId"], __args["path"], __args["populateHierarchy"], __args["q"], __args["realm"], __args["realmRoles"], __args["search"], __args["subGroupCount"], __args["subGroups"], __args["subGroupsCount"], "P1:admin/realms/{realm}/groups:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"description",__args["description"])) { finish("update-failed"); return; }

  let deleted = deleteGroupRepresentation(__args["access"], __args["attributes"], __args["briefRepresentation"], __args["clientRoles"], __args["description"], __args["exact"], __args["first"], __args["groupId"], __args["id"], __args["max"], __args["name"], __args["parentId"], __args["path"], __args["populateHierarchy"], __args["q"], __args["realm"], __args["realmRoles"], __args["search"], __args["subGroupCount"], __args["subGroups"], __args["subGroupsCount"], "P1:admin/realms/{realm}/groups:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/identity-provider/instances:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/identity-provider/instances:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/identity-provider/instances:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getIdentityProviderRepresentation(step.data.values["addReadTokenRoleOnCreate"], step.data.values["alias"], step.data.values["authenticateByDefault"], step.data.values["briefRepresentation"], step.data.values["capability"], step.data.values["config"], step.data.values["displayName"], step.data.values["enabled"], step.data.values["first"], step.data.values["firstBrokerLoginFlowAlias"], step.data.values["hideOnLogin"], step.data.values["internalId"], step.data.values["linkOnly"], step.data.values["max"], step.data.values["organizationId"], step.data.values["postBrokerLoginFlowAlias"], step.data.values["providerId"], step.data.values["realm"], step.data.values["realmOnly"], step.data.values["search"], step.data.values["storeToken"], step.data.values["trustEmail"], step.data.values["type"], step.data.values["types"], step.data.values["updateProfileFirstLogin"], step.data.values["updateProfileFirstLoginMode"], "P1:admin/realms/{realm}/identity-provider/instances:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/identity-provider/instances:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/identity-provider/instances:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/identity-provider/instances",owner:"P1:admin/realms/{realm}/identity-provider/instances:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/identity-provider/instances:1",process:1,entity:"admin/realms/{realm}/identity-provider/instances",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/identity-provider/instances:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/identity-provider/instances:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/identity-provider/instances:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/identity-provider/instances:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["alias"] = "alias_55280";

  let created = createIdentityProviderRepresentation(__args["addReadTokenRoleOnCreate"], __args["alias"], __args["authenticateByDefault"], __args["briefRepresentation"], __args["capability"], __args["config"], __args["displayName"], __args["enabled"], __args["first"], __args["firstBrokerLoginFlowAlias"], __args["hideOnLogin"], __args["internalId"], __args["linkOnly"], __args["max"], __args["organizationId"], __args["postBrokerLoginFlowAlias"], __args["providerId"], __args["realm"], __args["realmOnly"], __args["search"], __args["storeToken"], __args["trustEmail"], __args["type"], __args["types"], __args["updateProfileFirstLogin"], __args["updateProfileFirstLoginMode"], "P1:admin/realms/{realm}/identity-provider/instances:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["alias"] === undefined || __args["alias"] === null) {

    let response = created.body;

    __args["alias"] = response && typeof response === "object" ?

      (response["alias"] === undefined ? response.__sbtObservedLocationId : response["alias"]) : undefined;

  }

  if (__args["alias"] === undefined || __args["alias"] === null) { finish("create-id-unresolved"); return; }

  let bound = getIdentityProviderRepresentation(__args["addReadTokenRoleOnCreate"], __args["alias"], __args["authenticateByDefault"], __args["briefRepresentation"], __args["capability"], __args["config"], __args["displayName"], __args["enabled"], __args["first"], __args["firstBrokerLoginFlowAlias"], __args["hideOnLogin"], __args["internalId"], __args["linkOnly"], __args["max"], __args["organizationId"], __args["postBrokerLoginFlowAlias"], __args["providerId"], __args["realm"], __args["realmOnly"], __args["search"], __args["storeToken"], __args["trustEmail"], __args["type"], __args["types"], __args["updateProfileFirstLogin"], __args["updateProfileFirstLoginMode"], "P1:admin/realms/{realm}/identity-provider/instances:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["alias"] !== undefined && bound.body["alias"] !== __args["alias"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/identity-provider/instances:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/identity-provider/instances:1:alias", __args["alias"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/identity-provider/instances",owner:"P1:admin/realms/{realm}/identity-provider/instances:1",values:Object.assign({},__args)})});

  let read = getIdentityProviderRepresentation(__args["addReadTokenRoleOnCreate"], __args["alias"], __args["authenticateByDefault"], __args["briefRepresentation"], __args["capability"], __args["config"], __args["displayName"], __args["enabled"], __args["first"], __args["firstBrokerLoginFlowAlias"], __args["hideOnLogin"], __args["internalId"], __args["linkOnly"], __args["max"], __args["organizationId"], __args["postBrokerLoginFlowAlias"], __args["providerId"], __args["realm"], __args["realmOnly"], __args["search"], __args["storeToken"], __args["trustEmail"], __args["type"], __args["types"], __args["updateProfileFirstLogin"], __args["updateProfileFirstLoginMode"], "P1:admin/realms/{realm}/identity-provider/instances:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["addReadTokenRoleOnCreate"] !== undefined) __args["addReadTokenRoleOnCreate"] = read.body["addReadTokenRoleOnCreate"];

    if (read.body["alias"] !== undefined) __args["alias"] = read.body["alias"];

    if (read.body["authenticateByDefault"] !== undefined) __args["authenticateByDefault"] = read.body["authenticateByDefault"];

    if (read.body["config"] !== undefined) __args["config"] = read.body["config"];

    if (read.body["displayName"] !== undefined) __args["displayName"] = read.body["displayName"];

    if (read.body["enabled"] !== undefined) __args["enabled"] = read.body["enabled"];

    if (read.body["firstBrokerLoginFlowAlias"] !== undefined) __args["firstBrokerLoginFlowAlias"] = read.body["firstBrokerLoginFlowAlias"];

    if (read.body["hideOnLogin"] !== undefined) __args["hideOnLogin"] = read.body["hideOnLogin"];

    if (read.body["internalId"] !== undefined) __args["internalId"] = read.body["internalId"];

    if (read.body["linkOnly"] !== undefined) __args["linkOnly"] = read.body["linkOnly"];

    if (read.body["organizationId"] !== undefined) __args["organizationId"] = read.body["organizationId"];

    if (read.body["postBrokerLoginFlowAlias"] !== undefined) __args["postBrokerLoginFlowAlias"] = read.body["postBrokerLoginFlowAlias"];

    if (read.body["providerId"] !== undefined) __args["providerId"] = read.body["providerId"];

    if (read.body["storeToken"] !== undefined) __args["storeToken"] = read.body["storeToken"];

    if (read.body["trustEmail"] !== undefined) __args["trustEmail"] = read.body["trustEmail"];

    if (read.body["types"] !== undefined) __args["types"] = read.body["types"];

    if (read.body["updateProfileFirstLogin"] !== undefined) __args["updateProfileFirstLogin"] = read.body["updateProfileFirstLogin"];

    if (read.body["updateProfileFirstLoginMode"] !== undefined) __args["updateProfileFirstLoginMode"] = read.body["updateProfileFirstLoginMode"];

  }

  __args["displayName"] = "displayName_89547";

  let changed = updateIdentityProviderRepresentation(__args["addReadTokenRoleOnCreate"], __args["alias"], __args["authenticateByDefault"], __args["briefRepresentation"], __args["capability"], __args["config"], __args["displayName"], __args["enabled"], __args["first"], __args["firstBrokerLoginFlowAlias"], __args["hideOnLogin"], __args["internalId"], __args["linkOnly"], __args["max"], __args["organizationId"], __args["postBrokerLoginFlowAlias"], __args["providerId"], __args["realm"], __args["realmOnly"], __args["search"], __args["storeToken"], __args["trustEmail"], __args["type"], __args["types"], __args["updateProfileFirstLogin"], __args["updateProfileFirstLoginMode"], "P1:admin/realms/{realm}/identity-provider/instances:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"displayName",__args["displayName"])) { finish("update-failed"); return; }

  while (!SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/identity-provider/instances:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/identity-provider/instances/{alias}/mappers";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/identity-provider/instances:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations/{org-id}/identity-providers";

    })});

  }

  let deleted = deleteIdentityProviderRepresentation(__args["addReadTokenRoleOnCreate"], __args["alias"], __args["authenticateByDefault"], __args["briefRepresentation"], __args["capability"], __args["config"], __args["displayName"], __args["enabled"], __args["first"], __args["firstBrokerLoginFlowAlias"], __args["hideOnLogin"], __args["internalId"], __args["linkOnly"], __args["max"], __args["organizationId"], __args["postBrokerLoginFlowAlias"], __args["providerId"], __args["realm"], __args["realmOnly"], __args["search"], __args["storeToken"], __args["trustEmail"], __args["type"], __args["types"], __args["updateProfileFirstLogin"], __args["updateProfileFirstLoginMode"], "P1:admin/realms/{realm}/identity-provider/instances:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [200].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/organizations:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/organizations:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/organizations:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getOrganizationRepresentation(step.data.values["alias"], step.data.values["attributes"], step.data.values["briefRepresentation"], step.data.values["description"], step.data.values["domains"], step.data.values["enabled"], step.data.values["exact"], step.data.values["first"], step.data.values["groups"], step.data.values["id"], step.data.values["identityProviders"], step.data.values["max"], step.data.values["members"], step.data.values["name"], step.data.values["orgId"], step.data.values["q"], step.data.values["realm"], step.data.values["redirectUrl"], step.data.values["search"], "P1:admin/realms/{realm}/organizations:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/organizations:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/organizations:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/organizations",owner:"P1:admin/realms/{realm}/organizations:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/organizations:1",process:1,entity:"admin/realms/{realm}/organizations",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/organizations:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/organizations:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/organizations:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/organizations:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["name"] = "name_91739";

  __args["alias"] = "alias_78163";

  let created = createOrganizationRepresentation(__args["alias"], __args["attributes"], __args["briefRepresentation"], __args["description"], __args["domains"], __args["enabled"], __args["exact"], __args["first"], __args["groups"], __args["id"], __args["identityProviders"], __args["max"], __args["members"], __args["name"], __args["orgId"], __args["q"], __args["realm"], __args["redirectUrl"], __args["search"], "P1:admin/realms/{realm}/organizations:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["orgId"] === undefined || __args["orgId"] === null) {

    let response = created.body;

    __args["orgId"] = response && typeof response === "object" ?

      (response["orgId"] === undefined ? response.__sbtObservedLocationId : response["orgId"]) : undefined;

  }

  if (__args["orgId"] === undefined || __args["orgId"] === null) { finish("create-id-unresolved"); return; }

  let bound = getOrganizationRepresentation(__args["alias"], __args["attributes"], __args["briefRepresentation"], __args["description"], __args["domains"], __args["enabled"], __args["exact"], __args["first"], __args["groups"], __args["id"], __args["identityProviders"], __args["max"], __args["members"], __args["name"], __args["orgId"], __args["q"], __args["realm"], __args["redirectUrl"], __args["search"], "P1:admin/realms/{realm}/organizations:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["orgId"] !== undefined && bound.body["orgId"] !== __args["orgId"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["orgId"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/organizations:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/organizations:1:orgId", __args["orgId"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/organizations",owner:"P1:admin/realms/{realm}/organizations:1",values:Object.assign({},__args)})});

  let read = getOrganizationRepresentation(__args["alias"], __args["attributes"], __args["briefRepresentation"], __args["description"], __args["domains"], __args["enabled"], __args["exact"], __args["first"], __args["groups"], __args["id"], __args["identityProviders"], __args["max"], __args["members"], __args["name"], __args["orgId"], __args["q"], __args["realm"], __args["redirectUrl"], __args["search"], "P1:admin/realms/{realm}/organizations:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["alias"] !== undefined) __args["alias"] = read.body["alias"];

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["description"] !== undefined) __args["description"] = read.body["description"];

    if (read.body["domains"] !== undefined) __args["domains"] = read.body["domains"];

    if (read.body["enabled"] !== undefined) __args["enabled"] = read.body["enabled"];

    if (read.body["groups"] !== undefined) __args["groups"] = read.body["groups"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["identityProviders"] !== undefined) __args["identityProviders"] = read.body["identityProviders"];

    if (read.body["members"] !== undefined) __args["members"] = read.body["members"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["redirectUrl"] !== undefined) __args["redirectUrl"] = read.body["redirectUrl"];

  }

  __args["description"] = "description_7221";

  let changed = updateOrganizationRepresentation(__args["alias"], __args["attributes"], __args["briefRepresentation"], __args["description"], __args["domains"], __args["enabled"], __args["exact"], __args["first"], __args["groups"], __args["id"], __args["identityProviders"], __args["max"], __args["members"], __args["name"], __args["orgId"], __args["q"], __args["realm"], __args["redirectUrl"], __args["search"], "P1:admin/realms/{realm}/organizations:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"description",__args["description"])) { finish("update-failed"); return; }

  while (!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/groups"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/groups"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/organizations:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations/{org-id}/groups";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/identity-providers"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/organizations:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations/{org-id}/identity-providers";

    })});

  }

  while (!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/organizations:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations/{org-id}/members";

    })});

  }

  let deleted = deleteOrganizationRepresentation(__args["alias"], __args["attributes"], __args["briefRepresentation"], __args["description"], __args["domains"], __args["enabled"], __args["exact"], __args["first"], __args["groups"], __args["id"], __args["identityProviders"], __args["max"], __args["members"], __args["name"], __args["orgId"], __args["q"], __args["realm"], __args["redirectUrl"], __args["search"], "P1:admin/realms/{realm}/organizations:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/roles:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/roles:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/roles:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getRoleRepresentation_2(step.data.values["attributes"], step.data.values["briefRepresentation"], step.data.values["clientRole"], step.data.values["composite"], step.data.values["composites"], step.data.values["containerId"], step.data.values["description"], step.data.values["first"], step.data.values["id"], step.data.values["max"], step.data.values["name"], step.data.values["realm"], step.data.values["roleName"], step.data.values["scopeParamRequired"], step.data.values["search"], "P1:admin/realms/{realm}/roles:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    if (ok && stage === "delete") {

      let gone = getRoleRepresentation_2(step.data.values["attributes"], step.data.values["briefRepresentation"], step.data.values["clientRole"], step.data.values["composite"], step.data.values["composites"], step.data.values["containerId"], step.data.values["description"], step.data.values["first"], step.data.values["id"], step.data.values["max"], step.data.values["name"], step.data.values["realm"], step.data.values["roleName"], step.data.values["scopeParamRequired"], step.data.values["search"], "P1:admin/realms/{realm}/roles:1" + ":verifier:delete");

      ok = !!gone && gone.code === 404;

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/roles:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/roles:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/roles",owner:"P1:admin/realms/{realm}/roles:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/roles:1",process:1,entity:"admin/realms/{realm}/roles",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/roles:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/roles:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/roles:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/roles:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["name"] = "name_48796";

  let created = createRoleRepresentation_2(__args["attributes"], __args["briefRepresentation"], __args["clientRole"], __args["composite"], __args["composites"], __args["containerId"], __args["description"], __args["first"], __args["id"], __args["max"], __args["name"], __args["realm"], __args["roleName"], __args["scopeParamRequired"], __args["search"], "P1:admin/realms/{realm}/roles:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["roleName"] === undefined || __args["roleName"] === null) {

    let response = created.body;

    __args["roleName"] = response && typeof response === "object" ?

      (response["roleName"] === undefined ? response.__sbtObservedLocationId : response["roleName"]) : undefined;

  }

  if (__args["roleName"] === undefined || __args["roleName"] === null) { finish("create-id-unresolved"); return; }

  let bound = getRoleRepresentation_2(__args["attributes"], __args["briefRepresentation"], __args["clientRole"], __args["composite"], __args["composites"], __args["containerId"], __args["description"], __args["first"], __args["id"], __args["max"], __args["name"], __args["realm"], __args["roleName"], __args["scopeParamRequired"], __args["search"], "P1:admin/realms/{realm}/roles:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["roleName"] !== undefined && bound.body["roleName"] !== __args["roleName"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/roles:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/roles:1:roleName", __args["roleName"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/roles",owner:"P1:admin/realms/{realm}/roles:1",values:Object.assign({},__args)})});

  let read = getRoleRepresentation_2(__args["attributes"], __args["briefRepresentation"], __args["clientRole"], __args["composite"], __args["composites"], __args["containerId"], __args["description"], __args["first"], __args["id"], __args["max"], __args["name"], __args["realm"], __args["roleName"], __args["scopeParamRequired"], __args["search"], "P1:admin/realms/{realm}/roles:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["clientRole"] !== undefined) __args["clientRole"] = read.body["clientRole"];

    if (read.body["composite"] !== undefined) __args["composite"] = read.body["composite"];

    if (read.body["composites"] !== undefined) __args["composites"] = read.body["composites"];

    if (read.body["containerId"] !== undefined) __args["containerId"] = read.body["containerId"];

    if (read.body["description"] !== undefined) __args["description"] = read.body["description"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["scopeParamRequired"] !== undefined) __args["scopeParamRequired"] = read.body["scopeParamRequired"];

  }

  __args["description"] = "description_451";

  let changed = updateRoleRepresentation_2(__args["attributes"], __args["briefRepresentation"], __args["clientRole"], __args["composite"], __args["composites"], __args["containerId"], __args["description"], __args["first"], __args["id"], __args["max"], __args["name"], __args["realm"], __args["roleName"], __args["scopeParamRequired"], __args["search"], "P1:admin/realms/{realm}/roles:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"description",__args["description"])) { finish("update-failed"); return; }

  let deleted = deleteRoleRepresentation_2(__args["attributes"], __args["briefRepresentation"], __args["clientRole"], __args["composite"], __args["composites"], __args["containerId"], __args["description"], __args["first"], __args["id"], __args["max"], __args["name"], __args["realm"], __args["roleName"], __args["scopeParamRequired"], __args["search"], "P1:admin/realms/{realm}/roles:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/users:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/users:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/users:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getUserRepresentation(step.data.values["access"], step.data.values["applicationRoles"], step.data.values["attributes"], step.data.values["briefRepresentation"], step.data.values["clientConsents"], step.data.values["clientRoles"], step.data.values["createdAfter"], step.data.values["createdBefore"], step.data.values["createdTimestamp"], step.data.values["credentials"], step.data.values["disableableCredentialTypes"], step.data.values["email"], step.data.values["emailVerified"], step.data.values["enabled"], step.data.values["exact"], step.data.values["federatedIdentities"], step.data.values["federationLink"], step.data.values["first"], step.data.values["firstName"], step.data.values["groups"], step.data.values["id"], step.data.values["idpAlias"], step.data.values["idpUserId"], step.data.values["issuedVerifiableCredentials"], step.data.values["lastName"], step.data.values["max"], step.data.values["notBefore"], step.data.values["origin"], step.data.values["q"], step.data.values["realm"], step.data.values["realmRoles"], step.data.values["requiredActions"], step.data.values["search"], step.data.values["self"], step.data.values["serviceAccountClientId"], step.data.values["socialLinks"], step.data.values["totp"], step.data.values["userId"], step.data.values["userProfileMetadata"], step.data.values["username"], step.data.values["verifiableCredentials"], "P1:admin/realms/{realm}/users:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/users:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("verify-lookup:P1:admin/realms/{realm}/users:1", function() {

  let e = sync({waitFor: EventSet("lookup-or-finish:P1:admin/realms/{realm}/users:1", function(x) {

    return x.data && x.data.owner === "P1:admin/realms/{realm}/users:1" && ((x.name === "SBT:CrudStep" && x.data.stage === "lookup") || x.name === "SBT:WorkerFinished");

  })});

  if (e.name === "SBT:CrudStep") {

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/users:1",stage:"lookup",ok:e.data.success})});

  }

});

bthread("crud:P1:admin/realms/{realm}/users:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/users",owner:"P1:admin/realms/{realm}/users:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/users:1",process:1,entity:"admin/realms/{realm}/users",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/users:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/users:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/users:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/users:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["username"] = "username_68602";

  let created = createUserRepresentation(__args["access"], __args["applicationRoles"], __args["attributes"], __args["briefRepresentation"], __args["clientConsents"], __args["clientRoles"], __args["createdAfter"], __args["createdBefore"], __args["createdTimestamp"], __args["credentials"], __args["disableableCredentialTypes"], __args["email"], __args["emailVerified"], __args["enabled"], __args["exact"], __args["federatedIdentities"], __args["federationLink"], __args["first"], __args["firstName"], __args["groups"], __args["id"], __args["idpAlias"], __args["idpUserId"], __args["issuedVerifiableCredentials"], __args["lastName"], __args["max"], __args["notBefore"], __args["origin"], __args["q"], __args["realm"], __args["realmRoles"], __args["requiredActions"], __args["search"], __args["self"], __args["serviceAccountClientId"], __args["socialLinks"], __args["totp"], __args["userId"], __args["userProfileMetadata"], __args["username"], __args["verifiableCredentials"], "P1:admin/realms/{realm}/users:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["userId"] === undefined || __args["userId"] === null) {

    let response = created.body;

    __args["userId"] = response && typeof response === "object" ?

      (response["userId"] === undefined ? response.__sbtObservedLocationId : response["userId"]) : undefined;

  }

  if (__args["userId"] === undefined || __args["userId"] === null) {

    let lookup = listUserRepresentations(__args["access"], __args["applicationRoles"], __args["attributes"], __args["briefRepresentation"], __args["clientConsents"], __args["clientRoles"], __args["createdAfter"], __args["createdBefore"], __args["createdTimestamp"], __args["credentials"], __args["disableableCredentialTypes"], __args["email"], __args["emailVerified"], __args["enabled"], true, __args["federatedIdentities"], __args["federationLink"], __args["first"], __args["firstName"], __args["groups"], __args["id"], __args["idpAlias"], __args["idpUserId"], __args["issuedVerifiableCredentials"], __args["lastName"], __args["max"], __args["notBefore"], __args["origin"], __args["q"], __args["realm"], __args["realmRoles"], __args["requiredActions"], __args["search"], __args["self"], __args["serviceAccountClientId"], __args["socialLinks"], __args["totp"], __args["userId"], __args["userProfileMetadata"], __args["username"], __args["verifiableCredentials"], "P1:admin/realms/{realm}/users:1" + ":lookup");

    let items = lookup && Array.isArray(lookup.body) ? lookup.body : [];

    let matches = items.filter(function(x) { return x && x["username"] === __args["username"]; });

    let lookupOk = !!lookup && [200].indexOf(lookup.code) >= 0 &&

      matches.length === 1 && matches[0].id !== undefined && matches[0].id !== null;

    if (!verified("lookup", lookup, lookupOk)) { finish("lookup-failed"); return; }

    __args["userId"] = matches[0].id;

  }

  if (__args["userId"] === undefined || __args["userId"] === null) { finish("create-id-unresolved"); return; }

  let bound = getUserRepresentation(__args["access"], __args["applicationRoles"], __args["attributes"], __args["briefRepresentation"], __args["clientConsents"], __args["clientRoles"], __args["createdAfter"], __args["createdBefore"], __args["createdTimestamp"], __args["credentials"], __args["disableableCredentialTypes"], __args["email"], __args["emailVerified"], __args["enabled"], __args["exact"], __args["federatedIdentities"], __args["federationLink"], __args["first"], __args["firstName"], __args["groups"], __args["id"], __args["idpAlias"], __args["idpUserId"], __args["issuedVerifiableCredentials"], __args["lastName"], __args["max"], __args["notBefore"], __args["origin"], __args["q"], __args["realm"], __args["realmRoles"], __args["requiredActions"], __args["search"], __args["self"], __args["serviceAccountClientId"], __args["socialLinks"], __args["totp"], __args["userId"], __args["userProfileMetadata"], __args["username"], __args["verifiableCredentials"], "P1:admin/realms/{realm}/users:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["userId"] !== undefined && bound.body["userId"] !== __args["userId"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["userId"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/users:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/users:1:userId", __args["userId"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/users",owner:"P1:admin/realms/{realm}/users:1",values:Object.assign({},__args)})});

  let read = getUserRepresentation(__args["access"], __args["applicationRoles"], __args["attributes"], __args["briefRepresentation"], __args["clientConsents"], __args["clientRoles"], __args["createdAfter"], __args["createdBefore"], __args["createdTimestamp"], __args["credentials"], __args["disableableCredentialTypes"], __args["email"], __args["emailVerified"], __args["enabled"], __args["exact"], __args["federatedIdentities"], __args["federationLink"], __args["first"], __args["firstName"], __args["groups"], __args["id"], __args["idpAlias"], __args["idpUserId"], __args["issuedVerifiableCredentials"], __args["lastName"], __args["max"], __args["notBefore"], __args["origin"], __args["q"], __args["realm"], __args["realmRoles"], __args["requiredActions"], __args["search"], __args["self"], __args["serviceAccountClientId"], __args["socialLinks"], __args["totp"], __args["userId"], __args["userProfileMetadata"], __args["username"], __args["verifiableCredentials"], "P1:admin/realms/{realm}/users:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["access"] !== undefined) __args["access"] = read.body["access"];

    if (read.body["applicationRoles"] !== undefined) __args["applicationRoles"] = read.body["applicationRoles"];

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["clientConsents"] !== undefined) __args["clientConsents"] = read.body["clientConsents"];

    if (read.body["clientRoles"] !== undefined) __args["clientRoles"] = read.body["clientRoles"];

    if (read.body["createdTimestamp"] !== undefined) __args["createdTimestamp"] = read.body["createdTimestamp"];

    if (read.body["credentials"] !== undefined) __args["credentials"] = read.body["credentials"];

    if (read.body["disableableCredentialTypes"] !== undefined) __args["disableableCredentialTypes"] = read.body["disableableCredentialTypes"];

    if (read.body["email"] !== undefined) __args["email"] = read.body["email"];

    if (read.body["emailVerified"] !== undefined) __args["emailVerified"] = read.body["emailVerified"];

    if (read.body["enabled"] !== undefined) __args["enabled"] = read.body["enabled"];

    if (read.body["federatedIdentities"] !== undefined) __args["federatedIdentities"] = read.body["federatedIdentities"];

    if (read.body["federationLink"] !== undefined) __args["federationLink"] = read.body["federationLink"];

    if (read.body["firstName"] !== undefined) __args["firstName"] = read.body["firstName"];

    if (read.body["groups"] !== undefined) __args["groups"] = read.body["groups"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["issuedVerifiableCredentials"] !== undefined) __args["issuedVerifiableCredentials"] = read.body["issuedVerifiableCredentials"];

    if (read.body["lastName"] !== undefined) __args["lastName"] = read.body["lastName"];

    if (read.body["notBefore"] !== undefined) __args["notBefore"] = read.body["notBefore"];

    if (read.body["origin"] !== undefined) __args["origin"] = read.body["origin"];

    if (read.body["realmRoles"] !== undefined) __args["realmRoles"] = read.body["realmRoles"];

    if (read.body["requiredActions"] !== undefined) __args["requiredActions"] = read.body["requiredActions"];

    if (read.body["self"] !== undefined) __args["self"] = read.body["self"];

    if (read.body["serviceAccountClientId"] !== undefined) __args["serviceAccountClientId"] = read.body["serviceAccountClientId"];

    if (read.body["socialLinks"] !== undefined) __args["socialLinks"] = read.body["socialLinks"];

    if (read.body["totp"] !== undefined) __args["totp"] = read.body["totp"];

    if (read.body["userProfileMetadata"] !== undefined) __args["userProfileMetadata"] = read.body["userProfileMetadata"];

    if (read.body["username"] !== undefined) __args["username"] = read.body["username"];

    if (read.body["verifiableCredentials"] !== undefined) __args["verifiableCredentials"] = read.body["verifiableCredentials"];

  }

  __args["firstName"] = "firstName_30562";

  let changed = updateUserRepresentation(__args["access"], __args["applicationRoles"], __args["attributes"], __args["briefRepresentation"], __args["clientConsents"], __args["clientRoles"], __args["createdAfter"], __args["createdBefore"], __args["createdTimestamp"], __args["credentials"], __args["disableableCredentialTypes"], __args["email"], __args["emailVerified"], __args["enabled"], __args["exact"], __args["federatedIdentities"], __args["federationLink"], __args["first"], __args["firstName"], __args["groups"], __args["id"], __args["idpAlias"], __args["idpUserId"], __args["issuedVerifiableCredentials"], __args["lastName"], __args["max"], __args["notBefore"], __args["origin"], __args["q"], __args["realm"], __args["realmRoles"], __args["requiredActions"], __args["search"], __args["self"], __args["serviceAccountClientId"], __args["socialLinks"], __args["totp"], __args["userId"], __args["userProfileMetadata"], __args["username"], __args["verifiableCredentials"], "P1:admin/realms/{realm}/users:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"firstName",__args["firstName"])) { finish("update-failed"); return; }

  while (!SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations/{org-id}/members"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/users:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations/{org-id}/members";

    })});

  }

  let deleted = deleteUserRepresentation(__args["access"], __args["applicationRoles"], __args["attributes"], __args["briefRepresentation"], __args["clientConsents"], __args["clientRoles"], __args["createdAfter"], __args["createdBefore"], __args["createdTimestamp"], __args["credentials"], __args["disableableCredentialTypes"], __args["email"], __args["emailVerified"], __args["enabled"], __args["exact"], __args["federatedIdentities"], __args["federationLink"], __args["first"], __args["firstName"], __args["groups"], __args["id"], __args["idpAlias"], __args["idpUserId"], __args["issuedVerifiableCredentials"], __args["lastName"], __args["max"], __args["notBefore"], __args["origin"], __args["q"], __args["realm"], __args["realmRoles"], __args["requiredActions"], __args["search"], __args["self"], __args["serviceAccountClientId"], __args["socialLinks"], __args["totp"], __args["userId"], __args["userProfileMetadata"], __args["username"], __args["verifiableCredentials"], "P1:admin/realms/{realm}/users:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/workflows:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/workflows:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/workflows:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getWorkflowRepresentation(step.data.values["cancelInProgress"], step.data.values["concurrency"], step.data.values["enabled"], step.data.values["exact"], step.data.values["first"], step.data.values["id"], step.data.values["if_"], step.data.values["includeId"], step.data.values["max"], step.data.values["name"], step.data.values["on"], step.data.values["realm"], step.data.values["restartInProgress"], step.data.values["schedule"], step.data.values["search"], step.data.values["state"], step.data.values["steps"], step.data.values["with_"], "P1:admin/realms/{realm}/workflows:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/workflows:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/workflows:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/workflows",owner:"P1:admin/realms/{realm}/workflows:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/workflows:1",process:1,entity:"admin/realms/{realm}/workflows",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/workflows:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/workflows:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/workflows:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/workflows:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["realm"] = __args["realm"];

  __args["name"] = "name_67438";

  let created = createWorkflowRepresentation(__args["cancelInProgress"], __args["concurrency"], __args["enabled"], __args["exact"], __args["first"], __args["id"], __args["if_"], __args["includeId"], __args["max"], __args["name"], __args["on"], __args["realm"], __args["restartInProgress"], __args["schedule"], __args["search"], __args["state"], __args["steps"], __args["with_"], "P1:admin/realms/{realm}/workflows:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["id"] === undefined || __args["id"] === null) {

    let response = created.body;

    __args["id"] = response && typeof response === "object" ?

      (response["id"] === undefined ? response.__sbtObservedLocationId : response["id"]) : undefined;

  }

  if (__args["id"] === undefined || __args["id"] === null) { finish("create-id-unresolved"); return; }

  let bound = getWorkflowRepresentation(__args["cancelInProgress"], __args["concurrency"], __args["enabled"], __args["exact"], __args["first"], __args["id"], __args["if_"], __args["includeId"], __args["max"], __args["name"], __args["on"], __args["realm"], __args["restartInProgress"], __args["schedule"], __args["search"], __args["state"], __args["steps"], __args["with_"], "P1:admin/realms/{realm}/workflows:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["id"] !== undefined && bound.body["id"] !== __args["id"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["id"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/workflows:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/workflows:1:id", __args["id"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/workflows",owner:"P1:admin/realms/{realm}/workflows:1",values:Object.assign({},__args)})});

  let read = getWorkflowRepresentation(__args["cancelInProgress"], __args["concurrency"], __args["enabled"], __args["exact"], __args["first"], __args["id"], __args["if_"], __args["includeId"], __args["max"], __args["name"], __args["on"], __args["realm"], __args["restartInProgress"], __args["schedule"], __args["search"], __args["state"], __args["steps"], __args["with_"], "P1:admin/realms/{realm}/workflows:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["cancelInProgress"] !== undefined) __args["cancelInProgress"] = read.body["cancelInProgress"];

    if (read.body["concurrency"] !== undefined) __args["concurrency"] = read.body["concurrency"];

    if (read.body["enabled"] !== undefined) __args["enabled"] = read.body["enabled"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["if"] !== undefined) __args["if"] = read.body["if"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["on"] !== undefined) __args["on"] = read.body["on"];

    if (read.body["restartInProgress"] !== undefined) __args["restartInProgress"] = read.body["restartInProgress"];

    if (read.body["schedule"] !== undefined) __args["schedule"] = read.body["schedule"];

    if (read.body["state"] !== undefined) __args["state"] = read.body["state"];

    if (read.body["steps"] !== undefined) __args["steps"] = read.body["steps"];

    if (read.body["with"] !== undefined) __args["with"] = read.body["with"];

  }

  __args["name"] = "name_87506";

  let changed = updateWorkflowRepresentation(__args["cancelInProgress"], __args["concurrency"], __args["enabled"], __args["exact"], __args["first"], __args["id"], __args["if_"], __args["includeId"], __args["max"], __args["name"], __args["on"], __args["realm"], __args["restartInProgress"], __args["schedule"], __args["search"], __args["state"], __args["steps"], __args["with_"], "P1:admin/realms/{realm}/workflows:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"name",__args["name"])) { finish("update-failed"); return; }

  let deleted = deleteWorkflowRepresentation(__args["cancelInProgress"], __args["concurrency"], __args["enabled"], __args["exact"], __args["first"], __args["id"], __args["if_"], __args["includeId"], __args["max"], __args["name"], __args["on"], __args["realm"], __args["restartInProgress"], __args["schedule"], __args["search"], __args["state"], __args["steps"], __args["with_"], "P1:admin/realms/{realm}/workflows:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/authentication/executions:1", function() {

  for (let stage of ["readback", "create", "read", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/authentication/executions:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/authentication/executions:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getAuthenticationExecutionRepresentation(step.data.values["authenticator"], step.data.values["authenticatorConfig"], step.data.values["authenticatorFlow"], step.data.values["autheticatorFlow"], step.data.values["executionId"], step.data.values["flowId"], step.data.values["id"], step.data.values["parentFlow"], step.data.values["priority"], step.data.values["realm"], step.data.values["requirement"], "P1:admin/realms/{realm}/authentication/executions:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/authentication/executions:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/authentication/executions:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/authentication/executions",owner:"P1:admin/realms/{realm}/authentication/executions:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/authentication/executions:1",process:1,entity:"admin/realms/{realm}/authentication/executions",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/authentication/executions:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/authentication/executions:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/authentication/flows"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/authentication/flows"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/flows"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/authentication/executions:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/authentication/flows";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/authentication/executions:1",type:"admin/realms/{realm}/authentication/flows",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/authentication/flows"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/authentication/flows"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/authentication/flows"].realm;

  }

  __args["flowId"] = __parentBindings["admin/realms/{realm}/authentication/flows"]["id"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/authentication/executions:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/authentication/executions:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["flowId"] = __args["flowId"];

  __args["realm"] = __args["realm"];

  let created = createAuthenticationExecutionRepresentation(__args["authenticator"], __args["authenticatorConfig"], __args["authenticatorFlow"], __args["autheticatorFlow"], __args["executionId"], __args["flowId"], __args["id"], __args["parentFlow"], __args["priority"], __args["realm"], __args["requirement"], "P1:admin/realms/{realm}/authentication/executions:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["executionId"] === undefined || __args["executionId"] === null) {

    let response = created.body;

    __args["executionId"] = response && typeof response === "object" ?

      (response["executionId"] === undefined ? response.__sbtObservedLocationId : response["executionId"]) : undefined;

  }

  if (__args["executionId"] === undefined || __args["executionId"] === null) { finish("create-id-unresolved"); return; }

  let bound = getAuthenticationExecutionRepresentation(__args["authenticator"], __args["authenticatorConfig"], __args["authenticatorFlow"], __args["autheticatorFlow"], __args["executionId"], __args["flowId"], __args["id"], __args["parentFlow"], __args["priority"], __args["realm"], __args["requirement"], "P1:admin/realms/{realm}/authentication/executions:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["executionId"] !== undefined && bound.body["executionId"] !== __args["executionId"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["executionId"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/authentication/executions:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/authentication/executions:1:executionId", __args["executionId"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/authentication/executions",owner:"P1:admin/realms/{realm}/authentication/executions:1",values:Object.assign({},__args)})});

  let read = getAuthenticationExecutionRepresentation(__args["authenticator"], __args["authenticatorConfig"], __args["authenticatorFlow"], __args["autheticatorFlow"], __args["executionId"], __args["flowId"], __args["id"], __args["parentFlow"], __args["priority"], __args["realm"], __args["requirement"], "P1:admin/realms/{realm}/authentication/executions:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  while (!SBT_FINISHED["1:admin/realms/{realm}/authentication/executions/{executionId}/config"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions/{executionId}/config"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/authentication/executions:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/authentication/executions/{executionId}/config";

    })});

  }

  let deleted = deleteAuthenticationExecutionRepresentation(__args["authenticator"], __args["authenticatorConfig"], __args["authenticatorFlow"], __args["autheticatorFlow"], __args["executionId"], __args["flowId"], __args["id"], __args["parentFlow"], __args["priority"], __args["realm"], __args["requirement"], "P1:admin/realms/{realm}/authentication/executions:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getProtocolMapperRepresentation(step.data.values["clientScopeId"], step.data.values["config"], step.data.values["consentRequired"], step.data.values["consentText"], step.data.values["id"], step.data.values["name"], step.data.values["protocol"], step.data.values["protocolMapper"], step.data.values["realm"], "P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",process:1,entity:"admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/client-scopes"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/client-scopes"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-scopes"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/client-scopes";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",type:"admin/realms/{realm}/client-scopes",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/client-scopes"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/client-scopes"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/client-scopes"].realm;

  }

  __args["clientScopeId"] = __parentBindings["admin/realms/{realm}/client-scopes"]["clientScopeId"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["clientScopeId"] = __args["clientScopeId"];

  __args["realm"] = __args["realm"];

  __args["name"] = "name_59871";

  let created = createProtocolMapperRepresentation(__args["clientScopeId"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["clientScopeId"] === undefined || __args["clientScopeId"] === null) {

    let response = created.body;

    __args["clientScopeId"] = response && typeof response === "object" ?

      (response["clientScopeId"] === undefined ? response.__sbtObservedLocationId : response["clientScopeId"]) : undefined;

  }

  if (__args["clientScopeId"] === undefined || __args["clientScopeId"] === null) { finish("create-id-unresolved"); return; }

  if (__args["id"] === undefined || __args["id"] === null) {

    let response = created.body;

    __args["id"] = response && typeof response === "object" ?

      (response["id"] === undefined ? response.__sbtObservedLocationId : response["id"]) : undefined;

  }

  if (__args["id"] === undefined || __args["id"] === null) { finish("create-id-unresolved"); return; }

  let bound = getProtocolMapperRepresentation(__args["clientScopeId"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["clientScopeId"] !== undefined && bound.body["clientScopeId"] !== __args["clientScopeId"]) { finish("create-id-mismatch"); return; }

    if (bound.body["id"] !== undefined && bound.body["id"] !== __args["id"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["id"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1:clientScopeId", __args["clientScopeId"]);

  rtv.doStore("P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1:id", __args["id"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1",values:Object.assign({},__args)})});

  let read = getProtocolMapperRepresentation(__args["clientScopeId"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["config"] !== undefined) __args["config"] = read.body["config"];

    if (read.body["consentRequired"] !== undefined) __args["consentRequired"] = read.body["consentRequired"];

    if (read.body["consentText"] !== undefined) __args["consentText"] = read.body["consentText"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["protocol"] !== undefined) __args["protocol"] = read.body["protocol"];

    if (read.body["protocolMapper"] !== undefined) __args["protocolMapper"] = read.body["protocolMapper"];

  }

  __args["consentText"] = "consentText_44623";

  let changed = updateProtocolMapperRepresentation(__args["clientScopeId"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"consentText",__args["consentText"])) { finish("update-failed"); return; }

  let deleted = deleteProtocolMapperRepresentation(__args["clientScopeId"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/client-scopes/{client-scope-id}/protocol-mappers/models:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/client-templates:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/client-templates:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/client-templates:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getClientScopeRepresentation_2(step.data.values["attributes"], step.data.values["clientScopeId"], step.data.values["description"], step.data.values["id"], step.data.values["name"], step.data.values["protocol"], step.data.values["protocolMappers"], step.data.values["realm"], "P1:admin/realms/{realm}/client-templates:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/client-templates:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/client-templates:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/client-templates",owner:"P1:admin/realms/{realm}/client-templates:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/client-templates:1",process:1,entity:"admin/realms/{realm}/client-templates",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/client-templates:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/client-templates:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/client-scopes"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/client-scopes"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-scopes"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/client-templates:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/client-scopes";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/client-templates:1",type:"admin/realms/{realm}/client-scopes",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/client-scopes"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/client-scopes"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/client-scopes"].realm;

  }

  __args["clientScopeId"] = __parentBindings["admin/realms/{realm}/client-scopes"]["clientScopeId"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/client-templates:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/client-templates:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["clientScopeId"] = __args["clientScopeId"];

  __args["realm"] = __args["realm"];

  __args["name"] = "name_10670";

  let created = createClientScopeRepresentation_2(__args["attributes"], __args["clientScopeId"], __args["description"], __args["id"], __args["name"], __args["protocol"], __args["protocolMappers"], __args["realm"], "P1:admin/realms/{realm}/client-templates:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["clientScopeId"] === undefined || __args["clientScopeId"] === null) {

    let response = created.body;

    __args["clientScopeId"] = response && typeof response === "object" ?

      (response["clientScopeId"] === undefined ? response.__sbtObservedLocationId : response["clientScopeId"]) : undefined;

  }

  if (__args["clientScopeId"] === undefined || __args["clientScopeId"] === null) { finish("create-id-unresolved"); return; }

  let bound = getClientScopeRepresentation_2(__args["attributes"], __args["clientScopeId"], __args["description"], __args["id"], __args["name"], __args["protocol"], __args["protocolMappers"], __args["realm"], "P1:admin/realms/{realm}/client-templates:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["clientScopeId"] !== undefined && bound.body["clientScopeId"] !== __args["clientScopeId"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["clientScopeId"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/client-templates:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/client-templates:1:clientScopeId", __args["clientScopeId"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/client-templates",owner:"P1:admin/realms/{realm}/client-templates:1",values:Object.assign({},__args)})});

  let read = getClientScopeRepresentation_2(__args["attributes"], __args["clientScopeId"], __args["description"], __args["id"], __args["name"], __args["protocol"], __args["protocolMappers"], __args["realm"], "P1:admin/realms/{realm}/client-templates:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["description"] !== undefined) __args["description"] = read.body["description"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["protocol"] !== undefined) __args["protocol"] = read.body["protocol"];

    if (read.body["protocolMappers"] !== undefined) __args["protocolMappers"] = read.body["protocolMappers"];

  }

  __args["description"] = "description_59840";

  let changed = updateClientScopeRepresentation_2(__args["attributes"], __args["clientScopeId"], __args["description"], __args["id"], __args["name"], __args["protocol"], __args["protocolMappers"], __args["realm"], "P1:admin/realms/{realm}/client-templates:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"description",__args["description"])) { finish("update-failed"); return; }

  while (!SBT_FINISHED["1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models"] || Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models"]).length < 1) {

    sync({waitFor: EventSet("child:P1:admin/realms/{realm}/client-templates:1", function(e) {

      return e.name === "SBT:WorkerFinished" && e.data.process === 1 && e.data.entity === "admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models";

    })});

  }

  let deleted = deleteClientScopeRepresentation_2(__args["attributes"], __args["clientScopeId"], __args["description"], __args["id"], __args["name"], __args["protocol"], __args["protocolMappers"], __args["realm"], "P1:admin/realms/{realm}/client-templates:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getResourceRepresentation(step.data.values["id"], step.data.values["attributes"], step.data.values["clientUuid"], step.data.values["deep"], step.data.values["displayName"], step.data.values["exactName"], step.data.values["first"], step.data.values["iconUri"], step.data.values["matchingUri"], step.data.values["max"], step.data.values["name"], step.data.values["owner"], step.data.values["ownerManagedAccess"], step.data.values["realm"], step.data.values["resourceId"], step.data.values["scope"], step.data.values["scopes"], step.data.values["scopesUma"], step.data.values["type"], step.data.values["uri"], step.data.values["uris"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    if (ok && stage === "delete") {

      let gone = getResourceRepresentation(step.data.values["id"], step.data.values["attributes"], step.data.values["clientUuid"], step.data.values["deep"], step.data.values["displayName"], step.data.values["exactName"], step.data.values["first"], step.data.values["iconUri"], step.data.values["matchingUri"], step.data.values["max"], step.data.values["name"], step.data.values["owner"], step.data.values["ownerManagedAccess"], step.data.values["realm"], step.data.values["resourceId"], step.data.values["scope"], step.data.values["scopes"], step.data.values["scopesUma"], step.data.values["type"], step.data.values["uri"], step.data.values["uris"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" + ":verifier:delete");

      ok = !!gone && gone.code === 404;

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("verify-lookup:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function() {

  let e = sync({waitFor: EventSet("lookup-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function(x) {

    return x.data && x.data.owner === "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" && ((x.name === "SBT:CrudStep" && x.data.stage === "lookup") || x.name === "SBT:WorkerFinished");

  })});

  if (e.name === "SBT:CrudStep") {

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",stage:"lookup",ok:e.data.success})});

  }

});

bthread("crud:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/clients"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/clients"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",type:"admin/realms/{realm}/clients",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/clients"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/clients"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/clients"].realm;

  }

  __args["clientUuid"] = __parentBindings["admin/realms/{realm}/clients"]["clientUuid"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["clientUuid"] = __args["clientUuid"];

  __args["realm"] = __args["realm"];

  __args["name"] = "name_4316";

  let created = createResourceRepresentation(__args["id"], __args["attributes"], __args["clientUuid"], __args["deep"], __args["displayName"], __args["exactName"], __args["first"], __args["iconUri"], __args["matchingUri"], __args["max"], __args["name"], __args["owner"], __args["ownerManagedAccess"], __args["realm"], __args["resourceId"], __args["scope"], __args["scopes"], __args["scopesUma"], __args["type"], __args["uri"], __args["uris"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["clientUuid"] === undefined || __args["clientUuid"] === null) {

    let response = created.body;

    __args["clientUuid"] = response && typeof response === "object" ?

      (response["clientUuid"] === undefined ? response.__sbtObservedLocationId : response["clientUuid"]) : undefined;

  }

  if (__args["clientUuid"] === undefined || __args["clientUuid"] === null) { finish("create-id-unresolved"); return; }

  if (__args["resourceId"] === undefined || __args["resourceId"] === null) {

    let response = created.body;

    __args["resourceId"] = response && typeof response === "object" ?

      (response["resourceId"] === undefined ? response.__sbtObservedLocationId : response["resourceId"]) : undefined;

  }

  if (__args["resourceId"] === undefined || __args["resourceId"] === null) {

    let lookup = listResourceRepresentations(__args["id"], __args["attributes"], __args["clientUuid"], __args["deep"], __args["displayName"], __args["exactName"], __args["first"], __args["iconUri"], __args["matchingUri"], __args["max"], __args["name"], __args["owner"], __args["ownerManagedAccess"], __args["realm"], __args["resourceId"], __args["scope"], __args["scopes"], __args["scopesUma"], __args["type"], __args["uri"], __args["uris"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" + ":lookup");

    let items = lookup && Array.isArray(lookup.body) ? lookup.body : [];

    let matches = items.filter(function(x) { return x && x["name"] === __args["name"]; });

    let lookupOk = !!lookup && [200].indexOf(lookup.code) >= 0 &&

      matches.length === 1 && matches[0].id !== undefined && matches[0].id !== null;

    if (!verified("lookup", lookup, lookupOk)) { finish("lookup-failed"); return; }

    __args["resourceId"] = matches[0].id;

  }

  if (__args["resourceId"] === undefined || __args["resourceId"] === null) { finish("create-id-unresolved"); return; }

  let bound = getResourceRepresentation(__args["id"], __args["attributes"], __args["clientUuid"], __args["deep"], __args["displayName"], __args["exactName"], __args["first"], __args["iconUri"], __args["matchingUri"], __args["max"], __args["name"], __args["owner"], __args["ownerManagedAccess"], __args["realm"], __args["resourceId"], __args["scope"], __args["scopes"], __args["scopesUma"], __args["type"], __args["uri"], __args["uris"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["clientUuid"] !== undefined && bound.body["clientUuid"] !== __args["clientUuid"]) { finish("create-id-mismatch"); return; }

    if (bound.body["resourceId"] !== undefined && bound.body["resourceId"] !== __args["resourceId"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["resourceId"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1:clientUuid", __args["clientUuid"]);

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1:resourceId", __args["resourceId"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1",values:Object.assign({},__args)})});

  let read = getResourceRepresentation(__args["id"], __args["attributes"], __args["clientUuid"], __args["deep"], __args["displayName"], __args["exactName"], __args["first"], __args["iconUri"], __args["matchingUri"], __args["max"], __args["name"], __args["owner"], __args["ownerManagedAccess"], __args["realm"], __args["resourceId"], __args["scope"], __args["scopes"], __args["scopesUma"], __args["type"], __args["uri"], __args["uris"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["_id"] !== undefined) __args["_id"] = read.body["_id"];

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["displayName"] !== undefined) __args["displayName"] = read.body["displayName"];

    if (read.body["icon_uri"] !== undefined) __args["icon_uri"] = read.body["icon_uri"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["ownerManagedAccess"] !== undefined) __args["ownerManagedAccess"] = read.body["ownerManagedAccess"];

    if (read.body["scopes"] !== undefined) __args["scopes"] = read.body["scopes"];

    if (read.body["scopesUma"] !== undefined) __args["scopesUma"] = read.body["scopesUma"];

    if (read.body["type"] !== undefined) __args["type"] = read.body["type"];

    if (read.body["uri"] !== undefined) __args["uri"] = read.body["uri"];

    if (read.body["uris"] !== undefined) __args["uris"] = read.body["uris"];

  }

  __args["displayName"] = "displayName_58762";

  let changed = updateResourceRepresentation(__args["id"], __args["attributes"], __args["clientUuid"], __args["deep"], __args["displayName"], __args["exactName"], __args["first"], __args["iconUri"], __args["matchingUri"], __args["max"], __args["name"], __args["owner"], __args["ownerManagedAccess"], __args["realm"], __args["resourceId"], __args["scope"], __args["scopes"], __args["scopesUma"], __args["type"], __args["uri"], __args["uris"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"displayName",__args["displayName"])) { finish("update-failed"); return; }

  let deleted = deleteResourceRepresentation(__args["id"], __args["attributes"], __args["clientUuid"], __args["deep"], __args["displayName"], __args["exactName"], __args["first"], __args["iconUri"], __args["matchingUri"], __args["max"], __args["name"], __args["owner"], __args["ownerManagedAccess"], __args["realm"], __args["resourceId"], __args["scope"], __args["scopes"], __args["scopesUma"], __args["type"], __args["uri"], __args["uris"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/resource:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getScopeRepresentation(step.data.values["clientUuid"], step.data.values["displayName"], step.data.values["first"], step.data.values["iconUri"], step.data.values["id"], step.data.values["max"], step.data.values["name"], step.data.values["policies"], step.data.values["realm"], step.data.values["resources"], step.data.values["scopeId"], step.data.values["scopeId"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    if (ok && stage === "delete") {

      let gone = getScopeRepresentation(step.data.values["clientUuid"], step.data.values["displayName"], step.data.values["first"], step.data.values["iconUri"], step.data.values["id"], step.data.values["max"], step.data.values["name"], step.data.values["policies"], step.data.values["realm"], step.data.values["resources"], step.data.values["scopeId"], step.data.values["scopeId"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" + ":verifier:delete");

      ok = !!gone && gone.code === 404;

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("verify-lookup:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function() {

  let e = sync({waitFor: EventSet("lookup-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function(x) {

    return x.data && x.data.owner === "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" && ((x.name === "SBT:CrudStep" && x.data.stage === "lookup") || x.name === "SBT:WorkerFinished");

  })});

  if (e.name === "SBT:CrudStep") {

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",stage:"lookup",ok:e.data.success})});

  }

});

bthread("crud:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/clients"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/clients"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",type:"admin/realms/{realm}/clients",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/clients"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/clients"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/clients"].realm;

  }

  __args["clientUuid"] = __parentBindings["admin/realms/{realm}/clients"]["clientUuid"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["clientUuid"] = __args["clientUuid"];

  __args["realm"] = __args["realm"];

  __args["name"] = "name_91868";

  let created = createScopeRepresentation(__args["clientUuid"], __args["displayName"], __args["first"], __args["iconUri"], __args["id"], __args["max"], __args["name"], __args["policies"], __args["realm"], __args["resources"], __args["scopeId"], __args["scopeId"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" + ":create");

  if (!created || [200].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["clientUuid"] === undefined || __args["clientUuid"] === null) {

    let response = created.body;

    __args["clientUuid"] = response && typeof response === "object" ?

      (response["clientUuid"] === undefined ? response.__sbtObservedLocationId : response["clientUuid"]) : undefined;

  }

  if (__args["clientUuid"] === undefined || __args["clientUuid"] === null) { finish("create-id-unresolved"); return; }

  if (__args["scopeId"] === undefined || __args["scopeId"] === null) {

    let response = created.body;

    __args["scopeId"] = response && typeof response === "object" ?

      (response["scopeId"] === undefined ? response.__sbtObservedLocationId : response["scopeId"]) : undefined;

  }

  if (__args["scopeId"] === undefined || __args["scopeId"] === null) {

    let lookup = listScopeRepresentations(__args["clientUuid"], __args["displayName"], __args["first"], __args["iconUri"], __args["id"], __args["max"], __args["name"], __args["policies"], __args["realm"], __args["resources"], __args["scopeId"], __args["scopeId"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" + ":lookup");

    let items = lookup && Array.isArray(lookup.body) ? lookup.body : [];

    let matches = items.filter(function(x) { return x && x["name"] === __args["name"]; });

    let lookupOk = !!lookup && [200].indexOf(lookup.code) >= 0 &&

      matches.length === 1 && matches[0].id !== undefined && matches[0].id !== null;

    if (!verified("lookup", lookup, lookupOk)) { finish("lookup-failed"); return; }

    __args["scopeId"] = matches[0].id;

  }

  if (__args["scopeId"] === undefined || __args["scopeId"] === null) { finish("create-id-unresolved"); return; }

  let bound = getScopeRepresentation(__args["clientUuid"], __args["displayName"], __args["first"], __args["iconUri"], __args["id"], __args["max"], __args["name"], __args["policies"], __args["realm"], __args["resources"], __args["scopeId"], __args["scopeId"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["clientUuid"] !== undefined && bound.body["clientUuid"] !== __args["clientUuid"]) { finish("create-id-mismatch"); return; }

    if (bound.body["scopeId"] !== undefined && bound.body["scopeId"] !== __args["scopeId"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["scopeId"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1:clientUuid", __args["clientUuid"]);

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1:scopeId", __args["scopeId"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1",values:Object.assign({},__args)})});

  let read = getScopeRepresentation(__args["clientUuid"], __args["displayName"], __args["first"], __args["iconUri"], __args["id"], __args["max"], __args["name"], __args["policies"], __args["realm"], __args["resources"], __args["scopeId"], __args["scopeId"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["displayName"] !== undefined) __args["displayName"] = read.body["displayName"];

    if (read.body["iconUri"] !== undefined) __args["iconUri"] = read.body["iconUri"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["policies"] !== undefined) __args["policies"] = read.body["policies"];

    if (read.body["resources"] !== undefined) __args["resources"] = read.body["resources"];

  }

  __args["displayName"] = "displayName_28829";

  let changed = updateScopeRepresentation(__args["clientUuid"], __args["displayName"], __args["first"], __args["iconUri"], __args["id"], __args["max"], __args["name"], __args["policies"], __args["realm"], __args["resources"], __args["scopeId"], __args["scopeId"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" + ":update");

  if (!verified("update", changed, !!changed && [200].indexOf(changed.code) >= 0,"displayName",__args["displayName"])) { finish("update-failed"); return; }

  let deleted = deleteScopeRepresentation(__args["clientUuid"], __args["displayName"], __args["first"], __args["iconUri"], __args["id"], __args["max"], __args["name"], __args["policies"], __args["realm"], __args["resources"], __args["scopeId"], __args["scopeId"], "P1:admin/realms/{realm}/clients/{client-uuid}/authz/resource-server/scope:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [200].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getProtocolMapperRepresentation_3(step.data.values["clientUuid"], step.data.values["config"], step.data.values["consentRequired"], step.data.values["consentText"], step.data.values["id"], step.data.values["name"], step.data.values["protocol"], step.data.values["protocolMapper"], step.data.values["realm"], "P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/clients"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/clients"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",type:"admin/realms/{realm}/clients",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/clients"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/clients"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/clients"].realm;

  }

  __args["clientUuid"] = __parentBindings["admin/realms/{realm}/clients"]["clientUuid"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["clientUuid"] = __args["clientUuid"];

  __args["realm"] = __args["realm"];

  __args["name"] = "name_30261";

  let created = createProtocolMapperRepresentation_3(__args["clientUuid"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["clientUuid"] === undefined || __args["clientUuid"] === null) {

    let response = created.body;

    __args["clientUuid"] = response && typeof response === "object" ?

      (response["clientUuid"] === undefined ? response.__sbtObservedLocationId : response["clientUuid"]) : undefined;

  }

  if (__args["clientUuid"] === undefined || __args["clientUuid"] === null) { finish("create-id-unresolved"); return; }

  if (__args["id"] === undefined || __args["id"] === null) {

    let response = created.body;

    __args["id"] = response && typeof response === "object" ?

      (response["id"] === undefined ? response.__sbtObservedLocationId : response["id"]) : undefined;

  }

  if (__args["id"] === undefined || __args["id"] === null) { finish("create-id-unresolved"); return; }

  let bound = getProtocolMapperRepresentation_3(__args["clientUuid"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["clientUuid"] !== undefined && bound.body["clientUuid"] !== __args["clientUuid"]) { finish("create-id-mismatch"); return; }

    if (bound.body["id"] !== undefined && bound.body["id"] !== __args["id"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["id"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1:clientUuid", __args["clientUuid"]);

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1:id", __args["id"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1",values:Object.assign({},__args)})});

  let read = getProtocolMapperRepresentation_3(__args["clientUuid"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["config"] !== undefined) __args["config"] = read.body["config"];

    if (read.body["consentRequired"] !== undefined) __args["consentRequired"] = read.body["consentRequired"];

    if (read.body["consentText"] !== undefined) __args["consentText"] = read.body["consentText"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["protocol"] !== undefined) __args["protocol"] = read.body["protocol"];

    if (read.body["protocolMapper"] !== undefined) __args["protocolMapper"] = read.body["protocolMapper"];

  }

  __args["consentText"] = "consentText_57867";

  let changed = updateProtocolMapperRepresentation_3(__args["clientUuid"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"consentText",__args["consentText"])) { finish("update-failed"); return; }

  let deleted = deleteProtocolMapperRepresentation_3(__args["clientUuid"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/clients/{client-uuid}/protocol-mappers/models:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getRoleRepresentation(step.data.values["attributes"], step.data.values["briefRepresentation"], step.data.values["clientUuid"], step.data.values["clientRole"], step.data.values["composite"], step.data.values["composites"], step.data.values["containerId"], step.data.values["description"], step.data.values["first"], step.data.values["id"], step.data.values["max"], step.data.values["name"], step.data.values["realm"], step.data.values["roleName"], step.data.values["scopeParamRequired"], step.data.values["search"], "P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    if (ok && stage === "delete") {

      let gone = getRoleRepresentation(step.data.values["attributes"], step.data.values["briefRepresentation"], step.data.values["clientUuid"], step.data.values["clientRole"], step.data.values["composite"], step.data.values["composites"], step.data.values["containerId"], step.data.values["description"], step.data.values["first"], step.data.values["id"], step.data.values["max"], step.data.values["name"], step.data.values["realm"], step.data.values["roleName"], step.data.values["scopeParamRequired"], step.data.values["search"], "P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" + ":verifier:delete");

      ok = !!gone && gone.code === 404;

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/roles",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/roles",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/clients"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/clients"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/clients"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/clients";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",type:"admin/realms/{realm}/clients",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/clients"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/clients"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/clients"].realm;

  }

  __args["clientUuid"] = __parentBindings["admin/realms/{realm}/clients"]["clientUuid"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/clients/{client-uuid}/roles:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["clientUuid"] = __args["clientUuid"];

  __args["realm"] = __args["realm"];

  __args["name"] = "name_95449";

  let created = createRoleRepresentation(__args["attributes"], __args["briefRepresentation"], __args["clientUuid"], __args["clientRole"], __args["composite"], __args["composites"], __args["containerId"], __args["description"], __args["first"], __args["id"], __args["max"], __args["name"], __args["realm"], __args["roleName"], __args["scopeParamRequired"], __args["search"], "P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["clientUuid"] === undefined || __args["clientUuid"] === null) {

    let response = created.body;

    __args["clientUuid"] = response && typeof response === "object" ?

      (response["clientUuid"] === undefined ? response.__sbtObservedLocationId : response["clientUuid"]) : undefined;

  }

  if (__args["clientUuid"] === undefined || __args["clientUuid"] === null) { finish("create-id-unresolved"); return; }

  if (__args["roleName"] === undefined || __args["roleName"] === null) {

    let response = created.body;

    __args["roleName"] = response && typeof response === "object" ?

      (response["roleName"] === undefined ? response.__sbtObservedLocationId : response["roleName"]) : undefined;

  }

  if (__args["roleName"] === undefined || __args["roleName"] === null) { finish("create-id-unresolved"); return; }

  let bound = getRoleRepresentation(__args["attributes"], __args["briefRepresentation"], __args["clientUuid"], __args["clientRole"], __args["composite"], __args["composites"], __args["containerId"], __args["description"], __args["first"], __args["id"], __args["max"], __args["name"], __args["realm"], __args["roleName"], __args["scopeParamRequired"], __args["search"], "P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["clientUuid"] !== undefined && bound.body["clientUuid"] !== __args["clientUuid"]) { finish("create-id-mismatch"); return; }

    if (bound.body["roleName"] !== undefined && bound.body["roleName"] !== __args["roleName"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/roles:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/roles:1:clientUuid", __args["clientUuid"]);

  rtv.doStore("P1:admin/realms/{realm}/clients/{client-uuid}/roles:1:roleName", __args["roleName"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/clients/{client-uuid}/roles",owner:"P1:admin/realms/{realm}/clients/{client-uuid}/roles:1",values:Object.assign({},__args)})});

  let read = getRoleRepresentation(__args["attributes"], __args["briefRepresentation"], __args["clientUuid"], __args["clientRole"], __args["composite"], __args["composites"], __args["containerId"], __args["description"], __args["first"], __args["id"], __args["max"], __args["name"], __args["realm"], __args["roleName"], __args["scopeParamRequired"], __args["search"], "P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["clientRole"] !== undefined) __args["clientRole"] = read.body["clientRole"];

    if (read.body["composite"] !== undefined) __args["composite"] = read.body["composite"];

    if (read.body["composites"] !== undefined) __args["composites"] = read.body["composites"];

    if (read.body["containerId"] !== undefined) __args["containerId"] = read.body["containerId"];

    if (read.body["description"] !== undefined) __args["description"] = read.body["description"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["scopeParamRequired"] !== undefined) __args["scopeParamRequired"] = read.body["scopeParamRequired"];

  }

  __args["description"] = "description_48575";

  let changed = updateRoleRepresentation(__args["attributes"], __args["briefRepresentation"], __args["clientUuid"], __args["clientRole"], __args["composite"], __args["composites"], __args["containerId"], __args["description"], __args["first"], __args["id"], __args["max"], __args["name"], __args["realm"], __args["roleName"], __args["scopeParamRequired"], __args["search"], "P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"description",__args["description"])) { finish("update-failed"); return; }

  let deleted = deleteRoleRepresentation(__args["attributes"], __args["briefRepresentation"], __args["clientUuid"], __args["clientRole"], __args["composite"], __args["composites"], __args["containerId"], __args["description"], __args["first"], __args["id"], __args["max"], __args["name"], __args["realm"], __args["roleName"], __args["scopeParamRequired"], __args["search"], "P1:admin/realms/{realm}/clients/{client-uuid}/roles:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getIdentityProviderMapperRepresentation(step.data.values["alias"], step.data.values["config"], step.data.values["id"], step.data.values["identityProviderAlias"], step.data.values["identityProviderMapper"], step.data.values["name"], step.data.values["realm"], "P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/identity-provider/instances/{alias}/mappers",owner:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",process:1,entity:"admin/realms/{realm}/identity-provider/instances/{alias}/mappers",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/identity-provider/instances"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/identity-provider/instances";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",type:"admin/realms/{realm}/identity-provider/instances",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/identity-provider/instances"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/identity-provider/instances"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/identity-provider/instances"].realm;

  }

  __args["alias"] = __parentBindings["admin/realms/{realm}/identity-provider/instances"]["alias"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["alias"] = __args["alias"];

  __args["realm"] = __args["realm"];

  __args["name"] = "name_39888";

  let created = createIdentityProviderMapperRepresentation(__args["alias"], __args["config"], __args["id"], __args["identityProviderAlias"], __args["identityProviderMapper"], __args["name"], __args["realm"], "P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1" + ":create");

  if (!created || [200].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["alias"] === undefined || __args["alias"] === null) {

    let response = created.body;

    __args["alias"] = response && typeof response === "object" ?

      (response["alias"] === undefined ? response.__sbtObservedLocationId : response["alias"]) : undefined;

  }

  if (__args["alias"] === undefined || __args["alias"] === null) { finish("create-id-unresolved"); return; }

  if (__args["id"] === undefined || __args["id"] === null) {

    let response = created.body;

    __args["id"] = response && typeof response === "object" ?

      (response["id"] === undefined ? response.__sbtObservedLocationId : response["id"]) : undefined;

  }

  if (__args["id"] === undefined || __args["id"] === null) { finish("create-id-unresolved"); return; }

  let bound = getIdentityProviderMapperRepresentation(__args["alias"], __args["config"], __args["id"], __args["identityProviderAlias"], __args["identityProviderMapper"], __args["name"], __args["realm"], "P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["alias"] !== undefined && bound.body["alias"] !== __args["alias"]) { finish("create-id-mismatch"); return; }

    if (bound.body["id"] !== undefined && bound.body["id"] !== __args["id"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["id"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1:alias", __args["alias"]);

  rtv.doStore("P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1:id", __args["id"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/identity-provider/instances/{alias}/mappers",owner:"P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1",values:Object.assign({},__args)})});

  let read = getIdentityProviderMapperRepresentation(__args["alias"], __args["config"], __args["id"], __args["identityProviderAlias"], __args["identityProviderMapper"], __args["name"], __args["realm"], "P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["config"] !== undefined) __args["config"] = read.body["config"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["identityProviderAlias"] !== undefined) __args["identityProviderAlias"] = read.body["identityProviderAlias"];

    if (read.body["identityProviderMapper"] !== undefined) __args["identityProviderMapper"] = read.body["identityProviderMapper"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

  }

  __args["name"] = "name_21726";

  let changed = updateIdentityProviderMapperRepresentation(__args["alias"], __args["config"], __args["id"], __args["identityProviderAlias"], __args["identityProviderMapper"], __args["name"], __args["realm"], "P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"name",__args["name"])) { finish("update-failed"); return; }

  let deleted = deleteIdentityProviderMapperRepresentation(__args["alias"], __args["config"], __args["id"], __args["identityProviderAlias"], __args["identityProviderMapper"], __args["name"], __args["realm"], "P1:admin/realms/{realm}/identity-provider/instances/{alias}/mappers:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/organizations/{org-id}/groups:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/organizations/{org-id}/groups:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/organizations/{org-id}/groups:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getGroupRepresentation_2(step.data.values["access"], step.data.values["attributes"], step.data.values["briefRepresentation"], step.data.values["clientRoles"], step.data.values["description"], step.data.values["exact"], step.data.values["first"], step.data.values["groupId"], step.data.values["id"], step.data.values["max"], step.data.values["name"], step.data.values["orgId"], step.data.values["parentId"], step.data.values["path"], step.data.values["populateHierarchy"], step.data.values["q"], step.data.values["realm"], step.data.values["realmRoles"], step.data.values["search"], step.data.values["subGroupCount"], step.data.values["subGroups"], step.data.values["subGroupsCount"], "P1:admin/realms/{realm}/organizations/{org-id}/groups:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/organizations/{org-id}/groups:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/organizations/{org-id}/groups",owner:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",process:1,entity:"admin/realms/{realm}/organizations/{org-id}/groups",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/organizations/{org-id}/groups:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/organizations/{org-id}/groups:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/organizations"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/organizations"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/groups:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",type:"admin/realms/{realm}/organizations",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/organizations"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/organizations"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/organizations"].realm;

  }

  __args["orgId"] = __parentBindings["admin/realms/{realm}/organizations"]["orgId"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/groups:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["orgId"] = __args["orgId"];

  __args["realm"] = __args["realm"];

  __args["name"] = "name_32235";

  let created = createGroupRepresentation_2(__args["access"], __args["attributes"], __args["briefRepresentation"], __args["clientRoles"], __args["description"], __args["exact"], __args["first"], __args["groupId"], __args["id"], __args["max"], __args["name"], __args["orgId"], __args["parentId"], __args["path"], __args["populateHierarchy"], __args["q"], __args["realm"], __args["realmRoles"], __args["search"], __args["subGroupCount"], __args["subGroups"], __args["subGroupsCount"], "P1:admin/realms/{realm}/organizations/{org-id}/groups:1" + ":create");

  if (!created || [201, 204].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["orgId"] === undefined || __args["orgId"] === null) {

    let response = created.body;

    __args["orgId"] = response && typeof response === "object" ?

      (response["orgId"] === undefined ? response.__sbtObservedLocationId : response["orgId"]) : undefined;

  }

  if (__args["orgId"] === undefined || __args["orgId"] === null) { finish("create-id-unresolved"); return; }

  if (__args["groupId"] === undefined || __args["groupId"] === null) {

    let response = created.body;

    __args["groupId"] = response && typeof response === "object" ?

      (response["groupId"] === undefined ? response.__sbtObservedLocationId : response["groupId"]) : undefined;

  }

  if (__args["groupId"] === undefined || __args["groupId"] === null) { finish("create-id-unresolved"); return; }

  let bound = getGroupRepresentation_2(__args["access"], __args["attributes"], __args["briefRepresentation"], __args["clientRoles"], __args["description"], __args["exact"], __args["first"], __args["groupId"], __args["id"], __args["max"], __args["name"], __args["orgId"], __args["parentId"], __args["path"], __args["populateHierarchy"], __args["q"], __args["realm"], __args["realmRoles"], __args["search"], __args["subGroupCount"], __args["subGroups"], __args["subGroupsCount"], "P1:admin/realms/{realm}/organizations/{org-id}/groups:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["orgId"] !== undefined && bound.body["orgId"] !== __args["orgId"]) { finish("create-id-mismatch"); return; }

    if (bound.body["groupId"] !== undefined && bound.body["groupId"] !== __args["groupId"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["groupId"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/organizations/{org-id}/groups:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/organizations/{org-id}/groups:1:orgId", __args["orgId"]);

  rtv.doStore("P1:admin/realms/{realm}/organizations/{org-id}/groups:1:groupId", __args["groupId"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/organizations/{org-id}/groups",owner:"P1:admin/realms/{realm}/organizations/{org-id}/groups:1",values:Object.assign({},__args)})});

  let read = getGroupRepresentation_2(__args["access"], __args["attributes"], __args["briefRepresentation"], __args["clientRoles"], __args["description"], __args["exact"], __args["first"], __args["groupId"], __args["id"], __args["max"], __args["name"], __args["orgId"], __args["parentId"], __args["path"], __args["populateHierarchy"], __args["q"], __args["realm"], __args["realmRoles"], __args["search"], __args["subGroupCount"], __args["subGroups"], __args["subGroupsCount"], "P1:admin/realms/{realm}/organizations/{org-id}/groups:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["access"] !== undefined) __args["access"] = read.body["access"];

    if (read.body["attributes"] !== undefined) __args["attributes"] = read.body["attributes"];

    if (read.body["clientRoles"] !== undefined) __args["clientRoles"] = read.body["clientRoles"];

    if (read.body["description"] !== undefined) __args["description"] = read.body["description"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["parentId"] !== undefined) __args["parentId"] = read.body["parentId"];

    if (read.body["path"] !== undefined) __args["path"] = read.body["path"];

    if (read.body["realmRoles"] !== undefined) __args["realmRoles"] = read.body["realmRoles"];

    if (read.body["subGroupCount"] !== undefined) __args["subGroupCount"] = read.body["subGroupCount"];

    if (read.body["subGroups"] !== undefined) __args["subGroups"] = read.body["subGroups"];

  }

  __args["description"] = "description_53884";

  let changed = updateGroupRepresentation_2(__args["access"], __args["attributes"], __args["briefRepresentation"], __args["clientRoles"], __args["description"], __args["exact"], __args["first"], __args["groupId"], __args["id"], __args["max"], __args["name"], __args["orgId"], __args["parentId"], __args["path"], __args["populateHierarchy"], __args["q"], __args["realm"], __args["realmRoles"], __args["search"], __args["subGroupCount"], __args["subGroups"], __args["subGroupsCount"], "P1:admin/realms/{realm}/organizations/{org-id}/groups:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"description",__args["description"])) { finish("update-failed"); return; }

  let deleted = deleteGroupRepresentation_2(__args["access"], __args["attributes"], __args["briefRepresentation"], __args["clientRoles"], __args["description"], __args["exact"], __args["first"], __args["groupId"], __args["id"], __args["max"], __args["name"], __args["orgId"], __args["parentId"], __args["path"], __args["populateHierarchy"], __args["q"], __args["realm"], __args["realmRoles"], __args["search"], __args["subGroupCount"], __args["subGroups"], __args["subGroupsCount"], "P1:admin/realms/{realm}/organizations/{org-id}/groups:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1", function() {

  for (let stage of ["readback", "create", "read", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getIdentityProviderRepresentation_2(step.data.values["alias"], step.data.values["orgId"], step.data.values["realm"], "P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    if (ok && stage === "delete") {

      let gone = getIdentityProviderRepresentation_2(step.data.values["alias"], step.data.values["orgId"], step.data.values["realm"], "P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1" + ":verifier:delete");

      ok = !!gone && gone.code === 404;

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/organizations/{org-id}/identity-providers",owner:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",process:1,entity:"admin/realms/{realm}/organizations/{org-id}/identity-providers",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/identity-provider/instances"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/identity-provider/instances"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/identity-provider/instances";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",type:"admin/realms/{realm}/identity-provider/instances",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/identity-provider/instances"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/identity-provider/instances"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/identity-provider/instances"].realm;

  }

  __args["alias"] = __parentBindings["admin/realms/{realm}/identity-provider/instances"]["alias"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/organizations"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/organizations"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",type:"admin/realms/{realm}/organizations",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/organizations"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/organizations"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/organizations"].realm;

  }

  __args["orgId"] = __parentBindings["admin/realms/{realm}/organizations"]["orgId"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["alias"] = __args["alias"];

  __args["orgId"] = __args["orgId"];

  __args["realm"] = __args["realm"];

  let created = createIdentityProviderRepresentation_2(__args["alias"], __args["orgId"], __args["realm"], "P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1" + ":create", __args["alias"]);

  if (!created || [204].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["orgId"] === undefined || __args["orgId"] === null) {

    let response = created.body;

    __args["orgId"] = response && typeof response === "object" ?

      (response["orgId"] === undefined ? response.__sbtObservedLocationId : response["orgId"]) : undefined;

  }

  if (__args["orgId"] === undefined || __args["orgId"] === null) { finish("create-id-unresolved"); return; }

  if (__args["alias"] === undefined || __args["alias"] === null) {

    let response = created.body;

    __args["alias"] = response && typeof response === "object" ?

      (response["alias"] === undefined ? response.__sbtObservedLocationId : response["alias"]) : undefined;

  }

  if (__args["alias"] === undefined || __args["alias"] === null) { finish("create-id-unresolved"); return; }

  let bound = getIdentityProviderRepresentation_2(__args["alias"], __args["orgId"], __args["realm"], "P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["orgId"] !== undefined && bound.body["orgId"] !== __args["orgId"]) { finish("create-id-mismatch"); return; }

    if (bound.body["alias"] !== undefined && bound.body["alias"] !== __args["alias"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1:orgId", __args["orgId"]);

  rtv.doStore("P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1:alias", __args["alias"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/organizations/{org-id}/identity-providers",owner:"P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1",values:Object.assign({},__args)})});

  let read = getIdentityProviderRepresentation_2(__args["alias"], __args["orgId"], __args["realm"], "P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  let deleted = deleteIdentityProviderRepresentation_2(__args["alias"], __args["orgId"], __args["realm"], "P1:admin/realms/{realm}/organizations/{org-id}/identity-providers:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/organizations/{org-id}/members:1", function() {

  for (let stage of ["readback", "create", "read", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/organizations/{org-id}/members:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/organizations/{org-id}/members:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getMemberRepresentation(step.data.values["briefRepresentation"], step.data.values["exact"], step.data.values["first"], step.data.values["max"], step.data.values["memberId"], step.data.values["membershipType"], step.data.values["orgId"], step.data.values["realm"], step.data.values["search"], "P1:admin/realms/{realm}/organizations/{org-id}/members:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/organizations/{org-id}/members:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/organizations/{org-id}/members",owner:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",process:1,entity:"admin/realms/{realm}/organizations/{org-id}/members",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/organizations/{org-id}/members:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/organizations/{org-id}/members:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/organizations"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/organizations"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/organizations"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/members:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/organizations";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",type:"admin/realms/{realm}/organizations",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/organizations"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/organizations"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/organizations"].realm;

  }

  __args["orgId"] = __parentBindings["admin/realms/{realm}/organizations"]["orgId"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/users"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/users"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/users"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/members:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/users";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",type:"admin/realms/{realm}/users",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/users"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/users"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/users"].realm;

  }

  __args["userId"] = __parentBindings["admin/realms/{realm}/users"]["userId"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/organizations/{org-id}/members:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["orgId"] = __args["orgId"];

  __args["realm"] = __args["realm"];

  __args["userId"] = __args["userId"];

  let created = createMemberRepresentation(__args["briefRepresentation"], __args["exact"], __args["first"], __args["max"], __args["memberId"], __args["membershipType"], __args["orgId"], __args["realm"], __args["search"], "P1:admin/realms/{realm}/organizations/{org-id}/members:1" + ":create", __args["userId"]);

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["orgId"] === undefined || __args["orgId"] === null) {

    let response = created.body;

    __args["orgId"] = response && typeof response === "object" ?

      (response["orgId"] === undefined ? response.__sbtObservedLocationId : response["orgId"]) : undefined;

  }

  if (__args["orgId"] === undefined || __args["orgId"] === null) { finish("create-id-unresolved"); return; }

  if (__args["memberId"] === undefined || __args["memberId"] === null) {

    let response = created.body;

    __args["memberId"] = response && typeof response === "object" ?

      (response["memberId"] === undefined ? response.__sbtObservedLocationId : response["memberId"]) : undefined;

  }

  if (__args["memberId"] === undefined || __args["memberId"] === null) { finish("create-id-unresolved"); return; }

  let bound = getMemberRepresentation(__args["briefRepresentation"], __args["exact"], __args["first"], __args["max"], __args["memberId"], __args["membershipType"], __args["orgId"], __args["realm"], __args["search"], "P1:admin/realms/{realm}/organizations/{org-id}/members:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["orgId"] !== undefined && bound.body["orgId"] !== __args["orgId"]) { finish("create-id-mismatch"); return; }

    if (bound.body["memberId"] !== undefined && bound.body["memberId"] !== __args["memberId"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["memberId"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/organizations/{org-id}/members:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/organizations/{org-id}/members:1:orgId", __args["orgId"]);

  rtv.doStore("P1:admin/realms/{realm}/organizations/{org-id}/members:1:memberId", __args["memberId"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/organizations/{org-id}/members",owner:"P1:admin/realms/{realm}/organizations/{org-id}/members:1",values:Object.assign({},__args)})});

  let read = getMemberRepresentation(__args["briefRepresentation"], __args["exact"], __args["first"], __args["max"], __args["memberId"], __args["membershipType"], __args["orgId"], __args["realm"], __args["search"], "P1:admin/realms/{realm}/organizations/{org-id}/members:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  let deleted = deleteMemberRepresentation(__args["briefRepresentation"], __args["exact"], __args["first"], __args["max"], __args["memberId"], __args["membershipType"], __args["orgId"], __args["realm"], __args["search"], "P1:admin/realms/{realm}/organizations/{org-id}/members:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1", function() {

  for (let stage of ["readback", "create", "read"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getAuthenticatorConfigRepresentation_2(step.data.values["alias"], step.data.values["config"], step.data.values["executionId"], step.data.values["id"], step.data.values["realm"], "P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/authentication/executions/{executionId}/config",owner:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",process:1,entity:"admin/realms/{realm}/authentication/executions/{executionId}/config",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/authentication/executions"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/authentication/executions"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/authentication/executions";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",type:"admin/realms/{realm}/authentication/executions",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/authentication/executions"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/authentication/executions"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/authentication/executions"].realm;

  }

  __args["executionId"] = __parentBindings["admin/realms/{realm}/authentication/executions"]["executionId"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["executionId"] = __args["executionId"];

  __args["realm"] = __args["realm"];

  __args["alias"] = "alias_94319";

  let created = createAuthenticatorConfigRepresentation_2(__args["alias"], __args["config"], __args["executionId"], __args["id"], __args["realm"], "P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["executionId"] === undefined || __args["executionId"] === null) {

    let response = created.body;

    __args["executionId"] = response && typeof response === "object" ?

      (response["executionId"] === undefined ? response.__sbtObservedLocationId : response["executionId"]) : undefined;

  }

  if (__args["executionId"] === undefined || __args["executionId"] === null) { finish("create-id-unresolved"); return; }

  if (__args["id"] === undefined || __args["id"] === null) {

    let response = created.body;

    __args["id"] = response && typeof response === "object" ?

      (response["id"] === undefined ? response.__sbtObservedLocationId : response["id"]) : undefined;

  }

  if (__args["id"] === undefined || __args["id"] === null) { finish("create-id-unresolved"); return; }

  let bound = getAuthenticatorConfigRepresentation_2(__args["alias"], __args["config"], __args["executionId"], __args["id"], __args["realm"], "P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["executionId"] !== undefined && bound.body["executionId"] !== __args["executionId"]) { finish("create-id-mismatch"); return; }

    if (bound.body["id"] !== undefined && bound.body["id"] !== __args["id"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["id"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1:executionId", __args["executionId"]);

  rtv.doStore("P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1:id", __args["id"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/authentication/executions/{executionId}/config",owner:"P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1",values:Object.assign({},__args)})});

  let read = getAuthenticatorConfigRepresentation_2(__args["alias"], __args["config"], __args["executionId"], __args["id"], __args["realm"], "P1:admin/realms/{realm}/authentication/executions/{executionId}/config:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  finish("complete");

});

bthread("verify:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1", function() {

  for (let stage of ["readback", "create", "read", "update", "delete"]) {

    let step = sync({waitFor: EventSet("step-or-finish:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1", function(e) {

      return e.data && e.data.owner === "P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1" && ((e.name === "SBT:CrudStep" && e.data.stage === stage) || e.name === "SBT:WorkerFinished");

    })});

    if (step.name === "SBT:WorkerFinished") return;

    let ok = step.data.success;

    if (ok && stage === "readback") {

      ok = [200].indexOf(step.data.code) >= 0;

    }

    if (ok && (stage === "create" || stage === "update")) {

      let check = getProtocolMapperRepresentation_2(step.data.values["clientScopeId"], step.data.values["config"], step.data.values["consentRequired"], step.data.values["consentText"], step.data.values["id"], step.data.values["name"], step.data.values["protocol"], step.data.values["protocolMapper"], step.data.values["realm"], "P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1" + ":verifier:" + stage);

      ok = !!check && [200].indexOf(check.code) >= 0;

      if (ok && stage === "update" && step.data.changedField &&

          check.body && typeof check.body === "object") {

        ok = check.body[step.data.changedField] === step.data.changedValue;

      }

    }

    sync({request:Event("SBT:CrudVerified", {owner:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",stage:stage,ok:ok})});

    if (!ok) return;

  }

});

bthread("crud:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1", function() {

  let __args = {};

  let __parentBindings = {};

  function finish(reason) {

    sync({request:Event("SBT:WorkerFinished", {process:1,entity:"admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",reason:reason})});

  }

  function verified(stage, result, success, changedField, changedValue) {

    sync({request:Event("SBT:CrudStep", {owner:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",process:1,entity:"admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models",stage:stage,code:result ? result.code : null,success:success,values:Object.assign({}, __args),changedField:changedField,changedValue:changedValue})});

    let e = sync({waitFor: EventSet("verification:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1", function(x) {

      return x.name === "SBT:CrudVerified" && x.data.owner === "P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1" && x.data.stage === stage;

    })});

    return e.data.ok;

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms/{realm}/client-templates"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms/{realm}/client-templates"] && Object.keys(SBT_FINISHED["1:admin/realms/{realm}/client-templates"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms/{realm}/client-templates";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",type:"admin/realms/{realm}/client-templates",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms/{realm}/client-templates"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms/{realm}/client-templates"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms/{realm}/client-templates"].realm;

  }

  __args["clientScopeId"] = __parentBindings["admin/realms/{realm}/client-templates"]["clientScopeId"];

  }

  // Choose any verified parent, with an independent choice in the sample.

  {

  function matchingParents() {

    return (SBT_POOL["1:admin/realms"] || []).filter(function(parent) {

      return __args.realm === undefined || parent.values.realm === __args.realm;

    });

  }

  while (!matchingParents().length) {

    if (SBT_FINISHED["1:admin/realms"] && Object.keys(SBT_FINISHED["1:admin/realms"]).length === 1) {

      finish("parent-unavailable"); return;

    }

    sync({waitFor: EventSet("parent:P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1", function(e) {

      return (e.name === "SBT:InstanceReady" || e.name === "SBT:WorkerFinished") &&

        e.data.process === 1 && e.data.entity === "admin/realms";

    })});

  }

  let __candidates = matchingParents();

  let __options = __candidates.map(function(parent, ix) {

    return Event("SBT:BindParent", {child:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",type:"admin/realms",index:ix});

  });

  let __picked = sync({request:__options});

  __parentBindings["admin/realms"] = __candidates[__picked.data.index].values;

  if (__args.realm === undefined && __parentBindings["admin/realms"].realm !== undefined) {

    __args.realm = __parentBindings["admin/realms"].realm;

  }

  __args["realm"] = __parentBindings["admin/realms"]["realm"];

  }

  __args["clientScopeId"] = __args["clientScopeId"];

  __args["realm"] = __args["realm"];

  __args["name"] = "name_43702";

  let created = createProtocolMapperRepresentation_2(__args["clientScopeId"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1" + ":create");

  if (!created || [201].indexOf(created.code) < 0) { finish("create-failed"); return; }

  if (__args["realm"] === undefined || __args["realm"] === null) {

    let response = created.body;

    __args["realm"] = response && typeof response === "object" ?

      (response["realm"] === undefined ? response.__sbtObservedLocationId : response["realm"]) : undefined;

  }

  if (__args["realm"] === undefined || __args["realm"] === null) { finish("create-id-unresolved"); return; }

  if (__args["clientScopeId"] === undefined || __args["clientScopeId"] === null) {

    let response = created.body;

    __args["clientScopeId"] = response && typeof response === "object" ?

      (response["clientScopeId"] === undefined ? response.__sbtObservedLocationId : response["clientScopeId"]) : undefined;

  }

  if (__args["clientScopeId"] === undefined || __args["clientScopeId"] === null) { finish("create-id-unresolved"); return; }

  if (__args["id"] === undefined || __args["id"] === null) {

    let response = created.body;

    __args["id"] = response && typeof response === "object" ?

      (response["id"] === undefined ? response.__sbtObservedLocationId : response["id"]) : undefined;

  }

  if (__args["id"] === undefined || __args["id"] === null) { finish("create-id-unresolved"); return; }

  let bound = getProtocolMapperRepresentation_2(__args["clientScopeId"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1" + ":bind");

  if (!bound || [200].indexOf(bound.code) < 0) { finish("create-readback-failed"); return; }

  if (bound.body && typeof bound.body === "object") {

    if (bound.body["realm"] !== undefined && bound.body["realm"] !== __args["realm"]) { finish("create-id-mismatch"); return; }

    if (bound.body["clientScopeId"] !== undefined && bound.body["clientScopeId"] !== __args["clientScopeId"]) { finish("create-id-mismatch"); return; }

    if (bound.body["id"] !== undefined && bound.body["id"] !== __args["id"]) { finish("create-id-mismatch"); return; }

    if (bound.body.id !== undefined && bound.body.id !== __args["id"]) { finish("create-id-mismatch"); return; }

  }

  if (!verified("readback", bound, true)) { finish("create-readback-verification-failed"); return; }

  if (!verified("create", created, true)) { finish("create-verification-failed"); return; }

  rtv.doStore("P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1:realm", __args["realm"]);

  rtv.doStore("P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1:clientScopeId", __args["clientScopeId"]);

  rtv.doStore("P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1:id", __args["id"]);

  sync({request:Event("SBT:InstanceReady", {process:1,entity:"admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models",owner:"P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1",values:Object.assign({},__args)})});

  let read = getProtocolMapperRepresentation_2(__args["clientScopeId"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1" + ":read");

  if (!verified("read", read, !!read && [200].indexOf(read.code) >= 0)) { finish("read-failed"); return; }

  if (read.body && typeof read.body === "object") {

    if (read.body["config"] !== undefined) __args["config"] = read.body["config"];

    if (read.body["consentRequired"] !== undefined) __args["consentRequired"] = read.body["consentRequired"];

    if (read.body["consentText"] !== undefined) __args["consentText"] = read.body["consentText"];

    if (read.body["id"] !== undefined) __args["id"] = read.body["id"];

    if (read.body["name"] !== undefined) __args["name"] = read.body["name"];

    if (read.body["protocol"] !== undefined) __args["protocol"] = read.body["protocol"];

    if (read.body["protocolMapper"] !== undefined) __args["protocolMapper"] = read.body["protocolMapper"];

  }

  __args["consentText"] = "consentText_75171";

  let changed = updateProtocolMapperRepresentation_2(__args["clientScopeId"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1" + ":update");

  if (!verified("update", changed, !!changed && [204].indexOf(changed.code) >= 0,"consentText",__args["consentText"])) { finish("update-failed"); return; }

  let deleted = deleteProtocolMapperRepresentation_2(__args["clientScopeId"], __args["config"], __args["consentRequired"], __args["consentText"], __args["id"], __args["name"], __args["protocol"], __args["protocolMapper"], __args["realm"], "P1:admin/realms/{realm}/client-templates/{client-scope-id}/protocol-mappers/models:1" + ":delete");

  if (!verified("delete", deleted, !!deleted && [204].indexOf(deleted.code) >= 0)) { finish("delete-failed"); return; }

  finish("complete");

});
