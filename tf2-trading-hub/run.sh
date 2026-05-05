#!/usr/bin/env sh
set -eu

echo "[tf2-hub] version: 5.13.62"
echo "[tf2-hub] Crash-safe Steam bot runtime"
exec node /app/dist/server.js
