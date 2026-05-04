#!/usr/bin/env sh
set -eu
printf '%s\n' "[tf2-hub] version: 5.13.54"
printf '%s\n' "[tf2-hub] Fix event-loop block crash after provider sync (Maintain now SIGKILL)"
exec node /app/dist/server.js
