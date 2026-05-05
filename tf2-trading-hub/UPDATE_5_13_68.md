# TF2 Trading Hub 5.13.68

Ingress API routing hotfix for the autonomous multi-account cockpit.

## Fixed

- The frontend no longer calls absolute `/api/...` URLs that resolve against the Home Assistant host root when loaded through Ingress.
- API calls now resolve relative to the current Ingress base path, while still working on the optional direct Web UI port `8099`.
- Server-Sent Events now use the same Ingress-aware API base.
- This fixes the browser alert `HTTP 404` shown from Home Assistant `:8123` after opening the cockpit or pressing cockpit actions.

## Compatibility

- Home Assistant Ingress remains enabled.
- Optional direct Web UI port remains supported.
- Existing multi-account endpoints and old single-account compatibility endpoints are unchanged.
