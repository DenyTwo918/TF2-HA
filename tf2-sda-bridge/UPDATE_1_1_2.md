# TF2 SDA Bridge 1.1.3 — Diagnostics Hotfix

Fixes the unreadable `[object Object]` UI/API error.

## Changes

- Error responses are now always converted to readable text.
- Secrets remain redacted in diagnostics and audit output.
- Added `GET /api/diagnostics`.
- Status UI now shows missing setup items and the next recommended step.
- `Load confirmations` now returns a clear `stage` such as `session_missing`, `steam_returned_html`, or `fetch_confirmations_exception`.
- Confirmation fetching errors are handled inside the endpoint instead of crashing into a generic 500 response.

## Safety

The helper still only allows trade confirmations. Login/account/market/unknown confirmations are left untouched and can expire naturally.
