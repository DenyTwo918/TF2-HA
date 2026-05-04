@echo off
setlocal
cd /d "%~dp0"
echo Checking TF2-HA patch 5.13.47...
node --check .\tf2-trading-hub\dist\server.js || (echo server.js failed.& pause& exit /b 1)
node --check .\tf2-trading-hub\dist\index.js || (echo index.js failed.& pause& exit /b 1)
node --check .\tf2-trading-hub\public\app.js || (echo public app.js failed.& pause& exit /b 1)
git status --short 2>nul || echo This extracted folder is not an active Git repo. Use push_patch_5_13_47.bat and enter your real repo path.
pause
