# 5.13.38 – Schema Validator Fix

- Fixes Home Assistant `schema:` entries that accidentally contained option values (`true`, `0.22`, `manual_only`, etc.) instead of schema validators (`bool`, `float(...)`, `list(...)`).
- Keeps clean LF line endings for `repository.yaml`, `config.yaml`, `Dockerfile`, `run.sh`, `package.json` and build files.
- Aligns all active runtime/update markers to `5.13.38` so Home Assistant Supervisor can detect the next update.
- No live trade, Steam confirmation or Backpack.tf publish behavior is enabled by this patch.
