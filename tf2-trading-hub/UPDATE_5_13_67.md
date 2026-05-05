# 5.13.67 — Autonomous multi-account Backpack pipeline

## Breaking / important changes

- **bptf_api_key is now a separate credential** from `bptf_token`.
  - `bptf_token` = Backpack.tf **access token** (for listing/classifieds actions).
  - `bptf_api_key` = Backpack.tf **API key** (for IGetPrices / price schema).
  - This fixes the HTTP 403 price schema error caused by using the access token where an API key is required.
  - Migration does NOT auto-copy the old token as the API key — you must save the API key separately in Credentials.

## Migration from 5.13.64 / 5.13.65

- On first boot, the add-on automatically migrates all legacy single-account data (`/data/tf2-hub-credentials.json`, `/data/tf2-hub-inventory-cache.json`, etc.) into `/data/accounts/main/`.
- Old files are preserved (not deleted) until migration succeeds.
- A `main` account record is created in `/data/tf2-hub-accounts.json` with `enabled: true`, `dry_run: true`, `autonomous_enabled: false`.
- No existing working functionality is broken.

## New features

### Multi-account architecture
- Full account isolation: credentials, runtime state, inventory, listings, drafts, offer poll data, and audit logs are all stored per account under `/data/accounts/{account_id}/`.
- Account CRUD API: `GET/POST /api/accounts`, `GET/PATCH/DELETE /api/accounts/:accountId`.
- Per-account Steam session management. Disconnect for one account does not affect others.
- Per-account pipeline, inventory sync, listing sync, draft generation.
- Global price schema is shared (prices are global) but listing state is per-account.
- Account roles: `main`, `trading`, `storage`, `pricing_only`, `disabled`.
- UI: Accounts panel with status badges, inventory/listing/offer counts, Connect/Disconnect/Run Pipeline buttons.

### Backpack.tf credentials and pricing fix
- Separate fields: `bptf_token` (access token for classifieds) and `bptf_api_key` (for price schema).
- `GET /api/backpack/diagnostics` returns: `has_access_token`, `has_api_key`, `steamid64`, `listings_status`, `listings_count`, `price_schema_status`, `last_error`, `endpoint_used`, `timestamp`.
- Per-account: `GET /api/accounts/:accountId/backpack/diagnostics`.
- Price schema 403 produces a clear hint: "Use bptf_api_key (not the access token) for price schema."
- Listing sync preserves last good cache on error.
- Listings status reasons: `ok`, `empty`, `missing_token`, `missing_steamid`, `unauthorized`, `forbidden`, `rate_limited`, `api_error`.

### Listing drafts from inventory
- `POST /api/listing-drafts/generate` — creates sell drafts from current tradable inventory using price schema.
- Draft fields: `draft_id`, `account_id`, `assetid`, `market_hash_name`, `quality`, `tradable`, `craftable`, `suggested_sell_price`, `confidence`, `status`, `warnings`.
- Status: `ready` (priced) or `needs_price` (no price found).
- `POST /api/listing-drafts/:id/publish` — publishes to Backpack.tf (respects dry_run).
- `POST /api/listing-drafts/:id/ignore` — ignores draft and persists ignore list.
- Per-account: `GET/POST /api/accounts/:accountId/listing-drafts`, `/listing-drafts/generate`, `/listing-drafts/:draftId/publish`, `/listing-drafts/:draftId/ignore`.
- Persistence: `/data/accounts/{id}/listing-drafts.json`, `/data/accounts/{id}/ignored-drafts.json`.

### Autonomous pipeline
- `POST /api/pipeline/run` — runs full pipeline: inventory sync → price schema → listings sync → draft generation → optional autonomous publish.
- `POST /api/pipeline/run-all` — runs global pipeline across all enabled accounts.
- Per-account: `POST /api/accounts/:accountId/pipeline/run`.
- Overlap protection: one pipeline at a time per account.
- Configurable cap: `max_publish_per_cycle`, `max_parallel_accounts`.

### Autonomous mode (dry-run default)
- All autonomous actions default to `dry_run: true` — no live actions until explicitly disabled.
- Global settings via `GET/PATCH /api/settings`.
- Settings: `autonomous_enabled`, `autonomous_publish_enabled`, `autonomous_trade_accept_enabled`, `dry_run`, `min_profit_ref`, `max_publish_per_cycle`, `max_trade_accept_per_cycle`, `require_price_confidence`, `allow_unpriced_items`, `max_parallel_accounts`.
- Per-account overrides for all autonomous settings.
- Dry-run banner shown in UI when dry_run is active.

