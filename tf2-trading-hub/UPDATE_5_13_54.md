# TF2 Trading Hub 5.13.54 – Fix Maintain Now Crash (Event-Loop Block After Provider Sync)

## Problem

Pressing **Maintain now** caused the add-on to crash every time with a clean log cut-off (no Node.js exception). This is a SIGKILL from the HA supervisor, triggered when the Node.js process blocks the event loop long enough to exceed the supervisor's health-check timeout.

### Root cause

In `PersistentClassifiedsMaintainerService.run()` (server.js), after the Backpack.tf provider sync completes (~45,818 price entries loaded), the code ran two heavy operations with **no yield point** before them:

1. `archiveStaleSellListingsGuarded` — calls `buildStaleSellListingGuardStatus` synchronously, iterating all active sell listings.
2. `pruneUnactionableBuyDraftsForMaintainer` — **fully synchronous**, loops all buy drafts calling `draftIsMaintainerActionable` (→ `tradingBrainFilterDraftForMaintainer` → price lookups) per draft.

The first yield (`await yieldToEventLoop()`) after provider sync was not until after both of these operations, so the event loop was blocked during the CPU spike that follows loading 45k prices. The supervisor killed the process.

## Fix

Added two `await yieldToEventLoop()` calls immediately before the heavy operations:

```javascript
// before archiveStaleSellListingsGuarded
await yieldToEventLoop(); throwIfOperationAborted(context && context.signal, 'maintainer_before_stale_guard');
if (options.stale_sell_listing_guard_enabled !== false && ...) {
  const staleArchive = await archiveStaleSellListingsGuarded(...);
  ...
}

// before pruneUnactionableBuyDraftsForMaintainer
await yieldToEventLoop(); throwIfOperationAborted(context && context.signal, 'maintainer_before_prune');
const prunedBeforeFill = pruneUnactionableBuyDraftsForMaintainer(...);
```

These yields hand control back to the event loop (via `setImmediate`) so the HA supervisor health-check can respond between the heavy steps.

## Version markers synchronized to 5.13.54

- `dist/server.js` APP_VERSION + user-agent strings
- `dist/index.js` APP_VERSION + user-agent strings
- `tf2-trading-hub/config.yaml` version + backpack_tf_user_agent
- `tf2-trading-hub/Dockerfile` BUILD_VERSION
- `tf2-trading-hub/build.yaml` BUILD_VERSION
- `tf2-trading-hub/run.sh` version echo
- `tf2-trading-hub/package.json` version
- `public/index.html` eyebrow + build banner
- `public/app.js` fallback version references
- Root `README.md` current build line

## Not changed

- Credential vault / Backpack token / API key handling – untouched.
- Safety defaults (`allow_live_classifieds_writes: false`, `allow_live_backpack_writes: false`) – untouched.
- `/data` credentials – not touched.
- Maintainer ON/OFF logic from 5.13.53 – preserved.
- options/schema/ports in config.yaml – preserved exactly.
