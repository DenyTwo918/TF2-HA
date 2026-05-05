# TF2 Trading Hub

Current build: **5.13.62 – Steam login throttle guard**.

A Home Assistant add-on for TF2 trade monitoring, manual trade review, backpack.tf listings, and Steam inventory visibility. This version replaces the previous large single-file runtime with a smaller Express-based server using Steam bot libraries inspired by TF2Autobot/tf2-express patterns.

## What changed in 5.13.62

- Added throttle protection for `AccountLoginDeniedThrottle` so the add-on stops retrying after Steam temporarily blocks login attempts.
- Added a dashboard button to clear stored `shared_secret` and `identity_secret` for manual phone-code login mode.
- Prevented placeholder values such as `base64…` or `32-char hex` from being saved as real credentials.
- Kept manual Steam Guard code entry from the Home Assistant dashboard when no `shared_secret` is saved.
- Real Steam runtime foundation with `steam-user`, `steamcommunity`, `steam-tradeoffer-manager`, and `steam-totp`.
- Event-driven trade offer queue with manual accept/decline actions.
- Cleaner dashboard for status, credentials, pending offers, backpack.tf listings, inventory, and events.
- Guarded scheduler with no overlapping ticks.
- Crash guards for uncaught exceptions, unhandled promise rejections, and SIGTERM.
- backpack.tf and Steam API calls use timeouts and cached fallbacks.
- Dockerfiles now install production npm dependencies during Home Assistant build.

## Safety defaults

Live trade actions are still manual from the dashboard. The add-on does not auto-accept or auto-confirm trades by default.

## Install / Update

1. Home Assistant → Settings → Add-ons → Add-on Store → menu (⋮) → Repositories.
2. Add: `https://github.com/DenyTwo918/TF2-HA`.
3. Install or update **TF2 Trading Hub** to **5.13.62**.
4. Rebuild/start the add-on and check logs for `server_ready`.

## Setup credentials

Open the add-on UI through Ingress and fill in:

- Steam username and password.
- Steam shared secret for fully automatic 2FA TOTP, or leave it empty and enter the current mobile Steam Guard code when prompted.
- Steam identity secret for mobile confirmations, if you want confirmation checker support.
- Steam Web API key and SteamID64.
- backpack.tf token for listing and price sync.

Credentials are stored under `/data` in the add-on data directory.

## Dashboard workflow

- **Connect** starts the Steam bot login.
- **Sync offers** refreshes TradeOfferManager polling.
- **Pending trade offers** shows incoming offers for manual review.
- **Backpack.tf listings** syncs active classified listings.
- **Inventory** loads tradable TF2 inventory items.
- **Event log** shows runtime events and error diagnostics.
