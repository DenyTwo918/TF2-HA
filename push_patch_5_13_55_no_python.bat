@echo off
setlocal
echo === TF2-HA patch 5.13.55 push helper ===
echo This commits and pushes the already-patched files. No Python/Node required.
echo.
where git >nul 2>nul
if errorlevel 1 (
  echo ERROR: Git is not installed or not in PATH.
  pause
  exit /b 1
)
git status --short
echo.
echo About to commit patch 5.13.55.
choice /C YN /M "Continue"
if errorlevel 2 exit /b 0
git add repository.yaml README.md tf2-trading-hub push_patch_5_13_55_no_python.bat
git commit -m "5.13.55 - cache Backpack price schema to reduce maintainer CPU spikes"
if errorlevel 1 (
  echo Commit failed or nothing to commit.
)
git push
if errorlevel 1 (
  echo Push failed. Check GitHub login/remote access.
  pause
  exit /b 1
)
echo.
echo Done. Now refresh the Home Assistant add-on store and update/rebuild TF2 Trading Hub.
pause
