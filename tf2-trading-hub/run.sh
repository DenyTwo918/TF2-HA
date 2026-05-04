#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.53"
printf '%s\n' "[tf2-hub] Minimal Bot ON/OFF dashboard + maintainer quarantine"
exec node /app/dist/server.js
