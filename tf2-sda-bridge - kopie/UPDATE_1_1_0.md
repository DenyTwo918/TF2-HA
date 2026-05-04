# 1.1.1 – Embedded maFile SDA Helper

This release changes TF2 SDA Bridge from an external SDA proxy into a self-contained Home Assistant add-on helper.

- No external SDA HTTP service is required.
- Upload or paste a decrypted SDA-compatible maFile directly in the add-on UI.
- Generate Steam Guard codes locally from shared_secret.
- Fetch Steam mobile confirmations directly from Steam using identity_secret and the stored Steam session.
- Allow/deny confirmations only when `allow_confirmations` is explicitly enabled.
- Secrets are never returned in API responses and are redacted from audit logs.
