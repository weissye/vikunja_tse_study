# Vikunja transfer v016

Versioned extension of v015. Same owner, two instances, Prefix depth 6, seed 1: 172 research requests, 173 bthreads, 22 negative pairs, 20 parent checks.

Negative cases remain derived from selected string update schemas (type, minLength, maxLength). Three independent observations: HTTP rejection (4xx); whether the exact response status is listed in the operation; unchanged ID/scalar/parent projection in independent GET. State preservation is a declared research oracle, not an explicit OpenAPI postcondition. Documented status is not proof its meaning matches this exact invalid input.

Any 4xx plus unchanged projection passes the rejection/state oracle. An unlisted code, including 412, remains a status_documentation_findings entry. Full completion with such findings returns V016_LIVE_SCHEMA_NEGATIVE_ACCEPTED_WITH_CONTRACT_FINDINGS. It does not establish full contract conformance. 2xx acceptance, 5xx, missing evidence, or changed projection fails. Invalid request STEP_PASS only marks receipt collection; the paired GET determines oracle acceptance.

After a failure native Provengo may continue selecting events in fail mode while skipping actuation. Completion alone never establishes execution; runner requires all callbacks, dependencies, checks and native SUCCESS. Successful callback count now counts only valid callbacks.

Run Run-Vikunja-Stage5-v016.ps1 with StudyRoot, BaseUrl http://127.0.0.1:3456/api/v1, Username SBT-tester, Instances 2, Depth 6, Seed 1. Password prompted securely. Existing resources retained; no cleanup/reset. Review ZIP exports sanitized evidence. Original frozen v001 protocol retained unchanged; schema-negative testing is an extension.

Offline: python Generate-Package-v016.py --contract live-contract-v016.json --output OUTPUT --tag offline
Native fixture validation is synthetic and is not a live Vikunja acceptance. Live v016 remains pending.
