# TF2 Trading Hub

Current build: **5.13.63 – Inventory multi-source sync fix**.

A Home Assistant add-on for TF2 trade monitoring, manual trade review, backpack.tf listings, and Steam inventory visibility. This build keeps the flashy HA-connected cockpit UI and the smaller Express-based Steam runtime.

## What changed in 5.13.63

- Inventory sync now tries multiple sources instead of relying on the fragile public Steam inventory URL.
- The sync order is: authenticated Steam Community session → TradeOfferManager → Steam Web API → public inventory fallback.
- `HTTP 400` and `HTTP 404` inventory failures are now reported with the full source chain, not as a blind public URL failure.
- The last good inventory cache remains available when Steam temporarily rejects live inventory requests.
- Inventory retry backoff and audit-log throttling prevent `inventory_sync_failed` from spamming the log every minute.
- `/api/status`, diagnostics and inventory sync responses expose `inventory_source` for easier debugging.
- The reliable manual disconnect behavior from 5.13.62 is preserved.
- Ingress and optional direct Web UI access on port `8099` remain enabled.
- All HA-visible version markers were bumped to `5.13.63` so Home Assistant can detect the update.

## Safety defaults

Live trade actions are still manual from the dashboard. The add-on does not auto-accept or auto-confirm trades by default.

## Install / Update

1. Home Assistant → Settings → Add-ons → Add-on Store → menu (⋮) → Repositories.
2. Add: `https://github.com/DenyTwo918/TF2-HA`.
3. Install or update **TF2 Trading Hub** to **5.13.63**.
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
