#!/usr/bin/env sh
set -eu
printf '%s
' "[tf2-hub] version: 5.13.36"
printf '%s
' "[tf2-hub] Backpack.tf-first cockpit; SDA handled by embedded SDA Bridge helper"
exec node /app/dist/server.js
