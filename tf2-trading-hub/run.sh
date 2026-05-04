#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.53"
printf '%s\n' "[tf2-hub] Repair HA repository visibility + simplified maintainer control"
exec node /app/dist/server.js
