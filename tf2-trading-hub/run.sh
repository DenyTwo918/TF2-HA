#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.47"
printf '%s\n' "[tf2-hub] Operation single-flight lock + maintainer queue fix"
exec node /app/dist/server.js
