@echo off
setlocal EnableExtensions

echo === TF2-HA 5.13.56 v3 whitespace-safe patch helper ===
echo This patches Safe Minimal Maintainer, validates, commits, merges origin/main and pushes.
echo.

set "REPO=%~1"
if "%REPO%"=="" (
  if exist "%CD%\tf2-trading-hub\dist\server.js" set "REPO=%CD%"
)
if "%REPO%"=="" (
  if exist "%USERPROFILE%\Desktop\TF2 HA\.claude\worktrees\happy-hugle-6896f7\tf2-trading-hub\dist\server.js" set "REPO=%USERPROFILE%\Desktop\TF2 HA\.claude\worktrees\happy-hugle-6896f7"
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apply_patch_5_13_56_v3.ps1" -RepoRoot "%REPO%"
set ERR=%ERRORLEVEL%
if not "%ERR%"=="0" (
  echo.
  echo ERROR. Patch helper failed with code %ERR%.
  pause
  exit /b %ERR%
)

echo.
echo SUCCESS. Patch helper finished.
pause
