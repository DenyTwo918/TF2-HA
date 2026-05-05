#!/usr/bin/env sh
set -eu

echo "[tf2-hub] version: 5.13.67"
echo "[tf2-hub] Autonomous multi-account TF2 trading cockpit"
exec node /app/dist/server.js
