Each ZIP contains one original Provengo runs-db.db.
The adjacent JSON records its original path and SHA256.
To restore one database, read its JSON and run:
Expand-Archive -LiteralPath '<zip path>' -DestinationPath (Split-Path '<original path>') -Force
These are Provengo run databases, not the application databases in Docker.
