#!/usr/bin/with-contenv bashio
set -uo pipefail

echo "[tf2-hub] v1.7.0 starting"
echo "[tf2-hub] node: $(node --version 2>&1)"
exec node /app/server.js 2>&1
