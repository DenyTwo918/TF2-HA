# TF2 Trading Hub 5.13.64 — Backpack diagnostics and pricing cockpit

This patch focuses on Backpack.tf listings and pricing visibility after the Steam login and inventory sync fixes.

## Changes

- Adds Backpack.tf listing diagnostics to the cockpit.
- Shows whether listings are empty because of a missing token, missing SteamID64, API error, or a valid empty response.
- Makes Backpack.tf listing parsing more tolerant of different response shapes.
- Adds `/api/backpack/diagnostics` for UI and troubleshooting.
- Expands `/api/prices/schema` with schema count and last-sync data.
- Adds `/api/prices/lookup` for item price checks.
- Adds a Backpack diagnostics quick action in the UI.
- Adds price schema feedback in the inventory panel.
- Bumps all HA-visible version markers to `5.13.64`.

## Expected result

If Backpack.tf returns zero active listings, the UI now explains why instead of only showing an empty panel.
