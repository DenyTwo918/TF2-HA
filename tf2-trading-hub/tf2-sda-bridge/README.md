# TF2 SDA Bridge

Small local Home Assistant side add-on for TF2 Trading Hub.

It is an embedded maFile-based Steam Guard helper. It runs inside Home Assistant, stores a decrypted SDA-compatible maFile in its own `/data` folder, generates Steam Guard codes locally, and can fetch Steam mobile confirmations directly from Steam.

It does **not** require an external SDA HTTP server on another PC.

Safe default: `allow_confirmations: false`. In that mode the helper can show codes and load confirmations, but it will not allow/deny confirmations until you explicitly enable it in add-on options.


## 1.1.1 safety policy

TF2 SDA Bridge is intentionally conservative. It may allow only Steam mobile confirmations that are identified as TF2 trade-offer confirmations. Login/account, market/listing, and unknown confirmations are not approved and are not denied automatically. They stay pending on Steam and expire naturally unless the user handles them in the official Steam client/SDA.


## 1.1.3 diagnostics hotfix

The bridge now reports readable errors instead of `[object Object]` and exposes `/api/diagnostics` for setup troubleshooting.
