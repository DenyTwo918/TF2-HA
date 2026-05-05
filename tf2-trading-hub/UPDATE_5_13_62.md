# TF2 Trading Hub 5.13.62 — Reliable manual disconnect fix

This patch fixes the cockpit Disconnect button so it actually stops the Steam bot and prevents the automatic reconnect loop from immediately bringing TF2 back online.

## Fixed

- Added persistent runtime desired state in `/data/tf2-hub-runtime-state.json`.
- `/api/bot/disconnect` now calls a central `stopBot()` shutdown path.
- Manual disconnect clears reconnect timers and blocks reconnect scheduling.
- SteamUser is created with `autoRelogin: false`.
- Disconnect clears game presence with `gamesPlayed([])` before `logOff()`.
- Trade manager and confirmation checker are stopped when available.
- Startup respects the last manual disconnect state and skips auto-login until Connect is pressed.
- Credential save no longer auto-starts the bot if the operator manually disconnected it.
- `/api/status` now includes `desired_online`.
- Cockpit buttons now better reflect online/offline state.

## Notes

Connect restores `desired_online: true` and starts Steam login again. SIGTERM/add-on stop still performs graceful cleanup without changing the stored operator preference.
