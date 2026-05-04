#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.41"
printf '%s\n' "[tf2-hub] Backpack.tf API key / price schema fix active"
exec node /app/dist/server.js
