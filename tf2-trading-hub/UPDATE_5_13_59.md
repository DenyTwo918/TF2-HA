# TF2 Trading Hub 5.13.60 — Crash-safe Steam bot rework

This release replaces the previous oversized single-file runtime with a smaller, event-driven Home Assistant add-on server inspired by TF2Autobot/tf2-express patterns.

## Main changes

- Replaced the old crash-prone vanilla HTTP runtime with an Express server.
- Added real Steam bot dependencies: `steam-user`, `steamcommunity`, `steam-tradeoffer-manager`, and `steam-totp`.
- Added TradeOfferManager event handling for incoming offers, offer state changes, polling failures, and poll data persistence.
- Added crash guards for uncaught exceptions, unhandled promise rejections, SIGTERM, and guarded scheduler ticks.
- Added safer backpack.tf price/listing sync with timeouts and cached fallback data.
- Added a clean manual-review dashboard for status, credentials, pending trade offers, backpack.tf listings, inventory, and event logs.
- Added Server-Sent Events for live dashboard updates, plus polling fallback.
- Updated Dockerfiles so Home Assistant builds install npm production dependencies correctly.
- Bumped all HA-visible version markers to `5.13.60`.

## Safety defaults

Live trade acceptance remains manual through the dashboard. Credentials are stored under `/data` inside the add-on data directory.

## Notes

This is a structural rework rather than a small hotfix. After installing, rebuild the add-on in Home Assistant and check the log for `server_ready` and `steam_login_attempt` events.
