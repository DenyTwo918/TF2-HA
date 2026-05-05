# TF2 Trading Hub

Version **5.13.69** adds a Home Assistant friendly multi-account TF2 trading cockpit.

## Highlights

- Ingress UI and optional direct Web UI port `8099`.
- Multiple Steam accounts with isolated `/data/accounts/{account_id}` storage.
- Steam login, Steam web session and TradeOfferManager per account.
- Inventory sync, Backpack.tf listings diagnostics and listing drafts per account.
- Global Backpack.tf price schema cache with separate Backpack API key handling.
- Safe autonomous pipeline with dry-run default.
- Manual review remains the default for publishing and trade accept actions.

Secrets are stored under `/data` and are not returned by API responses.
