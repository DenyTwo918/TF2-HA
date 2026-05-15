#!/usr/bin/with-contenv bashio
set -euo pipefail

echo "[tf2-hub] version: 5.14.0"
echo "[tf2-hub] Autonomous multi-account Backpack pipeline runtime"
exec node /app/dist/server.js
