#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-sda-bridge] version: 1.1.3"
printf '%s\n' "[tf2-sda-bridge] embedded maFile SDA helper; no external SDA service required"
exec node /app/dist/server.js
