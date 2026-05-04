@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

echo === TF2-HA 5.13.55 clean push to NEW GitHub branch ===
echo This avoids PR #13 conflicts by cloning fresh main and creating a new branch.
echo.

set "REPO_URL=https://github.com/DenyTwo918/TF2-HA.git"
set "BRANCH=patch-5.13.55-clean"
set "WORK=%TEMP%\TF2-HA-clean-branch-5_13_55"
set "PATCHROOT=%~dp0"
set "COMMIT_MSG=5.13.55 - price schema cache and clean HA repository files"

where git >nul 2>nul
if errorlevel 1 (
  echo ERROR: Git is not installed or not in PATH.
  pause
  exit /b 1
)

if exist "%WORK%" rd /s /q "%WORK%"
mkdir "%WORK%" || exit /b 1

git clone "%REPO_URL%" "%WORK%\repo" || (pause & exit /b 1)
cd /d "%WORK%\repo" || exit /b 1
git checkout main || exit /b 1
git pull --ff-only origin main || exit /b 1
git checkout -b "%BRANCH%" || exit /b 1

copy /Y "%PATCHROOT%README.md" "%WORK%\repo\README.md" >nul
copy /Y "%PATCHROOT%repository.yaml" "%WORK%\repo\repository.yaml" >nul
if exist "%PATCHROOT%.gitattributes" copy /Y "%PATCHROOT%.gitattributes" "%WORK%\repo\.gitattributes" >nul
if exist "%PATCHROOT%.gitignore" copy /Y "%PATCHROOT%.gitignore" "%WORK%\repo\.gitignore" >nul
robocopy "%PATCHROOT%tf2-trading-hub" "%WORK%\repo\tf2-trading-hub" /MIR /XD .git node_modules __pycache__ /XF *.tmp >nul
if errorlevel 8 (echo ERROR: robocopy failed & pause & exit /b 1)
if exist "%PATCHROOT%tf2-sda-bridge" robocopy "%PATCHROOT%tf2-sda-bridge" "%WORK%\repo\tf2-sda-bridge" /MIR /XD .git node_modules __pycache__ /XF *.tmp >nul
if errorlevel 8 (echo ERROR: robocopy failed & pause & exit /b 1)

git add README.md repository.yaml .gitattributes .gitignore tf2-trading-hub tf2-sda-bridge
git diff --cached --quiet
if not errorlevel 1 (
  echo No changes to commit. Main may already contain this patch.
  pause
  exit /b 0
)
git commit -m "%COMMIT_MSG%" || (pause & exit /b 1)
git push -u origin "%BRANCH%" || (pause & exit /b 1)

echo.
echo DONE. Open this URL and create the new PR:
echo https://github.com/DenyTwo918/TF2-HA/compare/main...%BRANCH%?expand=1
echo PR #13 can be closed.
pause
