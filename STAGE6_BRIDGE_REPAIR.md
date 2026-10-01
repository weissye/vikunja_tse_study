# Stage 6.2: generic alternative-producer bridge repair

Observed input: seed 20261001, 30/30 long stories skipped, zero long steps, six overlapping epochs. The canonical repository creator required an unavailable administrative dependency, while a separate OpenAPI-described producer successfully returned 201. The verifier bridge published a legacy `InstanceReady` event, but the long stories waited for a scoped `SBT:InstanceReady` event.

The opt-in `long-interleaving` verification overlay now publishes a scoped ready event after verifying documented HTTP success and nonempty path bindings. A Provengo `block` prevents a canonical negative outcome until the alternative producer publishes its success or failure outcome. The default `full` profile retains its original bytes. Neither this patch nor the original 6.2 can make stories that need unavailable privileges or missing documented dependencies run.

Apply this ZIP on top of the Stage 6.2 project root, preserving relative paths. Run one new seed with `Invoke-Gitea-Stage6-Generated.ps1` and inspect `long_story_steps_selected`, `successful_long_stories`, `skipped_long_stories`, and `observed_overlapping_epochs` in the generated campaign summary. An offline generation check is not a live proof that story rounds ran. The pilot's 11 contract violations are not established product bugs without triage.

Regression performed: six actual archived OpenAPI contracts (Library, Garage, Pharmacy, NetBox, Todoist, Vikunja) and six synthetic contract shapes; baseline `full` story and verifier byte parity, opt-in JavaScript syntax. Gitea verifier: 478 contracts, 118 state-verified mutations, 74 runtime-ready concurrency checks (unchanged). No live regression of these seven systems was possible here.
