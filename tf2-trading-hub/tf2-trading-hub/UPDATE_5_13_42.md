# TF2 Trading Hub 5.13.42 – Price Schema Deep Sync Fix

This patch fixes the remaining Backpack.tf price-schema gap after 5.13.41.

- Forces a real Backpack.tf provider sync when an API key is saved but the price schema cache is still empty.
- Tries multiple safe IGetPrices/v4 request variants using the API key as the `key` query parameter.
- Stores a redacted `tf2-hub-backpack-price-schema-debug.json` file when Backpack.tf returns HTTP 200 but no usable prices.
- Adds Action Feed events for `backpack_tf_price_schema_loaded` and `backpack_tf_price_schema_sync_failed`.
- Keeps listings and price schema readiness separate: own listings can be OK while market scanner remains blocked by missing prices.

No live trade accept, SDA confirmation or Backpack classifieds write is enabled by this patch.
