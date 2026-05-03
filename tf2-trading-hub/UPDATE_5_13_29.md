# 5.13.29 – Main Account Canonical Vault Save

- Uses `/data/tf2-hub-main-account.json` as the canonical Main account vault.
- Save/status/verify now read the same canonical source.
- Masked UI placeholders are ignored and do not overwrite saved secrets.
- Save button uses a timeout/finally path so it cannot stay stuck on `Saving…`.
- Adds `/api/main-account/debug-redacted` for safe assistant diagnostics.
- Mirrors canonical values into legacy vault/options only for compatibility with older code paths.
