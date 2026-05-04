#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.55"
printf '%s\n' "[tf2-hub] Price schema memory cache + cached maintainer sync to reduce CPU spikes"
exec node /app/dist/server.js
