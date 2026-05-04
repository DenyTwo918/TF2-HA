#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.52"
printf '%s\n' "[tf2-hub] Disable auto maintainer by default + UI version sync"
exec node /app/dist/server.js
