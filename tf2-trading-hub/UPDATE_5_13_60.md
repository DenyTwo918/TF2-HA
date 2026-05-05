# TF2 Trading Hub 5.13.60 — Flashy HA-connected cockpit UI

This patch upgrades the add-on presentation layer while keeping the Home Assistant integration intact.

## Highlights

- Keeps Home Assistant Ingress as the primary add-on UI.
- Adds optional direct Web UI access on port `8099` via `webui` and `ports` config.
- Replaces the simple panel with a modern cockpit layout:
  - sidebar navigation,
  - animated hero/status area,
  - runtime health bars,
  - improved metric cards,
  - premium trade offer cards,
  - upgraded listings/inventory panels,
  - polished live event stream.
- Maintains compatibility with the existing crash-safe Express backend and Steam bot endpoints.
- Bumps all HA-visible version markers to `5.13.60` so Home Assistant can detect the update.

## Safety

The UI upgrade does not change the guarded/manual safety model. Trade actions still require explicit dashboard actions unless future live automation options are enabled intentionally.
