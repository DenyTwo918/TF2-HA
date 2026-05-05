# TF2 Trading Hub 5.13.68 – HA Ingress API Route Repair

This patch fixes the 404 errors seen from the Home Assistant dashboard after the multi-account cockpit update.

## Fixed

- Frontend API calls now resolve relative to the current dashboard base path, so Home Assistant ingress no longer sends `/api/accounts` or `/api/settings` to Home Assistant itself.
- Event stream (`/api/events/stream`) now uses the same ingress-safe API URL builder.
- Static file serving is kept after API route registration so API handlers always win.
- Added `/api/debug/routes` to show the running backend version and registered API routes.
- Added JSON API 404 fallback for clearer diagnostics when a route is missing.
- Synced `dist/server.js` and `dist/index.js` so both entry files contain the same patched backend.

## Version audit

Updated version strings to `5.13.68` in:

- `config.yaml`
- `package.json`
- `run.sh`
- `build.yaml`
- `Dockerfile` and architecture Dockerfiles
- `dist/server.js`
- `dist/index.js`
- `public/app.js`
- `public/index.html`
