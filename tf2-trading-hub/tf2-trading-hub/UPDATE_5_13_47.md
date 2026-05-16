# 5.13.47 – Operation Single-Flight Lock + Maintainer Queue Fix

- Adds central active operation state and `/api/operations/status`.
- Prevents overlapping maintainer, scheduled pipeline, local workflow, market scanner, forced inventory sync and publish wizard rebuild operations.
- Adds provider sync single-flight de-duplication so only one Backpack.tf classifieds fetch and one price schema sync run at a time.
- Maintainer now runs through the operation lock with timeout release logging.
- Dashboard disables Maintain now and Run workflow while a heavy operation is active.
- Main account vault logic and trading safety defaults are unchanged.
