# TF2 Trading Hub 5.13.57 – Minimal UI + Controlled Fill One

- Added a focused **Fill 1 listing** action that publishes at most one guarded Backpack.tf listing.
- Kept **Maintain now** in safe minimal mode by default.
- Main UI is reduced to the practical controls/status; noisy panels stay in Advanced.
- Fixed `bulkApproveTop()` using the wrong variable name, which could break one-click draft preparation.
- Added `controlled_fill_one_enabled` option and schema entry.
- Synchronized active build/runtime markers to 5.13.57.
- No credential vault changes.
- No Steam trade auto-accept or confirmation changes.
- Guarded/manual safety model preserved.
