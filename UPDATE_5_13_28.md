# 5.13.28 – Main Account Save Verify Fix

- Verifies Main account credential save immediately after writing the vault.
- Adds `/api/credentials/save-verify`.
- Writes `/data/tf2-hub-credential-vault.last-good.json` backup when credentials are present.
- Recovers from empty vault files using options/legacy/last-good credential sources.
- UI shows `Saving…`, does not clear secret inputs until save verification succeeds, and logs `save_verified`.
- Keeps manual safety behavior: no Steam auto-accept, no Steam Guard confirmation, no automatic trade offer sending.
