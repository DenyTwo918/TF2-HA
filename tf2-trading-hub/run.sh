#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.51"
printf '%s\n' "[tf2-hub] Maintainer hard isolation + no event loop block + independent watchdog"
exec node /app/dist/server.js
