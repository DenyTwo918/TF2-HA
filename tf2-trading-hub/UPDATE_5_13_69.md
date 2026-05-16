# TF2 Trading Hub 5.13.69

## Price matching and cockpit readability fix

- Fixes price lookup for Backpack.tf price schemas where `response.items` is returned as an array.
- Adds robust item-name normalization and quality id matching for Unique/quality 6 prices.
- Parses Backpack.tf price entries with `currency` correctly so keys and metal are not mixed.
- Listing drafts generated from inventory can now resolve known item prices when the schema contains them.
- Improves Listing Drafts spacing and Live Audit readability in the cockpit UI.
- Keeps Home Assistant Ingress routing and optional direct Web UI support.
