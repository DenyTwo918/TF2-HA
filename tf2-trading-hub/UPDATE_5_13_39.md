# TF2 Trading Hub 5.13.39 – Provider Readiness

Adds provider health that separates stored Main account credentials from live Backpack.tf readiness.

## What changed
- New endpoint: `/api/main-account/provider-health`.
- `/api/main-account/status`, `/api/credentials/status` and setup status now include `provider_health`.
- Dashboard now shows saved credentials separately from Backpack.tf token validity, price schema readiness, inventory count and priced inventory count.
- Detects the common failure from your logs: Backpack.tf `401` / `This access token is not valid.`
- Keeps secrets redacted.

## Expected next step after install
Paste a fresh Backpack.tf token/API key if the provider health card says `invalid_401` or `api_key_missing_or_price_sync_failed`, then restart the add-on and run Local Workflow.
