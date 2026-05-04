#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.50"
printf '%s\n' "[tf2-hub] Hard operation watchdog + stale lock release + elapsed fix"
exec node /app/dist/server.js
