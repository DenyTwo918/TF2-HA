# TF2 Trading Hub 5.13.63 - Steam Login Throttle Guard

## Fixes

- Adds a throttle-safe login state for `AccountLoginDeniedThrottle`.
- Stops automatic reconnect loops after Steam temporarily blocks login attempts.
- Adds a one-hour retry guard so the add-on does not make the throttle worse.
- Adds a dashboard button to clear stored `shared_secret` and `identity_secret`.
- Prevents placeholder values such as `base64…` or `32-char hex` from being saved as real credentials.
- Keeps manual Steam Guard phone-code login available when `shared_secret` is empty.

## Why

Steam may temporarily throttle login attempts after repeated failed password/2FA attempts. Previous builds could retry too eagerly and keep the account in a throttled state. This build stops retries and shows a clear wait message in the UI.
