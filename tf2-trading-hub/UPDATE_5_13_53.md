# 5.13.53 – Minimal Bot ON/OFF

- Main production UI simplified to one Bot ON/OFF control.
- Bot defaults to OFF unless enabled via runtime state or add-on option.
- Scheduled pipeline and classifieds maintainer are skipped while Bot is OFF.
- Manual Maintainer button is removed from the main UI.
- Added /api/bot/status and /api/bot/toggle.
- Main account vault and Backpack token/API key handling are unchanged.
