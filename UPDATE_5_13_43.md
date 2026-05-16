# 5.13.43 – Main Account Restart Persistence Guard

Fixes the case where Main account appears unsaved after an add-on restart even though the save endpoint verified successfully.

Changes:
- Main account save now writes the canonical vault, last-good mirror and compatibility credential vault in one path.
- `/api/main-account/status` self-heals from last-good/options mirrors if the canonical vault is missing or empty.
- Startup runs an explicit Main account persistence check before options are hydrated.
- Adds `/data/tf2-hub-main-account-persistence-check.json` for redacted restart diagnostics.
- Keeps 5.13.42 Backpack price-schema deep sync diagnostics.

Secrets are never returned in API responses or diagnostics.
