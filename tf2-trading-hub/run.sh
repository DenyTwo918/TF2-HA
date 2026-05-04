#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.43"
printf '%s\n' "[tf2-hub] Main account restart persistence guard active"
exec node /app/dist/server.js
