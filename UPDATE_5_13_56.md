# Update 5.13.56 - Safe Minimal Maintainer after provider sync

- Added Safe Minimal Maintainer mode.
- Maintain now completes safely after provider sync by default.
- Legacy post-sync maintainer steps are skipped unless explicitly re-enabled.
- Added runtime events:
  - maintainer_minimal_mode_enabled
  - maintainer_legacy_steps_skipped
  - maintainer_minimal_completed
- Provider sync now prefers cached mode instead of forcing a heavy price reload.
- Credentials, Backpack token handling and trading safety defaults were not changed.