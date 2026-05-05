#!/usr/bin/with-contenv bashio
set -euo pipefail

echo "[tf2-hub] version: 5.13.68"
echo "[tf2-hub] Autonomous multi-account Backpack pipeline runtime"
exec node /app/dist/server.js
