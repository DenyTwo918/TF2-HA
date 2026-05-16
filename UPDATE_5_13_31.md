# TF2 Trading Hub 5.13.33 – Main Account Direct Save Fix

- Added `GET /api/main-account/status` as a compact redacted Main account readiness endpoint.
- Added `POST /api/main-account/save` so the UI no longer depends on the older multi-account credential save path.
- Fixed Home Assistant ingress URL handling when the ingress URL has no trailing slash.
- Fixed credential status JSON so `account_status` no longer renders as `[circular]`.
- Updated Main account save flow to verify the canonical vault immediately after saving.
- Updated version markers, Docker build args, run log, frontend banner, and Backpack.tf user agent to 5.13.33.

Safety: this patch does not enable live trade accepts, SDA confirmations, or automatic Steam actions.
