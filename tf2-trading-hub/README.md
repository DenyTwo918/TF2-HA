# TF2 Trading Hub

Current build: **5.13.64 – Backpack diagnostics and pricing cockpit**.

## What changed in 5.13.64

- Adds Backpack.tf diagnostics for empty listing panels.
- Distinguishes missing token, missing SteamID64, API errors and valid empty listing responses.
- Improves parsing of Backpack.tf listing responses.
- Adds `/api/backpack/diagnostics`.
- Adds richer price schema feedback and `/api/prices/lookup`.
- Keeps the Steam login, reliable disconnect and inventory multi-source sync fixes from previous builds.

## Home Assistant

The add-on supports both Home Assistant Ingress and an optional direct Web UI port on `8099`.
