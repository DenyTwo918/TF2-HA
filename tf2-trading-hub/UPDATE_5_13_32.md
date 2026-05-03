# TF2 Trading Hub 5.13.33 – Boot Delay Removed + Hard Main Account Save

- Removed all active boot-delay add-on options from `config.yaml` and runtime defaults.
- Removed boot-delay gating from the scheduler and startup path.
- Reworked `/api/main-account/save` to use a hard direct write to `/data/tf2-hub-main-account.json`.
- Save verification now reads the canonical vault immediately and returns `ready=true` only when SteamID64, Steam Web API key and Backpack.tf token are present.
- UI now renders failed save responses and validation details instead of only showing them in logs.
- Version markers, Docker build args, run log, frontend banner and Backpack.tf user agent are updated to 5.13.33.
