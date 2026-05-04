#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.44"
printf '%s\n' "[tf2-hub] Main account no-wipe guard + crash trace active"
exec node /app/dist/server.js
