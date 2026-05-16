# TF2 Trading Hub 5.13.61 — Inventory session sync fix

This patch fixes the repeated `inventory_sync_failed` spam visible in the flashy cockpit UI.

## Changed

- Inventory sync now tries Steam TradeOfferManager first, using the authenticated Steam web session.
- Public Steam inventory fetch is kept only as a fallback.
- Inventory cache is persisted to `/data/tf2-hub-inventory-cache.json`.
- Repeated inventory failures now use a retry backoff instead of spamming the audit log every minute.
- `/api/status`, `/api/version-audit` and `/api/diagnostics` now expose inventory error and retry information.
- The UI shows inventory sync errors directly in the inventory metric instead of silently showing only `Not synced`.
- Version bumped to `5.13.61` in Home Assistant visible files.

## Why

The Steam account was online and the web session was valid, but the inventory path still used a public Steam inventory URL. That can fail when the inventory is private, rate-limited, temporarily unavailable or blocked by Steam. The add-on now follows the tf2autobot-style session flow by using the logged-in TradeOfferManager inventory method first.
