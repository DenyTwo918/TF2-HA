# TF2 Trading Hub 5.13.67

Production-grade autonomous multi-account Backpack pipeline foundation.

## Added

- Multi-account runtime model with isolated `/data/accounts/{account_id}` storage.
- Legacy single-account migration into `/data/accounts/main` without deleting old files.
- Per-account SteamUser, SteamCommunity and TradeOfferManager lifecycle.
- Per-account connect/disconnect, inventory sync, listings sync, offers and pipeline endpoints.
- Global price schema cache separated from account-specific Backpack listings.
- Separate Backpack.tf access token and Backpack.tf API key handling.
- Inventory-based listing draft generation.
- Guarded manual listing publish and dry-run autonomous publish support.
- Autonomous pipeline skeleton with provider sync, pricing, inventory, listings and drafts.
- Multi-account cockpit UI with account cards, selector, pipeline actions and safety indicators.

## Safety

- New accounts default to disabled, dry-run and no autonomous live actions.
- Secrets are not returned by API and are sanitized from logs.
- Disconnect remains manual-safe and blocks reconnect until Connect is requested.
- Existing single-account API endpoints are kept as compatibility aliases to the main account.
