@echo off
setlocal
cd /d "%~dp0"
echo === TF2-HA patch 5.13.49 push helper ===
echo This will commit and push the current folder to GitHub.
echo.
where git >nul 2>nul
if errorlevel 1 (
  echo ERROR: Git is not installed or not in PATH.
  echo Use GitHub Desktop instead: open this repository folder, review changes, commit, push.
  pause
  exit /b 1
)

git status --short
echo.
set /p MSG=Commit message [Patch 5.13.49 - trade state d reference fix]: 
if "%MSG%"=="" set MSG=Patch 5.13.49 - trade state d reference fix

git add .
git commit -m "%MSG%"
if errorlevel 1 (
  echo Commit failed or nothing to commit. Continuing to push may still be okay.
)
git push
if errorlevel 1 (
  echo ERROR: git push failed. Open GitHub Desktop and push manually.
  pause
  exit /b 1
)
echo.
echo Done. Patch 5.13.49 pushed.
pause
