#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.45"
printf '%s\n' "[tf2-hub] Fast local-only main account save; hard 1500ms timeout; scheduler skips during save"
exec node /app/dist/server.js
