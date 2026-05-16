# TF2 Trading Hub 5.13.33 – Main Account Save Trace

- Adds redacted stage-by-stage logging for `POST /api/main-account/save`.
- Adds `GET /api/main-account/save-trace` and a **Save trace** button in the Logs card.
- Makes Main account save return after the canonical vault write + verification; compatibility mirroring, cache invalidation and portfolio sync now run deferred after the response.
- Adds body-read timeout diagnostics so a hanging HA ingress/body request returns a useful trace instead of only a frontend timeout.
- Detects masked placeholder bullets and returns a clear validation message instead of silently treating them as real credentials.

No live trade execution settings are enabled by this patch.
