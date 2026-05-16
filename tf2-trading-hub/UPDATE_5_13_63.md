# TF2 Trading Hub 5.13.63 — Inventory multi-source sync fix

This patch fixes the repeated TF2 inventory sync failures seen as `HTTP 400` or `HTTP 404` in Home Assistant logs.

## Changes

- Adds a multi-source inventory sync chain:
  1. authenticated Steam Community session,
  2. Steam TradeOfferManager inventory,
  3. Steam Web API `IEconItems_440/GetPlayerItems`,
  4. public Steam inventory endpoint as a last fallback.
- Keeps the existing cached inventory available when Steam rejects a live inventory fetch.
- Adds stronger retry backoff and throttled audit logging so `inventory_sync_failed` does not spam logs every minute.
- Adds `inventory_source` diagnostics to status, diagnostics and inventory sync responses.
- Keeps the 5.13.62 reliable manual disconnect behavior.
- Bumps all HA-visible version markers to `5.13.63`.

## Notes

If the public Steam inventory endpoint returns `HTTP 400` or `HTTP 404`, the bot now tries authenticated/session-based sources first and uses the public endpoint only as a final fallback.
