# TF2 Trading Hub

Current build: **5.13.60 – Flashy HA-connected cockpit UI**.

A Home Assistant add-on for TF2 trade monitoring, manual trade review, backpack.tf listings, and Steam inventory visibility. This version replaces the previous large single-file runtime with a smaller Express-based server using Steam bot libraries inspired by TF2Autobot/tf2-express patterns.

## What changed in 5.13.60

- Flashier Home Assistant-connected cockpit UI with sidebar navigation, animated hero/status area, runtime health bars, premium metric cards, improved offer cards, inventory tiles, and a polished live event stream.
- Ingress remains enabled for the Home Assistant sidebar.
- Direct Web UI access is also available on port `8099` for debugging and full-page use.
- Existing crash-safe Express backend and Steam bot endpoints are preserved.
- All HA-visible version markers were bumped to `5.13.60` so Home Assistant can detect the update.

## Safety defaults

Live trade actions are still manual from the dashboard. The add-on does not auto-accept or auto-confirm trades by default.

## Install / Update

1. Home Assistant → Settings → Add-ons → Add-on Store → menu (⋮) → Repositories.
2. Add: `https://github.com/DenyTwo918/TF2-HA`.
3. Install or update **TF2 Trading Hub** to **5.13.60**.
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

- **Connect bot** starts the Steam bot login.
- **Refresh cockpit** reloads runtime status, offers, listings, inventory, and event stream.
- **Sync offers** refreshes TradeOfferManager polling.
- **Incoming offers** shows trade offers as review cards with accept/decline controls.
- **Backpack.tf listings** syncs active classified listings.
- **Inventory** loads tradable TF2 inventory items as visual tiles.
- **Event stream** shows runtime events and error diagnostics.
