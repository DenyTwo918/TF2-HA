# 5.13.49 – Trade State d Reference Fix

Fixes the scheduled pipeline crash `d is not defined` after provider sync, inventory sync and market scanner complete.

Changes:
- fixes sell draft state mapping in the trade offer state machine (`draft` variable was incorrectly referenced as `d`)
- preserves 5.13.48 operation single-flight behavior
- preserves main account vault logic
- preserves Backpack.tf access token/API key handling
- preserves guarded/manual trading safety defaults

Acceptance:
- scheduled pipeline should continue past trade review into trading core/brain/actionable plan
- no `hub_autopilot_pipeline_failed` with `d is not defined`
- `/api/status` and `/api/publish-wizard/status` remain fast
- main account survives restart
