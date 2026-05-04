#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.49"
printf '%s\n' "[tf2-hub] Trade state d-reference fix + single-flight retained"
exec node /app/dist/server.js
