@echo off
setlocal
cd /d "%~dp0"
echo === TF2-HA full patch 5.13.48 push helper ===
echo This commits and pushes the already patched full repo to GitHub.
echo.
where git >nul 2>nul
if errorlevel 1 (
  echo ERROR: Git is not installed or not in PATH.
  echo Use GitHub Desktop to commit and push this folder manually.
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo WARNING: Node.js is not in PATH, skipping node --check.
) else (
  node --check tf2-trading-hub\dist\server.js || goto :fail
  node --check tf2-trading-hub\dist\index.js || goto :fail
)
git status --short
git add tf2-trading-hub repository.yaml README.md .clinerules.txt push_patch_5_13_48.bat
git commit -m "TF2 Trading Hub 5.13.48 hard timeout and draining lock fix"
if errorlevel 1 echo Commit may have nothing to commit, continuing to push...
git push
if errorlevel 1 goto :fail
echo.
echo DONE. Patch 5.13.48 pushed.
pause
exit /b 0
:fail
echo.
echo ERROR: Push helper failed. Open GitHub Desktop and commit/push manually.
pause
exit /b 1
