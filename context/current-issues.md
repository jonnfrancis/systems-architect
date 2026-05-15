I tried accessing the "/editor/[projectId]" and I got these errors: Analyze it and fix these issues. The errors are as follows:
[(node:880) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'
See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.
(Use `node --trace-warnings ...` to show where the warning was created)
 GET /editor 200 in 8.7s (next.js: 565ms, proxy.ts: 2.4s, application-code: 5.7s)
Compaction failed: Failed to compact database

Caused by:
    0: Failed to merge database files for family 2
    1: Failed to write compressed value block
    2: Failed to write block data
    3: There is not enough space on the disk. (os error 112)
Compaction failed: Another write batch or compaction is already active (Only a single write operations is allowed at a time)]