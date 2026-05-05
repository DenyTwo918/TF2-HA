# TF2 Trading Hub 5.13.61 - Manual Steam Guard Code

## What changed

- Added manual Steam Guard code flow for accounts that use the mobile Steam app instead of `shared_secret`.
- When Steam requests 2FA and no `shared_secret` is saved, the dashboard now shows a Steam Guard card.
- You can enter the current code from the phone app directly in Home Assistant Ingress.
- Added `/api/steamguard/status`, `/api/steamguard/code`, and `/api/steamguard/cancel`.
- Kept `shared_secret` support for fully automated bot accounts.
- Backpack.tf token remains hidden as a password input.

## Safety note

Manual Steam Guard is safer for a main/testing account because the addon does not need to store the long-term `shared_secret` just to log in. `identity_secret` is still only needed for automatic trade confirmations.
