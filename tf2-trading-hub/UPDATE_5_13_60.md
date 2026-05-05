# TF2 Trading Hub 5.13.60 — HA Ingress API and secret-field fix

This patch fixes the credential-save 404 shown inside Home Assistant Ingress.

## Fixed

- Frontend API calls are now Home Assistant Ingress-aware.
- `EventSource` live log stream also uses the correct ingress base path.
- Steam Web API key, Backpack.tf token, shared secret and identity secret fields are rendered as password inputs.
- Bumped all HA-visible version markers to `5.13.60`.

## Notes

If API keys or tokens were visible in a screenshot or chat, rotate/revoke them before using the addon again.
