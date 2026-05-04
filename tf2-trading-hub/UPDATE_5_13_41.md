# TF2 Trading Hub 5.13.41 – Backpack API Key / Price Schema Fix

This patch fixes the provider readiness split discovered in the 5.13.41 diagnostic bundle.

## Changes

- Main account UI now shows both `Backpack.tf access token` and `Backpack.tf API key` without hiding the API key in advanced-only UI.
- Backend Main account save verifies the SteamID64, Steam Web API key, Backpack access token and Backpack API key separately.
- Provider readiness now reports access-token validity and price-schema readiness separately.
- Trading Brain no longer reports `Backpack.tf prices ready` when the schema has 0 entries.
- Hub setup readiness no longer reaches 100% while the price schema is missing.
- Market scanner returns an explicit `backpack_api_key_missing` block reason when there is no API key.

## Safety

No live trades, Steam confirmations or Backpack.tf writes are enabled by this patch.
