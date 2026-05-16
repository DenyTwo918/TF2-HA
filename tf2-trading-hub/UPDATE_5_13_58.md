# Update 5.13.58 - Repair HA Visibility + Addon Type Fix

- Fresh version bump so HA Supervisor detects the update after repository cache issues from manual config.yaml edits.
- Fixed io.hass.type from "app" to "addon" in all arch-specific Dockerfiles (amd64, aarch64, armv7, armhf, i386).
- Updated Dockerfile descriptions to match config.yaml description.
- All safety defaults remain guarded/manual: no live trade accepts, no Steam confirmations, no automatic publishing.
