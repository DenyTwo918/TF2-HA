TF2-HA 5.13.56 v3 whitespace-safe helper

Run: push_patch_5_13_56_v3.bat

Fixes compared to v2:
- removes trailing spaces/tabs before git diff --check
- keeps Safe Minimal Maintainer patch
- uses cached provider sync instead of forced heavy sync
- bumps active markers to 5.13.56
- commits, merges origin/main with local preference, and pushes

No Node.js is required. If Node.js is missing, node --check is skipped.
