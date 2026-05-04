@echo off
setlocal

echo === TF2-HA patch 5.13.53 push helper ===
echo This commits and pushes the patched files using your existing GitHub Desktop login.
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo ERROR: Git is not installed or not in PATH.
  echo Open GitHub Desktop, add this folder as repository, then commit/push from there.
  pause
  exit /b 1
)

git status >nul 2>nul
if errorlevel 1 (
  echo ERROR: This folder is not a Git repository.
  echo Put/extract these files into your TF2-HA repo folder, then run this BAT again.
  pause
  exit /b 1
)

echo Current repo:
git rev-parse --show-toplevel

echo.
echo Adding files...
git add repository.yaml README.md PATCH_5.13.53_REPORT.json tf2-trading-hub

echo.
echo Committing...
git commit -m "Patch 5.13.53 minimal bot on-off UI" 
if errorlevel 1 (
  echo.
  echo Nothing to commit or commit failed. Showing status:
  git status --short
  echo.
)

echo.
echo Pushing to GitHub...
git push
if errorlevel 1 (
  echo.
  echo Push failed. If GitHub Desktop is logged in, open it and click Push origin manually.
  pause
  exit /b 1
)

echo.
echo Done. Patch 5.13.53 pushed.
pause
