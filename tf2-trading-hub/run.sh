#!/usr/bin/env sh
set -eu

echo "[tf2-hub] version: 5.13.60"
echo "[tf2-hub] Flashy HA-connected cockpit runtime"
exec node /app/dist/server.js
