# 5.13.48 – True Maintainer Hard Timeout + Cooperative Abort

- Replaces heavy maintainer startup status rebuild with a lightweight running marker so the 90s timeout timer can fire on time.
- Adds cooperative abort/yield checks before provider sync, auto-sell, manual-owned sell, queue refill, draft approval and each guarded publish attempt.
- Adds draining provider-sync state after timeout so workflow/scheduler do not start a new heavy operation while the old provider request is still finishing.
- Keeps credential vault logic, Backpack access token/API key handling and guarded/manual safety defaults unchanged.
