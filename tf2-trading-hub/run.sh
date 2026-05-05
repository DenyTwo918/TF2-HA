#!/usr/bin/env sh
set -eu

echo "[tf2-hub] version: 5.13.58"
echo "[tf2-hub] Minimal UI + Controlled Fill One"
exec node /app/dist/server.js
