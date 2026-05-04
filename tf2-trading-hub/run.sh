#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.46"
printf '%s\n' "[tf2-hub] Maintainer crash isolation + fast status API"
exec node /app/dist/server.js
