# TF2 Trading Hub 5.13.63 - Manual Steam Guard Pre-login Fix

This patch fixes the mobile Steam Guard flow for accounts that do not use `shared_secret`.

## Fixed

- Manual Steam Guard code is now collected before starting Steam login when no `shared_secret` is saved.
- The UI no longer expects a Steam push notification. It tells the operator to open the Steam app and copy the current Steam Guard code manually.
- Added missing throttle helper functions used by the Steam client error handler.
- Keeps reconnect loops stopped when Steam returns login throttle errors.
- Clarifies placeholders for optional `shared_secret` and `identity_secret` fields.

## How to use

1. Leave `shared_secret` empty if you only use the mobile Steam app.
2. Save credentials.
3. Click Connect.
4. Open Steam mobile app → Steam Guard → show/copy current code.
5. Enter the code in the Steam Guard card.
