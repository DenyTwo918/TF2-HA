# TF2 Trading Hub

Current build: **5.13.62 – Reliable manual disconnect fix**.

A Home Assistant add-on for TF2 trade monitoring, manual trade review, backpack.tf listings, and Steam inventory visibility. This build keeps the flashy HA-connected cockpit UI and the smaller Express-based Steam runtime.

## What changed in 5.13.62

- The **Disconnect** button now performs a real manual stop instead of only changing the UI state.
- Manual disconnect persists to `/data/tf2-hub-runtime-state.json` as `desired_online: false`.
- Auto-reconnect is blocked after a manual disconnect until the operator presses **Connect** again.
- Steam game presence is cleared with `gamesPlayed([])` before logoff, so TF2 should no longer stay shown as active after disconnect.
- Confirmation checker, trade manager and reconnect timers are stopped during manual disconnect.
- `/api/status` now exposes `desired_online` for the cockpit UI.
- The UI disables Connect/Disconnect controls more accurately based on runtime state.
- Ingress and optional direct Web UI access on port `8099` remain enabled.
- All HA-visible version markers were bumped to `5.13.62` so Home Assistant can detect the update.

## Safety defaults

Live trade actions are still manual from the dashboard. The add-on does not auto-accept or auto-confirm trades by default.

## Install / Update

1. Home Assistant → Settings → Add-ons → Add-on Store → menu (⋮) → Repositories.
2. Add: `https://github.com/DenyTwo918/TF2-HA`.
3. Install or update **TF2 Trading Hub** to **5.13.62**.
4. Rebuild/start the add-on and check logs for `server_ready`.

## Setup credentials

Open the add-on UI through Home Assistant Ingress, or use the direct Web UI on port `8099`, then fill in:

- Steam username and password.
- Steam shared secret for 2FA TOTP.
- Steam identity secret for mobile confirmations, if you want confirmation checker support.
- Steam Web API key and SteamID64.
- backpack.tf token for listing and price sync.

Credentials are stored under `/data` in the add-on data directory.

## Dashboard workflow

- **Connect** starts the Steam bot login and re-enables desired online state.
- **Disconnect** stops reconnect timers, clears game presence, logs off Steam and keeps the bot offline until manually connected again.
- **Refresh cockpit** reloads runtime status, offers, listings, inventory, and event stream.
- **Sync offers** refreshes TradeOfferManager polling.
- **Incoming offers** shows trade offers as review cards with accept/decline controls.
- **Backpack.tf listings** syncs active classified listings.
- **Inventory** loads tradable TF2 inventory items as visual tiles.
- **Event stream** shows runtime events and error diagnostics.
