# Research continuation v007

## Accepted boundary
Vikunja checkpoint v010 is accepted: same label 143, six independent resource observations restored, nine new HTTP requests, no creates and no prefix replay. Known empty-title finding remains in historical v008 evidence. Expanded automatic catalog queue is pending; it is not delivered.

Preserve the original Mealie generator architecture, Context, stories, interfaces, DAL and independent verifiers. Do not replace the model with a flat REST runner or edit generated JS manually. The exact delivered v010 source and verified freeze are under packages/ in the Vikunja snapshot. Use the v010 package as the current implementation base; earlier transfer v017 and related artifacts are provenance only.

## Scope and omissions
These are hash-pinned selections from the user's two accepted-content audit reports. Common secret-pattern screening is not an exhaustive confidentiality guarantee. Both home origins were identified by the user and are rechecked locally. The earlier broad package publication was rejected; this selection omits flagged files and old transfer archives and narrows Vikunja run history to its own current campaigns. Other-system history, large files, databases and flagged fixtures are recorded as blocked or outside_scope in selection_v007.json. No original files are deleted. Some test fixtures remain excluded pending review, so this is not complete test coverage or a complete backup.

Local Mealie main is ahead 1/behind 28. The uploader clones remote main into a new checkout and puts the selected local FILE CONTENTS in a separate immutable research snapshot. It does not merge the local divergent commit history, pull into the original tree, reset, or force-push. The original local commit remains untouched. Download hydration changes files only in a NEW checkout, so git status there may show changes relative to remote main. Do not blindly commit everything or reset it.

## Runtime prerequisites
Work already has Docker. No Docker software/images/database state are included. Existing work containers and databases are not changed by download. The exact home database state is not proven to exist at work. Do not claim live continuation on the same resource IDs until the checkpoint and independent observations are verified against the work server. If the work database differs, live continuation needs a separate state alignment step; downloading code cannot prove it. Vikunja endpoint http://127.0.0.1:3456/api/v1; version v2.6.0; user SBT-tester. Prompt for password, never store it in Git. Provengo JAR is a prerequisite on work, not included here.

## Next work
After verified download, inspect the source package and verified freeze, and develop the catalog queue from the accepted v010 base. This download is sufficient to continue source development and evidence analysis. It is not itself a native Provengo acceptance run.