### Trade offer evaluation
- Incoming offers are automatically evaluated: `value_in`, `value_out`, `profit`, `unknown_items`, `tags`, `recommendation`.
- Tags: `safe`, `manual_review`, `profit`, `loss`, `unpriced`, `no_pricing`, `gift`, `empty`.
- UI shows evaluation tags on each offer card.
- Autonomous accept: only fires if `autonomous_trade_accept_enabled`, tags don't include `manual_review`/`unpriced`/`no_pricing`, and profit >= `min_profit_ref`.

### Scheduler improvements
- Global price schema synced once per hour.
- Per-account inventory and listings synced on schedule.
- Price schema 403 does not spam logs.

### UI improvements
- New nav sections: Accounts, Listing Drafts, Pricing, Autonomous.
- Account selector and account cards with status/health badges.
- Listing drafts panel with Publish/Ignore buttons.
- Pricing panel with status, schema load state, and price lookup.
- Autonomous settings form with dry-run toggle.
- Credential status grid showing which keys are saved and warnings for missing Backpack keys.
- Health bar for price schema.
- Dry-run banner.
- Offer cards show evaluation tags and profit estimate.

## API endpoints added

```
GET  /api/accounts
POST /api/accounts
GET  /api/accounts/:accountId
PATCH /api/accounts/:accountId
DELETE /api/accounts/:accountId
GET  /api/accounts/:accountId/status
POST /api/accounts/:accountId/bot/login
POST /api/accounts/:accountId/bot/disconnect
POST /api/accounts/:accountId/inventory/sync
POST /api/accounts/:accountId/backpack/sync
GET  /api/accounts/:accountId/backpack/diagnostics
GET  /api/accounts/:accountId/listing-drafts
POST /api/accounts/:accountId/listing-drafts/generate
POST /api/accounts/:accountId/listing-drafts/:draftId/publish
POST /api/accounts/:accountId/listing-drafts/:draftId/ignore
GET  /api/accounts/:accountId/offers
POST /api/accounts/:accountId/offers/sync
POST /api/accounts/:accountId/offers/:offerId/accept
POST /api/accounts/:accountId/offers/:offerId/decline
POST /api/accounts/:accountId/pipeline/run
GET  /api/listing-drafts
POST /api/listing-drafts/generate
POST /api/listing-drafts/:id/publish
POST /api/listing-drafts/:id/ignore
POST /api/pipeline/run
POST /api/pipeline/run-all
GET  /api/settings
PATCH /api/settings
POST /api/prices/schema/refresh
GET  /api/backpack/diagnostics
POST /api/backpack/sync
```

## Files changed

- `dist/server.js` — complete rewrite with multi-account, pipeline, drafts, separated bptf credentials
- `dist/index.js`  — same as server.js
- `public/index.html` — new sections: Accounts, Drafts, Pricing, Autonomous, updated Credentials
- `public/app.js`  — new panels: accounts, drafts, pricing, autonomous, offer evaluation tags
- `public/app.css` — new styles for account/draft/cred-status panels
- `config.yaml`    — version bump + new autonomous/multi-account options + schema
- `build.yaml`     — version bump
- `package.json`   — version bump
- `run.sh`         — version bump
- `Dockerfile*`    — version bump
- `UPDATE_5_13_67.md` — this file

## Persistence layout (new)

```
/data/tf2-hub-accounts.json               # account registry
/data/tf2-hub-global-settings.json        # global autonomous settings
/data/tf2-hub-global-audit.jsonl          # global audit log
/data/tf2-hub-price-schema.json           # global price schema
/data/accounts/{id}/credentials.json
/data/accounts/{id}/runtime-state.json
/data/accounts/{id}/inventory-cache.json
/data/accounts/{id}/listings-cache.json
/data/accounts/{id}/listing-drafts.json
/data/accounts/{id}/ignored-drafts.json
/data/accounts/{id}/tradeoffer-poll.json
/data/accounts/{id}/audit.jsonl
```

Legacy files in `/data/` are migrated on first boot and preserved.
