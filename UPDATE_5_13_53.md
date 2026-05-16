# TF2 Trading Hub 5.13.53 – HA Repository Visibility + Simplified Maintainer Control

## Changes

### Fixed HA repository visibility
- Root `README.md` updated to reflect current build (was stuck at 5.13.42).
- `repository.yaml` description kept valid; root README now shows correct version so Home Assistant repository listing displays current state.

### Restored multiline config/build files
- `tf2-trading-hub/config.yaml` – valid multiline YAML, version bumped to 5.13.53.
- `tf2-trading-hub/Dockerfile` – BUILD_VERSION bumped to 5.13.53.
- `tf2-trading-hub/build.yaml` – BUILD_VERSION bumped to 5.13.53.
- `tf2-trading-hub/run.sh` – version echo bumped to 5.13.53.
- `tf2-trading-hub/package.json` – version bumped to 5.13.53.

### All version markers synchronized to 5.13.53
- `dist/server.js` APP_VERSION
- `dist/index.js` APP_VERSION
- `public/index.html` eyebrow + build banner
- `public/app.js` diagnostic fallback version
- `backpack_tf_user_agent` fallback string in server.js

### Simplified maintainer to manual ON/OFF control
- Dashboard maintainer card now shows simple ON / OFF status only.
- `Maintain now` button returns a friendly message when maintainer is OFF instead of running the heavy operation.
- `persistent_classifieds_maintainer_auto_run_enabled` default remains `false`; no auto cycles without explicit opt-in.
- Auto-scheduler path unchanged; manual toggle still works as before.

## Not changed
- Credential vault logic (Backpack token / API key handling) – untouched.
- Guarded/live safety defaults – untouched (`allow_live_classifieds_writes: false`, `allow_live_backpack_writes: false`).
- `/data` credentials – not touched.
- options/schema/ports in config.yaml – preserved exactly.
