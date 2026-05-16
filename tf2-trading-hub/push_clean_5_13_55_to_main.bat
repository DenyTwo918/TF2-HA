@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

echo === TF2-HA 5.13.55 clean push to GitHub main ===
echo This closes the PR-conflict problem by cloning fresh main, copying this clean patch, committing, and pushing main.
echo.

set "REPO_URL=https://github.com/DenyTwo918/TF2-HA.git"
set "WORK=%TEMP%\TF2-HA-clean-main-5_13_55"
set "PATCHROOT=%~dp0"
set "COMMIT_MSG=5.13.55 - price schema cache and clean HA repository files"

where git >nul 2>nul
if errorlevel 1 (
  echo ERROR: Git is not installed or not in PATH.
  echo Install Git for Windows, then run this BAT again.
  pause
  exit /b 1
)

if exist "%WORK%" rd /s /q "%WORK%"
mkdir "%WORK%" || exit /b 1

echo Cloning fresh main...
git clone "%REPO_URL%" "%WORK%\repo"
if errorlevel 1 (
  echo ERROR: git clone failed. Check internet/GitHub login.
  pause
  exit /b 1
)

cd /d "%WORK%\repo" || exit /b 1
git checkout main || exit /b 1
git pull --ff-only origin main || exit /b 1

echo Copying clean patch files...
copy /Y "%PATCHROOT%README.md" "%WORK%\repo\README.md" >nul
copy /Y "%PATCHROOT%repository.yaml" "%WORK%\repo\repository.yaml" >nul
if exist "%PATCHROOT%.gitattributes" copy /Y "%PATCHROOT%.gitattributes" "%WORK%\repo\.gitattributes" >nul
if exist "%PATCHROOT%.gitignore" copy /Y "%PATCHROOT%.gitignore" "%WORK%\repo\.gitignore" >nul

robocopy "%PATCHROOT%tf2-trading-hub" "%WORK%\repo\tf2-trading-hub" /MIR /XD .git node_modules __pycache__ /XF *.tmp >nul
if errorlevel 8 (
  echo ERROR: robocopy failed for tf2-trading-hub.
  pause
  exit /b 1
)

if exist "%PATCHROOT%tf2-sda-bridge" (
  robocopy "%PATCHROOT%tf2-sda-bridge" "%WORK%\repo\tf2-sda-bridge" /MIR /XD .git node_modules __pycache__ /XF *.tmp >nul
  if errorlevel 8 (
    echo ERROR: robocopy failed for tf2-sda-bridge.
    pause
    exit /b 1
  )
)

echo Checking versions...
findstr /S /I /C:"5.13.55" tf2-trading-hub\config.yaml tf2-trading-hub\package.json tf2-trading-hub\run.sh tf2-trading-hub\Dockerfile tf2-trading-hub\build.yaml >nul
if errorlevel 1 (
  echo WARNING: Could not verify 5.13.55 in one or more marker files.
)

echo Staging and committing...
git add README.md repository.yaml .gitattributes .gitignore tf2-trading-hub tf2-sda-bridge

git diff --cached --quiet
if not errorlevel 1 (
  echo No changes to commit. Main may already contain this patch.
  pause
  exit /b 0
)

git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
  echo ERROR: git commit failed.
  pause
  exit /b 1
)

echo Pushing directly to main...
git push origin main
if errorlevel 1 (
  echo.
  echo ERROR: git push failed. If GitHub asks for login, open GitHub Desktop once or sign in with Git Credential Manager.
  echo You can also push manually from: %WORK%\repo
  pause
  exit /b 1
)

echo.
echo DONE. Patch 5.13.55 was pushed to main.
echo Now in Home Assistant: Add-on Store ^> three dots ^> Check for updates, then rebuild/restart TF2 Trading Hub.
echo You can close PR #13; it is obsolete.
pause
